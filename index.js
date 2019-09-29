const timestamp = require('time-stamp');
var conf = require('./config.js');
var request = require('request');
var mqtt = require('mqtt');
var _map = _buildMap(conf.monitor);
console.log('node-mqtt2fcm > starting... broker:', conf.broker.address);
var client = mqtt.connect(`mqtt://${conf.broker.address}`);
client.on('connect', function() {
    _mqttSubscribe();
    _error('Connected to broker');
});

client.on('message', function(topic, message) {
    message = message.toString();
    console.log('node-mqtt2fcm > mqtt.message', topic, message);

    if (_map[topic] != undefined) {
        _process(_map[topic], message);
    }
});

client.on('error', function(error) {
    console.log('node-mqtt2fcm > mqtt.error', error);
})

function _mqttSubscribe() {
    for (let i of conf.monitor) {
        client.subscribe(i.mqttTopic);
        console.log('node-mqtt2fcm > _mqttSubscribe()', i.mqttTopic);
    }
}

function _fcmPublish(topic, title, message) {
    var uri = 'https://fcm.googleapis.com/fcm/send';
    var body = {
        data: {
            title: title,
            message: JSON.stringify({
                timestamp: timestamp('DD/MM/YYYY-HH:mm:ss'),
                data: message
            })
        },
        to: `/topics/${topic}`
    }

    var options = {
        uri: uri,
        encoding: 'utf8',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${conf.fcm.serverKey}`
        },
        body: JSON.stringify(body)
    }

    console.log('node-mqtt2fcm > _fcmPublish(topic, message)', options);
    request.post(options, _onHttpRequest);
}

function _onHttpRequest(error, response, body) {
    if (response && response.statusCode) {
        switch (response.statusCode) {
            case 200:
                console.log('node-mqtt2fcm > _onHttpRequest(error, body)', error, body);
                break;
            default:
                _error('Http request error');
                break;
        }
    }
}

function _process(target, message) {
    let _value = message + "";
    if (target.mqttTarget.jsonData == true) {
        let _payload = JSON.parse(message);
        _value = _payload[target.mqttTarget.jsonKey];
        if (_value == undefined) {
            console.log('node-mqtt2fcm > _process(target, message) JSON Key not found!', target, message);
            _error('JSON Key not found!');
        }
    }

    switch (target.mqttTarget.triggerCondition) {
        case 'change':
            if (target.mqttTarget.currentValue == _value) {
                console.log('node-mqtt2fcm > _process(target, message) Value not changed!', target, message);
                return;
            }
            console.log('node-mqtt2fcm > _process(currentValue, message) Changed!', target.mqttTarget.currentValue, message);
            break;

        case 'always':
        default:
    }

    for (let i of target.mqttTarget.trigger) {
        console.log('node-mqtt2fcm > _process(target, message) Looking for trigger...', i.targetValue, _value);
        if (i.targetValue == _value) {
            console.log('node-mqtt2fcm > _process(target, message) Trigger match!', i.targetValue, _value);
            target.mqttTarget.currentValue = _value;
            i.fcmTitle = target.mqttTarget.fcmTitle;
            let _title = _templateProcess(i.fcmTitle, i);
            let _message = _templateProcess(i.fcmMessage, i);
            _fcmPublish(i.fcmTopic, _title, _message);
            return;
        }
    }
}

function _templateProcess(template, trigger) {
    let _position = _getTemplatePositions(template);
    while (_position.length > 1) {
        let _substr = template.substring(_position[0] + 1, _position[1]);
        switch (_substr) {
            case 'TITLE':
                template = template.replace('%TITLE%', trigger.fcmTitle);
                _position = _getTemplatePositions(template);
                break;

            default:
                break;
        }
    }
    return template;
}

function _getTemplatePositions(template) {
    let _position = [];
    let _index = 0;
    _index = template.indexOf('%', _index);
    while (_index >= 0) {
        _position.push(_index);
        _index = template.indexOf('%', _index + 1);
    }
    return _position;
}

function _buildMap(monitorArray) {
    var map = {};
    for (let i of monitorArray) {
        if (i.mqttTarget.triggerInitialValue != undefined) {
            //OSLL: Internally all parameters will be treat as String
            i.mqttTarget.currentValue = i.mqttTarget.triggerInitialValue + "";
            for (let t of i.mqttTarget.trigger) {
                t.targetValue = t.targetValue + "";
            }
        }
        map[i.mqttTopic] = i;
    }
    return map;
}

function _error(message) {
    _fcmPublish(conf.app.fcmErrorTopic, 'App', `FCM Sender - ${message}`);
}