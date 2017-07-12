var callsmap = {}

function hoverWidgetOnOverlay(cm, overlayClass, widget) {
	cm.addWidget({line:0, ch:0}, widget, true);
	widget.style.position = 'fixed';
	widget.style.zIndex=100000;
	widget.style.top=widget.style.left='-1000px'; // hide it 
	widget.dataset.token=null;

	cm.getWrapperElement().addEventListener('mousemove', e => {
		let onToken=e.target.classList.contains("cm-"+overlayClass), onWidget=(e.target===widget || widget.contains(e.target));

		if (onToken && e.target.innerText!==widget.dataset.token) { // entered token, show widget
			var rect = e.target.getBoundingClientRect();
			widget.style.left=rect.left+'px';
			widget.style.top=rect.bottom+'px';
			//let charCoords=cm.charCoords(cm.coordsChar({ left: e.pageX, top:e.pageY }));
			//widget.style.left=(e.pageX-5)+'px';  
			//widget.style.top=(cm.charCoords(cm.coordsChar({ left: e.pageX, top:e.pageY })).bottom-1)+'px';

			console.log(e)
			widget.dataset.token=e.target.innerText;
			if (typeof widget.onShown==='function') widget.onShown();

		} else if ((e.target===widget || widget.contains(e.target))) { // entered widget, call widget.onEntered
			if (widget.dataset.entered==='true' && typeof widget.onEntered==='function')  widget.onEntered();
			widget.dataset.entered='true';

		} else if (!onToken && widget.style.left!=='-1000px') { // we stepped outside
			widget.style.top=widget.style.left='-1000px'; // hide it 
			delete widget.dataset.token;
			widget.dataset.entered='false';
			if (typeof widget.onHidden==='function') widget.onHidden();
		}

		return true;
	});
}

function hyperlinkOverlay(cm) {
	if (!cm) return;
	
	const rx_word = "\", (){}[]=+-!"; // Define what separates a word

	var currentLine = 0

	function isHyperlinked(s) {
		fullpath = indexFname + '.' + s + '.' + currentLine
		if (fullpath in fileIndex['calls']) {	
			callsmap[s] = fullpath;
			return true
		}
		return false
	}

	cm.addOverlay({
		token: function(stream) {
			if (stream.sol())
				currentLine++;

			let ch = stream.peek();
			let word = "";

			if (!ch.match(/[a-zA-Z0-9\._]+/)) {
				stream.next();
				return null;
			}

			while ((ch = stream.peek()) && ch.match(/[a-zA-Z0-9\._]+/)) {
				word += ch;
				stream.next();
			}

			console.log(word)

			if (isHyperlinked(word)) return "index-link"; // CSS class: cm-url
		},
		blankLine: function(state) {
			currentLine++;
		}},	
		{ opaque : true }  // opaque will remove any spelling overlay etc
	);

	let widget=document.createElement('button');
	widget.innerHTML='&rarr;'
	widget.onclick=function(e) { 
		if (!widget.dataset.token) return;
		let s=widget.dataset.token;
		//let line = cm.getCursor()['line']
		//alert(link)
		//window.open(window.location.origin + link); 
		var link = callsmap[s]
		alert(link)
		var source = fileIndex['calls'][link]['source']
		alert(source)
		return true;
	};
 	hoverWidgetOnOverlay(cm, 'index-link', widget);
}
