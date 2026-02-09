import { useState } from 'react';
import { CharacterCreator } from './components/CharacterCreator';
import { GameScreen } from './components/GameScreen';
import { createCharacter, type GameState } from './gameState';
import { randomFromArray, generateFullName, countries } from './gameData';
import { getAllSlots, loadGame, hasSaves, formatSaveDate } from './saveSystem';

type Screen = 'title' | 'create' | 'game' | 'load';

export function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleCreateCharacter = (firstName: string, lastName: string, gender: 'male' | 'female', country: string) => {
    const state = createCharacter(firstName, lastName, gender, country);
    setGameState(state);
    setScreen('game');
  };

  const handleRandomLife = () => {
    const gender = Math.random() > 0.5 ? 'male' : 'female' as const;
    const name = generateFullName(gender);
    const country = randomFromArray(countries);
    const state = createCharacter(name.first, name.last, gender, country);
    setGameState(state);
    setScreen('game');
  };

  if (screen === 'title') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-700 via-teal-600 to-cyan-700 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce">🧬</div>
          <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-lg">Life 32</h1>
          <p className="text-xl text-emerald-100 mt-2 font-medium">Life Simulator</p>
          <p className="text-sm text-emerald-200 mt-1">✨ All Features Free • No P2W ✨</p>
        </div>

        <div className="space-y-3 w-full max-w-xs">
          <button onClick={() => setScreen('create')}
            className="w-full bg-white text-emerald-700 font-bold text-lg py-4 px-8 rounded-2xl shadow-lg hover:bg-emerald-50 active:scale-95 transition-all">
            🌱 New Life
          </button>
          <button onClick={handleRandomLife}
            className="w-full bg-emerald-800/40 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg hover:bg-emerald-800/60 active:scale-95 transition-all border border-emerald-400/30">
            🎲 Random Life
          </button>
          {hasSaves() && (
            <button onClick={() => setScreen('load')}
              className="w-full bg-blue-600/40 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg hover:bg-blue-600/60 active:scale-95 transition-all border border-blue-400/30">
              📂 Load Game
            </button>
          )}
        </div>

        <div className="mt-8 bg-white/10 rounded-2xl p-4 max-w-xs w-full backdrop-blur-sm">
          <h3 className="text-white font-bold text-sm mb-2 text-center">🎮 What's New</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-emerald-100">
            <div className="flex items-center gap-1">🏠 Pay Rent & Bills</div>
            <div className="flex items-center gap-1">🏢 Start a Business</div>
            <div className="flex items-center gap-1">📈 Invest Money</div>
            <div className="flex items-center gap-1">🎓 College Social Life</div>
            <div className="flex items-center gap-1">🤖 AI Friends</div>
            <div className="flex items-center gap-1">💼 Job Minigames</div>
            <div className="flex items-center gap-1">🏫 School System</div>
            <div className="flex items-center gap-1">🏖️ Retire & Age 60+</div>
          </div>
        </div>

        <div className="mt-6 text-emerald-200 text-xs text-center">
          <p>All features unlocked. No ads. No microtransactions.</p>
        </div>
      </div>
    );
  }

  if (screen === 'create') {
    return <CharacterCreator onCreateCharacter={handleCreateCharacter} />;
  }

  if (screen === 'load') {
    const slots = getAllSlots();
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-black text-white text-center mb-6">📂 Load Game</h2>
          <div className="space-y-3">
            {slots.map(slot => (
              <div key={slot.id} className={`bg-gray-800 rounded-2xl p-4 border ${slot.occupied ? 'border-blue-500/30' : 'border-gray-700'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{slot.occupied ? '📁' : '📂'}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold">Slot {slot.id + 1}</p>
                    {slot.occupied ? (
                      <p className="text-gray-400 text-sm">{slot.name} • Age {slot.age} • ${slot.money.toLocaleString()} • {formatSaveDate(slot.timestamp)}</p>
                    ) : (
                      <p className="text-gray-500 text-sm">Empty</p>
                    )}
                  </div>
                  {slot.occupied && (
                    <button onClick={() => {
                      const loaded = loadGame(slot.id);
                      if (loaded) { setGameState(loaded); setScreen('game'); }
                    }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-400 active:scale-95 transition-all">
                      Load
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setScreen('title')}
            className="w-full mt-4 bg-gray-700 text-gray-300 py-3 rounded-2xl font-bold hover:bg-gray-600 active:scale-95 transition-all">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'game' && gameState) {
    return <GameScreen initialState={gameState} />;
  }

  return null;
}
