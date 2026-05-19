import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ActiveStoryResponse, Task, UserStreak } from '../types';
import { getActiveStory, getTodayTasks, getStreak } from '../services/api';

interface AppContextType {
  activeStory: ActiveStoryResponse | null;
  todayTasks: Task[];
  streak: UserStreak | null;
  loading: boolean;
  refreshActiveStory: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshStreak: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeStory, setActiveStory] = useState<ActiveStoryResponse | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshActiveStory = async () => {
    try {
      const data = await getActiveStory();
      setActiveStory(data);
    } catch (error) {
      console.error('Error fetching active story:', error);
    }
  };

  const refreshTasks = async () => {
    try {
      const tasks = await getTodayTasks();
      setTodayTasks(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const refreshStreak = async () => {
    try {
      const data = await getStreak();
      setStreak(data);
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([refreshActiveStory(), refreshTasks(), refreshStreak()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeStory,
        todayTasks,
        streak,
        loading,
        refreshActiveStory,
        refreshTasks,
        refreshStreak,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
