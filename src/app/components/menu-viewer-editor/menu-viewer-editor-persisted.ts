import {Recipe} from '../../models/recipe.model';

const STORAGE_KEY = 'recps.menuEditorState';
const VALIDITY_HOURS = 1;

interface PersistedMenuState {
  menuName: string;
  menuDays: Recipe[][];
  timestamp: number;
}

export function saveToStorage(menuName: string, menuDays: Recipe[][]): void {
  try {
    const payload: PersistedMenuState = {menuName, menuDays, timestamp: Date.now()};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function loadFromStorage(): { menuName: string; menuDays: Recipe[][] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedMenuState;
    if (Date.now() - parsed.timestamp > VALIDITY_HOURS * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {menuName: parsed.menuName, menuDays: parsed.menuDays};
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearFromStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
