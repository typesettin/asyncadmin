'use strict';

var Utilities = require('periodicjs.core.utilities'),
	Controller = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	// configError,
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
			// markdownpages: req.controllerData.markdownpages,
			// contentcounts: req.controllerData.contentcounts,
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var items_index = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/items/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Item Admin',
				toplink: '&raquo; Items',
				extensions: CoreUtilities.getAdminMenu()
			},
			items: req.controllerData.items,
			itemscount: req.controllerData.itemscount,
			itempages: Math.ceil(req.controllerData.itemscount / req.query.limit),
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var collections_index = function (req, res) {
	req.flash('info', 'testing flash now');
	var viewtemplate = {
			viewname: 'p-admin/collections/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Collection Admin',
				toplink: '&raquo; Collections',
				extensions: CoreUtilities.getAdminMenu()
			},
			collections: req.controllerData.collections,
			collectionscount: req.controllerData.collectionscount,
			collectionpages: Math.ceil(req.controllerData.collectionscount / req.query.limit),
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var compilations_index = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/compilations/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Compilation Admin',
				toplink: '&raquo; Compilations',
				extensions: CoreUtilities.getAdminMenu()
			},
			compilations: req.controllerData.compilations,
			compilationscount: req.controllerData.compilationscount,
			compilationpages: Math.ceil(req.controllerData.compilationscount / req.query.limit),
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
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

	// var appenvironment = appSettings.application.environment;
	adminExtSettings = resources.app.controller.extension.admin.adminExtSettings;

	return {
		admin_index: admin_index,
		items_index: items_index,
		collections_index: collections_index,
		compilations_index: compilations_index,
		adminExtSettings: adminExtSettings,
	};
};

module.exports = controller;
