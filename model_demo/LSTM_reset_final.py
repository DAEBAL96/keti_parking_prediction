import torch
import os
import numpy as np
import pandas as pd
from tqdm import tqdm
import seaborn as sns
# from pylab import rcParams
import matplotlib.pyplot as plt
from matplotlib import rc
from sklearn.preprocessing import MinMaxScaler
from pandas.plotting import register_matplotlib_converters
from torch import nn, optim

# -------------------module import 및 설정 ----------------------

sns.set(style='whitegrid', palette='muted', font_scale=1.2)
# rcParams['figure.figsize'] = 14, 10
register_matplotlib_converters()
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
torch.manual_seed(RANDOM_SEED)


# ----------- df 전처리 index 설정 후 불필요 colmn 제거 ----------

df = pd.read_csv('./test.csv')
df['time_stamp'] = pd.to_datetime(df['time_stamp'])
df.set_index('time_stamp', inplace=True)
df = df.iloc[:,1:2]

# ----------- sequence data로 변환 --------------

def create_sequences(data, seq_length):
    xs = []
    ys = []
    for i in range(len(data)-seq_length):
        x = data.iloc[i:(i+seq_length)]
        y = data.iloc[i+seq_length]
        xs.append(x)
        ys.append(y)
    return np.array(xs), np.array(ys)

seq_length = 5          # sequence length는 5
X, y = create_sequences(df, seq_length)

# ----------- train , validation, test data 분할 ------------

train_size = int(913 * 0.8)

X_train, y_train = X[:train_size], y[:train_size]
X_val, y_val = X[train_size:train_size+90], y[train_size:train_size+90]
X_test, y_test = X[train_size+90:], y[train_size+90:]

# print(X_train.shape, X_val.shape, X_test.shape) # (730, 5, 1) (90, 5, 1) (93, 5, 1)
# print(y_train.shape, y_val.shape, y_test.shape) # (730, 1) (90, 1) (93, 1)

# ------------np.array -> torch.tensor array 타입으로 변환 (tensor lstm 사용 예정)-------------

def make_Tensor(array):
    return torch.from_numpy(array).float()

X_train = make_Tensor(X_train)
y_train = make_Tensor(y_train)      
X_val = make_Tensor(X_val)
y_val = make_Tensor(y_val)
X_test = make_Tensor(X_test)
y_test = make_Tensor(y_test)

# --------------------------- LSTM 모델 정의 ---------------------------------

class ParkingPredictor(nn.Module):
    def __init__(self, n_features, n_hidden, seq_len, n_layers):    # 기본 변수 및
        super(ParkingPredictor, self).__init__()    # 모델 layer 초기화
        self.n_hidden = n_hidden
        self.seq_len = seq_len
        self.n_layers = n_layers
        self.lstm = nn.LSTM(
            input_size=n_features,
            hidden_size=n_hidden,
            num_layers=n_layers,
            dropout=0.75
        )
        self.linear = nn.Linear(in_features=n_hidden, out_features=1)
    def reset_hidden_state(self):       # 학습 초기화를 위한 reset_hidden_state
        self.hidden = (
            torch.zeros(self.n_layers, self.seq_len, self.n_hidden),
            torch.zeros(self.n_layers, self.seq_len, self.n_hidden)
        )
    def forward(self, sequences):       # 예측을 위한 forward 함수
        lstm_out, self.hidden = self.lstm(
            sequences.view(len(sequences), self.seq_len, -1),
            self.hidden
        )
        last_time_step = lstm_out.view(self.seq_len, len(sequences), self.n_hidden)[-1]
        y_pred = self.linear(last_time_step)
        return y_pred
    

# ---------------- 모델 학습 단계 ---------------------

def train_model(model, train_data, train_labels, val_data=None, val_labels=None, num_epochs=100, verbose = 10, patience = 10):  # Class 학습을 위한 모델 정의
    loss_fn = torch.nn.L1Loss() #
    optimiser = torch.optim.Adam(model.parameters(), lr=0.001)
    train_hist = []
    val_hist = []
    for t in range(num_epochs):

        epoch_loss = 0
        for idx, seq in enumerate(train_data): 
            model.reset_hidden_state() # seq 별 hidden state reset
            # train loss
            seq = torch.unsqueeze(seq, 0)
            y_pred = model(seq)
            loss = loss_fn(y_pred[0].float(), train_labels[idx]) # 1개의 step에 대한 loss
            # update weights
            optimiser.zero_grad()
            loss.backward()
            optimiser.step()
            epoch_loss += loss.item()
        train_hist.append(epoch_loss / len(train_data))
        if val_data is not None:
            with torch.no_grad():
                val_loss = 0
                for val_idx, val_seq in enumerate(val_data):
                    model.reset_hidden_state() # seq 별로 hidden state 초기화 
                    val_seq = torch.unsqueeze(val_seq, 0)
                    y_val_pred = model(val_seq)
                    val_step_loss = loss_fn(y_val_pred[0].float(), val_labels[val_idx])
                    val_loss += val_step_loss
        
            val_hist.append(val_loss / len(val_data)) # val hist에 추가
            ## verbose 번째 마다 loss 출력 
            if t % verbose == 0:
                print(f'Epoch {t} train loss: {epoch_loss / len(train_data)} val loss: {val_loss / len(val_data)}')
            ## patience 번째 마다 early stopping 여부 확인
            if (t % patience == 0) & (t != 0):
                ## loss가 커졌다면 early stop
                if val_hist[t - patience] < val_hist[t] :
                    print('\n Early Stopping')
                    break

        elif t % verbose == 0:
            print(f'Epoch {t} train loss: {epoch_loss / len(train_data)}')

    return model, train_hist, val_hist

model = ParkingPredictor(n_features=1, n_hidden=4, seq_len=seq_length, n_layers=1)
model, train_hist, val_hist = train_model(model, X_train, y_train, X_val, y_val, num_epochs=100, verbose=10, patience=50)

# print(train_hist)
# print(val_hist)

plt.plot(train_hist, label="Training loss")
plt.plot(val_hist, label="Val loss")
plt.legend()
plt.show()


# --------------------- model test ------------------------------

pred_dataset = X_test

with torch.no_grad():
    print("test 1 ")
    preds = []
    for _ in range(len(pred_dataset)):
        model.reset_hidden_state()
        y_test_pred = model(torch.unsqueeze(pred_dataset[_], 0))
        pred = torch.flatten(y_test_pred).item()
        preds.append(pred)

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
print(confirm_result(np.array(y_test), [np.array(preds)]))
print("=========================================================================")

plt.plot(df.index[-len(y_test):], np.array(y_test), label='True')
plt.plot(df.index[-len(preds):], np.array(preds), label='Pred')
plt.xticks(rotation=45)
plt.legend()
plt.show()