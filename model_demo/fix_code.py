import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import xgboost as xgb
from statsmodels.tsa.arima.model import ARIMA
from sklearn.preprocessing import MinMaxScaler
from sklearn.svm import SVR
from keras.models import Sequential
from keras.layers import Dense, LSTM, GRU

# Load the input CSV data
data = pd.read_csv('./parking_state.csv')
data = data.set_index('time_stamp')
print(data)










# Preprocess the data
train_data = data[data['time_stamp'] <= '2023-03-22 14:00:00']
test_data = data[data['time_stamp'] > '2023-03-22 14:00:00']

print("test 12")

# print(train_data.loc[:, "time_stamp"])      # time stamp 만 남김
# print(train_data.drop("time_stamp", axis=1))    # time_stamp column 은 날아가고 새로운 index가 생기며 index 값은 Null이 아닌 숫자 매긴다
# print(train_data.loc[:, ["congestion_rate", "week"]])   # congestion_rate, week 만 남김

# Convert the data to numpy arrays
train_x = np.array(train_data[['congestion_rate', 'week']])
train_y = np.array(train_data['congestion_rate'])
test_x = np.array(test_data[['congestion_rate', 'week']])
test_y = np.array(test_data['congestion_rate'])


# print(test_data.index)
# Build the LSTM model
print("test1")
print(train_x.shape[0]) # 497
print("test2")
print(train_x.shape[1]) # 2

lstm_model = Sequential()
lstm_model.add(LSTM(50, input_shape=(1, 2)))
lstm_model.add(Dense(1))
lstm_model.compile(loss='mean_squared_error', optimizer='adam')
lstm_model.fit(train_x.reshape(train_x.shape[0], 1, train_x.shape[1]), train_y, epochs=100, batch_size=32, verbose=2)

# Build the GRU model
gru_model = Sequential()
gru_model.add(GRU(50, input_shape=(1, 2)))
gru_model.add(Dense(1))
gru_model.compile(loss='mean_squared_error', optimizer='adam')
gru_model.fit(train_x.reshape(train_x.shape[0], 1, train_x.shape[1]), train_y, epochs=100, batch_size=32, verbose=2)

# Build the SVM model
svm_model = SVR(kernel='rbf', C=1000, gamma=0.1)
svm_model.fit(train_x, train_y)

# Build the xgboost model
# xgb_model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=1000)
# xgb_model.fit(train_x, train_y, eval_set=[(x_train, y_train), (x_test, y_test)], early_stopping_rounds=50, verbose=False)

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

print("===========================Model result==================================")
print(confirm_result(test_y, pred_list))
print("=========================================================================")

# #--------------- 수정핊요 --------------- 

# # # Load the LSTM model
# # lstm_model = Sequential()
# # lstm_model.add(LSTM(50, input_shape=(1, 2)))
# # lstm_model.add(Dense(1))
# # lstm_model.compile(loss='mean_squared_error', optimizer='adam')
# # lstm_model.load_weights('lstm_model_weights.h5')

# start_time = pd.to_datetime('2023-03-28 22:00:00')
# end_time = pd.to_datetime('2023-03-29 22:00:00')
# time_stamps = pd.date_range(start=start_time, end=end_time, freq='H')
# predictions_df = pd.DataFrame({'time_stamp': time_stamps})

# test_x = np.array(predictions_df[['congestion_rate', 'week']])

# predictions = []
# for i in range(len(time_stamps)):
#     x = test_x[i].reshape(1, 1, 2)
#     y = lstm_model.predict(x)[0][0]
#     predictions.append(y)

# predictions_df['congestion_rate'] = predictions

# predictions_df.to_csv('./predictions.csv', index=False)
# #---------------------------------------- 


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