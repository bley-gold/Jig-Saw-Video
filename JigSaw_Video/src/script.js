var pieces = [];
var nums;
var baseImgW;
var baseImgH;
var origW;
var origH;
var opieceW;
var opieceH;
var pieceW;
var pieceH;
var numOfRows = 2.0;
var numOfCols = 3.0;
var piecesx = [];
var piecesy = [];
var v;
var base;
var doingjigsaw = false;
var firstpkel;  // assumption that first piece in array is upper left corner.
var questionfel;
var d = document;
var mouseDown = false;
var movingobj;

function init() {
    v = document.getElementById("bars");
    base = document.getElementById("base");
    makePieces();
    nums = pieces.length;
    questionfel = document.getElementById("questionform");
    questionfel.style.left = "20px";
    questionfel.style.top = "600px";
    questionfel.submitbut.value = "Do jigsaw again.";
    setupGame();
}

function makePieces() {
    var i, x, y, s, sCTX;
    origW = base.width;
    origH = base.height;
    var ratio = Math.min(1.0, .80 * window.innerWidth / origW, .80 * window.innerHeight / origH);
    baseImgW = origW * ratio;
    baseImgH = origH * ratio;
    v.width = baseImgW;
    v.height = baseImgH;
    opieceW = origW / numOfCols;
    opieceH = origH / numOfRows;
    pieceW = ratio * opieceW;
    pieceH = ratio * opieceH;
    for (i = 0.0; i < numOfRows; i++) {
        for (j = 0.0; j < numOfCols; j++) {
            s = document.createElement('canvas');
            s.width = pieceW;
            s.height = pieceH;
            s.style.position = 'absolute';
            sCTX = s.getContext('2d');
            sCTX.drawImage(base, j * opieceW, i * opieceH, opieceW, opieceH, 0, 0, pieceW, pieceH);
            document.body.appendChild(s);
            pieces.push(s);
            x = j * pieceW + 100;
            y = i * pieceH + 100;
            s.style.top = String(y) + "px";
            s.style.left = String(x) + "px";
            piecesx.push(x);
            piecesy.push(y);
            s.addEventListener('mousedown', startdragging, false);
            s.addEventListener("touchstart", touchHandler, true);
            s.addEventListener("touchmove", touchHandler, true);
            s.addEventListener("touchend", touchHandler, true);
            s.addEventListener("touchcancel", touchHandler, true);
            s.style.visibility = 'visible';
        }
    }
    firstpkel = pieces[0];
    document.body.onmouseup = release;
}

function endjigsaw() {
    if (doingjigsaw) {
        doingjigsaw = false;
        d.onmousedown = "";
        d.onmousemove = "";
        d.onmouseup = "";
        v.pause();
        v.style.display = "none";
    }
    setupGame();
    return false;
}

function checkpositions() {
    var i, x, y, tolerance = 10, deltax = [], deltay = [], delx, dely;
    for (i = 0; i < nums; i++) {
        x = pieces[i].style.left;
        y = pieces[i].style.top;
        x = x.substr(0, x.length - 2);
        y = y.substr(0, y.length - 2);
        x = Number(x);
        y = Number(y);
        delx = x - piecesx[i];
        dely = y - piecesy[i];
        deltax.push(delx);
        deltay.push(dely);
    }
    var averagex = doaverage(deltax);
    var averagey = doaverage(deltay);
    for (i = 0; i < nums; i++) {
        if ((Math.abs(averagex - deltax[i]) > tolerance) || (Math.abs(averagey - deltay[i]) > tolerance)) {
            break;
        }
    }
    if (i < nums) {
        questionfel.feedback.value = "Keep working.";
    } else {
        questionfel.feedback.value = "GOOD!";
        for (i = 0; i < nums; i++) {
            pieces[i].style.display = "none";
        }
        v.style.left = firstpkel.style.left;
        v.style.top = firstpkel.style.top;
        v.style.display = "block";
        v.currentTime = 0;
        v.play();
    }
}

function doaverage(arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return (sum / arr.length);
}

function setupGame() {
    v.pause();
    v.style.display = "none";
    doingjigsaw = true;
    for (var i = 0; i < nums; i++) {
        var x = 10 + Math.floor(Math.random() * baseImgW * .9);
        var y = 50 + Math.floor(Math.random() * baseImgH * .9);
        var thingelem = pieces[i];
        thingelem.style.top = String(y) + "px";
        thingelem.style.left = String(x) + "px";
        thingelem.style.visibility = 'visible';
        thingelem.style.display = "inline";
    }
    questionfel.feedback.value = "  ";
}

function touchHandler(event) {
    var touches = event.changedTouches;
    if (touches.length > 1) {
        return false;
    }
    var first = touches[0];
    var type = "";
    switch (event.type) {
        case "touchstart": type = "mousedown"; break;
        case "touchmove": type = "mousemove"; break;
        case "touchend": type = "mouseup"; break;
        default: return;
    }
    var simulatedEvent = new MouseEvent(type, {
        screenX: first.screenX,
        screenY: first.screenY,
        clientX: first.clientX,
        clientY: first.clientY
    });
    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function release(e) {
    mouseDown = false;
    movingobj.removeEventListener("mousemove", moving, false);
    movingobj.removeEventListener("mouseup", release, false);
    movingobj = null;
    checkpositions();
}

function startdragging(e) {
    movingobj = e.target;
    mouseDown = true;
    oldx = parseInt(e.pageX);
    oldy = parseInt(e.pageY);
    movingobj.addEventListener("mousemove", moving, false);
    movingobj.addEventListener("mouseup", release, false);
}

function moving(ev) {
    if ((movingobj != null) && (mouseDown)) {
        var newx = parseInt(ev.pageX);
        var newy = parseInt(ev.pageY);
        var delx = newx - oldx;
        var dely = newy - oldy;
        oldx = newx;
        oldy = newy;
        var curx = parseInt(movingobj.style.left);
        var cury = parseInt(movingobj.style.top);
        movingobj.style.left = String(curx + delx) + "px";
        movingobj.style.top = String(cury + dely) + "px";
    }
}
