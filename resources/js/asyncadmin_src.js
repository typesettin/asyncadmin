'use strict';
var ajaxlinks,
	navlinks,
	PushMenu = require('stylie.pushmenu'),
	path = require('path'),
	moment = require('moment'),
	Pushie = require('pushie'),
	Formie = require('formie'),
	Bindie = require('bindie'),
	platterjs = require('platterjs'),
	io = require('socket.io-client'),
	socket,
	asyncAdminPushie,
	async = require('async'),
	classie = require('classie'),
	StylieNotification = require('stylie.notifications'),
	StylieTable = require('stylie.tables'),
	StyliePushMenu,
	asyncHTMLWrapper,
	asyncHTMLContentContainer,
	asyncContentSelector = '#ts-asyncadmin-content-container',
	asyncAdminContentElement,
	adminConsoleElement,
	adminConsoleElementContent,
	flashMessageArray = [],
	asyncFlashFunctions = [],
	request = require('superagent'),
	isClearingConsole = false,
	mtpms,
	adminButtonElement,
	menuElement,
	menuTriggerElement,
	nav_header,
	consolePlatter,
	preloaderElement;

window.Formie = Formie;
window.Bindie = Bindie;

window.createAdminTable = function (options) {
	return new StylieTable(options);
};

var preventDefaultClick = function (e) {
	e.preventDefault();
	return;
};

var initFlashMessage = function () {
	window.showFlashNotifications({
		flash_messages: window.periodic_flash_messages,
		ttl: 7000,
		wrapper: document.querySelector('.ts-pushmenu-scroller-inner')
	});
};

var showPreloader = function (element) {
	var plElement = element || preloaderElement;
	classie.remove(plElement, 'hide');
	classie.remove(plElement, 'hide-preloading');
};
window.showPreloader = showPreloader;

var endPreloader = function (element) {
	var plElement = element || preloaderElement;
	classie.add(plElement, 'hide-preloading');
	var t = setTimeout(function () {
		clearTimeout(t);
		classie.add(plElement, 'hide');
	}, 400);
};
window.endPreloader = endPreloader;

var loadAjaxPage = function (options) {
	var htmlDivElement = document.createElement('div'),
		newPageTitle,
		newPageContent,
		newJavascripts;
	showPreloader();
	request
		.get(options.datahref)
		.set('Accept', 'text/html')
		.end(function (error, res) {
			// console.log('error', error);
			// console.log('res', res);
			if (error) {
				window.showErrorNotificaton({
					message: error.message
				});
			}
			else if (res.error) {
				window.showErrorNotificaton({
					message: 'Status [' + res.error.status + ']: ' + res.error.message
				});
			}
			else {
				htmlDivElement.innerHTML = res.text;
				newPageContent = htmlDivElement.querySelector('#ts-asyncadmin-content-wrapper');
				newPageTitle = htmlDivElement.querySelector('#menu-header-stylie').innerHTML;
				asyncHTMLWrapper.removeChild(document.querySelector(asyncContentSelector));
				document.querySelector('#menu-header-stylie').innerHTML = newPageTitle;
				asyncHTMLWrapper.innerHTML = newPageContent.innerHTML;

				// console.log('htmlDivElement', htmlDivElement);
				newJavascripts = htmlDivElement.querySelectorAll('script');
				for (var j = 0; j < newJavascripts.length; j++) {
					if (!newJavascripts[j].src.match('/extensions/periodicjs.ext.asyncadmin/js/asyncadmin.min.js')) {
						var newJSScript = document.createElement('script');
						if (newJavascripts[j].src) {
							newJSScript.src = newJavascripts[j].src;
						}
						if (newJavascripts[j].id) {
							newJSScript.id = newJavascripts[j].id;
						}
						if (newJavascripts[j].type) {
							newJSScript.type = newJavascripts[j].type;
						}
						// newJSScript.class = newJavascripts[j].class;
						newJSScript.innerHTML = newJavascripts[j].innerHTML;
						asyncHTMLWrapper.appendChild(newJSScript);
					}
				}
				initFlashMessage();
				if (options.pushState) {
					asyncAdminPushie.pushHistory({
						data: {
							datahref: options.datahref
						},
						title: 'Title:' + options.datahref,
						href: options.datahref
					});
				}
				endPreloader();
			}
		});
};

var navlinkclickhandler = function (e) {
	var etarget = e.target,
		etargethref = etarget.href;

	if (classie.has(etarget, 'async-admin-ajax-link')) {
		e.preventDefault();
		// console.log('etargethref', etargethref);
		loadAjaxPage({
			datahref: etargethref,
			pushState: true
		});
		StyliePushMenu._resetMenu();
		return false;
	}
};

