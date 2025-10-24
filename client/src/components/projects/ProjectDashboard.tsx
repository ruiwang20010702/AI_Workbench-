import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Target
} from 'lucide-react';

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalTeamMembers: number;
  overdueTasks: number;
  upcomingDeadlines: number;
}

interface ProjectDashboardProps {
  stats: ProjectStats;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ stats }) => {
  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  const projectCompletionRate = stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects) * 100 : 0;

  const statCards = [
    {
      title: '总项目数',
      value: stats.totalProjects,
      icon: Target,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '进行中项目',
      value: stats.activeProjects,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '已完成项目',
      value: stats.completedProjects,
      icon: CheckCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: '团队成员',
      value: stats.totalTeamMembers,
      icon: Users,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: '总任务数',
      value: stats.totalTasks,
      icon: BarChart3,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: '已完成任务',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: '逾期任务',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: '即将到期',
      value: stats.upcomingDeadlines,
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
                <span>{stats.completedTasks}/{stats.totalTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-green-600 font-semibold">{stats.completedTasks}</div>
                <div className="text-gray-600">已完成</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 font-semibold">{stats.totalTasks - stats.completedTasks}</div>
                <div className="text-gray-600">待完成</div>
              </div>
            </div>
          </div>
        </div>

        {/* 项目状态分布 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">项目状态分布</h3>
            <span className="text-sm text-gray-500">{projectCompletionRate.toFixed(1)}% 完成</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">进行中</span>
                <span className="text-sm font-medium">{stats.activeProjects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${stats.totalProjects > 0 ? (stats.activeProjects / stats.totalProjects) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">已完成</span>
                <span className="text-sm font-medium">{stats.completedProjects}</span>
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
                <span className="text-sm font-medium">{stats.totalProjects - stats.activeProjects - stats.completedProjects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${stats.totalProjects > 0 ? ((stats.totalProjects - stats.activeProjects - stats.completedProjects) / stats.totalProjects) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 警告和提醒区域 */}
      {(stats.overdueTasks > 0 || stats.upcomingDeadlines > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.overdueTasks > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">逾期任务提醒</h4>
                  <p className="text-sm text-red-600 mt-1">
                    有 {stats.overdueTasks} 个任务已逾期，需要立即处理
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {stats.upcomingDeadlines > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800">即将到期</h4>
                  <p className="text-sm text-orange-600 mt-1">
                    有 {stats.upcomingDeadlines} 个任务即将到期，请及时关注
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};