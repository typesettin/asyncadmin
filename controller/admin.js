'use strict';

var async = require('async'),
	path = require('path'),
	marked = require('marked'),
	fs = require('fs-extra'),
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
	// configError,
	Contenttype,
	Collection,
	Compilation,
	Item,
	User,
	adminExtSettings;

var admin_index = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/home/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Admin',
				toplink: '&raquo; Home',
				extensions: CoreUtilities.getAdminMenu()
			},
			markdownpages: req.controllerData.markdownpages,
			contentcounts: req.controllerData.contentcounts,
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

/**
 * load the markdown release data
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var getMarkdownReleases = function (req, res, next) {
	var markdownpages = [],
		markdownfiles = [];
	req.controllerData = (req.controllerData) ? req.controllerData : {};

	fs.readdir(path.join(process.cwd(), 'releases'), function (err, files) {
		if (err) {
			logger.error(err);
			req.controllerData.markdownpages = markdownpages;
			next();
		}
		else {
			if (files.length > 0) {
				files.reverse();
				// console.log('files', files);
				markdownfiles = files.slice(0, 9);
			}
			async.eachSeries(
				markdownfiles,
				function (file, cb) {
					fs.readFile(path.join(process.cwd(), 'releases', file), 'utf8', function (err, data) {
						markdownpages.push(marked(data));
						cb(err);
						// console.log(data); //hello!
					});
				},
				function (err) {
					if (err) {
						logger.error(err);
					}
					req.controllerData.markdownpages = markdownpages;
					next();
				});
		}
	});
};

/**
 * does a query to get content counts for all content types
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var getHomepageStats = function (req, res, next) {
	req.controllerData = (req.controllerData) ? req.controllerData : {};

	async.parallel({
		extensionsCount: function (cb) {
			ExtensionCore.getExtensions({
					periodicsettings: appSettings
				},
				function (err, extensions) {
					if (err) {
						cb(err, null);
					}
					else {
						cb(null, extensions.length);
					}
				});

		},
		themesCount: function (cb) {
			var themedir = path.resolve(process.cwd(), 'content/themes/'),
				returnFiles = [];
			fs.readdir(themedir, function (err, files) {
				if (err) {
					cb(err, null);
				}
				else {
					if (files) {
						for (var x = 0; x < files.length; x++) {
							if (files[x].match('periodicjs.theme')) {
								returnFiles.push(files[x]);
							}
						}
					}
					cb(null, returnFiles.length);
				}
			});
		},
		itemsCount: function (cb) {
			Item.count({}, function (err, count) {
				cb(err, count);
			});
		},
		collectionsCount: function (cb) {
			Collection.count({}, function (err, count) {
				cb(err, count);
			});
		},
		assetsCount: function (cb) {
			mongoose.model('Asset').count({}, function (err, count) {
				cb(err, count);
			});
		},
		contenttypesCount: function (cb) {
			Contenttype.count({}, function (err, count) {
				cb(err, count);
			});
		},
		tagsCount: function (cb) {
			mongoose.model('Tag').count({}, function (err, count) {
				cb(err, count);
			});
		},
		categoriesCount: function (cb) {
			mongoose.model('Category').count({}, function (err, count) {
				cb(err, count);
			});
		},
		usersCount: function (cb) {
			User.count({}, function (err, count) {
				cb(err, count);
			});
		}
	}, function (err, results) {
		if (err) {
			logger.error(err);
		}
		// console.log('results', results);
		req.controllerData.contentcounts = results;
		next();
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
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new Controller(resources);
	CoreUtilities = new Utilities(resources);
	Collection = mongoose.model('Collection');
	Compilation = mongoose.model('Compilation');
	Contenttype = mongoose.model('Contenttype');
	Item = mongoose.model('Item');
	User = mongoose.model('User');
	// AppDBSetting = mongoose.model('Setting');
	// var appenvironment = appSettings.application.environment;
	adminExtSettings = resources.app.controller.extension.admin.adminExtSettings;

	return {
		admin_index: admin_index,
		getMarkdownReleases: getMarkdownReleases,
		getHomepageStats: getHomepageStats,
		adminExtSettings: adminExtSettings,
	};
};

module.exports = controller;
