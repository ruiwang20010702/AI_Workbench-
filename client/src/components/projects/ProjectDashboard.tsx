import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle,
  Target,
  CheckCircle
} from 'lucide-react';
import { ProjectStats } from '../../services/projectService';

interface ProjectDashboardProps {
  stats: ProjectStats;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ stats }) => {
  const completionRate = stats.total_tasks > 0 ? (stats.completed_tasks / stats.total_tasks) * 100 : 0;
  const projectCompletionRate = stats.total_projects > 0 ? (stats.completed_projects / stats.total_projects) * 100 : 0;

  const statCards = [
    {
      title: '总项目数',
      value: stats.total_projects,
      icon: Target,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '进行中项目',
      value: stats.active_projects,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '已完成项目',
      value: stats.completed_projects,
      icon: CheckCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: '团队成员',
      value: stats.total_team_members,
      icon: Users,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: '总任务数',
      value: stats.total_tasks,
      icon: BarChart3,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: '已完成任务',
      value: stats.completed_tasks,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: '逾期任务',
      value: stats.overdue_tasks,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: '即将到期',
      value: stats.upcoming_deadlines,
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} rounded-lg p-6 border border-gray-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor} mt-1`}>
                  {(card.value || 0).toLocaleString()}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 进度图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 任务完成率 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">任务完成率</h3>
            <span className="text-sm text-gray-500">{completionRate.toFixed(1)}%</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>已完成</span>
                <span>{stats.completed_tasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>总任务数</span>
                <span>{stats.total_tasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${stats.total_tasks > 0 ? ((stats.total_tasks - stats.completed_tasks) / stats.total_tasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 项目进度 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">项目进度</h3>
            <span className="text-sm text-gray-500">{projectCompletionRate.toFixed(1)}%</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">进行中</span>
                <span className="text-sm font-medium">{stats.active_projects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${stats.total_projects > 0 ? (stats.active_projects / stats.total_projects) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">已完成</span>
                <span className="text-sm font-medium">{stats.completed_projects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${projectCompletionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">其他状态</span>
                <span className="text-sm font-medium">{stats.total_projects - stats.active_projects - stats.completed_projects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${stats.total_projects > 0 ? ((stats.total_projects - stats.active_projects - stats.completed_projects) / stats.total_projects) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};