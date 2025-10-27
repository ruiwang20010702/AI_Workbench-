import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Target,
  FileText,
  Activity
} from 'lucide-react';
import { ProjectStatsCard } from '../components/dashboard/ProjectStatsCard';
import { ProjectProgressChart } from '../components/dashboard/ProjectProgressChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { TeamPerformance } from '../components/dashboard/TeamPerformance';
import { projectService, ProjectStats, Project } from '../services/projectService';
import taskService, { type Task } from '../services/taskService.ts';

interface DashboardData {
  stats: ProjectStats;
  recentProjects: Array<{
    name: string;
    progress: number;
    status: 'active' | 'completed' | 'on_hold';
    dueDate?: string;
    tasksCompleted: number;
    tasksTotal: number;
  }>;
  activities: Array<{
    id: string;
    type: 'task_created' | 'task_completed' | 'task_updated' | 'project_created' | 'project_updated' | 'comment_added';
    title: string;
    description: string;
    user: string;
    timestamp: string;
    metadata?: {
      projectName?: string;
      taskTitle?: string;
      status?: string;
      priority?: string;
    };
  }>;
  teamMembers: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
    tasksCompleted: number;
    tasksTotal: number;
    hoursWorked: number;
    efficiency: number;
    projects: string[];
  }>;
}

