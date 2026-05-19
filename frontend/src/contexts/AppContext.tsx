import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ActiveStoryResponse, Task } from '../types';
import { getActiveStory, getTodayTasks } from '../services/api';

interface AppContextType {
  activeStory: ActiveStoryResponse | null;
  todayTasks: Task[];
  loading: boolean;
  refreshActiveStory: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeStory, setActiveStory] = useState<ActiveStoryResponse | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
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

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([refreshActiveStory(), refreshTasks()]);
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
        loading,
        refreshActiveStory,
        refreshTasks,
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