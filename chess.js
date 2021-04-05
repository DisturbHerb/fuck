var tileSize = 60;
var files = 8, ranks = 8;
var notationOffset = 10;
var notationColor;
var white = "#f0ce99", black = "#8a613f";
var whiteSide = "W", blackSide = "B";
var notationTextStyle = "10px", weirdnessMultiplier = "5" // for whatever reason, some offsets have to be divided by this so it looks less weird. dunno why.

var pieceList = Array.apply(null, Array(files*ranks)); // sets array of length 64 with all values set to null

drawPiece = function(position, pieceType, pieceColor) { // file and rank start at zero, small-brain.
	var file = position % ranks, rank = Math.floor(position/ranks);
	var pieceImage = pieceType + pieceColor +  ".svg";
	// this next part's gonna be a long one.
	var pieceImageString = "<image src=\'assets/" + pieceImage + "\' draggable=\'true\' ondragstart=\'getMousePos()\' class=\'piece\' id="+ position +" style='width: " + tileSize + "px; height: " + tileSize + "px; transform: translate(" + (file * tileSize) + "px," + (rank * tileSize) + "px);'>";
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
	clearPieces();
	var positionalFEN = document.getElementById("fenInput").value;
	var selectedFile = 0, selectedRank = 0, selectedPieceType = 0, selectedPieceColor = 0;
	pieceList = Array.apply(null, Array(files*ranks));
	if(positionalFEN == ""){
		positionalFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
	}
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
}

// MORE DEBUG AND TESTING SHIT
// get mouse position with event listeners
function getMousePos(event) {
	event = event || window.event;
	var boardX = (event.pageX - $('#chessboard').offset().left);
	var boardY = (event.pageY - $('#chessboard').offset().top);
	if(boardX < 0 || boardX > (files*tileSize)|| boardY < 0 || boardY > (ranks*tileSize)){
		return;
	}
	var clickedFile = Math.floor(boardX/tileSize);
	var clickedRank = Math.floor(boardY/tileSize);
	var clickedSpace = ((clickedRank * files) + clickedFile);
	console.log(clickedSpace);
}

// event listeners that trigger when an piece is dragged and when a piece is dropped. or, at least, they're meant to!
document.addEventListener("ondragstart", getMousePos);
document.addEventListener("ondrop", getMousePos);