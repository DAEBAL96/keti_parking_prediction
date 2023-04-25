import requests
import json


test_obj = {
    "m2m:cin": {
        "con": {
            "time_stamp":"2023-04-24 18:00:00", 
            "congestion" : 0.91321 
            }
        }
    }

url = "http://203.253.128.164:7579/Mobius/keti_parking_congestion/predicted_all_congestion"


# payload = "{\"m2m:cin\": {\"con\": {\"time_stamp\":\"2023-04-24 18:00:00\", \"congestion\" : 0.91321 }}}"
payload = json.dumps(test_obj)
headers = {
  'Accept': 'application/json',
  'X-M2M-RI': '12345',
  'X-M2M-Origin': 'Sketi_parking_congestion',
  'Content-Type': 'application/json;ty=4'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)
