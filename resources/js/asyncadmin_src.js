'use strict';
var debounce = require('debounce');
var ajaxlinks,
	// ajaxforms,
	// ajaxFormies = {},
	// summernotes,
	summernoteContentEditors = {},
	pluralize = require('pluralize'),
	capitalize = require('capitalize'),
	moment = require('moment'),
	Pushie = require('pushie'),
	Bindie = require('bindie'),
	Formie = require('formie'),
	forbject = require('forbject'),
	querystring = require('querystring'),
	Stylie = require('stylie'),
	platterjs = require('platterjs'),
	io = require('socket.io-client'),
	socket,
	asyncAdminPushie,
	ejs = require('ejs'),
	content_attribute_template,
	content_attribute_HTML,
	content_attribute_content_html,
	async = require('async'),
	classie = require('classie'),
	CodeMirror = require('codemirror'),
	StylieNotification = require('stylie.notifications'),
	StylieModals = require('stylie.modals'),
	StylieTabs = require('stylie.tabs'),
	StylieDatalist = require('./datalist'),
	StylieMedialist = require('./medialist'),
	StylieFilterlist = require('./filterlist'),
	StylieTagManager = require('./tagman'),
	StylieSortlist = require('./sortlist'),
	StylieTextEditor = require('./stylieeditor'),
	data_tables = require('../../controller/data_tables'),
	AdminModal,
	open_modal_buttons,
	asyncHTMLWrapper,
	asyncHTMLContentContainer,
	asyncContentSelector = '#ts-asyncadmin-content-container',
	asyncAdminContentElement,
	adminConsoleElement,
	adminConsoleElementContent,
	codeMirrorJSEditorsElements,
	admin_command_inputElement,
	admin_command_submit_buttonElement,
	admin_command_submitForm,
	codeMirrors = {},
	flashMessageArray = [],
	asyncFlashFunctions = [],
	request = require('superagent'),
	isClearingConsole = false,
	mtpms,
	search_result_template,
	adminButtonElement,
	servermodalElement,
	mobile_nav_menu,
	mobile_nav_menu_overlay,
	menuTriggerElement,
	search_menu_content,
	search_menu_input,
	nav_header,
	consolePlatter,
	preloaderElement,
	confirmDeleteYes,
	datalistelements,
	medialistelements,
	filterlistelements,
	tagmanagerelements,
	sortlistelements,
	alreadyAttachedAppResponse = false,
	AdminFormies = {},
	AdminTagManagers = {},
	StylieDataLists = {},
	StylieTab = {};

require('../../node_modules/codemirror/addon/edit/matchbrackets');
require('../../node_modules/codemirror/addon/hint/css-hint');
require('../../node_modules/codemirror/addon/hint/html-hint');
require('../../node_modules/codemirror/addon/hint/javascript-hint');
require('../../node_modules/codemirror/addon/hint/show-hint');
require('../../node_modules/codemirror/addon/lint/css-lint');
require('../../node_modules/codemirror/addon/lint/javascript-lint');
// require('../../node_modules/codemirror/addon/lint/json-lint');
require('../../node_modules/codemirror/addon/lint/lint');
// require('../../node_modules/codemirror/addon/lint/html-lint');
require('../../node_modules/codemirror/addon/comment/comment');
require('../../node_modules/codemirror/addon/comment/continuecomment');
require('../../node_modules/codemirror/addon/fold/foldcode');
require('../../node_modules/codemirror/addon/fold/comment-fold');
require('../../node_modules/codemirror/addon/fold/indent-fold');
require('../../node_modules/codemirror/addon/fold/brace-fold');
require('../../node_modules/codemirror/addon/fold/foldgutter');
require('../../node_modules/codemirror/mode/css/css');
require('../../node_modules/codemirror/mode/htmlembedded/htmlembedded');
require('../../node_modules/codemirror/mode/htmlmixed/htmlmixed');
require('../../node_modules/codemirror/mode/javascript/javascript');

