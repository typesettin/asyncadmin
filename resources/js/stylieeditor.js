/*
 * stylie.treeview
 * https://github.com/typesettin/stylie.treeview
 *
 * Copyright (c) 2015 Yaw Joseph Etse. All rights reserved.
 */
'use strict';

var extend = require('util-extend'),
	CodeMirror = require('codemirror'),
	events = require('events'),
	classie = require('classie'),
	util = require('util');

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


/**
 * A module that represents a StylieTextEditor object, a componentTab is a page composition tool.
 * @{@link https://github.com/typesettin/stylie.treeview}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2015 Typesettin. All rights reserved.
 * @license MIT
 * @constructor StylieTextEditor
 * @requires module:util-extent
 * @requires module:util
 * @requires module:events
 * @param {object} el element of tab container
 * @param {object} options configuration options
 */
var StylieTextEditor = function (options) {
	events.EventEmitter.call(this);
	var defaultOptions = {
		type: 'html',
		updateOnChange: true
	};

	this.options = extend(defaultOptions, options);
	return this;
	// this.getTreeHTML = this.getTreeHTML;
};

util.inherits(StylieTextEditor, events.EventEmitter);

var createButton = function (options) {
	var buttonElement = document.createElement('button');
	buttonElement.setAttribute('class', 'ts-button ts-text-xs ' + options.classes);
	buttonElement.setAttribute('type', 'button');
	buttonElement.innerHTML = options.innerHTML;
	for (var key in options) {
		if (key !== 'classes' || key !== 'innerHTML' || key !== 'innerhtml') {
			buttonElement.setAttribute(key, options[key]);
		}
	}

	return buttonElement;
};

StylieTextEditor.prototype.addMenuButtons = function () {

};

var button_gofullscreen = function () {
	// console.log('button_gofullscreen this', this);
	// if()
	classie.toggle(this.options.elementContainer, 'ts-editor-fullscreen');
	classie.toggle(this.options.buttons.fullscreenButton, 'ts-button-primary-text-color');
};

var button_togglecodeeditor = function () {
	classie.toggle(this.options.codemirror.getWrapperElement(), 'ts-hidden');
	classie.toggle(this.options.buttons.codeButton, 'ts-button-primary-text-color');
	this.options.codemirror.refresh();
};

StylieTextEditor.prototype.initButtonEvents = function () {
	this.options.buttons.fullscreenButton.addEventListener('click', button_gofullscreen.bind(this), false);
	this.options.buttons.codeButton.addEventListener('click', button_togglecodeeditor.bind(this), false);
};

