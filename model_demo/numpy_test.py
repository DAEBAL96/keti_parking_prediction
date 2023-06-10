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
    
# test_array = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16],[17,18,19,20]]
test_array = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
# -------------------------------------
# test_matrix = np.array(test_array)
# print(test_matrix.shape)
# print(test_matrix)                        -> array가 numpy matrix로 만들어지는 과정 및 출력 테스트
# -------------------------------------

# -------------------------------------  3차원 갯수 , 행 갯수, 열 갯수
test_matrix = np.array(test_array).reshape(2,5,2)       # -> 2행 2열의 배열이 4개 이므로 [ [ [],[] ], [ [],[] ] ] 형태이다.
print(test_matrix)
print(type(test_matrix))
print(test_matrix.size)
print(test_matrix.shape)
#print(test_matrix.reshape())                # -> 7이거나 아무 인자도 없으면 오류난다.
print(test_matrix.reshape(-1))                  # -> 하지만 -1만 단독으로 있으면 넘파이 어레이에 있는 value 수 만큼 알아서 자동으로 1차원 배열로 생성
print(test_matrix.flatten())                    # -> flatten() 만으로도 1차원 배열로 자동 생성
print(test_matrix.flatten().tolist())           # -> tolist() => list로 타입 변경해주는 함수인가? 맞네.... 위의 배열은 아직까지 넘파이 배열인데
                                                # -> 넘파이 배열을 tolist() 함수에 엮으면 python list로 배열이 바뀐다.
# print(np.reshape(test_matrix, 8))
# print("-------------------------")
# print(test_matrix.reshape(4,-1))
# # print(test_matrix.reshape(3,-1))              # -> 행에 4 열에 -1 넣으면 4행이 되도록 인자의 수를 자동으로 열에 배치 8개이므로 4행 2열
#                                                 # -> 인자의 수가 12개면 4행 3열이겠지, 하지만 이렇게 배수로 떨어지지 않는 인자의 수는 오류 발생

# print(test_matrix.reshape(-1, 4))               # -> 마찬가지로 행에 -1 열에 4를 넣으면 4열이 되도록 행을 자동으로 분배 위랑 똑같이 인자의 수가 다르면 오류 발생

# # -------------------------------------     -> reshape() 함수 사용방법
#                         #                   -> {nparray}.reshape(shape 인자) & np.reshape({nparray}, shape인자)
# def shape_test() :
    
#     return 0

# data = pd.read_csv('./python_test_csv.csv')

# # print(type(data))           # -> pandas.core.frame.DataFrame
# # print(data)                 # -> csv에 넘버링 index가 붙어있어도 python으로 csv 파일을 불러가는 순간
#                             # -> row구분을 위한 새로운 Unnamed index가 붙는다.
# print(data['time_stamp'])   # -> 'time_stamp' column의 row만 출력
# print(type(data['time_stamp'])) # -> pandas.core.series.Series 
#                                 # -> series는 dict와 유사한 형태를 띈다. index와 value를 가진다.
# test_dict = {'a' : 1, 'b' : 2, 'c' : 3}
# print(pd.Series(test_dict))     # ->   dict로 Series 만들면 하나의 열을 가질 시 dict의 key list는 index로 가고 dict의 value는 Series의 value로 간다.
# print(pd.Series(test_array))    # ->   array로 Series 만들면 index는 자동으로 list의 value 수 만큼 숫자 0부터 시작해서 채워지고, value는 그대로 Series의 value로 들어간다.

# print(pd.Series(test_dict).index)
# print(pd.Series(test_dict).index[0])
# print(type(pd.Series(test_dict).index))     # -> index를 뽑아서 볼 수 도 있으며 list에 접근하듯 접근하여 index의 값도 뽑아서 볼 수 있다.
# print(pd.Series(test_array).index)
# print(pd.Series(test_array).index[0])
# print(type(pd.Series(test_array).index))    # -> 단 dict로 직접 index를 만든 경우의 Series와 array로 Series를 만들어 자동으로 index를 채운 경우 index를 출력해보면 하나는 base.Index, 하나는 Randge index인 것 처럼 종류가 다름을 알 수 있다.
# print(pd.Series(test_array, index = ["한", "둘"]))  # -> 단 이렇게 index를 넣어주면 index를 자동으로 안넣고 지정 할 수는 있다.



# # ---------------------------------------- index value 꺼내기
# index_array = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]
# index_Sr = pd.Series(index_array, index = ["한","둘","셋","넷"])
# print(index_Sr[0])
# print(index_Sr["한"])       # -> Seires의 value를 꺼내는 방법은 index의 번호를 입력하거나 index value를 입력하면 된다
# print(type(index_Sr[0]))    # -> 해당 value의 데이터 타입을 가져감 지금은 list이다.
# print(index_Sr[[1,3]])      # -> array를 slice하듯 value 핸들을 하는 방법또한 존재한다. -> [5,6,7,8],[13,14,15,16] 가 출력
#                             # -> 이 땐 위의 하나의 value에만 접근할 떄와 다르게 index까지 함꼐 출력된다.
#                             # -> 결국 slice는 아니고 입력한 해당 index의 value만이 출력되는 것 
# print(type(index_Sr[[1,2]]))    # -> index까지 함께 모두 출력되기 때문에 type은 Series이다.

# print(index_Sr[1:3])           # -> 위는 slice는 아니고 이게 slice 2중 괄호를 칠 필요 없이 기존 list 슬라이스 하듯 하면됨
#                                 # -> [:] 1:3 이므로 index 1, 2 value가 출력된다. slice는 뒷 자리 범위 미만
# print(index_Sr["둘":"넷"])      # -> 하지만 index value를 직접 입력하여 slice 할 시 뒷 자리 index 범위 이하로 범위 지정


# ------------- Data Frame --------------
# df = 시리즈가 여러개 합쳐진 자료형 데이터

# df_dict = {"한" : [0,1,2,3], "둘" : [4,5,6,7], "셋" : [8,9,10,11], "넷" : [12,13,14,15]}
# df_list = [[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]]
# df = pd.DataFrame(df_dict)                                          # -> index는 Series를 만들 때 처럼 자동으로 들어감
# df = pd.DataFrame(df_dict, index= ["인", "덱", "스", "다"])          # -> 따로 인자를 넣어주면 ㄱㅊ 이 때 row의 수와 같아야한다.

# df2 = pd.DataFrame(df_list, index=["리","스","트","다"], columns = [1, 2, 3, 4])
#                         # -> list로 df를 만들 땐 list의 의 차원과 value수에 따라 index, columns 수가 정해진다.
#                         # -> list가 1차 배열이면 index는 하나 n차 배열이면 index는 n개, list의 value수가 1개면 column은 하나
#                         # -> list의 단차 배열의 value수가 n개이면 column 수도 n개이다.

# print(df)
# print(df2)

# print(df.index)
# print(df2.index)

# print(df.columns)
# print(df2.columns)        # -> Series와 마찬가지로 index, column도 뽑아볼 수 있다. 