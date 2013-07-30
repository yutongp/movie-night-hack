//Helper functions
function hasClassName(inElement, inClassName)
{
	var regExp = new RegExp('(?:^|\\s+)' + inClassName + '(?:\\s+|$)');
	return regExp.test(inElement.className);
}

function addClassName(inElement, inClassName)
{
	if (!hasClassName(inElement, inClassName))
		inElement.className = [inElement.className, inClassName].join(' ');
}

function removeClassName(inElement, inClassName)
{
	if (hasClassName(inElement, inClassName)) {
		var regExp = new RegExp('(?:^|\\s+)' + inClassName + '(?:\\s+|$)', 'g');
		var curClasses = inElement.className;
		inElement.className = curClasses.replace(regExp, ' ');
	}
}

function toggleClassName(inElement, inClassName)
{
	if (hasClassName(inElement, inClassName))
		removeClassName(inElement, inClassName);
	else
		addClassName(inElement, inClassName);
}

/**
 * @author Yutong Pei http://yutong.me
 */
// Attack Start
//
var pattern = new Array();
var whiteData = new Array();
var blackData = new Array();
var attackData = new Array();
var labels = new Array();
var pIndex = 0;
var currentColor = 0;
var container, framerateObj, chagneId, attackString;
var enableMiddlewareWhite = 0;
var attackTimePerPixel = 5000;


function toggleBackground() {
	if (hasClassName(container, 'bblack')) {
		//console.log('black:', framerateObj.updateAvgFramerate());
		blackData.push(framerateObj.updateAvgFramerate());
		removeClassName(container, 'bblack');
	} else {
		//console.log('white:', framerateObj.updateAvgFramerate());
		whiteData.push(framerateObj.updateAvgFramerate());
		addClassName(container, 'bblack');
	}
}


function changebyPattern() {
	if (pattern[pIndex  % pattern.length] === currentColor) {
		if (currentColor === 1) {
			//console.log('black:', framerateObj.updateAvgFramerate());
			blackData.push(framerateObj.updateAvgFramerate());
		} else {
			//console.log('white:', framerateObj.updateAvgFramerate());
			whiteData.push(framerateObj.updateAvgFramerate());
		}
	}	else {
		toggleBackground();
		currentColor = pattern[pIndex % pattern.length];
	}
	pIndex++;
	if (pIndex === pattern.length + 1) {
		processData();
	} else {
		chagneId = setTimeout(changebyPattern, attackTimePerPixel);
		framerateObj.reset();
	}
}


function readInPattern(){
	var textInput = document.getElementById("inputString");
	if (document.getElementById("inputCheck").checked) {
		enableMiddlewareWhite = 1;
	}
	attackString = textInput.value;
	var labelIndex = 0;
	if (attackString.length > 0) {
		for (var i = 0; i < attackString.length; i++) {
			//push test bar white before every attack color
			if(enableMiddlewareWhite) {
				pattern.push(0);
				labels.push(labelIndex++);
			}
			if (attackString[i] === '0') {
				pattern.push(0);
				labels.push(labelIndex++);
			} else if (attackString[i] === '1') {
				pattern.push(1);
				labels.push(labelIndex++);
			}
		}
		document.getElementById("inField").innerHTML = "";
		framerateObj.start();
		chagneId = setTimeout(changebyPattern, attackTimePerPixel);
	} else {
		alert("Empty Input");
	}
}


function processData() {
	document.getElementById("out-container").innerHTML = "";
	var whiteIndex = 0;
	var blackIndex = 0;

	// pop out the first one before the pattern
	whiteData.shift();
	// get pure attack pattern Data
	for (var i = 0; i < pattern.length; i++) {
		if (enableMiddlewareWhite) {
			i++;
		}
		if (pattern[i] === 0) {
			if (enableMiddlewareWhite) {
				whiteIndex++;
			}
			attackData.push(whiteData[whiteIndex++]);
		} else {
			attackData.push(blackData[blackIndex++]);
		}
	}

	console.log('pattern:', pattern);
	console.log('white:', whiteData);
	console.log('black:', blackData);
	console.log('attack:', attackData);

	var ctx = document.getElementById("black-white-graph").getContext("2d");
	var data = {
		labels : labels.slice(0, (whiteData.length > blackData.length)
						 ? whiteData.length
						 : blackData.length),
		datasets : [
		{
			fillColor : "rgba(220,220,220,0.5)",
			strokeColor : "rgba(220,220,220,1)",
			pointColor : "rgba(220,220,220,1)",
			pointStrokeColor : "#fff",
			data : blackData
		},

		{
			fillColor : "rgba(151,187,205,0.5)",
			strokeColor : "rgba(151,187,205,1)",
			pointColor : "rgba(151,187,205,1)",
			pointStrokeColor : "#fff",
			data : whiteData
		}
		]
	}
	var myNewChart = new Chart(ctx).Line(data);

	var ctx2 = document.getElementById("attack-graph").getContext("2d");
	var data2 = {
		labels : labels.slice(0, attackData.length),
		datasets : [
		{
			fillColor : "rgba(220,220,220,0.5)",
			strokeColor : "rgba(220,220,220,1)",
			pointColor : "rgba(220,220,220,1)",
			pointStrokeColor : "#fff",
			data : attackData
		}
		]
	}
	var myNewChart2 = new Chart(ctx2).Line(data2);
	//el = document.createElement("li");
	document.getElementById("graph").appendChild(
			document.createTextNode("attackString: " + attackString) );
}

window.onload = function () {
	container = document.getElementById("container");
	framerateObj = new Framerate();
}
