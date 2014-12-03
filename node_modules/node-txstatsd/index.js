"use strict";
/**
 * Modified version of https://github.com/sivy/node-statsd/ for WMF specific
 * txstatsd constraints.
 *
 * We've removed increment/decrement and nullified the sets function if operating
 * in txstatsd mode.
 *
 * Original license to node-statsd:
 *
 * Copyright 2011 Steve Ivy. All rights reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * @type {exports}
 */

var dgram = require('dgram'),
	dns   = require('dns');

/**
 * The UDP Client for StatsD
 * @param options
 *   @option host      {String}  The host to connect to default: localhost
 *   @option port      {String|Integer} The port to connect to default: 8125
 *   @option prefix    {String}  An optional prefix to assign to each stat name sent
 *   @option suffix    {String}  An optional suffix to assign to each stat name sent
 *   @option txstatsd  {boolean} An optional boolean that if true swaps counters for meters
 *   @option globalize {boolean} An optional boolean to add "statsd" as an object in the global namespace
 *   @option cacheDns  {boolean} An optional option to only lookup the hostname -> ip address once
 *   @option mock      {boolean} An optional boolean indicating this Client is a mock object, no stats are sent.
 * @constructor
 */
var Client = function (host, port, prefix, suffix, txstatsd, globalize, cacheDns, mock) {
	var options = host || {},
		self = this;

	if(arguments.length > 1 || typeof(host) === 'string'){
		options = {
			host      : host,
			port      : port,
			prefix    : prefix,
			suffix    : suffix,
			txstatsd  : txstatsd,
			globalize : globalize,
			cacheDns  : cacheDns,
			mock      : mock === true
		};
	}

	this.host   = options.host || 'localhost';
	this.port   = options.port || 8125;
	this.prefix = options.prefix || '';
	this.suffix = options.suffix || '';
	this.txstatsd = options.txstatsd || false;
	this.socket = dgram.createSocket('udp4');
	this.mock   = options.mock;


	if(options.cacheDns === true){
		dns.lookup(options.host, function(err, address, family){
			if(err === null){
				self.host = address;
			}
		});
	}

	if(options.globalize){
		global.statsd = this;
	}
};

/**
 * Represents the timing stat
 * @param stat {String|Array} The stat(s) to send
 * @param time {Number} The time in milliseconds to send
 * @param sampleRate {Number} The Number of times to sample (0 to 1)
 * @param callback {Function} Callback when message is done being delivered. Optional.
 */
Client.prototype.timing = function (stat, time, sampleRate, callback) {
	this.sendAll(stat, time, 'ms', sampleRate, callback);
};

/**
 * Increments a stat by a specified amount
 * @param stat {String|Array} The stat(s) to send
 * @param value The value to send
 * @param sampleRate {Number} The Number of times to sample (0 to 1)
 * @param callback {Function} Callback when message is done being delivered. Optional.
 */
Client.prototype.increment = function (stat, value, sampleRate, callback) {
	var type = this.txstatsd ? 'm' : 'c';
	this.sendAll(stat, value || 1, type, sampleRate, callback);
};

/**
 * Gauges a stat by a specified amount
 * @param stat {String|Array} The stat(s) to send
 * @param value The value to send
 * @param sampleRate {Number} The Number of times to sample (0 to 1)
 * @param callback {Function} Callback when message is done being delivered. Optional.
 */
Client.prototype.gauge = function (stat, value, sampleRate, callback) {
	this.sendAll(stat, value, 'g', sampleRate, callback);
};

/**
 * Counts unique values by a specified amount
 * @param stat {String|Array} The stat(s) to send
 * @param value The value to send
 * @param sampleRate {Number} The Number of times to sample (0 to 1)
 * @param callback {Function} Callback when message is done being delivered. Optional.
 */
Client.prototype.unique =
	Client.prototype.set = function (stat, value, sampleRate, callback) {
		this.sendAll(stat, value, 's', sampleRate, callback);
	};

/**
 * Checks if stats is an array and sends all stats calling back once all have sent
 * @param stat {String|Array} The stat(s) to send
 * @param value The value to send
 * @param sampleRate {Number} The Number of times to sample (0 to 1)
 * @param callback {Function} Callback when message is done being delivered. Optional.
 */
Client.prototype.sendAll = function(stat, value, type, sampleRate, callback){
	var completed = 0,
		calledback = false,
		sentBytes = 0,
		self = this;

	/**
	 * Gets called once for each callback, when all callbacks return we will
	 * call back from the function
	 * @private
	 */
	function onSend(error, bytes){
		completed += 1;
		if(calledback || typeof callback !== 'function'){
			return;
		}

		if(error){
			calledback = true;
			return callback(error);
		}

		sentBytes += bytes;
		if(completed === stat.length){
			callback(null, sentBytes);
		}
	}

	if(Array.isArray(stat)){
		stat.forEach(function(item){
			self.send(item, value, type, sampleRate, onSend);
		});
	} else {
		this.send(stat, value, type, sampleRate, callback);
	}
};

/**
 * Sends a stat across the wire
 * @param stat {String|Array} The stat(s) to send
 * @param value The value to send
 * @param type {String} The type of message to send to statsd
 * @param sampleRate {Number} The Number of times to sample (0 to 1)
 * @param callback {Function} Callback when message is done being delivered. Optional.
 */
Client.prototype.send = function (stat, value, type, sampleRate, callback) {
	var message = this.prefix + stat + this.suffix + ':' + value + '|' + type,
		buf;

	if(sampleRate && sampleRate < 1){
		if(Math.random() < sampleRate){
			message += '|@' + sampleRate;
		} else {
			//don't want to send if we don't meet the sample ratio
			return;
		}
	}

	// Only send this stat if we're not a mock Client.
	if(!this.mock) {
		buf = new Buffer(message);
		this.socket.send(buf, 0, buf.length, this.port, this.host, callback);
	} else {
		if(typeof callback === 'function'){
			callback(null, 0);
		}
	}
};

module.exports = Client;
