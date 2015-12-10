'use strict';

var path = require('path'),
	// request = require('superagent'),
	async = require('async'),
	fs = require('fs-extra'),
	npm = require('npm'),
	os = require('os'),
	semver = require('semver'),
	str2json = require('string-to-json'),
	merge = require('utils-merge'),
	CronJob = require('cron').CronJob,
	admin_ext_settings,
	CoreUtilities,
	CoreController,
	CoreExtension,
	CoreMailer,
	appSettings,
	dbSettings,
	mongoose,
	AppDBSetting,
	appenvironment,
	logger,
	restartfile = path.join(process.cwd(), '/content/config/restart.json'),
	changedemailtemplate,
	io = global.io;


/**
 * send setting update email
 * @param  {object} options - contains email options and nodemailer transport
 * @param  {Function} callbackk async callback
 */
var sendSettingEmail = function (options, callback) {
	if (appSettings.adminnotificationemail_bcc) {
		options.adminnotificationemail_bcc = appSettings.adminnotificationemail_bcc;
	}
	console.log({
		to: appSettings.adminnotificationemail,
		cc: options.user.email,
		bcc: options.adminnotificationemail_bcc,
		from: appSettings.serverfromemail,

	});
	CoreMailer.sendEmail({
		appenvironment: appenvironment,
		to: appSettings.adminnotificationemail,
		cc: options.user.email,
		bcc: options.adminnotificationemail_bcc,
		replyTo: options.replyTo,
		generatetextemail: true,
		// replyTo: 'Promise Financial [Do Not Reply] <no-reply@promisefin.com>',
		from: appSettings.serverfromemail,
		subject: (options.subject) ? options.subject : appSettings.name + ' -Admin Email Notification',
		// bcc: ilsConfig.emailtosalesforce,
		emailtemplatefilepath: options.emailtemplate,
		emailtemplatedata: options.emaildata
	}, function (err, emailstatus) {
		if (err) {
			CoreController.logError({
				err: err,
				req: options.req
			});
		}
		else {
			logger.debug('settings change email sent', emailstatus);
		}
		if (callback) {
			callback(err, emailstatus);
		}
	});
};

/**
 * restarts application response handler and send notification email
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var restart_app = function (req, res) {
	CoreController.handleDocumentQueryRender({
		req: req,
		res: res,
		redirecturl: '/p-admin/settings',
		responseData: {
			result: 'success',
			data: 'restarted'
		}
	});
	var d = new Date();
	sendSettingEmail({
		user: req.user,
		emaildata: {
			user: req.user,
			hostname: req.headers.host,
			appname: appSettings.name,
			appenvironment: appSettings.application.environment,
			appport: appSettings.application.port,
			settingmessage: 'Your application was restarted from the admin interface - ' + d,
		},
		subject: appSettings.name + '[env:' + appSettings.application.environment + '] Application Restart Notification',
		emailtemplate: changedemailtemplate,
	}, function (err, status) {
		CoreUtilities.restart_app({
			restartfile: restartfile
		});
		if (err) {
			logger.error(err);
		}
		else {
			console.info('email status', status);
		}
	});
};

/**
 * placeholder response for updating application
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var update_app = function (req, res) {
	CoreController.handleDocumentQueryRender({
		req: req,
		res: res,
		redirecturl: '/p-admin/settings',
		responseData: {
			result: 'success',
			data: 'restarted'
		}
	});
};

/**
 * load the extensions configuration files from the installed config folder in content/config/extensions/[extension]/[config files]
 * @param  {object}   req
 * @param  {object}   res
 * @param  {Function} next
 */
