import numpy as np

pred = np.array([1,2,3,4,5,6,7])
real = np.array([1,2,3,4,5,6,7])

seasonality = 2
print(real[seasonality:])
print(real[:-seasonality])


print('mase : ', np.mean(np.abs(real-pred))/np.mean(np.abs(real[seasonality:]-real[:-seasonality])))