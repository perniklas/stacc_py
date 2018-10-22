/**
 * Snakes and Ladders game JavaScript (+jQuery) file. This file handles button clicking, rendering of game board
 * and game logic.
 *
 * @author Per-Niklas Longberg
 */

var tiles,
    squareWidth,
    squareHeight,
    canvas,
    context,
    squareCoordinates = {},
    board = null,
    players = {},
    turnCount = 1,
    funkyTown = false,
    funkyColor1,
    funkyColor2;

// When document is ready, load the stuff!
$(document).ready(function() {
    $('#roll, #board, #reset').hide();

    // Stops the user from pressing the enter key while typing in input field (enter key causes flask to load the
    // ../players html file that doesn't exist).
    $('#numberOfPlayers').keypress(function(event) {
        if (event.which == '13') {
            event.preventDefault();
        }
    });

    // There's no game without the board
    $.getJSON('../getboard', function(boardJSON) {
        board = boardJSON;

        // We need tiles as well
        $.getJSON('../alltiles', function(allTiles) {
            tiles = allTiles;

            // Click handler for the start button - launches the game.
            $('#start').click(function() {
                // Check if the amount of players is valid, put a big red border on the input box if input is invalid.
                let $players = $('#numberOfPlayers');
                if ($players.val() < 1) {
                    $players.addClass('invalid');
                } else {
                    $players.removeClass('invalid');
                    if (board != null) {
                        for (let numOfPlayers = 1; numOfPlayers <= $players.val(); numOfPlayers++) {
                            // Generate the number of players requested by the user from the input form. Gives each
                            // player a random color (which sometimes are very similar unfortunately). Adds each player
                            // to the box of players displayed to the user after creating that player.
                            players[numOfPlayers] = {'player': numOfPlayers, 'color': generateRandomHexColor(),
                                'position': 1};
                            $('#playerDisplay').append('<p><div class="player" style="background-color:' +
                                players[numOfPlayers]['color'] +'"></div>Player ' + numOfPlayers + '</p>');
                        }

                        $('#start, form, #title').slideUp();
                        $('#playerTurn').text('It\'s player ' + turnCount + '\'s turn.');
                        renderPlayersOnCanvas();

                        $('#roll, #board').slideDown(); // Amazing animations!
                    } else {
                        // I'm pretty sure if the board's null then something else broke.
                        alert('Board\'s missing! Oh no!');
                    }
                }
            });

            // Click handler for the dice roll button - calls for an update to the current player's position with the
            // integer fetched from rollTheDice function.
            $('#roll').click(function() {
                updatePlayerPosition(players[turnCount], rollTheDice())
            });

            // Click handler for the reset button - takes the user back to the start page, "resets" the game.
            $('#reset').click(function() {
                $('#board, #roll, #reset').slideUp();
                $('#lastRoll, #playerTurn').text('');
                $('#start, form, #title').slideDown();
            });

            // Easter egg click handler - swaps the boring monotone safe colors of the board out with some funky 1970s
            // good vibes
            $('#board').dblclick(function() {
                funkyTown = true;
                funkyColor1 = generateRandomHexColor();
                funkyColor2 = generateRandomHexColor();
                renderPlayersOnCanvas(players);
            });
        });
    });
});

/**
 * Renders a given Snakes 'n Ladders board from a JSON file fetched from a certain API.
 *
 * @param board
 * The JSON with the specifics of a board.
 *
 * @param tileColorOdd
 * Optional color of odd tiles
 *
 * @param tileColorEven
 * Optional color of even tiles
 */
