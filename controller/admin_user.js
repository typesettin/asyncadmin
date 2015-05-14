'use strict';

var Utilities = require('periodicjs.core.utilities'),
	Controller = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	Contenttype,
	Collection,
	Compilation,
	Item,
	User,
	adminExtSettings;

/**
 * shows list of users page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var users_index = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/users/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Manage Users',
				toplink: '&raquo; Manage Users',
				// headerjs: ['/extensions/periodicjs.ext.admin/js/userprofile.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			users: req.controllerData.users,
			userscount: req.controllerData.userscount,
			userpages: Math.ceil(req.controllerData.userscount / req.query.limit),
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

/**
 * shows user profile page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var users_show = function (req, res) {
	var allow_edit = false,
		params = req.params;

	if (params.id === req.user.username) {
		logger.silly('asyncadmin - users_show: logged in user matches username');
		allow_edit = true;
	}
	else if (req.user.usertype === 'admin') {
		logger.silly('asyncadmin - users_show: user is admin');
		allow_edit = true;
	}
	else if (User.hasPrivilege(req.user, 750)) {
		logger.silly('asyncadmin - users_show: has edit user privilege');
		allow_edit = true;
	}
	else {
		logger.silly('asyncadmin - users_show: no access');
	}

	var viewtemplate = {
			viewname: 'p-admin/users/show',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'User profile (' + req.controllerData.user.username + ')',
				toplink: '&raquo; User &raquo; ' + req.controllerData.user.username,
				// headerjs: ['/extensions/periodicjs.ext.admin/js/userprofile.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			userprofile: req.controllerData.user,
			allow_edit: allow_edit,
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

/**
 * create a new user page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var users_new = function (req, res) {
	var allow_edit = false,
		viewtemplate = {
			viewname: 'p-admin/users/new',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Create User Account',
				toplink: '&raquo; Create a new user',
				// headerjs: ['/extensions/periodicjs.ext.admin/js/userprofile.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			userprofile: null,
			allow_edit: allow_edit,
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

/**
 * make sure a user is authenticated, if not logged in, send them to login page and return them to original resource after login
 * @param  {object} req
 * @param  {object} res
 * @return {Function} next() callback
 */
var users_edit = function (req, res) {
	var allow_edit = false,
		params = req.params;

	if (params.id === req.user.username) {
		logger.silly('asyncadmin - users_show: logged in user matches username');
		allow_edit = true;
	}
	else if (req.user.usertype === 'admin') {
		logger.silly('asyncadmin - users_show: user is admin');
		allow_edit = true;
	}
	else if (User.hasPrivilege(req.user, 750)) {
		logger.silly('asyncadmin - users_show: has edit user privilege');
		allow_edit = true;
	}
	else {
		logger.silly('asyncadmin - users_show: no access');
	}

	var viewtemplate = {
			viewname: 'p-admin/users/edit',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Edit ' + req.controllerData.user.username,
				toplink: '&raquo; Edit user &raquo; ' + req.controllerData.user.username,
				// headerjs: ['/extensions/periodicjs.ext.admin/js/userprofile.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			userprofile: req.controllerData.user,
			allow_edit: allow_edit,
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
	Collection = mongoose.model('Collection');
	Compilation = mongoose.model('Compilation');
	Contenttype = mongoose.model('Contenttype');
	Item = mongoose.model('Item');
	User = mongoose.model('User');
	// AppDBSetting = mongoose.model('Setting');
	// var appenvironment = appSettings.application.environment;
	adminExtSettings = resources.app.controller.extension.asyncadmin.adminExtSettings;

	return {
		users_index: users_index,
		users_edit: users_edit,
		users_show: users_show,
		users_new: users_new
	};
};

module.exports = controller;
