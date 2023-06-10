import pandas as pd
import json

# Read the JSON file into a dictionary
with open('./final_csv.json', 'r') as f:
    data = json.load(f)

# Convert the dictionary to a DataFrame
df = pd.DataFrame.from_dict(data, orient='index', columns=['congestion_rate'])

# Rename the index column to 'time_stamp'
df.index.name = 'time_stamp'

# Reset the index to make 'time_stamp' a regular column
df.reset_index(inplace=True)

# Print the resulting DataFrame
print(df)

df.to_csv("./test.csv", encoding= "euc-kr")