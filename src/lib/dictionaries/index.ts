import type { DictionaryResult } from '../../types/tooltip';
import { lookUpCambridge } from './cambridge';

export interface DictionaryInfo {
  id: string;
  /** Key of the dictionary's display name in _locales. */
  nameKey: string;
  lookUp: (word: string) => Promise<DictionaryResult[]>;
}

export const availableDictionaries: DictionaryInfo[] = [
  { id: 'enes_cambridge', nameKey: 'dictionaryCambridgeEnEs', lookUp: lookUpCambridge },
];

export const dictionaryById = (id: string): DictionaryInfo | undefined =>
  availableDictionaries.find((dictionary) => dictionary.id === id);
