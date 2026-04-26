# Urban Change Prediction

A full-stack application that leverages satellite imagery and machine learning to predict and visualize urban expansion and growth.

## 🚀 Project Overview
This project is divided into three main components:
1.  **Frontend**: A React-based UI (using Vite) for data visualization and user interaction.
2.  **Backend (Node.js)**: Acts as the primary API gateway and handles routing.
3.  **Backend (Python)**: Handles the Machine Learning heavy lifting, model inference, and image processing using FastAPI.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, CSS3
- **Primary Backend**: Node.js, Express
- **ML Backend**: Python, FastAPI, Uvicorn
- **ML Libraries**: Scikit-learn (or similar), NumPy, Pandas

---

## 📂 Folder Structure
- `frontend/`: React source code and assets.
- `backend-node/`: Node.js Express server and routes.
- `backend-python/`: Python FastAPI scripts and trained `.pkl` models.

---

## ⚙️ Installation & Setup

### 1. Python Backend (ML Engine)
Navigate to the python directory and install dependencies:
```bash
cd backend-python
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Node Backend (API Gateway)
Navigate to the Node directory and install dependencies:
```bash
cd backend-node
npm install
npm start
```

### 3. Frontend (UI)
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
npm run dev
```
## 🛰️ Key Features
 1. Map View: Interactive visualization of geographical data.

 2. Urban Prediction: Trigger analysis to see predicted growth patterns.
 
 3. Results Panel: Detailed breakdown of prediction statistics.