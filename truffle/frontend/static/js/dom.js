$( document ).ready(function() {

	sessionStorage.setItem("codeIsChanged", JSON.stringify(false));
	var scanOn = JSON.parse(sessionStorage.getItem("scanOn"));

	setupCodeMirror();
	setDirectoryTreeLinkBackground();
	setupFilePanel();

	$( window ).on('beforeunload', function() {
		var codeIsChanged = JSON.parse(sessionStorage.getItem("codeIsChanged"));
		if (codeIsChanged) {
			return "Code unsaved";
		}
	});

	$('.current-tags').tagEditor({
	    initialTags: [],
	    delimiter: ', ', /* space and comma */
	    placeholder: 'Add Category Tags'
	});

	$(".scan-option").click( function (e) {
		if (!scanOn) {
			runScan();
		}
		else {
			endScan();
		}
	});

	$(".end-scan-button").click( function () {
		console.log(222)
		endScan();
	})

	$(".search-option").click( function (e) {
		runSearch();
	});

	if (scanOn) {
		$(".one-line").show();
		$(".bottom-box").animate({height: "50%"});
	}

});
