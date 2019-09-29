# node-mqtt2fcm
Node.js based application to generate Push Notifications triggered by MQTT events.


# Application configuration (config.js)
This application is entirely configured on a single file named **config.js**.
*TEMPLATE.config.js* file with a basic structure is provided. 


> **@broker:** MQTT broker IP address and port.
	
> **@mqtt:** Standard MQTT options for NODE 'mqtt' module.\
			 Check https://github.com/mqttjs/MQTT.js for details.
	
> **@app:** Application specific configurations:	
>> **@fcmErrorTopic:** Topic where publish application specific errors. 
	
> **@fcm:** Firebase Cloud Messaging configuration.	
>> **@serverKey:** This is the 'Server Key' from:\
https://console.firebase.google.com >>> 'Your Firebase projects' >>> \
YOUR_PROJECT_NAME >>> 'Project Overview' >>> 'Project settings' >>> \ 
'Settings'['Cloud Messaging']['Project credentials']['Key']['Server key'].Token 
    
> **@monitor:** Array of MQTT topics and its configuration to monitorize.    
>> **@mqttTopic:** Single target MQTT topic.	
>> **@mqttTarget:** Target configuration.    			
>>> **@jsonData:** Enables or disables JSON MQTT payload support.             
>>> **@jsonKey:** For JSON payloads define key where value is transported, {key: value}.\ 
Otherwise RAW MQTT payload will evaluate for each @trigger.targetValue
>>> **@triggerInitialValue:** To ensure first update will launch the notification if fcmPublishCondition is set as 'change'
>>> **@triggerCondition:** Allowed values are 'change' | 'always'
>>> **@trigger:** Condition list that may produce a FCM notification for this topic.	
>>>> **@targetValue:** MQTT payload value to evaluate as condition.   		
>>>> **@fcmTopic:** FCM topic to publish this state.    			
>>>> **@fcmMessage:** FCM body content. It allows a simple templating to include a string from:\
*@mqttTarget.fcmTitle:* Include %TITLE% on message string.

>>> **@fcmTitle:** Source string for %TITLE% templating element.
