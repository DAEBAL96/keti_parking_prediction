/*

conf by KETI_parking congestion data used by LoRa & Deep sensor congestion IPE under to CSE

plz set connext by oneM2M CSE & AE 

*/


var conf = {};
var cse = {};
var ae = {};
var cnt_arr = [];
var sub_arr = [];
var acp = {};

conf.useprotocol = 'http'; // select one for 'http' or 'mqtt' or 'coap' or 'ws'

conf.sim = 'disable'; // enable / disable

// build cse
cse.host        = '203.253.128.164';
cse.port        = '7579';
cse.name        = 'Mobius';
cse.id          = '/Mobius2';
cse.mqttport    = '1883';
cse.wsport      = '7577';

// build ae
ae.name         = 'keti_parking_congestion';
// ae.name         = z2m_conf.base_topic

ae.id           = 'S'+ae.name;

ae.parent       = '/' + cse.name;
ae.appid        = 'keti_parking_congestion';
ae.port         = '9727';
ae.bodytype     = 'json'; // select 'json' or 'xml' or 'cbor'
ae.tasport      = '3105';

let congestion_cnt_list = ["actual_all_congestion"]

// build cnt conf
var cnt_count = 0;
while (cnt_count < congestion_cnt_list.length){
    cnt_arr[cnt_count] = {};
    cnt_arr[cnt_count].parent = '/' + cse.name + '/' + ae.name;
    cnt_arr[cnt_count].name = congestion_cnt_list[cnt_count];
    cnt_count++;
}

acp.parent = '/' + cse.name + '/' + ae.name;
acp.name = 'acp-' + ae.name;
acp.id = ae.id;

conf.usesecure  = 'disable';

if(conf.usesecure === 'enable') {
    cse.mqttport = '8883';
}

conf.cse = cse;
conf.ae = ae;
conf.cnt = cnt_arr;
conf.sub = sub_arr;
conf.acp = acp;


module.exports = conf;
