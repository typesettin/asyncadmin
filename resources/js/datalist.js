'use strict';

var util = require('util'),
	events = require('events'),
	classie = require('classie'),
	extend = require('util-extend'),
	request = require('superagent'),
	Bindie = require('bindie');

var get_checkbox_template = function () {
	return document.querySelector('#compose_taxonomies_template').innerHTML; //returnTemplateHTML;
};

var makeNiceName = function (makenicename) {
	return makenicename.replace(/[^a-z0-9]/gi, '-');
};

/**
 * A module that represents a tsdatalist object, a componentTab is a page composition tool.
 * @{@link https://github.com/typesettin/tsdatalist}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @constructor tsdatalist
 * @requires module:events
 * @requires module:util-extend
 * @requires module:util
 * @param {object} options configuration options
 * @example 
		tsdatalist_id: token(),
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
var tsdatalist = function (options) {
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

util.inherits(tsdatalist, events.EventEmitter);

tsdatalist.prototype.__updateBindie = function () {
	var new_data_items = this.options.dataitems;
	this.options.datalistbindie.update({
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
			source_data: options.data
		};
	return returnObject;
};

var get_generic_doc = function (options) {
	var dataobjtouse = options.data;
	dataobjtouse.name = (dataobjtouse.username) ? dataobjtouse.username : dataobjtouse.name;
	dataobjtouse.title = (dataobjtouse.username) ? dataobjtouse.username : dataobjtouse.title;
	return dataobjtouse;
};

tsdatalist.prototype.__addValueToDataList = function () {
	var _csrfToken = document.querySelector('input[name="_csrf"]');
	this.options.inputelement.disabled = 'disabled';
	request
		.post(this.options.ajaxhref + '/' + makeNiceName(this.options.inputelement.value))
		.set({
			_csrf: _csrfToken.value,
			Accept: 'application/json'
		})
		.send({
			format: 'json',
			_csrf: _csrfToken.value,
			title: this.options.inputelement.value
		})
		.query({
			format: 'json',
		})
		.end(function (err, res) {
			this.options.inputelement.removeAttribute('disabled');
			if (err) {
				if (window.showErrorNotificaton) {
					window.showErrorNotificaton({
						message: err.message
					});
				}
				else {
					console.error(err);
				}
			}
			else if (res.body.error) {
				window.showErrorNotificaton({
					message: res.body.error
				});
			}
			else if (res.body.data && res.body.data.error) {
				window.showErrorNotificaton({
					message: 'could not add data: ' + res.body.data.error
				});
			}
			else {
				var dataobjectresponse = (res.body.data) ? res.body.data.doc : res.body.author,
					dataobjtouse = get_generic_doc({
						data: dataobjectresponse
					});
				this.options.dataitems[dataobjtouse._id] = get_data_element_doc({
					data: dataobjtouse,
					ajaxprop: this.options.ajaxprop
				});
				this.__updateBindie();

				this.options.inputelement.value = '';
				this.options.inputelement.focus();
				// console.log('this.options', this.options);
			}
			// console.log('err, res', err, res);
		}.bind(this));
};

/**
 * sets detects support for history push/pop/replace state and can set initial data
 * @emits initialized
 */
tsdatalist.prototype.__init = function () {
	var datalistcontainer = document.createElement('div'),
		datalistelement = document.createElement('datalist'),
		selectelement = document.createElement('select'),
		checkboxcontainerelement = document.createElement('div'),
		inputelementcontainer = document.createElement('div'),
		inputelement = document.createElement('input'),
		submitbuttonelement = document.createElement('input'),
		initialinputelement = this.options.element,
		presetdata,
		initializing = true;

	checkboxcontainerelement.id = 'datalist-tagged-cb-container-' + this.options.element.id;
	classie.add(checkboxcontainerelement, 'ts-datalist-cb');
	checkboxcontainerelement.addEventListener('click', function (e) {
		// console.log(e.target);
		if (classie.has(e.target, 'datalistcheckbox')) {
			if (e.target.checked === false) {
				delete this.options.dataitems[e.target.value];
				this.__updateBindie();
			}
			console.log('e.target.checked', e.target.checked);
		}
	}.bind(this), false);
	this.options.parentElement = this.options.element.parentElement;

	this.options.ajaxprop = this.options.element.getAttribute('data-ajax-prop');
	this.options.elementid = this.options.element.id;
	this.options.inputelement = inputelement;
	this.options.ajaxhref = this.options.element.getAttribute('data-ajax-source');

	inputelementcontainer.setAttribute('class', 'ts-row ts-form-row');
	inputelement.setAttribute('class', 'ts-col-span8 ts-button');
	inputelement.id = this.options.element.id;
	inputelement.setAttribute('placeholder', this.options.element.getAttribute('placeholder'));
	inputelement.setAttribute('data-bindiecallback', initialinputelement.getAttribute('data-bindiecallback'));
	inputelement.setAttribute('data-ajax-setdata-variable', this.options.element.getAttribute('data-ajax-setdata-variable'));
	inputelement.setAttribute('data-ajax-formie', this.options.element.getAttribute('data-ajax-formie'));

	inputelement.addEventListener('keydown', function (e) {
		if (e.which === 13 || e.keyCode === 13) {
			this.__addValueToDataList();
		}
	}.bind(this), false);

	submitbuttonelement.setAttribute('class', 'ts-col-span4 ts-button ts-text-center');
	submitbuttonelement.value = 'add';
	submitbuttonelement.type = 'button';
	submitbuttonelement.addEventListener('click', function () {
		this.__addValueToDataList();
	}.bind(this), false);

	inputelementcontainer.appendChild(inputelement);
	inputelementcontainer.appendChild(submitbuttonelement);
	datalistelement.appendChild(selectelement);
	datalistcontainer.appendChild(datalistelement);
	datalistcontainer.appendChild(inputelementcontainer);
	datalistcontainer.appendChild(checkboxcontainerelement);
	this.options.parentElement.appendChild(datalistcontainer);
	this.options.parentElement.removeChild(this.options.element);

	if (this.options.inputelement.getAttribute('data-ajax-formie')) {
		this.options.formietosubmit = this.options.inputelement.getAttribute('data-ajax-formie');
	}
	this.options.datalistbindie = new Bindie({
		ejsdelimiter: '?'
	});
	this.options.datalistbindie.addBinder({
		prop: 'dataitems',
		elementSelector: '#' + checkboxcontainerelement.getAttribute('id'),
		binderType: 'template',
		binderTemplate: get_checkbox_template(),
		binderCallback: function (cbdata) {

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
			for (var z = 0; z < presetdata.length; z++) {
				this.options.dataitems[presetdata[z]._id] = get_data_element_doc({
					data: get_generic_doc({
						data: presetdata[z]
					}),
					ajaxprop: this.options.ajaxprop
				});
			}
			this.__updateBindie();
		}
	}
	initializing = false;

	this.emit('initialized');
};
module.exports = tsdatalist;
