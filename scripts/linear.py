import pandas as pd
import numpy as np
import joblib
import sys
import json
from sklearn.preprocessing import StandardScaler

def predict_next_12_hours(model, data_last_12_hours):
    
    predictions = []
    current_data = data_last_12_hours.copy()

    for _ in range(12):
        input_data = current_data[feature_columns]
        input_data = input_data.fillna(method='ffill').fillna(method='bfill')
        next_hour_prediction = model.predict(input_data.iloc[-1:])
        next_hour_data = pd.DataFrame(next_hour_prediction, columns=["pm10", "pm25", "ozone"], 
                                      index=[current_data.index[-1] + pd.Timedelta(hours=1)])
        current_data = pd.concat([current_data, next_hour_data])
        predictions.append(next_hour_prediction.flatten())
        current_data = current_data.iloc[1:]
    index = pd.date_range(start=data_last_12_hours.index[-1] + pd.Timedelta(hours=1), periods=12, freq='H')
    predictions_df = pd.DataFrame(predictions, index=index, columns=["pm10", "pm25", "ozone"])
    predictions_object = {
        'pm10': predictions_df['pm10'].round().tolist(),
        'pm25': predictions_df['pm25'].round().tolist(),
        'ozone': predictions_df['ozone'].round().tolist()
    }

    return predictions_object

input_data = sys.stdin.read()
input_json = json.loads(input_data)
data = pd.DataFrame(input_json)
data['time'] = pd.to_datetime(data['time'])
data.set_index('time', inplace=True)
feature_columns = [
    'temperature', 'humidity', 'pressure', 'cloud',
    'pm10', 'pm25', 'ozone',
]
model = joblib.load("scripts/trained_model_linear.pkl")
predictions_12_hours_forward = predict_next_12_hours(model, data)
print(json.dumps(predictions_12_hours_forward))