export const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      total_projects: 0,
      active_projects: 0,
      completed_projects: 0,
      total_tasks: 0,
      completed_tasks: 0,
      total_team_members: 0,
      overdue_tasks: 0,
      upcoming_deadlines: 0
    },
    recentProjects: [],
    activities: [],
    teamMembers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行加载数据（移除项目统计接口，前端计算汇总）
      const [projectsResponse, tasksResponse]: [
        Project[],
        { tasks: Task[]; total: number; page: number; limit: number }
      ] = await Promise.all([
        projectService.getProjects({ limit: 10 }),
        taskService.getTasks({ limit: 20 })
      ]);

      // 状态映射到图表所需的三类
      const mapStatus = (status: 'planning' | 'active' | 'paused' | 'completed' | 'archived'): 'active' | 'completed' | 'on_hold' => {
        if (status === 'completed') return 'completed';
        if (status === 'paused') return 'on_hold';
        return 'active';
      };

      // 处理项目进度数据
      const recentProjects = projectsResponse.map(project => ({
        name: project.name,
        progress: project.progress || 0,
        status: mapStatus(project.status),
        dueDate: project.end_date,
        tasksCompleted: project.tasks_completed || project.tasksCompleted || 0,
        tasksTotal: project.tasks_total || project.tasksTotal || 0
      }));

      // 计算统计数据
      const projects = projectsResponse;
      const tasks = tasksResponse.tasks;

      const now = new Date();
      const daysUntil = (dateString?: string) => {
        if (!dateString) return Infinity;
        const due = new Date(dateString);
        const diffMs = due.getTime() - now.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      };

      const computedStats: ProjectStats = {
        total_projects: projects.length,
        active_projects: projects.filter(p => p.status === 'active' || p.status === 'planning').length,
        completed_projects: projects.filter(p => p.status === 'completed').length,
        total_tasks: typeof tasksResponse.total === 'number' ? tasksResponse.total : tasks.length,
        completed_tasks: tasks.filter(t => t.status === 'completed').length,
        overdue_tasks: tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'completed').length,
        total_team_members: projects.reduce((sum, p) => sum + (p.team_members || 0), 0),
        upcoming_deadlines: tasks.filter(t => t.due_date && daysUntil(t.due_date) <= 3 && t.status !== 'completed').length
      };

      // 模拟活动数据（实际应用中应该从API获取）
      const activities = [
        {
          id: '1',
          type: 'task_completed' as const,
          title: '完成用户界面设计',
          description: '完成了项目管理系统的主要界面设计',
          user: '张三',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          metadata: {
            projectName: '项目管理系统',
            status: 'completed'
          }
        },
        {
          id: '2',
          type: 'project_created' as const,
          title: '创建新项目：移动应用开发',
          description: '启动了新的移动应用开发项目',
          user: '李四',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          metadata: {
            projectName: '移动应用开发',
            priority: 'high'
          }
        },
        {
          id: '3',
          type: 'task_created' as const,
          title: '创建任务：API接口开发',
          description: '为后端服务创建了API接口开发任务',
          user: '王五',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          metadata: {
            projectName: '后端服务',
            priority: 'medium'
          }
        }
      ];

      // 模拟团队成员数据（字段改为驼峰命名以匹配组件）
      const teamMembers = [
        {
          id: '1',
          name: '张三',
          role: '前端开发',
          tasksCompleted: 15,
          tasksTotal: 18,
          hoursWorked: 160,
          efficiency: 92,
          projects: ['项目A', '项目B']
        },
        {
          id: '2',
          name: '李四',
          role: '后端开发',
          tasksCompleted: 12,
          tasksTotal: 15,
          hoursWorked: 145,
          efficiency: 88,
          projects: ['项目B', '项目C']
        },
        {
          id: '3',
          name: '王五',
          role: 'UI设计师',
          tasksCompleted: 8,
          tasksTotal: 10,
          hoursWorked: 120,
          efficiency: 85,
          projects: ['项目A']
        }
      ];

      setDashboardData({
        stats: computedStats,
        recentProjects,
        activities,
        teamMembers
      });
    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
      setError('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const { stats } = dashboardData;
  const completionRate = stats.total_tasks > 0 
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">项目仪表盘</h1>
          <p className="text-gray-600">
            欢迎回来！这里是您的项目概览和团队绩效数据。
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ProjectStatsCard
            title="总项目数"
            value={stats.total_projects}
            icon={FileText}
            color="blue"
            subtitle="包含所有状态的项目"
          />
          <ProjectStatsCard
            title="活跃项目"
            value={stats.active_projects}
            icon={Activity}
            color="green"
            subtitle="正在进行中的项目"
          />
          <ProjectStatsCard
            title="任务完成率"
            value={`${completionRate}%`}
            icon={Target}
            color="purple"
            subtitle={`${stats.completed_tasks}/${stats.total_tasks} 个任务`}
          />
          <ProjectStatsCard
            title="团队成员"
            value={stats.total_team_members}
            icon={Users}
            color="yellow"
            subtitle="活跃团队成员数量"
          />
        </div>

        {/* Alert Cards */}
        {(stats.overdue_tasks > 0 || stats.upcoming_deadlines > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.overdue_tasks > 0 && (
              <ProjectStatsCard
                title="逾期任务"
                value={stats.overdue_tasks}
                icon={AlertTriangle}
                color="red"
                subtitle="需要立即处理"
              />
            )}
            {stats.upcoming_deadlines > 0 && (
              <ProjectStatsCard
                title="即将到期"
                value={stats.upcoming_deadlines}
                icon={Calendar}
                color="yellow"
                subtitle="3天内到期的任务"
              />
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Project Progress Chart */}
          <div className="lg:col-span-2">
            <ProjectProgressChart
              projects={dashboardData.recentProjects}
              title="项目进度概览"
              showDetails={true}
            />
          </div>

          {/* Recent Activity */}
          <div>
            <RecentActivity
              activities={dashboardData.activities}
              title="最近活动"
              maxItems={8}
            />
          </div>
        </div>

        {/* Team Performance */}
        <div className="mb-8">
          <TeamPerformance
            teamMembers={dashboardData.teamMembers}
            title="团队绩效概览"
            showDetails={true}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <FileText className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">创建新项目</div>
                <div className="text-sm text-gray-600">启动一个新的项目</div>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">创建新任务</div>
                <div className="text-sm text-gray-600">为项目添加新任务</div>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">查看报告</div>
                <div className="text-sm text-gray-600">生成详细的项目报告</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};