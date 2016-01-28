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

var uniq_fast = function (a) {
	var seen = {};
	var out = [];
	var len = a.length;
	var j = 0;
	for (var i = 0; i < len; i++) {
		var item = a[i];
		if (seen[item] !== 1) {
			seen[item] = 1;
			out[j++] = item;
		}
	}
	return out;
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
	var handleSearchMenuContentClick = function (e) {
		var etarget = e.target,
			newtaxdata = {};
		// console.log('before self.options.taxfields[etarget.getAttribute(data-fieldname)]', self.options.taxfields[etarget.getAttribute('data-fieldname')]);
		if (classie.has(etarget, 'add-taxonomy')) {
			try {
				if (!document.querySelector('[name="docid"]') && window.showServerNotification) {
					window.showServerNotification({
						type: 'error',
						message: 'please save before adding taxonomy'
					});
				}
				newtaxdata = {
					_id: etarget.getAttribute('data-id'),
					id: etarget.getAttribute('data-id'),
					title: etarget.getAttribute('data-labeltouse'),
					name: etarget.getAttribute('data-labeltouse'),
					fileurl: etarget.getAttribute('data-fileurl'),
					assettype: etarget.getAttribute('data-assettype'),
				};
				if (etarget.getAttribute('data-mappingtype') === 'array') {
					self.options.taxfields[etarget.getAttribute('data-fieldname')].field_data.push(newtaxdata);
				}
				else {
					self.options.taxfields[etarget.getAttribute('data-fieldname')].field_data = newtaxdata;
				}
			}
			catch (e) {
				console.error(e);
			}

			// console.log('after self.options.taxfields[etarget.getAttribute(data-fieldname)]', self.options.taxfields[etarget.getAttribute('data-fieldname')]);

			// console.log('handleSearchMenuContentClick e.target', e.target);
			self.__updateBindie();
		}
	};
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
					responsedata.body.taxfields = self.options.taxfields;
					searchhtml = ejs.render(self.options.search_result_template, responsedata.body);
					self.options.search_menu_content.innerHTML = searchhtml;
					// console.log('responsedata.body', responsedata.body);
					// 
				});
		}
		catch (e) {
			window.handleUncaughtError(e, 'ajax page error');
		}
	};
	var search_filter_select_handler = function () {
		self.options.element.setAttribute('data-search-entities', this.value);
		if (this.value.match(/\,/gi)) {
			self.options.element.setAttribute('placeholder', self.options.element.getAttribute('data-original-placeholder'));
		}
		else {
			self.options.element.setAttribute('placeholder', 'Search ' + pluralize.plural(this.value));
		}
	};
	var create_filter_select_handler = function () {
		window.AdminModal.show('new-' + this.value + '-modal');
	};
	var tax_prop_container = document.querySelector(self.options.element.getAttribute('data-taxprops-selector')),
		t;
	// self.options.element.addEventListener('keydown', debounce(self.search_menu_callback.apply(self), 200), false);
	tax_prop_container.addEventListener('click', function (e) {
		var etarget = e.target;
		if (classie.has(etarget, 'ts-tax-clear-button')) {
			document.querySelector('#' + etarget.getAttribute('data-span-container')).innerHTML = '<input style="display:none;" type="checkbox" checked="checked" name="' + etarget.getAttribute('data-field-name') + '" value="!!--EMPTY--' + etarget.getAttribute('data-field-mapping-type') + '--EMTPY--!!"/>';

			if (self.options.formietosubmit && window.AdminFormies[self.options.formietosubmit]) {
				window.AdminFormies[self.options.formietosubmit].submit();
			}



			if (etarget.getAttribute('data-field-mapping-type') === 'array') {
				self.options.taxfields[etarget.getAttribute('data-field-name')].field_data = [];
			}
			else {
				self.options.taxfields[etarget.getAttribute('data-field-name')].field_data = '';
			}
			// self.__updateBindie();

			// t = setTimeout(function () {
			// 	self.__updateBindie();
			// 	clearTimeout(t);
			// }, 200);
		}
		// console.log('tax_prop_container etarget', etarget);
	}, false)
	self.options.element.addEventListener('keyup', debounce(search_menu_callback, 200), false);
	self.options.search_menu_content.addEventListener('click', handleSearchMenuContentClick, false);
	self.options.search_filter_select.addEventListener('change', search_filter_select_handler, false);
	self.options.create_filter_select.addEventListener('change', create_filter_select_handler, false);
};


