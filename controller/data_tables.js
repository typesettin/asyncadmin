'use strict';

var json2html,
	moment = require('moment'),
	Moment = moment,
	// querystring = require('querystring'),
	merge = require('util-extend'),
	pluralize = require('pluralize');
pluralize.addIrregularRule('category', 'categories');


// if (typeof module !== 'undefined' && module.exports) {
// 	json2html = require('node-json2html');
// }
// else {
json2html = require('./json2html');
// }


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
			class: 'ts-table ts-sort-table ts-table-padding-md ts-text-left ts-width-100 ts-text-xs '
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
		var collapseName = (typeof options.getCollapseNameFunction === 'function') ? options.getCollapseNameFunction(data_item) : data_item.name;
		var editlink = options.editlink.replace('|||_id|||', data_item._id);
		var deletelink = options.deletelink.replace('|||_id|||', data_item._id);
		var drcHTML = '<div class="ts-pull-right">';
		drcHTML += '<a href="' + editlink + '" class="async-admin-ajax-link" data-ajax-href="' + editlink + '"><img src="/extensions/periodicjs.ext.asyncadmin/img/icons/doc_edit_three.svg" alt="edit" class="ts-icon async-admin-ajax-link" data-ajax-href="' + editlink + '"/></a>';
		drcHTML += '<a class="ts-button-error-color ts-dialog-delete"  data-href="' + deletelink + '" data-deleted-redirect-href="' + options.deleterefreshlink + '" ><img src="/extensions/periodicjs.ext.asyncadmin/img/icons/doc_delete.svg" class="ts-icon  ts-dialog-delete"  data-href="' + deletelink + '" data-deleted-redirect-href="' + options.deleterefreshlink + '" alt="delete" /></a>';
		drcHTML += '</div>';
		drcHTML += collapseName + ' <small class="ts-text-divider-text-color">(' + new Moment(data_item.createdat).format('MM/DD/YYYY hh:mm:ssa') + ')</small>';
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
		html: '<span class="sort_tr sort_tr_${sortactive}" data-sortid="${sortid}" data-sortorder="${sortorder}" >${label}</span>'
	};
};

var default_custom_tfoot = function (options) {
	var colspan = options.colspan || 10,
		currentlimit = options.currentlimit || 15,
		currentpage = options.currentpage || 1,
		genericdocsperpage = [{
			'value': currentlimit,
			'label': currentlimit
		}, {
			'value': '15',
			'label': '15'
		}, {
			'value': '30',
			'label': '30'
		}, {
			'value': '50',
			'label': '50'
		}, {
			'value': '250',
			'label': '250'
		}, {
			'value': '500',
			'label': '500'
		}, {
			'value': options.count,
			'label': options.count
		}];

	var returnHTML = '<tfoot class="ts-table-foot">';
	returnHTML += '<tr>';
	returnHTML += '<td class="ts-text-center" colspan="' + colspan + '">';
	if (currentpage > 1) {
		returnHTML += '<a class="search-filter-prev-page"> <span class="ts-text-text-primary-color ts-cursor-pointer">&lsaquo; prev</span></a> | ';
	}
	returnHTML += 'showing <select class="table-search-limit">';
	genericdocsperpage.forEach(function (iperpage) {
		returnHTML += '<option ';
		if (currentlimit === iperpage.value) {
			returnHTML += ' selected="selected" ';
		}
		returnHTML += ' value="' + iperpage.value + '"> ';
		returnHTML += iperpage.label + '</option>';
	});
	returnHTML += '</select>';
	returnHTML += ' of ' + options.count + ' total';
	if (currentpage < options.pages) {
		returnHTML += ' | <a class="search-filter-next-page"> <span class="ts-text-text-primary-color ts-cursor-pointer">next &rsaquo;</span></a>';
	}
	returnHTML += '</td>';
	returnHTML += '</tr>';
	returnHTML += '</tfoot>';
	return returnHTML;
};


