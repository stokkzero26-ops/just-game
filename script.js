// FINAL script: Skill Ekstrim (Gear5), TicTacToe vs Bot (Minimax), Reaction Dodge, Chat Lokal
// Developer: LUFFYDOMZZ

/* ----------------- helpers ----------------- */
const $ = (s) => document.querySelector(s);
const area = $('#area');
const EFFECT_OVERLAY = document.getElementById('effectOverlay');
const SMASH_TEXT = document.getElementById('smashText');

document.getElementById('btnChat').addEventListener('click', showChat);
document.getElementById('btnTtt').addEventListener('click', showTicTacToe);
document.getElementById('btnReaction').addEventListener('click', showReaction);
document.getElementById('btnResetAll').addEventListener('click', () => { localStorage.clear(); location.reload(); });

// Skill buttons
document.getElementById('btnSkill1').addEventListener('click', () => doSkill('pistol'));
document.getElementById('btnSkill2').addEventListener('click', () => doSkill('gear2'));
document.getElementById('btnSkill3').addEventListener('click', () => doSkill('gear5'));

// simple webaudio for punch/smash
function tone(freq, dur=0.12){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    g.gain.value = 0.06;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    setTimeout(()=>{ o.stop(); ctx.close(); }, dur*1000);
  } catch(e){}
}

/* ----------------- SKILL implementations ----------------- */
function doSkill(name){
  // Visual overlay + sound + shake for extreme
  if(name === 'pistol'){
    // small flash + punch
    flashScreen('#ffb3b3', 200);
    tone(700,0.08);
  } else if(name === 'gear2'){
    flashScreen('#fff1d6', 450);
    tone(1100,0.12);
    pulseScreen(1.06, 360);
  } else if(name === 'gear5'){
    // EXTRIM: clouds, big text, long shake, many tones
    EFFECT_OVERLAY.classList.remove('hidden');
    SMASH_TEXT.classList.remove('gear5-flash');
    void SMASH_TEXT.offsetWidth;
    SMASH_TEXT.classList.add('gear5-flash');
    SMASH_TEXT.style.opacity = 1;
    document.body.classList.add('shake');

    // series of tones & rumble
    tone(220, 0.18); setTimeout(()=>tone(420,0.12), 120); setTimeout(()=>tone(880,0.18), 260);
    // screen bright flash
    flashScreen('#fff7d6', 600);
    // remove after
    setTimeout(()=>{ EFFECT_OVERLAY.classList.add('hidden'); SMASH_TEXT.style.opacity = 0; document.body.classList.remove('shake'); }, 1400);
  }
}

// small helper effects
function flashScreen(color, ms){
  const el = document.createElement('div');
  el.style.position='fixed'; el.style.inset='0'; el.style.zIndex=9998; el.style.background = color; el.style.opacity='0.12';
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity 220ms'; el.style.opacity='0'; setTimeout(()=>el.remove(),250); }, ms);
}
function pulseScreen(scale, ms){
  document.body.style.transition = `transform ${ms}ms ease`;
  document.body.style.transform = `scale(${scale})`;
  setTimeout(()=>{ document.body.style.transform = ''; }, ms+40);
}

