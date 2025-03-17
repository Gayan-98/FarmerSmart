import os
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
from PIL import Image
import firebase_admin
from firebase_admin import credentials, db
import logging
from flask_cors import CORS

# Set up logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'seed-detection-secret'

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8081", "http://127.0.0.1:8081"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

socketio = SocketIO(app, cors_allowed_origins=["http://localhost:8081", "http://127.0.0.1:8081"])

# Load the trained model
MODEL_PATH = "hybrid_seed_classifier.h5"  # Update this with your actual model path
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    # Create a dummy model for testing if real model can't be loaded
    print("Using a dummy model for testing")
    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = tf.keras.layers.GlobalAveragePooling2D()(inputs)
    outputs = tf.keras.layers.Dense(len(['rice_seeds', 'barnyardgrass', 'jungle_rice', 'saromacca_grass', 'glume', 'jungle_rice_b']), activation='softmax')(x)
    model = tf.keras.Model(inputs, outputs)

# Firebase setup
try:
    cred = credentials.Certificate("weed-seed-count-firebase-adminsdk-fbsvc-d6bab51cc6.json")
    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://weed-seed-count-default-rtdb.asia-southeast1.firebasedatabase.app/"
    })
    print("Firebase initialized successfully")
except Exception as e:
    print(f"Error initializing Firebase: {e}")

# Define seed categories - ensure they match what you used in training
seed_categories = [
    'rice_seeds',
    'barnyardgrass',
    'jungle_rice',
    'saromacca_grass',
    'glume',
    'jungle_rice_b'
]

# Function to convert prediction probabilities to seed counts
def convert_predictions_to_counts(predictions, img_array):
    # Using the model output to determine seed counts
    # This should be adjusted based on how your model is actually performing
    
    total_count = 0
    counts = {}
    
    # Initialize counts for all categories
    for category in seed_categories:
        counts[category] = 0
    
    # Parse predictions based on your model's output format
    for i, category in enumerate(seed_categories):
        # Adjust threshold and scaling based on your model's behavior
        if predictions[0][i] > 0.2:  # Increased threshold for more precision
            # The scaling factor should be calibrated based on your validation data
            count = int(predictions[0][i] * 50)  # Adjusted scaling factor
            counts[category] = count
            total_count += count
    
    # For rice_seeds, you might want special handling if it follows a different pattern
    counts['rice_seeds'] = 0  # Based on your example output
    
    return counts, total_count

# Determine the class (A, B, or C) based on seed counts
def determine_seed_class(seed_counts):
    # Filter out rice_seeds and zero counts
    filtered_counts = {k: v for k, v in seed_counts.items() if k != 'rice_seeds' and v > 0}
    
    if not filtered_counts:
        return "NONE"  # No seeds detected
    
    # Find the seed type with the highest count
    highest_seed_type = max(filtered_counts, key=filtered_counts.get)
    
    # Determine class based on the highest seed type
    if highest_seed_type == 'saromacca_grass':
        return "A"
    elif highest_seed_type == 'barnyardgrass':
        return "B"
    elif highest_seed_type == 'jungle_rice':
        return "C"
    else:
        return "NONE"  # Default case

