import { apiClient } from './apiClient';

// 导入Task接口
export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  assignee_id?: string;
  creator_id: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled' | 'pending';
  priority: 'low' | 'medium' | 'high';
  start_date?: string;
  due_date?: string;
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  // 扩展属性 - 用于组件显示
  project_name?: string;
  assignee_name?: string;
  // 关联信息
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  todo_tasks: number;
  overdue_tasks: number;
  high_priority_tasks: number;
  medium_priority_tasks: number;
  low_priority_tasks: number;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignee_id?: string;
  project_id?: string;
  due_date_start?: string;
  due_date_end?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaskResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  project_id: string;
  assignee_id?: string;
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled' | 'pending';
  priority?: 'low' | 'medium' | 'high';
  start_date?: string;
  due_date?: string;
  tags?: string[];
  estimated_hours?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assignee_id?: string;
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled' | 'pending';
  priority?: 'low' | 'medium' | 'high';
  start_date?: string;
  due_date?: string;
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
}

// 获取任务列表
export const getTasks = async (filters: TaskFilters = {}): Promise<TaskResponse> => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/tasks?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('获取任务列表失败:', error);
    throw error;
  }
};

// 获取任务统计信息
export const getTaskStats = async (): Promise<TaskStats> => {
  try {
    const response = await apiClient.get('/tasks/stats');
    return response.data;
  } catch (error) {
    console.error('获取任务统计失败:', error);
    throw error;
  }
};

// 创建任务
export const createTask = async (taskData: CreateTaskRequest): Promise<Task> => {
  try {
    const response = await apiClient.post(`/projects/${taskData.project_id}/tasks`, taskData);
    return response.data;
  } catch (error) {
    console.error('创建任务失败:', error);
    throw error;
  }
};

// 更新任务
export const updateTask = async (taskId: string, taskData: UpdateTaskRequest): Promise<Task> => {
  try {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error('更新任务失败:', error);
    throw error;
  }
};

// 删除任务
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await apiClient.delete(`/tasks/${taskId}`);
  } catch (error) {
    console.error('删除任务失败:', error);
    throw error;
  }
};

// 获取单个任务详情
export const getTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('获取任务详情失败:', error);
    throw error;
  }
};

// 批量更新任务状态
export const batchUpdateTaskStatus = async (taskIds: string[], status: string): Promise<void> => {
  try {
    await apiClient.put('/tasks/batch-status', { task_ids: taskIds, status });
  } catch (error) {
    console.error('批量更新任务状态失败:', error);
    throw error;
  }
};

// 获取项目的任务列表
export const getProjectTasks = async (projectId: string, filters: TaskFilters = {}): Promise<TaskResponse> => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/projects/${projectId}/tasks?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('获取项目任务列表失败:', error);
    throw error;
  }
};

export default {
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask,
  getTask,
  batchUpdateTaskStatus,
  getProjectTasks,
};