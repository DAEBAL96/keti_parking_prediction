const axios = require('axios');
const fs = require("fs");
const moment = require('moment');

const cse_url = "http://203.253.128.164:7579/Mobius";
const m2m_ae = {                        // free, ocu측정에 따른 AE 구분
    "Deep" : "AIparking",
    "LoRa" : "keti_parking"
  };
const m2m_header = {
    'Accept': 'application/json',
    'X-M2M-RI': '12345',
    'X-M2M-Origin': 'S'
}
let Deep_spot_list = [];
let all_parking_state = {};
let final_hour_state = {};

let rn = "actual_all_congestion"
let parent = "/Mobius/keti_parking_congestion/" + rn;




function make_all_parking_conf(){
    parking_conf_json = JSON.parse(fs.readFileSync("./parking_conf.json", "utf-8"))
    Deep_spot_list = parking_conf_json["Deep"]
}

let convert_value = (value) => {
    if(value === "occupied"){
        return 1
    }
    else if(value === "free"){
        return 0
    }
    else{
        return 2
    }
}

let avg_cal = (array) => {
    let avg_result = (array.reduce(function add(sum, currValue){return sum + currValue;}))/(array.length)
    if(avg_result >= 0.3){
        return 1
    }
    else if(avg_result < 0.3){
        return 0
    }
}

let obj_avg_cal = (final_hour_state, upload_time) => {
    let spot_list = Object.keys(final_hour_state);
    let all_Congestion = 0;
    let cin_obj = {}
    for(let count = 0; count < spot_list.length; count++){
        if(final_hour_state[spot_list[count]]===1){
            all_Congestion++
        }
    }
    all_Congestion = (all_Congestion / spot_list.length)
    cin_obj["tiem_stamp"] = date_convert(upload_time)
    cin_obj["congestion"] = all_Congestion
    
    return cin_obj
}

const make_init_parking_state = async function(){
    try{
        make_all_parking_conf();
        for(var deep_spot_count = 0; deep_spot_count < Deep_spot_list.length; deep_spot_count++){
            url = cse_url + "/" + m2m_ae["Deep"] + "/" + Deep_spot_list[deep_spot_count] + "/la"
            console.log(url);
            var response = await axios.get(url, {headers : m2m_header})
            if(Object.keys(response.data).includes("m2m:cin")){
                all_parking_state[Deep_spot_list[deep_spot_count]] = [convert_value(response.data["m2m:cin"]["con"])]
            }
            else{       // parsing_start_day 이후로 적측된 cin이 없음
                console.log("**", Deep_spot_list[deep_spot_count], "** spot's date state not exist")
            }
        }
        console.log(all_parking_state)
        //return all_parking_state/
    } catch(err){
        console.log("make_init_parking_state - Error >> ", err);
    }
}

let upload_congestion = (upload_time) => {
    for(var count = 0; count < Object.keys(all_parking_state).length; count ++){
        final_hour_state[Object.keys(all_parking_state)[count]] = avg_cal(all_parking_state[Object.keys(all_parking_state)[count]])
    }
    let cin_obj = obj_avg_cal(final_hour_state, upload_time);
    final_hour_state = {};
    onem2m_client.create_z2m_cin(parent, cin_obj, function(rsc, res_body){
        console.log("response code = ", rsc)
        console.log(res_body)
        console.log(rn, " cin upload complete")
    })
}

// make_init_parking_state()


// if(setDataTopic.hasOwnProperty(topicName)){

//  }

/*            spot noti path            */

let congestion_ae = ""
let congestion_cnt = "" // keti cnt도 만들고, 아니면 spot별 congestion

let spot_Topic = {

}

/* ------------------------------------- */

/*           spot temp state             */

let Hour_spot_state = {
    "" : [],
    "" : []
}


/* ------------------------------------- */

function Hour_interval() {
    let offset = 1000 * 60 * 60 * 9
    let now = new Date((new Date()).getTime() + offset)
    let nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
    console.log("now : ", now)
    console.log("next interval time : ", nextHour)
    let nextHourString = nextHour.toISOString();   // 만약 다시 펑션 돌아도 now가 키핑되면 now값을 불러와서 긁고
    nextHourString = nextHourString.replace(/T/g,'').replace(/-/g,'').replace(/:/g,'').substr(0, 12);
    let uploadtime = nextHourString.substr(0, 10);
    let delay = nextHour - now;
    console.log("delay : ", delay)
    setTimeout(() => {          // 지정한 밀리 초 이후 코드 실행을 스케줄링 하는 데 사용 가능
        console.log(`Running function at ${nextHour}`);
        upload_congestion(uploadtime);
        make_init_parking_state()
        Hour_interval();
    }, delay);
}


/*                  mqtt client                 */



/* ---------------------------------------------*/


let date_convert = (input_date) => {   //input_date format yyyymmddhh
    let yy  = input_date.substr(0, 4)
    let mm  = input_date.substr(4, 2) 
    let dd  = input_date.substr(6, 2)
    let hh  = input_date.substr(8, 2)
    let out_date = `${yy}-${mm}-${dd} ${hh}:00:00`;
    return out_date     // output_date format 
}

// module.exports = get_weather();
// module.exports = Hour_interval();