var load_extension_settings = function (req, res, next) {
	var extname = req.params.id,
		ext_default_config_file_path = path.resolve(process.cwd(), 'node_modules/', extname, 'config'),
		ext_installed_config_file_path = path.resolve(process.cwd(), 'content/config/extensions/', extname);

	/**
	 * load config files into array of filejson
	 * @param  {Function} callback async callbackk
	 * @return {array}            array of file data objects
	 */
	var loadconfigfiles = function (callback) {
		var configfilesJSON = [];
		fs.readdir(ext_installed_config_file_path, function (err, configfiles) {
			if (configfiles && configfiles.length > 0) {
				async.each(configfiles, function (configFile, cb) {
					if (path.extname(configFile) === '.json') {
						fs.readJson(path.resolve(ext_installed_config_file_path, configFile), function (err, data) {
							if (err) {
								cb(err);
							}
							else {
								configfilesJSON.push({
									name: configFile,
									filedata: data
								});
								cb(null);
							}
						});
					}
					else {
						fs.readFile(path.resolve(ext_installed_config_file_path, configFile), 'utf8', function (err, data) {
							if (err) {
								cb(err);
							}
							else {
								configfilesJSON.push({
									name: configFile,
									filedata: data
								});
								cb(null);
							}
						});
					}
				}, function (err) {
					if (err) {
						callback(err);
					}
					else {
						callback(null, configfilesJSON);
					}
				});
			}
			else {
				callback(null, configfilesJSON);
			}
		});
	};

	req.controllerData = (req.controllerData) ? req.controllerData : {};


	async.waterfall([
			function (cb) {
				cb(null, {
					ext_default_config_file_path: ext_default_config_file_path,
					ext_installed_config_file_path: ext_installed_config_file_path
				});
			},
			CoreExtension.getExtensionConfigFiles,
			CoreExtension.copyMissingConfigFiles,
			loadconfigfiles
		],
		function (err, result) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				// console.log('err', err, 'result', result);
				req.controllerData.extconfigfiles = result;
				next();
			}
		});
};

/**
 * save data from theme page post
 * @param  {object} req
 * @param  {object} res
 */
var update_theme_filedata = function (req, res) {
	var updateThemeFileData = CoreUtilities.removeEmptyObjectValues(req.body),
		themeconffile = path.resolve(process.cwd(), 'content/themes/', updateThemeFileData.themename, updateThemeFileData.filename),
		jsonParseError;
	delete updateThemeFileData._csrf;

	try {
		updateThemeFileData.filedata = (path.extname(updateThemeFileData.filename) === '.json') ? JSON.parse(updateThemeFileData.filedata) : updateThemeFileData.filedata;
	}
	catch (e) {
		jsonParseError = e;
	}

	if (path.extname(updateThemeFileData.filename) === '.json') {
		logger.warn('write json');
		fs.writeJson(themeconffile, updateThemeFileData.filedata, function (err) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else if (jsonParseError) {
				CoreController.handleDocumentQueryErrorResponse({
					err: 'JSON Parse Error: ' + jsonParseError,
					res: res,
					req: req
				});
			}
			else {
				CoreController.handleDocumentQueryRender({
					req: req,
					res: res,
					redirecturl: '/p-admin/theme/' + updateThemeFileData.themename,
					responseData: {
						result: 'success',
						data: 'updated theme file and restarted application'
					},
					callback: function () {
						CoreUtilities.restart_app({
							restartfile: restartfile
						});
					}
				});
			}
		});
	}
	else {
		logger.warn('write file');
		fs.outputFile(themeconffile, updateThemeFileData.filedata, function (err) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else if (jsonParseError) {
				CoreController.handleDocumentQueryErrorResponse({
					err: 'JSON Parse Error: ' + jsonParseError,
					res: res,
					req: req
				});
			}
			else {
				CoreController.handleDocumentQueryRender({
					req: req,
					res: res,
					redirecturl: '/p-admin/theme/' + updateThemeFileData.themename,
					responseData: {
						result: 'success',
						data: 'updated theme file and restarted application'
					},
					callback: function () {
						CoreUtilities.restart_app({
							restartfile: restartfile
						});
					}
				});
			}
		});
	}
};

/**
 * save data from config page post
 * @param  {object} req
 * @param  {object} res
 */
