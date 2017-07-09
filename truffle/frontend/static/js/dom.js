$( document ).ready(function() {

	localStorage.setItem("codeIsChanged", JSON.stringify(false));

	setupCodeMirror();
	setDirectoryTreeLinkBackground();
	setupFilePanel();

	$( window ).on('beforeunload', function() {
		var codeIsChanged = JSON.parse(localStorage.getItem("codeIsChanged"));
		if (codeIsChanged) {
			return "Code unsaved";
		}
	});

	$('.current-tags').tagEditor({
	    initialTags: ['Hello', 'World', 'Example', 'Tags'],
	    delimiter: ', ', /* space and comma */
	    placeholder: 'Enter tags ...'
	});

	$(".scan-option").click( function (e) {
		runScan();
	});

	$(".search-option").click( function (e) {
		runSearch();
	});

});
