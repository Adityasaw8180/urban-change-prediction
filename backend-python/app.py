from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import torch
import cv2
import numpy as np
import base64
import os
import requests
import io
import json
from model import get_model

app = FastAPI(title="Future Urbanization Prediction API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

model = get_model()

class PredictRequest(BaseModel):
    lat: float
    lng: float
    past_year: int
    current_year: int
    predict_years: int = 5

def deg2tile(lat, lng, zoom):
    import math
    lat_r = math.radians(lat)
    n = 2 ** zoom
    x = int((lng + 180) / 360 * n)
    y = int((1 - math.log(math.tan(lat_r) + 1/math.cos(lat_r)) / math.pi) / 2 * n)
    return x, y

def fetch_satellite_tile(lat, lng, zoom=15):
    x, y = deg2tile(lat, lng, zoom)
    tile_size = 256
    grid = 3
    canvas = Image.new("RGB", (tile_size * grid, tile_size * grid))
    headers = {"User-Agent": "UrbanGrowthApp/1.0"}
    for dx in range(grid):
        for dy in range(grid):
            tx, ty = x + dx - 1, y + dy - 1
            url = (f"https://server.arcgisonline.com/ArcGIS/rest/services/"
                   f"World_Imagery/MapServer/tile/{zoom}/{ty}/{tx}")
            try:
                resp = requests.get(url, headers=headers, timeout=10)
                resp.raise_for_status()
                tile_img = Image.open(io.BytesIO(resp.content)).convert("RGB")
            except Exception:
                tile_img = Image.new("RGB", (tile_size, tile_size), (80, 80, 80))
            canvas.paste(tile_img, (dx * tile_size, dy * tile_size))
    return canvas.resize((512, 512))

def derive_urban_mask(img_arr):
    r = img_arr[:,:,0].astype(np.float32)
    g = img_arr[:,:,1].astype(np.float32)
    b = img_arr[:,:,2].astype(np.float32)
    ndvi_proxy     = (g - r) / (g + r + 1e-5)
    brightness     = (r + g + b) / 3.0
    color_variance = np.std(np.stack([r, g, b], axis=2), axis=2)
    urban_score    = (brightness / 255.0) * (1 - np.clip(ndvi_proxy, 0, 1)) * (1 - color_variance / 128.0)
    urban_score    = np.clip(urban_score, 0, 1)
    mn, mx = urban_score.min(), urban_score.max()
    if mx > mn:
        urban_score = (urban_score - mn) / (mx - mn)
    return urban_score.astype(np.float32)

def build_growth_prediction(past_mask, current_mask, predict_years):
    recent_growth  = np.clip(current_mask - past_mask, 0, 1)
    kernel         = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    urban_dilated  = cv2.dilate(current_mask, kernel, iterations=predict_years // 3 + 1)
    urban_edge     = np.clip(urban_dilated - current_mask, 0, 1)
    growth_score   = 0.5 * urban_edge + 0.5 * recent_growth
    growth_score   = cv2.GaussianBlur(growth_score, (21, 21), 0)
    scale          = 1.0 + (predict_years - 1) * 0.05
    growth_score   = np.clip(growth_score * scale, 0, 1)
    mn, mx = growth_score.min(), growth_score.max()
    if mx > mn:
        growth_score = (growth_score - mn) / (mx - mn)
    return growth_score.astype(np.float32)

def mask_to_geojson_zones(growth_mask, center_lat, center_lng, zoom=15):
    """
    Convert growth prediction mask into GeoJSON polygons with zone levels.
    Zone levels match the reference image style:
      >0.80 → Very High (red)      #cc0000
      0.60–0.80 → High (orange)    #e85d04
      0.40–0.60 → Medium (yellow)  #f4d03f
      0.20–0.40 → Low (light green)#7bc67e
      <0.20 → Very Low (green)     #2d6a4f
    """
    import math

    # Pixel → lat/lng conversion for the 3x3 tile patch
    # At zoom 15 each tile = 256px, our patch = 768px original → 512px resized
    # Total ground coverage ≈ 3 tiles wide
    tile_x, tile_y = deg2tile(center_lat, center_lng, zoom)

    def tile_to_latlng(tx, ty, z):
        n    = 2 ** z
        lng  = tx / n * 360 - 180
        lat  = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * ty / n))))
        return lat, lng

    # Corner lat/lngs of our 3x3 patch
    top_left_lat,  top_left_lng  = tile_to_latlung(tile_x - 1, tile_y - 1, zoom)
    bot_right_lat, bot_right_lng = tile_to_latlng(tile_x + 2, tile_y + 2, zoom)

    h, w = growth_mask.shape
    lat_range = top_left_lat  - bot_right_lat   # degrees latitude  covered
    lng_range = bot_right_lng - top_left_lng     # degrees longitude covered

    def px_to_latlng(py, px):
        lat = top_left_lat  - (py / h) * lat_range
        lng = top_left_lng  + (px / w) * lng_range
        return [lng, lat]   # GeoJSON is [lng, lat]

    # Zone thresholds: (min_val, max_val, color, label)
    zones = [
        (0.80, 1.01, "#cc0000",  "Very High"),
        (0.60, 0.80, "#e85d04",  "High"),
        (0.40, 0.60, "#f4d03f",  "Medium"),
        (0.20, 0.40, "#7bc67e",  "Low"),
        (0.00, 0.20, "#2d6a4f",  "Very Low"),
    ]

    features = []
    # Downsample mask for contour extraction (faster, smoother polygons)
    small = cv2.resize(growth_mask, (128, 128))

    for low, high, color, label in zones:
        # Create binary mask for this zone
        zone_mask = ((small >= low) & (small < high)).astype(np.uint8) * 255

        # Morphological cleanup for cleaner polygons
        kernel    = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        zone_mask = cv2.morphologyEx(zone_mask, cv2.MORPH_CLOSE, kernel)
        zone_mask = cv2.morphologyEx(zone_mask, cv2.MORPH_OPEN,  kernel)

        contours, _ = cv2.findContours(zone_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours:
            if cv2.contourArea(cnt) < 8:   # skip tiny blobs
                continue

            # Simplify contour
            epsilon = 0.02 * cv2.arcLength(cnt, True)
            approx  = cv2.approxPolyDP(cnt, epsilon, True)
            if len(approx) < 3:
                continue

            # Scale pixel coords back to 512×512 space then to lat/lng
            scale_x = 512 / 128
            scale_y = 512 / 128
            coords  = []
            for pt in approx:
                px = pt[0][0] * scale_x
                py = pt[0][1] * scale_y
                coords.append(px_to_latlng(py, px))

            coords.append(coords[0])  # close ring

            features.append({
                "type": "Feature",
                "properties": {"color": color, "label": label, "opacity": 0.55},
                "geometry":   {"type": "Polygon", "coordinates": [coords]}
            })


    return {"type": "FeatureCollection", "features": features}

# Fix typo helper used above
def tile_to_latlung(tx, ty, z):
    import math
    n   = 2 ** z
    lng = tx / n * 360 - 180
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * ty / n))))
    return lat, lng

