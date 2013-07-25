//
// A lightweight framerate counter for
// attacks 2 and 3
//
Framerate = function(id)
{
    this.framerateUpdateInterval = 500;

    this.totalFrames = 0; // The parameters needed for avg fr.
    this.totalTime = 0;
    this.startTime = new Date().getTime();
    this.averageFramerate = 0;

    self = this;
    var fr = function() { self.updateFramerate() }
    setInterval(fr, this.framerateUpdateInterval);
}

Framerate.prototype.updateFramerate = function()
{

    // Update it internally
    if(this.totalTime)
      this.averageFramerate = this.totalFrames/this.totalTime*1000;
	console.log(this.averageFramerate);

    // update the HTML
    $(".framerate").html("Framerate --> " + this.averageFramerate);
    document.title=this.averageFramerate;
}

Framerate.prototype.reset = function() {
  this.startTime = new Date().getTime();
  this.totalFrames = 0;
  this.totalTime = 0;
  this.averageFramerate = 0;
}

Framerate.prototype.snapshot = function()
{
    var newTime = new Date().getTime();
    this.totalFrames += 1;
    this.totalTime = newTime - this.startTime;
}


var x,y,n=0,ny=0,rotINT,rotXINT;
var c = document.getElementById("rotate");
framerateObj = new Framerate();

amount = 0; // old variables, from attack 2

var f = function() {
	framerateObj.snapshot();
	requestId = window.requestAnimationFrame(f, c);
};
f();
rotateXDIV();
function rotateXDIV()
{
	y=document.getElementById("rotate")
		clearInterval(rotXINT)
		rotXINT=setInterval("startXRotate()",1)
}
function startRotate()
{
	n=n+1
		x.style.transform="rotate(" + n + "deg)"
		x.style.webkitTransform="rotate(" + n + "deg)"
		x.style.OTransform="rotate(" + n + "deg)"
		x.style.MozTransform="rotate(" + n + "deg)"
		if (n==180 || n==360)
		{
			clearInterval(rotINT)
				if (n==360){n=0}
		}
}
function startXRotate()
{
	ny=ny+10
		y.style.transform="rotateX(" + ny + "deg)"
		y.style.webkitTransform="rotateX(" + ny + "deg)"
		y.style.OTransform="rotateX(" + ny + "deg)"
		y.style.MozTransform="rotateX(" + ny + "deg)"
}