var cms_default_responsive_collapse = function (options) {
	var path_to_content = options.path_to_content || 'content',
		defaultOptions = {
			editlink: '/' + options.adminPath + '/'+path_to_content+'/' + options.model_name + '/|||_id|||/edit',
			deletelink: '/' + options.adminPath + '/'+path_to_content+'/' + options.model_name + '/|||_id|||/delete',
			deleterefreshlink: '/' + options.adminPath + '/'+path_to_content+'/' + pluralize.plural(options.model_name) + '/'
		};
	return function (data_item) {
		var editlink = defaultOptions.editlink.replace('|||_id|||', data_item._id);
		var deletelink = defaultOptions.deletelink.replace('|||_id|||', data_item._id);
		var drcHTML = '<div class="ts-pull-right">';
		drcHTML += '<a href="' + editlink + '" class="async-admin-ajax-link" data-ajax-href="' + editlink + '"><img src="/extensions/periodicjs.ext.asyncadmin/img/icons/doc_edit_three.svg" alt="edit" class="ts-icon async-admin-ajax-link" data-ajax-href="' + editlink + '"/></a>';
		drcHTML += '<a class="ts-button-error-color ts-dialog-delete"  data-href="' + deletelink + '" data-deleted-redirect-href="' + options.deleterefreshlink + '" ><img src="/extensions/periodicjs.ext.asyncadmin/img/icons/doc_delete.svg" class="ts-icon  ts-dialog-delete"  data-href="' + deletelink + '" data-deleted-redirect-href="' + defaultOptions.deleterefreshlink + '" alt="delete" /></a>';
		drcHTML += '</div>';
		drcHTML += data_item.name + ' <small class="ts-text-divider-text-color">(' + new Moment(data_item.createdat).format('MM/DD/YYYY hh:mm:ssa') + ')</small>';
		return drcHTML;
	};
};

var get_taxonomy_html = function (options) {
	var path_to_content = options.path_to_content || 'content',
		returnHTML = '',
		display_tax_model_name = (options.tax_model_name === 'user') ? 'author' : options.tax_model_name;
	if (options.generictaxomony && options.generictaxomony.length > 0) {
		if (options.tax_model_name === 'attribute' || options.tax_model_name === 'parent') {
			returnHTML += display_tax_model_name + ': ';
		}
		else {
			returnHTML += pluralize.plural(display_tax_model_name) + ': ';
		}
		options.generictaxomony.forEach(function (generictax, i) {
			var displaylink = generictax.title || generictax.name || generictax.username;
			if (options.tax_model_name === 'attribute' || options.tax_model_name === 'parent') {
				returnHTML += '<small class="ts-text-divider-text-color" >' + displaylink + '</small> ';
			}
			else {
				returnHTML += '<a class="async-admin-ajax-link" href="/' + options.adminPath + '/'+path_to_content+'/' + options.tax_model_name + '/' + generictax._id + '/edit">' + displaylink + '</a> ';
			}
			if (i !== (options.generictaxomony.length - 1)) {
				returnHTML += ' , ';
			}
		});
	}
	return returnHTML;
};

var get_assets_html = function (options) {
	var returnHTML = '';
	if (options.genericassets && options.genericassets.length > 0) {
		returnHTML += '<div>';
		options.genericassets.forEach(function (genericasset) {
			returnHTML += '<span class="ts-padding-md">';
			// returnHTML+='<figure>';
			// image79
			// lock72 - keyhole lock74
			// zipped2 - zip
			if(genericasset.attributes && genericasset.attributes.encrypted_client_side){
				returnHTML += '<span class="ts-button flaticon-file82 ts-text-xx"></span>';
			}
			else if (genericasset.assettype && genericasset.assettype.match('audio')) {
				returnHTML += '<span class="ts-button flaticon-audio55 ts-text-xx"></span>';
			}
			else if (genericasset.assettype && genericasset.assettype.match('music')) {
				returnHTML += '<span class="ts-button flaticon-music232 ts-text-xx"></span>';
			}
			else if (genericasset.assettype && genericasset.assettype.match('application') || genericasset.assettype && genericasset.assettype.match('javascript') || genericasset.assettype && genericasset.assettype.match('css')) {
				returnHTML += '<span class="ts-button flaticon-code41 ts-text-xx"></span>';
			}
			else if (genericasset.assettype && genericasset.assettype.match('video')) {
				returnHTML += '<span class="ts-button flaticon-video170 ts-text-xx"></span>';
			}
			else if (genericasset.assettype && genericasset.assettype.match('word')) {
				returnHTML += '<span class="ts-button flaticon-word6 ts-text-xx"></span>';
			}
			else if (genericasset.assettype && genericasset.assettype.match('excel')) {
				returnHTML += '<span class="ts-button flaticon-x16 ts-text-xx"></span>';
			}
			else if (genericasset.assettype && genericasset.assettype.match('zip')) {
				returnHTML += '<span class="ts-button flaticon-compressed1 ts-text-xx"></span>';
			}
			else if (genericasset.assettype && genericasset.assettype.match('image')) {
				returnHTML += '<img style="max-width:4em; max-height:4em;" src="' + genericasset.fileurl + '"/>';
			}
			else if (genericasset.assettype && genericasset.assettype.match('text')) {
				returnHTML += '<span class="ts-button flaticon-text140 ts-text-xx"></span>';
			}
			else {
				returnHTML += '<span class="ts-button flaticon-file87 ts-text-xx"></span>';
			}
			//delete - recycle70
			//edit - write19
			// returnHTML+='<caption>'+ genericasset.title +'</caption>';
			// returnHTML+='</figure>';
		});
			returnHTML += '</div>';
	}
	return returnHTML;
};