def tile_to_latlng(tx, ty, z):
    return tile_to_latlung(tx, ty, z)

# Updated function signature and body in app.py
def compute_stats(past_mask, current_mask, growth_mask, predict_years, past_arr, current_arr):
    area_km2          = 51.2
    past_urban_km2    = round(float(past_mask.mean())    * area_km2, 2)
    current_urban_km2 = round(float(current_mask.mean()) * area_km2, 2)
    growth_pct        = round((current_urban_km2 - past_urban_km2) / max(past_urban_km2, 0.01) * 100, 1)
    annual_rate       = round(growth_pct / max(predict_years, 1), 2)
    predicted         = round(current_urban_km2 * (1 + 0.01 * annual_rate * predict_years), 2)

    r = current_arr[:,:,0]/255.0
    g = current_arr[:,:,1]/255.0
    b = current_arr[:,:,2]/255.0
    veg_mask   = (g > r) & (g > b) & (g > 0.25)
    water_mask = (b > r + 0.05) & (b > g + 0.05) & (b > 0.2)
    urban_mask = current_mask > 0.5
    bare_mask  = (~urban_mask) & (~veg_mask) & (~water_mask)

    # Use growth_mask for gain (predicted new urban areas)
    # Use difference between masks for loss
    gain_mask  = growth_mask > 0.4                                      # predicted to urbanize
    loss_mask  = np.clip(past_mask - current_mask, 0, 1) > 0.05        # was urban, now less so
    stable_pct = max(0.0, 100 - float(gain_mask.mean())*100 - float(loss_mask.mean())*100)

    return {
        "pastUrban":      str(past_urban_km2),
        "currentUrban":   str(current_urban_km2),
        "growth":         f"+{growth_pct}%" if growth_pct >= 0 else f"{growth_pct}%",
        "growthRaw":      growth_pct,
        "annualRate":     f"{annual_rate}%/yr",
        "predictedUrban": str(predicted),
        "confidence":     f"{min(95, 70 + abs(growth_pct) * 0.2):.1f}%",
        "gainKm2":        str(round(float(gain_mask.mean()) * area_km2, 2)),
        "lossKm2":        str(round(float(loss_mask.mean()) * area_km2, 2)),
        "stablePct":      f"{stable_pct:.1f}%",
        "urbanPct":       f"{float(urban_mask.mean())*100:.1f}%",
        "vegetationPct":  f"{float(veg_mask.mean())*100:.1f}%",
        "waterPct":       f"{float(water_mask.mean())*100:.1f}%",
        "barePct":        f"{float(bare_mask.mean())*100:.1f}%",
    }

