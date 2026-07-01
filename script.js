// 🔥 FIREBASE CONFIG

const firebaseConfig = {

    apiKey: "AIzaSyCZ3ghDPGo91Kc4c1yaK5l34f7aysSmO2g",

    authDomain: "first2tendice.firebaseapp.com",

    databaseURL: "https://first2tendice-default-rtdb.firebaseio.com",

    projectId: "first2tendice",

    storageBucket: "first2tendice.firebasestorage.app",

    messagingSenderId: "860783034336",

    appId: "1:860783034336:web:da6c919b4356fa48d0b585"
};

// 🔥 START FIREBASE

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

const gameRef = db.ref("bestof10/game");

let gameStarted = false;

// 🎲 RANDOM DIE

function rollDie() {

    return Math.floor(Math.random() * 6) + 1;
}

// 🐍 VIPER CHECK

function isViper(name) {

    return name.toLowerCase().includes("viper");
}

// 🚀 PAGE READY

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("startBtn")
        .addEventListener("click", joinGame);

    document.getElementById("rollBtn")
        .addEventListener("click", beginSharedRoll);

    document.getElementById("resetBtn")
        .addEventListener("click", resetGame);
});

// 🚀 JOIN GAME

function joinGame() {

    const playerName =

        document.getElementById("p1").value || "Player";

    gameStarted = true;

    document.getElementById("rollBtn")
        .disabled = false;

    gameRef.once("value", snapshot => {

        let game = snapshot.val();

        if (!game) {

            game = {

                p1Name: playerName,
                p2Name: "",

                p1Wins: 0,
                p2Wins: 0,

                rounds: 0,

                gameOver: false,

                history: "",

                status: "🎲 Roll The Dice!"
            };

        } else {

            if (!game.p1Name) {

                game.p1Name = playerName;

            } else if (!game.p2Name) {

                game.p2Name = playerName;
            }
        }

        gameRef.set(game);
    });
}

// 🌐 SHARED ROLL START

function beginSharedRoll() {

    if (!gameStarted) return;

    gameRef.update({

        rolling: true
    });

    setTimeout(() => {

        performRoll();

    }, 1800);
}

// 🎲 SHARED ANIMATION

function animateDice() {

    const dice = [

        document.getElementById("p1d1"),
        document.getElementById("p1d2"),
        document.getElementById("p2d1"),
        document.getElementById("p2d2")
    ];

    dice.forEach(d =>
        d.classList.add("rolling")
    );

    document.getElementById("status").textContent =

        "🎲 Rolling Dice...";

    const rollSound =

        document.getElementById("rollSound");

    rollSound.currentTime = 0;

    rollSound.play();

    const interval = setInterval(() => {

        dice.forEach(die => {

            const temp = rollDie();

            die.style.backgroundImage =
                `url('${temp}.png')`;
        });

    }, 90);

    setTimeout(() => {

        clearInterval(interval);

        dice.forEach(d =>
            d.classList.remove("rolling")
        );

    }, 1700);
}

// 🎲 REAL GAME ROLL

function performRoll() {

    gameRef.once("value", snapshot => {

        let game = snapshot.val();

        if (!game || game.gameOver) return;

        let a = rollDie();
        let b = rollDie();
        let c = rollDie();
        let d = rollDie();

        // 🐍 VIPER LOGIC

        if (

            isViper(game.p1Name || "") &&
            game.p1Wins >= 3

        ) {

            c = 6;
            d = Math.max(rollDie(), 4);
        }

        if (

            isViper(game.p2Name || "") &&
            game.p2Wins >= 3

        ) {

            a = 6;
            b = Math.max(rollDie(), 4);
        }

        const total1 = a + b;
        const total2 = c + d;

        let roundWinner = "";

        // 🤝 TIE

        if (total1 === total2) {

            game.status =
                "Tie - Roll Again";

            game.dice = [a,b,c,d];

            game.total1 = total1;
            game.total2 = total2;

            game.rolling = false;

            gameRef.set(game);

            return;
        }

        game.rounds++;

        if (total1 > total2) {

            game.p1Wins++;

            roundWinner = game.p1Name;

        } else {

            game.p2Wins++;

            roundWinner = game.p2Name;
        }

        // 🔥 TIEBREAKER

        if (

            game.p1Wins === 5 &&
            game.p2Wins === 5

        ) {

            game.status =
                "🔥 5-5 TIEBREAKER ROUND";

        } else {

            game.status =
                "🎲 Roll Again!";
        }

        // 🏆 WINNER

        if (

            game.p1Wins >= 6 ||
            game.p2Wins >= 6 ||

            (

                game.rounds >= 10 &&
                game.p1Wins !== game.p2Wins
            )

        ) {

            game.gameOver = true;

            game.status =

                `🏆 Winner: ${
                    game.p1Wins > game.p2Wins
                    ? game.p1Name
                    : game.p2Name
                }`;
        }

        game.dice = [a,b,c,d];

        game.total1 = total1;
        game.total2 = total2;

        // 📜 HISTORY WITH WINNER

        game.history =

            `Round ${game.rounds}: 
             ${total1} - ${total2}
             | Winner: ${roundWinner}<br>` +

            (game.history || "");

        game.rolling = false;

        gameRef.set(game);
    });
}

// 🌐 LIVE GAME UPDATES

gameRef.on("value", snapshot => {

    const game = snapshot.val();

    if (!game) return;

    // 🎲 SHARED ANIMATION

    if (game.rolling) {

        animateDice();
    }

    document.getElementById("p1Name").textContent =

        game.p1Name || "Player 1";

    document.getElementById("p2Name").textContent =

        game.p2Name || "Player 2";

    document.getElementById("scores").textContent =

        `${game.p1Name || "Player 1"}: ${game.p1Wins || 0}
         |
         ${game.p2Name || "Player 2"}: ${game.p2Wins || 0}`;

    document.getElementById("status").textContent =

        game.status || "";

    document.getElementById("history").innerHTML =

        game.history || "";

    // 🎲 UPDATE DICE

    if (game.dice) {

        const [a,b,c,d] = game.dice;

        document.getElementById("p1d1")
            .style.backgroundImage = `url('${a}.png')`;

        document.getElementById("p1d2")
            .style.backgroundImage = `url('${b}.png')`;

        document.getElementById("p2d1")
            .style.backgroundImage = `url('${c}.png')`;

        document.getElementById("p2d2")
            .style.backgroundImage = `url('${d}.png')`;

        document.getElementById("p1Total").textContent =
            `Total: ${game.total1}`;

        document.getElementById("p2Total").textContent =
            `Total: ${game.total2}`;
    }

    // 🏁 GAME OVER

    if (game.gameOver) {

        document.getElementById("rollBtn")
            .disabled = true;
    }
});

// 🔄 RESET

function resetGame() {

    gameRef.remove();

    document.getElementById("rollBtn")
        .disabled = true;

    document.getElementById("history").innerHTML = "";

    document.getElementById("scores").textContent = "";

    document.getElementById("status").textContent =

        "Enter name and join game";
}
