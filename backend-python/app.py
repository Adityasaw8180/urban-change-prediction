from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import cv2
import numpy as np
import os
from model import get_model

app = FastAPI(title="Future Urbanization Prediction API")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

model = get_model()

def preprocess(img1: Image.Image, img2: Image.Image):
    size = (512, 512)
    arr1 = np.array(img1.resize(size))
    arr2 = np.array(img2.resize(size))
    combined = np.concatenate([arr1, arr2], axis=2).astype(np.float32) / 255.0
    tensor = torch.from_numpy(combined).permute(2, 0, 1).unsqueeze(0)
    return tensor

@app.post("/predict")
async def predict_future(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    img1 = Image.open(file1.file).convert("RGB")
    img2 = Image.open(file2.file).convert("RGB")
    
    tensor = preprocess(img1, img2)
    
    with torch.no_grad():
        pred = model(tensor)[0].squeeze().cpu().numpy()
    
    # Create nice heatmap
    pred = (pred * 255).astype(np.uint8)
    heatmap = cv2.applyColorMap(pred, cv2.COLORMAP_JET)
    
    os.makedirs("outputs", exist_ok=True)
    path = "outputs/future_urban_growth.png"
    cv2.imwrite(path, heatmap)
    
    return FileResponse(path, media_type="image/png", filename="future_urban_growth.png")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)