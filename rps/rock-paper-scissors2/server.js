const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3003;

// Store connected players and their choices
var players = {};
var choices = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle new player joining
  socket.on('join', (playerName) => {
    players[socket.id] = playerName;
    socket.join('gameRoom'); // Join a common room for all players

    // If there are two players, start the game
    if (Object.keys(players).length === 2) {
      io.to('gameRoom').emit('gameStart', { players });
    }
  });

  // Handle player's choice
  socket.on('choice', (choice) => {
    choices[socket.id] = choice;

    // If both players have made choices, determine the winner
    if (Object.keys(choices).length === 2) {
      const player1 = Object.keys(choices)[0];
      const player2 = Object.keys(choices)[1];
      const result = determineWinner(choices[player1], choices[player2]);

      io.to('gameRoom').emit('result', {
        player1: { name: players[player1], choice: choices[player1] },
        player2: { name: players[player2], choice: choices[player2] },
        result,
      });

      // Reset choices for the next round
      choices = {};
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];

    // If a player disconnects, notify the other player
    if (Object.keys(players).length === 1) {
      io.to('gameRoom').emit('opponentDisconnected');
    }
  });
});

// Function to determine the winner
function determineWinner(choice1, choice2) {
  if (choice1 === choice2) return 'Draw';
  if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  ) {
    return `${players[Object.keys(choices)[0]]} wins!`;
  } else {
    return `${players[Object.keys(choices)[1]]} wins!`;
  }
}

http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});