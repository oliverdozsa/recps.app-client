import {RecipeSearchResponse} from '../../services/responses';

const STORAGE_KEY = 'recps.menuEditorState';
const VALIDITY_HOURS = 1;

export interface PersistedMenuState {
  menuName: string;
  menuDays: RecipeSearchResponse[][];
  timestamp: number;
}

export function loadFromStorage(): PersistedMenuState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;

    const parsed = JSON.parse(raw) as PersistedMenuState;
    const now = Date.now();
    const validityMillis = VALIDITY_HOURS * 1000 * 60 * 60;
    if (now - parsed.timestamp > validityMillis) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveToStorage(name: string, days: RecipeSearchResponse[][]): void {
  const state: PersistedMenuState = {
    menuName: name,
    menuDays: days,
    timestamp: Date.now()
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */
  }
}

export function clearFromStorage() {
  localStorage.removeItem(STORAGE_KEY);
}
