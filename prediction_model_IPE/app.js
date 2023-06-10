var Onem2mClient = require('./onem2m_client');
const mysql = require('mysql');
const fs = require('fs');

var thyme_tas = require('./thyme_tas');

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

/* model input data init -> Mobius(CSE)'s db storage(mysql) connection */

const connection = mysql.createConnection({
    host: '203.253.128.164',
    user: 'root',
    password: 'keti1234',
    database: 'mobiusdb'
});

connection.connect((err) => {   // db connect function
    if (err) throw err;
    console.log('Connected to the database!');
});

async function exportData() { // limit set -> LSTM input lack 길이만큼 Mobius resource db에서 lack 끌어오도록 query 설정 후 resource data export
    let query = `select c.pi, c.ri, c.con, l.ct from mobiusdb.cin as c, mobiusdb.lookup as l where c.ri = l.ri and c.pi = '/Mobius/keti_parking_congestion/actual_all_congestion' ORDER BY l.ct DESC LIMIT 10`;

    let results = await new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    fs.writeFile(`./act_congestion_latest10.json`, JSON.stringify(results), (err) => {
        if (err) throw err;
        console.log(`Data exported to act_congestion_10.json file.`);
    });
    
    connection.end((err) => {
        if (err) throw err;
        console.log('Connection closed.');
    });
}

/* */

global.onem2m_client = new Onem2mClient(options);

let input_data_conf = {
    init: true,
    look_back: 10
}


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
            var rn = conf.cnt[count].name;
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
        console.log("not sub");
        callback(2001, count);
    }
    else {
        console.log("sub ok : ",conf.sub);
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

setTimeout(setup_resources, 100, 'crtae');  // set oneM2M resource flow (start - crtae)

function setup_resources(_status) {
    sh_state = _status;

    console.log('[status] : ' + _status);

    if (_status === 'crtae') {
        onem2m_client.create_ae(conf.ae.parent, conf.ae.name, conf.ae.appid, function (status, res_body) {
            // console.log(res_body);
            if (status == 2001) {
                ae_response_action(status, res_body, function (status, aeid) {
                    // console.log('x-m2m-rsc : ' + status + ' - ' + aeid + ' <----');
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
                    thyme_tas.ready_for_tas();

                    setTimeout(setup_resources, 100, 'crtci');
                }
            }
        });
    }
    else if (_status === 'crtci') {
    }
}

exportData() // latest data export at CSE's Mysql db storage
onem2m_client.on('notification', function (source_uri, cinObj) {

    console.log(source_uri, cinObj);

    var path_arr = source_uri.split('/')
    var event_cnt_name = path_arr[path_arr.length-2];
    var content = cinObj.con;
    console.log("event name = ", event_cnt_name);

    /* actual congestion sub noti  */

    if(event_cnt_name === 'actual_all_congestion') {
        console.log("actual_all_congestion noti app.js @@@@@@@@@@@@@@@@@@@@@@")
        thyme_tas.send_to_tas(event_cnt_name, content);
    }

    // if(event_cnt_name === 'test') {
    //     console.log("test noti app.js ")
    //     if(input_data_conf["init"]){
    //         exportData()
    //         input_data_conf["init"] = false;
    //         thyme_tas.send_to_tas(event_cnt_name, content);
    //     }
    //     else{
    //         thyme_tas.send_to_tas(event_cnt_name, content);
    //     }
    // }

    /* */
});