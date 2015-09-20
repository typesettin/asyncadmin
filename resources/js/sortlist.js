'use strict';

var util = require('util'),
	events = require('events'),
	classie = require('classie'),
	querystring = require('querystring'),
	extend = require('util-extend');

/**
 * A module that represents a sortlist object, a componentTab is a page composition tool.
 * @{@link https://github.com/typesettin/sortlist}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @constructor sortlist
 * @requires module:events
 * @requires module:util-extend
 * @requires module:util
 * @param {object} options configuration options
 * @example 
		sortlist_id: token(),
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
var sortlist = function (options) {
	events.EventEmitter.call(this);
	var defaultOptions = {
		element: {},
		sortkeys: []
	};
	this.options = extend(defaultOptions, options);
	// this.options.element = this.options.element.querySelector('.ts-sortlist-element-container');
	this.options.forbject_name = this.options.element.getAttribute('data-formelement');
	this.init = this.__init;
	this.init();
	// this.addBinder = this._addBinder;
};

util.inherits(sortlist, events.EventEmitter);

var generate_sort_container = function (elem, e, sortkeyslist, forbject_name) {
	var sortkeys = sortkeyslist.split(','),
		set_sq_input_val = function (valEvent) {
			var parentElem = valEvent.target.parentElement,
				hidden_input_value = '';
			if (parentElem.querySelector('.ts-sq-op').value === 'dsc') {
				hidden_input_value += '-';
			}
			hidden_input_value += parentElem.querySelector('.ts-sq-key').value;

			parentElem.querySelector('.ts-sq-h-name').setAttribute('value', hidden_input_value);
			// parentElem.querySelector('.ts-sq-h-name').setAttribute('checked', 'checked');
			window.AdminFormies[forbject_name].setFormElements();
			window.AdminFormies[forbject_name].refresh();

		};


	var sort_query_key_select = document.createElement('select'),
		sort_query_key_op = document.createElement('select'),
		sort_query_span = document.createElement('span'),
		sort_query_sortlabel = document.createElement('span'),
		sort_query_hidden_input = document.createElement('input'),
		sort_query_container = document.createElement('span');

	sort_query_span.innerHTML = '|';
	sort_query_sortlabel.innerHTML = 'sort by ';

	sort_query_hidden_input.setAttribute('name', 'sort');
	sort_query_hidden_input.setAttribute('type', 'hidden');
	sort_query_hidden_input.setAttribute('class', 'ts-sq-h-name ts-hidden');
	// if (precheked) {
	// 	sort_query_hidden_input.setAttribute('checked', 'checked');
	// }
	sort_query_hidden_input.setAttribute('value', '');

	// sort_query_hidden_input.type = 'hidden';

	sort_query_key_select.setAttribute('class', 'ts-sq-key ts-button ts-button-transparent');
	sortkeys.forEach(function (fkey) {
		sort_query_key_select.innerHTML += '<option value="' + fkey + '">' + fkey + '</option>';
	});

	sort_query_key_op.setAttribute('class', 'ts-sq-op ts-button ts-button-transparent');
	sort_query_key_op.innerHTML = '<option value="dsc"> desc </option>';
	sort_query_key_op.innerHTML += '<option value="asc"> asc </option>';

	sort_query_container.appendChild(sort_query_sortlabel);
	sort_query_container.appendChild(sort_query_key_select);
	sort_query_container.appendChild(sort_query_key_op);
	sort_query_container.appendChild(sort_query_hidden_input);
	sort_query_container.appendChild(sort_query_span);
	elem.innerHTML = '';
	elem.appendChild(sort_query_container);

	// sort_query_key_select.addEventListener('change', set_sq_input_val, false);
	// sort_query_key_op.addEventListener('change', set_sq_input_val, false);
	sort_query_key_select.addEventListener('change', set_sq_input_val, false);
	sort_query_key_op.addEventListener('change', set_sq_input_val, false);

	if (e.generate_from_url) {
		sort_query_key_select.value = e.key_select_from_url;
		sort_query_key_op.value = e.op_select_from_url;
		sort_query_hidden_input.value = e.hidden_select_from_url;
	}
};

var go_to_page = function (pagenum) {
	document.querySelector('.pagenum-input').value = pagenum;
	window.AdminFormies['search-options-form'].refresh();
};

var next_page_click_handler = function () {
	go_to_page(parseInt(document.querySelector('.pagenum-input').value) + 1);
};

var prev_page_click_handler = function () {
	go_to_page(parseInt(document.querySelector('.pagenum-input').value) - 1);
};

/**
 * sets detects support for history push/pop/replace state and can set initial data
 * @emits initialized
 */
sortlist.prototype.__init = function () {
	var windowqueryobj = querystring.parse(window.location.search),
		e = {};
	if (windowqueryobj.sort) {
		e = ({
			generate_from_url: true,
			key_select_from_url: (windowqueryobj.sort.charAt(0) === '-') ? windowqueryobj.sort.substr(1) : windowqueryobj.sort,
			op_select_from_url: (windowqueryobj.sort.charAt(0) === '-') ? 'dsc' : 'asc',
			hidden_select_from_url: windowqueryobj.sort,
		});
		// generate_sort_container(this.options.element, e, this.options.sortkeys, this.options.forbject_name, true);
	}
	generate_sort_container(this.options.element, e, this.options.sortkeys, this.options.forbject_name);
	var next_search_button = document.querySelector('.search-filter-next-page');
	var prev_search_button = document.querySelector('.search-filter-prev-page');
	if (next_search_button) {
		next_search_button.addEventListener('click', next_page_click_handler, false);
	}
	if (prev_search_button) {
		prev_search_button.addEventListener('click', prev_page_click_handler, false);
	}

	this.emit('initialized');
};
module.exports = sortlist;