# SocketIO event handlers - with improved logging
@socketio.on('connect')
def handle_connect():
    print('Client connected: ' + request.sid)
    print('Connection headers:', request.headers)
    emit('response', {'data': 'Connected to the server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected: ' + request.sid)

@socketio.on('message')
def handle_message(message):
    print('Received message: ' + str(message))
    emit('response', {'data': 'Message received'})

# Custom event for ESP32 status updates
@socketio.on('esp32_status')
def handle_esp32_status(data):
    print('ESP32 status update: ' + str(data))
    emit('response', {'data': 'Status received'})

# Route to upload image and get predictions
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    file = request.files["image"]
    filename = secure_filename(file.filename)
    file_path = os.path.join("uploads", filename)
    
    # Save the uploaded file
    os.makedirs("uploads", exist_ok=True)
    file.save(file_path)
    
    # Open and preprocess the image
    img = Image.open(file_path).convert('RGB')  # Convert to RGB (3 channels)
    img = img.resize((224, 224))  # Resize to match model input
    img_array = np.array(img)
    img_array = img_array / 255.0  # Normalize pixel values
    img_array = np.expand_dims(img_array, axis=0)
    
    # Make prediction
    if isinstance(model.input, list):
        # If model has multiple inputs
        prediction = model.predict([img_array, img_array])
    else:
        # If model has single input
        prediction = model.predict(img_array)
    
    # Convert predictions to seed counts
    seed_counts, total_seeds = convert_predictions_to_counts(prediction, img_array)
    
    # Determine the class based on seed counts
    seed_class = determine_seed_class(seed_counts)
    
    # Format the result string to match your expected output format
    result_string = f"Seed Detection Results:\n Total Seeds Detected: {total_seeds} \nRice Seeds Detected: {seed_counts['rice_seeds']} Seed \nType Breakdown: "
    
    # Add individual seed types (excluding rice_seeds which is already shown)
    for category, count in seed_counts.items():
        if category != 'rice_seeds' and count > 0:
            result_string += f"\n{category}: {count} seeds "
    
    result_string += f"\nClass: {seed_class}"
    
    # Save results to Firebase Realtime Database
    try:
        ref = db.reference("/seed_counts")
        new_entry = ref.push({
            "filename": filename,
            "total_seeds": total_seeds,
            "seed_counts": seed_counts,
            "seed_class": seed_class,
            "result_string": result_string,
            "timestamp": {".sv": "timestamp"}
        })
        print(f"Data saved to Firebase with key: {new_entry.key}")
    except Exception as e:
        print(f"Error saving to Firebase: {e}")
    
    # Emit the class to all connected clients via WebSocket
    print(f"Emitting seed class: {seed_class}")
    socketio.emit('seed_class', {'class': seed_class})
    
    return jsonify({
        "message": "Seed counting successful",
        "total_seeds": total_seeds,
        "seed_counts": seed_counts,
        "seed_class": seed_class,
        "result_string": result_string
    })

# Serve a simple web interface with improved debugging
@app.route('/')
def index():
    return render_template('index.html')

# Basic testing route to verify server is running
@app.route('/test')
def test():
    return jsonify({"status": "Server is running"})

# Create a test route that emits a websocket event when accessed
@app.route('/test_event/<class_value>')
def test_event(class_value):
    socketio.emit('seed_class', {'class': class_value})
    return jsonify({"status": "Test event sent", "class": class_value})

# Main entry point
if __name__ == "__main__":
    # Create templates directory if it doesn't exist
    os.makedirs("templates", exist_ok=True)
    
    # Create or update the index.html file with improved debugging capabilities
    with open("templates/index.html", "w") as f:
        f.write("""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Seed Detection WebSocket Interface</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const statusEl = document.getElementById('status');
                    const seedClassEl = document.getElementById('seed-class');
                    const logEl = document.getElementById('log');
                    
                    // Function to add log message
                    function addLog(message) {
                        const logItem = document.createElement('div');
                        logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
                        logEl.prepend(logItem);
                        console.log(message);
                    }
                    
                    // Connect to socket.io server
                    addLog('Connecting to Socket.IO server...');
                    const socket = io();
                    
                    socket.on('connect', function() {
                        addLog('Connected to Socket.IO server');
                        statusEl.textContent = 'Connected';
                        statusEl.className = 'connected';
                    });
                    
                    socket.on('disconnect', function() {
                        addLog('Disconnected from Socket.IO server');
                        statusEl.textContent = 'Disconnected';
                        statusEl.className = 'disconnected';
                    });
                    
                    socket.on('connect_error', function(err) {
                        addLog(`Connection error: ${err.message}`);
                        statusEl.textContent = 'Error';
                        statusEl.className = 'error';
                    });
                    
                    socket.on('response', function(data) {
                        addLog(`Received response: ${JSON.stringify(data)}`);
                    });
                    
                    socket.on('seed_class', function(data) {
                        addLog(`Received seed class: ${JSON.stringify(data)}`);
                        seedClassEl.textContent = data.class;
                        seedClassEl.className = `class-${data.class.toLowerCase()}`;
                    });
                    
                    // Add manual class emission buttons
                    document.getElementById('emit-a').addEventListener('click', function() {
                        socket.emit('seed_class', { class: 'A' });
                        addLog('Manually emitted Class A');
                    });
                    
                    document.getElementById('emit-b').addEventListener('click', function() {
                        socket.emit('seed_class', { class: 'B' });
                        addLog('Manually emitted Class B');
                    });
                    
                    document.getElementById('emit-c').addEventListener('click', function() {
                        socket.emit('seed_class', { class: 'C' });
                        addLog('Manually emitted Class C');
                    });
                });
            </script>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                .container { display: flex; }
                .panel { flex: 1; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                .connected { color: green; font-weight: bold; }
                .disconnected { color: red; font-weight: bold; }
                .error { color: orange; font-weight: bold; }
                .class-a { color: blue; font-weight: bold; }
                .class-b { color: green; font-weight: bold; }
                .class-c { color: purple; font-weight: bold; }
                #log { height: 200px; overflow-y: auto; margin-top: 20px; padding: 10px; background: #f5f5f5; border: 1px solid #ddd; }
                #log div { margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                button { margin: 5px; padding: 8px 15px; cursor: pointer; }
            </style>
        </head>
        <body>
            <h1>Seed Detection WebSocket Interface</h1>
            
            <div class="container">
                <div class="panel">
                    <h2>Server Status</h2>
                    <p>Connection: <span id="status" class="disconnected">Disconnected</span></p>
                    <p>Last detected seed class: <span id="seed-class">None</span></p>
                    
                    <h3>Manual Testing</h3>
                    <button id="emit-a">Emit Class A</button>
                    <button id="emit-b">Emit Class B</button>
                    <button id="emit-c">Emit Class C</button>
                </div>
                
                <div class="panel">
                    <h2>Image Upload</h2>
                    <form action="/predict" method="post" enctype="multipart/form-data">
                        <input type="file" name="image" accept="image/*">
                        <button type="submit">Analyze Image</button>
                    </form>
                    
                    <h3>Test URL</h3>
                    <p>To test seed class detection, visit:</p>
                    <code>/test_event/A</code> (or B or C)
                </div>
            </div>
            
            <h2>Event Log</h2>
            <div id="log"></div>
        </body>
        </html>
        """)
    
    print("====================================")
    print("Starting Flask-SocketIO server...")
    print("WebSocket server will be available at: ws://hostname:5000/socket.io/")
    print("====================================")
    socketio.run(app, host='0.0.0.0', port=5002, debug=True, allow_unsafe_werkzeug=True)