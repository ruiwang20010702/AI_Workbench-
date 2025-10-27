import { Request, Response } from 'express';
import { TaskModel } from '../models/Task';

// 状态/优先级中英文映射（模块级复用）
const mapTaskStatus = (value?: string): '待办' | '进行中' | '已完成' | '已取消' | undefined => {
  switch (value) {
    case 'todo':
    case 'pending':
      return '待办';
    case 'in_progress':
      return '进行中';
    case 'completed':
      return '已完成';
    case 'cancelled':
      return '已取消';
    case '待办':
    case '进行中':
    case '已完成':
    case '已取消':
      return value as any;
    default:
      return undefined;
  }
};

const mapTaskPriority = (value?: string): '低' | '中' | '高' | undefined => {
  switch (value) {
    case 'low':
      return '低';
    case 'medium':
      return '中';
    case 'high':
      return '高';
    case '低':
    case '中':
    case '高':
      return value as any;
    default:
      return undefined;
  }
};
import { ProjectMemberModel } from '../models/ProjectMember';

// 获取任务列表
export const getTasks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      assignee_id,
      search,
      tags,
      due_date_start,
      due_date_end
    } = req.query;

    // 兼容两种路由：/projects/:project_id/tasks 和 /tasks?project_id=...
    const projectId = (req.params as any)?.project_id || (req.query as any)?.project_id;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    // 仅使用模型允许的过滤字段
    const commonFilters: any = {
      status: status as string,
      priority: priority as string,
      assignee_id: assignee_id as string,
      search: search as string,
      tags: tags ? String(tags).split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      limit: limitNum,
      offset,
    };

    let tasks;
    // 校验projectId为UUID格式，避免数据库层报错
    if (projectId && !/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/.test(String(projectId))) {
      return res.status(400).json({ error: 'Invalid project_id format. Expect UUID.' });
    }
    if (projectId) {
      // 个人工作台模式：跳过权限检查
      // const isMember = await ProjectMemberModel.checkMembership(projectId as string, userId);
      // if (!isMember) {
      //   return res.status(403).json({ error: 'Access denied' });
      // }
      tasks = await TaskModel.findByProjectId(projectId as string, userId, commonFilters);
    } else {
      const userFilters = { ...commonFilters, project_id: projectId as string };
      tasks = await TaskModel.findByUserId(userId, userFilters);
    }

    return res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    const message = (error as any)?.message || 'Internal server error';
    return res.status(500).json({ error: 'Internal server error', detail: message });
  }
};

// 获取单个任务详情
export const getTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const task = await TaskModel.findById(id as string, userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // 个人工作台模式：跳过权限检查
    // const isMember = await ProjectMemberModel.checkMembership(task.project_id, userId);
    // if (!isMember) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    return res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 创建新任务
export const createTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      title, 
      description, 
      project_id, 
      assignee_id, 
      status, 
      priority, 
      start_date, 
      due_date,
      tags,
      estimated_hours
    } = req.body;

    if (!title || !project_id) {
      return res.status(400).json({ error: 'Title and project_id are required' });
    }

    // 个人工作台模式：跳过权限检查
    // const hasPermission = await ProjectMemberModel.checkPermission(project_id, userId, 'create_task');
    // if (!hasPermission) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }


    // 兼容 tags 为数组或逗号分隔字符串
    const tagsArray = Array.isArray(tags)
      ? (tags as string[]).map((t) => t.trim()).filter(Boolean)
      : typeof tags === 'string'
        ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : [];

    const taskData = {
      title,
      description,
      project_id,
      assignee_id,
      creator_id: userId,
      status: mapTaskStatus(status) ?? '待办',
      priority: mapTaskPriority(priority) ?? '中',
      start_date,
      due_date,
      tags: tagsArray,
      estimated_hours
    };

    const task = await TaskModel.create(taskData);
    return res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 更新任务