var statecallback = function (data) {
	// console.log('data', data);
	loadAjaxPage({
		datahref: data.datahref,
		pushState: false
	});
};
var pushstatecallback = function ( /*data*/ ) {
	// console.log('data', data);
};

var adminConsoleWindowResizeEventHandler = function ( /*e*/ ) {
	//console.log(e);
};

var addStyleSheetToChildWindow = function () {
	var t = setTimeout(function () {
		var newstylesheet = document.createElement('link');
		newstylesheet.setAttribute('type', 'text/css');
		newstylesheet.setAttribute('href', window.location.origin + '/stylesheets/default/periodic.css');
		newstylesheet.setAttribute('rel', 'stylesheet');
		var newstylesheet2 = document.createElement('link');
		newstylesheet2.setAttribute('type', 'text/css');
		newstylesheet2.setAttribute('href', window.location.origin + '/extensions/periodicjs.ext.asyncadmin/stylesheets/asyncadmin.css');
		newstylesheet2.setAttribute('rel', 'stylesheet');
		consolePlatter.config().windowObjectReference.document.getElementsByTagName('head')[0].appendChild(newstylesheet);
		consolePlatter.config().windowObjectReference.document.getElementsByTagName('head')[0].appendChild(newstylesheet2);

		adminConsoleWindowResizeEventHandler();
		clearTimeout(t);
	}, 200);

	consolePlatter.config().windowObjectReference.window.addEventListener('resize', adminConsoleWindowResizeEventHandler, false);
};

var logToAdminConsole = function (data) {
	var logInfoElement = document.createElement('div'),
		adminMessageLevel = document.createElement('span'),
		adminMessageMessage = document.createElement('span'),
		adminMessageMeta = document.createElement('pre'),
		acp = document.querySelector('#adminConsole_pltr-pane-wrapper'),
		acc = document.querySelector('#ts-admin-console-content');
	classie.add(adminMessageMeta, 'ts-sans-serif');

	adminMessageLevel.innerHTML = moment().format('dddd, MMMM Do YYYY, HH:mm:ss ') + ' - (' + data.level + ') : ';
	adminMessageMessage.innerHTML = data.msg;
	adminMessageMeta.innerHTML = JSON.stringify(data.meta, null, ' ');
	logInfoElement.appendChild(adminMessageLevel);
	logInfoElement.appendChild(adminMessageMessage);
	logInfoElement.appendChild(adminMessageMeta);
	adminConsoleElementContent.appendChild(logInfoElement);
	acp.scrollTop = acp.scrollHeight;

	if (acc && acc.childNodes && acc.childNodes.length > 10) {
		//console.log('isClearingConsole', isClearingConsole);
		isClearingConsole = true;
		for (var x = 0; x < (acc.childNodes.length - 10); x++) {
			acc.removeChild(acc.childNodes[x]);
		}
		var t = setTimeout(function () {
			isClearingConsole = false;
			//console.log('setTimeout isClearingConsole', isClearingConsole);
			clearTimeout(t);
		}, 5000);
	}
};

var asyncAdminContentElementClick = function (e) {
	if (!classie.has(e.target, 'ts-open-admin-console')) {
		consolePlatter.hidePlatterPane();
	}
};

var showAdminConsoleElementClick = function () {
	window.consolePlatter.showPlatterPane();
};

var initEventListeners = function () {
	asyncAdminContentElement.addEventListener('click', asyncAdminContentElementClick, false);
	adminButtonElement.addEventListener('click', showAdminConsoleElementClick, false);
};

var adminConsolePlatterConfig = function () {
	socket = io();
	// socket = io(window.location.hostname + ':' + window.socketIoPort);
	// Whenever the server emits 'user joined', log it in the chat body
	socket.on('log', function (data) {
		logToAdminConsole(data);
	});
	socket.on('connect', function () {
		console.log('connected socket');
	});
	socket.on('disconnect', function () {
		console.log('disconnected socket');
	});
	socket.on('reconnect', function () {
		console.log('reconnected socket');
	});
	socket.on('error', function () {
		console.log('socket error');
	});
	consolePlatter = new platterjs({
		idSelector: 'adminConsole',
		title: ' ',
		platterContentElement: adminConsoleElement,
		openWindowHTML: ' <span class="_pltr-open-window"><img src="/extensions/periodicjs.ext.asyncadmin/img/icons/new_window.svg" style="height:0.8em;" alt="new window"  class="_pltr-open-window"/></span>'
	});
	consolePlatter.init(function (data) {
		// console.log('consolePlatter init data', data);
		var spanSeparator = document.createElement('span'),
			adminConsoleSpanContainer = document.querySelector('#admin-console-span-container');

		spanSeparator.innerHTML = ' | ';
		adminConsoleSpanContainer.appendChild(adminButtonElement);
		adminConsoleSpanContainer.appendChild(data.element);
		adminConsoleSpanContainer.appendChild(spanSeparator);
	});

	consolePlatter.on('openedPlatterWindow', function ( /*data*/ ) {
		// console.log('openedPlatterWindow data', data);
		addStyleSheetToChildWindow();
		consolePlatter.hidePlatterPane();
	});

	window.consolePlatter = consolePlatter;
};

