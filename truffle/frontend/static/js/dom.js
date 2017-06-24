$( document ).ready(function() {

	setupCodeMirror();
	setDirectoryTreeLinkBackground();
	setupFilePanel();
	enableScanButton();
	enableAddCategoryButton();

});

$(document).click(function(e) { 
        console.log(888);
    
    if ($('.scan-panel').css('display') != "none") {
    	if (e.target != $('.scan-panel')[0] && !$('.scan-panel').find(e.target).length) {
	        bodyStyling();
		    enableScanButton();
		    // enableAddCategoryButton();
	        $('.scan-panel').hide();
    	}
    	else {
	        disableScanButton();
    	}
    }

    if ($('.add-category-panel').css('display') != "none") {
    	if (e.target != $('.add-category-panel')[0] && !$('.add-category-panel').find(e.target).length) {
	        console.log(111);
	        bodyStyling();
		    // enableScanButton();
		    enableAddCategoryButton();
	        $('.add-category-panel').hide();
    	}
    	else {
	        console.log(222);
	        disableAddCategoryButton();
    	}
    }
});