export const updateTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const task = await TaskModel.findById(id as string, userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // 个人工作台模式：跳过权限检查，允许修改所有任务
    // const hasPermission = await ProjectMemberModel.checkPermission(task.project_id, userId, 'edit_task');
    // const isAssignee = task.assignee_id === userId;
    // const isCreator = task.creator_id === userId;

    // if (!hasPermission && !isAssignee && !isCreator) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    const { 
      title, 
      description, 
      assignee_id, 
      status, 
      priority, 
      start_date, 
      due_date,
      tags,
      estimated_hours,
      actual_hours
    } = req.body;

    // 兼容 tags 为数组或逗号分隔字符串；允许 undefined 表示不更新
    const updateTags =
      tags === undefined
        ? undefined
        : Array.isArray(tags)
          ? (tags as string[]).map((t) => t.trim()).filter(Boolean)
          : typeof tags === 'string'
            ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
            : [];

    // exactOptionalPropertyTypes 为 true 时，不能显式传入 undefined。
    // 仅在值不为 undefined 时才加入对应字段。
    const updateData = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(assignee_id !== undefined ? { assignee_id } : {}),
      ...(status !== undefined ? { status: mapTaskStatus(status) } : {}),
      ...(priority !== undefined ? { priority: mapTaskPriority(priority) } : {}),
      ...(start_date !== undefined ? { start_date } : {}),
      ...(due_date !== undefined ? { due_date } : {}),
      ...(updateTags !== undefined ? { tags: updateTags } : {}),
      ...(estimated_hours !== undefined ? { estimated_hours } : {}),
      ...(actual_hours !== undefined ? { actual_hours } : {}),
    } as import('../models/Task').UpdateTaskData;

    const updatedTask = await TaskModel.update(id as string, updateData, userId);
    return res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 删除任务
export const deleteTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const task = await TaskModel.findById(id as string, userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // 个人工作台模式：跳过权限检查，允许删除所有任务
    // const hasPermission = await ProjectMemberModel.checkPermission(task.project_id, userId, 'delete_task');
    // const isCreator = task.creator_id === userId;

    // if (!hasPermission && !isCreator) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    const success = await TaskModel.delete(id as string, userId);
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 获取任务统计信息
export const getTaskStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { project_id } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let stats;
    if (project_id) {
      // 检查用户是否有权限访问该项目
      const isMember = await ProjectMemberModel.checkMembership(project_id as string, userId);
      if (!isMember) {
        return res.status(403).json({ error: 'Access denied' });
      }
      stats = await TaskModel.getStatistics(userId, project_id as string);
    } else {
      stats = await TaskModel.getStatistics(userId);
    }

    return res.json(stats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 获取任务标签
export const getTaskTags = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { project_id } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let tags;
    if (project_id) {
      // 检查用户是否有权限访问该项目
      const isMember = await ProjectMemberModel.checkMembership(project_id as string, userId);
      if (!isMember) {
        return res.status(403).json({ error: 'Access denied' });
      }
      tags = await TaskModel.getTagsByProject(project_id as string, userId);
    } else {
      tags = await TaskModel.getTags(userId);
    }

    return res.json(tags);
  } catch (error) {
    console.error('Error fetching task tags:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 批量更新任务状态
export const batchUpdateTaskStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { task_ids, status } = req.body;

    if (!task_ids || !Array.isArray(task_ids) || !status) {
      return res.status(400).json({ error: 'task_ids (array) and status are required' });
    }

    // 检查所有任务的权限
    for (const taskId of task_ids) {
      const task = await TaskModel.findById(taskId, userId);
      if (!task) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
      }

      const hasPermission = await ProjectMemberModel.checkPermission(task.project_id, userId, 'edit_task');
      const isAssignee = task.assignee_id === userId;
      const isCreator = task.creator_id === userId;

      if (!hasPermission && !isAssignee && !isCreator) {
        return res.status(403).json({ error: `Access denied for task ${taskId}` });
      }
    }

    const result = await TaskModel.batchUpdateStatus(task_ids, status, userId);
    return res.json({ message: 'Tasks updated successfully', updated_count: result.length });
  } catch (error) {
    console.error('Error batch updating tasks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};