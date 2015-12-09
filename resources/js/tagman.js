'use strict';
var debounce = require('debounce');

var util = require('util'),
	events = require('events'),
	moment = require('moment'),
	ejs = require('ejs'),
	capitalize = require('capitalize'),
	pluralize = require('pluralize'),
	classie = require('classie'),
	data_tables = require('../../controller/data_tables'),
	extend = require('util-extend'),
	request = require('superagent'),
	Bindie = require('bindie');
ejs.delimiter = '?';

var get_checkbox_template = function () {
	return document.querySelector('#compose_taxonomies_template').innerHTML; //returnTemplateHTML;
};

var makeNiceName = function (makenicename) {
	return makenicename.replace(/[^a-z0-9]/gi, '-');
};

/**
 * A module that represents a tstagmanager object, a componentTab is a page composition tool.
 * @{@link https://github.com/typesettin/tstagmanager}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @constructor tstagmanager
 * @requires module:events
 * @requires module:util-extend
 * @requires module:util
 * @param {object} options configuration options
 * @example 
		tstagmanager_id: token(),
		push_state_support: true,
		replacecallback: function (data) {
			console.log(data);
		},
		popcallback: function (data) {
			console.log(data);
		},
		pushcallback: function (data) {
			console.log(data);
		}
 */
var tstagmanager = function (options) {
	events.EventEmitter.call(this);
	var defaultOptions = {
		element: {},
		dataitems: {}
	};
	this.options = extend(defaultOptions, options);
	this.init = this.__init;
	this.init();
	this.initEventListeners();
	// this.addBinder = this._addBinder;
};

util.inherits(tstagmanager, events.EventEmitter);
tstagmanager.prototype.initEventListeners = function () {
	var self = this;
	var search_menu_callback = function () {
		var searchhtml = '';
		try {
			self.options.search_menu_content.innerHTML = 'Seaching...';
			request
				.get('/p-admin/content/search')
				.set('x-csrf-token', document.querySelector('input[name=_csrf]').value)
				.set('Accept', 'application/json')
				.query({
					search_entities: self.options.element.getAttribute('data-search-entities'),
					format: 'json',
					_csrf: document.querySelector('input[name=_csrf]').value,
					'searchall-input': this.value
				})
				.end(function (err, responsedata) {
					responsedata.body.moment = moment;
					responsedata.body.capitalize = capitalize;
					responsedata.body.pluralize = pluralize;
					responsedata.body.data_tables = data_tables;
					searchhtml = ejs.render(self.options.search_result_template, responsedata.body);
					self.options.search_menu_content.innerHTML = searchhtml;
					console.log('responsedata.body', responsedata.body);
					// 
				});
		}
		catch (e) {
			window.handleUncaughtError(e, 'ajax page error');
		}
	};
	// self.options.element.addEventListener('keydown', debounce(self.search_menu_callback.apply(self), 200), false);
	self.options.element.addEventListener('keyup', debounce(search_menu_callback, 200), false);
};


tstagmanager.prototype.__updateBindie = function () {
	var new_taxdata = this.options.taxdata;
	this.options.tagmanbindie.update({
		data: {
			taxdata: new_taxdata

		}
	});
};

// var get_data_element_doc = function (options) {
// 	var data = options.data,
// 		ajaxprop = options.ajaxprop,
// 		returnObject = {
// 			id: data._id,
// 			name: data.name,
// 			title: data.title,
// 			checkboxname: ajaxprop,
// 			source_data: options.data
// 		};
// 	return returnObject;
// };

// var get_generic_doc = function (options) {
// 	var dataobjtouse = options.data;
// 	// console.log('dataobjtouse', dataobjtouse);
// 	dataobjtouse.name = (dataobjtouse.username) ? dataobjtouse.username : dataobjtouse.name;
// 	dataobjtouse.title = (dataobjtouse.username) ? dataobjtouse.username : dataobjtouse.title;
// 	return dataobjtouse;
// };


/**
 * sets detects support for history push/pop/replace state and can set initial data
 * @emits initialized
 */
tstagmanager.prototype.__init = function () {
	var initializing = true,
		bindie_template_element,
		self = this,
		inputelement = this.options.element;

	this.options.search_result_template = document.querySelector(this.options.element.getAttribute('data-searchresults-template-selector')).innerHTML;
	this.options.bindie_template_element = document.querySelector(this.options.element.getAttribute('data-taxman-template-selector'));
	this.options.search_menu_content = document.querySelector(this.options.element.getAttribute('data-searchresults-selector'));
	this.options.search_entities = this.options.element.getAttribute('data-search-entities').split(',');
	this.options.taxfields = {};
	this.options.element.getAttribute('data-taxonomy-fields').split(',').forEach(function (taxfield) {
		var taxfieldarray = taxfield.split(':');
		self.options.taxfields[taxfieldarray[2]] = {
			field_name: taxfieldarray[0],
			field_mapping_type: taxfieldarray[1],
			field_entity_type: taxfieldarray[2],
			field_media_type: taxfieldarray[3],
			field_createable: taxfieldarray[4]
		};
	});
	this.options.taxdata = {
		taxfields: this.options.taxfields
	};

	this.options.formietosubmit = (this.options.element.getAttribute('data-ajax-formie') && this.options.element.getAttribute('data-ajax-formie') !== null) ? this.options.element.getAttribute('data-ajax-formie') : false;
	this.options.tagmanbindie = new Bindie({
		ejsdelimiter: '?'
	});

	bindie_template_element = this.options.bindie_template_element;

	this.options.tagmanbindie.addBinder({
		prop: 'taxdata',
		elementSelector: this.options.element.getAttribute('data-taxprops-selector'),
		binderType: 'template',
		binderTemplate: bindie_template_element.innerHTML,
		binderCallback: function (cbdata) {
			var successsubmitFunctionString = inputelement.getAttribute('data-bindiecallback'),
				successfn = window[successsubmitFunctionString];
			// is object a function?
			if (typeof successfn === 'function') {
				successfn(cbdata);
			}
			if (this.options.formietosubmit && initializing === false && window.AdminFormies[this.options.formietosubmit]) {
				window.AdminFormies[this.options.formietosubmit].submit();
			}
		}.bind(this)
	});

	// if (this.options.inputelement.getAttribute('data-ajax-setdata-variable')) {
	// 	presetdata = window[this.options.inputelement.getAttribute('data-ajax-setdata-variable')];
	// 	if (presetdata) {
	// 		for (var z = 0; z < presetdata.length; z++) {
	// 			this.options.dataitems[presetdata[z]._id] = get_data_element_doc({
	// 				data: get_generic_doc({
	// 					data: presetdata[z]
	// 				}),
	// 				ajaxprop: this.options.ajaxprop
	// 			});
	// 		}
	// 		this.__updateBindie();
	// 	}
	// }
	this.__updateBindie();
	initializing = false;

	this.emit('initialized');
};
module.exports = tstagmanager;
