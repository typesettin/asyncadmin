'use strict';
var repl = require('repl');
var Stream = require('stream');
var logger,
	socketForLogger,
	io = global.io,
	REPLIE = require('replie'),
	inputstream = {},
	outputstream = {},
	rooms = {},
	REPLIES = {};

var useSocketIOLogger = function () {
	var util = require('util'),
		winston = require('winston');

	io.on('connection', function (socket) {
		socketForLogger = socket;
		socketForLogger.emit('log', {
			level: 'level',
			msg: 'connection id: ' + socket.conn.id,
			meta: 'meta'
		});

		socket.on('createrepl', function (data) {
			if (REPLIES[data.apikey]) {
				socket.emit('log', {
					level: 'level',
					msg: 'already has reple and joining room connection id: ' + socket.conn.id,
				});
				rooms[socket.conn.id] = data.apikey;
				socket.join(data.apikey);
			}
			else {
				console.log('data.apikey', data.apikey);
				rooms[socket.conn.id] = data.apikey;
				inputstream[data.apikey] = new Stream();
				inputstream[data.apikey].readable = true;
				outputstream[data.apikey] = new Stream();
				outputstream[data.apikey].readable = true;

				outputstream[data.apikey].resume = function () {};
				outputstream[data.apikey].pause = function () {};
				inputstream[data.apikey].resume = function () {};
				inputstream[data.apikey].pause = function () {};

				outputstream[data.apikey].write = function (repl_data) {
					console.log('reple write', repl_data);
					if (repl_data) {
						io.sockets.to(data.apikey).emit('stdout', repl_data);
					}
				};
				REPLIES[data.apikey] = repl.start({
					prompt: '> ',
					input: inputstream[data.apikey],
					output: outputstream[data.apikey],
					ignoreUndefined: true
				});
				socket.join(data.apikey);
			}
		});

		socket.on('stdin', function (data) {
			inputstream[rooms[this.conn.id]].emit('data', data + '\r\n');
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
			if (io.engine && (meta.asyncadmin || msg.match(/asyncadmin/gi))) {
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

var get_replie_stats = function (req, res) {
	// console.log('io', io);
	io.to('yawetse').emit('stdout', 'test msg to yaw');
	res.send({
		REPLIES: Object.keys(REPLIES),
	});
};


var create_repl = function (req, res) {
	if (REPLIES[req.user.apikey]) {
		console.log('already has reple');
		res.send('ok');
	}
	else {
		console.log('req.user.apikey', req.user.apikey);
		inputstream[req.user.apikey] = new Stream();
		inputstream[req.user.apikey].readable = true;
		outputstream[req.user.apikey] = new Stream();
		outputstream[req.user.apikey].readable = true;
		REPLIES[req.user.apikey] = repl.start({
			prompt: '> ',
			input: inputstream[req.user.apikey],
			output: outputstream[req.user.apikey],
		});

		io.on('createrepl', function (data) {

		});
		// REPLIES[req.user.apikey] = new REPLIE({
		// 	prompt: 'REPLIE',
		// 	startServer: false,
		// 	connectionMessage: 'in the repl',
		// 	io_server: io,
		// 	modules: [{
		// 		name: 'shelljs',
		// 		type: 'external'
		// 	}, {
		// 		name: 'async',
		// 		type: 'external'
		// 	}],
		// 	// namespace: req.user.apikey,
		// 	room: req.user.username
		// });
		// setTimeout(function () {
		// 	res.send('ok');
		// }, 1000);
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
	useSocketIOLogger();
	return {
		get_replie_stats: get_replie_stats,
		create_repl: create_repl
			// getMarkdownReleases: getMarkdownReleases,
			// getHomepageStats: getHomepageStats,
			// adminExtSettings: adminExtSettings,
	};
};

module.exports = controller;
