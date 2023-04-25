import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from datetime import datetime, timedelta
import paho.mqtt.client as mqtt
import json
import requests

# pred model setup & Split data into training and testing sets
model = keras.models.load_model('./model/0425_LSTM_con2')

model_conf = {
    "init" : True,      # model init 시엔 이전 10 Time data setup 
    "look_back" : 10
}

test_conf = {
    "current_time" : None,
    "start_date" : None,
    "end_date" : None,
    "test_array" : None
}

test_array = []

# oneM2M mqtt broker conf sets
broker_address = "localhost"
oneM2M_noti_topic = '/actual/noti'

# mqtt sub function sets
def parse_mqtt_json(payload) :
    try:
        payload_str = payload.decode('utf-8')  # bytes를 str으로 변환
        payload_json = json.loads(payload_str)  # json 문자열을 파싱하여 json object로 변환
        congesiton = payload_json["congestion"]
        time_stamp = payload_json["time_stamp"]
        payload_obj = {
            "congestion" : congesiton,
            "time_stamp" : time_stamp
        }
        return payload_obj
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        print("Error parsing JSON payload: ", e)
        return None

# #

# oneM2M restful http request function
def crt_cin_request(pred_cin) :
    url = "http://203.253.128.164:7579/Mobius/keti_parking_congestion/predicted_all_congestion"
    
    headers = {
        'Accept': 'application/json',
        'X-M2M-RI': '12345',
        'X-M2M-Origin': 'Sketi_parking_congestion',
        'Content-Type': 'application/json;ty=4'
    }
    con_obj = {
        "m2m:cin": {
            "con": pred_cin
        }
    }
    con_obj = json.dumps(con_obj)
    
    requests.request("POST", url, headers=headers, data=con_obj)
    
# #
    
def make_end_date(start_date) :
    dt = datetime.strptime(start_date, '%Y-%m-%d %H:%M:%S')
    end_day_dt = dt + timedelta(days=1)
    return end_day_dt.strftime('%Y-%m-%d %H:%M:%S')

def make_next_time(message) :
    # 입력된 문자열 시간 데이터를 datetime 객체로 변환
    dt_obj = datetime.strptime(message["time_stamp"], '%Y-%m-%d %H:%M:%S')
    
    # 1시간을 더한 후, datetime 객체로 변환
    new_dt_obj = dt_obj + timedelta(hours=1)
    
    # 변환된 datetime 객체를 다시 문자열 형태로 출력
    return new_dt_obj.strftime('%Y-%m-%d %H:%M:%S')

def init_data_set() :
    try :
        file_path = "./act_congestion_latest10.json"
        
        with open(file_path, 'r') as file :
            data = json.load(file)          # json.load()는 파일 형태의 json 데이터를 파싱, json.loads()는 문자열 형태에서 json 데이터를 파싱
        
        for i in range(1, len(data)+1) :
            test_array.append([json.loads(data[-i]["con"])["congestion"]])
        
        test_conf["start_date"] = json.loads(data[0]["con"])["time_stamp"]
        test_conf["end_date"] = make_end_date(test_conf["start_date"])
        test_conf["test_array"] = np.array([test_array])

    except :
        print("init data set error")
        pass

def update_data_set(message) :
    try :    
        test_conf["current_time"] = message["time_stamp"]
        test_conf["start_date"] = make_next_time(message)
        test_conf["end_date"] = make_end_date(test_conf["start_date"])
        test_array.pop(0)
        test_array.append([message["congestion"]])
        test_conf["test_array"] = np.array([test_array])
    except :
        print("update_data_set error")
        pass

def exe_model() :   # model 실행 serealizing configuration
    try:
        look_back = model_conf["look_back"]
        start_date = pd.to_datetime(test_conf["start_date"])
        end_date = pd.to_datetime(test_conf["end_date"])
        num_hours = int((end_date - start_date).total_seconds() / 3600) + 1
        preds = []
        for i in range(num_hours):
            # x = test_data[-len(test_data):].reshape(1, len(test_data), 1)
            x = test_conf["test_array"][-look_back:].reshape(1, look_back, 1)
            pred = model.predict(x)[0][0]
            preds.append(pred)
            test_conf["test_array"] = np.append(test_conf["test_array"], pred).reshape(-1, 1)

        # Scale predictions back to original range
        # preds = scaler.inverse_transform(np.array(preds).reshape(-1, 1))
        preds = np.array(preds).reshape(-1, 1)
        preds_list = preds.flatten().tolist()
        
        # Create dataframe of prediction results
        date_range = pd.date_range(start=start_date, end=end_date, freq='H')
        date_list = date_range.strftime('%Y-%m-%d %H:%M:%S').tolist()

        pred_cin = dict(zip(date_list, preds_list))
        pred_cin["current_time"] = test_conf["current_time"]
        crt_cin_request(pred_cin)
        # 여기서 oneM2M restful http request 올려주면 됨 cin object를 cin으로 삼아서

        # Save prediction results to CSV file
        pred_df = pd.DataFrame({'time_stamp': date_range, 'congestion_rate': preds.flatten()})
        pred_df.to_csv('pred_test.csv', index=False)

    except :

        print("exe_model error")
        pass

# Get actual parking congestion noti content
def res_oneM2M_noti(client, userdata, message):
    try : 
        print("message = ", message.payload)
        message = parse_mqtt_json(message.payload)
        if(model_conf["init"]):
            model_conf['init'] = False
            init_data_set() # latest 10 -> DB에서 바로 DUMP 뜨는 것 이다 보니깐 noti로 들어온 최신 data가 반영이 안되어있을 수 있음 검증 필요
            # model input func          -> 최신 데이터랑 dump로 들어온 제일 최신 데이터가 같은 값을 가지는지 if로 비교
            update_data_set(message)
            exe_model()

        else:
            update_data_set(message)
            # model input func
            exe_model() # cin 올리자마자 이전 cin은 삭제해주는것도 좋을듯? path를 /la로 접근해서 la안의 content를 삭제해도 좋을 것 같다.

    except : 
        print("oneM2M noti pass error")
        pass
    
client = mqtt.Client()
client.connect(broker_address)

client.subscribe(oneM2M_noti_topic)
client.on_message = res_oneM2M_noti

client.loop_forever()