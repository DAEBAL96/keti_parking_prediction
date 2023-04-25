import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM, GRU
from sklearn.svm import SVR
from xgboost import XGBRegressor
from statsmodels.tsa.arima_model import ARIMA
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt

data = pd.read_csv("./parking_state.csv")

# data["time_stamp"] = pd.to_datetime(data["time_stamp"])
data.set_index("time_stamp", inplace=True)

train_data = data.loc["2023-03-01 22:00:00":"2023-03-22 14:00:00"]
test_data = data.loc["2023-03-22 14:00:00":"2023-03-28 21:00:00"]

def preprocess_LSTM_GRU(data):
    # scaler = MinMaxScaler()
    # data["congestion_rate"] = scaler.fit_transform(data[["congestion_rate"]])
    X, y = [], []
    for i in range(len(data)-24):
        X.append(data.iloc[i:i+24])
        y.append(data.iloc[i+24]["congestion_rate"])
    X, y = np.array(X), np.array(y)
    print(X)
    return X, y


def preprocess_SVM_XGBoost(data):
    x, y = [], []
    for i in range(len(data)-24):
        x.append(data.iloc[i:i+24].values.flatten())
        y.append(data.iloc[i+24]["congestion_rate"])
    x, y = np.array(x), np.array(y)
    return x, y

from statsmodels.tsa.arima_model import ARIMA

def preprocess_ARIMA(data):
    model = ARIMA(data["congestion_rate"], order=(1,1,1))
    results = model.fit(disp=-1)
    return results

# LSTM & GRU Model part

X_train, y_train = preprocess_LSTM_GRU(train_data)
X_test, y_test = preprocess_LSTM_GRU(test_data)

model = Sequential()
model.add(LSTM(50, activation='relu', input_shape=(24, 3)))
model.add(Dense(1))
model.compile(optimizer='adam', loss='mse')
model.fit(X_train, y_train, epochs=50, batch_size=32, verbose=2)
y_pred_LSTM = model.predict(X_test)
mse_LSTM = mean_squared_error(y_test, y_pred_LSTM)
print("MSE for LSTM model:", mse_LSTM)

plt.figure(figsize=(10, 5))
plt.plot(y_test, label='Actual Values')
plt.plot(y_pred_LSTM, label='LSTM Predicted Values')
# plt.plot(gru_predicted, label='GRU Predicted Values')
# plt.plot(svm_predicted, label='SVM Predicted Values')
plt.xlabel('Time')
plt.ylabel('Congestion Rate')
plt.legend()
plt.show()