var cms_default_tbody = function (options) {
	var path_to_content = options.path_to_content || 'content',
		jsontableobj = {};

	jsontableobj = {
		tag: 'tr',
		style: 'vertical-align:top;',
		html: function (obj /*,i*/ ) {
			var displayname = obj.title || obj.name || obj._id;
			if(obj.attributes && obj.attributes.encrypted_client_side){
				displayname+=' <i class="flaticon-access1 ts-text-xs ts-button-icon"></i>';
			}
			var jsontablehtml;
			jsontablehtml = '<td>';
			jsontablehtml += '<a href="/' + options.adminPath + '/'+path_to_content+'/' + options.model_name + '/' + obj._id + '/edit"  class="async-admin-ajax-link">' + displayname + '</a>';
			jsontablehtml += '</td>';
			//create date
			jsontablehtml += '<td>' + new Moment(obj.createdat).format('MM/DD/YYYY |  hh:mm:ssa') + '</td>';

			//authors
			options.generictaxomony = obj.authors;
			options.tax_model_name = 'user';
			jsontablehtml += '<td>' + get_taxonomy_html(options);
			//assets
			if (options.model_name === 'asset') {
				jsontablehtml += get_assets_html({
					genericassets: [obj]
				});
			}
			//contenttypes
			options.generictaxomony = obj.contenttypes;
			options.tax_model_name = 'contenttype';
			jsontablehtml += get_taxonomy_html(options);
			//tags
			options.generictaxomony = obj.tags;
			options.tax_model_name = 'tag';
			jsontablehtml += get_taxonomy_html(options);
			//categories
			options.generictaxomony = obj.categories;
			options.tax_model_name = 'category';
			jsontablehtml += get_taxonomy_html(options);
			//attributes
			options.generictaxomony = obj.attributes;
			options.tax_model_name = 'attribute';
			jsontablehtml += get_taxonomy_html(options);
			//parent
			options.generictaxomony = obj.parent;
			options.tax_model_name = 'parent';
			jsontablehtml += get_taxonomy_html(options);
			jsontablehtml += get_assets_html({
				genericassets: obj.assets
			});
			jsontablehtml += '</td>';
			//options
			jsontablehtml += '<td> <a href="/' + options.adminPath + '/'+path_to_content+'/' + options.model_name + '/' + obj._id + '/edit"  class="async-admin-ajax-link flaticon-write19 ts-button-icon ts-button"></a>   ';
			jsontablehtml += '<a class="ts-button-error-color ts-dialog-delete flaticon-recycle70 ts-button-icon ts-button"  data-href="/' + options.adminPath + '/'+path_to_content+'/' + options.model_name + '/' + obj._id + '/delete" data-deleted-redirect-href="/' + options.adminPath + '/'+path_to_content+'/' + pluralize.plural(options.model_name) + '"/></a></td>';
			return jsontablehtml;
		}
	};
	return jsontableobj;
};

exports.cms_default_tbody = cms_default_tbody;
exports.cms_default_responsive_collapse = cms_default_responsive_collapse;

exports.default_responsive_collapse = default_responsive_collapse;
exports.default_responsive_expand = default_responsive_expand;
exports.default_thead = default_thead;
exports.default_custom_tfoot = default_custom_tfoot;
exports.get_data_table_html = get_data_table_html;
