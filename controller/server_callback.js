'use strict';

var logger,
	io = global.io;

var send_server_callback = function (options) {
	try {
		if (io && io.engine) {
			io.sockets.emit('server_callback', {
				functionName: options.functionName,
				functionData: options.functionData
			});
		}
	}
	catch (e) {
		logger.error('asyncadmin - send_server_callback e', e);
	}
};

/**
 * admin controller
 * @module authController
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:periodicjs.core.utilities
 * @requires module:periodicjs.core.controller
 * @requires module:periodicjs.core.extensions
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}          
 */
var controller = function (resources) {
	logger = resources.logger;
	return {
		send_server_callback: send_server_callback
	};
};

module.exports = controller;
