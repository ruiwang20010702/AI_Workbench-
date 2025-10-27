import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'archived';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  progress: number;
  teamMembers: number;
  tags: string[];
  parentId?: string;
  children?: Project[];
}

interface ProjectHierarchyProps {
  projects: Project[];
  onProjectSelect?: (project: Project) => void;
  selectedProjectId?: string;
}

interface ProjectNodeProps {
  project: Project;
  level: number;
  onProjectSelect?: (project: Project) => void;
  selectedProjectId?: string;
}

const ProjectNode: React.FC<ProjectNodeProps> = ({
  project,
  level,
  onProjectSelect,
  selectedProjectId
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = project.children && project.children.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-600';
      case 'active': return 'text-green-600';
      case 'completed': return 'text-gray-600';
      case 'on-hold': return 'text-yellow-600';
      case 'archived': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors",
          selectedProjectId === project.id && "bg-blue-50 border-l-4 border-blue-500",
          level > 0 && "ml-6"
        )}
        onClick={() => onProjectSelect?.(project)}
      >
        <div className="flex items-center flex-1 min-w-0">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 mr-2" />
          )}
          
          <div className="mr-3">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-5 h-5 text-blue-500" />
              ) : (
                <Folder className="w-5 h-5 text-blue-500" />
              )
            ) : (
              <FileText className="w-5 h-5 text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {project.name}
              </span>
              <span className={cn("text-xs px-2 py-1 rounded-full", getPriorityColor(project.priority))}>
                {project.priority}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className={getStatusColor(project.status)}>
                {project.status}
              </span>
              <span>{project.progress}% 完成</span>
              <span>{project.teamMembers} 成员</span>
            </div>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-4">
          {project.children?.map((child) => (
            <ProjectNode
              key={child.id}
              project={child}
              level={level + 1}
              onProjectSelect={onProjectSelect}
              selectedProjectId={selectedProjectId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProjectHierarchy: React.FC<ProjectHierarchyProps> = ({
  projects,
  onProjectSelect,
  selectedProjectId
}) => {
  // 构建层级结构
  const buildHierarchy = (projects: Project[]): Project[] => {
    const projectMap = new Map<string, Project>();
    const rootProjects: Project[] = [];

    // 创建项目映射
    projects.forEach(project => {
      projectMap.set(project.id, { ...project, children: [] });
    });

    // 构建父子关系
    projects.forEach(project => {
      const projectNode = projectMap.get(project.id)!;
      if (project.parentId && projectMap.has(project.parentId)) {
        const parent = projectMap.get(project.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(projectNode);
      } else {
        rootProjects.push(projectNode);
      }
    });

    return rootProjects;
  };

  const hierarchicalProjects = buildHierarchy(projects);

  if (hierarchicalProjects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>暂无项目</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">项目层级结构</h3>
      </div>
      <div className="p-4 space-y-1">
        {hierarchicalProjects.map((project) => (
          <ProjectNode
            key={project.id}
            project={project}
            level={0}
            onProjectSelect={onProjectSelect}
            selectedProjectId={selectedProjectId}
          />
        ))}
      </div>
    </div>
  );
};