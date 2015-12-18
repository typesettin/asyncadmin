'use strict';

var async = require('async'),
	path = require('path'),
	marked = require('marked'),
	pluralize = require('pluralize'),
	capitalize = require('capitalize'),
	fs = require('fs-extra'),
	merge = require('utils-merge'),
	CoreExtension,
	CoreUtilities,
	CoreController,
	appSettings,
	appenvironment,
	mongoose,
	logger,
	adminPath,
	controllerOptions,
	Contenttype,
	Collection,
	Compilation,
	Item,
	User,
	adminExtSettings,
	loginSettings;

var admin_index = function (req, res) {
	// console.log('req._parsedUrl.pathname === \'/\'',)
	// console.log('adminExtSettings',adminExtSettings);
	if (adminExtSettings.settings.adminIndexRedirectPath && adminExtSettings.settings.adminIndexRedirectPath !== 'dashboard' && req._parsedUrl.pathname === '/') {
		res.redirect(path.join('/', adminExtSettings.settings.adminPath, adminExtSettings.settings.adminIndexRedirectPath));
	}
	else {
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
	}
};

var fixCodeMirrorSubmit = function (req, res, next) {
	// console.log('fixCodeMirrorSubmit req.body',req.body)
	if (req.body.genericdocjson) {

		req.controllerData = req.controllerData || {};
		req.controllerData.encryptFields = true;
		var jsonbody = JSON.parse(req.body.genericdocjson);
		delete req.body.genericdocjson;
		req.body = merge(req.body, jsonbody);
		if (!req.body.docid) {
			req.body.docid = req.body._id;
		}
		delete req.body._id;
		delete req.body.__v;
		delete req.body.format;
	}
	next();
};

var removePasswordFromAdvancedSubmit = function (req, res, next) {
	req.skippassword = true;
	next();
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
	var databaseCountData = [],
		databaseFeedData = [];
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	async.parallel({
		databaseFeed: function (cb) {
			async.each(Object.keys(mongoose.models),
				function (DBModel, asyncEachCB) {
					mongoose.model(DBModel).find({}).limit(5).sort({
						updatedat: 'desc'
					}).exec(function (err, data_feed_results) {
						if (err) {
							asyncEachCB(err);
						}
						else {
							data_feed_results.forEach(function (data_result) {
								if (data_result.updatedat) {
									databaseFeedData.push(data_result);
								}
							});
							// databaseFeedData[DBModel]=count;
							asyncEachCB();
						}
					});
				},
				function (err) {
					databaseFeedData = databaseFeedData.sort(CoreUtilities.sortObject('desc', 'updatedat'));
					cb(err, databaseFeedData);
				});
		},
		databaseCount: function (cb) {
			async.each(Object.keys(mongoose.models),
				function (DBModel, asyncEachCB) {
					mongoose.model(DBModel).count({}, function (err, count) {
						if (err) {
							asyncEachCB(err);
						}
						else {
							databaseCountData.push({
								collection: DBModel,
								count: count
							});
							asyncEachCB();
						}
					});
				},
				function (err) {
					cb(err, databaseCountData);
				});
		},
		extensions: function (cb) {
			CoreExtension.getExtensions({
					periodicsettings: appSettings
				},
				function (err, extensions) {
					if (err) {
						cb(err, null);
					}
					else {
						cb(null, extensions);
					}
				});
		},
		themes: function (cb) {
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
								returnFiles.push({
									themename: files[x],
									active: (files[x] === appSettings.theme) ? true : false
								});
							}
						}
					}
					cb(null, returnFiles);
				}
			});
		}
	}, function (err, results) {
		if (err) {
			logger.error(err);
		}
		// console.log('results.extensions', results.extensions);
		req.controllerData.contentcounts = results;
		next();
	});
};

var loadExtensions = function (req, res, next) {
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	extensionsearch({
		req: req,
		res: res,
	}, function (err, extdata) {
		if (err) {
			next(err);
		}
		else {
			req.controllerData = merge(req.controllerData, extdata);
			next();
		}
	});
};

