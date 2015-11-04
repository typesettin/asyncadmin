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
	// classie = require('classie'),
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
		type: 'html'
	};

	this.options = extend(defaultOptions, options);
	return this;
	// this.getTreeHTML = this.getTreeHTML;
};

util.inherits(StylieTextEditor, events.EventEmitter);

var createButton = function (options) {
	var buttonElement = document.createElement('button');
	buttonElement.setAttribute('class', 'ts-button ts-text-xs ' + options.classes);
	buttonElement.innerHTML = options.innerHTML;
	for (var key in options) {
		if (key !== 'classes' || key !== 'innerHTML') {
			buttonElement.setAttribute(key, options[key]);
		}
	}

	return buttonElement;
};

StylieTextEditor.prototype.init = function () {
	try {
		var previewEditibleDiv = document.createElement('div'),
			previewEditibleMenu = document.createElement('div'),
			previewEditibleContainer = document.createElement('div'),
			boldButton = createButton({
				innerHTML: '<b>B</b>',
				'data-attribute-action': 'bold'
			}),
			italicButton = createButton({
				innerHTML: '<em>I</em>',
				'data-attribute-action': 'italic'
			}),
			underlineButton = createButton({
				innerHTML: '<u>U</u>',
				'data-attribute-action': 'underline'
			}),
			unorderedLIButton = createButton({
				innerHTML: 'bullet',
				'data-attribute-action': 'unorderedLI'
			}),
			orderedLIButton = createButton({
				innerHTML: 'list',
				'data-attribute-action': 'orderedLI'
			}),
			textalignButton = createButton({
				innerHTML: 'text align',
				'data-attribute-action': 'textalign'
			}),
			linkButton = createButton({
				innerHTML: 'link',
				'data-attribute-action': 'link'
			}),
			imageButton = createButton({
				innerHTML: 'img',
				'data-attribute-action': 'image'
			}),
			codeButton = createButton({
				innerHTML: '&lt;/&gt;',
				'data-attribute-action': 'code'
			}),
			fullscreenButton = createButton({
				innerHTML: '+',
				'data-attribute-action': 'fullscreen'
			});
		previewEditibleMenu.appendChild(boldButton);
		previewEditibleMenu.appendChild(italicButton);
		previewEditibleMenu.appendChild(underlineButton);
		previewEditibleMenu.appendChild(unorderedLIButton);
		previewEditibleMenu.appendChild(orderedLIButton);
		previewEditibleMenu.appendChild(textalignButton);
		previewEditibleMenu.appendChild(linkButton);
		previewEditibleMenu.appendChild(imageButton);
		previewEditibleMenu.appendChild(codeButton);
		previewEditibleMenu.appendChild(fullscreenButton);
		previewEditibleMenu.setAttribute('class', 'ts-input ts-padding-sm');
		previewEditibleDiv.setAttribute('class', 'ts-input ts-texteditor');
		previewEditibleDiv.setAttribute('contenteditable', 'true');
		previewEditibleDiv.setAttribute('tabindex', '1');
		previewEditibleContainer.appendChild(previewEditibleMenu);
		previewEditibleContainer.appendChild(previewEditibleDiv);
		this.options.element = this.options.element || document.querySelector(this.options.elementSelector);
		previewEditibleDiv.innerHTML = this.options.element.innerText;
		this.options.previewElement = previewEditibleDiv;
		//now add code mirror
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
		this.options.element.parentNode.appendChild(previewEditibleContainer);
		// this.options.element.parentNode.insertBefore(previewEditibleDiv, this.options.element);
		this.options.codemirror.on('blur', function (instance) {
			// console.log('editor lost focuss', instance, change);
			this.options.previewElement.innerHTML = instance.getValue();
		}.bind(this));
		this.options.previewElement.addEventListener('blur', function () {
			this.options.codemirror.getDoc().setValue(this.options.previewElement.innerHTML);
		}.bind(this));
		//set initial code mirror
		this.options.codemirror.getDoc().setValue(this.options.previewElement.innerHTML);
		this.options.codemirror.refresh();
		// setTimeout(this.options.codemirror.refresh, 1000);

		setTimeout(function () {
			this.options.codemirror.refresh();
		}.bind(this), 500);

		return this;
	}
	catch (e) {
		console.error(e);
	}
};

StylieTextEditor.prototype.getValue = function () {
	return this.options.previewElement.innerText || this.options.codemirror.getValue();
};

// StylieTextEditor.prototype.getTreeFile = function (treeitem) {
// 	var returnHTML = '<li class="ts-file ">';
// 	returnHTML += '<a class="' + treeitem['tree-item-attributes']['class'] + '" ';
// 	returnHTML += 'id="' + treeitem['tree-item-id'] + '"  ';
// 	returnHTML += this.getTreeItemAttributes(treeitem['tree-item-attributes']);
// 	returnHTML += ' href="' + treeitem['tree-item-link'] + '">';
// 	returnHTML += treeitem['tree-item-label'];
// 	returnHTML += '</a>';
// 	returnHTML += '</li>';

// 	return returnHTML;
// };

// StylieTextEditor.prototype.getTreeItem = function (treeitem) {
// 	if (treeitem['tree-item'] === 'file') {
// 		return this.getTreeFile(treeitem);
// 	}
// 	if (treeitem['tree-item'] === 'folder') {
// 		return this.getTreeFolder(treeitem);
// 	}
// };


// /**
//  * Shows a modal component.
//  * @param {string} modal name
//  * @emits showModal
//  */
// StylieTextEditor.prototype.getTreeHTML = function () {
// 	var treeobject = this.options.tree,
// 		addedMainTreeId = treeobject['tree-item-id'] || '',
// 		addedMainTreeAttributes = treeobject['tree-item-attributes'],
// 		addedMainTreeClass = (addedMainTreeAttributes) ? addedMainTreeAttributes['class'] : '',
// 		returnHTML = '<ol class="ts-tree ' + addedMainTreeClass + '" id="' + addedMainTreeId + '" ' + this.getTreeItemAttributes(addedMainTreeAttributes) + ' >';
// 	treeobject.tree.forEach(function (treeitem) {
// 		returnHTML += this.getTreeItem(treeitem);
// 	}.bind(this));
// 	returnHTML += '</ol>';

// 	return returnHTML;
// };

module.exports = StylieTextEditor;
