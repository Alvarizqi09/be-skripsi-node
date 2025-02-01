import sys
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import json

# Load the model
model_path = "Plant_Leaf_ModelA6.keras"
model = tf.keras.models.load_model(model_path)

# Class names (sesuaikan dengan yang digunakan di model)
class_names = ["Corn Common Rust", "Corn Healthy", "Corn Gray Leaf Spot","Corn Northern Leaf Blight" ]

def prepare_image(img_path, img_size=(299, 299)):
    img = image.load_img(img_path, target_size=img_size)
    img_array = image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)  # Membuat batch size = 1
    return img_array

def predict_image(img_path):
    img_array = prepare_image(img_path)
    predictions = model.predict(img_array)
    predicted_class = class_names[np.argmax(predictions)]
    confidence = np.max(predictions)
    return predicted_class, confidence

if __name__ == "__main__":
    img_path = sys.argv[1]  # Ambil path gambar dari argumen
    predicted_class, confidence = predict_image(img_path)
    
    # Kirim hasil dalam format JSON
    result = {
        "predicted_class": predicted_class,
        "confidence": float(confidence)
    }
    print(json.dumps(result))  # Output hasil ke console untuk dikirim ke Express
