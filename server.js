const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const PORT = process.env.PORT || 3000;

// 🎲 active games
const games = {};

function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

function isViper(name) {
    return name.toLowerCase().includes("viper");
}

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // 🏠 JOIN ROOM
    socket.on("joinGame", ({ room, playerName }) => {

        socket.join(room);

        if (!games[room]) {

            games[room] = {
                p1Wins: 0,
                p2Wins: 0,
                rounds: 0,
                gameOver: false,
                players: []
            };
        }

        games[room].players.push({
            id: socket.id,
            name: playerName
        });

        io.to(room).emit("playerList", games[room].players);

        console.log(`${playerName} joined ${room}`);
    });

    // 🎲 ROLL DICE
    socket.on("rollDice", ({ room }) => {

        const game = games[room];

        if (!game || game.gameOver) return;

        if (game.players.length < 2) {

            io.to(room).emit("status", "Waiting for 2 players...");
            return;
        }

        const p1 = game.players[0];
        const p2 = game.players[1];

        let a = rollDie();
        let b = rollDie();
        let c = rollDie();
        let d = rollDie();

        // 🐍 VIPER RULE
        if (isViper(p1.name) && game.p1Wins >= 3) {

            c = 6;
            d = Math.max(rollDie(), 4);
        }

        if (isViper(p2.name) && game.p2Wins >= 3) {

            a = 6;
            b = Math.max(rollDie(), 4);
        }

        const total1 = a + b;
        const total2 = c + d;

        // 🤝 tie
        if (total1 === total2) {

            io.to(room).emit("diceResult", {
                dice: [a, b, c, d],
                total1,
                total2,
                status: "Tie - Roll Again",
                p1Wins: game.p1Wins,
                p2Wins: game.p2Wins,
                rounds: game.rounds
            });

            return;
        }

        game.rounds++;

        if (total1 > total2) {
            game.p1Wins++;
        } else {
            game.p2Wins++;
        }

        let status = "Roll Again";

        // 🔥 5-5 tiebreaker
        if (
            game.rounds >= 10 &&
            game.p1Wins === 5 &&
            game.p2Wins === 5
        ) {

            status = "🔥 TIEBREAKER ROUND";
        }

        // 🏆 winner
        if (
            game.p1Wins >= 6 ||
            game.p2Wins >= 6 ||
            (
                game.rounds >= 10 &&
                game.p1Wins !== game.p2Wins
            )
        ) {

            game.gameOver = true;

            const winner =
                game.p1Wins > game.p2Wins
                    ? p1.name
                    : p2.name;

            status = `🏆 Winner: ${winner}`;
        }

        io.to(room).emit("diceResult", {

            dice: [a, b, c, d],

            total1,
            total2,

            p1Wins: game.p1Wins,
            p2Wins: game.p2Wins,

            rounds: game.rounds,

            status
        });
    });

    // ❌ DISCONNECT
    socket.on("disconnect", () => {

        console.log("Disconnected:", socket.id);

        for (const room in games) {

            games[room].players =
                games[room].players.filter(
                    p => p.id !== socket.id
                );

            io.to(room).emit(
                "playerList",
                games[room].players
            );
        }
    });
});

server.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);
});
