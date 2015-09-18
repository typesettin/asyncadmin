'use strict';

var json2html = require('node-json2html'),
	merge = require('util-extend');

var get_attribute_tags = function(attributes){
	var returnHtml = ' ';

	for(var key in attributes){
		returnHtml+=' '+key+'="'+attributes[key]+'" ';
	}

	returnHtml += ' ';
	return returnHtml;
};

var get_data_table_html = function(options){
	options = options ||{};
	options.table_head_attributes = options.table_head_attributes || {};
	options.thead_attributes = options.thead_attributes || {};
	options.tbody_attributes = options.tbody_attributes || {};
	options.tfoot_attributes = options.tfoot_attributes || {};
	var dataObj = options.data,
		table_attributes = merge({
			class:'ts-table ts-table-padding-md ts-text-left ts-width-100 ts-text-xs'
		},options.table_head_attributes),
		thead_attributes = merge({
			class:'ts-table-head'
		},options.thead_attributes),
		tbody_attributes = merge({
			class:'ts-table-body'
		},options.tbody_attributes),
		tfoot_attributes = merge({
			class:'ts-table-foot'
		},options.tfoot_attributes),
		data_attributes = options.data_attributes,
		thead = options.thead,
		tbody = options.tbody,
		tfoot = options.tfoot,
		static_data = options.static_data ||{},
		custom_thead = options.custom_thead,
		custom_tbody = options.custom_tbody,
		custom_tfoot = options.custom_tfoot,
		// maxDepth = options.maxDepth || 3,
		data_table_html = '<table '+get_attribute_tags(table_attributes)+' >';



	if(custom_thead){
		data_table_html+=custom_thead;
	}
	else if(thead){
		data_table_html+='<thead '+get_attribute_tags(thead_attributes)+' ><tr>';
		data_table_html+=json2html.transform(data_attributes,thead);
		data_table_html+='</tr></thead>';
	}

	if(custom_tbody){
		data_table_html+=custom_tbody;
	}
	else if(tbody){
		data_table_html+='<tbody '+get_attribute_tags(tbody_attributes)+' >';
		if(static_data){
			dataObj = dataObj.map(function(body_data){
				body_data.static_data = static_data;
				return body_data;
			});
		}
		data_table_html+=json2html.transform(dataObj,tbody);
		data_table_html+='</tbody>';
	}

	if(custom_tfoot){
		data_table_html+=custom_tfoot;
	}
	else if(tfoot){
		data_table_html+='<tfoot '+get_attribute_tags(tfoot_attributes)+' ><tr><td>footer</td>';
		data_table_html+='</tr></tfoot>';
	}

	data_table_html+='</table>';
	return data_table_html;
};

exports.get_data_table_html = get_data_table_html;