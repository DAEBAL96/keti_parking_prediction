var Onem2mClient = require('./onem2m_client');
var mqtt = require("mqtt");
const axios = require('axios');
const fs = require("fs");
const moment = require('moment');

/* set device control conf */

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

/***************************/

var options = {
    protocol: conf.useprotocol,
    host: conf.cse.host,
    port: conf.cse.port,
    mqttport: conf.cse.mqttport,
    wsport: conf.cse.wsport,
    cseid: conf.cse.id,
    aei: conf.ae.id,
    aeport: conf.ae.port,
    bodytype: conf.ae.bodytype,
    usesecure: conf.usesecure,
};

var onem2m_client = new Onem2mClient(options);

function ae_response_action(status, res_body, callback) {
    var aeid = res_body['m2m:ae']['aei'];
    conf.ae.id = aeid;
    callback(status, aeid);
}

function create_cnt_all(count, callback) {
    if(conf.cnt.length == 0) {
        callback(2001, count);
    }
    else {
        if(conf.cnt.hasOwnProperty(count)) {
            var parent = conf.cnt[count].parent;
            console.log("create_cnt_all - parent : ",parent)
            var rn = conf.cnt[count].name;
            console.log("create_cnt_all - rn : ", rn)
            onem2m_client.create_cnt(parent, rn, count, function (rsc, res_body, count) {
                if (rsc == 5106 || rsc == 2001 || rsc == 4105) {
                    create_cnt_all(++count, function (status, count) { 
                        callback(status, count);
                    });
                }
                else {
                    callback(9999, count);
                }
            });
        }
        else {
            callback(2001, count);
        }
    }
}

function delete_sub_all(count, callback) {
    if(conf.sub.length == 0) {
        callback(2001, count);
    }
    else {
        if(conf.sub.hasOwnProperty(count)) {
            var target = conf.sub[count].parent + '/' + conf.sub[count].name;
            onem2m_client.delete_sub(target, count, function (rsc, res_body, count) {
                if (rsc == 5106 || rsc == 2002 || rsc == 2000 || rsc == 4105 || rsc == 4004) {
                    delete_sub_all(++count, function (status, count) {
                        callback(status, count);
                    });
                }
                else {
                    callback(9999, count);
                }
            });
        }
        else {
            callback(2001, count);
        }
    }
}

function create_sub_all(count, callback) {
    if(conf.sub.length == 0) {
        callback(2001, count);
    }
    else {
        if(conf.sub.hasOwnProperty(count)) {
            var parent = conf.sub[count].parent;
            var rn = conf.sub[count].name;
            var nu = conf.sub[count].nu;
            onem2m_client.create_sub(parent, rn, nu, count, function (rsc, res_body, count) {
                if (rsc == 5106 || rsc == 2001 || rsc == 4105) {
                    create_sub_all(++count, function (status, count) {
                        callback(status, count);
                    });
                }
                else {
                    callback('9999', count);
                }
            });
        }
        else {
            callback(2001, count);
        }
    }
}

setTimeout(setup_resources, 100, 'crtae');

