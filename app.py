from flask import Flask, render_template
import requests
import json

"""
Web app for Snakes and Ladders game using Flask as a workaround to JavaScript shortcomings (namely CORB issues when 
trying to fetch data from API.)

Per-Niklas Longberg
"""

app = Flask(__name__)
board_url = 'https://visningsrom.stacc.com/dd_server_worms/rest/boards/2'
board = requests.get(board_url)
tiles = {}
json_data = json.loads(board.text)

# Populates a list with all available tiles in a board when loading in.
for x in range(json_data['dimX'] * json_data['dimY']):
    x += 1
    tiles[x] = (json.loads(requests.get('%s/%i' % (board_url, x)).text))


@app.route('/')
def start():
    """
    Initialize the web framework, load into default index HTML file.
    """
    return render_template('index.html')


@app.route('/getboard', methods=['GET'])
def deliver_unto_html_the_board_as_json():
    """
    Fetches the board from the API and puts it in a JSON accessible from ../getboard so that the JavaScript can access
    it.
    """
    return board.text


@app.route('/alltiles', methods=['GET'])
def produce_a_list_of_tiles_in_json_format():
    """
    Fetches all the tiles from the API and puts them in a JSON object accessible on ../alltiles for JS to access.
    """
    return json.dumps(tiles)


@app.after_request
def add_header(r):
    """
    Fix for Chrome's extremely overaggressive caching.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


if __name__ == '__main__':
    app.run()
