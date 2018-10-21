/**
 * Snakes and Ladders game JavaScript (+jQuery) file. This file handles button clicking, rendering of game board
 * and game logic.
 *
 * @author Per-Niklas Longberg
 */

let tiles,
    squareWidth,
    squareHeight,
    globalContext,
    squareCoordinates = {};

// When document is ready, fetch the board info.
$(document).ready(function() {
    let board = null,
        $board = $('#board'),
        players = {};

    $board.hide();

    // This methods calls on the ../getboard subdirectory of the HTML which in turn executes the python code that
    // can get JSON from the API without running into CORB issues.
    $.getJSON('../getboard', function(boardJSON) {
        board = boardJSON;
    });

    $.getJSON('../alltiles', function(allTiles) {
        tiles = allTiles;
    });

    // Start the game.
    $('#start').click(function() {
        if ($('#players').val() < 1) {
            $('#players').addClass('invalid');
        } else {
            $('#players').removeClass('invalid');
            if (board != null) {
                for (let numOfPlayers = 1; numOfPlayers <= $('#players').val(); numOfPlayers++) {
                    // Generate players based on the number input from user
                    players[numOfPlayers] = {player: numOfPlayers, color: '#' + Math.floor(Math.random()*16777215).toString(16), 'position': 1};
                    console.log(players[numOfPlayers]);
                }
                $('#start, form, #title').slideUp();
                renderBoardInCanvas(board);

                for (player in players) {
                    renderPlayerOnCanvas(players[player], squareCoordinates[players['position']]);
                }
                $board.slideDown(); // Amazing animations!

            } else {
                alert('Board\'s missing! Oh no!');
            }
        }
    });

});

/**
 * Renders a given Snakes 'n Ladders board from a JSON file fetched from a certain API.
 *
 * @param board
 * The JSON with the specifics of a board.
 */
function renderBoardInCanvas(board) {
    let canvas = document.getElementById("board"),
        context = canvas.getContext('2d'),
        canvasSquarePositions = {};

    squareWidth = canvas.width / board.dimX;
    squareHeight = canvas.height / board.dimY;
    globalContext = context;

    // Get some size onto that canvas
    $('#board').css({'width': board.dimX * 100, 'height' : board.dimY * 100}).prop({'width': board.dimX * 150,
        'height' : board.dimY * 150});

    let x = 0,
        y = canvas.height - squareHeight,
        tileNumber = 1,
        leftToRight = true;

    // For each row, for each column, add the same amount of tiles to the board as specified in the JSON.
    for (let row = 0; row < board.dimX; row++) {

        // x (the starting position of the tiles horizontal value) will either be assigned to 0 or to the end of the
        // row, depending on whether the tiling goes left-to-right or right-to-left.
        x = (leftToRight ? 0 : canvas.width - squareWidth);

        for (let column = 0; column <= board.dimY; column++) {

            // Set up the filling of  every other tile light blue or light yellow, check if tile is either goal or
            // start and color them as such.
            context.fillStyle = (tileNumber % 2 ? '#ffffdd' : '#ddffff');
            if (tileNumber === board.goal) {
                context.fillStyle = '#aaffaa';
            } else if (tileNumber === board.start) {
                context.fillStyle = '#fae3dc'
            }

            // The actual filling.
            context.fillRect(x, y, squareWidth, squareHeight);
            squareCoordinates[tileNumber] = {x, y};
            context.font = '28px Roboto';
            context.fillStyle = 'black';
            context.fillText(tileNumber.toString(), x + (squareWidth / 2.5), y + (squareHeight / 4));

            // logging of tiles.
            canvasSquarePositions[tileNumber] = {'id': tileNumber, 'x': x, 'y': y};

            // Checks whether or not the tile has a wormhole. If it does, calls the rendering of a wormhole on that
            // square
            if (tileNumber <= board.dimX * board.dimY) {
                if (tiles[tileNumber].hasOwnProperty('wormhole')) {
                    if (tiles[tileNumber]['wormhole'] > tiles[tileNumber]['number']) {
                        renderWormhole('good', x, y);
                    } else {
                        renderWormhole('bad', x, y);
                    }
                }
            }

            // Either add or retract the last added square's horizontal value.
            x = (leftToRight ? x += squareWidth : x -= squareWidth);
            tileNumber++;
        }

        y -= squareHeight;
        leftToRight = !leftToRight;
    }

    /**
     * Renders the wormhole images in their respective squares
     *
     * @param natureOfHole
     * Whether the wormhole ascends or descends on the board. 'good' means ascends, 'bad' means descend.
     *
     * @param xPosition
     * The horizontal position of the wormhole image on the canvas
     *
     * @param yPosition
     * The vertical position of the wormhole image on the canvas
     */
    function renderWormhole(natureOfHole, xPosition, yPosition) {
        let img = new Image();
        img.onload = function() {
            context.drawImage(img, xPosition + 30, yPosition + 45, 90, 90);
        };

        if (natureOfHole === 'bad') {
            img.src = '../static/img/badworm.png';
        } else if (natureOfHole === 'good') {
            img.src = '../static/img/goodworm.png';
        } else {
            console.log('Nature not given correctly');
        }
    }
}

/**
 * Updates the players position property.
 *
 * @param player
 * @param position
 */
function updatePlayerPosition(player, position) {
    player[position] = position;
    if (position === board.goal) {
        announceWinner(player);
    }
}

function renderPlayerOnCanvas(player, xPosition, yPosition) {
    globalContext.fillStyle = player.color;
    globalContext.fillRect(xPosition + (squareWidth / 4), yPosition + (squareHeight / 4), squareWidth / 2, squareHeight / 2);
}

function announceWinner(player) {
    canvas.clearRect(0, 0, canvas.width, canvas.height);
    alert('PLAYER ' + player.player.toString() + ' HAS WON! Good on them!');
}