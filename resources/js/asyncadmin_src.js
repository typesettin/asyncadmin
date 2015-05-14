'use strict';
var ajaxlinks,
	// ajaxforms,
	// ajaxFormies = {},
	// summernotes,
	// summernoteContentEditors = {},
	moment = require('moment'),
	Pushie = require('pushie'),
	Bindie = require('bindie'),
	Formie = require('formie'),
	Stylie = require('stylie'),
	platterjs = require('platterjs'),
	io = require('socket.io-client'),
	socket,
	asyncAdminPushie,
	async = require('async'),
	classie = require('classie'),
	StylieNotification = require('stylie.notifications'),
	StylieModals = require('stylie.modals'),
	StylieTabs = require('stylie.tabs'),
	AdminModal,
	open_modal_buttons,
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
	servermodalElement,
	mobile_nav_menu,
	mobile_nav_menu_overlay,
	menuTriggerElement,
	nav_header,
	consolePlatter,
	preloaderElement;

// window.ajaxFormies = ajaxFormies;
window.Formie = Formie;
window.Bindie = Bindie;
window.Stylie = Stylie;

var openModalButtonListener = function (e) {
	e.preventDefault();
	// console.log(e.target);
	// console.log(e.target.getAttribute('data-tsmodal-id'));
	AdminModal.show(e.target.getAttribute('data-tsmodal-id'));
	return false;
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

var initSummernote = function () {
	var summernoteObj,
		summernoteObjID,
		summernoteJQueryObj,
		$ = window.$;
	var summernotes = document.querySelectorAll('.ts-summernote');

	try {
		if (typeof summernotes !== 'undefined' && summernotes.length > 0) {
			for (var x = 0; x < summernotes.length; x++) {
				summernoteObj = summernotes[x];
				summernoteObjID = '#' + summernoteObj.getAttribute('id');
				summernoteJQueryObj = $(summernoteObjID);
				summernoteJQueryObj.summernote({});
			}
		}
	}
	catch (e) {
		console.error(e);
		window.showErrorNotificaton({
			message: e.message
		});
	}
};

var initModalWindows = function () {

	open_modal_buttons = document.querySelectorAll('.ts-open-modal');
	if (open_modal_buttons.length > 0) {
		// open_modal_buttons
		AdminModal = new StylieModals({});
		AdminModal.on('showModal', function () {
			classie.add(document.body, 'ts-modal-showing');
		});
		AdminModal.on('hideModal', function () {
			classie.remove(document.body, 'ts-modal-showing');
		});
		window.AdminModal = AdminModal;
	}
	for (var q = 0; q < open_modal_buttons.length; q++) {
		open_modal_buttons[q].addEventListener('click', openModalButtonListener, false);
	}
};

var logToAdminConsole = function (data) {
	var logInfoElement = document.createElement('div'),
		adminMessageLevel = document.createElement('span'),
		adminMessageMessage = document.createElement('span'),
		adminMessageMeta = document.createElement('pre'),
		acp = document.querySelector('#adminConsole_pltr-pane-wrapper'),
		acc = document.querySelector('#ts-admin-console-content'),
		loglevel = data.level || 'log';
	classie.add(adminMessageMeta, 'ts-sans-serif');

	adminMessageLevel.innerHTML = moment().format('dddd, MMMM Do YYYY, HH:mm:ss ') + ' - (' + loglevel + ') : ';
	if (typeof data === 'string') {
		adminMessageMessage.innerHTML = data;
		adminMessageMeta.innerHTML = JSON.stringify({}, null, ' ');
	}
	else {
		adminMessageMessage.innerHTML = data.msg;
		adminMessageMeta.innerHTML = JSON.stringify(data.meta, null, ' ');
	}
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

var defaultAjaxFormie = function (formElement) {
	var $ = window.$,
		_csrfToken = formElement.querySelector('input[name="_csrf"]');

	return new Formie({
		ajaxformselector: '#' + formElement.getAttribute('id'),
		// headers: {'customheader':'customvalue'},
		postdata: {
			'_csrf': _csrfToken.value,
			format: 'json'
		},
		queryparameters: {
			'_csrf': _csrfToken.value,
			format: 'json'
		},
		beforesubmitcallback: function (beforeEvent, formElement) {
			var beforesubmitFunctionString = formElement.getAttribute('data-beforesubmitfunction'),
				beforefn = window[beforesubmitFunctionString],
				summernoteTextAreas = formElement.querySelectorAll('textarea.ts-summernote');
			// is object a function?
			if (typeof beforefn === 'function') {
				beforefn(beforeEvent, formElement);
			}
			window.showPreloader();
			for (var s = 0; s < summernoteTextAreas.length; s++) {
				summernoteTextAreas[s].innerHTML = $('#' + summernoteTextAreas[s].getAttribute('id')).code();
			}
		},
		successcallback: function (response) {
			window.showStylieNotification({
				message: 'Saved'
			});
			window.endPreloader();
			logToAdminConsole({
				msg: 'ajax response',
				meta: response
			});
			var successsubmitFunctionString = formElement.getAttribute('data-successsubmitfunction'),
				successfn = window[successsubmitFunctionString];
			// is object a function?
			if (typeof successfn === 'function') {
				successfn(response);
			}
			window.showPreloader();
		},
		errorcallback: function (error, response) {
			window.showErrorNotificaton({
				message: error.message
			});
			window.endPreloader();
			logToAdminConsole({
				msg: error,
				meta: response
			});
			var errorsubmitFunctionString = formElement.getAttribute('data-errorsubmitfunction'),
				errorfn = window[errorsubmitFunctionString];
			// is object a function?
			if (typeof errorfn === 'function') {
				errorfn(error, response);
			}
		}
	});
};

var initAjaxFormies = function () {
	var ajaxForm;
	var ajaxforms = document.querySelectorAll('.async-admin-ajax-forms');
	//console.log('ajaxforms', ajaxforms);
	try {
		if (ajaxforms && ajaxforms.length > 0) {
			for (var x = 0; x < ajaxforms.length; x++) {
				ajaxForm = ajaxforms[x];
				//ajaxFormies[ajaxForm.getAttribute('name')] = 
				defaultAjaxFormie(ajaxForm);
			}
		}
	}
	catch (e) {
		window.showErrorNotificaton({
			message: e.message
		});
	}
};

var defaultTab = function (tabElement) {
	try {
		return new StylieTabs(tabElement);
	}
	catch (e) {
		throw e;
	}
};

var initTabs = function () {
	var stylieTab;
	var stylietabs = document.querySelectorAll('.ts-tabs');
	//console.log('stylietabs', stylietabs);
	try {
		if (stylietabs && stylietabs.length > 0) {
			for (var x = 0; x < stylietabs.length; x++) {
				stylieTab = stylietabs[x];
				//stylieTabies[stylieTab.getAttribute('name')] = 
				defaultTab(stylieTab);
			}
		}
	}
	catch (e) {
		console.log(e);
		window.showErrorNotificaton({
			message: e.message
		});
	}
};

var isMobileNavOpen = function () {
	return classie.has(mobile_nav_menu, 'slideOutLeft') || classie.has(mobile_nav_menu, 'initialState');
};

var closeMobileNav = function () {
	classie.add(mobile_nav_menu_overlay, 'hide');
	classie.add(mobile_nav_menu, 'slideOutLeft');
	classie.remove(mobile_nav_menu, 'slideInLeft');
};

var controlMobileNav = function () {
	if (isMobileNavOpen()) {
		classie.remove(mobile_nav_menu, 'initialState');
		classie.add(mobile_nav_menu, 'slideInLeft');
		classie.remove(mobile_nav_menu, 'slideOutLeft');
		classie.remove(mobile_nav_menu_overlay, 'hide');
	}
	else {
		closeMobileNav();
	}
};

var handleUncaughtError = function (e, errorMessageTitle) {
	endPreloader();
	logToAdminConsole({
		msg: errorMessageTitle || 'uncaught error',
		level: 'log',
		meta: e
	});
	window.showErrorNotificaton({
		message: e.message
	});
};

var loadAjaxPage = function (options) {
	// window.console.clear();
	closeMobileNav();
	try {
		var htmlDivElement = document.createElement('div'),
			newPageTitle,
			newPageContent,
			newJavascripts;
		showPreloader();

		if (window.$ && window.$('.ts-summernote')) {
			window.$('.ts-summernote').destroy();
		}

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
					endPreloader();
					window.showErrorNotificaton({
						message: 'Status [' + res.error.status + ']: ' + res.error.message
					});
				}
				else {
					try {
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
						if (options.pushState) {
							// console.log('options.datahref', options.datahref);
							asyncAdminPushie.pushHistory({
								data: {
									datahref: options.datahref
								},
								title: 'Title:' + options.datahref,
								href: options.datahref
							});
						}
						endPreloader();

						initFlashMessage();
						initSummernote();
						initAjaxFormies();
						initTabs();
						initModalWindows();
					}
					catch (ajaxPageError) {
						handleUncaughtError(ajaxPageError);
					}
				}
			});
	}
	catch (e) {
		handleUncaughtError(e, 'ajax page error');
	}
};

