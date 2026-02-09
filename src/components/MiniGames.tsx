import { useState, useEffect, useCallback, useRef } from 'react';

// ====== MATH QUIZ ======
interface MathQuizProps {
  difficulty: number; // 1-10 based on smarts
  onComplete: (score: number) => void; // 0-100
  onCancel: () => void;
}

export function MathQuiz({ difficulty, onComplete, onCancel }: MathQuizProps) {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questions] = useState(() => generateMathQuestions(difficulty, 5));
  const totalQuestions = questions.length;

  useEffect(() => {
    if (timeLeft <= 0) {
      if (questionIdx < totalQuestions - 1) {
        setQuestionIdx(q => q + 1);
        setTimeLeft(15);
        setSelectedAnswer(null);
      } else {
        onComplete(Math.round((score / totalQuestions) * 100));
      }
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, questionIdx, totalQuestions, score, onComplete]);

  const handleAnswer = (ansIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(ansIdx);
    const correct = ansIdx === questions[questionIdx].correctIdx;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    setTimeout(() => {
      if (questionIdx < totalQuestions - 1) {
        setQuestionIdx(q => q + 1);
        setTimeLeft(15);
        setSelectedAnswer(null);
      } else {
        onComplete(Math.round((newScore / totalQuestions) * 100));
      }
    }, 800);
  };

  const q = questions[questionIdx];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-green-400 font-bold text-sm">📐 Math Quiz</span>
          <span className="text-gray-400 text-sm">{questionIdx + 1}/{totalQuestions}</span>
          <span className={`font-bold text-sm ${timeLeft <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>⏱ {timeLeft}s</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${((questionIdx) / totalQuestions) * 100}%` }} />
        </div>

        <p className="text-white text-2xl font-bold text-center mb-6 py-4">{q.question}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {q.answers.map((ans, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selectedAnswer !== null}
              className={`py-3 px-4 rounded-xl font-bold text-lg transition-all ${
                selectedAnswer === null
                  ? 'bg-gray-700 text-white hover:bg-gray-600 active:scale-95'
                  : idx === q.correctIdx
                    ? 'bg-green-500 text-white'
                    : selectedAnswer === idx
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-500'
              }`}
            >
              {ans}
            </button>
          ))}
        </div>

        <p className="text-center text-gray-400 text-sm">Score: {score}/{questionIdx + (selectedAnswer !== null ? 1 : 0)}</p>
        <button onClick={onCancel} className="mt-3 text-gray-500 text-xs w-full text-center hover:text-gray-300">Skip Class</button>
      </div>
    </div>
  );
}

function generateMathQuestions(difficulty: number, count: number) {
  const questions: { question: string; answers: number[]; correctIdx: number }[] = [];
  for (let i = 0; i < count; i++) {
    const maxNum = Math.min(5 + difficulty * 3, 50);
    const a = Math.floor(Math.random() * maxNum) + 1;
    const b = Math.floor(Math.random() * maxNum) + 1;
    const ops = difficulty > 5 ? ['+', '-', '×'] : ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer: number;
    switch (op) {
      case '+': answer = a + b; break;
      case '-': answer = a - b; break;
      case '×': answer = a * b; break;
      default: answer = a + b;
    }
    const wrongAnswers = new Set<number>();
    while (wrongAnswers.size < 3) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrong = answer + (offset === 0 ? 1 : offset);
      if (wrong !== answer) wrongAnswers.add(wrong);
    }
    const answers = [answer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);
    questions.push({ question: `${a} ${op} ${b} = ?`, answers, correctIdx: answers.indexOf(answer) });
  }
  return questions;
}

// ====== TYPING TEST ======
interface TypingTestProps {
  difficulty: number;
  onComplete: (score: number) => void;
  onCancel: () => void;
}

const typingSentences = [
  "The quick brown fox jumps over the lazy dog",
  "A journey of a thousand miles begins with a single step",
  "To be or not to be that is the question",
  "All that glitters is not gold",
  "Practice makes perfect in everything you do",
  "Knowledge is power and power is responsibility",
  "The early bird catches the worm every morning",
  "Actions speak louder than words my friend",
  "Life is what happens when you are busy making plans",
  "Every cloud has a silver lining ahead",
];

