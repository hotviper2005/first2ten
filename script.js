let p1Wins = 0;
let p2Wins = 0;
let countedRounds = 0;

let gameStarted = false;
let gameOver = false;
let tieBreakerMode = false;

function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

function isViper(name) {
    return name.toLowerCase().includes("viper");
}

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("startBtn")
        .addEventListener("click", startGame);

    document.getElementById("rollBtn")
        .addEventListener("click", animateRoll);

    document.getElementById("resetBtn")
        .addEventListener("click", resetGame);
});

function startGame() {

    p1Wins = 0;
    p2Wins = 0;
    countedRounds = 0;

    tieBreakerMode = false;

    gameStarted = true;
    gameOver = false;

    const p1 = document.getElementById("p1").value || "Player 1";
    const p2 = document.getElementById("p2").value || "Player 2";

    document.getElementById("p1Name").textContent = p1;
    document.getElementById("p2Name").textContent = p2;

    document.getElementById("scores").textContent = "";
    document.getElementById("history").innerHTML = "";

    document.getElementById("status").textContent =
        "🎲 Roll The Dice!";

    document.getElementById("rollBtn").disabled = false;
}

function animateRoll() {

    if (!gameStarted || gameOver) return;

    const rollBtn = document.getElementById("rollBtn");

    rollBtn.disabled = true;

    const dice = [
        document.getElementById("p1d1"),
        document.getElementById("p1d2"),
        document.getElementById("p2d1"),
        document.getElementById("p2d2")
    ];

    dice.forEach(d => d.classList.add("rolling"));

    document.getElementById("status").textContent =
        "🎲 Rolling Dice...";

    const rollSound = document.getElementById("rollSound");

    rollSound.currentTime = 0;
    rollSound.play();

    const animationInterval = setInterval(() => {

        dice.forEach(die => {

            const temp = rollDie();

            die.style.backgroundImage =
                `url('${temp}.png')`;
        });

    }, 90);

    setTimeout(() => {

        clearInterval(animationInterval);

        dice.forEach(d => d.classList.remove("rolling"));

        rollDice();

        document.getElementById("clickSound").play();

        if (!gameOver) {
            rollBtn.disabled = false;
        }

    }, 1200);
}

function rollDice() {

    const p1 = document.getElementById("p1Name").textContent;
    const p2 = document.getElementById("p2Name").textContent;

    const p1IsViper = isViper(p1);
    const p2IsViper = isViper(p2);

    let a = rollDie();
    let b = rollDie();
    let c = rollDie();
    let d = rollDie();

    // 🐍 VIPER RULE
    if (p1IsViper && p1Wins >= 3) {

        c = 6;
        d = Math.max(rollDie(), 4);
    }

    if (p2IsViper && p2Wins >= 3) {

        a = 6;
        b = Math.max(rollDie(), 4);
    }

    const total1 = a + b;
    const total2 = c + d;

    // 🎲 FINAL DICE
    document.getElementById("p1d1")
        .style.backgroundImage = `url('${a}.png')`;

    document.getElementById("p1d2")
        .style.backgroundImage = `url('${b}.png')`;

    document.getElementById("p2d1")
        .style.backgroundImage = `url('${c}.png')`;

    document.getElementById("p2d2")
        .style.backgroundImage = `url('${d}.png')`;

    document.getElementById("p1Total").textContent =
        `Total: ${total1}`;

    document.getElementById("p2Total").textContent =
        `Total: ${total2}`;

    // 🤝 TIE
    if (total1 === total2) {

        if (tieBreakerMode) {

            document.getElementById("status").textContent =
                "🔥 TIEBREAKER TIE - ROLL AGAIN";

        } else {

            document.getElementById("status").textContent =
                "Tie - Roll Again";
        }

        return;
    }

    // 🔥 TIEBREAKER ROUND
    if (tieBreakerMode) {

        const winner =
            total1 > total2 ? p1 : p2;

        document.getElementById("status").textContent =
            `🏆 TIEBREAKER WINNER: ${winner}`;

        gameOver = true;

        document.getElementById("rollBtn").disabled = true;

        return;
    }

    countedRounds++;

    if (total1 > total2) p1Wins++;
    else p2Wins++;

    document.getElementById("scores").textContent =
        `${p1}: ${p1Wins} | ${p2}: ${p2Wins}`;

    document.getElementById("history").innerHTML =
        `Round ${countedRounds}: ${p1} ${total1} - ${total2} ${p2}<br>` +
        document.getElementById("history").innerHTML;

    // 🔥 5-5 TIEBREAKER
    if (p1Wins === 5 && p2Wins === 5) {

        tieBreakerMode = true;

        document.getElementById("status").textContent =
            "🔥 5-5 TIEBREAKER ROUND";

        return;
    }

    // 🏆 NORMAL WIN CONDITIONS
    if (
        countedRounds >= 10 ||
        p1Wins >= 6 ||
        p2Wins >= 6
    ) {

        const winner =
            p1Wins > p2Wins ? p1 : p2;

        document.getElementById("status").textContent =
            `🏆 Winner: ${winner}`;

        gameOver = true;

        document.getElementById("rollBtn").disabled = true;

        return;
    }

    document.getElementById("status").textContent =
        "🎲 Roll Again!";
}

function resetGame() {

    gameStarted = false;
    gameOver = false;
    tieBreakerMode = false;

    p1Wins = 0;
    p2Wins = 0;
    countedRounds = 0;

    document.getElementById("status").textContent =
        "Enter names and press Start Game";

    document.getElementById("scores").textContent = "";
    document.getElementById("history").innerHTML = "";

    document.getElementById("rollBtn").disabled = true;

    ["p1d1","p1d2","p2d1","p2d2"].forEach(id => {

        document.getElementById(id)
            .style.backgroundImage = "";
    });

    document.getElementById("p1Total").textContent = "";
    document.getElementById("p2Total").textContent = "";
}