var update_ext_filedata = function (req, res) {
	var updateConfigFileData = CoreUtilities.removeEmptyObjectValues(req.body),
		extconffile = path.resolve(process.cwd(), 'content/config/extensions/', updateConfigFileData.extname, updateConfigFileData.filename),
		jsonParseError;
	delete updateConfigFileData._csrf;

	try {
		updateConfigFileData.filedata = (path.extname(updateConfigFileData.filename) === '.json') ? JSON.parse(updateConfigFileData.filedata) : updateConfigFileData.filedata;
	}
	catch (e) {
		jsonParseError = e;
	}

	if (path.extname(updateConfigFileData.filename) === '.json') {
		logger.warn('write json');
		fs.writeJson(extconffile, updateConfigFileData.filedata, function (err) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else if (jsonParseError) {
				CoreController.handleDocumentQueryErrorResponse({
					err: 'JSON Parse Error: ' + jsonParseError,
					res: res,
					req: req
				});
			}
			else {
				CoreController.handleDocumentQueryRender({
					req: req,
					res: res,
					redirecturl: '/p-admin/extension/' + updateConfigFileData.extname,
					responseData: {
						result: 'success',
						data: 'updated config file and restarted application'
					},
					callback: function () {
						CoreUtilities.restart_app({
							restartfile: restartfile
						});
					}
				});
			}
		});
	}
	else {
		logger.warn('write file');
		fs.outputFile(extconffile, updateConfigFileData.filedata, function (err) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else if (jsonParseError) {
				CoreController.handleDocumentQueryErrorResponse({
					err: 'JSON Parse Error: ' + jsonParseError,
					res: res,
					req: req
				});
			}
			else {
				CoreController.handleDocumentQueryRender({
					req: req,
					res: res,
					redirecturl: '/p-admin/extension/' + updateConfigFileData.extname,
					responseData: {
						result: 'success',
						data: 'updated config file and restarted application'
					},
					callback: function () {
						CoreUtilities.restart_app({
							restartfile: restartfile
						});
					}
				});
			}
		});
	}
};

