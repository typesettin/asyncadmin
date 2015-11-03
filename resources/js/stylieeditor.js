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

StylieTextEditor.prototype.init = function () {
	try {
		var previewEditibleDiv = document.createElement('div');
		previewEditibleDiv.setAttribute('contenteditable', 'true');
		previewEditibleDiv.setAttribute('tabindex', '1');
		this.options.element = this.options.element || document.querySelector(this.options.elementSelector);
		previewEditibleDiv.innerHTML = this.options.element.innerHTML;
		this.options.previewElement = previewEditibleDiv;
		this.options.element.parentNode.insertBefore(previewEditibleDiv, this.options.element);
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
		return this;
	}
	catch (e) {
		console.error(e);
	}
};

// StylieTextEditor.prototype.getTreeFolder = function (treeitem) {
// 	var returnHTML = '<li>';
// 	returnHTML += '<label for="' + treeitem['tree-item-id'] + '"  ' + this.getTreeItemAttributes(treeitem['tree-item-attributes']) + ' >' + treeitem['tree-item-label'] + '</label>';
// 	returnHTML += '<input type="checkbox" id="' + treeitem['tree-item-id'] + '" ' + this.getTreeItemAttributes(treeitem['tree-item-input-attributes']) + ' />';
// 	returnHTML += '<ol>';
// 	treeitem['tree-item-folder-contents'].forEach(function (nestedTreeItem) {
// 		if (nestedTreeItem['tree-item'] === 'file') {
// 			returnHTML += this.getTreeFile(nestedTreeItem);
// 		}
// 		if (nestedTreeItem['tree-item'] === 'folder') {
// 			returnHTML += this.getTreeFolder(nestedTreeItem);
// 		}
// 	}.bind(this));
// 	returnHTML += '</ol>';
// 	returnHTML += '</li>';
// 	return returnHTML;
// };

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
