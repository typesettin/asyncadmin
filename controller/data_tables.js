'use strict';

var json2html = require('node-json2html'),
	moment = require('moment'),
	merge = require('util-extend');

var get_attribute_tags = function (attributes) {
	var returnHtml = ' ';

	for (var key in attributes) {
		returnHtml += ' ' + key + '="' + attributes[key] + '" ';
	}

	returnHtml += ' ';
	return returnHtml;
};

var get_data_table_html = function (options) {
	options = options || {};
	options.table_head_attributes = options.table_head_attributes || {};
	options.thead_attributes = options.thead_attributes || {};
	options.tbody_attributes = options.tbody_attributes || {};
	options.tfoot_attributes = options.tfoot_attributes || {};
	var dataObj = options.data,
		responsive_table = options.responsive_table,
		table_attributes = merge({
			class: 'ts-table ts-table-padding-md ts-text-left ts-width-100 ts-text-xs '
		}, options.table_head_attributes),
		thead_attributes = merge({
			class: 'ts-table-head'
		}, options.thead_attributes),
		tbody_attributes = merge({
			class: 'ts-table-body'
		}, options.tbody_attributes),
		tfoot_attributes = merge({
			class: 'ts-table-foot'
		}, options.tfoot_attributes),
		data_attributes = options.data_attributes,
		thead = options.thead,
		tbody = options.tbody,
		tfoot = options.tfoot,
		static_data = options.static_data || {},
		custom_thead = options.custom_thead,
		custom_tbody = options.custom_tbody,
		custom_tfoot = options.custom_tfoot,
		data_table_html = ' ';


	if (responsive_table) {
		data_table_html = '<div class=" ts-screensm-hidden ts-screenxs-hidden"> ';
	}
	data_table_html += '<table ' + get_attribute_tags(table_attributes) + ' >';
	if (custom_thead) {
		data_table_html += custom_thead;
	}
	else if (thead) {
		data_table_html += '<thead ' + get_attribute_tags(thead_attributes) + ' ><tr>';
		data_table_html += json2html.transform(data_attributes, thead);
		data_table_html += '</tr></thead>';
	}

	if (custom_tbody) {
		data_table_html += custom_tbody;
	}
	else if (tbody) {
		data_table_html += '<tbody ' + get_attribute_tags(tbody_attributes) + ' >';
		if (static_data) {
			dataObj = dataObj.map(function (body_data) {
				body_data.static_data = static_data;
				return body_data;
			});
		}
		data_table_html += json2html.transform(dataObj, tbody);
		data_table_html += '</tbody>';
	}

	if (custom_tfoot) {
		data_table_html += custom_tfoot;
	}
	else if (tfoot) {
		data_table_html += '<tfoot ' + get_attribute_tags(tfoot_attributes) + ' ><tr><td>footer</td>';
		data_table_html += '</tr></tfoot>';
	}

	data_table_html += '</table>';
	if (responsive_table) {

		data_table_html += '</div>';
		data_table_html += '<div class="ts-screenmd-hidden ts-screenlg-hidden ts-screenxl-hidden ts-screenxx-hidden">';

		dataObj.forEach(function (responsive_data_row, i) {

			data_table_html += '<details class="ts-genericdoc">';
			data_table_html += '<summary>';
			data_table_html += options.responsive_collapse(responsive_data_row, i);
			data_table_html += '</summary>';
			if (options.responsive_expand) {
				data_table_html += '<aside class="ts-text-xs">';
				data_table_html += options.responsive_expand(responsive_data_row, i);
				data_table_html += '</aside>';
			}
			data_table_html += '</details>';
		});
		data_table_html += '</div>';
	}
	return data_table_html;
};

var default_responsive_collapse = function (options) {
	return function (data_item) {
		var collapseName =(typeof options.getCollapseNameFunction ==='function')? options.getCollapseNameFunction(data_item) : data_item.name;
		var editlink = options.editlink.replace('|||_id|||', data_item._id);
		var deletelink = options.deletelink.replace('|||_id|||', data_item._id);
		var drcHTML = '<div class="ts-pull-right">';
		drcHTML += '<a href="' + editlink + '" class="async-admin-ajax-link" data-ajax-href="' + editlink + '"><img src="/extensions/periodicjs.ext.asyncadmin/img/icons/doc_edit_three.svg" alt="edit" class="ts-icon async-admin-ajax-link" data-ajax-href="' + editlink + '"/></a>';
		drcHTML += '<a class="ts-button-error-color ts-dialog-delete"  data-href="' + deletelink + '" data-deleted-redirect-href="' + options.deleterefreshlink + '" ><img src="/extensions/periodicjs.ext.asyncadmin/img/icons/doc_delete.svg" class="ts-icon  ts-dialog-delete"  data-href="' + deletelink + '" data-deleted-redirect-href="' + options.deleterefreshlink + '" alt="delete" /></a>';
		drcHTML += '</div>';
		drcHTML += collapseName + ' <small class="ts-text-divider-text-color">(' + new moment(data_item.createdat).format('MM/DD/YYYY hh:mm:ssa') + ')</small>';
		return drcHTML;
	};
};

var default_responsive_expand = function ( /* options */ ) {
	return function (data_item) {
		return '<pre class="ts-text-sm">' + JSON.stringify(data_item, null, 2) + '</pre>';
	};
};

var default_thead = function ( /* options */ ) {
	return {
		tag: 'th',
		html: '${label}'
	};
};

var default_custom_tfoot = function (options) {
	var colspan = options.colspan || 10;
	var returnHTML = '<tfoot class="ts-table-foot">';
	returnHTML += '<tr>';
	returnHTML += '<td class="ts-text-center" colspan="'+colspan+'">showing ' + options.total + ' of ' + options.count + ' total';
	returnHTML += '</td>';
	returnHTML += '</tr>';
	returnHTML += '</tfoot>';
	return returnHTML;
};

exports.default_responsive_collapse = default_responsive_collapse;
exports.default_responsive_expand = default_responsive_expand;
exports.default_thead = default_thead;
exports.default_custom_tfoot = default_custom_tfoot;
exports.get_data_table_html = get_data_table_html;