function renderBoardInCanvas(board, tileColorOdd, tileColorEven) {
    tileColorOdd = tileColorOdd || '#9ddcdc';
    tileColorEven = tileColorEven || '#f0f0f0';
    // Get some size onto that canvas
    $('#board').css({'width': board.dimX * 100, 'height' : board.dimY * 100, 'margin': '30px auto', 'display': 'block'}
    ).prop({'width': board.dimX * 150, 'height' : board.dimY * 150});

    canvas = document.getElementById('board');
    context = canvas.getContext('2d');
    squareWidth = canvas.width / board.dimX;
    squareHeight = canvas.height / board.dimY;

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

            // Set up the filling of  every other tile a color, check if tile is either goal or
            // start and color them as such.
            context.fillStyle = (tileNumber % 2 ? tileColorOdd : tileColorEven);
            if (tileNumber === board.goal) {
                context.fillStyle = '#78df78';
            } else if (tileNumber === board.start) {
                context.fillStyle = '#efcce6'
            }

            // The actual filling of rectangles, logs the canvas coordinates for each tile.
            context.fillRect(x, y, squareWidth, squareHeight);
            squareCoordinates[tileNumber] = {x, y};
            context.font = '28px Roboto';
            context.fillStyle = 'black';
            context.fillText(tileNumber.toString(), x + (squareWidth / 2.5), y + (squareHeight / 4));

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
 * Computer representation of a 6-sided die.
 *
 * @returns {int}
 * A number between 1 and 6, indicating the number of tiles a player gets to move.
 */
function rollTheDice() {
    return Math.floor(Math.random() * Math.floor(6)) + 1;
}

/**
 * Updates a given players position on the board using the passed position parameter. The passed parameter is added to
 * the given players tile position. If this new position exceeds the number of tiles on a given board, the number of
 * overflowing tiles are instead retracted from the last board tile (so that the player moves backwards).
 *
 * @param player
 * The player to be moved, from the players object.
 *
 * @param positionIncrease
 * An integer representing a tile on the board, generated from rollTheDice() function
 */
function updatePlayerPosition(player, positionIncrease) {
    if (player['position'] + positionIncrease > board.dimX * board.dimY) {
        let remains = player['position'] + positionIncrease - board.dimX * board.dimY;
        player['position'] = board.dimX * board.dimY - remains;
    } else {
        player['position'] += positionIncrease;
    }

    let wormholeText = '';
    if (tiles[player['position']].hasOwnProperty('wormhole')) {
        let warpToTile = tiles[player['position']]['wormhole'];
        wormholeText = ', a wormhole took them from ' + player['position'] + ' to ' + warpToTile;
        player['position'] = warpToTile;
    }

    renderPlayersOnCanvas();
    $('#lastRoll').text('Player ' + turnCount + ' rolled a ' + positionIncrease + wormholeText);

    turnCount++;
    if (turnCount > Object.keys(players).length) {
        turnCount = 1;
    }

    // If a player lands on the goal tile, they win! Call the announce winner function with the player that stepped on
    // this tile.
    if (player['position'] === board.goal) {
        announceWinner(player);
    } else {
        $('#playerTurn').text('It\'s player ' + turnCount + '\'s turn.');
    }
}

/**
 * Renders the entire board first so that old positions are wiped from the canvas, then loops through the list of
 * active players to add them according to their position property. Random offset is introduced to their canvas
 * coordinates so that pieces don't overlap. This causes some bobbing every time a player moves.
 */
function renderPlayersOnCanvas() {
    if (funkyTown) {
        renderBoardInCanvas(board, funkyColor1, funkyColor2);
    } else {
        renderBoardInCanvas(board);
    }
    for(let player in players) {
        let random_offset = Math.floor(Math.random() * Math.floor(25)),
            playerPosition = players[player]['position'],
            xCoordinates = squareCoordinates[playerPosition]['x'],
            yCoordinates = squareCoordinates[playerPosition]['y'];
        context.fillStyle = players[player]['color'];
        context.fillRect(xCoordinates + (squareWidth / 4) + random_offset, yCoordinates + (squareHeight / 4) +
            random_offset, squareWidth / 2, squareHeight / 2);
    }
}

/**
 * Announces the winner in style (albeit a horrible style, but a style nonetheless). Hides the roll dice button, shows
 * the reset button to go back to the "main screen".
 *
 * @param player
 * The player that won!
 */
function announceWinner(player) {
    $('#playerTurn').text('');
    $('#roll').slideUp();
    $('#reset').slideDown();
    alert('PLAYER ' + player.player.toString() + ' HAS WON! Good on them!');
}

/**
 * Creates a random Hex color
 *
 * @returns {string}
 * A color string representing hex color.
 */
function generateRandomHexColor() {
    let color = '#' + Math.floor(Math.random()*16777215).toString(16);
    while (color.length < 7) {
        color = '#' + Math.floor(Math.random()*16777215).toString(16);
    }
    return color;
}