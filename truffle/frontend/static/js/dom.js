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

	$(".scan-option").click( function (e) {
		var scanOn = JSON.parse(sessionStorage.getItem("scanOn"));
		if (!scanOn) {
			$(".bottom-box-inner").show();
			$(".bottom-box").animate({height: "50%"}, function () {
				startScan();
			});
		}
		else {
			$(".bottom-box-inner").hide();
			$(".bottom-box").animate({height: "0"}, function () {
				endScan();
			});
		}
	});

	$(".next-button").click( function () {
		nextInScan(false);
	});

	$(".previous-button").click( function () {
		nextInScan(true);
	});

	$(".flow-option").click(function(e) {
		loadCallGraph();
	});

	$(".end-scan-button").click( function () {
		$(".single-line").hide();
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

	$(".search-overlay").click( function (e) {
		$('.search-overlay').fadeOut(function() {
			$('.search').val('');
		});
	});

	$(".bottom-box-tab").click( function (e) {
		$(".bottom-box-tab").removeClass("selected");
		$(this).addClass("selected");
		changeBottomBox();
	})

	if (scanOn) {
		$(".bottom-box-inner").show();
		$(".bottom-box").animate({height: "50%"});
	}
	else {
		$(".bottom-box-inner").hide();
		$(".bottom-box").animate({height: "0"});
	}

});

function changeBottomBox() {
	var classes = $(".selected").attr('class').split(' ');
	var mode;
	$(".bottom-box-option").hide();

	if (classes.indexOf("single-line-tab") != -1) {
		$(".single-line").show();
		mode = 0;
	}
	else if (classes.indexOf("multi-line-tab") != -1) {
		$(".multi-line").show();
		mode = 1;
	}
	else {
		$(".calling-functions").show();
		mode = 2;
	}

	sessionStorage.setItem("commentBoxMode", JSON.stringify(mode));
	var lineno = getLinenoFromStorage();
	if (lineno) {
		setupBottomBox(lineno);		
	}
}

function setupFilePanel() {
	$(".file-panel li").click(function (e) {
		e.stopPropagation();
		var $directoryElements = $(this).children().not("i,a, .directory-name");
		var scanOn = JSON.parse(sessionStorage.getItem("scanOn"));

		if ($directoryElements.length > 0) {
			$(this).children().not("i,a, .directory-name").animate({
				height: "toggle"
			})
			$(this).children("i").toggleClass("right");
		}
		else if (scanOn) {
			e.preventDefault();
			alert("Cannot change files in the middle of a scan.")
		}
		else if ($(this).attr("id")) {
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