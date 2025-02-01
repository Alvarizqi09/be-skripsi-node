import sys
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import json

# Load the model
model_path = '/app/Plant_Leaf_Model15.keras'
model = tf.keras.models.load_model(model_path)

# Disable GPU usage
tf.config.set_visible_devices([], 'GPU')


class_names = ["Corn Common Rust",  "Corn Gray Leaf Spot","Corn Healthy","Corn Northern Leaf Blight" ]

def prepare_image(img_path, img_size=(299, 299)):
    img = image.load_img(img_path, target_size=img_size)
    img_array = image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0) 
    return img_array

def predict_image(img_path):
    img_array = prepare_image(img_path)
    predictions = model.predict(img_array)
    predicted_class = class_names[np.argmax(predictions)]
    confidence = np.max(predictions)
    return predicted_class, confidence

if __name__ == "__main__":
    img_path = sys.argv[1] 
    predicted_class, confidence = predict_image(img_path)

    result = {
        "predicted_class": predicted_class,
        "confidence": float(confidence)
    }
    print(json.dumps(result))
