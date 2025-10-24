import React, { useState, useMemo } from 'react';
import { Plus, Grid3X3, List, Calendar, BarChart3, PieChart, TreePine } from 'lucide-react';
import { cn } from '../utils/cn';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectCreateModal } from '../components/projects/ProjectCreateModal';
import { ProjectFilters } from '../components/projects/ProjectFilters';
import { ProjectDashboard } from '../components/projects/ProjectDashboard';
import { ProjectHierarchy } from '../components/projects/ProjectHierarchy';

type ViewMode = 'dashboard' | 'grid' | 'list' | 'kanban' | 'gantt' | 'hierarchy';

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  progress: number;
  teamMembers: number;
  tasksTotal: number;
  tasksCompleted: number;
  parentId?: string;
  subProjects?: number;
  tags: string[];
  daysRemaining: number;
}

interface ProjectFilters {
  search: string;
  status: string[];
  priority: string[];
  dateRange: {
    start: string;
    end: string;
  };
  teamMembers: string[];
  tags: string[];
  hasSubProjects: boolean | null;
  parentId: string | null;
}

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  parentId?: string;
  teamMembers: string[];
  tags: string[];
  attachments: File[];
}

// Mock data with enhanced structure
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'AI工作台前端重构',
    description: '使用React和TypeScript重构现有的AI工作台前端界面，提升用户体验和代码可维护性。包含组件库建设、状态管理优化、性能提升等多个子任务。',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    priority: 'high',
    status: 'active',
    progress: 65,
    teamMembers: 4,
    tasksTotal: 24,
    tasksCompleted: 16,
    subProjects: 3,
    tags: ['前端', 'React', 'TypeScript', '重构'],
    daysRemaining: 25
  },
  {
    id: '2',
    name: '用户权限管理系统',
    description: '开发完整的用户权限管理系统，支持角色分配和细粒度权限控制。',
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    priority: 'medium',
    status: 'planning',
    progress: 20,
    teamMembers: 3,
    tasksTotal: 18,
    tasksCompleted: 4,
    subProjects: 2,
    tags: ['后端', '权限', '安全'],
    daysRemaining: 45
  },
  {
    id: '3',
    name: 'API文档自动化',
    description: '实现API文档的自动生成和维护，提升开发效率。',
    startDate: '2024-01-01',
    endDate: '2024-02-28',
    priority: 'low',
    status: 'completed',
    progress: 100,
    teamMembers: 2,
    tasksTotal: 12,
    tasksCompleted: 12,
    tags: ['文档', '自动化', 'API'],
    daysRemaining: 0
  },
  {
    id: '4',
    name: '组件库设计系统',
    description: '为AI工作台前端重构项目提供统一的组件库和设计系统。',
    startDate: '2024-01-20',
    endDate: '2024-02-20',
    priority: 'high',
    status: 'active',
    progress: 80,
    teamMembers: 2,
    tasksTotal: 15,
    tasksCompleted: 12,
    parentId: '1',
    tags: ['设计', '组件', 'UI'],
    daysRemaining: 10
  },
  {
    id: '5',
    name: '状态管理重构',
    description: '使用Redux Toolkit重构应用状态管理，提升性能和可维护性。',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    priority: 'medium',
    status: 'paused',
    progress: 40,
    teamMembers: 2,
    tasksTotal: 10,
    tasksCompleted: 4,
    parentId: '1',
    tags: ['状态管理', 'Redux', '重构'],
    daysRemaining: 15
  },
  {
    id: '6',
    name: '性能优化',
    description: '优化应用性能，包括代码分割、懒加载等技术。',
    startDate: '2024-02-15',
    endDate: '2024-03-10',
    priority: 'medium',
    status: 'planning',
    progress: 10,
    teamMembers: 2,
    tasksTotal: 8,
    tasksCompleted: 1,
    parentId: '1',
    tags: ['性能', '优化', '前端'],
    daysRemaining: 30
  },
  {
    id: '7',
    name: '角色管理模块',
    description: '实现用户角色的创建、编辑和分配功能。',
    startDate: '2024-02-05',
    endDate: '2024-03-05',
    priority: 'high',
    status: 'active',
    progress: 30,
    teamMembers: 2,
    tasksTotal: 12,
    tasksCompleted: 4,
    parentId: '2',
    tags: ['角色', '权限', '管理'],
    daysRemaining: 20
  },
  {
    id: '8',
    name: '权限控制引擎',
    description: '开发细粒度权限控制引擎，支持资源级别的权限管理。',
    startDate: '2024-02-10',
    endDate: '2024-03-20',
    priority: 'high',
    status: 'planning',
    progress: 5,
    teamMembers: 2,
    tasksTotal: 15,
    tasksCompleted: 1,
    parentId: '2',
    tags: ['权限', '引擎', '安全'],
    daysRemaining: 35
  }
];

