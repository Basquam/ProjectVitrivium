export enum BeatType {
  INTRO = 'intro',
  CHALLENGE = 'challenge',
  VICTORY = 'victory',
  PLOT_TWIST = 'plot_twist',
  FINALE = 'finale'
}

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export interface StoryBeat {
  type: BeatType;
  title: string;
  text: string;
  image_url?: string;
  villain_name?: string;
  reward_points: number;
  reward_badge?: string;
}

export interface StoryAct {
  act_number: number;
  title: string;
  beats: StoryBeat[];
}

export interface Story {
  id: string;
  title: string;
  description: string;
  theme: string;
  total_acts: number;
  acts: StoryAct[];
  total_points: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  story_id: string;
  story_title: string;
  current_act: number;
  current_beat: number;
  tasks_completed: number;
  total_points: number;
  rewards_earned: string[];
  started_at: string;
  completed_at?: string;
  is_active: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: TaskStatus;
  story_id?: string;
  due_date: string;
  created_at: string;
  completed_at?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  category?: string;
  due_date?: string;
}

export interface ActiveStoryResponse {
  has_active_story: boolean;
  progress?: UserProgress;
  story?: Story;
  current_beat?: StoryBeat;
  progress_percentage?: number;
}

export interface TaskCompleteResponse {
  task: Task;
  victory?: {
    points_earned: number;
    badge_earned?: string;
    victory_text: string;
  };
  story_advancement?: {
    story_completed: boolean;
    new_beat?: StoryBeat;
    progress?: UserProgress;
    message?: string;
    final_score?: number;
  };
  message: string;
}