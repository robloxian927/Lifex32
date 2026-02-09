import type { GameState } from './gameState';

export interface SaveSlot {
  id: number;
  name: string;
  age: number;
  money: number;
  timestamp: number;
  occupied: boolean;
  state: GameState | null;
}

const SAVE_KEY = 'life32_saves';
const MAX_SLOTS = 5;

function getEmptySlot(id: number): SaveSlot {
  return { id, name: '', age: 0, money: 0, timestamp: 0, occupied: false, state: null };
}

export function getAllSlots(): SaveSlot[] {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return Array.from({ length: MAX_SLOTS }, (_, i) => getEmptySlot(i));
    const parsed = JSON.parse(raw) as SaveSlot[];
    // Ensure we always have exactly 5 slots
    const slots: SaveSlot[] = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      slots.push(parsed[i] && parsed[i].occupied ? parsed[i] : getEmptySlot(i));
    }
    return slots;
  } catch {
    return Array.from({ length: MAX_SLOTS }, (_, i) => getEmptySlot(i));
  }
}

export function saveGame(slotId: number, state: GameState): boolean {
  try {
    const slots = getAllSlots();
    if (slotId < 0 || slotId >= MAX_SLOTS) return false;

    // Strip transient UI state before saving
    const cleanState: GameState = {
      ...state,
      currentEvent: null,
      notifications: [],
      activeMiniGame: null,
      activeTab: 'life',
    };

    slots[slotId] = {
      id: slotId,
      name: `${state.firstName} ${state.lastName}`,
      age: state.age,
      money: state.money,
      timestamp: Date.now(),
      occupied: true,
      state: cleanState,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(slots));
    return true;
  } catch {
    return false;
  }
}

export function loadGame(slotId: number): GameState | null {
  try {
    const slots = getAllSlots();
    if (slotId < 0 || slotId >= MAX_SLOTS) return null;
    const slot = slots[slotId];
    if (!slot.occupied || !slot.state) return null;
    return { ...slot.state, screen: 'game', activeTab: 'life', notifications: [], currentEvent: null, activeMiniGame: null };
  } catch {
    return null;
  }
}

export function deleteSlot(slotId: number): boolean {
  try {
    const slots = getAllSlots();
    if (slotId < 0 || slotId >= MAX_SLOTS) return false;
    slots[slotId] = getEmptySlot(slotId);
    localStorage.setItem(SAVE_KEY, JSON.stringify(slots));
    return true;
  } catch {
    return false;
  }
}

export function formatSaveDate(timestamp: number): string {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

export function hasSaves(): boolean {
  return getAllSlots().some(s => s.occupied);
}
