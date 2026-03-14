import numpy as np
from sklearn.linear_model import LinearRegression
import joblib

# Sample historical urban growth data
years = np.array([2015, 2017, 2019, 2021, 2024]).reshape(-1, 1)
urban = np.array([39.5, 43.2, 47.8, 51.0, 54.5])

model = LinearRegression()
model.fit(years, urban)

joblib.dump(model, 'urban_model.pkl')
print("Simple urban growth model trained and saved as urban_model.pkl!")