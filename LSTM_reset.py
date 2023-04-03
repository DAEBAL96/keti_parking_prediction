import pandas as pd
import numpy as np
import torch
import matplotlib.pyplot as plt
import xgboost as xgb
import seaborn as sns
from statsmodels.tsa.arima.model import ARIMA
from sklearn.preprocessing import MinMaxScaler
from sklearn.svm import SVR
from keras.models import Sequential
from keras.layers import Dense, LSTM, GRU

df = pd.read_csv('./test.csv')
df['time_stamp'] = pd.to_datetime(df['time_stamp'])
df.set_index('time_stamp', inplace=True)
df = df.iloc[:,1:2]
# df = df.iloc[:, 1:2].value --> 1:2 column의 row값을 1차원 배열로 정렬
# df = df.iloc[:, 1:2].T --> T 명령어는 columns와 row의 반전
def create_sequences(data, seq_length):
    xs = []
    ys = []
    for i in range(len(data)-seq_length):
        x = data.iloc[i:(i+seq_length)]
        y = data.iloc[i+seq_length]
        xs.append(x)
        ys.append(y)
    return np.array(xs), np.array(ys)

seq_length = 5
X, y = create_sequences(df, seq_length)

print(X)
print(y)

train_size = int(913 * 0.8)

X_train, y_train = X[:train_size], y[:train_size]
X_val, y_val = X[train_size:train_size+90], y[train_size:train_size+90]
X_test, y_test = X[train_size+90:], y[train_size+90:]

print(X_train.shape, X_val.shape, X_test.shape) # (730, 5, 1) (90, 5, 1) (93, 5, 1)
print(y_train.shape, y_val.shape, y_test.shape) # (730, 1) (90, 1) (93, 1)

def make_Tensor(array):
    return torch.from_numpy(array).float()

X_train = make_Tensor(X_train)      # PyTorch 모델의 입력값으로 넣어주기 위해 np.array를 
y_train = make_Tensor(y_train)      # Torch.Tensor array 타입으로 변환
X_val = make_Tensor(X_val)
y_val = make_Tensor(y_val)
X_test = make_Tensor(X_test)
y_test = make_Tensor(y_test)

# print(X.shape, y.shape)

# sns.set(style='whitegrid', palette='muted', font_scale=1.2)

# plt.plot(df)
# plt.show()