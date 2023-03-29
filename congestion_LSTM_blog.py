import pandas as pd
import numpy as np
from tensorflow import keras
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score
from keras.models import Sequential
from keras.layers import Dense, LSTM

# Load data
df = pd.read_csv('./parking_state.csv', parse_dates=['time_stamp'])

df = df.resample('1H').mean()

train_data = df.loc['2023-03-01 22:00:00':'2023-03-22 14:00:00', 'congestion_rate'].values
test_data = df.loc['2023-03-22 14:00:00':'2023-03-28 21:00:00', 'congestion_rate'].values
