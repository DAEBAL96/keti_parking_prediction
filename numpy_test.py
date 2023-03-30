import numpy as np
import pandas as pd

#[[1,2,3,4][1,2,3,4]]
# -> python array에서 4열 2행

# -------------------------------
# shape = 행렬의 차원(4, 2) 4열 2행
# test_matrix = 
# ---------------------------------

# reshape
# -> 
    
test_array = [[1,2,3,4],[5,6,7,8]]
# -------------------------------------
# test_matrix = np.array(test_array)
# print(test_matrix.shape)
# print(test_matrix)                        -> array가 numpy matrix로 만들어지는 과정 및 출력 테스트
# -------------------------------------

# -------------------------------------
test_matrix = np.array(test_array).reshape(2,2,2)       # -> 2행 2열의 배열이 2 개 이므로 [ [ [],[] ], [ [],[] ] ] 형태이다.
print(test_matrix)
#print(test_matrix.reshape())                # -> 7이거나 아무 인자도 없으면 오류난다.
print(test_matrix.reshape(-1))                  # -> 하지만 -1만 단독으로 있으면 넘파이 어레이에 있는 value 수 만큼 알아서 자동으로 1차원 배열로 생성
print(test_matrix.flatten())                    # -> flatten() 만으로도 1차원 배열로 자동 생성
print(test_matrix.flatten().tolist())           # -> tolist() => list로 타입 변경해주는 함수인가? 맞네.... 위의 배열은 아직까지 넘파이 배열인데
                                                # -> 넘파이 배열을 tolist() 함수에 엮으면 python list로 배열이 바뀐다.
print(np.reshape(test_matrix, 8))
print("-------------------------")
print(test_matrix.reshape(4,-1))
# print(test_matrix.reshape(3,-1))              # -> 행에 4 열에 -1 넣으면 4행이 되도록 인자의 수를 자동으로 열에 배치 8개이므로 4행 2열
                                                # -> 인자의 수가 12개면 4행 3열이겠지, 하지만 이렇게 배수로 떨어지지 않는 인자의 수는 오류 발생

print(test_matrix.reshape(-1, 4))               # -> 마찬가지로 행에 -1 열에 4를 넣으면 4열이 되도록 행을 자동으로 분배 위랑 똑같이 인자의 수가 다르면 오류 발생

# -------------------------------------     -> reshape() 함수 사용방법
                        #                   -> {nparray}.reshape(shape 인자) & np.reshape({nparray}, shape인자)
def shape_test() :
    
    return 0

data = pd.read_csv('./python_test_csv.csv')

# print(type(data))           # -> pandas.core.frame.DataFrame
# print(data)                 # -> csv에 넘버링 index가 붙어있어도 python으로 csv 파일을 불러가는 순간
                            # -> row구분을 위한 새로운 Unnamed index가 붙는다.
print(data['time_stamp'])   # -> 'time_stamp' column의 row만 출력
print(type(data['time_stamp'])) # -> pandas.core.series.Series 
                                # -> series는 dict와 유사한 형태를 띈다.
                                # -> 