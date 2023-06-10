/*

conf by predictive model & pred congestion IPE under to CSE

plz set connext by oneM2M CSE & AE 

*/


var ip = require("ip");
let { nanoid } = require("nanoid");

var conf = {};
var cse = {};
var ae = {};
var cnt_arr = [];
var sub_arr = [];
var acp = {};

conf.useprotocol = 'http'; // select one for 'http' or 'mqtt' or 'coap' or 'ws'

conf.sim = 'disable'; // enable or disable

// build cse
cse = {
    host    : '203.253.128.164',
    port    : '7579',
    name    : 'Mobius',
    id      : '/Mobius2',
    mqttport: '1883',
    wsport  : '7577',
};

// build ae
let ae_name = 'keti_parking_congestion';

ae = {
    name    : ae_name,
    id      : 'S'+ae_name,
    parent  : '/' + cse.name,
    appid   : ae_name,
    port    : '9727',
    bodytype: 'json',
    tasport : '3105',
};

// build cnt
var count = 0;
cnt_arr = [
    {
        parent: '/' + cse.name + '/' + ae.name,
        name: 'predicted_all_congestion'
    },
    {
        parent: '/' + cse.name + '/' + ae.name,
        name: 'actual_all_congestion'
    }
    // {
    //     parent: '/' + cse.name + '/' + ae.name,
    //     name: 'test'
    // }
];

// build sub
sub_arr = [
    {
        parent: cnt_arr[1].parent + '/'  + cnt_arr[1].name,
        name: 'actual_sub',
        nu: 'mqtt://' + cse.host + ':' + cse.mqttport + '/' + ae.id + '?ct=json', // 'http:/' + ip.address() + ':' + ae.port + '/noti?ct=json',
    }
    // {
    //     parent: cnt_arr[2].parent + '/'  + cnt_arr[2].name,
    //     name: 'test_sub',
    //     nu: 'mqtt://' + cse.host + ':' + cse.mqttport + '/' + ae.id + '?ct=json', // 'http:/' + ip.address() + ':' + ae.port + '/noti?ct=json',
    // }
];

// for tas
let tas = {
    client: {
        connected: false,
    },
    connection: {
        host: 'localhost',
        port: 1883,
        endpoint: '',
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 4000,
        clientId: 'thyme_' + nanoid(15),
        username: 'keti_thyme',
        password: 'keti_thyme',
    },
};

// build acp: not complete
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
conf.tas = tas;

module.exports = conf;