export function TypingTest({ difficulty, onComplete, onCancel }: TypingTestProps) {
  const maxLen = Math.min(15 + difficulty * 3, 45);
  const [sentence] = useState(() => {
    const s = typingSentences[Math.floor(Math.random() * typingSentences.length)];
    return s.substring(0, maxLen);
  });
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(20 + difficulty);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!started || done) return;
    if (timeLeft <= 0) {
      setDone(true);
      const accuracy = calculateAccuracy(sentence, input);
      onComplete(accuracy);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, started, done, sentence, input, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!started) setStarted(true);
    if (done) return;
    const val = e.target.value;
    setInput(val);
    if (val.length >= sentence.length) {
      setDone(true);
      const accuracy = calculateAccuracy(sentence, val);
      const timeBonus = Math.min(20, timeLeft * 2);
      onComplete(Math.min(100, accuracy + timeBonus));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-blue-400 font-bold text-sm">⌨️ Typing Test</span>
          <span className={`font-bold text-sm ${timeLeft <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>⏱ {timeLeft}s</span>
        </div>

        <div className="bg-gray-700 rounded-xl p-4 mb-4">
          <p className="text-lg font-mono leading-relaxed">
            {sentence.split('').map((char, idx) => (
              <span
                key={idx}
                className={
                  idx < input.length
                    ? input[idx] === char ? 'text-green-400' : 'text-red-400 bg-red-900/30'
                    : 'text-gray-400'
                }
              >
                {char}
              </span>
            ))}
          </p>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
          disabled={done}
          placeholder={started ? '' : 'Start typing...'}
          className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 font-mono"
          autoComplete="off"
          autoCapitalize="off"
        />

        <p className="text-center text-gray-400 text-sm mt-3">
          {input.length}/{sentence.length} characters
        </p>
        <button onClick={onCancel} className="mt-3 text-gray-500 text-xs w-full text-center hover:text-gray-300">Skip</button>
      </div>
    </div>
  );
}

function calculateAccuracy(target: string, input: string): number {
  let correct = 0;
  const len = Math.min(target.length, input.length);
  for (let i = 0; i < len; i++) {
    if (target[i] === input[i]) correct++;
  }
  return Math.round((correct / target.length) * 100);
}

// ====== MEMORY GAME ======
interface MemoryGameProps {
  difficulty: number;
  onComplete: (score: number) => void;
  onCancel: () => void;
}

export function MemoryGame({ difficulty, onComplete, onCancel }: MemoryGameProps) {
  const gridSize = Math.min(3 + Math.floor(difficulty / 3), 5);
  const totalCells = gridSize * gridSize;
  const numToRemember = Math.min(Math.max(3, Math.floor(difficulty / 2) + 2), Math.floor(totalCells / 2));
  
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');
  const [targetCells] = useState(() => {
    const cells = new Set<number>();
    while (cells.size < numToRemember) {
      cells.add(Math.floor(Math.random() * totalCells));
    }
    return cells;
  });
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(3 + Math.floor(difficulty / 3));

  useEffect(() => {
    if (phase !== 'memorize') return;
    if (timeLeft <= 0) {
      setPhase('recall');
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase]);

  const handleCellClick = (idx: number) => {
    if (phase !== 'recall') return;
    const newSelected = new Set(selectedCells);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedCells(newSelected);

    if (newSelected.size === numToRemember) {
      setPhase('result');
      let correct = 0;
      newSelected.forEach(cell => {
        if (targetCells.has(cell)) correct++;
      });
      const score = Math.round((correct / numToRemember) * 100);
      setTimeout(() => onComplete(score), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-purple-400 font-bold text-sm">🧠 Memory Game</span>
          {phase === 'memorize' && <span className="text-yellow-400 font-bold text-sm">⏱ {timeLeft}s</span>}
        </div>

        <p className="text-gray-300 text-center text-sm mb-4">
          {phase === 'memorize' ? 'Memorize the highlighted cells!' :
           phase === 'recall' ? `Select ${numToRemember} cells that were highlighted` :
           'Checking results...'}
        </p>

        <div className="grid gap-2 mx-auto" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, maxWidth: `${gridSize * 60}px` }}>
          {Array.from({ length: totalCells }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={phase !== 'recall'}
              className={`aspect-square rounded-lg transition-all font-bold text-lg ${
                phase === 'memorize' && targetCells.has(idx)
                  ? 'bg-purple-500 scale-105'
                  : phase === 'result' && targetCells.has(idx)
                    ? selectedCells.has(idx) ? 'bg-green-500' : 'bg-red-500/50'
                    : phase === 'result' && selectedCells.has(idx)
                      ? 'bg-red-500'
                      : selectedCells.has(idx)
                        ? 'bg-blue-500'
                        : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {phase === 'result' && targetCells.has(idx) && selectedCells.has(idx) ? '✓' : ''}
              {phase === 'result' && targetCells.has(idx) && !selectedCells.has(idx) ? '✗' : ''}
            </button>
          ))}
        </div>

        <button onClick={onCancel} className="mt-4 text-gray-500 text-xs w-full text-center hover:text-gray-300">Skip</button>
      </div>
    </div>
  );
}