StylieTextEditor.prototype.init = function () {
	try {
		var previewEditibleDiv = document.createElement('div'),
			previewEditibleMenu = document.createElement('div'),
			previewEditibleContainer = document.createElement('div');
		this.options.buttons = {};
		this.options.buttons.boldButton = createButton({
			innerHTML: '<b>B</b>',
			'data-attribute-action': 'bold'
		});
		this.options.buttons.italicButton = createButton({
			innerHTML: '<em>I</em>',
			'data-attribute-action': 'italic'
		});
		this.options.buttons.underlineButton = createButton({
			innerHTML: '<u>U</u>',
			'data-attribute-action': 'underline'
		});
		this.options.buttons.unorderedLIButton = createButton({
			innerHTML: 'bullet',
			'data-attribute-action': 'unorderedLI'
		});
		this.options.buttons.orderedLIButton = createButton({
			innerHTML: 'list',
			'data-attribute-action': 'orderedLI'
		});
		this.options.buttons.textalignButton = createButton({
			innerHTML: 'text align',
			'data-attribute-action': 'textalign'
		});
		this.options.buttons.linkButton = createButton({
			innerHTML: 'link',
			'data-attribute-action': 'link'
		});
		this.options.buttons.imageButton = createButton({
			innerHTML: 'img',
			'data-attribute-action': 'image'
		});
		this.options.buttons.codeButton = createButton({
			innerHTML: '&lt;/&gt;',
			title: 'Source code editor',
			'data-attribute-action': 'code'
		});
		this.options.buttons.fullscreenButton = createButton({
			innerHTML: '+',
			title: 'Maximize and fullscreen editor',
			'data-attribute-action': 'fullscreen'
		});
		previewEditibleMenu.appendChild(this.options.buttons.boldButton);
		previewEditibleMenu.appendChild(this.options.buttons.italicButton);
		previewEditibleMenu.appendChild(this.options.buttons.underlineButton);
		previewEditibleMenu.appendChild(this.options.buttons.unorderedLIButton);
		previewEditibleMenu.appendChild(this.options.buttons.orderedLIButton);
		previewEditibleMenu.appendChild(this.options.buttons.textalignButton);
		previewEditibleMenu.appendChild(this.options.buttons.linkButton);
		previewEditibleMenu.appendChild(this.options.buttons.imageButton);
		previewEditibleMenu.appendChild(this.options.buttons.codeButton);
		previewEditibleMenu.appendChild(this.options.buttons.fullscreenButton);
		previewEditibleMenu.setAttribute('class', 'ts-input ts-editor-menu ts-padding-sm');
		previewEditibleMenu.setAttribute('style', 'font-family: monospace, Arial,"Times New Roman";');
		previewEditibleDiv.setAttribute('class', 'ts-input ts-texteditor');
		previewEditibleDiv.setAttribute('contenteditable', 'true');
		previewEditibleDiv.setAttribute('tabindex', '1');
		previewEditibleContainer.setAttribute('id', this.options.element.getAttribute('id') + '_container');
		previewEditibleContainer.setAttribute('class', 'ts-editor-container');
		previewEditibleContainer.appendChild(previewEditibleMenu);
		previewEditibleContainer.appendChild(previewEditibleDiv);
		this.options.element = this.options.element || document.querySelector(this.options.elementSelector);
		previewEditibleDiv.innerHTML = this.options.element.innerText;
		this.options.previewElement = previewEditibleDiv;
		//now add code mirror

		this.options.elementContainer = previewEditibleContainer;
		this.options.element.parentNode.appendChild(previewEditibleContainer);
		previewEditibleContainer.appendChild(this.options.element);
		this.options.codemirror = CodeMirror.fromTextArea(
			this.options.element, {
				lineNumbers: true,
				lineWrapping: true,
				matchBrackets: true,
				autoCloseBrackets: true,
				mode: (this.options.type === 'ejs') ? 'text/ejs' : 'text/html',
				indentUnit: 2,
				indentWithTabs: true,
				'overflow-y': 'hidden',
				'overflow-x': 'auto',
				lint: true,
				gutters: [
					'CodeMirror-linenumbers',
					'CodeMirror-foldgutter',
					// 'CodeMirror-lint-markers'
				],
				foldGutter: true
			}
		);
		// this.options.element.parentNode.insertBefore(previewEditibleDiv, this.options.element);
		this.options.codemirror.on('blur', function (instance) {
			// console.log('editor lost focuss', instance, change);
			this.options.previewElement.innerHTML = instance.getValue();
		}.bind(this));
		this.options.previewElement.addEventListener('blur', function () {
			this.options.codemirror.getDoc().setValue(this.options.previewElement.innerHTML);
		}.bind(this));

		if (this.options.updateOnChange) {
			this.options.codemirror.on('change', function (instance) {
				// console.log('editor lost focuss', instance, change);
				this.options.previewElement.innerHTML = instance.getValue();
			}.bind(this));
			this.options.previewElement.addEventListener('change', function () {
				this.options.codemirror.getDoc().setValue(this.options.previewElement.innerHTML);
			}.bind(this));
		}
		//set initial code mirror
		this.options.codemirror.getDoc().setValue(this.options.previewElement.innerHTML);
		this.options.codemirror.refresh();
		classie.add(this.options.codemirror.getWrapperElement(), 'ts-hidden');
		// setTimeout(this.options.codemirror.refresh, 1000);


		this.initButtonEvents();
		return this;
	}
	catch (e) {
		console.error(e);
	}
};

StylieTextEditor.prototype.getValue = function () {
	return this.options.previewElement.innerText || this.options.codemirror.getValue();
};

module.exports = StylieTextEditor;
