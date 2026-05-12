import {RecipeSearchResponse} from '../../services/responses';

const STORAGE_KEY = 'recps.menuEditorState';

export interface PersistedMenuState {
  menuName: string;
  menuDays: RecipeSearchResponse[][];
}

export function loadFromStorage(): PersistedMenuState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as PersistedMenuState : null;
  } catch {
    return null;
  }
}

export function saveToStorage(name: string, days: RecipeSearchResponse[][]): void {
  const state: PersistedMenuState = {
  menuName: name,
  menuDays: days,
};
try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
} catch { /* ignore */ }
}
