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

var handleSettingsTabChange = function (currentTab) {
	// console.log('currentTab', currentTab);
	window.location.hash = tabMap[currentTab];
	styleWindowResizeEventHandler();
};

var elementSelectors = function () {
	themesettingsConfiguration = document.getElementById('themesettings-config');
	themesettingsReadOnly = document.getElementById('themesettings-readonly');
	appsettingsConfiguration = document.getElementById('appsettings-config');
	appsettingsReadOnly = document.getElementById('appsettings-readonly');
};

var eventHandlers = function () {
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
var styleWindowResizeEventHandler = function () {
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

var init = function () {
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
	styleWindowResizeEventHandler();

};

if (typeof window.domLoadEventFired !== 'undefined') {
	init();
}
else {
	window.addEventListener('load', init, false);
}
