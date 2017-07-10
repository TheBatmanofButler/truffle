$( document ).ready(function() {

	sessionStorage.setItem("codeIsChanged", JSON.stringify(false));
	var scanOn = JSON.parse(sessionStorage.getItem("scanOn"));

	if (searchResults)
		loadSearchResults();
	else
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

	$(".next-button").click( function () {
		nextScanPath();
	})

	$(".flow-option").click(function(e) {
		loadCallGraph()
	});

	$(".end-scan-button").click( function () {
		console.log(222)
		endScan();
	})

	$(".search-option").click( function (e) {
		$('.search-overlay').fadeIn();
		$('.search').focus();
	});

	$(".search").click( function (e) {
		event.stopPropagation();
	});

	$(".search").keypress( function (e) {
		if (e.which == 13) {
			if ($(this).val()) {
				runSearch($(this).val());
				$('.search-overlay').click()
			}
		}
	});

	$(".search-overlay").click( function(e) {
		$('.search-overlay').fadeOut(function() {
			$('.search').val('');
		});
	});

	if (scanOn) {
		$(".one-line").show();
		$(".bottom-box").animate({height: "50%"});
	}

});
