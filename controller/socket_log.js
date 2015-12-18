'use strict';
var Stream = require('stream');
var minimist = require('minimist');
var repl = require('repl');
var logger,
	socketForLogger,
	io = global.io,
	periodicResources,
	// REPLIE = require('replie'),
	replstream = {},
	replstream_last_msg = {},
	rooms = {},
	repl_users = {},
	repl_username_map = {},
	REPLIES = {};
// process.stdout.write('what');
var useSocketIOLogger = function () {
	var util = require('util'),
		winston = require('winston');

	var disconnectSocketHandler = function () {
		// console.log('disconnectSocketHandler this.conn.id', this.conn.id);
		var apikeyofconn = rooms[this.conn.id],
			otherconnid = [];
		delete rooms[this.conn.id];
		for (var k in rooms) {
			if (rooms[k] === apikeyofconn) {
				otherconnid.push(k);
			}
		}
		// console.log('otherconnid', otherconnid);
		if (otherconnid.length === 0) {
			delete repl_users[apikeyofconn];
			delete REPLIES[apikeyofconn];
			delete replstream_last_msg[apikeyofconn];
			delete repl_users[apikeyofconn];
			for (var x in repl_username_map) {
				if (repl_username_map[x] === apikeyofconn) {
					delete repl_username_map[x];
				}
			}
		}
	};

	io.on('connection', function (socket) {
		socketForLogger = socket;
		socketForLogger.emit('log', {
			level: 'info',
			msg: ' Type \'help\' for help. > ',
			// meta: 'meta'
		});

		socket.on('createrepl', function (data) {
			if (REPLIES[data.apikey]) {
				// socket.emit('log', {
				// 	level: 'info',
				// 	msg: 'already has reple and joining room connection id: ' + socket.conn.id + ' > ',
				// });
				rooms[socket.conn.id] = data.apikey;
				socket.join(data.apikey);
				replstream[data.apikey].write('reconnecting session > ');
			}
			else {
				console.log('data.apikey', data.apikey);
				repl_users[data.apikey] = data;
				repl_username_map[data.username] = data.apikey;
				rooms[socket.conn.id] = data.apikey;
				replstream[data.apikey] = new Stream();
				replstream[data.apikey].readable = true;

				replstream[data.apikey].resume = function () {};
				replstream[data.apikey].pause = function () {};

				replstream[data.apikey].write = function (repl_data) {
					console.log('reple write', repl_data);
					if (repl_data && replstream_last_msg[data.apikey] !== repl_data) {
						io.sockets.to(data.apikey).emit('stdout', repl_data);
						replstream_last_msg[data.apikey] = repl_data;
					}
				};
				REPLIES[data.apikey] = repl.start({
					prompt: '> ',
					input: replstream[data.apikey],
					output: replstream[data.apikey],
					ignoreUndefined: true
				});
				REPLIES[data.apikey].defineCommand('listUsers', {
					help: 'List All Logged In Users',
					action: function () {
						var msghtml = '<ul>';
						for (var x in repl_users) {
							msghtml += '<li>' + repl_users[x].username + '</li>';
						}
						msghtml += '</ul>';
						this.outputStream.write(msghtml);
						// io.sockets.to(data.apikey).emit('log', {
						// 	level: 'info',
						// 	msg: msghtml,
						// });
					}
				});
				REPLIES[data.apikey].defineCommand('listCommands', {
					help: 'List All Available Commands',
					action: function () {
						var listOfCommands = Object.keys(periodicResources.app.controller.extension.asyncadmin.cmd);
						var msghtml = '<p>example command:<br>"execCommand extension search cloud"</p>';
						msghtml += '<ul>';
						for (var l in listOfCommands) {
							msghtml += '<li>' + listOfCommands[l] + ' -> ' + Object.keys(periodicResources.app.controller.extension.asyncadmin.cmd[listOfCommands[l]]) + '</li>';
						}
						msghtml += '</ul>';
						this.outputStream.write(msghtml);
						// io.sockets.to(data.apikey).emit('log', {
						// 	level: 'info',
						// 	msg: msghtml,
						// });
					}
				});
				REPLIES[data.apikey].defineCommand('execCommand', {
					help: 'List All Available Commands',
					action: function (parameters) {
						var inputdata = parameters.split(' ');
						var ec;
						if (periodicResources.app.controller.extension.asyncadmin.cmd[inputdata[0]] && periodicResources.app.controller.extension.asyncadmin.cmd[inputdata[0]][inputdata[1]]) {

							ec = periodicResources.app.controller.extension.asyncadmin.cmd[inputdata[0]][inputdata[1]];

							ec.call(this, minimist(inputdata));
						}
						else {
							this.outputStream.write('INVALID ADMIN COMMAND');
						}

					}
				});

				socket.join(data.apikey);
			}
		});

		socket.on('stdin', function (data) {
			if (data.charAt(0) === '@') {
				var words = data.split(' ');
				var tousername = words[0].replace('@', '');
				var apikeyofusername = repl_username_map[tousername];
				var fromusername = repl_users[rooms[this.conn.id]].username;
				io.sockets.to(apikeyofusername).emit('log', {
					level: 'info',
					msg: fromusername + ': ' + data,
				});
				io.sockets.to(apikeyofusername).emit('server_callback', {
					functionName: 'showStylieAlert',
					functionData: {
						ttl: 8000,
						message: '<div style="text-align:left;"><p><strong>New Message Alert</strong></p> ' +
							'<p>Message from : ' + fromusername + '</p>' +
							'</div>'
					}
				});
			}
			else {
				if (data === 'help' || data === 'h' || data === '-h' || data === '--help') {
					data = '.help';
				}
				else if (data === 'clear') {
					data = '.clear';
				}
				else if (data === 'break') {
					data = '.break';
				}
				else if (data === 'listUsers') {
					data = '.listUsers';
				}
				else if (data === 'listCommands') {
					data = '.listCommands';
				}
				else if (data.substr(0, 11) === 'execCommand') {
					data = '.' + data;
				}
				replstream[rooms[this.conn.id]].emit('data', data + '\r\n');
			}
		});

		socket.on('disconnect', disconnectSocketHandler);
		socket.on('end', disconnectSocketHandler);
		socket.on('close', disconnectSocketHandler);
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
		streams: Object.keys(replstream),
		rooms: rooms,
		repl_users: repl_users,
		repl_username_map: repl_username_map,
	});
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
	periodicResources = resources;
	logger = resources.logger;
	useSocketIOLogger();
	return {
		get_replie_stats: get_replie_stats,
		// create_repl: create_repl
		// getMarkdownReleases: getMarkdownReleases,
		// getHomepageStats: getHomepageStats,
		// adminExtSettings: adminExtSettings,
	};
};

module.exports = controller;
