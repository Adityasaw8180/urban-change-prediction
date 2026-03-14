from flask import Flask, request, jsonify
from flask_cors import CORS
from model import calculate_growth

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    result = calculate_growth(data)
    return jsonify(result)

app.run(port=8000)