var extensions_index = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/extensions/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = merge({
			pagedata: {
				title: 'Extensions',
				toplink: '&raquo; Extension index',
				// headerjs: ['/extensions/periodicjs.ext.admin/js/settings.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			user: req.user
		}, req.controllerData);

	/*
			themes: req.controllerData.themes,
			themesettings: req.controllerData.themesettings,
		appsettings: req.controllerData.appsettings,
		config: req.controllerData.config,
	 */
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var themecmd = {
	search: function (options) {
		process.stdout.write('search all themes ' + options.q);
		return options;
	},
	install: function (options) {
		console.log('install theme  ' + options.n);
	}
};

var extcmd = {
	search: function (options) {
		process.stdout.write('search all themes ' + options.q);
		return options;
	},
	install: function (options) {
		console.log('install theme  ' + options.n);
	}
};

var themesearch = function (options, callback) {
	var req = options.req;
	var searchterm = req.query.search;
	var themedir = path.resolve(process.cwd(), 'content/themes/'),
		returnFiles = [];
	fs.readdir(themedir, function (err, files) {
		if (err) {
			callback(err, null);
		}
		else {
			if (files) {
				for (var x = 0; x < files.length; x++) {
					if (files[x].match('periodicjs.theme') && files[x].match(searchterm)) {
						returnFiles.push({
							_id: files[x],
							name: files[x],
							themename: files[x],
							active: (files[x] === appSettings.theme) ? true : false,
							createdat: new Date(),
							updatedat: new Date()
						});
					}
				}
			}
			callback(null, {
				themelimit: req.query.limit,
				themeoffset: req.query.offset || 0,
				themepage_current: 1,
				themepage_next: 1,
				themepage_prev: 1,
				themepages: 1,
				themes: returnFiles,
				themescount: returnFiles.length
			});
		}
	});
};

var loadThemes = function (req, res, next) {
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	themesearch({
		req: req,
		res: res,
	}, function (err, themedata) {
		if (err) {
			next(err);
		}
		else {
			req.controllerData = merge(req.controllerData, themedata);
			next();
		}
	});
};

var themes_index = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/themes/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = merge({
			pagedata: {
				title: 'Themes',
				toplink: '&raquo; Theme index',
				// headerjs: ['/extensions/periodicjs.ext.admin/js/settings.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			user: req.user
		}, req.controllerData);

	/*
			themes: req.controllerData.themes,
			themesettings: req.controllerData.themesettings,
		appsettings: req.controllerData.appsettings,
		config: req.controllerData.config,
	 */
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var extensionsearch = function (options, callback) {
	var req = options.req;
	var searchterm = req.query.search;
	var returnExtensions = [];

	CoreExtension.getExtensions({
			periodicsettings: appSettings
		},
		function (err, extensions) {
			if (err) {
				callback(err, null);
			}
			else {
				for (var x = 0; x < extensions.length; x++) {
					if (extensions[x].name.match('periodicjs.ext') && extensions[x].name.match(searchterm)) {
						extensions[x]._id = extensions[x].name;
						extensions[x].createdat = extensions[x].date;
						extensions[x].updatedat = extensions[x].date;
						returnExtensions.push(extensions[x]);
					}
				}
				callback(null, {
					extensionlimit: req.query.limit,
					extensionoffset: req.query.offset || 0,
					extensionpage_current: 1,
					extensionpage_next: 1,
					extensionpage_prev: 1,
					extensionpages: 1,
					extensions: returnExtensions,
					extensionscount: returnExtensions.length
				});
			}
		});
};

var checkDeleteUser = function (req, res, next) {
	if ((req.user.activated || req.user.accounttype || req.user.userroles) && !User.hasPrivilege(req.user, 760)) {
		var err = new Error('EXT-UAC760: You don\'t have access to modify user access');
		next(err);
	}
	else {
		next();
	}
};

var checkUserValidation = function (req, res, next) {
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	// console.log('loginSettings', loginSettings);
	req.controllerData.checkuservalidation = loginSettings.new_user_validation;
	req.controllerData.checkuservalidation.useComplexity = loginSettings.complexitySettings.useComplexity;
	req.controllerData.checkuservalidation.complexity = loginSettings.complexitySettings.settings.weak;
	next();
};

/**
 * application settings and theme settings page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var settings_index = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/settings/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Application Settings',
				toplink: '&raquo; Application Settings',
				// headerjs: ['/extensions/periodicjs.ext.admin/js/settings.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			themesettings: req.controllerData.themesettings,
			appsettings: req.controllerData.appsettings,
			config: req.controllerData.config,
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

/**
 * settings faq page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var settings_faq = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/settings/faq',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Application Quick Help',
				toplink: '&raquo; FAQ',
				// headerjs: ['/extensions/periodicjs.ext.admin/js/settings.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var skip_population = function (req, res, next) {
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	req.controllerData.skip_population = true;
	next();
};

var revision_delete = function (req, res, next) {
	var entitytype = req.params.entitytype || req.query.entitytype || req.controllerData.entitytype || req.body.entitytype;
	var revisionindex = req.params.revisionindex;
	var updatedoc = {
		docid: req.params.id
	};
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	req.controllerData.encryptFields = true;

	if (typeof req.controllerData[entitytype].toJSON === 'function') {
		updatedoc = merge(updatedoc, req.controllerData[entitytype].toJSON());
	}
	else if (typeof req.controllerData[entitytype].toObject === 'function') {
		updatedoc = merge(updatedoc, req.controllerData[entitytype].toObject());
	}
	else {
		updatedoc = merge(updatedoc, req.controllerData[entitytype]);
	}
	updatedoc.docid = req.params.id;

	delete updatedoc._id;
	delete updatedoc.__v;
	updatedoc.changes.splice(revisionindex, 1);
	req.saverevision = false;
	req.body = updatedoc;
	next();
};

var revision_revert = function (req, res, next) {
	var entitytype = req.params.entitytype || req.query.entitytype || req.controllerData.entitytype || req.body.entitytype;
	var revisionindex = req.params.revisionindex;
	var updatedoc = {
		docid: req.params.id
	};
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	req.controllerData.encryptFields = true;

	if (typeof req.controllerData[entitytype].toJSON === 'function') {
		updatedoc = merge(updatedoc, req.controllerData[entitytype].toJSON());
	}
	else if (typeof req.controllerData[entitytype].toObject === 'function') {
		updatedoc = merge(updatedoc, req.controllerData[entitytype].toObject());
	}
	else {
		updatedoc = merge(updatedoc, req.controllerData[entitytype]);
	}
	updatedoc.docid = req.params.id;

	delete updatedoc._id;
	delete updatedoc.__v;
	updatedoc = merge(updatedoc, updatedoc.changes[revisionindex].changeset);
	// req.saverevision = false;
	req.body = updatedoc;
	// console.log('req.body ', req.body);
	// console.log('revisionindex ', revisionindex);
	next();
};

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

var get_revision_page = function (options) {
	var entity = get_entity_modifications(options.entity);

	return function (req, res) {
		var pagetitle = (req.controllerData && req.controllerData.revision_page_attribute_title) ? req.controllerData.revision_page_attribute_title : req.controllerData[entity.name].title || req.controllerData[entity.name].name || req.controllerData[entity.name]._id;
		var viewtemplate = {
				viewname: 'p-admin/' + entity.plural_name + '/revisions',
				themefileext: appSettings.templatefileextension
			},

			viewdata = merge(req.controllerData, {
				pagedata: {
					title: entity.capitalized_name + ' Revisions',
					pagetitle: pagetitle,
					toplink: '&raquo;   <a href="/' + adminPath + '/content/' + entity.plural_name + '" class="async-admin-ajax-link">' + entity.capitalized_plural_name + '</a> &raquo; ' + pagetitle + ' &raquo; Revisions',
					extensions: CoreUtilities.getAdminMenu()
				},
				user: req.user
			});
		if (options.extname) {
			viewtemplate.extname = options.extname;
		}
		CoreController.renderView(req, res, viewtemplate, viewdata);
	};
};

var admin_search = function (resources) {
	var periodic = resources;
	return function (req, res) {
		var search_entities = req.body.search_entities || req.query.search_entities || req.controllerData.search_entities || Object.keys(periodic.app.controller.extension.asyncadmin.search);
		if (!Array.isArray(search_entities)) {
			search_entities = search_entities.split(',');
		}
		// console.log('search_entities', search_entities);
		req.query.search = req.query['searchall-input'] || req.query.search;
		req.query.limit = (req.query.limit && req.query.limit < 200) ? req.query.limit : 25;
		var search_response_results = {};

		async.each(search_entities,
			function (key, asyncForEachOfCallback) {
				// value({
				periodic.app.controller.extension.asyncadmin.search[key]({
					req: req,
					res: res
				}, function (err, search_response) {
					if (err) {
						return asyncForEachOfCallback(err);
					}
					else {
						search_response_results[key] = {};
						search_response_results[key][key + 'limit'] = search_response[key + 'limit'];
						search_response_results[key][key + 'offset'] = search_response[key + 'offset'];
						search_response_results[key][key + 'page_current'] = search_response[key + 'page_current'];
						search_response_results[key][key + 'page_next'] = search_response[key + 'page_next'];
						search_response_results[key][key + 'page_prev'] = search_response[key + 'page_prev'];
						search_response_results[key][key + 'pages'] = search_response[key + 'pages'];
						search_response_results[key][pluralize(key)] = search_response[pluralize(key)];


						asyncForEachOfCallback();
					}
				});
			},
			function (err) {
				if (err) {
					CoreController.handleDocumentQueryErrorResponse({
						err: err,
						res: res,
						req: req
					});
				}
				else {
					// console.log('search_response_results',search_response_results);
					var viewtemplate = {
							viewname: 'p-admin/home/search',
							themefileext: appSettings.templatefileextension,
							extname: 'periodicjs.ext.asyncadmin'
						},
						viewdata = {
							pagedata: {
								title: 'Admin',
								toplink: 'Search Results &raquo; "' + req.query['searchall-input'] + '" ',
								extensions: CoreUtilities.getAdminMenu()
							},
							search_results: search_response_results,
							search_entities: search_entities,
							user: req.user
						};
					CoreController.renderView(req, res, viewtemplate, viewdata);
				}
			});
	};
};

var get_entity_search = function (options) {
	var entityname = options.entity;

	return function (options, callback) {
		CoreController.controller_model_search_query({
			req: options.req,
			res: options.res,
			orQuery: [],
			controllerOptions: controllerOptions[entityname],
			asyncCallback: callback
		});
	};
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
	CoreController = resources.core.controller;
	CoreUtilities = resources.core.utilities;
	CoreExtension = resources.core.extension;
	Collection = mongoose.model('Collection');
	Compilation = mongoose.model('Compilation');
	Contenttype = mongoose.model('Contenttype');
	Item = mongoose.model('Item');
	User = mongoose.model('User');
	// AppDBSetting = mongoose.model('Setting');
	appenvironment = appSettings.application.environment;
	adminExtSettings = resources.app.controller.extension.asyncadmin.adminExtSettings;
	loginSettings = resources.app.controller.extension.login.loginExtSettings;
	adminPath = resources.app.locals.adminPath;
	controllerOptions = resources.app.controller.native.ControllerSettings;

	return {
		get_entity_modifications: get_entity_modifications,
		get_revision_page: get_revision_page,
		user_revisions: get_revision_page({
			entity: 'user',
			extname: 'periodicjs.ext.asyncadmin'
		}),
		depopulate: CoreController.depopulate,
		revision_delete: revision_delete,
		revision_revert: revision_revert,
		admin_index: admin_index,
		loadExtensions: loadExtensions,
		themes_index: themes_index,
		fixCodeMirrorSubmit: fixCodeMirrorSubmit,
		removePasswordFromAdvancedSubmit: removePasswordFromAdvancedSubmit,
		settings_index: settings_index,
		settings_faq: settings_faq,
		skip_population: skip_population,
		getMarkdownReleases: getMarkdownReleases,
		getHomepageStats: getHomepageStats,
		adminExtSettings: adminExtSettings,
		checkDeleteUser: checkDeleteUser,
		checkUserValidation: checkUserValidation,
		themesearch: themesearch,
		loadThemes: loadThemes,
		extensionsearch: extensionsearch,
		extensions_index: extensions_index,
		get_entity_search: get_entity_search,
		themecmd: themecmd,
		extcmd: extcmd,
		user_search: get_entity_search({
			entity: 'user'
		}),
		admin_search: admin_search(resources)
	};
};

module.exports = controller;
