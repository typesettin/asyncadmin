'use strict';

var path = require('path'),
	errorie = require('errorie'),
	fs = require('fs-extra'),
	extend = require('utils-merge'),
	numeral = require('numeral'),
	stylietreeview = require('stylie.treeview'),
	adminExtSettings,
	appenvironment,
	settingJSON,
	extJson,
	// activate_middleware,
	adminExtSettingsFile = path.join(process.cwd(), 'content/config/extensions/periodicjs.ext.asyncadmin/settings.json'),
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


	try {
		if (periodic.settings.theme) {
			var themeinfo = fs.readJsonSync(path.join(periodic.settings.themepath, '/periodicjs.theme.json'));
			if (themeinfo['periodicjs.ext.asyncadmin']) {
				periodic.app.locals.themeasyncadmin = themeinfo['periodicjs.ext.asyncadmin'];
			}
		}
		extJson = fs.readJsonSync(path.join(__dirname, '/package.json'));
		periodic.app.locals.asyncadminextJson = extJson;
	}
	catch (e) {
		throw new errorie({
			name: 'Async Admin',
			message: 'Config error - ' + e.message
		});
	}

	periodic.app.locals.numeral = numeral;
	periodic.app.locals.appenvironment = appenvironment;
	periodic.app.locals.adminPath = adminExtSettings.settings.adminPath;
	periodic.app.locals.socketIoPort = adminExtSettings.settings.socketIoPort;
	periodic.app.locals.stylietreeview = stylietreeview;

	periodic.app.controller.extension.asyncadmin = {
		adminExtSettings: adminExtSettings
	};
	periodic.app.controller.extension.asyncadmin = {
		admin: require('./controller/admin')(periodic),
		user: require('./controller/admin_user')(periodic),
		socket_log: require('./controller/socket_log')(periodic),
		socket_callback: require('./controller/server_callback')(periodic)
	};

	var adminRouter = periodic.express.Router(),
		userAdminRouter = periodic.express.Router(),
		settingsAdminRouter = periodic.express.Router(),
		extensionAdminRouter = periodic.express.Router(),
		themeAdminRouter = periodic.express.Router(),
		adminController = periodic.app.controller.extension.asyncadmin.admin,
		assetController = periodic.app.controller.native.asset,
		authController = periodic.app.controller.extension.login.auth,
		uacController = periodic.app.controller.extension.user_access_control.uac,
		userController = periodic.app.controller.native.user,
		userAdminController = periodic.app.controller.extension.asyncadmin.user;

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
	adminRouter.get('/dashboard', adminController.getMarkdownReleases, adminController.getHomepageStats, adminController.admin_index);
	// adminRouter.get('/extensions', adminController.loadExtensions, adminController.extensions_index);
	// adminRouter.get('/themes', adminController.loadThemes, adminSettingsController.load_theme_settings, adminController.themes_index);
	// adminRouter.get('/users', userController.loadUsersWithCount, userController.loadUsersWithDefaultLimit, uacController.loadUacUsers, adminController.users_index);
	// adminRouter.get('/check_periodic_version', adminController.check_periodic_version);



	/**
	 * admin/user routes
	 */
	userAdminRouter.get('/search', userController.loadUsers, userAdminController.users_index);
	userAdminRouter.get('/new', userAdminController.users_new);
	userAdminRouter.get('/:id', userController.loadUser, userAdminController.users_show);
	userAdminRouter.get('/:id/edit', userController.loadUser, userAdminController.users_edit);
	userAdminRouter.post('/edit',
		assetController.multiupload,
		assetController.create_assets_from_files,
		userController.update);
	userAdminRouter.post('/new', assetController.upload, userController.create);
	userAdminRouter.post('/:id/delete', assetController.upload, userController.loadUser, userController.remove);


	adminRouter.use('/extension', extensionAdminRouter);
	adminRouter.use('/theme', themeAdminRouter);
	adminRouter.use('/user', userAdminRouter);
	adminRouter.use('/settings', settingsAdminRouter);
	periodic.app.use('/' + periodic.app.locals.adminPath, adminRouter);
	return periodic;
};
