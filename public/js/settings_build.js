(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var jsonFormElements = function jsonFormElements(options) {
	var returnhtml = '',
	    jsonobject = options.jsonobject,
	    prependinputname = options.prependinputname ? options.prependinputname + '.' : '',
	    readonly = options.readonly ? 'disabled=disabled' : '',
	    idnameprepend = options.idnameprepend ? options.idnameprepend : 'jfe',
	    prependhtml = options.prependhtml ? options.prependhtml : '<div class="ts-row ts-form-row">',
	    appendhtml = options.appendhtml ? options.appendhtml : '</div>',
	    jreoptionvalues = options.jreoptionvalues;

	for (var x in jsonobject) {
		if (x.match('jfe-options-')) {
			jreoptionvalues = jsonobject[x];
			jreoptionvalues.name = x.replace('jfe-options-', '');
		} else if (_typeof(jsonobject[x]) === 'object') {
			returnhtml += jsonFormElements({
				jsonobject: jsonobject[x],
				prependinputname: x,
				readonly: readonly,
				idnameprepend: idnameprepend,
				prependhtml: prependhtml,
				appendhtml: appendhtml,
				jreoptionvalues: jreoptionvalues
			});
		} else {
			var elementid = idnameprepend + '-' + prependinputname + x;
			var elementname = prependinputname + x;
			var elementval = jsonobject[x];
			returnhtml += prependhtml;
			returnhtml += '<label class="ts-col-span3 ts-label" for="' + elementid + '">' + elementname + '</label>';
			if (typeof elementval === 'boolean') {
				var selectOptionsFromBooleanVal = [true, false];
				returnhtml += '<select class="ts-col-span9 noFormSubmit" ';
				if (!options.readonly) {
					returnhtml += ' name="' + elementname + '" ';
				}
				returnhtml += '  >';
				for (var k in selectOptionsFromBooleanVal) {
					returnhtml += '<option ';
					if (selectOptionsFromBooleanVal[k] === elementval) {
						returnhtml += 'selected="selected"';
					}
					returnhtml += ' value="' + selectOptionsFromBooleanVal[k] + '">' + selectOptionsFromBooleanVal[k] + '</option>';
				}
				returnhtml += '</select>';
			} else if (jreoptionvalues && jreoptionvalues.name === x && jreoptionvalues.type === 'array' && jreoptionvalues.value) {
				var selectOptionsFromDefaultVal = jreoptionvalues.value.split(',');
				returnhtml += '<select class="ts-col-span9 noFormSubmit" ';
				if (!options.readonly) {
					returnhtml += ' name="' + elementname + '" ';
				}
				returnhtml += '  >';
				for (var j in selectOptionsFromDefaultVal) {
					returnhtml += '<option ';
					if (selectOptionsFromDefaultVal[j] === elementval) {
						returnhtml += 'selected="selected"';
					}
					returnhtml += ' value="' + selectOptionsFromDefaultVal[j] + '">' + selectOptionsFromDefaultVal[j] + '</option>';
				}
				returnhtml += '</select>';
			} else {
				returnhtml += '<input class="ts-col-span9" type="text" id="' + elementid + '" ';
				if (!options.readonly) {
					returnhtml += ' name="' + elementname + '" ';
				}
				returnhtml += ' value="' + elementval + '" ' + readonly + ' />';
			}
			returnhtml += appendhtml;
		}
	}
	return returnhtml;
};

module.exports = jsonFormElements;

},{}],2:[function(require,module,exports){
'use strict';

var jsonFormElements = require('./jsonformelements'),
    tabMap = {
	'0': 'application-settings',
	'1': 'theme-settings',
	'2': 'restart',
	'3': 'help'
},
    themesettingsConfiguration,
    themesettingsReadOnly,
    appsettingsConfiguration,
    appsettingsReadOnly;

var handleSettingsTabChange = function handleSettingsTabChange(currentTab) {
	// console.log('currentTab', currentTab);
	window.location.hash = tabMap[currentTab];
	styleWindowResizeEventHandler();
};

var elementSelectors = function elementSelectors() {
	themesettingsConfiguration = document.getElementById('themesettings-config');
	themesettingsReadOnly = document.getElementById('themesettings-readonly');
	appsettingsConfiguration = document.getElementById('appsettings-config');
	appsettingsReadOnly = document.getElementById('appsettings-readonly');
};

var eventHandlers = function eventHandlers() {
	window.StylieTab['periodic-settings-tabs'].on('tabsShowIndex', handleSettingsTabChange);
	if (window.location.hash) {
		for (var x in tabMap) {
			if (window.location.hash.replace('#', '') === tabMap[x]) {
				window.StylieTab['periodic-settings-tabs'].showTab(x);
			}
		}
	}
};

/**
 * resize codemirror on window resize
 */
var styleWindowResizeEventHandler = function styleWindowResizeEventHandler() {
	if (window.codeMirrors) {
		for (var y in window.codeMirrors) {
			window.codeMirrors[y].refresh();
			window.codeMirrors[y].setSize('auto', '80%');
		}
	}
};
// window.backupcompleted = function () {
// 	window.endPreloader();
// 	window.showStylieNotification({
// 		message: 'downloaded back up file'
// 	});
// };

var initAdvancedCodemirror = function initAdvancedCodemirror() {
	if (window.StylieTab && window.StylieTab['periodic-settings-tabs-config']) {
		window.StylieTab['periodic-settings-tabs-config'].on('tabsShowIndex', function (idex) {
			if (idex === 0 && window.codeMirrors && window.codeMirrors['themesettings-codemirror']) {
				window.codeMirrors['themesettings-codemirror'].refresh();
			} else if (idex === 1 && window.codeMirrors && window.codeMirrors['globalconfig-codemirror']) {
				window.codeMirrors['globalconfig-codemirror'].refresh();
			} else if (idex === 2 && window.codeMirrors && window.codeMirrors['envconfig-codemirror']) {
				window.codeMirrors['envconfig-codemirror'].refresh();
			} else if (idex === 3 && window.codeMirrors && window.codeMirrors['defaultconfig-codemirror']) {
				window.codeMirrors['defaultconfig-codemirror'].refresh();
			}
		});
	}
};

var init = function init() {
	elementSelectors();
	eventHandlers();

	if (window.appsettings) {
		appsettingsConfiguration.innerHTML = jsonFormElements({
			jsonobject: window.appsettings.configuration,
			idnameprepend: 'asc'
		});
		// appsettingsReadOnly.innerHTML = jsonFormElements({
		// 	jsonobject: window.appsettings.readonly,
		// 	readonly: true,
		// 	idnameprepend: 'asro'
		// });
	}
	if (window.themesettings) {

		// themesettingsConfiguration.innerHTML = jsonFormElements({
		// 	jsonobject: window.themesettings.configuration,
		// 	idnameprepend: 'tsc'
		// });
		themesettingsReadOnly.innerHTML = jsonFormElements({
			jsonobject: window.themesettings.readonly,
			readonly: true,
			idnameprepend: 'tsro'
		});
	}
	initAdvancedCodemirror();
	styleWindowResizeEventHandler();
};

if (typeof window.domLoadEventFired !== 'undefined') {
	init();
} else {
	window.addEventListener('load', init, false);
}

},{"./jsonformelements":1}]},{},[2]);
