import axios from 'axios';
import { Story, Task, TaskCreate, ActiveStoryResponse, TaskCompleteResponse } from '../types';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Story APIs
export const getStories = async (): Promise<Story[]> => {
  const response = await api.get('/stories');
  return response.data;
};

export const startStory = async (storyId: string) => {
  const response = await api.post('/stories/start', { story_id: storyId });
  return response.data;
};

export const getActiveStory = async (): Promise<ActiveStoryResponse> => {
  const response = await api.get('/stories/progress/active');
  return response.data;
};

// Task APIs
export const createTask = async (task: TaskCreate): Promise<Task> => {
  const response = await api.post('/tasks', task);
  return response.data;
};

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const getTodayTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks/today');
  return response.data;
};

export const completeTask = async (taskId: string): Promise<TaskCompleteResponse> => {
  const response = await api.put(`/tasks/${taskId}/complete`);
  return response.data;
};

export const deleteTask = async (taskId: string) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

// Stats APIs
export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const getAchievements = async () => {
  const response = await api.get('/achievements');
  return response.data;
};

export default api;