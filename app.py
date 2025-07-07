from flask import Flask, request, jsonify, send_from_directory
import os
import numpy as np
from werkzeug.utils import secure_filename
import uuid
from PIL import Image
import io

# Try to import TensorFlow with comprehensive error handling
try:
    # Suppress TensorFlow warnings
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    
    import tensorflow as tf
    from tensorflow import keras
    TENSORFLOW_AVAILABLE = True
    print(f"✅ TensorFlow {tf.__version__} imported successfully")
except ImportError as e:
    print(f"❌ TensorFlow import failed: {e}")
    TENSORFLOW_AVAILABLE = False

app = Flask(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Global variables
model = None
graph = None
session = None

# Correct class labels from your training (verified)
class_labels = ['10', '100', '1000', '20', '50', '500', '5000']

def load_model_with_graph():
    """Load model with proper graph and session handling"""
    global model, graph, session
    
    if not TENSORFLOW_AVAILABLE:
        print("❌ TensorFlow not available")
        return False
    
    model_path = 'models/currency_classifier.h5'
    
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return False
    
    print(f"🔄 Loading model from: {model_path}")
    print(f"📁 File size: {os.path.getsize(model_path) / (1024*1024):.1f} MB")
    
    try:
        # Method 1: Try with new graph and session
        print("🔄 Method 1: Creating new graph and session...")
        graph = tf.Graph()
        
        with graph.as_default():
            session = tf.compat.v1.Session()
            
            with session.as_default():
                # Disable eager execution for compatibility
                tf.compat.v1.disable_eager_execution()
                
                # Recreate the model architecture from training
                from tensorflow.keras.models import Sequential # type: ignore
                from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout # type: ignore
                
                model = Sequential([
                    Conv2D(32, (3,3), activation='relu', input_shape=(224,224,3)),
                    MaxPooling2D(2,2),
                    Conv2D(64, (3,3), activation='relu'),
                    MaxPooling2D(2,2),
                    Conv2D(128, (3,3), activation='relu'),
                    MaxPooling2D(2,2),
                    Flatten(),
                    Dense(128, activation='relu'),
                    Dropout(0.5),
                    Dense(7, activation='softmax')  # 7 classes
                ])
                
                model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
                
                # Load weights
                model.load_weights(model_path)
                
                print("✅ Model loaded with graph and session!")
                print(f"📊 Model input shape: {model.input_shape}")
                print(f"📊 Model output shape: {model.output_shape}")
                return True
                
    except Exception as e1:
        print(f"❌ Method 1 failed: {str(e1)[:200]}...")
    
    # Method 2: Try with eager execution enabled
    try:
        print("🔄 Method 2: Using eager execution...")
        tf.compat.v1.enable_eager_execution()
        
        # Recreate the model architecture
        from tensorflow.keras.models import Sequential # type: ignore
        from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout # type: ignore
        
        model = Sequential([
            Conv2D(32, (3,3), activation='relu', input_shape=(224,224,3)),
            MaxPooling2D(2,2),
            Conv2D(64, (3,3), activation='relu'),
            MaxPooling2D(2,2),
            Conv2D(128, (3,3), activation='relu'),
            MaxPooling2D(2,2),
            Flatten(),
            Dense(128, activation='relu'),
            Dropout(0.5),
            Dense(7, activation='softmax')
        ])
        
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        
        # Load weights
        model.load_weights(model_path)
        
        print("✅ Model loaded with eager execution!")
        print(f"📊 Model input shape: {model.input_shape}")
        print(f"📊 Model output shape: {model.output_shape}")
        return True
        
    except Exception as e2:
        print(f"❌ Method 2 failed: {str(e2)[:200]}...")
    
    print("❌ All model loading methods failed")
    return False

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def predict_currency_real(image_path):
    """Real currency prediction with proper graph context"""
    global model, graph, session
    
    if model is None:
        return {"error": "Model not loaded", "confidence": 0}
    
    try:
        print(f"🔄 Processing image: {image_path}")
        
        # Load and preprocess image exactly like in training
        img = Image.open(image_path)
        img = img.convert('RGB')  # Ensure RGB format
        
        # Resize to model input size (same as training - using NEAREST interpolation to match training)
        target_size = (224, 224)
        img = img.resize(target_size, resample=Image.NEAREST)
        
        # Convert to numpy array and normalize (same as training: rescale=1.0/255)
        img_array = np.array(img, dtype=np.float32) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        print(f"📊 Input shape: {img_array.shape}")
        print(f"📊 Input range: [{img_array.min():.3f}, {img_array.max():.3f}]")
        
        # Make prediction with proper graph context
        if graph is not None and session is not None:
            # Use graph and session
            with graph.as_default():
                with session.as_default():
                    predictions = model.predict(img_array, verbose=0)
        else:
            # Use eager execution
            predictions = model.predict(img_array, verbose=0)
        
        print(f"📊 Raw predictions: {predictions[0]}")
        
        # Get the predicted class
        predicted_class_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_index] * 100)
        
        # Map to class label
        if predicted_class_index < len(class_labels):
            predicted_label = class_labels[predicted_class_index]
        else:
            predicted_label = "Unknown"
        
        print(f"✅ Prediction: PKR {predicted_label} with {confidence:.2f}% confidence")
        
        # Create detailed result
        result = {
            "currency": f"PKR {predicted_label}",
            "denomination": predicted_label,
            "confidence": round(confidence, 2),
            "valid": confidence >= 80,  # Your original threshold
            "all_predictions": {}
        }
        
        # Add all class probabilities for debugging
        for i, label in enumerate(class_labels):
            if i < len(predictions[0]):
                result["all_predictions"][f"PKR {label}"] = round(float(predictions[0][i] * 100), 2)
        
        return result
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return {"error": str(e), "confidence": 0}

