import pandas as pd
import numpy as np

Result = pd.DataFrame(index = ["a", "b", "c", "d", "e"])
print(Result)

# Result = pd.DataFrame(data=[1, 2, 3, 4, 5], index = ["a", "b", "c", "d", "e"], columns= ['results'])
Result = Result.assign(**{'n_results':[6,7,8,9,0]}) 
print(Result)


# test_list = np.array([["a"],["b"],["c"],["d"],["e"],["f"]])
# print(test_list)
# test_list = test_list.flatten().tolist()
# print(test_list)
# test_list = test_list.shape(test_list.shape[0], 1, test_list.shape[1])
# print(test_list)
