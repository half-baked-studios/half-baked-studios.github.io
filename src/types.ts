export interface Commit {
  id: string;
  message: string;
  timestamp: string;
  author: string;
  type: 'feat' | 'fix' | 'refactor' | 'break' | 'short';
}

export interface SkillStat {
  name: string;
  value: number; // 0-100
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string; // custom emoji or short representation
  bio: string;
  quote: string;
  stack: string[];
  skills: SkillStat[];
  status: string;
}

export interface BreadboardPin {
  id: number;
  label: string;
  type: 'digital' | 'analog' | 'power' | 'ground';
  connected: boolean;
  state: 'HIGH' | 'LOW' | 'OPEN';
}