/**
 * load app configuration information
 * @param  {object} req
 * @param  {object} res
 * @param {object} next async callback
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var load_app_settings = function (req, res, next) {
	req.controllerData = (req.controllerData) ? req.controllerData : {};

	var appsettings = {

		readonly: {
			application: appSettings.application,
			cookies: appSettings.cookies,
			crsf: appSettings.crsf,
			database: dbSettings.url,
			expressCompression: appSettings.expressCompression,
			theme: appSettings.theme,
			templatefileextension: appSettings.templatefileextension,
			templateengine: appSettings.templateengine,
			sessions: appSettings.sessions,
			node_modules: appSettings.node_modules,
			version: appSettings.version,
		},
		environment: appSettings.application.environment,
		configuration: {
			adminnotificationemail: appSettings.adminnotificationemail,
			serverfromemail: appSettings.serverfromemail,
			debug: appSettings.debug,
			periodic_cache_status: appSettings.periodic_cache_status,
			homepage: appSettings.homepage,
			name: appSettings.name,
		}
	};
	async.parallel({
		env_config: function (asynccb) {
			fs.readJson(path.join(process.cwd(), 'content/config/environment', appenvironment + '.json'), asynccb);
		},
		default_config: function (asynccb) {
			fs.readJson(path.join(process.cwd(), 'content/config/environment/default.json'), asynccb);
		},
		global_config: function (asynccb) {
			fs.readJson(path.join(process.cwd(), 'content/config/config.json'), asynccb);
		}
	}, function (err, results) {
		if (err) {
			next(err);
		}
		else {
			var configReturn = {};
			for (var key in appSettings) {
				configReturn[key] = appSettings[key];
			}
			req.controllerData.config = results;
			req.controllerData.config.app_config = configReturn;
			req.controllerData.config.app_config.themeSettings = '[theme config]';
			req.controllerData.config.app_config.extconf = '[extension config]';
			req.controllerData.appsettings = appsettings;
			next();
		}
	});
};

/**
 * load theme configuration information
 * @param  {object} req
 * @param  {object} res
 * @param {object} next async callback
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var load_theme_settings = function (req, res, next) {
	var themesettings = {
		readonly: {},
		environment: appSettings.application.environment,
		configuration: {}
	};

	if (appSettings.themeSettings && appSettings.themeSettings.settings) {
		themesettings.configuration = appSettings.themeSettings.settings[appSettings.application.environment];
		themesettings.readonly = {
			name: appSettings.themeSettings.name,
			periodicCompatibility: appSettings.themeSettings.periodicCompatibility,
			author: appSettings.themeSettings.author,
			url: appSettings.themeSettings.url,
			templatefileextension: appSettings.templatefileextension,
			templateengine: appSettings.templateengine,
			themepath: appSettings.themepath
		};
	}

	req.controllerData = (req.controllerData) ? req.controllerData : {};
	req.controllerData.themesettings = themesettings;
	next();
};

/**
 * form upload handler to update app settings, and sends notification email
 * @param  {object} req
 * @param  {object} res
 * @param {object} next async callback
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var update_app_settings = function (req, res) {
	var updatedAppSettings = CoreUtilities.removeEmptyObjectValues(req.body),
		appsettingsfile = path.join(process.cwd(), 'content/config/environment/' + appSettings.application.environment + '.json');

	updatedAppSettings = CoreUtilities.replaceBooleanStringObjectValues(updatedAppSettings);
	delete updatedAppSettings._csrf;

	fs.ensureFileSync(appsettingsfile);
	fs.readJson(appsettingsfile, function (err, appconfig) {
		if (err) {
			CoreController.handleDocumentQueryErrorResponse({
				err: err,
				res: res,
				req: req
			});
		}
		else {
			updatedAppSettings = str2json.convert(updatedAppSettings);
			var originalconfig = appconfig || {},
				mergedconfig = merge(originalconfig, updatedAppSettings);

			async.series({
				update_app_setting: function (asynccb) {
					fs.writeJson(appsettingsfile, mergedconfig, asynccb);
				},
				send_email_notification: function (asynccb) {
					sendSettingEmail({
						user: req.user,
						req: req,
						emaildata: {
							user: req.user,
							hostname: req.headers.host,
							appname: appSettings.name,
							appenvironment: appSettings.application.environment,
							appport: appSettings.application.port,
							settingmessage: '<p>Your application was configuration was changed from the admin interface - ' + new Date() + '</p><p><pre>' + JSON.stringify(mergedconfig, null, '\t') + '</pre></p>',
						},
						subject: appSettings.name + '[env:' + appSettings.application.environment + '] Application Configuration Change Notification',
						emailtemplate: changedemailtemplate,
					}, asynccb);
				},
				send_server_response: function (asynccb) {
					CoreController.handleDocumentQueryRender({
						req: req,
						res: res,
						redirecturl: '/p-admin/settings',
						responseData: {
							result: 'success',
							data: 'app config updated'
						},
						callback: asynccb
					});
				}
			}, function (err, results) {
				if (err) {
					CoreController.handleDocumentQueryErrorResponse({
						err: err,
						res: res,
						req: req
					});
				}
				else {
					logger.debug('update_app_settings async series results', results);
					CoreUtilities.restart_app({
						restartfile: restartfile
					});
				}
			});
		}
	});
};

/**
 * form upload handler to update theme settings, and sends notification email
 * @param  {object} req
 * @param  {object} res
 * @param {object} next async callback
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var update_theme_settings = function (req, res) {
	var updatedThemeSettings = JSON.parse(req.body['themesettings-codemirror']), //CoreUtilities.removeEmptyObjectValues(req.body),
		themesettingsfile = path.join(process.cwd(), 'content/config/themes', appSettings.theme, 'periodicjs.theme.json'),
		originalsettings,
		mergedsettings,
		newthemeconfig;

	updatedThemeSettings = CoreUtilities.replaceBooleanStringObjectValues(updatedThemeSettings);
	delete updatedThemeSettings._csrf;

	async.series({
			read_theme_files: function (asynccb) {
				fs.readJson(themesettingsfile, function (err, themeconfig) {
					if (err) {
						asynccb(err);
					}
					else {
						// updatedThemeSettings = str2json.convert(updatedThemeSettings);
						originalsettings = themeconfig.settings[appenvironment];
						mergedsettings = merge(originalsettings, updatedThemeSettings);
						newthemeconfig = themeconfig;
						newthemeconfig.settings[appSettings.application.environment] = mergedsettings;
						asynccb(null, 'updated with new theme settings');
					}
				});
			},
			write_new_settings: function (asynccb) {
				fs.writeJson(themesettingsfile, newthemeconfig, {
					spaces: 2
				}, function (err) {
					asynccb(err, 'saved new theme settings');
				});
			},
			send_server_response: function (asynccb) {
				CoreController.handleDocumentQueryRender({
					req: req,
					res: res,
					redirecturl: '/p-admin/settings',
					responseData: {
						result: 'success',
						data: 'theme config updated'
					},
					callback: asynccb
				});
			},
			send_email_notification: function (asynccb) {
				sendSettingEmail({
					req: req,
					user: req.user,
					emaildata: {
						user: req.user,
						hostname: req.headers.host,
						appname: appSettings.name,
						appenvironment: appenvironment,
						appport: appSettings.application.port,
						settingmessage: '<p>Your theme [' + appenvironment + '] configuration was changed from the admin interface - ' + new Date() + '</p><p><pre>' + JSON.stringify(newthemeconfig.settings[appenvironment], null, '\t') + '</pre></p>',
					},
					subject: appSettings.name + '[env:' + appenvironment + '] Application Theme Setting Change Notification',
					emailtemplate: changedemailtemplate,
				}, asynccb);
			}
		},
		function (err, results) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				logger.debug('update_theme_settings async results', results);
				CoreUtilities.restart_app({
					restartfile: restartfile
				});
			}
		});
};

/**
 * form upload handler to update theme settings, and sends notification email
 * @param  {object} req
 * @param  {object} res
 * @param {object} next async callback
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var update_config_json_files = function (req, res) {
	var bodyjson,
		configfilejsonpath,
		configname;

	if (req.body['defaultconfig-codemirror']) {
		bodyjson = JSON.parse(req.body['defaultconfig-codemirror']);
		configfilejsonpath = path.join(process.cwd(), '/content/config/environment/default.json');
		configname = 'default.json';
	}
	else if (req.body['envconfig-codemirror']) {
		bodyjson = JSON.parse(req.body['envconfig-codemirror']);
		configfilejsonpath = path.join(process.cwd(), '/content/config/environment/' + appenvironment + '.json');
		configname = appenvironment + '.json';
	}
	else if (req.body['globalconfig-codemirror']) {
		bodyjson = JSON.parse(req.body['globalconfig-codemirror']);
		configfilejsonpath = path.join(process.cwd(), '/content/config/config.json');
		configname = 'config.json';
	}

	async.series({
			write_new_settings: function (asynccb) {
				fs.writeJson(configfilejsonpath, bodyjson, {
					spaces: 2
				}, function (err) {
					asynccb(err, 'saved new theme settings');
				});
			},
			send_server_response: function (asynccb) {
				CoreController.handleDocumentQueryRender({
					req: req,
					res: res,
					redirecturl: '/p-admin/settings',
					responseData: {
						result: 'success',
						data: configname + ' updated'
					},
					callback: asynccb
				});
			},
			send_email_notification: function (asynccb) {
				if (bodyjson.cookies && bodyjson.cookies.cookieParser) {
					bodyjson.cookies.cookieParser = '[redacted]';
				}
				if (bodyjson.session_secret) {
					bodyjson.session_secret = '[redacted]';
				}
				sendSettingEmail({
					req: req,
					user: req.user,
					emaildata: {
						user: req.user,
						hostname: req.headers.host,
						appname: appSettings.name,
						appenvironment: appenvironment,
						appport: appSettings.application.port,
						settingmessage: '<p>Your ' + configname + ' configuration was changed from the admin interface - ' + new Date() + '</p><p><pre>' + JSON.stringify(bodyjson, null, '\t') + '</pre></p>',
					},
					subject: appSettings.name + '[env:' + appenvironment + '] ' + configname + ' Change Notification',
					emailtemplate: changedemailtemplate,
				}, asynccb);
			}
		},
		function (err, results) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				logger.debug('update_theme_settings async results', results);
				CoreUtilities.restart_app({
					restartfile: restartfile
				});
			}
		});
};

var send_setting_server_callback = function (options) {
	try {
		if (io.engine) {
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

var checkOutdatedModulesAndPeriodic = function (options, callback) {
	var list_of_extensions;
	var list_of_extensions_recent_data;
	var list_of_extensions_current_data = {};
	var list_of_extensions_outdated_data = {};
	var send_outdated_emails = (options) ? options.send_outdated_emails : (admin_ext_settings && admin_ext_settings.settings) ? admin_ext_settings.settings.send_cron_check_email : true;
	var asyncadmin_outdated_log_file_path = path.resolve(process.cwd(), 'content/config/extensions/periodicjs.ext.asyncadmin/outdated_log.json'),
		npmconfig = {
			'strict-ssl': false,
			'save-optional': true,
			'silent': true,
			'json': true,
			'production': true
		};
	if (send_outdated_emails === undefined) {
		send_outdated_emails = true;
	}

	async.series({
		get_list_of_extensions: function (asyncCB) {
			list_of_extensions = appSettings.extconf.extensions.map(function (ext) {
				return ext.name;
			});
			list_of_extensions.push('periodicjs');
			appSettings.extconf.extensions.forEach(function (ext) {
				var returnobj = {};
				list_of_extensions_current_data[ext.name] = {
					name: ext.name,
					installed_version: ext.version
				};

				return returnobj;
			});
			fs.readJSON(path.resolve(process.cwd(), 'package.json'), function (err, jsondata) {
				list_of_extensions_current_data.periodicjs = {
					name: jsondata.name,
					installed_version: jsondata.version
				};
				asyncCB(err, list_of_extensions_current_data);
			});
		},
		ensure_outdated_log: function (asyncCB) {
			fs.ensureFile(asyncadmin_outdated_log_file_path, asyncCB);
		},
		get_latest_version_numbers: function (asyncCB) {
			npm.load(
				npmconfig,
				function (err) {
					if (err) {
						asyncCB(err);
					}
					else {
						npm.silent = true;
						async.each(list_of_extensions,
							function (item, mapCB) {
								npm.commands.view(
									[item, 'name', 'version'],
									function (err, data) {
										if (err) {
											mapCB(err);
										}
										else {
											// var returnobj={};
											var returnobjkey = Object.keys(data)[0];
											list_of_extensions_current_data[data[returnobjkey].name].latest_version = data[returnobjkey].version;
											mapCB(null);
										}
									}
								);
							},
							function (err, results) {
								// results is now an array of stats for each file
								list_of_extensions_recent_data = results;
								asyncCB(err, results);
							});

					}
				});
		},
		calculate_outdated_versions: function (asyncCB) {
			for (var key in list_of_extensions_current_data) {
				if (semver.lt(list_of_extensions_current_data[key].installed_version, list_of_extensions_current_data[key].latest_version)) {
					list_of_extensions_outdated_data[key] = list_of_extensions_current_data[key];
				}
			}
			asyncCB(null, list_of_extensions_outdated_data);
		}
	}, function (err, result) {
		if (err) {
			logger.error(err);
			if (callback) {
				callback(err);
			}
		}
		else if (result.calculate_outdated_versions && Object.keys(result.calculate_outdated_versions).length > 0) {
			if (callback) {
				callback(null, result);
			}
			logger.warn('asyncadmin - WARNING: Your Instance is out of date', result.calculate_outdated_versions);
			var alerthtml = '<ul>';

			for (var key in result.calculate_outdated_versions) {
				var ext = result.calculate_outdated_versions[key];
				alerthtml += '<li>' + ext.name + ': current(' + ext.latest_version + '), installed(' + ext.installed_version + ')</li>';
			}
			alerthtml += '<ul>';

			if (send_outdated_emails) {
				sendSettingEmail({
					// req: {},
					user: {
						username: 'application-cron',
						email: appSettings.adminnotificationemail
					},
					emaildata: {
						user: {
							username: 'application-cron',
							email: appSettings.adminnotificationemail
						},
						hostname: appSettings.homepage,
						appname: appSettings.name,
						appenvironment: appenvironment,
						appport: appSettings.application.port,
						settingmessage: '<p>Your ' + appSettings.name + ' application dependencies are outdated - ' + new Date() + '</p><div>' + alerthtml + '</div>',
					},
					subject: appSettings.name + '[env:' + appenvironment + ' - ' + os.hostname() + ']  Dependency warning notification',
					emailtemplate: changedemailtemplate,
				}, function () {});
			}



			send_setting_server_callback({
				functionName: 'showServerModal',
				functionData: '<div class="ts-text-xl"><span class="ts-text-error-color">Node (' + os.hostname() + ') dependencies outdated warning</span></div><div>' + alerthtml + '</div>'
			});

			fs.writeJson(asyncadmin_outdated_log_file_path, result);
		}
		// console.log('checkOutdatedModulesAndPeriodic err,result',err,result);
	});
};

var get_outdated_modules = function (req, res, next) {
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	checkOutdatedModulesAndPeriodic({}, function (err, outdated_modules) {
		if (err) {
			next(err);
		}
		else {
			req.controllerData.outdated_modules = outdated_modules;
			next();
		}
	});
};

var useCronTasks = function () {
	try {
		var crontime_to_use = (admin_ext_settings && admin_ext_settings.settings && admin_ext_settings.settings.check_dependency_cron) ? admin_ext_settings.settings.check_dependency_cron : '00 00 06 * * 1-5',
			check_outdated_dependencies = new CronJob({
				cronTime: crontime_to_use,
				onTick: checkOutdatedModulesAndPeriodic,
				onComplete: function () {} //,
					// start: true
			});
		check_outdated_dependencies.start();
	}
	catch (e) {
		logger.error('setupLoanCronTasks e', e);
	}
};

/**
 * settings controller
 * @module settingsController
 * @{@link https://github.com/typesettin/periodicjs.ext.admin}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:async
 * @requires module:path
 * @requires module:string-to-json
 * @requires module:utils-merge
 * @requires module:ejs
 * @requires module:periodicjs.core.utilities
 * @requires module:periodicjs.core.controller
 * @requires module:periodicjs.core.mailer
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           settings
 */
