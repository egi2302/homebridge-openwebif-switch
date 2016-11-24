var Service, Characteristic;

const ping = require('./hostportconnectable');
const request = require('request');

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-openwebif-switch", "OpenWebifSwitch", OpenWebifSwitchAccessory);
}

function OpenWebifSwitchAccessory(log, config) {
	this.log = log;
	
	this.name = config["name"];

	//required
	this.host = config["host"];
	this.port = config["port"] || 80;
}

OpenWebifSwitchAccessory.prototype = {

	setPowerState: function (powerOn, callback) {
		if (!this.host) {
			callback(new Error("No host defined."));
		}
		if (!this.port) {
			callback(new Error("No port defined."));
		}

		var me = this;
		me.log('Power state change request: ', powerOn);

		ping.checkHostIsReachable(this.host, this.port, function(reachable) {
			if (reachable) {
				//{"instandby": false, "result": true}
				me._httpRequest("http://" + me.host + ":" + me.port + "/api/powerstate?newstate=" + (powerOn ? "0" : "0"), '', 'GET', function(error, response, responseBody) {
					if (error) {
						me.log('setPowerState() failed: %s', error.message);
						callback(error, false);
					} else {
						try {
							me.log('setPowerState() succeded');
							var result = JSON.parse(responseBody);
							var powerOn = result.inStandby == "false";

							me.log('power is currently %s', powerOn ? 'ON' : 'OFF');
							callback(null, powerOn);
						} catch (e) {
							me.log('Error  %s', powerOn ? 'ON' : 'OFF');
							callback(e, null);
						}
					}
				}.bind(this));
			} else {
				callback(null, powerOn ? false : true); //totally off ->
			}
		});

	},

	getPowerState: function (callback) {
		if (!this.host) {
			callback(new Error("No host defined."));
		}
		if (!this.port) {
			callback(new Error("No port defined."));
		}

		var me = this;

		ping.checkHostIsReachable(this.host, this.port, function(reachable) {
			if (reachable) {
				me._httpRequest("http://" + me.host + ":" + me.port + "/api/statusinfo", '', 'GET', function(error, response, responseBody) {
					if (error) {
						me.log('getPowerState() failed: %s', error.message);
						callback(error);
					} else {
						try {
							var result = JSON.parse(responseBody);
							var powerOn = result.inStandby == "false";
							me.log('power is currently %s', powerOn ? 'ON' : 'OFF');
							callback(null, powerOn);
						} catch (e) {
							callback(e, null);
							me.log('error parsing: ' + e);
						}
					}
				}.bind(this));
			} else {
				callback(null, false); //totally off
			}
		});
	},

	identify: function (callback) {
		this.log("Identify requested!");
		callback();
	},

	getServices: function () {
		var informationService = new Service.AccessoryInformation();
		informationService
			.setCharacteristic(Characteristic.Manufacturer, "alex224")
			.setCharacteristic(Characteristic.Model, "433Mhz Send Module")
			.setCharacteristic(Characteristic.SerialNumber, "Send433 Serial Number");

		this.switchService = new Service.Switch(this.name);
		this.switchService
			.getCharacteristic(Characteristic.On)
			.on('get', this.getPowerState.bind(this))
			.on('set', this.setPowerState.bind(this));
		return [informationService, this.switchService];
	},

	_httpRequest: function(url, body, method, callback) {
        request({
            url: url,
            body: body,
            method: method,
            rejectUnauthorized: false
        },
        function(error, response, body) {
            callback(error, response, body);
        });
    },
};