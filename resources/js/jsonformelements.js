'use strict';

var jsonFormElements = function (options) {
	var returnhtml = '',
		jsonobject = options.jsonobject,
		prependinputname = (options.prependinputname) ? options.prependinputname + '.' : '',
		readonly = (options.readonly) ? 'disabled=disabled' : '',
		idnameprepend = (options.idnameprepend) ? options.idnameprepend : 'jfe',
		prependhtml = (options.prependhtml) ? options.prependhtml : '<div class="ts-row ts-form-row">',
		appendhtml = (options.appendhtml) ? options.appendhtml : '</div>',
		jreoptionvalues = options.jreoptionvalues;

	for (var x in jsonobject) {
		if (x.match('jfe-options-')) {
			jreoptionvalues = jsonobject[x];
			jreoptionvalues.name = x.replace('jfe-options-', '');
		}
		else if (typeof jsonobject[x] === 'object') {
			returnhtml += jsonFormElements({
				jsonobject: jsonobject[x],
				prependinputname: x,
				readonly: readonly,
				idnameprepend: idnameprepend,
				prependhtml: prependhtml,
				appendhtml: appendhtml,
				jreoptionvalues: jreoptionvalues
			});
		}
		else {
			var elementid = idnameprepend + '-' + prependinputname + x;
			var elementname = prependinputname + x;
			var elementval = jsonobject[x];
			returnhtml += prependhtml;
			returnhtml += '<label class="ts-col-span3 ts-label" for="' + elementid + '">' + elementname + '</label>';
			if (typeof elementval === 'boolean') {
				var selectOptionsFromBooleanVal = [true, false];
				returnhtml += '<select class="ts-col-span9 noFormSubmit" ';
				if (!options.readonly) {
					returnhtml += ' name="' + elementname + '" ';
				}
				returnhtml += '  >';
				for (var k in selectOptionsFromBooleanVal) {
					returnhtml += '<option ';
					if (selectOptionsFromBooleanVal[k] === elementval) {
						returnhtml += 'selected="selected"';
					}
					returnhtml += ' value="' + selectOptionsFromBooleanVal[k] + '">' + selectOptionsFromBooleanVal[k] + '</option>';
				}
				returnhtml += '</select>';
			}
			else if (jreoptionvalues && (jreoptionvalues.name === x) && jreoptionvalues.type === 'array' && jreoptionvalues.value) {
				var selectOptionsFromDefaultVal = jreoptionvalues.value.split(',');
				returnhtml += '<select class="ts-col-span9 noFormSubmit" ';
				if (!options.readonly) {
					returnhtml += ' name="' + elementname + '" ';
				}
				returnhtml += '  >';
				for (var j in selectOptionsFromDefaultVal) {
					returnhtml += '<option ';
					if (selectOptionsFromDefaultVal[j] === elementval) {
						returnhtml += 'selected="selected"';
					}
					returnhtml += ' value="' + selectOptionsFromDefaultVal[j] + '">' + selectOptionsFromDefaultVal[j] + '</option>';
				}
				returnhtml += '</select>';
			}
			else {
				returnhtml += '<input class="ts-col-span9" type="text" id="' + elementid + '" ';
				if (!options.readonly) {
					returnhtml += ' name="' + elementname + '" ';
				}
				returnhtml += ' value="' + elementval + '" ' + readonly + ' />';
			}
			returnhtml += appendhtml;
		}
	}
	return returnhtml;
};

module.exports = jsonFormElements;