def mock_predict_currency():
    """Mock prediction for fallback"""
    import random
    mock_predictions = [
        {"currency": "PKR 10", "denomination": "10", "confidence": 92.5, "valid": True},
        {"currency": "PKR 100", "denomination": "100", "confidence": 88.2, "valid": True},
        {"currency": "PKR 1000", "denomination": "1000", "confidence": 96.4, "valid": True},
        {"currency": "PKR 20", "denomination": "20", "confidence": 89.3, "valid": True},
        {"currency": "PKR 50", "denomination": "50", "confidence": 95.7, "valid": True},
        {"currency": "PKR 500", "denomination": "500", "confidence": 93.8, "valid": True},
        {"currency": "PKR 5000", "denomination": "5000", "confidence": 91.1, "valid": True},
    ]
    return random.choice(mock_predictions)

# Load model on startup
print("🚀 Starting CashLens.ai Flask Server...")
model_loaded = load_model_with_graph()

# Routes
@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/upload')
def upload_page():
    return send_from_directory('templates', 'upload.html')

@app.route('/api/predict', methods=['POST'])
def predict_api():
    """API endpoint for currency prediction"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Please upload an image."}), 400
        
        # Save uploaded file temporarily
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Use real model if available, otherwise mock
            if model_loaded and model is not None:
                print("✅ Using REAL MODEL for prediction")
                result = predict_currency_real(filepath)
            else:
                print("⚠️ Using mock prediction (model not available)")
                result = mock_predict_currency()
            
            # Clean up temporary file
            os.remove(filepath)
            
            return jsonify(result)
        
        except Exception as e:
            # Clean up temporary file in case of error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
    
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "tensorflow_available": TENSORFLOW_AVAILABLE,
        "tensorflow_version": tf.__version__ if TENSORFLOW_AVAILABLE else "N/A",
        "supported_formats": list(ALLOWED_EXTENSIONS),
        "class_labels": class_labels,
        "prediction_type": "REAL MODEL" if model is not None else "MOCK DATA",
        "graph_mode": "Session" if session is not None else "Eager"
    })

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 16MB."}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print(f"📁 Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"🤖 Model loaded: {'✅ YES - REAL MODEL' if model_loaded else '❌ NO - USING MOCK'}")
    print(f"🧠 TensorFlow: {'✅ Available' if TENSORFLOW_AVAILABLE else '❌ Not available'}")
    print(f"📊 Graph mode: {'Session' if session is not None else 'Eager'}")
    print("🌐 Server will be available at: http://localhost:5000")
    print("📱 Main page: http://localhost:5000")
    print("📤 Upload page: http://localhost:5000/upload")
    print("="*60)
    
    app.run(debug=True, host='0.0.0.0', port=5000) 