var navlinkclickhandler = function (e) {
	var etarget = e.target,
		etargethref = etarget.href || etarget.getAttribute('data-ajax-href');

	if (classie.has(etarget, 'async-admin-ajax-link')) {
		e.preventDefault();
		// console.log('etargethref', etargethref);
		loadAjaxPage({
			datahref: etargethref,
			pushState: true
		});
		// StyliePushMenu._resetMenu();
		return false;
	}
};

var statecallback = function (data) {
	// console.log('data', data);
	if (data && data.datahref) {
		loadAjaxPage({
			datahref: data.datahref,
			pushState: false
		});
	}
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

var asyncAdminContentElementClick = function (e) {
	var etarget = e.target,
		etargethref = etarget.href || etarget.getAttribute('data-ajax-href');

	if (!classie.has(etarget, 'ts-open-admin-console')) {
		consolePlatter.hidePlatterPane();
	}
	if (classie.has(etarget, 'async-admin-ajax-link')) {
		e.preventDefault();
		// console.log('etargethref', etargethref);
		loadAjaxPage({
			datahref: etargethref,
			pushState: true
		});
		return false;
	}
};

var showAdminConsoleElementClick = function () {
	window.consolePlatter.showPlatterPane();
};

var navOverlayClickHandler = function () {
	closeMobileNav();
};

var initEventListeners = function () {
	menuTriggerElement.addEventListener('click', controlMobileNav, false);
	asyncAdminContentElement.addEventListener('click', asyncAdminContentElementClick, false);
	adminButtonElement.addEventListener('click', showAdminConsoleElementClick, false);
	asyncHTMLWrapper.addEventListener('click', navlinkclickhandler, false);
	mobile_nav_menu_overlay.addEventListener('click', navOverlayClickHandler, false);
};

var initServerSocketCallback = function () {
	socket.on('server_callback', function (data) {
		var functionName = data.functionName,
			serverCallbackFn = window[functionName];

		if (typeof serverCallbackFn === 'function') {
			serverCallbackFn(data.functionData);
		}
	});
};

var adminConsolePlatterConfig = function () {
	socket = io();
	// socket = io(window.location.hostname + ':' + window.socketIoPort);
	// Whenever the server emits 'user joined', log it in the chat body
	socket.on('log', function (data) {
		logToAdminConsole(data);
	});
	socket.on('connect', function () {
		logToAdminConsole('connected socket');
	});
	socket.on('disconnect', function () {
		logToAdminConsole('disconnected socket');
	});
	socket.on('reconnect', function () {
		logToAdminConsole('reconnected socket');
	});
	socket.on('error', function () {
		logToAdminConsole('socket error');
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

window.showServerModal = function (data) {
	servermodalElement.querySelector('#servermodal-content').innerHTML = data;
	AdminModal.show('servermodal-modal');
};

window.showServerNotification = function (data) {
	window.showStylieNotification(data);
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
				flashMessageArray = [];
				asyncFlashFunctions = [];
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
	window.domLoadEventFired = true;
	adminConsoleElement = document.querySelector('#ts-admin-console');
	adminConsoleElementContent = document.querySelector('#ts-admin-console-content');
	asyncHTMLWrapper = document.querySelector('#ts-asyncadmin-content-wrapper');
	asyncHTMLContentContainer = document.querySelector(asyncContentSelector);
	mobile_nav_menu = document.getElementById('ts-nav-menu');
	menuTriggerElement = document.getElementById('trigger');
	nav_header = document.querySelector('#nav-header');
	mtpms = document.querySelector('main.ts-pushmenu-scroller');
	ajaxlinks = document.querySelectorAll('.async-admin-ajax-link');
	// ajaxforms = document.querySelectorAll('.async-admin-ajax-forms');
	// summernotes = document.querySelectorAll('.ts-summernote');
	preloaderElement = document.querySelector('#ts-preloading');
	asyncAdminContentElement = document.querySelector('#ts-main-content');
	adminButtonElement = document.createElement('a');
	adminButtonElement.innerHTML = 'Admin Console';
	classie.add(adminButtonElement, 'ts-cursor-pointer');
	classie.add(adminButtonElement, 'ts-open-admin-console');
	open_modal_buttons = document.querySelectorAll('.ts-open-modal');
	mobile_nav_menu_overlay = document.querySelector('.ts-nav-overlay');
	servermodalElement = document.querySelector('#servermodal-modal');


	for (var u = 0; u < ajaxlinks.length; u++) {
		ajaxlinks[u].addEventListener('click', preventDefaultClick, false);
	}

	if (mobile_nav_menu) {
		// mobile_nav_menu.addEventListener('mousedown', navlinkclickhandler, false);
		mobile_nav_menu.addEventListener('click', navlinkclickhandler, false);
	}
	asyncAdminPushie = new Pushie({
		replacecallback: pushstatecallback,
		pushcallback: pushstatecallback,
		popcallback: statecallback
	});
	adminConsolePlatterConfig();
	initEventListeners();
	initFlashMessage();
	initSummernote();
	initAjaxFormies();
	initTabs();
	initModalWindows();
	initServerSocketCallback();
	window.asyncHTMLWrapper = asyncHTMLWrapper;
	window.logToAdminConsole = logToAdminConsole;
});