window.getAsyncCallback = function (functiondata) {
	return function (asyncCB) {
		new StylieNotification({
			message: functiondata.message,
			ttl: functiondata.ttl,
			wrapper: functiondata.wrapper,
			layout: 'growl',
			effect: 'jelly',
			type: functiondata.type, // notice, warning, error or success
			onClose: function () {
				asyncCB(null, 'shown notification');
			}
		}).show();
	};
};

window.showFlashNotifications = function (options) {
	if (options.flash_messages) {
		for (var x in options.flash_messages) {
			if (options.flash_messages[x]) {
				for (var y in options.flash_messages[x]) {
					flashMessageArray.push({
						type: x,
						message: options.flash_messages[x][y]
					});
					asyncFlashFunctions.push(window.getAsyncCallback({
						type: x,
						ttl: options.ttl,
						message: options.flash_messages[x][y],
						wrapper: options.wrapper
					}));
				}
			}
		}
		if (asyncFlashFunctions.length > 0) {
			async.series(asyncFlashFunctions, function (err /*,result*/ ) {
				if (err) {
					console.error(err);
				}
				else if (options.callback) {
					options.callback();
				}
				// else {
				// 	console.log(result);
				// }
			});
		}
	}
};

window.showErrorNotificaton = function (options) {
	options.layout = 'growl';
	options.effect = 'jelly';
	options.ttl = false;
	options.type = 'error';
	window.showStylieNotification(options);
};

window.showStylieNotification = function (options) {
	new StylieNotification({
		message: options.message,
		ttl: (typeof options.ttl === 'boolean') ? options.ttl : 7000,
		wrapper: options.wrapper || document.querySelector('main'),
		layout: options.layout || 'growl',
		effect: options.effect || 'jelly',
		type: options.type, // notice, warning, error or success
		onClose: options.onClose || function () {}
	}).show();
};

window.addEventListener('load', function () {
	adminConsoleElement = document.querySelector('#ts-admin-console');
	adminConsoleElementContent = document.querySelector('#ts-admin-console-content');
	asyncHTMLWrapper = document.querySelector('#ts-asyncadmin-content-wrapper');
	asyncHTMLContentContainer = document.querySelector(asyncContentSelector);
	navlinks = document.querySelector('#ts-pushmenu-mp-menu');
	menuElement = document.getElementById('ts-pushmenu-mp-menu');
	menuTriggerElement = document.getElementById('trigger');
	nav_header = document.querySelector('#nav-header');
	mtpms = document.querySelector('main.ts-pushmenu-scroller');
	ajaxlinks = document.querySelectorAll('.async-admin-ajax-link');
	preloaderElement = document.querySelector('#ts-preloading');
	asyncAdminContentElement = document.querySelector('#ts-pushmenu-mp-pusher');
	adminButtonElement = document.createElement('a');
	adminButtonElement.innerHTML = 'Admin Console';
	classie.add(adminButtonElement, 'ts-cursor-pointer');
	classie.add(adminButtonElement, 'ts-open-admin-console');

	for (var u = 0; u < ajaxlinks.length; u++) {
		ajaxlinks[u].addEventListener('click', preventDefaultClick, false);
	}

	if (navlinks) {
		navlinks.addEventListener('mousedown', navlinkclickhandler, false);
	}
	StyliePushMenu = new PushMenu({
		el: menuElement,
		trigger: menuTriggerElement,
		type: 'overlap', // 'overlap', // 'cover',
		// position: 'right'
	});
	asyncAdminPushie = new Pushie({
		replacecallback: pushstatecallback,
		pushcallback: pushstatecallback,
		popcallback: statecallback
	});
	adminConsolePlatterConfig();
	initFlashMessage();
	initEventListeners();
	window.asyncHTMLWrapper = asyncHTMLWrapper;
	window.StyliePushMenu = StyliePushMenu;
});
