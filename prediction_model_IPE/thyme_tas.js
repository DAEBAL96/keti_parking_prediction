/*
The module is built on top of "nCube_Thyme_Nodejs - TAS ver"
*/

global.socket_arr = {};

var tas_buffer = {};
exports.buffer = tas_buffer;


// for tas

let mqtt = require('mqtt');

/* USER CODE */
let setDataTopic = {
    // test: '/test/topic',
    actual_all_congestion: '/actual/noti'
};
/* */

let createConnection = () => {
    if (conf.tas.client.connected) {
        console.log('Already connected --> destroyConnection')
        destroyConnection();
    }

    if (!conf.tas.client.connected) {
        conf.tas.client.loading = true;
        const {host, port, endpoint, ...options} = conf.tas.connection;
        const connectUrl = `mqtt://${host}:${port}${endpoint}`
        try {
            conf.tas.client = mqtt.connect(connectUrl, options);

            conf.tas.client.on('connect', () => {
                console.log(host, 'Connection succeeded!');

                conf.tas.client.connected = true;
                conf.tas.client.loading = false;

                // for(let topicName in getDataTopic) {
                //     if(getDataTopic.hasOwnProperty(topicName)) {
                //         doSubscribe(getDataTopic[topicName]);
                //     }
                // }
            });

            conf.tas.client.on('error', (error) => {
                console.log('Connection failed', error);

                destroyConnection();
            });

            conf.tas.client.on('close', () => {
                console.log('Connection closed');

                destroyConnection();            });

            conf.tas.client.on('message', (topic, message) => {
                let content = null;
                let parent = null;

                /* USER CODES */

                let act = null;
           /* */
            });
        }
        catch (error) {
            console.log('mqtt.connect error', error);
            conf.tas.client.connected = false;
        }
    }
};

let destroyConnection = () => {
    if (conf.tas.client.connected) {
        try {
            if(Object.hasOwnProperty.call(conf.tas.client, '__ob__')) {
                conf.tas.client.end();
            }
            conf.tas.client = {
                connected: false,
                loading: false
            }
            console.log(this.name, 'Successfully disconnected!');
        }
        catch (error) {
            console.log('Disconnect failed', error.toString())
        }
    }
};


exports.ready_for_tas = function ready_for_tas () {
    createConnection();

    /* ***** USER CODE ***** */
    // if(conf.sim === 'enable') {
    //     let t_count = 0;
    //     setInterval(() => {
    //         let val = (Math.random() * 50).toFixed(1);
    //         doPublish('/thyme/co2', val);
    //     }, 5000, t_count);
    // }
    /* */
};
 
exports.send_to_tas = function send_to_tas (topicName, message) {       // LSTM model을 구동중이며 mqtt broker에 sub하기 위해 붙어있는 pred_module.py 쪽으로 mqtt message를 보냄  
    if(setDataTopic.hasOwnProperty(topicName)) {
        conf.tas.client.publish(setDataTopic[topicName], JSON.stringify(message))
        // conf.tas.client.publish(setDataTopic[topicName], message.toString())
    }
};