/* ----------------- CHAT (local) ----------------- */
function showChat(){
  area.innerHTML = `
    <div class="chat-wrap">
      <div class="messages" id="messages"></div>
      <div class="chat-input">
        <input id="chatName" placeholder="Nama (mis: Luffy)" />
        <input id="chatText" placeholder="Ketik pesan..." />
        <button id="chatSend">Kirim</button>
      </div>
      <div class="small">Chat lokal hanya tampil di device ini (offline).</div>
    </div>
  `;
  const messages = $('#messages');
  const chatSend = $('#chatSend');
  const chatName = $('#chatName');
  const chatText = $('#chatText');

  const KEY = 'vf_chat_hist_v2';
  const hist = JSON.parse(localStorage.getItem(KEY) || '[]');
  hist.forEach(m => appendMsg(messages, m.name, m.text, m.ts));

  chatSend.addEventListener('click', () => {
    const name = (chatName.value.trim() || 'Nakama');
    const text = chatText.value.trim();
    if(!text) return;
    const msg = { name, text, ts: Date.now() };
    hist.push(msg);
    localStorage.setItem(KEY, JSON.stringify(hist.slice(-300)));
    appendMsg(messages, msg.name, msg.text, msg.ts);
    chatText.value='';
  });
  chatText.addEventListener('keypress', e => { if(e.key === 'Enter') chatSend.click(); });
}
function appendMsg(container, who, text, ts){
  const el = document.createElement('div'); el.className='msg';
  el.innerHTML = `<div><span class="who">${escapeHtml(who)}</span> <span class="small">${new Date(ts).toLocaleTimeString()}</span><div>${escapeHtml(text)}</div></div>`;
  container.appendChild(el); container.scrollTop = container.scrollHeight;
}
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ----------------- TIC-TAC-TOE (VS BOT with Minimax) ----------------- */
function showTicTacToe(){
  area.innerHTML = `
    <h2 style="text-align:center;color:var(--accent)">Tic-Tac-Toe — Duel Nakama (VS Bot)</h2>
    <div class="ttt-grid" id="tttGrid"></div>
    <div class="ttt-controls">
      <button id="tttReset">Reset</button>
      <div class="small" id="tttStatus">Giliran: X (Kamu)</div>
    </div>
  `;
  let board = Array(9).fill(null);
  let you = 'X', bot = 'O';
  let yourTurn = true;
  const grid = $('#tttGrid');
  const status = $('#tttStatus');

  function render(){
    grid.innerHTML = '';
    board.forEach((v,i)=>{
      const cell = document.createElement('div'); cell.className = 'ttt-cell'; cell.textContent = v || '';
      cell.onclick = () => {
        if(board[i] || !yourTurn || checkWinner(board)) return;
        board[i] = you; yourTurn = false; update();
        setTimeout(()=>{ botMove(); }, 350);
      };
      grid.appendChild(cell);
    });
  }

  function update(){
    render();
    const w = checkWinner(board);
    if(w){ setTimeout(()=>{ alert(w === 'draw' ? 'Seri!' : (w + ' menang!')); }, 100); }
    status.textContent = yourTurn ? 'Giliran: X (Kamu)' : 'Giliran: O (Bot)';
    save();
  }

  function botMove(){
    const best = minimax(board, bot).index;
    if(best != null) board[best] = bot;
    yourTurn = true; update();
  }

  function reset(){
    board = Array(9).fill(null); yourTurn = true; update();
  }

  document.getElementById('tttReset').addEventListener('click', reset);
  function save(){ localStorage.setItem('vf_ttt_final', JSON.stringify(board)); }
  function load(){ const s = JSON.parse(localStorage.getItem('vf_ttt_final') || 'null'); if(s) board = s; }
  load(); update();

  // Minimax impl
  function checkWinner(b){
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const l of lines){ const [a,b1,c]=l; if(b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a]; }
    if(b.every(x=>x)) return 'draw';
    return null;
  }

  function emptyIndices(b){ return b.map((v,i)=>v?null:i).filter(x=>x!==null); }

  function minimax(newBoard, player){
    const avail = emptyIndices(newBoard);
    const winner = checkWinner(newBoard);
    if(winner === you) return {score:-10};
    else if(winner === bot) return {score:10};
    else if(avail.length === 0) return {score:0};

    const moves = [];
    for(const i of avail){
      const move = {};
      move.index = i;
      newBoard[i] = player;
      if(player === bot){
        const result = minimax(newBoard, you);
        move.score = result.score;
      } else {
        const result = minimax(newBoard, bot);
        move.score = result.score;
      }
      newBoard[i] = null;
      moves.push(move);
    }

    let bestMove;
    if(player === bot){
      let bestScore = -Infinity;
      for(const m of moves) if(m.score > bestScore){ bestScore = m.score; bestMove = m; }
    } else {
      let bestScore = Infinity;
      for(const m of moves) if(m.score < bestScore){ bestScore = m.score; bestMove = m; }
    }
    return bestMove;
  }
}

