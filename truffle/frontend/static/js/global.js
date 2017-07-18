var codeText;
var searchResults;
var editor;

var categoryTags = "";
var categoryTagsRegex = new RegExp(/TruffleTags:[\s\S]*/);
var noCategoryTagsRegex = new RegExp(/[\s\S]*(?=TruffleTags:)/);
var functionRegex = "(def \w*\()(.*)(\):)";
var classRegex = "(class \w*\()(.*)(\):)";
var indentationRegex = new RegExp(/^[\s]*/);
var sqDocstringStartRegex = "[\s]*\'\'\'[\s\S]*";
var sqDocstringEndRegex = "[\s\S]*\'\'\'[\s]*";
var dqDocstringStartRegex = "[\s]*\"\"\"[\s\S]*";
var dqDocstringEndRegex = "[\s\S]*\"\"\"[\s]*";
var docstringRegex = new RegExp(/"""[^"]*"""|'''[^']*'''/);
var docstringFromStartRegex = new RegExp(/^[\s]*"""[^"]*"""|'''[^']*'''/);

var onelineDocstringEndRegex = new RegExp(/"""(.*?)"""/);