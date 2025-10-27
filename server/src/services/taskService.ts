import { TaskModel, TaskData as ModelTaskData, CreateTaskData as ModelCreateTaskData, UpdateTaskData as ModelUpdateTaskData } from '../models/Task';
import { ProjectMemberModel } from '../models/ProjectMember';

// 英文到中文的状态/优先级映射
type EnglishTaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled' | 'pending';
type EnglishTaskPriority = 'low' | 'medium' | 'high';

const mapTaskStatus = (value?: EnglishTaskStatus | ModelCreateTaskData['status']): ModelCreateTaskData['status'] | undefined => {
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
      return value;
    default:
      return undefined;
  }
};

const mapTaskPriority = (value?: EnglishTaskPriority | ModelCreateTaskData['priority']): ModelCreateTaskData['priority'] | undefined => {
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
      return value;
    default:
      return undefined;
  }
};

// Service 入参类型，兼容英文与中文枚举
export type ServiceCreateTaskData = Omit<ModelCreateTaskData, 'status' | 'priority'> & {
  status?: EnglishTaskStatus | ModelCreateTaskData['status'];
  priority?: EnglishTaskPriority | ModelCreateTaskData['priority'];
};

export type ServiceUpdateTaskData = Omit<ModelUpdateTaskData, 'status' | 'priority'> & {
  status?: EnglishTaskStatus | ModelUpdateTaskData['status'];
  priority?: EnglishTaskPriority | ModelUpdateTaskData['priority'];
};

export class TaskService {
  // 创建任务
  static async createTask(taskData: ServiceCreateTaskData): Promise<ModelTaskData> {
    // 个人工作台模式：跳过权限检查
    // const hasPermission = await ProjectMemberModel.checkPermission(
    //   taskData.project_id,
    //   taskData.creator_id,
    //   'create_task'
    // );

    // if (!hasPermission) {
    //   throw new Error('没有权限在该项目中创建任务');
    // }

    const payload: ModelCreateTaskData = {
      ...taskData,
      status: mapTaskStatus(taskData.status) ?? '待办',
      priority: mapTaskPriority(taskData.priority) ?? '中'
    };

    return await TaskModel.create(payload);
  }

  // 更新任务
  static async updateTask(taskId: string, taskData: ModelUpdateTaskData, userId: string): Promise<ModelTaskData> {
    // 个人工作台模式：跳过权限检查
    // const task = await TaskModel.findById(taskId, userId);
    // if (!task) {
    //   throw new Error('任务不存在');
    // }

    // const hasPermission = await ProjectMemberModel.checkPermission(
    //   task.project_id,
    //   userId,
    //   'edit_task'
    // );

    // if (!hasPermission && task.creator_id !== userId && task.assignee_id !== userId) {
    //   throw new Error('没有权限编辑该任务');
    // }

    const updated = await TaskModel.update(taskId, taskData, userId);
    if (!updated) {
      throw new Error('任务不存在或更新失败');
    }
    return updated;
  }

  // 删除任务
  static async deleteTask(taskId: string, userId: string): Promise<boolean> {
    // 获取任务信息
    const task = await TaskModel.findById(taskId, userId);
    if (!task) {
      throw new Error('任务不存在');
    }

    // 验证用户是否有权限删除该任务
    const hasPermission = await ProjectMemberModel.checkPermission(
      task.project_id,
      userId,
      'delete_task'
    );

    if (!hasPermission && task.creator_id !== userId) {
      throw new Error('没有权限删除该任务');
    }

    return await TaskModel.delete(taskId, userId);
  }

  // 获取项目任务列表
  static async getProjectTasks(projectId: string, userId: string): Promise<ModelTaskData[]> {
    // 个人工作台模式：跳过权限检查
    // const isMember = await ProjectMemberModel.checkMembership(projectId, userId);
    // if (!isMember) {
    //   throw new Error('没有权限查看该项目的任务');
    // }

    return await TaskModel.findByProjectId(projectId, userId);
  }

  // 获取用户任务列表
  static async getUserTasks(userId: string): Promise<ModelTaskData[]> {
    return await TaskModel.findByUserId(userId);
  }

  // 批量更新任务状态
  static async batchUpdateTaskStatus(taskIds: string[], status: EnglishTaskStatus | ModelUpdateTaskData['status'], userId: string): Promise<boolean> {
    // 个人工作台模式：跳过权限检查
    // for (const taskId of taskIds) {
    //   const task = await TaskModel.findById(taskId, userId);
    //   if (!task) {
    //     throw new Error(`任务 ${taskId} 不存在`);
    //   }

    //   const hasPermission = await ProjectMemberModel.checkPermission(
    //     task.project_id,
    //     userId,
    //     'edit_task'
    //   );

    //   if (!hasPermission && task.creator_id !== userId && task.assignee_id !== userId) {
    //     throw new Error(`没有权限编辑任务 ${taskId}`);
    //   }
    // }

    await TaskModel.batchUpdateStatus(taskIds, mapTaskStatus(status) ?? '待办', userId);
    return true;
  }

  // 获取项目任务统计
  static async getProjectTaskStats(projectId: string, userId: string): Promise<any> {
    // 个人工作台模式：跳过权限检查
    // const isMember = await ProjectMemberModel.checkMembership(projectId, userId);
    // if (!isMember) {
    //   throw new Error('没有权限查看该项目的统计信息');
    // }

    return await TaskModel.getStatistics(userId, projectId);
  }

  // 获取用户任务统计
  static async getUserTaskStats(userId: string): Promise<any> {
    return await TaskModel.getStatistics(userId);
  }

  // 获取项目标签
  static async getProjectTags(projectId: string, userId: string): Promise<string[]> {
    // 个人工作台模式：跳过权限检查
    // const isMember = await ProjectMemberModel.checkMembership(projectId, userId);
    // if (!isMember) {
    //   throw new Error('没有权限查看该项目的标签');
    // }

    return await TaskModel.getTagsByProject(projectId, userId);
  }

  // 获取用户标签
  static async getUserTags(userId: string): Promise<string[]> {
    return await TaskModel.getTags(userId);
  }
}