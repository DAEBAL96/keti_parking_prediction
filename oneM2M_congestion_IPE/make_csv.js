/*

make csv code used by demo LSTM model initalizing

*/


const axios = require('axios');
const fs = require("fs");
const moment = require('moment');


/*                          all conf                             */
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
let parsing_start_day = "20230328" // rcn header value --> yyyymmdd 
                                   // cra=20230221T21  --> 이후 데이터 적측 시 T21에서 1씩 더해서 parsing_start_day값 넣으면 될 듯


let parking_conf_json = {};
let all_parking_hist = {};
let LoRa_spot_list = [];
let Deep_spot_list = [];
let common_min_time = null;
let csv_latest_time = null;

let parking_csv = {};

/*****************************************************************/

function make_all_parking_conf(){
    parking_conf_json = JSON.parse(fs.readFileSync("./parking_conf.json", "utf-8"))
    // parking_conf_json = JSON.parse(fs.readFileSync("./test_conf.json", "utf-8"))
    LoRa_spot_list = Object.keys(parking_conf_json["LoRa"])         // LoRa AE와
    Deep_spot_list = parking_conf_json["Deep"]                      // 딥러닝 AE에서 cin을 추출하기 위해 cnt list 생성
}


const make_init_parking_state = async function(){
    try{
        make_all_parking_conf();

        for(var deep_spot_count = 0; deep_spot_count < Deep_spot_list.length; deep_spot_count++){
            url = cse_url + "/" + m2m_ae["Deep"] + "/" + Deep_spot_list[deep_spot_count] + "?rcn=4&ty=4&cra=" + parsing_start_day
            console.log(url)
            var response = await axios.get(url, {headers : m2m_header})

            if(Object.keys(response.data["m2m:rsp"]).length === 0){     // parsing_start_day 이후로 적측된 cin이 없음
                console.log("**", Deep_spot_list[deep_spot_count], "** spot's date state not exist")
            }

            else{

                var AIparking_state = {};
                var cin_length = response.data["m2m:rsp"]["m2m:cin"].length
                if(common_min_time === null){
                    common_min_time = Number(response.data["m2m:rsp"]["m2m:cin"][cin_length-1]["ct"].replace('T',''));
                }
                else if(common_min_time < Number(response.data["m2m:rsp"]["m2m:cin"][cin_length-1]["ct"].replace('T',''))){
                    common_min_time = Number(response.data["m2m:rsp"]["m2m:cin"][cin_length-1]["ct"].replace('T',''));
                }

                if(csv_latest_time === null){
                    csv_latest_time = Number(response.data["m2m:rsp"]["m2m:cin"][0]["ct"].replace('T',''));
                }
                else if(csv_latest_time < Number(response.data["m2m:rsp"]["m2m:cin"][0]["ct"].replace('T',''))){
                    csv_latest_time = Number(response.data["m2m:rsp"]["m2m:cin"][0]["ct"].replace('T',''));
                }



                for(var i=1; i <= response.data["m2m:rsp"]["m2m:cin"].length; i++){
                    AIparking_state[response.data["m2m:rsp"]["m2m:cin"][cin_length - i]["ct"]] = response.data["m2m:rsp"]["m2m:cin"][cin_length - i]["con"];
                }
                all_parking_hist[Deep_spot_list[deep_spot_count]] = AIparking_state;
                console.log(Deep_spot_list[deep_spot_count]," Deep spot contain complete")
            }
        }
        for(var LoRa_spot_count = 0; LoRa_spot_count < LoRa_spot_list.length; LoRa_spot_count++){
            url = cse_url + "/" + m2m_ae["LoRa"] + "/" + LoRa_spot_list[LoRa_spot_count] + "?rcn=4&ty=4&cra=" + parsing_start_day
            console.log(url)
            var response = await axios.get(url, {headers : m2m_header})

            if(Object.keys(response.data["m2m:rsp"]).length === 0){
                console.log("**",parking_conf_json["LoRa"][LoRa_spot_list[LoRa_spot_count]], "** spot's date state not exist")
            }

            else{
                var AIparking_state = {};
                var cin_length = response.data["m2m:rsp"]["m2m:cin"].length
                if(common_min_time === null){
                    common_min_time = Number(response.data["m2m:rsp"]["m2m:cin"][cin_length-1]["ct"].replace('T',''));
                }
                else if(common_min_time < Number(response.data["m2m:rsp"]["m2m:cin"][cin_length-1]["ct"].replace('T',''))){
                    common_min_time = Number(response.data["m2m:rsp"]["m2m:cin"][cin_length-1]["ct"].replace('T',''));
                }

                if(csv_latest_time === null){
                    csv_latest_time = Number(response.data["m2m:rsp"]["m2m:cin"][0]["ct"].replace('T',''));
                }
                else if(csv_latest_time < Number(response.data["m2m:rsp"]["m2m:cin"][0]["ct"].replace('T',''))){
                    csv_latest_time = Number(response.data["m2m:rsp"]["m2m:cin"][0]["ct"].replace('T',''));
                }

                for(var i=1; i <= response.data["m2m:rsp"]["m2m:cin"].length; i++){
                    AIparking_state[response.data["m2m:rsp"]["m2m:cin"][cin_length - i]["ct"]] = response.data["m2m:rsp"]["m2m:cin"][cin_length - i]["con"]["parking"];
                }
                all_parking_hist[parking_conf_json["LoRa"][LoRa_spot_list[LoRa_spot_count]]] = AIparking_state;
                console.log(parking_conf_json["LoRa"][LoRa_spot_list[LoRa_spot_count]]," LoRa spot contain complete")
            }
        }
        all_parking_hist = JSON.stringify(all_parking_hist)
        fs.writeFileSync("./check_all_parking_state.json", all_parking_hist)


        common_min_time = String(common_min_time).substr(0, 10);
        // csv_latest_time = String(csv_latest_time).substr(0, 10);
        console.log("csv_latest_time = ")
        console.log(csv_latest_time)
        
        make_time_stamp_obj(common_min_time, csv_latest_time)
        make_time_stamp_state()
        fs.writeFileSync("./final_csv.json", JSON.stringify(csv_avg_cal(parking_csv)))
    } catch(err){
        console.log("make_init_parking_state - Error >> ", err);
    }

}

