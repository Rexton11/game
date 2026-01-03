
export enum GameLevel {
  SPARK = 'Spark',     // Level 1: Mental & Verbal
  WARMUP = 'Warmup',   // Level 2: Physical & Foreplay
  HEAT = 'Heat'        // Level 3: Intensity & Action
}

export enum PreferenceScore {
  YES = 'YES',
  MAYBE = 'MAYBE',
  NO = 'NO'
}

export interface FantasyCard {
  id: string;
  title: string;
  category: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  label: string;
  icon: string;
}

export interface GameCard {
  id: string;
  level: GameLevel;
  instruction: string;
  target: 'Partner A' | 'Partner B' | 'Both';
  duration?: number; // in seconds
  tags?: string[]; // to match against inventory or fantasies
}

export interface UserSession {
  role: 'Partner A' | 'Partner B';
  name: string;
  gender: 'M' | 'F' | 'NB';
  preferences: Record<string, PreferenceScore>;
  inventory: string[];
}

export interface RoomState {
  id: string;
  level: GameLevel;
  activeTurn: 'Partner A' | 'Partner B';
  partnerA?: UserSession;
  partnerB?: UserSession;
  currentCard?: GameCard;
  isSyncing: boolean;
}