function setup_resources(_status) {
    sh_state = _status;
    
    console.log('[status] : ' + _status);

    if (_status === 'crtae') {
        onem2m_client.create_ae(conf.ae.parent, conf.ae.name, conf.ae.appid, function (status, res_body) {
            console.log(res_body);
            if (status == 2001) {
                ae_response_action(status, res_body, function (status, aeid) {
                    console.log('x-m2m-rsc : ' + status + ' - ' + aeid + ' <----');
                    request_count = 0;

                    setTimeout(setup_resources, 100, 'rtvae');
                });
            }
            else if (status == 5106 || status == 4105) {
                console.log('x-m2m-rsc : ' + status + ' <----');

                setTimeout(setup_resources, 100, 'rtvae');
            }
            else {
                console.log('[???} create container error!  ', status + ' <----');
                // setTimeout(setup_resources, 3000, 'crtae');
            }
        });
    }
    else if (_status === 'rtvae') {
        onem2m_client.retrieve_ae(conf.ae.parent + '/' + conf.ae.name, function (status, res_body) {
            if (status == 2000) {
                var aeid = res_body['m2m:ae']['aei'];
                console.log('x-m2m-rsc : ' + status + ' - ' + aeid + ' <----');

                if(conf.ae.id != aeid && conf.ae.id != ('/'+aeid)) {
                    console.log('AE-ID created is ' + aeid + ' not equal to device AE-ID is ' + conf.ae.id);
                }
                else {
                    request_count = 0;
                    setTimeout(setup_resources, 100, 'crtct');
                }
            }
            else {
                console.log('x-m2m-rsc : ' + status + ' <----');
                // setTimeout(setup_resources, 3000, 'rtvae');
            }
        });
    }
    else if (_status === 'crtct') {
        create_cnt_all(request_count, function (status, count) {
            if(status == 9999) {
                console.log('[???} create container error!');
                // setTimeout(setup_resources, 3000, 'crtct');
            }
            else {
                request_count = ++count;
                if (conf.cnt.length <= count) {
                    console.log(conf.cnt, "conf.cnt list out line")
                    request_count = 0;
                    setTimeout(setup_resources, 100, 'delsub');
                }
            }
        });
    }
    else if (_status === 'delsub') {
        delete_sub_all(request_count, function (status, count) {
            if(status == 9999) {
                console.log('[???} create container error!');
                // setTimeout(setup_resources, 3000, 'delsub');
            }
            else {
                request_count = ++count;
                if (conf.sub.length <= count) {
                    request_count = 0;
                    setTimeout(setup_resources, 100, 'crtsub');
                }
            }
        });
    }
    else if (_status === 'crtsub') {
        create_sub_all(request_count, function (status, count) {
            if(status == 9999) {
                console.log('[???} create container error!');
                // setTimeout(setup_resources, 1000, 'crtsub');
            }
            else {
                request_count = ++count;
                if (conf.sub.length <= count) {
                    // thyme_tas.ready_for_tas();

                    setTimeout(setup_resources, 100, 'crtci');
                }
            }
        });
    }
    else if (_status === 'crtci') {
        if(conf.sim == 'enable') {
            var period = 1000; //ms
            var cnt_idx = 0;
            setTimeout(timer_upload, 1000, period, cnt_idx);
        }
    }
}

/* oneM2M noti sub message action function

onem2m_client.on('notification', function (source_uri, cinObj) {

    console.log(source_uri, cinObj);

    var path_arr = source_uri.split('/')
    var event_cnt_name = path_arr[path_arr.length-2];
    var content = cinObj.con;
    console.log("event name = ",event_cnt_name )

});

*/


//----------------------- mqtt module start ---------------------- //

//---------------------------------------------------------------- //

var t_count = 0;

function timer_upload_action(cnt_idx, content, period) {
    if (sh_state == 'crtci') {
        var parent = conf.cnt[cnt_idx].parent + '/' + conf.cnt[cnt_idx].name;
        onem2m_client.create_cin(parent, cnt_idx, content, this, function (status, res_body, to, socket) {
            console.log('x-m2m-rsc : ' + status + ' <----');
        });

        setTimeout(timer_upload, 0, period, cnt_idx);
    }
    else {
        setTimeout(timer_upload, 1000, period, cnt_idx);
    }
}

function timer_upload(period, cnt_idx) {
    var content = JSON.stringify({value: 'TAS' + t_count++});
    setTimeout(timer_upload_action, period, cnt_idx, content, period);
}

/*********************************** request conf **************************************/

/***************************************************************************************/


function Hour_interval() {  // 1Hour interval function -> 
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
        make_init_parking_state(uploadtime)
        // upload_congestion(uploadtime);
        // make_init_parking_state()
        Hour_interval();
    }, delay);
}

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
    cin_obj["time_stamp"] = date_convert(upload_time)
    cin_obj["congestion"] = all_Congestion
    
    return cin_obj
}

const make_init_parking_state = async function(upload_time){
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
        upload_congestion(upload_time)
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

let date_convert = (input_date) => {   //input_date format yyyymmddhh
    let yy  = input_date.substr(0, 4)
    let mm  = input_date.substr(4, 2) 
    let dd  = input_date.substr(6, 2)
    let hh  = input_date.substr(8, 2)
    let out_date = `${yy}-${mm}-${dd} ${hh}:00:00`;
    return out_date     // output_date format 
}


// module.exports = make_init_parking_state("2023041210");

module.exports = Hour_interval();
