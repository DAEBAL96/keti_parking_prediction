import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.svm import SVR
from keras.models import Sequential
from keras.layers import Dense, LSTM, GRU

# Load the input CSV data
data = pd.read_csv('./parking_state.csv')
# Preprocess the data
train_data = data[data['time_stamp'] <= '2023-03-22 14:00:00']
test_data = data[data['time_stamp'] > '2023-03-22 14:00:00']

# Convert the data to numpy arrays
train_x = np.array(train_data[['congestion_rate', 'week']])
train_y = np.array(train_data['congestion_rate'])
test_x = np.array(test_data[['congestion_rate', 'week']])
test_y = np.array(test_data['congestion_rate'])


# print(test_data.index)
# Build the LSTM model
lstm_model = Sequential()
lstm_model.add(LSTM(50, input_shape=(1, 2)))
lstm_model.add(Dense(1))
lstm_model.compile(loss='mean_squared_error', optimizer='adam')
lstm_model.fit(train_x.reshape(train_x.shape[0], 1, train_x.shape[1]), train_y, epochs=100, batch_size=1, verbose=2)

# Build the GRU model
gru_model = Sequential()
gru_model.add(GRU(50, input_shape=(1, 2)))
gru_model.add(Dense(1))
gru_model.compile(loss='mean_squared_error', optimizer='adam')
gru_model.fit(train_x.reshape(train_x.shape[0], 1, train_x.shape[1]), train_y, epochs=100, batch_size=1, verbose=2)

# Build the SVM model
svm_model = SVR(kernel='rbf', C=1000, gamma=0.1)
svm_model.fit(train_x, train_y)

# Predict the values for LSTM, GRU and SVM models
lstm_predicted = lstm_model.predict(test_x.reshape(test_x.shape[0], 1, test_x.shape[1]))
gru_predicted = gru_model.predict(test_x.reshape(test_x.shape[0], 1, test_x.shape[1]))
svm_predicted = svm_model.predict(test_x)
pred_list = [lstm_predicted.flatten().tolist(), gru_predicted.flatten().tolist(), svm_predicted]

from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_squared_log_error, r2_score
def confirm_result(y_test, pred_list):
    pd.options.display.float_format = '{:5f}'.format
    model_name = ['LSTM', 'GRU', 'SVM']
    Result = pd.DataFrame(index = ['MAE', 'RMSE', 'RMSLE', 'R2'])
    for i in range(0, len(pred_list)) :
        MAE = mean_absolute_error(y_test, pred_list[i])
        RMSE = np.sqrt(mean_squared_error(y_test, pred_list[i]))
        MSLE = mean_squared_log_error(y_test, pred_list[i])
        RMSLE = np.sqrt(mean_squared_log_error(y_test, pred_list[i]))
        R2 = r2_score(y_test, pred_list[i])
        Result = Result.assign(**{model_name[i] : [MAE, RMSE, RMSLE, R2]})
    # Result = pd.DataFrame(data = [MAE, RMSE, RMSLE, R2], index = ['MAE', 'RMSE', 'RMSLE', 'R2'], columns=['Results'])
    
    return Result
# 수정핊요 
scaler = MinMaxScaler(feature_range=(0, 1))
look_back = 24
start_date = pd.to_datetime('2023-03-28 22:00:00')
end_date = pd.to_datetime('2023-03-29 05:00:00')
num_hours = int((end_date - start_date).total_seconds() / 3600) + 1
preds = []
for i in range(num_hours):
    x = test_data[-look_back:].reshape(1, look_back, 1)
    pred = lstm_model.predict(x)[0][0]
    preds.append(pred)
    test_data = np.append(test_data, pred).reshape(-1, 1)
    
# Scale predictions back to original range
preds = scaler.inverse_transform(np.array(preds).reshape(-1, 1))

# Create dataframe of prediction results
date_range = pd.date_range(start=start_date, end=end_date, freq='H')
pred_df = pd.DataFrame({'time_stamp': date_range, 'congestion_rate': preds.flatten()})
pred_df.to_csv('week_prediction_results.csv', index=False)



print("===========================Model result==================================")
print(confirm_result(test_y, pred_list))
print("=========================================================================")

# Plot the actual and predicted values for LSTM, GRU and SVM models
plt.figure(figsize=(10, 5))
plt.plot(test_y, label='Actual Values')
plt.plot(lstm_predicted, label='LSTM Predicted Values')
plt.plot(gru_predicted, label='GRU Predicted Values')
plt.plot(svm_predicted, label='SVM Predicted Values')
plt.xlabel('Time')
plt.ylabel('Congestion Rate')
plt.legend()
plt.show()

# Plot the difference between actual and predicted values for LSTM, GRU and SVM models
plt.figure(figsize=(10, 5))
plt.plot(test_y - lstm_predicted.flatten(), label='LSTM')
plt.plot(test_y - gru_predicted.flatten(), label='GRU')
plt.plot(test_y - svm_predicted, label='SVM')
plt.legend()
plt.show()