var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	dbSettings = resources.db;
	CoreController = resources.core.controller;
	CoreUtilities = resources.core.utilities;
	CoreExtension = resources.core.extension;
	CoreMailer = resources.core.mailer;
	AppDBSetting = mongoose.model('Setting');
	appenvironment = appSettings.application.environment;
	admin_ext_settings = resources.app.controller.extension.asyncadmin.adminExtSettings;
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'p-admin/email/settings/notification',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			if (templatepath === 'p-admin/email/settings/notification') {
				templatepath = path.resolve(process.cwd(), 'node_modules/periodicjs.ext.asyncadmin/views', templatepath + '.' + appSettings.templatefileextension);
			}
			changedemailtemplate = templatepath;
		}
	);
	checkOutdatedModulesAndPeriodic();
	useCronTasks();

	return {
		load_extension_settings: load_extension_settings,
		update_config_json_files: update_config_json_files,
		update_ext_filedata: update_ext_filedata,
		update_theme_filedata: update_theme_filedata,
		load_app_settings: load_app_settings,
		load_theme_settings: load_theme_settings,
		restart_app: restart_app,
		update_app: update_app,
		update_theme_settings: update_theme_settings,
		update_app_settings: update_app_settings,
		get_outdated_modules: get_outdated_modules
	};
};

module.exports = controller;
