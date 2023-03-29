import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import LSTM, Dense

# Load data from CSV file
df = pd.read_csv('./parking_state_0324.csv')

# Preprocess data
df['time_stamp'] = pd.to_datetime(df['time_stamp'])
df = df.set_index('time_stamp').resample('H').mean().reset_index()
data = df['congestion_rate'].values.reshape(-1, 1)
scaler = MinMaxScaler(feature_range=(0, 1))
data = scaler.fit_transform(data)

# Split data into training and testing sets
look_back = 24
train_size = int(len(data) * 0.8)
train_data, test_data = data[:train_size,:], data[train_size:,:]
print(type(test_data))
print(test_data)


train_X, train_y = [], []
for i in range(look_back, len(train_data)):
    train_X.append(train_data[i-look_back:i, 0])
    train_y.append(train_data[i, 0])
train_X, train_y = np.array(train_X), np.array(train_y)
train_X = np.reshape(train_X, (train_X.shape[0], train_X.shape[1], 1))

# Create LSTM model
model = Sequential()
model.add(LSTM(50, input_shape=(look_back, 1)))
model.add(Dense(1))
model.compile(loss='mean_squared_error', optimizer='adam')

# Train model
for i in range(10):
    model.fit(train_X, train_y, epochs=1, batch_size=1, verbose=2, shuffle=False)
    model.reset_states()

# Make predictions for desired time period
start_date = pd.to_datetime('2023-03-23 21:00:00')
end_date = pd.to_datetime('2023-03-27 00:00:00')
num_hours = int((end_date - start_date).total_seconds() / 3600) + 1
preds = []
for i in range(num_hours):
    x = test_data[-look_back:].reshape(1, look_back, 1)
    pred = model.predict(x)[0][0]
    preds.append(pred)
    test_data = np.append(test_data, pred).reshape(-1, 1)
    
# Scale predictions back to original range
preds = scaler.inverse_transform(np.array(preds).reshape(-1, 1))

# Create dataframe of prediction results
date_range = pd.date_range(start=start_date, end=end_date, freq='H')
pred_df = pd.DataFrame({'time_stamp': date_range, 'congestion_rate': preds.flatten()})

# Save prediction results to CSV file
pred_df.to_csv('prediction_results.csv', index=False)