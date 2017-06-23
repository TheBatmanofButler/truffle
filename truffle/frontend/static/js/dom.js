$( document ).ready(function() {

	setupCodeMirror();
	setDirectoryTreeLinkBackground();
	setupFilePanel();
	enableScanButton();

});

$(document).click(function(e) { 
    if ($('.scan-panel').css('display') != "none" && e.target != $('.scan-panel')[0] && !$('.scan-panel').find(e.target).length) {
        bodyStyling();
	    enableScanButton();
        $('.scan-panel').hide();
    }
    else {
        disableScanButton();
    }
});