export const ProjectsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [parentProject, setParentProject] = useState<Project | null>(null);
  
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: [],
    priority: [],
    dateRange: { start: '', end: '' },
    teamMembers: [],
    tags: [],
    hasSubProjects: null,
    parentId: null
  });

  const viewModeOptions = [
    { mode: 'dashboard' as ViewMode, icon: PieChart, label: '仪表盘' },
    { mode: 'grid' as ViewMode, icon: Grid3X3, label: '网格视图' },
    { mode: 'list' as ViewMode, icon: List, label: '列表视图' },
    { mode: 'kanban' as ViewMode, icon: BarChart3, label: '看板视图' },
    { mode: 'gantt' as ViewMode, icon: Calendar, label: '甘特图' },
    { mode: 'hierarchy' as ViewMode, icon: TreePine, label: '层级视图' }
  ];

  const handleCreateProject = () => {
    setEditingProject(null);
    setParentProject(null);
    setShowCreateModal(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setParentProject(null);
    setShowCreateModal(true);
  };

  const handleCreateSubProject = (parent: Project) => {
    setEditingProject(null);
    setParentProject(parent);
    setShowCreateModal(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('确定要删除这个项目吗？此操作不可撤销。')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  const handleStatusChange = (projectId: string, status: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: status as any } : p
    ));
  };

  const handleProjectSubmit = (projectData: ProjectFormData) => {
    if (editingProject) {
      // Update existing project
      setProjects(prev => prev.map(p => 
        p.id === editingProject.id 
          ? { 
              ...p, 
              name: projectData.name,
              description: projectData.description,
              startDate: projectData.startDate,
              endDate: projectData.endDate,
              priority: projectData.priority,
              status: projectData.status,
              parentId: projectData.parentId,
              teamMembers: projectData.teamMembers.length, // Convert string[] to number
              tags: projectData.tags,
              daysRemaining: Math.ceil((new Date(projectData.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            }
          : p
      ));
    } else {
      // Create new project
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        priority: projectData.priority,
        status: projectData.status,
        parentId: projectData.parentId,
        teamMembers: projectData.teamMembers.length, // Convert string[] to number
        progress: 0,
        tasksTotal: 0,
        tasksCompleted: 0,
        subProjects: 0,
        tags: projectData.tags,
        daysRemaining: Math.ceil((new Date(projectData.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      };
      setProjects(prev => [...prev, newProject]);
      
      // Update parent project's subProjects count
      if (projectData.parentId) {
        setProjects(prev => prev.map(p => 
          p.id === projectData.parentId 
            ? { ...p, subProjects: (p.subProjects || 0) + 1 }
            : p
        ));
      }
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      dateRange: { start: '', end: '' },
      teamMembers: [],
      tags: [],
      hasSubProjects: null,
      parentId: null
    });
  };


  // Filter projects based on current filters
  const filteredProjects = projects.filter(project => {
    // Search filter
    if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !project.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(project.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority.length > 0 && !filters.priority.includes(project.priority)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start && project.startDate < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && project.endDate > filters.dateRange.end) {
      return false;
    }

    // Sub-projects filter
    if (filters.hasSubProjects === true && (!project.subProjects || project.subProjects === 0)) {
      return false;
    }
    if (filters.hasSubProjects === false && project.subProjects && project.subProjects > 0) {
      return false;
    }

    return true;
  });

  // Calculate project statistics
  const projectStats = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const activeProjects = filteredProjects.filter(p => p.status === 'active').length;
    const completedProjects = filteredProjects.filter(p => p.status === 'completed').length;
    
    const totalTasks = filteredProjects.reduce((sum, p) => sum + (p.tasksTotal || 0), 0);
    const completedTasks = filteredProjects.reduce((sum, p) => sum + (p.tasksCompleted || 0), 0);
    const totalTeamMembers = filteredProjects.reduce((sum, p) => sum + (p.teamMembers || 0), 0);
    
    // Calculate overdue projects (active projects past their end date)
    const now = new Date();
    const overdueProjects = filteredProjects.filter(p => 
      p.status === 'active' && new Date(p.endDate) < now
    ).length;
    
    // Calculate upcoming deadlines (projects ending within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingDeadlines = filteredProjects.filter(p => 
      p.status === 'active' && 
      new Date(p.endDate) >= now && 
      new Date(p.endDate) <= sevenDaysFromNow
    ).length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      totalTeamMembers,
      overdueTasks: overdueProjects,
      upcomingDeadlines
    };
  }, [filteredProjects]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
              <p className="text-sm text-gray-600">管理和跟踪您的所有项目</p>
            </div>
            <button 
              onClick={handleCreateProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>创建项目</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProjectFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Projects Content */}
          <div className="lg:col-span-3">
            {/* View Mode Selector */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  显示 {filteredProjects.length} 个项目
                </span>
              </div>

              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {viewModeOptions.map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors",
                      viewMode === mode
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard View */}
            {viewMode === 'dashboard' && (
              <ProjectDashboard stats={projectStats} />
            )}

            {/* Projects Grid/List */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    viewMode={viewMode}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                    onCreateSubProject={handleCreateSubProject}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    viewMode={viewMode}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                    onCreateSubProject={handleCreateSubProject}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}

            {viewMode === 'kanban' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">看板视图</h3>
                <p className="text-gray-600">看板视图功能正在开发中...</p>
              </div>
            )}

            {viewMode === 'gantt' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">甘特图</h3>
                <p className="text-gray-600">甘特图功能正在开发中...</p>
              </div>
            )}

            {viewMode === 'hierarchy' && (
              <ProjectHierarchy 
                projects={filteredProjects}
                onProjectSelect={(project) => {
                  setEditingProject(project);
                  setShowCreateModal(true);
                }}
              />
            )}

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filters.search || filters.status.length > 0 || filters.priority.length > 0 
                    ? '未找到匹配的项目' 
                    : '还没有项目'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.status.length > 0 || filters.priority.length > 0
                    ? '尝试调整筛选条件或清除筛选器' 
                    : '创建您的第一个项目开始管理工作'}
                </p>
                <button 
                  onClick={handleCreateProject}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  创建项目
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <ProjectCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleProjectSubmit}
        editProject={editingProject}
        parentProject={parentProject}
      />
    </div>
  );
};