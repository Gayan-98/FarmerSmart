import os
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np
import cv2

app = Flask(__name__) 

# Load models into memory
models = {
    "disease_detection": load_model('./models/disease_model.keras'),
    # "pest_detection": load_model('models/pest_model.keras'),
    # "weed_seed_detection": load_model('models/weed_seed_model.keras'),
    # "rice_quality_detection": load_model('models/rice_quality_model.keras')
}

# Preprocessing function
def preprocess_image(img_path):
    img = cv2.imread(img_path)
    img = cv2.resize(img, (128, 128))
    img = img.astype('float32') / 255.0
    img = img.reshape(1, 128, 128, 3)
    return img

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files or 'service' not in request.form:
        return jsonify({'error': 'Missing file or service parameter'})

    file = request.files['file']
    service = request.form['service']

    if file.filename == '' or service not in models:
        return jsonify({'error': 'Invalid file or service name'})

    # Save and preprocess the image
    file_path = os.path.join('static', file.filename)
    file.save(file_path)
    img = preprocess_image(file_path)

    # Select the correct model and make prediction
    model = models[service]
    prediction = model.predict(img)
    predicted_class = np.argmax(prediction, axis=1)[0]

    # Define class labels for each model
    class_labels = {
        "disease_detection": ['Bacterial Blight', 'Blast', 'Brown Spot', 'Tungro'],
        "pest_detection": ['Rice Bug', 'Stem Borer', 'Leaf Folder'],
        "weed_seed_detection": ['Weed 1', 'Weed 2', 'Seed 1', 'Seed 2'],
        "rice_quality_detection": ['Good Quality', 'Medium Quality', 'Poor Quality']
    }

    predicted_label = class_labels[service][predicted_class]

    return jsonify({'prediction': predicted_label, 'service_used': service})

if __name__ == '__main__':
    app.run(debug=True)
