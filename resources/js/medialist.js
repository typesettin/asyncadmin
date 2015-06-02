'use strict';

var util = require('util'),
	events = require('events'),
	classie = require('classie'),
	extend = require('util-extend'),
	request = require('superagent'),
	Bindie = require('bindie');

var get_checkbox_template = function () {
	return document.querySelector('#compose_assets_template').innerHTML; //returnTemplateHTML;
};

var makeNiceName = function (makenicename) {
	return makenicename.replace(/[^a-z0-9]/gi, '-').toLowerCase();
};

/**
 * A module that represents a tsmedialist object, a componentTab is a page composition tool.
 * @{@link https://github.com/typesettin/tsmedialist}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @constructor tsmedialist
 * @requires module:events
 * @requires module:util-extend
 * @requires module:util
 * @param {object} options configuration options
 * @example 
		tsmedialist_id: token(),
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
var tsmedialist = function (options) {
	events.EventEmitter.call(this);
	var defaultOptions = {
		element: {},
		dataitems: {}
	};
	this.options = extend(defaultOptions, options);
	this.init = this.__init;
	this.init();
	// this.addBinder = this._addBinder;
};

util.inherits(tsmedialist, events.EventEmitter);

tsmedialist.prototype.__updateBindie = function () {
	var new_data_items = this.options.dataitems;
	this.options.medialistbindie.update({
		data: {
			dataitems: {
				dataelements: new_data_items
			}
		}
	});
};

var get_data_element_doc = function (options) {
	var data = options.data,
		ajaxprop = options.ajaxprop,
		returnObject = {
			id: data._id,
			name: data.name,
			title: data.title,
			checkboxname: ajaxprop,
			source_data: options.data,
			primaryasset: options.primaryasset
		};
	return returnObject;
};

tsmedialist.prototype.__addValueToDataList = function () {
	// var _csrfToken = document.querySelector('input[name="_csrf"]');
	// this.options.inputelement.disabled = 'disabled';
	window.AdminFormies[this.options.formietosubmit].submit();
};


/**
 * sets detects support for history push/pop/replace state and can set initial data
 * @emits initialized
 */
tsmedialist.prototype.__init = function () {
	var medialistcontainer = document.createElement('div'),
		medialistelement = document.createElement('datalist'),
		selectelement = document.createElement('select'),
		checkboxcontainerelement = document.createElement('div'),
		inputelementcontainer = document.createElement('div'),
		inputelement = document.createElement('input'),
		submitbuttonelement = document.createElement('input'),
		initialinputelement = this.options.element,
		presetdata,
		initializing = true;

	checkboxcontainerelement.id = 'medialist-tagged-cb-container-' + this.options.element.id;
	classie.add(checkboxcontainerelement, 'ts-medialist-cb');
	checkboxcontainerelement.addEventListener('click', function (e) {
		console.log(e.target);
		if (classie.has(e.target, 'medialistcheckbox')) {
			if (e.target.checked === false) {
				delete this.options.dataitems[e.target.value];
				this.__updateBindie();
			}
			// console.log('e.target.checked', e.target.checked);
		}
		else if (classie.has(e.target, 'primaryassetlistcheckbox')) {
			var all_primary_asset_id = document.querySelector('#' + this.options.checkboxcontainerelementid).querySelectorAll('.primaryassetlistcheckbox');
			for (var p = 0; p < all_primary_asset_id.length; p++) {
				all_primary_asset_id[p].checked = false;
				all_primary_asset_id[p].removeAttribute('checked');
			}
			e.target.setAttribute('checked', 'checked');
			e.target.checked = true;
			this.__addValueToDataList();
		}
	}.bind(this), false);
	this.options.parentElement = this.options.element.parentElement;

	this.options.ajaxprop = this.options.element.getAttribute('data-ajax-prop');
	this.options.primaryasset = window[this.options.element.getAttribute('data-ajax-setprimaryasset-variable')];
	this.options.elementid = this.options.element.id;
	this.options.inputelement = inputelement;
	this.options.checkboxcontainerelementid = checkboxcontainerelement.id;
	this.options.ajaxhref = this.options.element.getAttribute('data-ajax-source');

	inputelementcontainer.setAttribute('class', 'ts-row ts-form-row');
	inputelement.setAttribute('class', 'ts-col-span12 ts-button');
	inputelement.name = this.options.element.name;
	inputelement.id = this.options.element.id;
	inputelement.title = this.options.element.title;
	inputelement.type = this.options.element.type;
	inputelement.setAttribute('multiple', 'multiple');
	inputelement.setAttribute('placeholder', this.options.element.getAttribute('placeholder'));
	inputelement.setAttribute('data-bindiecallback', initialinputelement.getAttribute('data-bindiecallback'));
	inputelement.setAttribute('data-ajax-setdata-variable', this.options.element.getAttribute('data-ajax-setdata-variable'));
	inputelement.setAttribute('data-ajax-formie', this.options.element.getAttribute('data-ajax-formie'));

	inputelement.addEventListener('keydown', function (e) {
		if (e.which === 13 || e.keyCode === 13) {
			this.__addValueToDataList();
		}
	}.bind(this), false);


	inputelement.addEventListener('change', function () {
		window.AdminFormies[this.options.formietosubmit].submit();
	}.bind(this), false);

	submitbuttonelement.setAttribute('class', 'ts-col-span4 ts-button ts-text-center');
	submitbuttonelement.value = 'add';
	submitbuttonelement.type = 'button';
	submitbuttonelement.addEventListener('click', function () {
		this.__addValueToDataList();
	}.bind(this), false);

	inputelementcontainer.appendChild(inputelement);
	// inputelementcontainer.appendChild(submitbuttonelement);
	medialistelement.appendChild(selectelement);
	medialistcontainer.appendChild(medialistelement);
	medialistcontainer.appendChild(inputelementcontainer);
	medialistcontainer.appendChild(checkboxcontainerelement);
	this.options.parentElement.appendChild(medialistcontainer);
	this.options.parentElement.removeChild(this.options.element);

	if (this.options.inputelement.getAttribute('data-ajax-formie')) {
		this.options.formietosubmit = this.options.inputelement.getAttribute('data-ajax-formie');
	}
	this.options.medialistbindie = new Bindie({
		ejsdelimiter: '?'
	});
	this.options.medialistbindie.addBinder({
		prop: 'dataitems',
		elementSelector: '#' + checkboxcontainerelement.getAttribute('id'),
		binderType: 'template',
		binderTemplate: get_checkbox_template(),
		binderCallback: function (cbdata) {
			console.log('cbdata', cbdata);
			var successsubmitFunctionString = inputelement.getAttribute('data-bindiecallback'),
				successfn = window[successsubmitFunctionString];
			// is object a function?
			if (typeof successfn === 'function') {
				successfn(cbdata);
			}
			if (this.options.formietosubmit && initializing === false) {
				window.AdminFormies[this.options.formietosubmit].submit();
			}
		}.bind(this)
	});

	if (this.options.inputelement.getAttribute('data-ajax-setdata-variable')) {
		presetdata = window[this.options.inputelement.getAttribute('data-ajax-setdata-variable')];
		if (presetdata) {
			for (var w = 0; w < presetdata.length; w++) {
				this.options.dataitems[presetdata[w]._id] = get_data_element_doc({
					data: presetdata[w],
					ajaxprop: this.options.ajaxprop,
					primaryasset: this.options.primaryasset
				});
			}
			this.__updateBindie();
		}
	}
	initializing = false;

	this.emit('initialized');
};
module.exports = tsmedialist;
