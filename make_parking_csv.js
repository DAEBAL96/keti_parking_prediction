const axios = require('axios');
const request = require('request');
const fs = require("fs");

request('url', function(error, response){
    
})



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
var parsing_start_day = "20230309" // rcn header value --> yyyymmdd 
                                   // cra=20230221T21  --> 이후 데이터 적측 시 T21에서 1씩 더해서 parsing_start_day값 넣으면 될 듯


var parking_conf_json = {};
var all_parking_hist = {};
var LoRa_spot_list = [];
var Deep_spot_list = [];

/*****************************************************************/



function make_all_parking_conf(){
    // parking_conf_json = JSON.parse(fs.readFileSync("./parking_conf.json", "utf-8"))
    parking_conf_json = JSON.parse(fs.readFileSync("./test_conf.json", "utf-8"))
    LoRa_spot_list = Object.keys(parking_conf_json["LoRa"])         // LoRa AE와
    Deep_spot_list = parking_conf_json["Deep"]                      // 딥러닝 AE에서 cin을 추출하기 위해 cnt list 생성
}


const make_parking_csv = async function(){
    try{
        var AIparking_state = {};
        make_all_parking_conf();

        for(var deep_spot_count = 0; deep_spot_count < Deep_spot_list.length; deep_spot_count++){
            url = cse_url + "/" + m2m_ae["Deep"] + "/" + Deep_spot_list[deep_spot_count] + "?rcn=4&ty=4&cra=" + parsing_start_day
            console.log(url)
            var response = await axios.get(url, {headers : m2m_header})

            if(Object.keys(response.data["m2m:rsp"]).length === 0){     // parsing_start_day 이후로 적측된 cin이 없음
                console.log("**", Deep_spot_list[deep_spot_count], "** spot's date state not exist")
            }

            else{
                for(var i=0; i < response.data["m2m:rsp"]["m2m:cin"].length; i++){
                    AIparking_state[response.data["m2m:rsp"]["m2m:cin"][i]["ct"]] = response.data["m2m:rsp"]["m2m:cin"][i]["con"];
                }
                all_parking_hist[Deep_spot_list[deep_spot_count]] = AIparking_state;
                console.log(Deep_spot_list[deep_spot_count]," Deep spot contain complete")
            }
        } 

        for(var LoRa_spot_count = 0; LoRa_spot_count < LoRa_spot_list.length; LoRa_spot_count++){
            url = cse_url + "/" + m2m_ae["LoRa"] + "/" + LoRa_spot_list[LoRa_spot_count] + "?rcn=4&ty=4&cra=" + parsing_start_day

            var response = await axios.get(url, {headers : m2m_header})

            if(Object.keys(response.data["m2m:rsp"]).length === 0){
                console.log("**",parking_conf_json["LoRa"][LoRa_spot_list[LoRa_spot_count]], "** spot's date state not exist")
            }

            else{
                for(var i=0; i < response.data["m2m:rsp"]["m2m:cin"].length; i++){
                    AIparking_state[response.data["m2m:rsp"]["m2m:cin"][i]["ct"]] = response.data["m2m:rsp"]["m2m:cin"][i]["con"]["parking"];
                }
                all_parking_hist[parking_conf_json["LoRa"][LoRa_spot_list[LoRa_spot_count]]] = AIparking_state;
                console.log(parking_conf_json["LoRa"][LoRa_spot_list[LoRa_spot_count]]," LoRa spot contain complete")
            }
        }

        // console.log(Object.keys(all_parking_hist))
        console.log(all_parking_hist)
        all_parking_hist = JSON.stringify(all_parking_hist)
        fs.writeFileSync("./parking_state.json", all_parking_hist)

    } catch(err){
        console.log("Error >> ", err);
    }

}

// const time_stamp = function ()


make_parking_csv();