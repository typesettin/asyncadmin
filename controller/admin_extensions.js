'use strict';

var async = require('async'),
	path = require('path'),
	request = require('superagent'),
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
	logger;


var extcmd = {
	search: function (options) {
		// console.log('options', options);
		var output = this.outputStream;
		var searchQuery = options._[2] || options.q || '';
		output.write('searching github for extensions named: periodicjs.ext.' + searchQuery);
		// console.log('searching github for extensions named: periodicjs.ext.' + searchQuery);
		// console.log('search this', this);
		request
			.get('https://api.github.com/search/repositories')
			.query({
				q: 'periodicjs.ext.' + searchQuery
			})
			.set('Accept', 'application/json')
			.end(function (error, res) {
				// console.log('res.body.items', res.body.items);
				if (error) {
					output.write(error.message);
				}
				else if (!res.body.items) {
					output.write('could not find periodicjs.ext.' + searchQuery + ' on github');
				}
				else {
					var returnhtml = '<p><strong>Search Results:</strong></p><ul>';
					res.body.items.forEach(function (ext) {
						returnhtml += '<li><span data-prefill-admin-input="execCommand extension install periodicjs.ext.' + ext.name + '" style="cursor:pointer">periodicjs.ext.' + ext.name + '</span> <br><a class="ts-text-xs" target="_blank" href="' + ext.html_url + '">' + ext.full_name + '</a></li>';
					});
					returnhtml += '</ul><p> To install, example: <span class="ts-text-light-primary-color" data-prefill-admin-input="execCommand extension install periodicjs.ext.example" style="cursor:pointer">execCommand extension install <em>periodicjs.ext.example</em></span>';
					output.write(returnhtml);

				}
			});
		return options;
	},
	install: function (options) {
		console.log('install theme  ' + options.n);
	}
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
	return {
		extcmd: extcmd
	};
};

module.exports = controller;