tstagmanager.prototype.__updateBindie = function () {
	var new_taxfields = this.options.taxfields;
	this.options.tagmanbindie.update({
		data: {
			taxfields: {
				taxfields: new_taxfields
			}

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
	this.options.presetdata_prefix = this.options.element.getAttribute('data-presetdata-prefix');
	this.options.bindie_template_element = document.querySelector(this.options.element.getAttribute('data-taxman-template-selector'));
	this.options.search_menu_content = document.querySelector(this.options.element.getAttribute('data-searchresults-selector'));
	this.options.create_filter_select = document.querySelector(this.options.element.getAttribute('data-create-filter-selector'));
	this.options.search_filter_select = document.querySelector(this.options.element.getAttribute('data-filter-selector'));
	// this.options.search_entities = this.options.element.getAttribute('data-search-entities').split(',');
	this.options.search_entities = [];
	this.options.createable_entities = [];
	this.options.taxfields = {};
	this.options.element.getAttribute('data-taxonomy-fields').split(',').forEach(function (taxfield) {
		var taxfieldarray = taxfield.split(':');
		self.options.taxfields[taxfieldarray[0]] = {
			field_name: taxfieldarray[0],
			field_mapping_type: taxfieldarray[1],
			field_entity_type: taxfieldarray[2],
			field_media_type: taxfieldarray[3],
			field_createable: taxfieldarray[4]
		};
		self.options.search_entities.push(taxfieldarray[2]);
		if (taxfieldarray[4] === 'createable') {
			self.options.createable_entities.push(taxfieldarray[2]);
		}
		// console.log(self.options.presetdata_prefix + taxfieldarray[0], 'window[self.options.presetdata_prefix + taxfieldarray[0]]', window[self.options.presetdata_prefix + taxfieldarray[0]]);
		if (window[self.options.presetdata_prefix + taxfieldarray[0]]) {
			self.options.taxfields[taxfieldarray[0]].field_data = window[self.options.presetdata_prefix + taxfieldarray[0]];
		}
	});

	this.options.formietosubmit = (this.options.element.getAttribute('data-ajax-formie') && this.options.element.getAttribute('data-ajax-formie') !== null) ? this.options.element.getAttribute('data-ajax-formie') : false;
	this.options.tagmanbindie = new Bindie({
		ejsdelimiter: '?'
	});

	bindie_template_element = this.options.bindie_template_element;

	this.options.tagmanbindie.addBinder({
		prop: 'taxfields',
		elementSelector: this.options.element.getAttribute('data-taxprops-selector'),
		binderType: 'template',
		binderTemplate: bindie_template_element.innerHTML,
		binderCallback: function (cbdata) {
			// console.log('cbdata', cbdata);
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

	this.__updateBindie();


	//set other elements
	this.options.search_entities = uniq_fast(this.options.search_entities);
	this.options.createable_entities = uniq_fast(this.options.createable_entities);
	this.options.element.setAttribute('data-original-placeholder', this.options.element.getAttribute('placeholder'));
	this.options.element.setAttribute('data-search-entities', this.options.search_entities.join(','));
	var filterselectinnerhtml = '<option value="' + this.options.element.getAttribute('placeholder') + '">Search All</option>';
	this.options.search_entities.forEach(function (entity) {
		filterselectinnerhtml += '<option value="' + entity + '">' + capitalize(pluralize(entity)) + '</option>';
	});
	this.options.search_filter_select.innerHTML = filterselectinnerhtml;
	var createselectinnerhtml = '<option value="">Create new ...</option>';
	if (this.options.createable_entities.length < 1) {
		this.options.create_filter_select.parentElement.style.display = 'none';
	}
	else {
		this.options.createable_entities.forEach(function (entity) {
			createselectinnerhtml += '<option value="' + entity + '"> Create new ' + capitalize(entity) + '</option>';
		});
		this.options.create_filter_select.innerHTML = createselectinnerhtml;
	}


	initializing = false;

	this.emit('initialized');
};
module.exports = tstagmanager;
