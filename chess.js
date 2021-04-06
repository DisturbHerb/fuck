var tileSize = 60;
var files = 8, ranks = 8;
var notationOffset = 10;
var notationColor;
var white = "#f0ce99", black = "#8a613f";
var whiteSide = "W", blackSide = "B";
var notationTextStyle = "10px", weirdnessMultiplier = "5" // for whatever reason, some offsets have to be divided by this so it looks less weird. dunno why.

var pieceList = Array.apply(null, Array(files*ranks)); // sets array of length 64 with all values set to null
var fromSpace = null, toSpace = null;
var selectionColor = "rgba(34, 139, 34, 0.3)", lastMoveColor = "rgba(255, 255, 0, 0.3)";
var moveMade = 0;

drawPiece = function(position, pieceType, pieceColor) { // file and rank start at zero, small-brain.
	var file = position % ranks, rank = Math.floor(position/ranks);
	var pieceImage = pieceType + pieceColor +  ".svg";
	// this next part's gonna be a long one.
	var pieceImageString = "<image src=\'assets/" + pieceImage + "\' class=\'piece\' id="+ position +" style='width: " + tileSize + "px; height: " + tileSize + "px; transform: translate(" + (file * tileSize) + "px," + (rank * tileSize) + "px);'>";
	$("#chesspieces").append(pieceImageString);
}

drawBoard = function() {
	var canvas = document.getElementById('chessboard');
	var ctx = canvas.getContext('2d');
	for(var rank = 0; rank < ranks; ++rank) { // for each rank on the board
		for(var file = 0; file < files; ++file)	{ // for each file in the rank
			ctx.fillStyle = ((file + rank) % 2 == 0) ? white:black;
			ctx.fillRect((tileSize*file), (tileSize*rank), tileSize, tileSize);
			if((rank)== ranks - 1){
				var coordinateString = (String.fromCharCode((file) + 65));
				notationColor = ((file) % 2 == 0)? white:black
				ctx.fillStyle = notationColor;
				ctx.font = notationTextStyle;
				ctx.fillText(coordinateString.toLowerCase(), ((file * tileSize) + tileSize - notationOffset), ((ranks * tileSize) - (notationOffset/weirdnessMultiplier))); // draws algebraic values for files
			}
		}
		notationColor = ((rank + 1) % 2 == 0)? white:black
		ctx.fillStyle = notationColor;
		ctx.font = notationTextStyle;
		ctx.fillText(String(ranks - rank), (notationOffset/weirdnessMultiplier), ((rank * tileSize) + notationOffset)); // places algebraic values for ranks
	}
}

clearPieces = function(){document.getElementById("chesspieces").innerHTML = "";}

// This function is primarily for debugging and testing rendering capabilities, FEN will not be used as the representation of game pieces on the board.
loadFEN = function() { // FUCK YEAAAH YOU CAN IMPORT FEN STRINGS NOW!
	var positionalFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
	var selectedFile = 0, selectedRank = 0, selectedPieceType = 0, selectedPieceColor = 0;
	pieceList = Array.apply(null, Array(files*ranks));
	/* var positionalFEN = document.getElementById("fenInput").value;
	 if(positionalFEN == ""){
		positionalFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
	} */
	var fenBoard = positionalFEN.split("");
	for(var i = 0; i < fenBoard.length; i++){
		if(fenBoard[i] == "/"){ // go to next rank at end of file
			selectedFile = 0;
			selectedRank++;
		} else if(Number.isInteger(parseInt(fenBoard[i]))){ // skip the number of spaces allotted by an integer in the FEN string
			selectedFile += parseInt(fenBoard[i]);
		} else {
			selectedPieceColor = (fenBoard[i] == fenBoard[i].toUpperCase()) ? whiteSide:blackSide; // set piece colour based on 
			selectedPieceType = fenBoard[i].toUpperCase();
			pieceList[((selectedRank * ranks) + selectedFile)] = selectedPieceType + selectedPieceColor;
			selectedFile++;
		}
	}
	initialisePieces();
}