// ====== WORD SCRAMBLE ======
interface WordScrambleProps {
  difficulty: number;
  onComplete: (score: number) => void;
  onCancel: () => void;
}

const wordLists: Record<string, string[]> = {
  easy: ['cat', 'dog', 'sun', 'hat', 'pen', 'cup', 'box', 'red', 'big', 'run', 'hot', 'map'],
  medium: ['brain', 'chair', 'dance', 'eagle', 'flame', 'grape', 'house', 'juice', 'knife', 'lemon', 'music', 'ocean'],
  hard: ['bridge', 'castle', 'dragon', 'frozen', 'garden', 'heaven', 'island', 'jungle', 'knight', 'planet', 'rocket', 'silver'],
};

export function WordScramble({ difficulty, onComplete, onCancel }: WordScrambleProps) {
  const wordDifficulty = difficulty < 4 ? 'easy' : difficulty < 7 ? 'medium' : 'hard';
  const [words] = useState(() => {
    const pool = wordLists[wordDifficulty];
    const selected: string[] = [];
    const used = new Set<number>();
    while (selected.length < 4) {
      const idx = Math.floor(Math.random() * pool.length);
      if (!used.has(idx)) {
        used.add(idx);
        selected.push(pool[idx]);
      }
    }
    return selected;
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambled, setScrambled] = useState(() => scrambleWord(words[0]));
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [currentIdx]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(Math.round((score / words.length) * 100));
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, score, words.length, onComplete]);

  const handleSubmit = () => {
    if (input.toLowerCase().trim() === words[currentIdx]) {
      setScore(s => s + 1);
      setFeedback('✓ Correct!');
    } else {
      setFeedback(`✗ It was "${words[currentIdx]}"`);
    }

    setTimeout(() => {
      if (currentIdx < words.length - 1) {
        const next = currentIdx + 1;
        setCurrentIdx(next);
        setScrambled(scrambleWord(words[next]));
        setInput('');
        setFeedback(null);
      } else {
        const finalScore = input.toLowerCase().trim() === words[currentIdx] ? score + 1 : score;
        onComplete(Math.round((finalScore / words.length) * 100));
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-orange-400 font-bold text-sm">📝 Word Scramble</span>
          <span className="text-gray-400 text-sm">{currentIdx + 1}/{words.length}</span>
          <span className={`font-bold text-sm ${timeLeft <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>⏱ {timeLeft}s</span>
        </div>

        <p className="text-gray-300 text-center text-sm mb-2">Unscramble the word:</p>
        <p className="text-white text-3xl font-bold text-center mb-6 tracking-widest font-mono">{scrambled}</p>

        {feedback && (
          <p className={`text-center font-bold mb-3 ${feedback.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{feedback}</p>
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            disabled={feedback !== null}
            placeholder="Your answer..."
            className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600"
            autoComplete="off"
          />
          <button
            onClick={handleSubmit}
            disabled={feedback !== null || !input.trim()}
            className="bg-orange-500 text-white px-4 rounded-xl font-bold hover:bg-orange-400 active:scale-95 transition-all disabled:opacity-50"
          >
            ✓
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-3">Score: {score}/{currentIdx + (feedback ? 1 : 0)}</p>
        <button onClick={onCancel} className="mt-3 text-gray-500 text-xs w-full text-center hover:text-gray-300">Skip</button>
      </div>
    </div>
  );
}

function scrambleWord(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const scrambled = arr.join('');
  if (scrambled === word) {
    // Just reverse if scramble matches
    return word.split('').reverse().join('');
  }
  return scrambled;
}

// ====== REACTION TIME ======
interface ReactionTestProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
}

export function ReactionTest({ onComplete, onCancel }: ReactionTestProps) {
  const [phase, setPhase] = useState<'wait' | 'ready' | 'click' | 'result' | 'too-early'>('wait');
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const totalRounds = 3;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const startRound = useCallback(() => {
    setPhase('ready');
    const delay = 1000 + Math.random() * 4000;
    timerRef.current = setTimeout(() => {
      setPhase('click');
      setStartTime(Date.now());
    }, delay);
  }, []);

  useEffect(() => {
    startRound();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [startRound]);

  const handleClick = () => {
    if (phase === 'ready') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase('too-early');
      setTimeout(() => {
        if (round < totalRounds - 1) {
          setRound(r => r + 1);
          setResults(prev => [...prev, 1000]);
          startRound();
        } else {
          const finalResults = [...results, 1000];
          const avg = finalResults.reduce((a, b) => a + b, 0) / finalResults.length;
          const score = Math.max(0, Math.min(100, Math.round(100 - (avg - 150) / 5)));
          onComplete(score);
        }
      }, 1000);
      return;
    }

    if (phase === 'click') {
      const reactionTime = Date.now() - startTime;
      setPhase('result');
      const newResults = [...results, reactionTime];
      setResults(newResults);

      setTimeout(() => {
        if (round < totalRounds - 1) {
          setRound(r => r + 1);
          startRound();
        } else {
          const avg = newResults.reduce((a, b) => a + b, 0) / newResults.length;
          const score = Math.max(0, Math.min(100, Math.round(100 - (avg - 150) / 5)));
          onComplete(score);
        }
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-cyan-400 font-bold text-sm">⚡ Reaction Test</span>
          <span className="text-gray-400 text-sm">Round {round + 1}/{totalRounds}</span>
        </div>

        <button
          onClick={handleClick}
          className={`w-full aspect-video rounded-xl flex items-center justify-center transition-all text-xl font-bold ${
            phase === 'wait' || phase === 'ready' ? 'bg-red-500 text-white' :
            phase === 'click' ? 'bg-green-500 text-white animate-pulse' :
            phase === 'too-early' ? 'bg-yellow-500 text-black' :
            'bg-blue-500 text-white'
          }`}
        >
          {phase === 'wait' || phase === 'ready' ? 'Wait for green...' :
           phase === 'click' ? 'CLICK NOW!' :
           phase === 'too-early' ? 'Too early! 😅' :
           `${results[results.length - 1]}ms`}
        </button>

        {results.length > 0 && (
          <div className="mt-4 flex gap-2 justify-center">
            {results.map((r, i) => (
              <span key={i} className={`text-sm font-mono ${r >= 1000 ? 'text-red-400' : r < 250 ? 'text-green-400' : 'text-yellow-400'}`}>
                {r >= 1000 ? 'FAIL' : `${r}ms`}
              </span>
            ))}
          </div>
        )}

        <button onClick={onCancel} className="mt-4 text-gray-500 text-xs w-full text-center hover:text-gray-300">Skip</button>
      </div>
    </div>
  );
}

// ====== WORK TASK: CLICK SPEED ======
interface ClickSpeedProps {
  duration: number;
  target: number;
  onComplete: (score: number) => void;
  onCancel: () => void;
  title: string;
  icon: string;
}

export function ClickSpeed({ duration, target, onComplete, onCancel, title, icon }: ClickSpeedProps) {
  const clicksRef = useRef(0);
  const [displayClicks, setDisplayClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Use an animation frame loop to sync display with ref
  useEffect(() => {
    const update = () => {
      setDisplayClicks(clicksRef.current);
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Separate timer that doesn't depend on clicks at all
  useEffect(() => {
    if (!started || done) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setDone(true);
          const score = Math.min(100, Math.round((clicksRef.current / target) * 100));
          setTimeout(() => onComplete(score), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, done, target, onComplete]);

  const handleClick = () => {
    if (done) return;
    if (!started) setStarted(true);
    clicksRef.current++;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-amber-400 font-bold text-sm">{icon} {title}</span>
          <span className={`font-bold text-sm ${timeLeft <= 3 ? 'text-red-400' : 'text-yellow-400'}`}>⏱ {timeLeft}s</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div className="bg-amber-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (displayClicks / target) * 100)}%` }} />
        </div>

        <p className="text-gray-300 text-center text-sm mb-2">{displayClicks}/{target} {started ? '' : '- Tap to start!'}</p>

        <button
          onClick={handleClick}
          disabled={done}
          className="w-full aspect-square max-h-48 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 active:scale-95 rounded-2xl flex items-center justify-center text-6xl transition-all select-none disabled:opacity-50"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation' }}
        >
          {icon}
        </button>

        <button onClick={onCancel} className="mt-4 text-gray-500 text-xs w-full text-center hover:text-gray-300">Skip Task</button>
      </div>
    </div>
  );
}

// ====== WORK TASK: SORTING/PATTERN ======
interface PatternMatchProps {
  difficulty: number;
  onComplete: (score: number) => void;
  onCancel: () => void;
  title: string;
}

export function PatternMatch({ difficulty, onComplete, onCancel, title }: PatternMatchProps) {
  const [sequences] = useState(() => generatePatterns(difficulty, 4));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAnswer = (ansIdx: number) => {
    if (feedback) return;
    const correct = ansIdx === sequences[currentIdx].correctIdx;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    setFeedback(correct ? '✓ Correct!' : `✗ Answer: ${sequences[currentIdx].answers[sequences[currentIdx].correctIdx]}`);

    setTimeout(() => {
      if (currentIdx < sequences.length - 1) {
        setCurrentIdx(i => i + 1);
        setFeedback(null);
      } else {
        onComplete(Math.round((newScore / sequences.length) * 100));
      }
    }, 1000);
  };

  const seq = sequences[currentIdx];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-indigo-400 font-bold text-sm">🧩 {title}</span>
          <span className="text-gray-400 text-sm">{currentIdx + 1}/{sequences.length}</span>
        </div>

        <p className="text-gray-300 text-center text-sm mb-2">What comes next?</p>
        <p className="text-white text-2xl font-bold text-center mb-4 font-mono">{seq.sequence}</p>

        {feedback && (
          <p className={`text-center font-bold mb-3 ${feedback.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{feedback}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {seq.answers.map((ans, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={feedback !== null}
              className={`py-3 px-4 rounded-xl font-bold text-lg transition-all ${
                feedback === null
                  ? 'bg-gray-700 text-white hover:bg-gray-600 active:scale-95'
                  : idx === seq.correctIdx
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-500'
              }`}
            >
              {ans}
            </button>
          ))}
        </div>

        <button onClick={onCancel} className="mt-4 text-gray-500 text-xs w-full text-center hover:text-gray-300">Skip</button>
      </div>
    </div>
  );
}

function generatePatterns(difficulty: number, count: number) {
  const patterns: { sequence: string; answers: number[]; correctIdx: number }[] = [];
  for (let i = 0; i < count; i++) {
    const step = Math.floor(Math.random() * (2 + difficulty)) + 1;
    const start = Math.floor(Math.random() * 10) + 1;
    const nums: number[] = [];
    for (let j = 0; j < 4; j++) nums.push(start + step * j);
    const answer = start + step * 4;
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = answer + (Math.floor(Math.random() * 10) - 5);
      if (w !== answer) wrongs.add(w);
    }
    const answers = [answer, ...Array.from(wrongs)].sort(() => Math.random() - 0.5);
    patterns.push({
      sequence: nums.join(', ') + ', ?',
      answers,
      correctIdx: answers.indexOf(answer),
    });
  }
  return patterns;
}
