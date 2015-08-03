'use strict';

var merge = require('utils-merge'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	adminPath,
	Userrole,
	Userprivilege,
	logger;

var loadUACCounts = function (req, res, next) {
	// req.controllerData = (req.controllerData) ? req.controllerData : {};
	req.headers.loaduserrolecount = true; // loaditemcount
	req.headers.loaduserprivilegecount = true; // loaditemcount
	next();
};

var getRoleIdCount = function (req, res, next) {
	if (req.controllerData && req.controllerData.userrole) {
		res.send({
			result: 'success',
			data: {
				doc: req.controllerData.userrole
			}
		});
	}
	else if (req.body.userroleid) {
		next();
	}
	else {
		Userrole.count({}, function (err, count) {
			if (err) {
				next(err);
			}
			else {
				req.body.userroleid = count + 1;
				next();
			}
		});
	}
};

var getPrivilegeIdCount = function (req, res, next) {
	if (req.controllerData && req.controllerData.userprivilege) {
		res.send({
			result: 'success',
			data: {
				doc: req.controllerData.userprivilege
			}
		});
	}
	else if (req.body.userprivilegeid) {
		next();
	}
	else {
		Userprivilege.count({}, function (err, count) {
			if (err) {
				next(err);
			}
			else {
				req.body.userprivilegeid = count + 1;
				next();
			}
		});
	}
};

/**
 * manage user role section
 * @param  {object} req 
 * @param  {object} res 
 * @return {object} reponds with an error page or requested view
 */
var index = function (req, res) {
	// console.log('req.controllerData', req.controllerData);
	var viewtemplate = {
			viewname: 'p-admin/userroles/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = merge(req.controllerData, {
			pagedata: {
				title: 'Manage Users Roles',
				toplink: '&raquo; <a href="/' + adminPath + '/userroles" class="async-admin-ajax-link">User Roles</a>',
				extensions: CoreUtilities.getAdminMenu()
			},
			user: req.user
		});
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var userprivilege_index = function (req, res) {
	// console.log('req.controllerData', req.controllerData);
	var viewtemplate = {
			viewname: 'p-admin/userroles/userprivilege_index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = merge(req.controllerData, {
			pagedata: {
				title: 'Manage Users Privileges',
				toplink: '&raquo; <a href="/' + adminPath + '/userprivileges" class="async-admin-ajax-link">User Privileges</a>',
				extensions: CoreUtilities.getAdminMenu()
			},
			user: req.user
		});
	CoreController.renderView(req, res, viewtemplate, viewdata);
};


/**
 * create a new usr role
 * @param  {object} req 
 * @param  {object} res 
 * @return {object} reponds with an error page or requested view
 */
var userrole_new = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/userroles/new',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'New User Role',
				toplink: '&raquo; <a href="/' + adminPath + '/userroles" class="async-admin-ajax-link">User Roles</a> &raquo; New User Role',
				// headerjs: ['/extensions/periodicjs.ext.asyncadmin/js/useraccess.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			userrole: null, //req.controllerData.userrole
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

/**
 * show user role
 * @param  {object} req 
 * @param  {object} res 
 * @return {object} reponds with an error page or requested view
 */
var show = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/userroles/edit',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: req.controllerData.userrole.title,
				toplink: '&raquo; <a href="/' + adminPath + '/userroles" class="async-admin-ajax-link">User Roles</a> &raquo; ' + req.controllerData.userrole.title,
				// headerjs: ['/extensions/periodicjs.ext.asyncadmin/js/useraccess.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			userrole: req.controllerData.userrole, //req.controllerData.userrole
			userprivileges: req.controllerData.userprivileges, //req.controllerData.userrole
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var userprivilege_show = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/userroles/userprivilege_edit',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: req.controllerData.userprivilege.title,
				toplink: '&raquo; <a href="/' + adminPath + '/userprivileges" class="async-admin-ajax-link">User Privileges</a> &raquo; ' + req.controllerData.userprivilege.title,
				// headerjs: ['/extensions/periodicjs.ext.asyncadmin/js/useraccess.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			userprivilege: req.controllerData.userprivilege, //req.controllerData.userrole
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

/**
 * user role controller
 * @module userroleController
 * @{@link https://github.com/typesettin/periodicjs.ext.user_access_control}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:periodicjs.core.utilities
 * @requires module:periodicjs.core.controller
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           userlogin
 */
var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = resources.core.controller;
	CoreUtilities = resources.core.utilities;
	Userrole = mongoose.model('Userrole');
	Userprivilege = mongoose.model('Userprivilege');
	// Usergroup = mongoose.model('Usergroup');
	adminPath = resources.app.locals.adminPath;

	return {
		loadUACCounts: loadUACCounts,
		getRoleIdCount: getRoleIdCount,
		getPrivilegeIdCount: getPrivilegeIdCount,
		index: index,
		userprivilege_index: userprivilege_index,
		userrole_new: userrole_new,
		show: show,
		userprivilege_show: userprivilege_show,
		// update: update,
		// remove: remove
	};
};

module.exports = controller;