/* ----------------- REACTION DODGE (mini-game) ----------------- */
function showReaction(){
  area.innerHTML = `
    <h2 style="text-align:center;color:var(--accent)">Reaction Dodge — Hindari Batu!</h2>
    <div class="dodge-area" id="dodgeArea">
      <div class="player" id="player">YOU</div>
    </div>
    <div style="text-align:center;margin-top:8px">
      <button id="startDodge">Mulai</button>
      <button id="stopDodge">Berhenti</button>
      <div class="small" id="dodgeScore">Skor: 0</div>
    </div>
  `;

  const dodge = $('#dodgeArea');
  const player = $('#player');
  const startBtn = $('#startDodge');
  const stopBtn = $('#stopDodge');
  const scoreEl = $('#dodgeScore');

  let running = false;
  let obstacles = [];
  let playerX = dodge.clientWidth/2 - 36; // center
  let score = 0;
  let spawnTimer = null;
  let animTimer = null;

  function updatePlayerPos(){
    player.style.left = `${playerX}px`;
  }
  // keyboard controls
  window.addEventListener('keydown', kd);
  function kd(e){
    if(!running) return;
    if(e.key === 'ArrowLeft' || e.key === 'a'){ playerX = Math.max(6, playerX - 60); updatePlayerPos(); }
    if(e.key === 'ArrowRight' || e.key === 'd'){ playerX = Math.min(dodge.clientWidth - 78, playerX + 60); updatePlayerPos(); }
  }

  // touch controls (tap left/right)
  dodge.addEventListener('click', (ev) => {
    if(!running) return;
    const rect = dodge.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    if(x < rect.width/2) playerX = Math.max(6, playerX - 60);
    else playerX = Math.min(dodge.clientWidth - 78, playerX + 60);
    updatePlayerPos();
  });

  function spawnObstacle(){
    const el = document.createElement('div');
    el.className = 'obstacle';
    const left = Math.floor(Math.random()*(dodge.clientWidth - 60)) + 12;
    el.style.left = left + 'px';
    el.style.top = '-60px';
    dodge.appendChild(el);
    obstacles.push({el, x: left, y: -60, speed: 2 + Math.random()*2});
  }

  function gameLoop(){
    // move obstacles
    for(let i = obstacles.length-1; i>=0; i--){
      const ob = obstacles[i];
      ob.y += ob.speed;
      ob.el.style.top = ob.y + 'px';
      // check collision with player
      const playerRect = player.getBoundingClientRect();
      const obRect = ob.el.getBoundingClientRect();
      if(!(obRect.right < playerRect.left || obRect.left > playerRect.right || obRect.bottom < playerRect.top || obRect.top > playerRect.bottom)){
        // hit
        running = false; cleanup();
        flashScreen('#ffb3b3', 300);
        tone(220, 0.25);
        alert('Kena! Skor: ' + score + ' • Game Over');
        return;
      }
      // remove if off-screen
      if(ob.y > dodge.clientHeight + 80){
        ob.el.remove();
        obstacles.splice(i,1);
        score += 1;
        scoreEl.textContent = 'Skor: ' + score;
      }
    }
    if(running) animTimer = requestAnimationFrame(gameLoop);
  }

  function cleanup(){
    clearInterval(spawnTimer); cancelAnimationFrame(animTimer);
    obstacles.forEach(o=>o.el.remove());
    obstacles = [];
    startBtn.disabled = false;
  }

  startBtn.addEventListener('click', () => {
    if(running) return;
    running = true; score = 0; scoreEl.textContent = 'Skor: 0';
    playerX = dodge.clientWidth/2 - 36; updatePlayerPos();
    spawnTimer = setInterval(spawnObstacle, 850);
    animTimer = requestAnimationFrame(gameLoop);
    startBtn.disabled = true;
  });
  stopBtn.addEventListener('click', () => {
    running = false; cleanup();
  });

  // ensure player positioned
  setTimeout(()=> updatePlayerPos(), 80);
}

/* ----------------- default show welcome if none ----------------- */
if(area.querySelector?.('.welcome')) {
  // already showing welcome
} else {
  area.innerHTML = `<div class="welcome"><h2>Selamat datang, Nakama!</h2><p>Pilih mode permainan di atas.</p></div>`;
}
