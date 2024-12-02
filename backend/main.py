import os
from flask import Flask, request, jsonify, render_template, url_for
from tensorflow.keras.models import load_model
import numpy as np
import cv2
from tensorflow.keras.preprocessing import image

# Load the model
model = load_model('model.keras')

# Initialize Flask app
app = Flask(__name__)

# Image preprocessing function (resize and normalize)
def preprocess_image(img_path):
    img = cv2.imread(img_path)
    img = cv2.resize(img, (128, 128))  # Resize to 128x128
    img = img.astype('float32') / 255.0  # Normalize the pixel values to [0, 1]
    img = img.reshape(1, 128, 128, 3)  # Reshape back to (1, 128, 128, 3)
    return img

# Dictionary of diseases and solutions
# Dictionary of diseases and solutions
disease_solutions = {
    'Bacterialblight': '''
        <h4>Solution for Bacterial Blight:</h4>
        <p><b>Symptoms:</b> Yellowing of leaf edges, dark brown lesions with yellow halos, and possible leaf curling.</p>
        <p><b>Prevention:</b> Use certified disease-free seeds, and practice crop rotation to reduce soil-borne bacteria.</p>
        <p><b>Management:</b> Apply copper-based fungicides such as copper oxychloride or copper hydroxide.</p>
        <p><b>Additional Steps:</b> Remove and destroy infected plant parts, and avoid overhead irrigation that promotes the spread of bacteria.</p>
        <p><b>Crop Rotation:</b> Rotate rice with non-host crops to break the disease cycle. Use resistant rice varieties if available.</p>
    ''',

    'Blast': '''
        
        <p><b>Symptoms:</b> Irregular, water-soaked lesions on leaves, which turn gray and develop a narrow yellow border.</p>
        <p><b>Prevention:</b> Use resistant rice varieties such as Bg 366, Bg 403, and Bg 406. Proper field sanitation is essential.</p>
        <p><b>Management:</b> Apply fungicides like Tricyclazole, Isoprothiolane, and Carbendazim at recommended dosages during the early growth stages.</p>
        <p><b>In Severe Cases:</b> If the disease spreads rapidly, apply fungicides in liquid form as mentioned:</p>
        <ul>
            <li>Tebuconazole 250g/l EC – dissolve 10 ml in 16 l of water (8-10 tanks per acre).</li>
            <li>Isoprothiolane 400g/l EC – dissolve 20 ml in 16 l of water (8-10 tanks per acre).</li>
            <li>Carbendazim 50% WP/WG – dissolve 11 g/11 ml in 16 l of water (8-10 tanks per acre).</li>
            <li>Tricyclazole 75% WP – dissolve 10 g in 16 l of water (8-10 tanks per acre).</li>
        </ul>
        <p><b>Next Season Management:</b> Use resistant varieties, certified seed paddy, and avoid planting infected straw. Consider adding burnt paddy husk to the soil during land preparation.</p>
    ''',

    'Brownspot': '''
        <h4>Solution for Brown Spot:</h4>
        <p><b>Symptoms:</b> Small, round lesions with brown centers and a yellow halo, often found on older leaves.</p>
        <p><b>Prevention:</b> Improve soil fertility with balanced fertilizer application and maintain proper water management.</p>
        <p><b>Management:</b> Apply fungicides like Mancozeb or Propiconazole when symptoms first appear. Ensure proper field drainage to avoid excessive moisture, which promotes fungal growth.</p>
        <p><b>Additional Steps:</b> Remove infected plant debris from the field and practice crop rotation to avoid the buildup of the pathogen in the soil.</p>
    ''',

    'Tungro': '''
        <h4>Solution for Tungro:</h4>
        <p><b>Symptoms:</b> Stunted growth, yellowing of leaves, and the appearance of dark streaks or blotches on the leaves.</p>
        <p><b>Prevention:</b> Use resistant rice varieties and control vector insects like the green leafhopper and the white-backed planthopper.</p>
        <p><b>Management:</b> Apply insecticides like Imidacloprid or Fipronil to control the insect vectors that spread the disease.</p>
        <p><b>Infected Plants:</b> Remove and destroy infected plants to prevent the spread of the disease to healthy plants.</p>
        <p><b>Post-Infection Steps:</b> Avoid planting rice in areas with a history of Tungro and ensure proper sanitation to prevent re-infection.</p>
    '''
}


# Define route to index page
@app.route('/')
def index():
    return render_template('index.html')

# API endpoint to predict image class
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    # Save the file temporarily
    file_path = os.path.join('static', file.filename)
    file.save(file_path)

    # Preprocess the image
    img = preprocess_image(file_path)

    # Get the prediction
    prediction = model.predict(img)
    predicted_class = np.argmax(prediction, axis=1)[0]
    
    # Map the class number back to its label
    classes = ['Bacterialblight', 'Blast', 'Brownspot', 'Tungro']
    predicted_label = classes[predicted_class]

    # Fetch the solution based on the predicted disease
    solution = disease_solutions.get(predicted_label, 'No solution available.')

    # Return the template with prediction, image, and solution
    return render_template('index.html', 
                       prediction=predicted_label, 
                       solution=solution, 
                       uploaded_image=file.filename)

if __name__ == '__main__':
    app.run(debug=True)
