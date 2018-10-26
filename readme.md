# Stacc assignment
This is my solution to an assignment given by Stacc 19.10.2018. Two of the proposed subtasks were completed.


## Visualization of Snakes and Ladders board game
Calling an API provides a JSON file containing the game board and subsequently its tiles (depending on board size). Due to CORS/CORB limitations in JavaScript/jQuery Python with Flask was used as an alternative as Flask provides a connection between Python and HTML/JS. The data is fetched from the API, served as a subpage in Flask which is then queried by jQuery and used to render the board in Canvas.


## Let X amount of players play the game
JavaScript handles just about any amount of players (load times on over 50 000 players are immense) and serves them all a randomized color. Unfortunately these colors can be very similar. The players are stored in the player object that saves each position, a function then draws them on the canvas whenever the board is rendered (which is when the board is loaded and a player moves). Thanks to the API fetching done in Python each tile is saved in the _tiles_ object, and if that tile is either the goal or contains a wormhole (ladder/snake) the player position is updated accordingly. This is kind of confusing when playing due to the lack of animations which was the next step in the development, but time constraints kept me from getting there.


### Running the app:
l. Make sure Python 3.x is installed
l. Open a terminal in the root of the project
l. Enter _pip install -r requirements.txt_
l. Enter _python app.py_
l. Open your favorite browser (Chrome is extremely recommended)
l. Enter 127.0.0.1:5000
l. Have fun? (It is of utmost importance that you double click the board at least once).
