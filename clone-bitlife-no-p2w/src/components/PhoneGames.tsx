import { useState, useEffect, useCallback, useRef } from 'react';

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Pos = [number, number];

// ==================== SNAKE ====================
function SnakeGame() {
  const S = 12;
  const [snake, setSnake] = useState<Pos[]>([[6, 6]]);
  const [food, setFood] = useState<Pos>([3, 3]);
  const [, setDir] = useState<Dir>('RIGHT');
  const [alive, setAlive] = useState(true);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const dirRef = useRef<Dir>('RIGHT');

  const spawnFood = useCallback((sn: Pos[]): Pos => {
    let f: Pos;
    do { f = [Math.floor(Math.random() * S), Math.floor(Math.random() * S)]; }
    while (sn.some(([r, c]) => r === f[0] && c === f[1]));
    return f;
  }, []);

  const reset = () => {
    const s: Pos[] = [[6, 6]];
    setSnake(s); setDir('RIGHT'); dirRef.current = 'RIGHT';
    setFood(spawnFood(s)); setAlive(true); setScore(0); setStarted(true);
  };

  useEffect(() => {
    if (!started || !alive) return;
    const iv = setInterval(() => {
      setSnake(prev => {
        const d = dirRef.current;
        const [hr, hc] = prev[0];
        const nh: Pos = d === 'UP' ? [hr - 1, hc] : d === 'DOWN' ? [hr + 1, hc] : d === 'LEFT' ? [hr, hc - 1] : [hr, hc + 1];
        if (nh[0] < 0 || nh[0] >= S || nh[1] < 0 || nh[1] >= S || prev.some(([r, c]) => r === nh[0] && c === nh[1])) {
          setAlive(false); return prev;
        }
        const ate = nh[0] === food[0] && nh[1] === food[1];
        const ns = [nh, ...prev];
        if (!ate) ns.pop(); else { setScore(s => s + 10); setFood(spawnFood(ns)); }
        return ns as Pos[];
      });
    }, 150);
    return () => clearInterval(iv);
  }, [started, alive, food, spawnFood]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const m: Record<string, Dir> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' };
      const nd = m[e.key]; if (!nd) return;
      e.preventDefault();
      const opp: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
      if (opp[nd] !== dirRef.current) { dirRef.current = nd; setDir(nd); }
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);

  const tap = (d: Dir) => {
    const opp: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (opp[d] !== dirRef.current) { dirRef.current = d; setDir(d); }
    if (!started) reset();
  };

  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <div className="flex justify-between w-full max-w-[300px]">
        <span className="text-yellow-400 font-bold text-sm">🐍 Snake</span>
        <span className="text-white text-sm">Score: {score}</span>
      </div>
      <div className="grid gap-0 border border-gray-600 bg-gray-950" style={{ gridTemplateColumns: `repeat(${S}, 1fr)` }}>
        {Array.from({ length: S * S }, (_, i) => {
          const r = Math.floor(i / S), c = i % S;
          const isSnake = snake.some(([sr, sc]) => sr === r && sc === c);
          const isHead = snake[0][0] === r && snake[0][1] === c;
          const isFood = food[0] === r && food[1] === c;
          return (
            <div key={i} className={`w-[22px] h-[22px] ${isHead ? 'bg-green-400' : isSnake ? 'bg-green-600' : isFood ? 'bg-red-500 rounded-full' : 'bg-gray-900'}`} />
          );
        })}
      </div>
      {!alive && <p className="text-red-400 text-sm font-bold">Game Over! Score: {score}</p>}
      {!started && <button onClick={reset} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-400">▶ Start</button>}
      {!alive && started && <button onClick={reset} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-400">↻ Retry</button>}
      <div className="grid grid-cols-3 gap-1 w-32">
        <div />
        <button onPointerDown={() => tap('UP')} className="bg-gray-700 text-white rounded p-2 text-lg active:bg-gray-500 select-none">↑</button>
        <div />
        <button onPointerDown={() => tap('LEFT')} className="bg-gray-700 text-white rounded p-2 text-lg active:bg-gray-500 select-none">←</button>
        <button onPointerDown={() => tap('DOWN')} className="bg-gray-700 text-white rounded p-2 text-lg active:bg-gray-500 select-none">↓</button>
        <button onPointerDown={() => tap('RIGHT')} className="bg-gray-700 text-white rounded p-2 text-lg active:bg-gray-500 select-none">→</button>
      </div>
    </div>
  );
}

// ==================== MINESWEEPER ====================
function MinesweeperGame() {
  const W = 8, H = 8, MINES = 8;
  type Cell = { mine: boolean; revealed: boolean; flagged: boolean; adj: number };
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const init = useCallback(() => {
    const g: Cell[][] = Array.from({ length: H }, () => Array.from({ length: W }, () => ({ mine: false, revealed: false, flagged: false, adj: 0 })));
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * H), c = Math.floor(Math.random() * W);
      if (!g[r][c].mine) { g[r][c].mine = true; placed++; }
    }
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      if (g[r][c].mine) continue;
      let cnt = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < H && nc >= 0 && nc < W && g[nr][nc].mine) cnt++;
      }
      g[r][c].adj = cnt;
    }
    setGrid(g); setGameOver(false); setWon(false);
  }, []);

  useEffect(() => { init(); }, [init]);

  const reveal = (r: number, c: number) => {
    if (gameOver || won || grid[r][c].revealed || grid[r][c].flagged) return;
    const ng = grid.map(row => row.map(cell => ({ ...cell })));
    if (ng[r][c].mine) { ng.forEach(row => row.forEach(cell => { cell.revealed = true; })); setGrid(ng); setGameOver(true); return; }
    const flood = (fr: number, fc: number) => {
      if (fr < 0 || fr >= H || fc < 0 || fc >= W || ng[fr][fc].revealed || ng[fr][fc].flagged) return;
      ng[fr][fc].revealed = true;
      if (ng[fr][fc].adj === 0) { for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) flood(fr + dr, fc + dc); }
    };
    flood(r, c);
    setGrid(ng);
    const unrevealed = ng.flat().filter(c => !c.revealed && !c.mine).length;
    if (unrevealed === 0) setWon(true);
  };

  const flag = (e: React.MouseEvent | React.TouchEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || won || grid[r][c].revealed) return;
    const ng = grid.map(row => row.map(cell => ({ ...cell })));
    ng[r][c].flagged = !ng[r][c].flagged;
    setGrid(ng);
  };

  const adjColors = ['', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-yellow-400', 'text-pink-400', 'text-cyan-400', 'text-white'];

  if (grid.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <div className="flex justify-between w-full max-w-[300px]">
        <span className="text-yellow-400 font-bold text-sm">💣 Minesweeper</span>
        <span className="text-gray-400 text-xs">🚩 {grid.flat().filter(c => c.flagged).length}/{MINES}</span>
      </div>
      {(gameOver || won) && (
        <p className={`text-sm font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>{won ? '🎉 You Win!' : '💥 Boom!'}</p>
      )}
      <div className="grid gap-0 border border-gray-600" style={{ gridTemplateColumns: `repeat(${W}, 1fr)` }}>
        {grid.flat().map((cell, i) => {
          const r = Math.floor(i / W), c = i % W;
          return (
            <button key={i} onClick={() => reveal(r, c)} onContextMenu={(e) => flag(e, r, c)}
              onTouchStart={(e) => { const t = setTimeout(() => flag(e, r, c), 400); const u = () => { clearTimeout(t); e.currentTarget.removeEventListener('touchend', u); }; e.currentTarget.addEventListener('touchend', u); }}
              className={`w-[34px] h-[34px] border border-gray-700 text-xs font-bold flex items-center justify-center select-none ${
                cell.revealed ? (cell.mine ? 'bg-red-900' : 'bg-gray-800') : 'bg-gray-600 hover:bg-gray-500 active:bg-gray-700'
              }`}>
              {cell.revealed ? (cell.mine ? '💣' : cell.adj > 0 ? <span className={adjColors[cell.adj]}>{cell.adj}</span> : '') : cell.flagged ? '🚩' : ''}
            </button>
          );
        })}
      </div>
      <button onClick={init} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-400">↻ New Game</button>
      <p className="text-gray-500 text-[10px]">Click to reveal • Long-press/right-click to flag</p>
    </div>
  );
}

// ==================== 2048 ====================
function Game2048() {
  const N = 4;
  type Board = number[][];
  const empty = (): Board => Array.from({ length: N }, () => Array(N).fill(0));

  const addRandom = (b: Board): Board => {
    const nb = b.map(r => [...r]);
    const empties: Pos[] = [];
    nb.forEach((r, ri) => r.forEach((v, ci) => { if (v === 0) empties.push([ri, ci]); }));
    if (empties.length === 0) return nb;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    nb[r][c] = Math.random() < 0.9 ? 2 : 4;
    return nb;
  };

  const init = (): Board => addRandom(addRandom(empty()));
  const [board, setBoard] = useState<Board>(init);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);

  const slideRow = (row: number[]): [number[], number] => {
    const nums = row.filter(v => v !== 0);
    let pts = 0;
    for (let i = 0; i < nums.length - 1; i++) {
      if (nums[i] === nums[i + 1]) { nums[i] *= 2; pts += nums[i]; nums[i + 1] = 0; }
    }
    const result = nums.filter(v => v !== 0);
    while (result.length < N) result.push(0);
    return [result, pts];
  };

  const canMove = (b: Board): boolean => {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (b[r][c] === 0) return true;
      if (c < N - 1 && b[r][c] === b[r][c + 1]) return true;
      if (r < N - 1 && b[r][c] === b[r + 1][c]) return true;
    }
    return false;
  };

  const move = useCallback((d: Dir) => {
    if (over) return;
    setBoard(prev => {
      let nb = prev.map(r => [...r]);
      let pts = 0;
      let moved = false;

      if (d === 'LEFT') {
        for (let r = 0; r < N; r++) { const [nr, p] = slideRow(nb[r]); if (nr.some((v, i) => v !== nb[r][i])) moved = true; nb[r] = nr; pts += p; }
      } else if (d === 'RIGHT') {
        for (let r = 0; r < N; r++) { const [nr, p] = slideRow([...nb[r]].reverse()); nr.reverse(); if (nr.some((v, i) => v !== nb[r][i])) moved = true; nb[r] = nr; pts += p; }
      } else if (d === 'UP') {
        for (let c = 0; c < N; c++) { const col = nb.map(r => r[c]); const [nr, p] = slideRow(col); if (nr.some((v, i) => v !== nb[i][c])) moved = true; nr.forEach((v, i) => nb[i][c] = v); pts += p; }
      } else {
        for (let c = 0; c < N; c++) { const col = nb.map(r => r[c]).reverse(); const [nr, p] = slideRow(col); nr.reverse(); if (nr.some((v, i) => v !== nb[i][c])) moved = true; nr.forEach((v, i) => nb[i][c] = v); pts += p; }
      }

      if (!moved) return prev;
      nb = addRandom(nb);
      setScore(s => { const ns = s + pts; setBest(b => Math.max(b, ns)); return ns; });
      if (!canMove(nb)) setOver(true);
      return nb;
    });
  }, [over]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const m: Record<string, Dir> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' };
      if (m[e.key]) { e.preventDefault(); move(m[e.key]); }
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [move]);

  // Touch swipe
  const touchStart = useRef<Pos | null>(null);
  const onTS = (e: React.TouchEvent) => { touchStart.current = [e.touches[0].clientX, e.touches[0].clientY]; };
  const onTE = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current[0];
    const dy = e.changedTouches[0].clientY - touchStart.current[1];
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'RIGHT' : 'LEFT');
    else move(dy > 0 ? 'DOWN' : 'UP');
    touchStart.current = null;
  };

  const tileColor = (v: number): string => {
    const m: Record<number, string> = { 2: 'bg-gray-600', 4: 'bg-gray-500', 8: 'bg-orange-600', 16: 'bg-orange-500', 32: 'bg-red-500', 64: 'bg-red-600', 128: 'bg-yellow-500', 256: 'bg-yellow-400', 512: 'bg-yellow-300', 1024: 'bg-yellow-200', 2048: 'bg-yellow-100' };
    return m[v] || (v > 2048 ? 'bg-purple-500' : 'bg-gray-700');
  };

  const restart = () => { setBoard(init()); setScore(0); setOver(false); };

  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <div className="flex justify-between w-full max-w-[300px]">
        <span className="text-yellow-400 font-bold text-sm">🔢 2048</span>
        <div className="flex gap-3">
          <span className="text-white text-sm">Score: {score}</span>
          <span className="text-gray-400 text-sm">Best: {best}</span>
        </div>
      </div>
      <div className="bg-gray-800 p-2 rounded-xl" onTouchStart={onTS} onTouchEnd={onTE}>
        <div className="grid grid-cols-4 gap-1.5">
          {board.flat().map((v, i) => (
            <div key={i} className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold select-none transition-all ${v ? tileColor(v) : 'bg-gray-700/50'} ${v >= 1024 ? 'text-sm' : v >= 128 ? 'text-base' : 'text-lg'} ${v > 4 ? 'text-white' : 'text-gray-200'}`}>
              {v || ''}
            </div>
          ))}
        </div>
      </div>
      {over && <p className="text-red-400 text-sm font-bold">Game Over! Final: {score}</p>}
      <button onClick={restart} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-400">↻ New Game</button>
      <div className="grid grid-cols-3 gap-1 w-32">
        <div />
        <button onPointerDown={() => move('UP')} className="bg-gray-700 text-white rounded p-2 text-lg active:bg-gray-500 select-none">↑</button>
        <div />
        <button onPointerDown={() => move('LEFT')} className="bg-gray-700 text-white rounded p-2 text-lg active:bg-gray-500 select-none">←</button>
        <button onPointerDown={() => move('DOWN')} className="bg-gray-700 text-white rounded p-2 text-lg active:bg-gray-500 select-none">↓</button>
        <button onPointerDown={() => move('RIGHT')} className="bg-gray-700 text-white rounded p-2 text-lg active:bg-gray-500 select-none">→</button>
      </div>
      <p className="text-gray-500 text-[10px]">Swipe or use arrow keys / buttons</p>
    </div>
  );
}

