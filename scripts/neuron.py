import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ["CUDA_VISIBLE_DEVICES"] = ""

#import tensorflow as tf
import numpy as np
import sys
import json

import keras

def predict_next_12_hours(model, sample):
    sample = np.array([sample])
    sample = sample.reshape((1, 12, 7))
    sample_standardized = (sample - mean) / std_dev
    prediction = model.predict(sample_standardized, verbose=2)
    for x in [0, 1, 2]:
      prediction[:,:,x] = ((prediction[:,:,x]*std_dev[4+x]) + mean[4+x]).round()
    
    prediction = prediction.tolist()
    predictions_object = {
      'pm10': [],
      'pm25': [],
      'ozone': []
    }

    for sublist in prediction:
      for entry in sublist:
          predictions_object['pm10'].append(entry[0])
          predictions_object['pm25'].append(entry[1])
          predictions_object['ozone'].append(entry[2])
    return predictions_object

input_data = sys.stdin.read()
data = json.loads(input_data)
mean = np.mean(data, axis=0)
std_dev = np.std(data, axis=0)
model = keras.models.load_model("scripts/model_lstm.keras")
predictions_12_hours_forward = predict_next_12_hours(model, data)
print(json.dumps(predictions_12_hours_forward))