let make_time_stamp_state = () => {
    
    try{
        let original_all_parking_state = JSON.parse(fs.readFileSync('./check_all_parking_state.json', 'utf8'));
        // let parking_csv = JSON.parse(fs.readFileSync('./parking_state_csv.json', 'utf8'));
        let parking_spot_list = Object.keys(original_all_parking_state)     // KETI015, KETI016, KETI017.....
        let count_all_parking_spot = parking_spot_list.length               // spot count 
        for(var i = 0; i < count_all_parking_spot; i++){    // parking spot check
            let avg_array = [];
            let avg_result = null;

            let interval_blank = null; // 0 or 1 로 측정 사이에 event 공백이 있는지 체크
            let interval_blank_start_time = null;   // Blank event의 시작 시간을 체크해두고 나중에 해당 시간과 현재 for문 돌고있는 check시간 사이의 공백을 메꾸기 위함
            let interval_start = null;


            let CK_list = Object.keys(parking_csv)      // date list array로 만들어서 나중에 blank에 대한 결과 값을 넣을 때 array안에 있을
                                                                        // blank 시간 ~ current 시간 사이의 값을 array.indexOf(value)로 채워넣으려고
            let spot_state_length = Object.keys(original_all_parking_state[parking_spot_list[i]]).length
            let check_length = 0;
            
            let current_time = null;

            for (let [time, value] of Object.entries(original_all_parking_state[parking_spot_list[i]])){  // 해당 parking spot에 있는 properties 추출
                current_time = time.replace('T','').substr(0, 10);  // 현재 spot별 object에서 긁어낸 시간 key값을 yyyymmddhh -> format으로 바꾸는 것
                if(check_length === 0){
                    if( convert_value(value) === 2 ){
                        avg_array.push(1)
                    }
                    else{
                        avg_array.push(convert_value(value))
                    }
                }
                check_length++;

                /****************************/
                if(Number(common_min_time) > Number(current_time)){      // common min date보다 해당 spot의 state 올린 처음 시간이 빠를 때 이 state를 shift
                    avg_array = [];
                    if( convert_value(value) === 2 ){
                        avg_result = 1
                    }
                    else{
                        avg_result = convert_value(value)
                    }
                    interval_blank = true;
                    interval_blank_start_time = current_time;
                }
                /****************************/
                else if(Number(common_min_time) === Number(current_time)){  // blank에 상관없이 시간 같으면 array에 푸쉬
                    interval_blank = false;
                    interval_blank_start_time = null;
                    avg_result = null;

                    interval_start = current_time;

                    if( convert_value(value) === 2 ){
                        avg_array.push(1)
                    }
                    else{
                        avg_array.push(convert_value(value))
                    }
                }
                /****************************/
                else if(Number(common_min_time) < Number(current_time)){      // 실질적 result 채우는 동작 부분

                    if(interval_blank === true){
                        for(var t = 0; t < CK_list.indexOf(convert_date_format(current_time)); t++){
                            parking_csv[CK_list[t]].push(avg_result)
                        }
                        interval_blank = false;
                        interval_blank_start_time = null;
                        avg_result = null;
                        avg_array = [];
                        interval_start = current_time;
                    }

                    if( (interval_blank === false) && (interval_start === current_time)){

                        if( convert_value(value) === 2 ){
                            avg_array.push(1)
                        }
                        else{
                            avg_array.push(convert_value(value))
                        }

                    }
                    else if( (interval_blank === false) && (CK_list.indexOf(convert_date_format(current_time)) - CK_list.indexOf(convert_date_format(interval_start)) === 1)){
                        avg_result = avg_cal(avg_array)
                        avg_array = [];
                        // console.log("206 line : ", parking_csv[convert_date_format(interval_start)])
                        parking_csv[convert_date_format(interval_start)].push(avg_result)
                        interval_start = current_time;

                        if( convert_value(value) === 2 ){
                            avg_array.push(1)
                        }
                        else{
                            avg_array.push(convert_value(value))
                        }

                    }
                    else if( (interval_blank === false) && (CK_list.indexOf(convert_date_format(current_time)) - CK_list.indexOf(convert_date_format(interval_start)) > 1)){
                        avg_result = avg_cal(avg_array) 
                        avg_array = [];
                        for(var t = CK_list.indexOf(convert_date_format(interval_start)); t < CK_list.indexOf(convert_date_format(current_time)); t++){
                            parking_csv[CK_list[t]].push(avg_result);
                        }
                        interval_start = current_time;

                        if( convert_value(value) === 2 ){
                            avg_array.push(1)
                        }
                        else{
                            avg_array.push(convert_value(value))
                        }
                    }

                    if(spot_state_length === check_length){ // spot의 마지막 부분
                    
                        if(csv_latest_time === current_time){
                            avg_result = avg_cal(avg_array)
                            avg_array = [];
                            parking_csv[convert_date_format(current_time)].push(avg_result)
                        }
                        else if(Number(csv_latest_time) > Number(current_time)){
                            avg_result = avg_cal(avg_array)
                            avg_array = [];
                            for(var t = CK_list.indexOf(convert_date_format(interval_start)); t < CK_list.length; t++){
                                parking_csv[CK_list[t]].push(avg_result);
                            }
                        }
                    }
                }
                /****************************/
            }
        }
    }
    catch(err){
        console.log("make_time_stamp_state - Error >> ", err);
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

let csv_avg_cal = (csv) =>{
    let time_Congestion = {};
    let csv_list = Object.keys(csv);
    for(var csv_count = 0; csv_count < csv_list.length; csv_count++){
        time_Congestion[csv_list[csv_count]] = (csv[csv_list[csv_count]].reduce(function add(sum, currValue){return sum + currValue;}))/(csv[csv_list[csv_count]].length).toFixed(3);
    }
    return time_Congestion
}

let convert_date_format = (input_date) => { //input_date format = yyyymmddhh
    let yy  = input_date.substr(0, 4)
    let mm  = input_date.substr(4, 2) 
    let dd  = input_date.substr(6, 2)
    let hh  = input_date.substr(8, 2)
    let out_date = `${yy}-${mm}-${dd} ${hh}:00:00`;
    return out_date
}


let make_time_stamp_obj = (common_min_time, csv_latest_time) => {
    let startDate = moment(common_min_time, 'YYYYMMDDHH');
    let endDate = moment(csv_latest_time, 'YYYYMMDDHH');

    let leapMonths = [];
    for (let d = startDate.clone().add(1, 'month'); d.isBefore(endDate); d.add(1, 'year')) {
        if (d.isLeapYear()) {
            leapMonths.push(d.month());
        }
    }
      
      // Loop through hours between start and end dates
    for (let d = startDate.toDate(); d <= endDate.toDate(); d.setHours(d.getHours() + 1)) {
        // Convert date to moment object
        const m = moment(d);
        // Skip leap month hours
        if (leapMonths.includes(m.month()) && m.date() === 29 && m.hour() === 23) {
            continue;
        }
        // Format date key as "yyyy-mm-dd hh:00:00"
        const key = m.format('YYYY-MM-DD HH:00:00');
        // Set value to null
        parking_csv[key] = [];
    }
    fs.writeFileSync("./parking_state_csv.json", JSON.stringify(parking_csv))
    // console.log(parking_csv);
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

make_init_parking_state();

// make_time_stamp_state();