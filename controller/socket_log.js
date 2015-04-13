'use strict';

var async = require('async'),
	path = require('path'),
	Utilities = require('periodicjs.core.utilities'),
	Controller = require('periodicjs.core.controller'),
	Extensions = require('periodicjs.core.extensions'),
	ExtensionCore = new Extensions({
		extensionFilePath: path.resolve(process.cwd(), './content/config/extensions.json')
	}),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	socketForLogger,
	appenvironment,
	adminExtSettings;

var useSocketIOLogger = function (resources) {
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
		// console.log('socket', socket);
	});
	// // var cfg = require('./config.json');
	// var tw = require('node-tweet-stream')(cfg);
	// tw.track('socket.io');
	// tw.track('javascript');
	// tw.on('tweet', function(tweet){
	//   io.emit('tweet', tweet);
	// });
	var CustomLogger = winston.transports.CustomLogger = function (options) {
		//
		// Name this logger
		//
		this.name = 'customLogger';

		//
		// Set the level from your options
		//
		this.level = options.level || 'silly';

		//
		// Configure your storage backing as you see fit
		//
	};

	//
	// Inherit from `winston.Transport` so you can take advantage
	// of the base functionality and `.handleExceptions()`.
	//
	util.inherits(CustomLogger, winston.Transport);

	CustomLogger.prototype.log = function (level, msg, meta, callback) {
		// console.log('CustomLogger level, msg, meta:', level, msg, meta);
		// console.log('socketForLogger', socketForLogger);
		if (socketForLogger) {
			console.log('socketForLogger', socketForLogger);
			socketForLogger.broadcast.emit('log', {
				level: level,
				msg: msg,
				meta: meta
			});

		}
		//
		// Store this message and metadata, maybe use some custom logic
		// then callback indicating success.
		//
		// callback(null, true);
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
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	appenvironment = appSettings.application.environment;
	CoreController = new Controller(resources);
	CoreUtilities = new Utilities(resources);
	// Collection = mongoose.model('Collection');
	adminExtSettings = resources.app.controller.extension.admin.adminExtSettings;

	useSocketIOLogger(resources);

	return {
		// admin_index: admin_index,
		// getMarkdownReleases: getMarkdownReleases,
		// getHomepageStats: getHomepageStats,
		// adminExtSettings: adminExtSettings,
	};
};

module.exports = controller;