window.StylieModals = StylieModals;
// window.ajaxFormies = ajaxFormies;
window.Formie = Formie;
window.Bindie = Bindie;
window.Stylie = Stylie;
window.classie = classie;

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
	var summernotes = document.querySelectorAll('.ts-summernote');

	try {
		if (typeof summernotes !== 'undefined' && summernotes.length > 0) {
			for (var x = 0; x < summernotes.length; x++) {
				summernoteContentEditors[summernotes[x].getAttribute('id')] = new StylieTextEditor({
					element: summernotes[x]
				}).init();
			}
		}
		window.summernoteContentEditors = summernoteContentEditors;
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

var initCodemirrors = function () {
	codeMirrorJSEditorsElements = document.querySelectorAll('.codemirroreditor');
	for (var cm = 0; cm < codeMirrorJSEditorsElements.length; cm++) {
		// console.log('codeMirrorJSEditorsElements[cm]', codeMirrorJSEditorsElements[cm]);
		codeMirrors[codeMirrorJSEditorsElements[cm].id] = CodeMirror.fromTextArea(
			codeMirrorJSEditorsElements[cm], {
				lineNumbers: true,
				lineWrapping: true,
				matchBrackets: true,
				autoCloseBrackets: true,
				mode: (codeMirrorJSEditorsElements[cm].getAttribute('data-htmlonly')) ? 'text/html' : 'application/json',
				indentUnit: 2,
				indentWithTabs: true,
				'overflow-y': 'hidden',
				'overflow-x': 'auto',
				lint: true,
				gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
				foldGutter: true,
				readOnly: (codeMirrorJSEditorsElements[cm].getAttribute('readonly')) ? 'nocursor' : false
			}
		);


	}

	if (window.StylieTab && window.StylieTab['refresh-tabs']) {
		window.StylieTab['refresh-tabs'].on('tabsShowIndex', function ( /*idex*/ ) {
			if (window.codeMirrors && window.codeMirrors['genericdoc-codemirror']) {
				window.codeMirrors['genericdoc-codemirror'].refresh();
			}
		});
	}
	// window.CodeMirror = CodeMirror;
	window.codeMirrors = codeMirrors;
};

var initDatalists = function () {
	datalistelements = document.querySelectorAll('.ts-datalist-tagged');
	for (var q = 0; q < datalistelements.length; q++) {
		StylieDataLists[datalistelements[q].id] = new StylieDatalist({
			element: datalistelements[q]
		});
	}
};

var initMedialists = function () {
	medialistelements = document.querySelectorAll('.ts-medialist-tagged');
	for (var q = 0; q < medialistelements.length; q++) {
		StylieDataLists[medialistelements[q].id] = new StylieMedialist({
			element: medialistelements[q]
		});
	}
};

var initFilterlists = function () {
	tagmanagerelements = document.querySelectorAll('.asyncadmin-ts-tagmanager');
	for (var p = 0; p < tagmanagerelements.length; p++) {
		AdminTagManagers[tagmanagerelements[p].id] = new StylieTagManager({
			element: tagmanagerelements[p],
			filterkeys: tagmanagerelements[p].getAttribute('data-filterkeys')
		});
	}
	filterlistelements = document.querySelectorAll('.asyncadmin-ts-filterlist');
	for (var q = 0; q < filterlistelements.length; q++) {
		StylieDataLists[filterlistelements[q].id] = new StylieFilterlist({
			element: filterlistelements[q],
			filterkeys: filterlistelements[q].getAttribute('data-filterkeys')
		});
	}
	sortlistelements = document.querySelectorAll('.asyncadmin-ts-sortlist');
	for (var r = 0; r < sortlistelements.length; r++) {
		StylieDataLists[sortlistelements[r].id] = new StylieSortlist({
			element: sortlistelements[r],
			sortkeys: sortlistelements[r].getAttribute('data-sortkeys')
		});
	}
	window.AdminTagManagers = AdminTagManagers;
};

var logToAdminConsole = function (data) {
	var logInfoElement = document.createElement('div'),
		adminMessageLevel = document.createElement('span'),
		adminMessageMessage = document.createElement('span'),
		adminMessageMeta = document.createElement('pre'),
		acp = document.querySelector('#adminConsole_pltr-pane-wrapper'),
		acc = document.querySelector('#ts-admin-console-content'),
		acwc = window.consolePlatter.config(),
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
	if (data.meta) {
		logInfoElement.appendChild(adminMessageMeta);
	}
	adminConsoleElementContent.appendChild(logInfoElement);
	acp.scrollTop = acp.scrollHeight;

	if (acwc.windowObjectReference && acwc.windowObjectReference.scrollTo && typeof acwc.windowObjectReference.scrollTo === 'function') {
		acwc.windowObjectReference.scrollTo(0, acwc.windowObjectReference.document.querySelector('#ts-admin-console-content').scrollHeight);
	}

	if (acc && acc.childNodes && acc.childNodes.length > 30) {
		//console.log('isClearingConsole', isClearingConsole);
		isClearingConsole = true;
		for (var x = 0; x < (acc.childNodes.length - 30); x++) {
			acc.removeChild(acc.childNodes[x]);
		}
		var t = setTimeout(function () {
			isClearingConsole = false;
			//console.log('setTimeout isClearingConsole', isClearingConsole);
			clearTimeout(t);
		}, 5000);
	}
};

var handleUncaughtError = function (e, errorMessageTitle) {
	console.error(e);
	endPreloader();
	logToAdminConsole({
		msg: (errorMessageTitle) ? errorMessageTitle : 'uncaught error',
		level: 'log',
		meta: e
	});
	window.showErrorNotificaton({
		message: e.message
	});
};

window.handleUncaughtError = handleUncaughtError;

var defaultLoadAjaxPageFormie = function (formElement) {
	var ajaxForbject = new forbject(formElement, {
		autorefresh: true,
		addelementsonrefresh: false,
	});

	return ajaxForbject;
};

var defaultAjaxFormie = function (formElement) {
	var _csrfToken = formElement.querySelector('input[name="_csrf"]') || document.querySelector('input[name="_csrf"]');
	var shownotification = true;
	var showpreloader = true;
	// console.log('formElement', formElement);
	if (formElement.getAttribute('data-donotnotify') && formElement.getAttribute('data-donotnotify') === 'do-not-notify') {
		shownotification = false;
	}
	if (formElement.getAttribute('data-donotpreload') && formElement.getAttribute('data-donotpreload') === 'do-not-preload') {
		showpreloader = false;
	}
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
				summernoteTextAreas = formElement.querySelectorAll('textarea.ts-summernote'),
				codemirrorTextAreas = formElement.querySelectorAll('textarea.codemirroreditor');
			// is object a function?
			if (typeof beforefn === 'function') {
				beforefn(beforeEvent, formElement);
			}
			if (showpreloader) {
				window.showPreloader();
			}
			for (var s = 0; s < summernoteTextAreas.length; s++) {
				summernoteTextAreas[s].innerHTML = summernoteContentEditors[summernoteTextAreas[s].getAttribute('id')].options.codemirror.getValue();
				// summernoteTextAreas[s].innerHTML = $('#' + summernoteTextAreas[s].getAttribute('id')).code();
			}
			for (var r = 0; r < codemirrorTextAreas.length; r++) {
				codemirrorTextAreas[r].innerHTML = codeMirrors[codemirrorTextAreas[r].id].getValue();
			}
		},
		successcallback: function (response) {
			if (showpreloader) {
				window.endPreloader();
			}
			if (shownotification && response.body && response.body.result && response.body.result === 'error') {
				window.showStylieNotification({
					message: response.body.data.error.message || response.body.data.error,
					type: 'error'
				});
			}
			else {
				if (shownotification) {
					window.showStylieNotification({
						message: 'Saved'
					});
				}
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
				if (formElement.getAttribute('data-successredirect-href')) {
					var successredirecthref = formElement.getAttribute('data-successredirect-href');
					loadAjaxPage({
						datahref: successredirecthref,
						pushState: true
					});
				}
			}
		},
		errorcallback: function (error, response) {
			console.log('error', error);
			console.log('response.response', response.response);

			try {
				var errormessage, jsonmessage;
				if (response.body && response.body.error && response.body.error.message) {
					errormessage = response.body.error.message;
				}
				else if (response.body && response.body.result && response.body.result === 'error') {
					console.log('response.body', response.body);
					errormessage = response.body.data.error.message || response.body.data.error;
				}
				else {
					jsonmessage = JSON.parse(response.response);
					errormessage = (jsonmessage && jsonmessage.data) ? jsonmessage.data.error : JSON.stringify(jsonmessage);
				}
				if (shownotification) {
					window.showErrorNotificaton({
						message: errormessage
					});

				}
			}
			catch (e) {
				console.log('e', e);
				if (error.message) {
					window.showErrorNotificaton({
						message: error.message
					});
				}
				else {
					window.showErrorNotificaton({
						message: error
					});
				}
			}
			if (showpreloader) {
				window.endPreloader();
			}
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
	var ajaxPageforms = document.querySelectorAll('.async-admin-ajax-page-forms');
	var ct_attr_selector = document.querySelector('#ct-attr-template');
	var outputEventListener = function (eventname) {
		return function (formObjectData) {
			loadAjaxPage({
				datahref: window.location.origin + window.location.pathname + '?' + querystring.stringify(formObjectData),
				pushState: true,
				eventname: eventname
			});
			// console.log('on eventname[' + eventname + '] formObject', formObjectData);
		};
	};
	if (ct_attr_selector) {

		content_attribute_template = ct_attr_selector.innerHTML;
		content_attribute_content_html = document.querySelector('#doc-ct-attr');
	}
	AdminFormies = {};
	// console.log('ajaxforms', ajaxforms);
	try {
		if (ajaxforms && ajaxforms.length > 0) {
			for (var x = 0; x < ajaxforms.length; x++) {
				ajaxForm = ajaxforms[x];
				//ajaxFormies[ajaxForm.getAttribute('name')] = 
				AdminFormies[ajaxForm.id] = defaultAjaxFormie(ajaxForm);
			}
		}
		if (ajaxPageforms && ajaxPageforms.length > 0) {
			for (var y = 0; y < ajaxPageforms.length; y++) {
				ajaxForm = ajaxPageforms[y];
				//ajaxFormies[ajaxForm.getAttribute('name')] = 
				AdminFormies[ajaxForm.id] = defaultLoadAjaxPageFormie(ajaxForm);
				AdminFormies[ajaxForm.id].on('refresh', outputEventListener('refresh'));
			}
		}
		window.AdminFormies = AdminFormies;
	}
	catch (e) {
		handleUncaughtError(e);
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
	var stylietabs = document.querySelectorAll('.ts-tabs'),
		tabMap;
	//console.log('stylietabs', stylietabs);
	try {
		var handleSettingsTabChange = function (currentTab) {
			// console.log('currentTab', currentTab);
			window.location.hash = tabMap[currentTab];
		};

		if (stylietabs && stylietabs.length > 0) {
			for (var x = 0; x < stylietabs.length; x++) {
				stylieTab = stylietabs[x];
				//stylieTabies[stylieTab.getAttribute('name')] = 
				StylieTab[stylieTab.id] = defaultTab(stylieTab);
			}
		}
		if (StylieTab['refresh-tabs']) {
			tabMap = {
				'0': 'basic',
				'1': 'advanced'
			};
			StylieTab['refresh-tabs'].on('tabsShowIndex', handleSettingsTabChange);
			if (window.location.hash) {
				for (var y in tabMap) {
					if (window.location.hash.replace('#', '') === tabMap[y]) {
						StylieTab['refresh-tabs'].showTab(y);
					}
				}
			}
		}
		window.StylieTab = StylieTab;
	}
	catch (e) {
		console.log(e);
		window.showErrorNotificaton({
			message: e.message
		});
	}
};

var isMobileNavOpen = function () {
	return classie.has(mobile_nav_menu, 'fadeOutLeft') || classie.has(mobile_nav_menu, 'initialState');
};

// var isSearchNavOpen = function () {
// 	return classie.has(search_menu_content, 'fadeOutUp') || classie.has(search_menu_content, 'initialState');
// };

var closeMobileNav = function () {
	classie.add(mobile_nav_menu_overlay, 'hide');
	classie.add(mobile_nav_menu, 'fadeOutLeft');
	classie.remove(mobile_nav_menu, 'fadeInLeft');
};

var closeSearchNav = function () {
	classie.add(search_menu_content, 'fadeOutUp');
	classie.remove(search_menu_content, 'fadeInDown');
};

var controlMobileNav = function () {
	closeSearchNav();
	if (isMobileNavOpen()) {
		classie.remove(mobile_nav_menu, 'initialState');
		classie.add(mobile_nav_menu, 'fadeInLeft');
		classie.remove(mobile_nav_menu, 'fadeOutLeft');
		classie.remove(mobile_nav_menu_overlay, 'hide');
	}
	else {
		closeMobileNav();
	}
};

var controlSearchNav = function () {
	// if (isSearchNavOpen()) {
	classie.remove(search_menu_content, 'initialState');
	classie.remove(search_menu_content, 'fadeOutUp');
	classie.add(search_menu_content, 'fadeInDown');
	// }
	// else {
	// 	closeSearchNav();
	// }
};

var search_menu_callback = function () {
	try {
		search_menu_content.innerHTML = 'Searching...';
		var searchhtml = '';
		request
			.get('/p-admin/content/search')
			.set('x-csrf-token', document.querySelector('input[name=_csrf]').value)
			.set('Accept', 'application/json')
			.query({
				format: 'json',
				_csrf: document.querySelector('input[name=_csrf]').value,
				'searchall-input': this.value
			})
			.end(function (err, responsedata) {
				responsedata.body.moment = moment;
				responsedata.body.capitalize = capitalize;
				responsedata.body.pluralize = pluralize;
				responsedata.body.data_tables = data_tables;
				searchhtml = ejs.render(search_result_template, responsedata.body);
				search_menu_content.innerHTML = searchhtml;
				// console.log('searchhtml', searchhtml);
				// 
			});
	}
	catch (e) {
		handleUncaughtError(e, 'ajax page error');
	}
	// console.log(data);
};

var initAdminSearch = function () {
	search_menu_input = document.querySelector('#searchall-input');
	search_menu_content = document.querySelector('#ts-search-content');
	if (document.querySelector('#searchall-input')) {
		document.querySelector('#searchall-input').addEventListener('keydown', debounce(search_menu_callback, 200), false);
		// search_menu_input.addEventListener('change', debounce(search_menu_callback, 200), false);
		document.querySelector('#searchall-input').addEventListener('focus', controlSearchNav, false);
		document.querySelector('#searchall-input').addEventListener('blur', function () {
			setTimeout(closeSearchNav, 400);
		}, false);
	}
};

var confirmDeleteDialog = function (e) {
	var eTarget = e.target,
		posturl = eTarget.getAttribute('data-href'),
		deleteredirecthref = eTarget.getAttribute('data-deleted-redirect-href'),
		successfunction = eTarget.getAttribute('data-successfunction'),
		beforefunction = eTarget.getAttribute('data-beforefunction'),
		donotnotify = eTarget.getAttribute('data-donotnotify');
	e.preventDefault();

	confirmDeleteYes.setAttribute('data-href', '#');
	confirmDeleteYes.setAttribute('data-href', posturl);
	if (deleteredirecthref) {
		confirmDeleteYes.setAttribute('data-deleted-redirect-href', deleteredirecthref);
	}
	if (successfunction) {
		confirmDeleteYes.setAttribute('data-successfunction', successfunction);
	}
	if (beforefunction) {
		confirmDeleteYes.setAttribute('data-beforefunction', beforefunction);
	}
	if (donotnotify) {
		confirmDeleteYes.setAttribute('data-donotnotify', donotnotify);
	}
	AdminModal.show('confirmdelete-modal');
};

var deleteContentSubmit = function (e) {
	var eTarget = e.target,
		posturl = eTarget.getAttribute('data-href');

	request
		.post(posturl)
		.set('x-csrf-token', document.querySelector('input[name=_csrf]').value)
		.set('Accept', 'application/json')
		.query({
			format: 'json'
		})
		.end(handle_ajax_button_response(e));
};

var submitAjaxButton = function (e) {
	var eTarget = e.target,
		posturl = eTarget.getAttribute('data-href'),
		postmethod = eTarget.getAttribute('data-ajax-method'),
		ajaxrequest;
	showPreloader();
	ajaxrequest = (postmethod === 'post') ? request.post(posturl) : request.get(posturl);

	ajaxrequest
		.set('x-csrf-token', document.querySelector('input[name=_csrf]').value)
		.set('Accept', 'application/json')
		.query({
			format: 'json'
		})
		.end(handle_ajax_button_response(e));
};

var initAjaxDeleteButtonListeners = function () {
	var deleteButtons = document.querySelectorAll('.ts-dialog-delete');
	if (confirmDeleteYes) {
		confirmDeleteYes.addEventListener('click', deleteContentSubmit, false);
	}
	for (var x in deleteButtons) {
		if (typeof deleteButtons[x] === 'object') {
			deleteButtons[x].addEventListener('click', confirmDeleteDialog, false);
		}
	}
};

var initAjaxSubmitButtonListeners = function () {
	var ajaxButtons = document.querySelectorAll('.ts-ajax-button');
	for (var x in ajaxButtons) {
		if (typeof ajaxButtons[x] === 'object') {
			ajaxButtons[x].addEventListener('click', submitAjaxButton, false);
		}
	}
};

window.initAjaxSubmitButtonListeners = initAjaxSubmitButtonListeners;

var loadAjaxPage = function (options) {
	// window.console.clear();
	closeSearchNav();
	closeMobileNav();
	try {
		var htmlDivElement = document.createElement('div'),
			newPageTitle,
			newPageContent,
			newJavascripts;
		showPreloader();

		// if (window.$ && window.$('.ts-summernote')) {
		// 	// console.log('window.$(.ts-summernote)', window.$('.ts-summernote'));
		// 	// console.log('window.$(.ts-summernote).summernote({})', window.$('.ts-summernote').summernote({}));
		// 	// window.$('.ts-summernote').summernote({}).destroy();
		// }

		request
			.get(options.datahref)
			.set('Accept', 'text/html')
			.end(function (error, res) {
				window.document.body.scrollTop = 0;
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

						// console.log('htmlDivElement title', );
						window.document.title = htmlDivElement.querySelector('title').innerHTML;
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
						initCodemirrors();
						initAjaxDeleteButtonListeners();
						initAjaxSubmitButtonListeners();
						initDatalists();
						initMedialists();
						initFilterlists();
						initAjaxLinkEventListeners();
						initAdminSearch();
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

var handle_ajax_button_response = function (e) {
	var eTarget = e.target;
	return function (error, res) {
		endPreloader();
		if (res && res.body && res.body.result === 'error') {
			window.showStylieNotification({
				message: res.body.data.error,
				ttl: 7000,
				type: 'error', // notice, warning, error or success
			});
		}
		else if (res && res.clientError) {
			window.showStylieNotification({
				message: res.status + ': ' + res.text,
				ttl: 7000,
				type: 'error', // notice, warning, error or success
			});
		}
		else if (error) {
			window.showStylieNotification({
				message: error.message,
				ttl: 7000,
				type: 'error', // notice, warning, error or success
			});
		}
		else {
			// console.log('!eTarget.getAttribute(data-donotnotify)', !eTarget.getAttribute('data-donotnotify'));
			if (eTarget.getAttribute('data-donotnotify') !== 'do-not-notify') {
				var successmessage = 'deleted successfully';
				if (classie.has(eTarget, 'ts-dialog-delete')) {
					successmessage = 'deleted successfully';
				}
				else if (res.body.message) {
					successmessage = res.body.message;
				}
				else if (res.body.data && res.body.data.message) {
					successmessage = res.body.data.message;
				}
				else {
					successmessage = 'submitted successfully';
				}

				window.showStylieNotification({
					message: successmessage,
					ttl: 7000,
					type: 'warn', // notice, warning, error or success
				});

			}

			if (eTarget.getAttribute('data-successfunction')) {
				var successFunctionString = eTarget.getAttribute('data-successfunction'),
					successfn = window[successFunctionString];
				// is object a function?
				if (typeof successfn === 'function') {
					successfn(res.body.data);
				}
			}
			else if (eTarget.getAttribute('data-deleted-redirect-href')) {
				var deleteredirecthref = eTarget.getAttribute('data-deleted-redirect-href');
				loadAjaxPage({
					datahref: deleteredirecthref,
					pushState: true
				});
			}
		}
	};
};

var async_admin_ajax_link_handler = function (e) {
	// console.log('e.target', e.target);
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
	var childWindowReference = consolePlatter.config().windowObjectReference;
	var t = setTimeout(function () {
		var newstylesheet = document.createElement('link');
		newstylesheet.setAttribute('type', 'text/css');
		newstylesheet.setAttribute('href', window.location.origin + '/stylesheets/default/periodic.css');
		newstylesheet.setAttribute('rel', 'stylesheet');
		var newstylesheet2 = document.createElement('link');
		newstylesheet2.setAttribute('type', 'text/css');
		newstylesheet2.setAttribute('href', window.location.origin + '/extensions/periodicjs.ext.asyncadmin/stylesheets/asyncadmin.css');
		newstylesheet2.setAttribute('rel', 'stylesheet');
		childWindowReference.document.getElementsByTagName('head')[0].appendChild(newstylesheet);
		childWindowReference.document.getElementsByTagName('head')[0].appendChild(newstylesheet2);
		classie.add(childWindowReference.document.querySelector('html'), 'ts');

		childWindowReference.document.querySelector('body').setAttribute('id', 'admin-console-body');

		adminConsoleWindowResizeEventHandler();
		clearTimeout(t);
	}, 200);

	childWindowReference.window.addEventListener('resize', adminConsoleWindowResizeEventHandler, false);
};

var asyncAdminContentElementClick = function (e) {
	var etarget = e.target; //,
	//	etargethref = etarget.href || etarget.getAttribute('data-ajax-href');

	if (!classie.has(etarget, 'ts-open-admin-console')) {
		consolePlatter.hidePlatterPane();
	}
	// if (classie.has(etarget, 'async-admin-ajax-link')) {
	// 	e.preventDefault();
	// 	// console.log('etargethref', etargethref);
	// 	loadAjaxPage({
	// 		datahref: etargethref,
	// 		pushState: true
	// 	});
	// 	return false;
	// }
};

var showAdminConsoleElementClick = function () {
	window.consolePlatter.showPlatterPane();
};

var navOverlayClickHandler = function () {
	closeMobileNav();
	closeSearchNav();
};

var initAjaxLinkEventListeners = function () {
	window.addEventListener('click', async_admin_ajax_link_handler, false);
};

var initEventListeners = function () {
	menuTriggerElement.addEventListener('click', controlMobileNav, false);
	asyncAdminContentElement.addEventListener('click', asyncAdminContentElementClick, false);
	adminButtonElement.addEventListener('click', showAdminConsoleElementClick, false);
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

var submit_admin_command = function () {
	// console.log('this', this);
	// console.log('this.value', this.value);
	// console.log('admin_command_inputElement.value', admin_command_inputElement.value);

	var data = admin_command_inputElement.value;
	var nt = document.createElement('span');
	nt.innerHTML = data;
	adminConsoleElementContent.lastChild.appendChild(nt);
	socket.emit('stdin', data);
	admin_command_inputElement.value = '';
};

var adminConsolePlatterConfig = function () {
	// console.log('window.admin_user.apikey', window.admin_user.apikey);
	socket = io();

	window.adminSocket = socket;
	// socket = io(window.location.hostname + ':' + window.socketIoPort);
	// Whenever the server emits 'user joined', log it in the chat body
	socket.on('log', function (data) {
		logToAdminConsole(data);
	});
	socket.on('connect', function () {
		logToAdminConsole('connected socket in client');
		socket.emit('createrepl', window.admin_user);
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
	socket.on('stdout', function (data) {
		logToAdminConsole(data);
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

		// spanSeparator.innerHTML = ' | ';
		adminConsoleSpanContainer.appendChild(adminButtonElement);
		adminConsoleSpanContainer.appendChild(data.element);
		adminConsoleSpanContainer.appendChild(spanSeparator);
	});

	consolePlatter.on('openedPlatterWindow', function ( /*data*/ ) {
		// console.log('openedPlatterWindow data', data);
		addStyleSheetToChildWindow();
		consolePlatter.hidePlatterPane();
	});

	admin_command_submitForm.addEventListener('submit', submit_admin_command, false);
	admin_command_submit_buttonElement.addEventListener('click', submit_admin_command, false);

	window.consolePlatter = consolePlatter;

	initServerSocketCallback();
};

window.showDefaultDataResponseModal = function (ajaxFormResponse) {
	// console.log(ajaxFormResponse.body.data);
	// seedcustomstatusoutputel.innerHTML = JSON.stringify(ajaxFormResponse.body.data, null, 2);
	var predata = document.createElement('pre'),
		h5element = document.createElement('h5'),
		hrelement = document.createElement('hr');

	h5element.innerHTML = 'Server Data Response';
	predata.innerHTML = JSON.stringify(ajaxFormResponse, null, 2);
	predata.setAttribute('class', 'ts-text-xs ts-overflow-auto');
	predata.setAttribute('style', 'max-height:30em;');

	window.servermodalElement.querySelector('#servermodal-content').innerHTML = '';
	window.servermodalElement.querySelector('#servermodal-content').appendChild(h5element);
	window.servermodalElement.querySelector('#servermodal-content').appendChild(hrelement);
	window.servermodalElement.querySelector('#servermodal-content').appendChild(predata);
	AdminModal.show('servermodal-modal');
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
		window.shownStylieNotification = new StylieNotification({
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
	window.StylieNotificationObject = new StylieNotification({
		message: options.message,
		ttl: (typeof options.ttl === 'boolean') ? options.ttl : 7000,
		wrapper: options.wrapper || document.querySelector('main'),
		layout: options.layout || 'growl',
		effect: options.effect || 'jelly',
		type: options.type, // notice, warning, error or success
		onClose: options.onClose || function () {}
	});
	window.shownStylieNotification = window.StylieNotificationObject.show();
};

window.showStylieAlert = function (options) {
	var sendOSAlert = function (options) {
		var osAlert;
		try {
			var notificationDiv = document.createElement('div');
			notificationDiv.innerHTML = options.message;
			osAlert = new window.Notification('New ' + window.periodic.name + ' alert', {
				body: notificationDiv.textContent,
				icon: '/favicon.png',
			});
		}
		catch (e) {
			console.warn('OS/Browser does not support Notifications', osAlert);
		}
		return osAlert;
	};
	window.shownStylieNotification = new StylieNotification({
		message: options.message,
		ttl: (typeof options.ttl === 'boolean') ? options.ttl : 7000,
		wrapper: options.wrapper || document.querySelector('main'),
		layout: options.layout || 'growl',
		effect: options.effect || 'slide',
		type: options.type, // notice, warning, error or success
		onClose: options.onClose || function () {}
	}).show();

	if (window.Notification) {
		if (window.Notification.permission !== 'granted') {
			window.Notification.requestPermission(function (permission) {
				if (permission === 'granted') {
					sendOSAlert(options);
				}
			});
		}
		else {
			sendOSAlert(options);
		}
	}
};

window.refresh_content_attributes_media = function (data) {
	var genericdoc = data.body.data.doc,
		medialistcheckbox_elements = document.querySelectorAll('.medialistcheckbox');
	if (content_attribute_template) {
		content_attribute_HTML = ejs.render(content_attribute_template, {
			genericdoc: genericdoc
		});
		content_attribute_content_html.innerHTML = content_attribute_HTML;
	}

	if (medialistcheckbox_elements && genericdoc.assets && medialistcheckbox_elements.length !== genericdoc.assets.length) {
		console.log('document.querySelectorAll(.medialistcheckbox).length', document.querySelectorAll('.medialistcheckbox').length);
		console.log('genericdoc.assets.length', genericdoc.assets.length);
		// console.log('do a window refresh');
		window.adminRefresh();
	}
};

window.adminRefresh = function () {
	loadAjaxPage({
		datahref: window.location.href
	});
};

window.restartAppResponse = function ( /*ajaxFormResponse*/ ) {
	// window.adminRefresh();
	var t;
	if (alreadyAttachedAppResponse === false) {
		window.adminSocket.on('disconnect', function () {
			t = setTimeout(function () {
				window.StylieNotificationObject.dismiss();
			}, 500);
			// window.StylieNotificationObject.dismiss();
			window.showStylieAlert({
				message: 'Shutting down application and restarting Periodic. (' + new Date() + ')'
			});
			window.showPreloader();
		});
		window.adminSocket.on('connect', function () {
			window.StylieNotificationObject.dismiss();
			window.showStylieAlert({
				message: 'Periodic application restarted.(' + new Date() + ')'
			});
			clearTimeout(t);
			window.adminRefresh();
		});
		alreadyAttachedAppResponse = true;
	}
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

	admin_command_inputElement = document.querySelector('#admin_command_input');
	admin_command_submit_buttonElement = document.querySelector('#admin_command_submit_button');
	admin_command_submitForm = document.querySelector('#admin_command_submitForm');


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

	search_menu_input = document.querySelector('#searchall-input');
	search_menu_content = document.querySelector('#ts-search-content');
	search_result_template = document.querySelector('#ts-search-result-template').innerHTML;

	servermodalElement = document.querySelector('#servermodal-modal');
	confirmDeleteYes = document.getElementById('confirm-delete-yes');
	ejs.delimiter = '?';

	for (var u = 0; u < ajaxlinks.length; u++) {
		ajaxlinks[u].addEventListener('click', preventDefaultClick, false);
	}

	if (mobile_nav_menu) {
		// mobile_nav_menu.addEventListener('mousedown', async_admin_ajax_link_handler, false);
		mobile_nav_menu.addEventListener('click', async_admin_ajax_link_handler, false);
	}
	asyncAdminPushie = new Pushie({
		replacecallback: pushstatecallback,
		pushcallback: pushstatecallback,
		popcallback: statecallback
	});
	adminConsolePlatterConfig();
	initEventListeners();
	initAjaxLinkEventListeners();
	initFlashMessage();
	initSummernote();
	initAjaxFormies();
	initTabs();
	initModalWindows();
	initCodemirrors();
	initAjaxDeleteButtonListeners();
	initAjaxSubmitButtonListeners();
	initDatalists();
	initMedialists();
	initFilterlists();
	initAdminSearch();

	window.adminConsoleElementContent = adminConsoleElementContent;
	window.servermodalElement = servermodalElement;
	window.asyncHTMLWrapper = asyncHTMLWrapper;
	window.logToAdminConsole = logToAdminConsole;
	window.AdminModal = AdminModal;
	window.loadAjaxPage = loadAjaxPage;
	window.StylieNotification = StylieNotification;
});
