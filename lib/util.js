'use strict';

// node api
var fs = require('fs');

// local lib
var Logger = require('./logger');

var log = new Logger(Logger.WARNING);

var path = require('path');


function findCommonBase(files) {



	if (!files || files.length ===0 ||files.length === 1) {
		return '';
	}

	var lastSlash = files[0].lastIndexOf(path.sep);

	if (!lastSlash) {
		return '';
	}

	var first = files[0].substr(0, lastSlash + 1);
	var prefixlen = first.length;

	function handleFilePrefixing(file) {
		for (var i = prefixlen; i > 0; i--) {
			if (file.substr(0, i) === first.substr(0, i)) {
				prefixlen = i;
				return;
			}
		}
		prefixlen = 0;
	}

	files.forEach(handleFilePrefixing);

	return first.substr(0, prefixlen - 1);
}

function formatJSON(report) {
	function replacer(k, v) {
		if (k === 'identifiers') {
			return ['__stripped__'];
		}
		return v;
	}
	return JSON.stringify(report, replacer);
}

function readJSON(file, options) {
	if (options.q) {
		log.level = Logger.ERROR;
	}
	var result = {};
	if (fs.existsSync(file)) {
		log.debug('Parsing JSON from file %s', file);
		try {
			var src = fs.readFileSync(file);
			result = JSON.parse(src);
		} catch (e) {
			log.warning('Could not parse JSON from file %s', file);
		}
	} else {
		log.info('Not parsing missing file "%s"', file);
	}
	return result;
}

function stripComments(str) {
  /*jshint regexp:false */
	str = str || '';

	var multiline = /\/\*(?:(?!\*\/)|.|\n)*?\*\//g;
	var singleline = /\/\/.*/g;

	return str.replace(multiline, '').replace(singleline, '');
}

// http://stackoverflow.com/a/4835406/338762
function escapeHTML(html) {
	return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

exports.findCommonBase = findCommonBase;
exports.formatJSON = formatJSON;
exports.readJSON = readJSON;
exports.stripComments = stripComments;
exports.escapeHTML = escapeHTML;
