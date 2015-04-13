'use strict';

var logger,
	socketForLogger;

var useSocketIOLogger = function () {
	var util = require('util'),
		winston = require('winston'),
		io = require('socket.io')(8785, {
			logger: {
				debug: logger.debug,
				info: logger.info,
				error: logger.error,
				warn: logger.warn
			}
		});

	io.on('connection', function (socket) {
		socketForLogger = socket;
		socketForLogger.emit('log', {
			level: 'level',
			msg: 'msg',
			meta: 'meta'
		});
	});
	var CustomLogger = winston.transports.CustomLogger = function (options) {
		// Name this logger
		this.name = 'customLogger';
		// Set the level from your options
		this.level = options.level || 'silly';
	};
	util.inherits(CustomLogger, winston.Transport);

	CustomLogger.prototype.log = function (level, msg, meta, callback) {
		try {
			// console.log('CustomLogger level, msg, meta:', level, msg, meta);
			if (socketForLogger) {
				// console.log('socketForLogger.conn.server.clientsCount', socketForLogger.conn.server.clientsCount);
				io.sockets.emit('log', {
					level: level,
					msg: msg,
					meta: meta
				});
			}
			callback(null, true);
		}
		catch (e) {
			logger.error('useSocketIOLogger e', e);
			callback(e, null);
		}
	};
	logger.add(CustomLogger, {});
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
	useSocketIOLogger();
	return {
		// admin_index: admin_index,
		// getMarkdownReleases: getMarkdownReleases,
		// getHomepageStats: getHomepageStats,
		// adminExtSettings: adminExtSettings,
	};
};

module.exports = controller;
