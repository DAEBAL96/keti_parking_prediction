import pandas as pd
import numpy as np
from tensorflow import keras
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM

# Load data
df = pd.read_csv('./parking_state.csv', parse_dates=['time_stamp'])

# Set the index to the timestamp column
df.set_index('time_stamp', inplace=True)

# Resample the data to hourly intervals
df = df.resample('1H').mean()

# Fill missing values with the mean of the previous and next values
df.fillna(method='ffill', inplace=True)
df.fillna(method='bfill', inplace=True)

# Split the data into training and testing sets
train_data = df.loc['2023-03-01 22:00:00':'2023-03-16 09:00:00', 'congestion_rate'].values
test_data = df.loc['2023-03-16 09:00:00':'2023-03-26 21:00:00', 'congestion_rate'].values

# Scale the data
scaler = MinMaxScaler(feature_range=(0, 1))
train_data = scaler.fit_transform(train_data.reshape(-1, 1))
test_data = scaler.transform(test_data.reshape(-1, 1))

# Prepare the training data
train_X, train_y = [], []
for i in range(24, len(train_data)):
    train_X.append(train_data[i-24:i, 0])
    train_y.append(train_data[i, 0])
train_X, train_y = np.array(train_X), np.array(train_y)
train_X = np.reshape(train_X, (train_X.shape[0], train_X.shape[1], 1))

# Prepare the testing data
test_X, test_y = [], []
for i in range(24, len(test_data)):
    test_X.append(test_data[i-24:i, 0])
    test_y.append(test_data[i, 0])
test_X, test_y = np.array(test_X), np.array(test_y)
test_X = np.reshape(test_X, (test_X.shape[0], test_X.shape[1], 1))

# Create the LSTM model
model = Sequential()
model.add(LSTM(units=200, return_sequences=True, input_shape=(train_X.shape[1], 1)))
model.add(LSTM(units=100))
model.add(Dense(4))
model.add(Dense(1, activation='sigmoid'))
loss = keras.losses.SparseCategoricalCrossentropy
optim = keras.optimizers.Adam(lr=0.001)
metrics = ["accuracy"]
model.compile(loss='mean_squared_error', optimizer=optim, metrics=metrics)
# model.compile(optimizer='adam', loss='mean_squared_error')
# Train the model
model_result = model.fit(train_X, train_y, epochs=200, batch_size=64, verbose=2)
print
print(model_result.summary())


# Generate predictions
train_predict = model.predict(train_X)
test_predict = model.predict(test_X)

# Invert the scaling
train_predict = scaler.inverse_transform(train_predict)
train_y = scaler.inverse_transform([train_y])
test_predict = scaler.inverse_transform(test_predict)
test_y = scaler.inverse_transform([test_y])

# print("Train 예측/분류 결과")
# print("Accuracy: {0:3f}\n".format(accuracy_score(df_train["BAD"],y_pred_train_class)))
# print("Confusion Matrix: \N{}".format(confusion_matrix(df_train["BAD"].y_pred_train_class)),"\n")
# print(classification_report(df_train["BAD"],y_pred_train_class, digits=3))

# print("Test 예측/분류 결과")
# print("Accuracy: {0:3f}\n".format(accuracy_score(df_train["BAD"],y_pred_train_class)))
# print("Confusion Matrix: \N{}".format(confusion_matrix(df_train["BAD"].y_pred_train_class)),"\n")
# print(classification_report(df_train["BAD"],y_pred_train_class, digits=3))

# Plot the results
import matplotlib.pyplot as plt
# plt.plot(train_y.reshape(-1), label="Actual Train Data")
# plt.plot(train_predict.reshape(-1), label="Predicted Train Data")
# print("test_y : ")
# print(test_y.reshape(-1))
# print("predict : ")
# print(test_predict.reshape(-1))


plt.plot(test_y.reshape(-1), label="Actual Test Data")
plt.plot(test_predict.reshape(-1), label="Predicted Test Data")
plt.legend()
plt.show()