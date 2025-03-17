import os
import cv2
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import img_to_array
import io
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8081", "http://127.0.0.1:8081"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Global variables
model = None
rice_type_classes = ["Nadu rice", "White Samba"]  # Update these based on your model's classes
quality_classes = ["Poor", "Medium", "Good"]  # Update these based on your model's classes

def load_rice_model():
    """Load the trained rice classification model"""
    global model
    model_path = 'models/rice_classification_model.h5'  # Update with your model path
    model = load_model(model_path)
    print("Rice classification model loaded successfully!")

def classify_rice_grain(length, rice_type):
    """
    Classify individual rice grain quality based on length.
    
    Args:
        length (float): Length of the rice grain
        rice_type (str): Type of rice
        
    Returns:
        str: Quality of rice grain
    """
    if rice_type == "Nadu rice":
        if length > 40:
            return "Good"
        elif length > 30:
            return "Medium"
        else:
            return "Poor"
    elif rice_type == "White Samba":
        if length > 35:
            return "Good"
        elif length > 25:
            return "Medium"
        else:
            return "Poor"
    else:
        return "Unknown"

def process_image_and_analyze(image):
    """Process the image and analyze rice grains"""
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Preprocessing
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Multiple thresholding techniques
    _, binary1 = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    binary2 = cv2.adaptiveThreshold(blurred, 255,
                                   cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY_INV, 11, 2)
    
    def process_contours(binary):
        # Find and filter contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        min_area = 100  # Minimum grain area
        max_area = 10000  # Maximum grain area
        valid_contours = [
            cnt for cnt in contours
            if min_area < cv2.contourArea(cnt) < max_area
        ]
        
        return valid_contours
    
    # Process contours from both binary images
    contours1 = process_contours(binary1)
    contours2 = process_contours(binary2)
    
    # Choose contour set with more grains
    contours = contours1 if len(contours1) > len(contours2) else contours2
    
    return contours, binary1

def predict_rice_type_quality(image):
    """Predict rice type and quality using the model"""
    # Resize image to match model's expected input
    resized_img = cv2.resize(image, (128, 128))
    
    # Preprocess image
    img_array = img_to_array(resized_img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    # Make prediction using the model
    type_predictions, quality_predictions = model.predict(img_array)
    
    # Get predicted class indices
    predicted_type_idx = np.argmax(type_predictions[0])
    predicted_quality_idx = np.argmax(quality_predictions[0])
    
    # Convert indices to class names
    predicted_type = rice_type_classes[predicted_type_idx]
    predicted_quality = quality_classes[predicted_quality_idx]
    
    return predicted_type, predicted_quality

def analyze_rice_image(image):
    """Complete rice analysis workflow"""
    
    # Process image and get contours
    contours, binary = process_image_and_analyze(image)
    
    # Predict rice type using the model
    predicted_type, predicted_quality = predict_rice_type_quality(image)
    
    # Analyze grain details based on contours
    grain_details = []
    for contour in contours:
        rect = cv2.minAreaRect(contour)
        box = cv2.boxPoints(rect)
        box = box.astype(np.int32)  # Specific integer type (32-bit)
        
        # Calculate length
        side1 = np.linalg.norm(box[0] - box[1])
        side2 = np.linalg.norm(box[1] - box[2])
        length = max(side1, side2)
        
        # Get quality based on length
        quality = classify_rice_grain(length, predicted_type)
        
        grain_details.append({
            'length': float(length),
            'quality': quality
        })
    
    # Calculate quality counts
    total_grains = len(grain_details)
    
    if total_grains == 0:
        return {
            'error': 'No rice grains detected in the image'
        }
    
    quality_counts = {
        'Good': sum(1 for grain in grain_details if grain['quality'] == 'Good'),
        'Medium': sum(1 for grain in grain_details if grain['quality'] == 'Medium'),
        'Poor': sum(1 for grain in grain_details if grain['quality'] == 'Poor')
    }
    
    # Calculate quality percentages
    quality_percentages = {
        quality: round((count / total_grains) * 100, 1)
        for quality, count in quality_counts.items()
    }
    
    # Overall assessment based on percentages
    if quality_percentages['Good'] > 70:
        overall_quality = "Excellent"
    elif quality_percentages['Good'] > 50:
        overall_quality = "Good"
    elif quality_percentages['Medium'] > 50:
        overall_quality = "Average"
    else:
        overall_quality = "Poor"
    
    # Create result dictionary
    result = {
        'total_grains': total_grains,
        'good_grains': quality_counts['Good'],
        'good_percent': quality_percentages['Good'],
        'medium_grains': quality_counts['Medium'],
        'medium_percent': quality_percentages['Medium'],
        'poor_grains': quality_counts['Poor'],
        'poor_percent': quality_percentages['Poor'],
        'predicted_rice_type': predicted_type,
        'predicted_quality': overall_quality
    }
    
    return result

@app.route('/analyze', methods=['POST'])
def analyze():
    """API endpoint for rice analysis"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    try:
        # Get image file from request
        image_file = request.files['image']
        
        # Read image directly from file object without saving to disk
        image_bytes = image_file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'error': 'Failed to process image'}), 400
        
        # Run analysis
        analysis_result = analyze_rice_image(image)
        
        return jsonify(analysis_result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Rice quality analysis API is running'})

if __name__ == '__main__':
    # Load the model before starting the app
    load_rice_model()
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5001)