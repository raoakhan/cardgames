export interface Room {
  id: number;
  room_id: string;
  name: string;
  game_type: string;
  created_at: string;
  is_active: boolean;
  players: Player[];
}

export interface Player {
  id: number;
  user?: User;
  guest_name?: string;
  room: number;
  seat_position: number;
  is_host: boolean;
  is_bot: boolean;
  display_name: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface GameSession {
  id: number;
  room: Room;
  game_state: any;
  current_turn: Player;
  started_at: string;
  updated_at: string;
  is_complete: boolean;
}

export interface GameAction {
  id: number;
  game: number;
  player: Player;
  action_type: string;
  action_data: any;
  timestamp: string;
}

export interface ChatMessage {
  message: string;
  sender: string;
  sender_id: number | null;
  timestamp: string;
}
