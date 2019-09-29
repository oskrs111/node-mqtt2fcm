module.exports = {
    //@broker: MQTT broker IP address and port.
	broker: {
        port: 1883,
        address: '127.0.0.1'
    },

    //@mqtt: Standard MQTT options for NODE 'mqtt' module. 
	//		 Check https://github.com/mqttjs/MQTT.js for details.
	mqtt: {
        options: {
            qos: 1,
            retain: true,
            dup: false
        }
    },

    //@app: Application configurations
	app: {        
		//@fcmErrorTopic: Topic where publish application specific errors. 
		fcmErrorTopic: 'fcm_topic_one'
    },

    //@fcm: Firebase Cloud Messaging configuration.
	fcm: {
		//@serverKey: This is the 'Server Key' from:
		//			  https://console.firebase.google.com >>> 'Your Firebase projects' >>>
		//			  YOUR_PROJECT_NAME >>> 'Project Overview' >>> 'Project settings' >>> 
		//  		  'Settings'['Cloud Messaging']['Project credentials']['Key']['Server key'].Token 
        serverKey: 'your_fcm_Server_key_Token'
    },

	//@monitor: Array of MQTT topics and its configuration to monitorize.
    monitor: [{
		
        //@mqttTopic: Single target MQTT topic.
		mqttTopic: 'your/mqtt/device/topic/path',
		
		//@mqttTarget: Target configuration.
        mqttTarget: {
			
            //@jsonData: Enables or disables JSON MQTT payload support. 
			jsonData: true,
            
			//@jsonKey: For JSON payloads define key where value is transported, {key: value}. 
			//			Otherwise RAW MQTT payload will evaluate for each @trigger.targetValue
			jsonKey: 'state', 
            
			//@triggerInitialValue: To ensure first update will launch the notification if fcmPublishCondition is set as 'change'
			triggerInitialValue: 'default', 
            
			//@triggerCondition: Allowed values are 'change' | 'always'
			triggerCondition: 'always', 
            
			//@trigger: Condition list that may produce a FCM notification.
			trigger: [{
				//@targetValue: MQTT payload value to evaluate as condition.
                targetValue: 'ON',
				
				//@fcmTopic: FCM topic to publish this state.
                fcmTopic: 'fcm_topic_one',
				
				//@fcmMessage: FCM body content. It allows a simple templating to include a string from:
				//			   @fcmTitle: Include %TITLE% on message string.
                fcmMessage: '%TITLE% - ON'
            }, {
                targetValue: 'OFF',
                fcmTopic: 'fcm_topic_one',
                fcmMessage: '%TITLE% - OFF'
            }],
			//@fcmTitle: Source string for %TITLE% templating element.
            fcmTitle: 'Your title for that topic',
        }
    }]
};