import React from 'react';
import { Calendar, Users, Flag, MoreVertical, Play, Pause, CheckCircle, Archive, FolderTree } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Project } from '../../services/projectService';

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onCreateSubProject: (parentProject: Project) => void;
  onStatusChange: (projectId: string, status: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onEdit,
  onDelete,
  onCreateSubProject,
  onStatusChange
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      case 'archived': return <Archive className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return '规划中';
      case 'active': return '进行中';
      case 'paused': return '已暂停';
      case 'completed': return '已完成';
      case 'archived': return '已归档';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高优先级';
      case 'medium': return '中优先级';
      case 'low': return '低优先级';
      default: return priority;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              {project.parent_id && (
                <FolderTree className="w-4 h-4 text-gray-400" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {project.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                  getPriorityColor(project.priority)
                )}>
                  <Flag className="w-3 h-3 mr-1" />
                  {getPriorityText(project.priority)}
                </span>
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                  getStatusColor(project.status)
                )}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1">{getStatusText(project.status)}</span>
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>

          <div className="flex items-center space-x-6 ml-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {project.tasks_completed || 0}/{project.tasks_total || 0}
              </div>
              <div className="text-xs text-gray-500">任务</div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {project.team_members || 0}
              </div>
              <div className="text-xs text-gray-500">成员</div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {project.end_date ? Math.max(0, Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0}天
              </div>
              <div className="text-xs text-gray-500">剩余</div>
            </div>

            <div className="w-24">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>进度</span>
                <span>{project.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(project);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      编辑项目
                    </button>
                    <button
                      onClick={() => {
                        onCreateSubProject(project);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      创建子项目
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        onStatusChange(project.id, project.status === 'active' ? 'paused' : 'active');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {project.status === 'active' ? '暂停项目' : '启动项目'}
                    </button>
                    <button
                      onClick={() => {
                        onDelete(project.id);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      删除项目
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {project.parent_id && (
                <FolderTree className="w-4 h-4 text-gray-400" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {project.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
              {project.description}
            </p>
          </div>

        <div className="relative ml-2">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit(project);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  编辑项目
                </button>
                <button
                  onClick={() => {
                    onCreateSubProject(project);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  创建子项目
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    onStatusChange(project.id, project.status === 'active' ? 'paused' : 'active');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {project.status === 'active' ? '暂停项目' : '启动项目'}
                </button>
                <button
                  onClick={() => {
                    onDelete(project.id);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  删除项目
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Status and Priority */}
      <div className="flex items-center space-x-2 mb-4">
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          getStatusColor(project.status)
        )}>
          {getStatusIcon(project.status)}
          <span className="ml-1">{getStatusText(project.status)}</span>
        </span>
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
          getPriorityColor(project.priority)
        )}>
          <Flag className="w-3 h-3 mr-1" />
          {getPriorityText(project.priority)}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>项目进度</span>
          <span>{project.progress || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="flex items-center justify-center text-gray-400 mb-1">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-gray-900">
            {project.end_date ? Math.max(0, Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0}天
          </div>
          <div className="text-xs text-gray-500">剩余</div>
        </div>
        <div>
          <div className="flex items-center justify-center text-gray-400 mb-1">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-gray-900">
            {project.team_members || 0}
          </div>
          <div className="text-xs text-gray-500">成员</div>
        </div>
        <div>
          <div className="flex items-center justify-center text-gray-400 mb-1">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-gray-900">
            {project.tasks_completed || 0}/{project.tasks_total || 0}
          </div>
          <div className="text-xs text-gray-500">任务</div>
        </div>
      </div>

      {/* Sub-projects indicator */}
      {project.sub_projects && project.sub_projects > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <FolderTree className="w-4 h-4 mr-2" />
            <span>{project.sub_projects} 个子项目</span>
          </div>
        </div>
      )}
    </div>
  );
};