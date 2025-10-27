import { Pool } from 'pg';
import pool from '../config/database';

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  assignee_id?: string;
  creator_id: string;
  status: '待办' | '进行中' | '已完成' | '已取消';
  priority: '低' | '中' | '高';
  start_date?: Date;
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  dependencies?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  project_id: string;
  assignee_id?: string;
  creator_id: string;
  status?: '待办' | '进行中' | '已完成' | '已取消';
  priority?: '低' | '中' | '高';
  start_date?: Date;
  due_date?: Date;
  estimated_hours?: number;
  tags?: string[];
  dependencies?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  assignee_id?: string;
  status?: '待办' | '进行中' | '已完成' | '已取消';
  priority?: '低' | '中' | '高';
  start_date?: Date;
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  dependencies?: string[];
}

export interface TaskFilters {
  project_id?: string;
  assignee_id?: string;
  status?: '待办' | '进行中' | '已完成' | '已取消';
  priority?: '低' | '中' | '高';
  tags?: string[];
  search?: string;
  overdue?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'due_date' | 'priority';
  sortOrder?: 'ASC' | 'DESC';
}

export class TaskModel {
  // 根据用户ID获取任务列表
  static async findByUserId(userId: string, filters: TaskFilters = {}): Promise<TaskData[]> {
    const {
      project_id,
      assignee_id,
      status,
      priority,
      tags,
      search,
      overdue,
      limit = 20,
      offset = 0,
      sortBy = 'updated_at',
      sortOrder = 'DESC'
    } = filters;

    // 个人工作台模式：简化权限检查，允许访问所有任务
    let query = `
      SELECT t.*, 
             p.name as project_name,
             u.username as assignee_name,
             c.username as creator_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN users c ON t.creator_id = c.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (project_id) {
      query += ` AND t.project_id = $${paramIndex}`;
      params.push(project_id);
      paramIndex++;
    }

    if (assignee_id) {
      query += ` AND t.assignee_id = $${paramIndex}`;
      params.push(assignee_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (tags && tags.length > 0) {
      query += ` AND t.tags && $${paramIndex}`;
      params.push(tags);
      paramIndex++;
    }

    if (search) {
      query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (overdue) {
      query += ` AND t.due_date < NOW() AND t.status != '已完成'`;
    }

    query += ` ORDER BY t.${sortBy} ${sortOrder}`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (err: any) {
      // 将错误信息包含SQL与参数，便于上层返回调试细节
      throw new Error(`TaskModel.findByUserId failed: ${err?.message || err}. SQL: ${query} | Params: ${JSON.stringify(params)}`);
    }
  }

  // 根据项目ID获取任务列表
  static async findByProjectId(projectId: string, userId: string, filters: TaskFilters = {}): Promise<TaskData[]> {
    return this.findByUserId(userId, { ...filters, project_id: projectId });
  }

  // 根据ID获取单个任务
  static async findById(id: string, userId: string): Promise<TaskData | null> {
    // 个人工作台模式：简化权限检查，允许访问所有任务
    const query = `
      SELECT t.*, 
             p.name as project_name,
             u.username as assignee_name,
             c.username as creator_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN users c ON t.creator_id = c.id
      WHERE t.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // 创建新任务
  static async create(taskData: CreateTaskData): Promise<TaskData> {
    const {
      title,
      description,
      project_id,
      assignee_id,
      creator_id,
      status = '待办',
      priority = '中',
      start_date,
      due_date,
      estimated_hours,
      tags = [],
      dependencies = []
    } = taskData;

    const query = `
      INSERT INTO tasks (
        title, description, project_id, assignee_id, creator_id, 
        status, priority, start_date, due_date, estimated_hours, tags, dependencies
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(query, [
      title,
      description,
      project_id,
      assignee_id,
      creator_id,
      status,
      priority,
      start_date,
      due_date,
      estimated_hours,
      tags,
      dependencies
    ]);

    return result.rows[0];
  }

  // 更新任务
  static async update(id: string, updateData: UpdateTaskData, userId: string): Promise<TaskData | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('没有提供更新数据');
    }

    fields.push(`updated_at = NOW()`);

    // 个人工作台模式：移除权限检查
    const query = `
      UPDATE tasks 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // 删除任务
  static async delete(id: string, userId: string): Promise<boolean> {
    // 个人工作台模式：移除权限检查
    const query = `
      DELETE FROM tasks 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // 获取任务统计信息
  static async getStatistics(userId: string, projectId?: string): Promise<any> {
    // 个人工作台模式：简化权限检查，允许访问所有任务统计
    let query = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = '待办' THEN 1 END) as todo_tasks,
        COUNT(CASE WHEN status = '进行中' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = '已完成' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN priority = '高' THEN 1 END) as high_priority_tasks,
        COUNT(CASE WHEN due_date < NOW() AND status != '已完成' THEN 1 END) as overdue_tasks
      FROM tasks 
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (projectId) {
      query += ` AND project_id = $1`;
      params.push(projectId);
    }
    
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // 获取任务标签
  static async getTags(userId: string): Promise<string[]> {
    // 个人工作台模式：简化权限检查，允许访问所有任务标签
    const query = `
      SELECT DISTINCT unnest(tags) as tag
      FROM tasks 
      WHERE tags IS NOT NULL
      ORDER BY tag
    `;
    
    const result = await pool.query(query, []);
    return result.rows.map((row: any) => row.tag);
  }

  // 新增：按项目获取任务标签（带权限限制）
  static async getTagsByProject(projectId: string, userId: string): Promise<string[]> {
    // 个人工作台模式：简化权限检查，允许访问所有项目任务标签
    const query = `
      SELECT DISTINCT unnest(tags) as tag
      FROM tasks 
      WHERE project_id = $1
        AND tags IS NOT NULL
      ORDER BY tag
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows.map((row: any) => row.tag);
  }

  // 批量更新任务状态
  static async batchUpdateStatus(taskIds: string[], status: string, userId: string): Promise<TaskData[]> {
    const query = `
      UPDATE tasks 
      SET status = $1, updated_at = NOW()
      WHERE id = ANY($2) AND (creator_id = $3 OR assignee_id = $3 OR project_id IN (
        SELECT id FROM projects WHERE owner_id = $3
      ))
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, taskIds, userId]);
    return result.rows;
  }

  // 获取任务依赖关系
  static async getDependencies(taskId: string): Promise<TaskData[]> {
    const query = `
      SELECT * FROM tasks 
      WHERE id = ANY(
        SELECT unnest(dependencies) FROM tasks WHERE id = $1
      )
    `;
    
    const result = await pool.query(query, [taskId]);
    return result.rows;
  }

  // 检查任务依赖是否完成
  static async checkDependenciesCompleted(taskId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as incomplete_count
      FROM tasks 
      WHERE id = ANY(
        SELECT unnest(dependencies) FROM tasks WHERE id = $1
      ) AND status != '已完成'
    `;
    
    const result = await pool.query(query, [taskId]);
    return parseInt(result.rows[0].incomplete_count) === 0;
  }
}