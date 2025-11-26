function gotoRoom() {
    document.getElementById("game-area").innerHTML =
        "<h2>Room Virtual</h2><p>Fitur room sederhana — kamu bisa modifikasi nanti.</p>";
}

function openChat() {
    document.getElementById("game-area").innerHTML = `
        <h2>Chat Global</h2>
        <div id="chat-box" style="height:200px; background:#222; padding:10px; overflow:auto; border-radius:10px;"></div>
        <input id="chat-input" placeholder="ketik pesan..." style="padding:10px; width:70%;">
        <button onclick="sendChat()" style="padding:10px;">Kirim</button>
    `;
}

function sendChat() {
    let input = document.getElementById("chat-input");
    let box = document.getElementById("chat-box");

    if (input.value.trim() === "") return;

    box.innerHTML += `<p><b>Kamu:</b> ${input.value}</p>`;
    input.value = "";

    box.scrollTop = box.scrollHeight;
}

function startTicTacToe() {
    let area = document.getElementById("game-area");
    area.innerHTML = "<h2>Tic Tac Toe</h2><div class='ttt-grid'></div>";

    let grid = area.querySelector(".ttt-grid");
    let turn = "X";

    for (let i = 0; i < 9; i++) {
        let cell = document.createElement("div");
        cell.className = "ttt-cell";
        cell.onclick = () => {
            if (cell.innerHTML !== "") return;
            cell.innerHTML = turn;
            turn = turn === "X" ? "O" : "X";
        };
        grid.appendChild(cell);
    }
}

function reactionGame() {
    let area = document.getElementById("game-area");
    area.innerHTML = "<h2>Reaction Game</h2><p>Tunggu...</p>";

    let delay = Math.random() * 3000 + 1000;

    setTimeout(() => {
        let start = Date.now();
        area.innerHTML = `
            <div class="reaction-box"><p>Tap sekarang!</p></div>
        `;

        document.querySelector(".reaction-box").onclick = () => {
            let time = Date.now() - start;
            area.innerHTML = `<h2>Kecepatan kamu: ${time} ms</h2>`;
        };
    }, delay);
}
