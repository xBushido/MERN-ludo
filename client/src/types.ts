export interface Token {
  id: string;
  color: string;
  position: number;
}

export interface GamePlayer {
  username: string;
  color: string;
  socketid: string;
  tokens: Token[];
  finished: boolean;
  rank: number | null;
  disconnected: boolean;
}

export interface GameState {
  gameId: string;
  players: GamePlayer[];
  currentTurn: string;
  diceValue: number | null;
  isDiceRolled: boolean;
  status: "playing" | "finished";
  rankings: string[];
  timer: ReturnType<typeof setTimeout> | null;
}
