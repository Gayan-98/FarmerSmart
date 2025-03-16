import os
from flask_cors import CORS
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np
import cv2
import base64

app = Flask(__name__)

# Load models into memory
models = {
    "disease_detection": load_model('./models/disease_model.keras'),
    # "pest_detection": load_model('models/pest_model.keras'),
    # "weed_seed_detection": load_model('models/weed_seed_model.keras'),
    # "rice_quality_detection": load_model('models/rice_quality_model.keras')
}

# Preprocessing function for base64 image
def preprocess_image_base64(base64_string):
    try:
        # Decode the base64 string
        image_data = base64.b64decode(base64_string)
        # Convert the binary data to a numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        # Decode the image using OpenCV
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        # Resize and normalize the image
        img = cv2.resize(img, (128, 128))
        img = img.astype('float32') / 255.0
        img = img.reshape(1, 128, 128, 3)
        return img
    except Exception as e:
        print("Error preprocessing image:", e)
        return None

@app.route('/predict', methods=['POST'])
def predict():
    # Check if the request contains JSON data
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    # Get the JSON data
    data = request.get_json()

    # Check if the 'image' field is present
    if 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    # Get the base64-encoded image
    base64_image = data['image']

    # Preprocess the image
    img = preprocess_image_base64(base64_image)
    if img is None:
        return jsonify({'error': 'Failed to process image'}), 400

    # Select the correct model and make prediction
    model = models["disease_detection"]  # Use the disease detection model
    prediction = model.predict(img)
    predicted_class = np.argmax(prediction, axis=1)[0]

    # Define class labels for the disease detection model
    class_labels = ['Bacterial Blight', 'Blast', 'Brown Spot', 'Tungro']

    # Ensure the predicted_class is within the valid range
    if predicted_class < 0 or predicted_class >= len(class_labels):
        return jsonify({
            'error': 'Invalid prediction',
            'predicted_class': predicted_class,
            'class_labels': class_labels
        }), 400

    predicted_label = class_labels[predicted_class]

    return jsonify({
        'prediction': predicted_label,
        'message': 'Prediction successful'
    })

if __name__ == '__main__':
    app.run(debug=True)