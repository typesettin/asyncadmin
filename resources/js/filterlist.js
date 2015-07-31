'use strict';

var util = require('util'),
	events = require('events'),
	classie = require('classie'),
	querystring = require('querystring'),
	extend = require('util-extend');

/**
 * A module that represents a filterlist object, a componentTab is a page composition tool.
 * @{@link https://github.com/typesettin/filterlist}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @constructor filterlist
 * @requires module:events
 * @requires module:util-extend
 * @requires module:util
 * @param {object} options configuration options
 * @example 
		filterlist_id: token(),
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
var filterlist = function (options) {
	events.EventEmitter.call(this);
	var defaultOptions = {
		element: {},
		filterkeys: []
	};
	this.options = extend(defaultOptions, options);
	this.options.fl_elem_container = this.options.element.querySelector('.ts-filterlist-element-container');
	this.options.forbject_name = this.options.element.getAttribute('data-formelement');
	this.init = this.__init;
	this.init();
	// this.addBinder = this._addBinder;
};

util.inherits(filterlist, events.EventEmitter);

var generate_filter_container = function (elem, e, filterkeyslist, forbject_name, precheked) {
	var filterkeys = filterkeyslist.split(','),
		set_fq_input_val = function (valEvent) {
			var parentElem = valEvent.target.parentElement;
			parentElem.querySelector('.ts-fq-h-name').setAttribute('value', parentElem.querySelector('.ts-fq-key').value + '|||' + parentElem.querySelector('.ts-fq-op').value + '|||' + parentElem.querySelector('.ts-fq-val').value);
			parentElem.querySelector('.ts-fq-h-name').setAttribute('checked', 'checked');
			window.AdminFormies[forbject_name].setFormElements();
			window.AdminFormies[forbject_name].refresh();

		};


	var filter_query_key_select = document.createElement('select'),
		filter_query_key_op = document.createElement('select'),
		filter_query_key_input = document.createElement('input'),
		filter_query_hidden_input = document.createElement('input'),
		filter_query_remove_button = document.createElement('a'),
		filter_query_container = document.createElement('div');

	filter_query_hidden_input.setAttribute('name', 'fq');
	filter_query_hidden_input.setAttribute('type', 'checkbox');
	filter_query_hidden_input.setAttribute('class', 'ts-fq-h-name ts-hidden');
	if (precheked) {
		filter_query_hidden_input.setAttribute('checked', 'checked');
	}
	filter_query_hidden_input.setAttribute('value', '');

	// filter_query_hidden_input.type = 'hidden';

	filter_query_key_select.setAttribute('class', 'ts-fq-key ts-button ts-col-span4');
	filterkeys.forEach(function (fkey) {
		filter_query_key_select.innerHTML += '<option value="' + fkey + '">' + fkey + '</option>';
	});

	filter_query_key_op.setAttribute('class', 'ts-fq-op ts-button ts-col-span2');
	filter_query_key_op.innerHTML = '<option value="is"> = </option>';
	filter_query_key_op.innerHTML += '<option value="like"> % like % </option>';
	filter_query_key_op.innerHTML += '<option value="not"> != </option>';
	filter_query_key_op.innerHTML += '<option value="lt"> < </option>';
	filter_query_key_op.innerHTML += '<option value="lte"> <= </option>';
	filter_query_key_op.innerHTML += '<option value="gt"> > </option>';
	filter_query_key_op.innerHTML += '<option value="gte"> >= </option>';
	filter_query_key_op.innerHTML += '<option value="in">contains any element</option>';
	filter_query_key_op.innerHTML += '<option value="all">contains every element</option>';
	filter_query_key_op.innerHTML += '<option value="not-in">does not contain any element</option>';
	filter_query_key_op.innerHTML += '<option value="exists">exists</option>';
	filter_query_key_op.innerHTML += '<option value="size">size</option>';
	filter_query_key_op.innerHTML += '<option value="is-date">date</option>';
	filter_query_key_op.innerHTML += '<option value="lte-date">before or same date</option>';
	filter_query_key_op.innerHTML += '<option value="lt-date">before date</option>';
	filter_query_key_op.innerHTML += '<option value="gte-date">after or same date</option>';
	filter_query_key_op.innerHTML += '<option value="gt-date">after  date</option>';
	filter_query_key_input.setAttribute('class', 'ts-fq-val ts-button ts-col-span4');

	filter_query_remove_button.innerHTML = 'x';
	filter_query_remove_button.setAttribute('class', 'ts-button remove-ts-filter-button');

	filter_query_container.setAttribute('class', 'ts-form-row ts-row');
	// console.log('e', e);
	// console.log(this.options.filterkeys);
	filter_query_container.appendChild(filter_query_key_select);
	filter_query_container.appendChild(filter_query_key_op);
	filter_query_container.appendChild(filter_query_key_input);
	filter_query_container.appendChild(filter_query_remove_button);
	filter_query_container.appendChild(filter_query_hidden_input);
	elem.appendChild(filter_query_container);
	if (e.generate_from_url) {
		filter_query_key_select.value = e.key_select_from_url;
		filter_query_key_op.value = e.op_select_from_url;
		filter_query_key_input.value = e.input_select_from_url;
		filter_query_hidden_input.value = e.hidden_select_from_url;
	}
	// filter_query_key_select.addEventListener('change', set_fq_input_val, false);
	// filter_query_key_op.addEventListener('change', set_fq_input_val, false);
	filter_query_key_input.addEventListener('change', set_fq_input_val, false);
	filter_query_key_input.addEventListener('blur', set_fq_input_val, false);
};

var addFilterEventHandler = function (e) {
	// console.log('addFilterEventHandler this.options', this.options);
	if (!this.options) {
		this.options = e.contextVar;
	}
	// console.log('addFilterEventHandler this.options', this.options);


	if (classie.has(e.target, 'remove-ts-filter-button')) {
		e.target.parentElement.parentElement.removeChild(e.target.parentElement);

		window.AdminFormies[this.options.forbject_name].setFormElements();
		window.AdminFormies[this.options.forbject_name].refresh();
	}
	else if (classie.has(e.target, 'add-filterlist-button') || e.generate_from_url) {
		generate_filter_container(this.options.fl_elem_container, e, this.options.filterkeys, this.options.forbject_name);
		// AdminFormies["search-options-form"].setFormElements()
	}
};

/**
 * sets detects support for history push/pop/replace state and can set initial data
 * @emits initialized
 */
filterlist.prototype.__init = function () {
	var windowqueryobj = querystring.parse(window.location.search);

	this.options.element.addEventListener('click', addFilterEventHandler.bind(this), false);
	if (windowqueryobj.fq) {
		if (Array.isArray(windowqueryobj.fq) === false) {
			windowqueryobj.fq = new Array(windowqueryobj.fq);
		}
		for (var w = 0; w < windowqueryobj.fq.length; w++) {
			var fquery = windowqueryobj.fq[w],
				fqueryarray = fquery.split('|||'),
				e = ({
					generate_from_url: true,
					key_select_from_url: fqueryarray[0],
					op_select_from_url: fqueryarray[1],
					input_select_from_url: fqueryarray[2],
					hidden_select_from_url: fquery,
				});
			generate_filter_container(this.options.fl_elem_container, e, this.options.filterkeys, this.options.forbject_name, true);
		}
	}
	generate_filter_container(this.options.fl_elem_container, {}, this.options.filterkeys, this.options.forbject_name);

	this.emit('initialized');
};
module.exports = filterlist;
