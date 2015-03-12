'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	extend = require('utils-merge'),
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

	periodic.app.controller.extension.admin = {
		adminExtSettings: adminExtSettings
	};
	periodic.app.controller.extension.admin = {
		admin: require('./controller/admin')(periodic),
		// settings: require('./controller/settings')(periodic)
	};

	var adminRouter = periodic.express.Router(),
		itemRouter = periodic.express.Router(),
		tagRouter = periodic.express.Router(),
		tagAdminRouter = periodic.express.Router(),
		mediaRouter = periodic.express.Router(),
		mediaAdminRouter = periodic.express.Router(),
		userAdminRouter = periodic.express.Router(),
		contenttypeRouter = periodic.express.Router(),
		contenttypeAdminRouter = periodic.express.Router(),
		categoryRouter = periodic.express.Router(),
		categoryAdminRouter = periodic.express.Router(),
		collectionRouter = periodic.express.Router(),
		compilationRouter = periodic.express.Router(),
		settingsAdminRouter = periodic.express.Router(),
		extensionAdminRouter = periodic.express.Router(),
		themeAdminRouter = periodic.express.Router(),
		// periodicRouter = periodic.express.Router(),
		themeController = periodic.app.controller.native.theme,
		extController = periodic.app.controller.native.extension,
		itemController = periodic.app.controller.native.item,
		tagController = periodic.app.controller.native.tag,
		mediaassetController = periodic.app.controller.native.asset,
		categoryController = periodic.app.controller.native.category,
		userController = periodic.app.controller.native.user,
		contenttypeController = periodic.app.controller.native.contenttype,
		collectionController = periodic.app.controller.native.collection,
		compilationController = periodic.app.controller.native.compilation,
		authController = periodic.app.controller.extension.login.auth,
		uacController = periodic.app.controller.extension.user_access_control.uac,
		adminController = periodic.app.controller.extension.admin.admin;

	/**
	 * access control routes
	 */
	adminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	extensionAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	themeAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	itemRouter.post('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	collectionRouter.post('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	compilationRouter.post('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	tagRouter.post('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	tagAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	categoryRouter.post('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	categoryAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	contenttypeRouter.post('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	contenttypeAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	mediaRouter.post('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	userAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);
	settingsAdminRouter.all('*', global.CoreCache.disableCache, authController.ensureAuthenticated, uacController.loadUserRoles, uacController.check_user_access);

	/**
	 * admin routes
	 */
	adminRouter.get('/', adminController.admin_index);
	// adminRouter.get('/', adminController.getMarkdownReleases, adminController.getHomepageStats, adminController.index);
	// adminRouter.get('/items', itemController.loadItemsWithCount, itemController.loadItemsWithDefaultLimit, itemController.loadItems, adminController.items_index);
	// adminRouter.get('/collections', collectionController.loadCollectionsWithCount, collectionController.loadCollectionsWithDefaultLimit, collectionController.loadCollections, adminController.collections_index);
	// adminRouter.get('/compilations', compilationController.loadCompilationsWithCount, compilationController.loadCompilationsWithDefaultLimit, compilationController.loadCompilations, adminController.compilations_index);
	// adminRouter.get('/contenttypes', contenttypeController.loadContenttypeWithCount, contenttypeController.loadContenttypeWithDefaultLimit, contenttypeController.loadContenttypes, adminController.contenttypes_index);
	// adminRouter.get('/tags', tagController.loadTagsWithCount, tagController.loadTagsWithDefaultLimit, tagController.loadTags, adminController.tags_index);
	// adminRouter.get('/categories', categoryController.loadCategoriesWithCount, categoryController.loadCategoriesWithDefaultLimit, categoryController.loadCategories, adminController.categories_index);
	// adminRouter.get('/assets', mediaassetController.loadAssetWithCount, mediaassetController.loadAssetWithDefaultLimit, mediaassetController.loadAssets, adminController.assets_index);
	// adminRouter.get('/extensions', adminController.loadExtensions, adminController.extensions_index);
	// adminRouter.get('/themes', adminController.loadThemes, adminSettingsController.load_theme_settings, adminController.themes_index);
	// adminRouter.get('/users', userController.loadUsersWithCount, userController.loadUsersWithDefaultLimit, uacController.loadUacUsers, adminController.users_index);
	// adminRouter.get('/mailer', adminController.mail_index);
	// adminRouter.get('/check_periodic_version', adminController.check_periodic_version);

	adminRouter.use('/asset', mediaAdminRouter);
	adminRouter.use('/extension', extensionAdminRouter);
	adminRouter.use('/theme', themeAdminRouter);
	adminRouter.use('/contenttype', contenttypeAdminRouter);
	adminRouter.use('/tag', tagAdminRouter);
	adminRouter.use('/category', categoryAdminRouter);
	adminRouter.use('/user', userAdminRouter);
	adminRouter.use('/settings', settingsAdminRouter);
	periodic.app.use('/item', itemRouter);
	periodic.app.use('/collection', collectionRouter);
	periodic.app.use('/compilation', compilationRouter);
	periodic.app.use('/tag', tagRouter);
	periodic.app.use('/category', categoryRouter);
	periodic.app.use('/contenttype', contenttypeRouter);
	periodic.app.use('/mediaasset', mediaRouter);
	periodic.app.use('/p-admin', adminRouter);
	return periodic;
};
