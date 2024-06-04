const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let players = {};
let choices = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add new player
    players[socket.id] = {
        id: socket.id,
        choice: null
    };

    // Notify the new player
    socket.emit('welcome', { id: socket.id, players });

    // Notify other players
    socket.broadcast.emit('newPlayer', { id: socket.id });

    // Handle player choice
    socket.on('makeChoice', (choice) => {
        choices[socket.id] = choice;
        players[socket.id].choice = choice;

        // Check if both players have made a choice
        if (Object.keys(choices).length === 2) {
            const [player1, player2] = Object.keys(choices);
            const result = determineWinner(player1, player2, choices);
            io.emit('result', result);

            // Reset choices
            choices = {};
        }
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        delete players[socket.id];
        delete choices[socket.id];

        // Notify other players
        socket.broadcast.emit('playerLeft', { id: socket.id });
    });
});

const determineWinner = (player1, player2, choices) => {
    const choice1 = choices[player1];
    const choice2 = choices[player2];

    if (choice1 === choice2) {
        return { winner: null, message: 'It\'s a tie!' };
    }

    if (
        (choice1 === 'rock' && choice2 === 'scissors') ||
        (choice1 === 'scissors' && choice2 === 'paper') ||
        (choice1 === 'paper' && choice2 === 'rock')
    ) {
        return { winner: player1, message: 'Player 1 wins!' };
    } else {
        return { winner: player2, message: 'Player 2 wins!' };
    }
};

app.use(express.static('public'));

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});