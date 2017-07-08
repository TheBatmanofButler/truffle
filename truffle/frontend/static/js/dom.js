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

	$(".scan-option").click( function (e) {
		getScanPath();
	});

});