// ==================== PHONE GAMES HUB ====================
export function PhoneGames({ tier }: { tier: number }) {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    { id: 'snake', name: 'Snake', icon: '🐍', tier: 1, desc: 'Classic snake — eat & grow!' },
    { id: 'minesweeper', name: 'Minesweeper', icon: '💣', tier: 2, desc: 'Clear the board, dodge mines!' },
    { id: '2048', name: '2048', icon: '🔢', tier: 3, desc: 'Merge tiles to reach 2048!' },
  ];

  if (activeGame === 'snake') return <SnakeGame />;
  if (activeGame === 'minesweeper') return <MinesweeperGame />;
  if (activeGame === '2048') return <Game2048 />;

  return (
    <div className="p-4 space-y-3">
      <p className="text-gray-400 text-xs text-center">Upgrade your phone to unlock more games!</p>
      {games.map(g => (
        <button key={g.id} disabled={tier < g.tier}
          onClick={() => tier >= g.tier && setActiveGame(g.id)}
          className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all border ${
            tier >= g.tier
              ? 'bg-gray-800 hover:bg-gray-750 border-gray-700 hover:border-gray-600 cursor-pointer'
              : 'bg-gray-800/50 border-gray-700/30 opacity-50 cursor-not-allowed'
          }`}>
          <span className="text-3xl">{g.icon}</span>
          <div className="flex-1 text-left">
            <p className="text-white font-bold text-sm">{g.name}</p>
            <p className="text-gray-400 text-xs">{tier >= g.tier ? g.desc : `🔒 Requires phone tier ${g.tier}`}</p>
          </div>
          {tier >= g.tier ? (
            <span className="text-green-400 text-sm">▶</span>
          ) : (
            <span className="text-gray-600 text-sm">🔒</span>
          )}
        </button>
      ))}
    </div>
  );
}