initialisePieces = function() { // function for initialising chess pieces after... every... move.
	clearPieces();
	for(var i = 0; i < pieceList.length; i++){
		if(pieceList[i] != null) {
			var singlePieceArray = pieceList[i].split("");
			drawPiece(i, singlePieceArray[0], singlePieceArray[1]);
		}
	}
}

window.onload = function(){
	drawBoard();
	loadFEN();
	// event listeners for clicking
	document.addEventListener("click", processMovement);
}

// MORE DEBUG AND TESTING SHIT
// oh god oh fuck CLEAN UP YOUR MESS
function processMovement(event){ // fired on-click
	var selectedSpace = getClickedPos(event);
	if(!Number.isInteger(selectedSpace)){ // if clicked space isn't valid
		return;
	}
	if(!Number.isInteger(fromSpace)){ // if no fromSpace has been selected prior, set clicked square to fromSpace
		fromSpace = selectedSpace;
		if(!pieceList[fromSpace]){ // if clicked space is empty, return and set fromSpace to null
			fromSpace = null;
			return;
		}
		drawSingleSquare(parseInt(fromSpace), "selectionSquares", selectionColor); // draw selection square at fromSpace position
		return;
	} else if(!Number.isInteger(toSpace)){ // if no toSpace has been selected, which, hm...
		toSpace = selectedSpace;
		clearCanvas("selectionSquares"); // clear selectionSquares canvas
		if(toSpace == fromSpace){ // if toSpace and fromSpace are the same, revert everything
			fromSpace = null, toSpace = null;
			return;
		}
		pieceList[toSpace] = pieceList[fromSpace]; // change the piece positions in the array
		pieceList[fromSpace] = null;
		handleLastMoveSquare(fromSpace, toSpace); // draw highlights for last move made
		initialisePieces(); // redraw pieces on the board
		fromSpace = null, toSpace = null; // reset variables, time to start this again
	}
}

function handleLastMoveSquare(lastFrom, lastTo){
	clearCanvas("lastMoveSquares")
	drawSingleSquare(lastFrom, "lastMoveSquares", lastMoveColor);
	drawSingleSquare(lastTo, "lastMoveSquares", lastMoveColor);
}

function drawSingleSquare(squarePosition, selectedCanvas, selectedColor){
	var drawSquareFile = squarePosition % ranks, drawSquareRank = Math.floor(squarePosition/ranks);
	var selectionCanvas = document.getElementById(selectedCanvas);
	var selectionctx = selectionCanvas.getContext('2d');
	selectionctx.fillStyle = selectedColor;
	selectionctx.fillRect((tileSize*drawSquareFile), (tileSize*drawSquareRank), tileSize, tileSize);
}

function clearCanvas(clrCanvas){
	var clearCanvas = document.getElementById(clrCanvas);
	var clearctx = clearCanvas.getContext('2d');
	clearctx.clearRect(0, 0, clearCanvas.width, clearCanvas.height);
}

// get mouse position with event listeners
function getClickedPos(event) {
	event = event || window.event;
	var boardX = (event.pageX - $('#chessboard').offset().left);
	var boardY = (event.pageY - $('#chessboard').offset().top);
	if(boardX < 0 || boardX > (files*tileSize)|| boardY < 0 || boardY > (ranks*tileSize)){
		return;
	}
	var clickedFile = Math.floor(boardX/tileSize);
	var clickedRank = Math.floor(boardY/tileSize);
	var clickedSpace = ((clickedRank * files) + clickedFile);
	return clickedSpace;
}

// for my mental health i'm going to avoid these goddamn click-drag things FUCK

// event listeners that trigger when an piece is dragged and when a piece is dropped. or, at least, they're meant to!
/* document.addEventListener("ondragstart", getMousePos);
document.addEventListener("ondragover", (event) => {event.preventDefault();});
document.addEventListener("ondrop", getMousePos); */