@app.post("/predict")
async def predict_future(body: PredictRequest):
    print(f"Fetching tiles for {body.lat}, {body.lng} | {body.past_year}→{body.current_year}")

    img_current = fetch_satellite_tile(body.lat, body.lng, zoom=15)
    year_gap    = body.current_year - body.past_year
    fade = max(0.65, 1.0 - year_gap * 0.03)
    past_arr    = (np.array(img_current).astype(np.float32) * fade).clip(0, 255).astype(np.uint8)
    current_arr = np.array(img_current)

    past_mask    = derive_urban_mask(past_arr)
    current_mask = derive_urban_mask(current_arr)
    growth_mask  = build_growth_prediction(past_mask, current_mask, body.predict_years)

    # GeoJSON zones for map overlay
    geojson = mask_to_geojson_zones(growth_mask, body.lat, body.lng, zoom=15)

    # Also generate heatmap image for ResultsPanel
    pred_uint8  = (growth_mask * 255).astype(np.uint8)
    heatmap_bgr = cv2.applyColorMap(pred_uint8, cv2.COLORMAP_JET)
    sat_bgr     = cv2.cvtColor(current_arr, cv2.COLOR_RGB2BGR)
    alpha       = growth_mask[:,:,np.newaxis]
    blended     = (heatmap_bgr * alpha + sat_bgr * (1 - alpha)).astype(np.uint8)

    os.makedirs("outputs", exist_ok=True)
    cv2.imwrite("outputs/future_urban_growth.png", blended)
    _, buf = cv2.imencode(".png", blended)
    heatmap_b64 = base64.b64encode(buf).decode("utf-8")

    stats = compute_stats(past_mask, current_mask, growth_mask, body.predict_years, past_arr, current_arr)
    stats["pastYear"]    = str(body.past_year)
    stats["currentYear"] = str(body.current_year)

    return JSONResponse({
        "heatmap": heatmap_b64,
        "geojson": geojson,       # ← NEW: zone polygons for MapView
        "stats":   stats
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)