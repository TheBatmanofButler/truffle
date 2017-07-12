$( document ).ready(function() {

	sessionStorage.setItem("codeIsChanged", JSON.stringify(false));
	var scanOn = JSON.parse(sessionStorage.getItem("scanOn"));
	if (searchResults)
		loadSearchResults();
	else
		setupCodeMirror();

	setupFilePanel();
	setSelectedLink();

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
			$(".one-line").show();
			$(".bottom-box").animate({height: "50%"}, function () {
				startScan();
			})
		}
		else {
			$(".one-line").hide();
			$(".bottom-box").animate({height: "0"}, function () {
				endScan();
			});
		}
	});

	$(".next-button").click( function () {
		nextScanPath();
	});

	$(".previous-button").click( function () {
		previousScanPath();
	});

	$(".flow-option").click(function(e) {
		loadCallGraph();
	});

	$(".end-scan-button").click( function () {
		$(".one-line").hide();
		$(".bottom-box").animate({height: "0"}, function () {
			endScan();
		});
	});

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

function setupFilePanel() {
	$(".file-panel li").click(function (e) {
		e.stopPropagation();
		$(this).children().not("i,a, .directory-name").animate({
			height: "toggle"
		})
		$(this).children("i").toggleClass("right");

		if ($(this).attr("id")) {
			var selectedLink = $(this).attr("id")
			sessionStorage.setItem("selectedLink", JSON.stringify(selectedLink));
			console.log($.trim($("#" + selectedLink).text()))
			sessionStorage.setItem("selectedFilename", $.trim($("#" + selectedLink).text()));
		}

	});
}

function setSelectedLink() {
	var currentFile = getFileNameFromURL();

	if (currentFile) {
		var domId = pathToDomId(currentFile)
		var shortName = getShortNameFromFileName(currentFile)

		$("#" + domId).css("font-weight", "bold");

		var codeIsChanged = JSON.parse(sessionStorage.getItem("codeIsChanged"));
		if (codeIsChanged) {
			$("#" + domId).text( function() {
				return shortName + "*";
			});
			$("#" + domId).css("font-style", "italic");
		}
		else {
			$("#" + domId).text(shortName);
			$("#" + domId).css("font-style", "normal");
		}
	}
}