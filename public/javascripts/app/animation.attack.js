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


function toggleBackground(avg) {
	if (hasClassName(container, 'bblack')) {
		//console.log('black:', framerateObj.updateAvgFramerate());
		blackData.push(avg);
		removeClassName(container, 'bblack');
	} else {
		//console.log('white:', framerateObj.updateAvgFramerate());
		whiteData.push(avg);
		addClassName(container, 'bblack');
	}
}


function changebyPattern() {
	var avgFR = framerateObj.updateAvgFramerate();
	if (pattern[pIndex  % pattern.length] === currentColor) {
		if (currentColor === 1) {
			//console.log('black:', framerateObj.updateAvgFramerate());
			blackData.push(avgFR);
		} else {
			//console.log('white:', framerateObj.updateAvgFramerate());
			whiteData.push(avgFR);
		}
	}	else {
		toggleBackground(avgFR);
		currentColor = pattern[pIndex % pattern.length];
	}
	pIndex++;
	if (pIndex === pattern.length + 1) {
		processData();
	} else {
		framerateObj.reset();
		chagneId = setTimeout(changebyPattern, attackTimePerPixel);
	}
}


function readInPattern(){
	var textInput = document.getElementById("inputString");

	// check whether to insert middle white color
	enableMiddlewareWhite = (document.getElementById("inputCheck").checked) ? 1 : 0;
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

		//input time
		var timeString = document.getElementById("inputTime").value;
		if (timeString != "") {
			attackTimePerPixel = parseInt(timeString.match(/\d+$/), 10);
		}
		console.log(attackTimePerPixel);

		//resolution selection
		var x=document.getElementById("inputSelect").selectedIndex;
		var y=document.getElementById("inputSelect").options;
		if (y[x].value === "2880") {
			document.getElementById("container").style.width = "2880px";
			document.getElementById("container").style.height = "1800px";
			document.getElementById("shape").style.width = "800px";
			document.getElementById("shape").style.height = "800px";
			var elems = document.getElementsByClassName("plane");
			for(var i = 0; i < elems.length; i++) {
				elems[i].style.width = '800px';
				elems[i].style.height = '800px';
			}
		} else if (y[x].value === "5760") {
			document.getElementById("container").style.width = "5760px";
			document.getElementById("container").style.height = "3600px";
			document.getElementById("shape").style.width = "1600px";
			document.getElementById("shape").style.height = "1600px";
			var elems = document.getElementsByClassName("plane");
			for(var i = 0; i < elems.length; i++) {
				elems[i].style.width = '1600px';
				elems[i].style.height = '1600px';
			}
		} else if (y[x].value === "10000") {
			document.getElementById("container").style.width = "10000px";
			document.getElementById("container").style.height = "7000px";
			document.getElementById("shape").style.width = "3000px";
			document.getElementById("shape").style.height = "3000px";
			var elems = document.getElementsByClassName("plane");
			for(var i = 0; i < elems.length; i++) {
				elems[i].style.width = '3000px';
				elems[i].style.height = '3000px';
			}
		}

		//start
		document.getElementById("inputField").style.display = "none";
		document.getElementById("container").style.display = "";
		framerateObj.start();
		chagneId = setTimeout(changebyPattern, attackTimePerPixel);
	} else {
		alert("Empty Input");
	}
}


function processData() {
	document.getElementById("container").style.display = "none";
	document.getElementById("inputField").style.display = "";
	document.getElementById("attackStart").style.display = "none";
	document.getElementById("graph").style.display = "";
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
			fillColor : "rgba(150,50,120,0.5)",
			strokeColor : "rgba(150,50,120,1)",
			pointColor : "rgba(150,50,120,1)",
			pointStrokeColor : "#fff",
			data : attackData
		}
		]
	}
	var myNewChart2 = new Chart(ctx2).Line(data2);
	//el = document.createElement("li");
	document.getElementById("graph-info").appendChild(
			document.createTextNode(attackString + ".") );
}

window.onload = function () {
	container = document.getElementById("container");
	framerateObj = new Framerate();
}
