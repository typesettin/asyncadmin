'use strict';

var merge = require('utils-merge'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	Contenttype,
	Collection,
	Compilation,
	pluralize = require('pluralize'),
	capitalize = require('capitalize'),
	Item,
	User,
	Account,
	controllerOptions,
	adminPath,
	adminExtSettings;

var get_entity_modifications = function (entityname) {
	var entity = entityname.toLowerCase(),
		plural_entity = pluralize.plural(entity);
	return {
		name: entity, //item
		plural_name: pluralize.plural(entity), //items
		capitalized_name: capitalize(entity), //Item
		capitalized_plural_name: capitalize(plural_entity) //Items
	};
};

/**
 * shows list of users page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var get_index_page = function (options) {
	var entity = get_entity_modifications(options.entity);
	return function (req, res) {
		var viewtemplate = {
				viewname: 'p-admin/users/index',
				themefileext: appSettings.templatefileextension,
				extname: 'periodicjs.ext.asyncadmin'
			},
			viewdata = merge(req.controllerData, {
				pagedata: {
					title: '' + entity.capitalized_plural_name,
					toplink: '&raquo; ' + entity.capitalized_plural_name,
					extensions: CoreUtilities.getAdminMenu()
				},
				user: req.user,
				entity: entity
			});
		CoreController.renderView(req, res, viewtemplate, viewdata);
	};
};

/**
 * shows user profile page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var get_show_page = function (options) {
	var entity = get_entity_modifications(options.entity);
	return function (req, res) {
		var allow_edit = false,
			controllerDataObject = req.controllerData[entity.name],
			username_display = controllerDataObject.username || controllerDataObject.email || controllerDataObject._id,
			params = req.params,
			ObjectToUse = (entity.name === 'account') ? Account : User;

		if (params.id === req.user.username) {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: logged in user matches username');
			allow_edit = true;
		}
		else if (req.user.usertype === 'admin') {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: ' + entity.name + ' is admin');
			allow_edit = true;
		}
		else if (User.hasPrivilege(req.user, 750)) {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: has edit user privilege');
			allow_edit = true;
		}
		else {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: no access');
		}

		if (allow_edit) {
			var viewtemplate = {
					viewname: 'p-admin/users/show',
					themefileext: appSettings.templatefileextension,
					extname: 'periodicjs.ext.asyncadmin'
				},
				viewdata = {
					pagedata: {
						title: entity.capitalized_name + ' profile (' + username_display + ')',
						toplink: '&raquo; <a href="/' + adminPath + '/' + entity.plural_name + '" class="async-admin-ajax-link">' + entity.capitalized_plural_name + '</a> &raquo; ' + username_display,
						// headerjs: ['/extensions/periodicjs.ext.admin/js/userprofile.min.js'],
						extensions: CoreUtilities.getAdminMenu()
					},
					userprofile: controllerDataObject,
					allow_edit: allow_edit,
					user: req.user,
					entity: entity
				};
			CoreController.renderView(req, res, viewtemplate, viewdata);
		}
		else {
			res.status(401);
			CoreController.handleDocumentQueryErrorResponse({
				err: new Error('EXT-UAC760: You don\'t have access to modify content'),
				res: res,
				req: req
			});
		}
	};
};

/**
 * create a new user page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var get_new_page = function (options) {
	var entity = get_entity_modifications(options.entity);
	return function (req, res) {
		var allow_edit = false,
			viewtemplate = {
				viewname: 'p-admin/users/new',
				themefileext: appSettings.templatefileextension,
				extname: 'periodicjs.ext.asyncadmin'
			},
			ObjectToUse = (entity.name === 'account') ? Account : User,
			viewdata = {
				pagedata: {
					title: 'Create User Account',
					toplink: '&raquo; <a href="/' + adminPath + '/' + entity.plural_name + '" class="async-admin-ajax-link">' + entity.capitalized_plural_name + '</a> &raquo; Create a new user',
					// headerjs: ['/extensions/periodicjs.ext.admin/js/userprofile.min.js'],
					extensions: CoreUtilities.getAdminMenu()
				},
				userprofile: null,
				allow_edit: allow_edit,
				user: req.user,
				entity: entity
			};

		if (req.user.usertype === 'admin') {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: user is admin');
			allow_edit = true;
		}
		else if (ObjectToUse.hasPrivilege(req.user, 750)) {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: has edit user privilege');
			allow_edit = true;
		}
		else {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: no access');
		}

		if (allow_edit) {
			CoreController.renderView(req, res, viewtemplate, viewdata);
		}
		else {
			res.status(401);
			CoreController.handleDocumentQueryErrorResponse({
				err: new Error('EXT-UAC750: You don\'t have access to create content'),
				res: res,
				req: req
			});
		}
	}
};

/**
 * make sure a user is authenticated, if not logged in, send them to login page and return them to original resource after login
 * @param  {object} req
 * @param  {object} res
 * @return {Function} next() callback
 */
var get_edit_page = function (options) {
	var entity = get_entity_modifications(options.entity);
	return function (req, res) {
		var allow_edit = false,
			controllerDataObject = req.controllerData[entity.name],
			username_display = controllerDataObject.username || controllerDataObject.email || controllerDataObject._id,
			params = req.params;

		if (params.id === req.user.username) {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: logged in user matches username');
			allow_edit = true;
		}
		else if (req.user.usertype === 'admin') {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: user is admin');
			allow_edit = true;
		}
		else if (User.hasPrivilege(req.user, 750)) {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: has edit user privilege');
			allow_edit = true;
		}
		else {
			logger.silly('asyncadmin - ' + entity.plural_name + '_show: no access');
		}

		if (allow_edit) {
			var viewtemplate = {
					viewname: 'p-admin/users/edit',
					themefileext: appSettings.templatefileextension,
					extname: 'periodicjs.ext.asyncadmin'
				},
				viewdata = {
					pagedata: {
						title: 'Edit ' + username_display,
						toplink: '&raquo; <a href="/' + adminPath + '/' + entity.plural_name + '" class="async-admin-ajax-link">' + entity.capitalized_plural_name + '</a> &raquo; ' + username_display,
						// headerjs: ['/extensions/periodicjs.ext.admin/js/userprofile.min.js'],
						extensions: CoreUtilities.getAdminMenu()
					},
					userprofile: controllerDataObject,
					allow_edit: allow_edit,
					user: req.user,
					entity: entity
				};
			CoreController.renderView(req, res, viewtemplate, viewdata);
		}
		else {
			res.status(401);
			CoreController.handleDocumentQueryErrorResponse({
				err: new Error('EXT-UAC760: You don\'t have access to modify content'),
				res: res,
				req: req
			});
		}
	};
};

// 
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
	CoreController = resources.core.controller;
	CoreUtilities = resources.core.utilities;
	Collection = mongoose.model('Collection');
	Compilation = mongoose.model('Compilation');
	Contenttype = mongoose.model('Contenttype');
	Item = mongoose.model('Item');
	User = mongoose.model('User');
	Account = mongoose.model('Account');
	controllerOptions = resources.app.controller.native.ControllerSettings;
	// AppDBSetting = mongoose.model('Setting');
	// var appenvironment = appSettings.application.environment;
	adminExtSettings = resources.app.controller.extension.asyncadmin.adminExtSettings;
	adminPath = resources.app.locals.adminPath;

	return {
		users_index: get_index_page({
			entity: 'user'
		}),
		accounts_index: get_index_page({
			entity: 'account'
		}),
		users_edit: get_edit_page({
			entity: 'user'
		}),
		accounts_edit: get_edit_page({
			entity: 'account'
		}),
		users_show: get_show_page({
			entity: 'user'
		}),
		accounts_show: get_show_page({
			entity: 'account'
		}),
		users_new: get_new_page({
			entity: 'user'
		}),
		accounts_new: get_new_page({
				entity: 'account'
			})
			// usersearch: usersearch
	};
};

module.exports = controller;
