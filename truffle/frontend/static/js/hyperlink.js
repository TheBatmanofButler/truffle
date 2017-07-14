var callsmap = {}

function hoverWidgetOnOverlay(cm, overlayClass, widget) {
	cm.addWidget({line:0, ch:0}, widget, true);
	widget.style.position = 'fixed';
	widget.style.zIndex=100000;
	widget.style.top=widget.style.left='-1000px'; // hide it 
	widget.dataset.token=null;

	cm.getWrapperElement().addEventListener('mousemove', e => {

		let onToken=e.target.classList.contains("cm-"+overlayClass),
			onWidget=(e.target===widget || widget.contains(e.target));

		if (onToken && e.target.innerText!==widget.dataset.token) {
			var rect = e.target.getBoundingClientRect();
			widget.style.left=rect.left+'px';
			widget.style.top=rect.bottom+'px';
			widget.dataset.token=e.target.innerText;
			widget.dataset.type='cm-' + overlayClass;
			if (typeof widget.onShown==='function') widget.onShown();

		} else if ((e.target===widget || widget.contains(e.target))) {
			if (widget.dataset.entered==='true' &&
				typeof widget.onEntered==='function')  widget.onEntered();
			widget.dataset.entered='true';

		} else if (!onToken && widget.style.left!=='-1000px') {
			widget.style.top=widget.style.left='-1000px';
			delete widget.dataset.token;
			widget.dataset.entered='false';
			if (typeof widget.onHidden==='function')
				widget.onHidden();
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

	function isFunctionDef(s) {
		fullpath = indexFname + '.' + s;
		if (fullpath in fileIndex['functions'])
			return true;
		return false;
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

			if (isHyperlinked(word))
				return 'index-link'; // CSS class: cm-url
			if (isFunctionDef(word))
				return 'function-def';
		},
		blankLine: function(state) {
			currentLine++;
		}},	
		{ opaque : true }  // opaque will remove any spelling overlay etc
	);

	let widget1=document.createElement('button');
	widget1.innerHTML='&rarr;';
	widget1.onclick=function(e) { 
		if (!widget1.dataset.token) return;
		if (!widget1.dataset.type) return;

		let s=widget1.dataset.token;
		if (widget1.dataset.type === 'cm-index-link') {
			var link = callsmap[s];
			var source = fileIndex['calls'][link]['source'];
			source = source.split('.'); //Chomp the function name for now
			source.pop();
			source = source.join('.');
			source = source.replace(/\./g, '/');
			window.open(window.location.origin + source + '.py');
			return true;
		} 	
	};
 	hoverWidgetOnOverlay(cm, 'index-link', widget1);

	let widget2=document.createElement('button');
	widget2.innerHTML='*';
	widget2.onclick=function(e) { 
		if (!widget2.dataset.token) return;
		if (!widget2.dataset.type) return;

		$('.call-box').html('').show();
		let s=widget2.dataset.token;
		if (widget2.dataset.type === 'cm-function-def') {
			fullpath = indexFname + '.' + s;
			calls = fileIndex['functions'][fullpath]['calling_functions'];

			for (i in calls) {
				basecall = calls[i];
				call = basecall.split('.');
				call.pop();
				call = call.join('.');
				call = call.replace(/\./g, '/');
				link = window.location.origin + call + '.py'
				$('.call-box').append('<a class="calling-function" href='
					+ link + '>' + basecall + '</a></br></br>');
			}

			$('.bottom-box').animate({height: '50%'});
		}
	};

	
 	hoverWidgetOnOverlay(cm, 'function-def', widget2);
}
