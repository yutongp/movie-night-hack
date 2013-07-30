/**
 * @author Yutong Pei http://yutong.me
 */
var Framerate = function() {
	//check bowser type
	//// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
	//var isOpera = !!window.opera || navigator.userAgent.indexOf('Opera') >= 0;
	//var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
	
	//// At least Safari 3+: "[object HTMLElementConstructor]"
	var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf(
			'Constructor') > 0;

	//var isChrome = !!window.chrome; // Chrome 1+
	//var isIE = /*@cc_on!@*/false; // At least IE6

	//var timer = Date;
	var timer = (isSafari) ? Date : performance;
	var requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame;
	var cancelAnimationFrame = window.cancelAnimationFrame ||
		window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
		window.msCancelAnimationFrame;
	var totalFrames = 0;
	var totalTime = 0;
	var averageFramerate = 0;
	var requireId;
	var startTime = timer.now();

	var updateAvgFramerate = function() {
		// Update it internally
		var newTime = timer.now();
		totalTime = newTime - startTime;
		averageFramerate = totalFrames / totalTime * 1000;
		// update the HTML
		return averageFramerate;
	}

	var snapshot = function() {
		totalFrames += 1;
	}

	var stepFunc = function() {
		snapshot();
		requestId = requestAnimationFrame(stepFunc);
	}

	return {
		updateAvgFramerate: updateAvgFramerate,
		start: function() {
			startTime = timer.now();
			requestId = requestAnimationFrame(stepFunc);
		},
		reset: function() {
			//cancel old
			cancelAnimationFrame(requestId);
			totalFrames = 0;
			totalTime = 0;
			averageFramerate = 0;
			startTime = timer.now();
			requestId = requestAnimationFrame(stepFunc);
		}
	};
}
