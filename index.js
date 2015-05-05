'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	extend = require('utils-merge'),
	numeral = require('numeral'),
	stylietreeview = require('stylie.treeview'),
	adminExtSettings,
	appenvironment,
	settingJSON,
	// activate_middleware,
	Extensions = require('periodicjs.core.extensions'),
	CoreExtension = new Extensions({
		extensionFilePath: path.resolve(process.cwd(), './content/config/extensions.json')
	}),
	adminExtSettingsFile = path.resolve(CoreExtension.getconfigdir({
		extname: 'periodicjs.ext.asyncadmin'
	}), './settings.json'),
	defaultExtSettings = require('./controller/default_config');

/**
 * An authentication extension that uses passport to authenticate user sessions.
 * @{@link https://github.com/typesettin/periodicjs.ext.admin}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @exports periodicjs.ext.admin
 * @requires module:passport
 * @param  {object} periodic variable injection of resources from current periodic instance
 */
module.exports = function (periodic) {
	// periodic = express,app,logger,config,db,mongoose
	appenvironment = periodic.settings.application.environment;
	settingJSON = fs.readJsonSync(adminExtSettingsFile);
	adminExtSettings = (settingJSON[appenvironment]) ? extend(defaultExtSettings, settingJSON[appenvironment]) : defaultExtSettings;

	periodic.app.locals.numeral = numeral;
	periodic.app.locals.adminPath = adminExtSettings.settings.adminPath;
	periodic.app.locals.socketIoPort = adminExtSettings.settings.socketIoPort;
	periodic.app.locals.stylietreeview = stylietreeview;

	periodic.app.controller.extension.admin = {
		adminExtSettings: adminExtSettings
	};
	periodic.app.controller.extension.admin = {
		admin: require('./controller/admin')(periodic),
		socket_log: require('./controller/socket_log')(periodic),
		// settings: require('./controller/settings')(periodic)
	};

	var adminRouter = periodic.express.Router(),
		userAdminRouter = periodic.express.Router(),
		settingsAdminRouter = periodic.express.Router(),
		extensionAdminRouter = periodic.express.Router(),
		themeAdminRouter = periodic.express.Router(),
		authController = periodic.app.controller.extension.login.auth,
		uacController = periodic.app.controller.extension.user_access_control.uac,
		adminController = periodic.app.controller.extension.admin.admin;

	/**
	 * access control routes
	 */
	adminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	extensionAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	themeAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	userAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	settingsAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);

	/**
	 * admin routes
	 */
	// adminRouter.get('/', adminController.admin_index);
	adminRouter.get('/', adminController.getMarkdownReleases, adminController.getHomepageStats, adminController.admin_index);
	// adminRouter.get('/extensions', adminController.loadExtensions, adminController.extensions_index);
	// adminRouter.get('/themes', adminController.loadThemes, adminSettingsController.load_theme_settings, adminController.themes_index);
	// adminRouter.get('/users', userController.loadUsersWithCount, userController.loadUsersWithDefaultLimit, uacController.loadUacUsers, adminController.users_index);
	// adminRouter.get('/check_periodic_version', adminController.check_periodic_version);

	adminRouter.use('/extension', extensionAdminRouter);
	adminRouter.use('/theme', themeAdminRouter);
	adminRouter.use('/user', userAdminRouter);
	adminRouter.use('/settings', settingsAdminRouter);
	periodic.app.use('/' + periodic.app.locals.adminPath, adminRouter);
	return periodic;
};
