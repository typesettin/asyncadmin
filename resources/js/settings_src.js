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
window.restartAppResponse = function ( /*ajaxFormResponse*/ ) {
	// window.adminRefresh();
	var t;

	window.adminSocket.on('disconnect', function () {
		t = setTimeout(function () {
			window.StylieNotificationObject.dismiss();
		}, 500);
		// window.StylieNotificationObject.dismiss();
		window.showStylieAlert({
			message: 'Shutting down application and restarting Periodic.'
		});
		window.showPreloader();
	});
	window.adminSocket.on('connect', function () {
		window.StylieNotificationObject.dismiss();
		window.showStylieAlert({
			message: 'Periodic application restarted.'
		});
		clearTimeout(t);
		window.adminRefresh();
	});
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
		appsettingsReadOnly.innerHTML = jsonFormElements({
			jsonobject: window.appsettings.readonly,
			readonly: true,
			idnameprepend: 'asro'
		});
	}
	if (window.themesettings) {
		themesettingsConfiguration.innerHTML = jsonFormElements({
			jsonobject: window.themesettings.configuration,
			idnameprepend: 'tsc'
		});
		themesettingsReadOnly.innerHTML = jsonFormElements({
			jsonobject: window.themesettings.readonly,
			readonly: true,
			idnameprepend: 'tsro'
		});
	}
};

if (typeof window.domLoadEventFired !== 'undefined') {
	init();
}
else {
	window.addEventListener('load', init, false);
}
