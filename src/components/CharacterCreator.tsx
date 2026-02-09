import { useState } from 'react';
import { maleNames, femaleNames, lastNames, countries, randomFromArray } from '../gameData';

interface CharacterCreatorProps {
  onCreateCharacter: (firstName: string, lastName: string, gender: 'male' | 'female', country: string) => void;
}

export function CharacterCreator({ onCreateCharacter }: CharacterCreatorProps) {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [firstName, setFirstName] = useState(() => randomFromArray(maleNames));
  const [lastName, setLastName] = useState(() => randomFromArray(lastNames));
  const [country, setCountry] = useState(() => randomFromArray(countries));

  const randomize = () => {
    const g = Math.random() > 0.5 ? 'male' : 'female' as const;
    setGender(g);
    setFirstName(randomFromArray(g === 'male' ? maleNames : femaleNames));
    setLastName(randomFromArray(lastNames));
    setCountry(randomFromArray(countries));
  };

  const handleGenderChange = (g: 'male' | 'female') => {
    setGender(g);
    setFirstName(randomFromArray(g === 'male' ? maleNames : femaleNames));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-black text-white text-center mb-6">🧬 Create Your Life</h2>
        
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 space-y-5">
          {/* Gender */}
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleGenderChange('male')}
                className={`py-3 rounded-xl font-bold text-lg transition-all ${
                  gender === 'male'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                👨 Male
              </button>
              <button
                onClick={() => handleGenderChange('female')}
                className={`py-3 rounded-xl font-bold text-lg transition-all ${
                  gender === 'female'
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                👩 Female
              </button>
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600"
            >
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={randomize}
              className="flex-1 bg-gray-600 text-white font-bold py-3 rounded-xl hover:bg-gray-500 active:scale-95 transition-all"
            >
              🎲 Random
            </button>
            <button
              onClick={() => onCreateCharacter(firstName, lastName, gender, country)}
              className="flex-2 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-400 active:scale-95 transition-all flex-grow"
            >
              🌱 Start Life
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
