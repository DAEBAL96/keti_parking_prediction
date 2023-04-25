import paho.mqtt.client as mqtt
import json

# MQTT broker 주소 -> mqtt port는 default로 1883을 지정
broker_address = "localhost"

# MQTT 클라이언트 생성
# client = mqtt.Client("Python")
client = mqtt.Client()

# MQTT broker에 연결
client.connect(broker_address)

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

# 토픽 구독 함수
def res_onem2m_noti(client, userdata, message):
    # print(message.topic)
    # print(client)
    # print(userdata)
    print("실행")
    payload =parse_mqtt_json(message.payload)
    try :
        congestion_payload = payload["congestion"]
        time_payload = payload["time_stamp"]
        print(type(congestion_payload))
        print("congestion = ", congestion_payload)
        print(type(time_payload))
        print("time_stamp = ", time_payload)
    except : 
        print("setup error")
        pass

# 토픽 구독 등록
client.subscribe("/test/topic")
client.on_message = res_onem2m_noti     # on_message 콜백 함수가 동작할 때 동작할 함수를 지정
                                        # 해당 함수의 인자로 'client', 'userdata', 'message'가 전달
# client.on_connect = 

# 메시지 발행
# client.publish("test/topic", "Hello, World!")

# MQTT 메시지 루프 시작
client.loop_forever()




# import paho.mqtt.client as mqtt
 
# # 콜백 함수 정의하기
# #  (mqttc.connect를 잘 되면) 서버 연결이 잘되면 on_connect 실행 (이벤트가 발생하면 호출)
# def on_connect(client, userdata, flags, rc):
#     print("rc: " + str(rc))
 
# # 브로커에게 메시지가 도착하면 on_message 실행 (이벤트가 발생하면 호출)
# def on_message(client, obj, msg):
#     print(msg.topic + " " + str(msg.qos) + " " + str(msg.payload))
 
# # (mqttc.publish가 잘 되면) 메시지를 publish하면 on_publish실행 (이벤트가 발생하면 호출)
# def on_publish(client, obj, mid):
#     # 용도 : publish를 보내고 난 후 처리를 하고 싶을 때
#     # 사실 이 콜백함수는 잘 쓰진 않는다.
#     print("mid: " + str(mid))
 
# # (mqttc.subscribe가 잘 되면) 구독(subscribe)을 완료하면
# # on_subscrbie가 호출됨 (이벤트가 발생하면 호출됨)
# def on_subscribe(client, obj, mid, granted_qos):
#     print("Subscribe complete : " + str(mid) + " " + str(granted_qos))
 
# # 클라이언트 생성
# mqttc = mqtt.Client()
 
# # 콜백 함수 할당하기
# mqttc.on_message = on_message
# mqttc.on_connect = on_connect
# mqttc.on_publish = on_publish
# mqttc.on_subscribe = on_subscribe
 
 
# # 브로커 연결 설정
# # 참고로 브로커를 Cloudmqtt 홈페이지를 사용할 경우
# # 미리 username과 password, topic이 등록 되어있어야함.
# url = "m16.cloudmqtt.com"
# port = 14593
# username = "HONG" # Cloud mqtt
# password = "1234"
 
# topic = "devs/DEV1"
 
# # 클라이언트 설정 후 연결 시도
# mqttc.username_pw_set(username, password)
# mqttc.connect(host=url, port=port)
 
# # QoS level 0으로 구독 설정, 정상적으로 subscribe 되면 on_subscribe 호출됨
# mqttc.subscribe(topic, 0)
 
# # 메시지 한번 보내보기
# mqttc.publish(topic, "my message")
 
# # 네트워크 loop를 계속 실행. 종료 에러가 발생하기 전까지 계속 실행
# rc = 0
# while rc == 0:
#     rc = mqttc.loop()
 
# print("rc: " + str(rc))