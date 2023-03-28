
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score

test_y_list = [1, 2, 3, 4, 5, 6]
test_predict = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]

print(test_y_list)
print(test_predict)
print(test_y_list[0])
print(test_predict[0])
sum = 0
for i in range(0, len(test_y_list)) :
    sum = sum + test_y_list[i]
    
print(sum)
    
print("accu : ", accuracy_score(test_y_list, test_predict))