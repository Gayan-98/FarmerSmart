from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from PIL import Image
import io
import torchvision.transforms as transforms
from torchvision import models
import torch.nn as nn
import os

app = Flask(__name__)
CORS(app, resources={
    r"/predict": {
        "origins": ["http://localhost:8081", "http://127.0.0.1:8081"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Update the class names with actual pest names
class_names = [
    'rice leaf roller',
    'rice leaf caterpillar',
    'paddy stem maggot',
    'asiatic rice borer',
    'yellow rice borer',
    'rice gall midge',
    'brown plant hopper',
    'rice stem fly',
    'rice water weevil',
    'rice leaf hopper',
    'rice shell pest',
    'thrips'
]

# Load the saved model
def load_model():
    model = models.resnet18(pretrained=False)
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, len(class_names))
    model.load_state_dict(torch.load(r'/home/isuru/Pictures/reasearch_project/FarmerSmart/backend/models/pest_model_state_dict.pth'))
    model.eval()
    return model

# Initialize model and device
model = load_model()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# Define the transformation
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        # Check if image file is present in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        # Read image file
        image_file = request.files['image']
        image = Image.open(io.BytesIO(image_file.read())).convert('RGB')

        # Preprocess the image
        image_tensor = transform(image).unsqueeze(0).to(device)

        # Make prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            _, predicted = torch.max(outputs, 1)
            predicted_class = class_names[predicted.item()]

        response = jsonify({
            'predicted_class': predicted_class,
            'success': True
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    except Exception as e:
        response = jsonify({
            'error': str(e),
            'success': False
        }), 500
        if isinstance(response, tuple):
            response[0].headers.add('Access-Control-Allow-Origin', '*')
        else:
            response.headers.add('Access-Control-Allow-Origin', '*')
        return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001) 