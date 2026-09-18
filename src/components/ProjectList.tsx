import React, { useState, useEffect } from "react";
import { Project, ViewState, UploadState } from "../types";
import { 
  Plus, Search, FolderKanban, User, Calendar, Settings2, Trash2, 
  FileText, Play, ShieldCheck, Edit3, X, HelpCircle, Loader2, Sparkles, Check, Upload, Sliders
} from "lucide-react";

interface ProjectListProps {
  onSelectAction: (project: Project, action: ViewState, initialStep?: 1 | 2) => void;
  projectUploadStates?: { [projectId: string]: UploadState };
}

// Netlify's static preview has no Express API; keep the initial screen useful
// while preserving the real API response whenever the backend is available.
const PREVIEW_PROJECT: Project = {
  id: "preview-project",
  name: "骨科临床科研数据集匿名化项目（预览）",
  description: "用于产品预览的示例项目，展示医疗数据去标识化、方案管理与合规评估流程。",
  creator: "预览用户",
  createdAt: "2026-09-18 10:00",
  updatedAt: "2026-09-18 10:00",
  expectedK: 5,
};

export default function ProjectList({ onSelectAction, projectUploadStates = {} }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  // Form values
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [expectedKInput, setExpectedKInput] = useState<number>(5);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Load projects from API
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      setProjects([PREVIEW_PROJECT]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects by Name
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert("请输入项目名称");
      return;
    }

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          description: descInput,
          expectedK: expectedKInput,
          creator: "刘晓敏（项目合规部经理）" // default realistic toB creator
        })
      });

      if (response.ok) {
        await fetchProjects();
        setIsAddModalOpen(false);
        setNameInput("");
        setDescInput("");
        setExpectedKInput(5);
      } else {
        alert("新增项目失败，请重试");
      }
    } catch (err) {
      console.error(err);
      alert("新增项目异常");
    }
  };

  // Open Edit modal
  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setNameInput(project.name);
    setDescInput(project.description);
    setExpectedKInput(project.expectedK || 5);
    setIsEditModalOpen(true);
  };

  // Edit project handler
  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!nameInput.trim()) {
      alert("项目名称不能为空");
      return;
    }

    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          description: descInput,
          expectedK: expectedKInput
        })
      });

      if (response.ok) {
        await fetchProjects();
        setIsEditModalOpen(false);
        setEditingProject(null);
        setNameInput("");
        setDescInput("");
        setExpectedKInput(5);
      } else {
        alert("编辑项目失败");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete project
  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`确定要永久删除去标识项目 [${name}] 吗？此操作不可逆。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await fetchProjects();
      } else {
        alert("删除项目失败");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="project_list_container">
      
      {/* Search and action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm" id="project_search_bar_row">
        {/* Search Field */}
        <div className="flex items-center space-x-2 flex-1 max-w-lg">
          <span className="text-xs font-black text-slate-700 whitespace-nowrap">项目名称：</span>
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="请输入项目名称"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded text-xs font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
              id="search_project_input"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setNameInput("");
            setDescInput("");
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-6 py-3 rounded text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-200/80 transition-all"
          id="add_project_trigger_btn"
        >
          <Plus className="w-4.5 h-4.5 stroke-[3px]" />
          <span>新增项目</span>
        </button>
      </div>

      {/* Grid view of projects */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24" id="project_list_loader">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-500 mt-3 font-black uppercase tracking-wider">正在读取匿名化项目...</span>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="project_cards_grid">
           {filteredProjects.map((project, index) => {
             const isSchemeCompleted = !!(project.schemeDocText || project.schemeData) && !project.isRegeneratingPending;
             const isUploadCompleted = !!(projectUploadStates[project.id]?.isCompleted || (project.id === 'p1' && !project.isRegeneratingPending));
             const isConfigCompleted = !!(projectUploadStates[project.id]?.isConfigCompleted || (project.id === 'p1' && !project.isRegeneratingPending));
             const isTaskClickable = isUploadCompleted && isConfigCompleted;
             return (
               <div 
                 key={project.id} 
                 className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-600 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                 id={`project_card_${project.id}`}
               >
                 {/* Header metadata */}
                 <div className="p-6">
                   <div className="flex items-start justify-between">
                     <div className="flex items-center space-x-1.5">
                       <div className="flex items-center space-x-1.5 text-[10px] text-blue-600 font-black uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                         <FolderKanban className="w-3.5 h-3.5" />
                         <span># {project.id}</span>
                       </div>
                       {project.expectedK !== undefined && isSchemeCompleted && (
                         <div className="flex items-center space-x-1 text-[10px] text-purple-600 font-black bg-purple-50 px-2.5 py-1 rounded border border-purple-100" title="最低 K-Anonymity 安全阈值">
                           <span>最低k值: {project.expectedK}</span>
                         </div>
                       )}
                       {project.actualK !== undefined && (
                         <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-black bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100" title="实际 K-Anonymity 安全值">
                           <span>实际K值: {project.actualK}</span>
                         </div>
                       )}
                     </div>
                     
                      {/* Small Action edit/delete icons on top */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-950 transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setIsDeleteAlertOpen(true)}
                          className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                          title="删除项目"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                   </div>
 
                   <h3 className="font-black text-slate-900 mt-4 text-lg leading-snug group-hover:text-blue-600 transition-colors tracking-tight">
                     {project.name}
                   </h3>
                   
                   <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                     {project.description || "暂无具体描述说明。"}
                   </p>
 
 
 
                   {/* Sub audit indicators */}
                   <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
                     <div className="flex items-center space-x-2">
                       <User className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                       <span className="truncate text-slate-600" title={project.creator}>{project.creator}</span>
                     </div>
                     <div className="flex items-center space-x-2 justify-end">
                       <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                       <span className="text-slate-600">{project.createdAt}</span>
                     </div>
                   </div>
                 </div>
 
                 {/* Action operations shelf - Single row with 4 buttons and NO icons */}
                 <div className="bg-slate-50 border-t border-slate-200 px-3 py-3.5 grid grid-cols-4 gap-1.5" id={`action_shelf_${project.id}`}>
                   {/* 1. 方案生成 */}
                   <button
                     onClick={() => onSelectAction(project, isSchemeCompleted ? 'scheme-doc' : 'scheme')}
                     className={`py-2 px-1 rounded text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-xs transition-all cursor-pointer border text-center flex items-center justify-center gap-1 ${
                       isSchemeCompleted 
                         ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                         : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                     }`}
                     id={`action_scheme_${project.id}`}
                   >
                     {isSchemeCompleted && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 stroke-[3px]" />}
                     <span>方案生成</span>
                   </button>
 
                   {/* 2. 数据源配置 */}
                   <button
                     disabled={!isSchemeCompleted}
                     onClick={() => onSelectAction(project, 'processing', 1)}
                     className={`py-2 px-1 rounded text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-xs transition-all border text-center flex items-center justify-center gap-1 ${
                       !isSchemeCompleted
                         ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                         : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200 cursor-pointer"
                     }`}
                     id={`action_upload_${project.id}`}
                   >
                     {isUploadCompleted && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 stroke-[3px]" />}
                     <span>数据源配置</span>
                   </button>
 
                   {/* 3. 匿名化策略 */}
                   <button
                     disabled={!isSchemeCompleted}
                     onClick={() => onSelectAction(project, 'processing', 2)}
                     className={`py-2 px-1 rounded text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-xs transition-all border text-center flex items-center justify-center gap-1 ${
                       !isSchemeCompleted
                         ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                         : "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200 cursor-pointer"
                     }`}
                     id={`action_config_${project.id}`}
                   >
                     {isConfigCompleted && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 stroke-[3px]" />}
                     <span>匿名化策略</span>
                   </button>
 
                   {/* 4. 匿名化任务 */}
                   <button
                     disabled={!isTaskClickable}
                     onClick={() => onSelectAction(project, 'evaluation')}
                     className={`py-2 px-1 rounded text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-xs transition-all border text-center flex items-center justify-center gap-1 ${
                       !isTaskClickable
                         ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                         : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 cursor-pointer"
                     }`}
                     id={`action_evaluate_${project.id}`}
                   >
                     {isTaskClickable && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3px]" />}
                     <span>匿名化任务</span>
                   </button>
                 </div>
               </div>
             );
           })}
        </div>
      ) : (
        /* Empty project library state */
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center max-w-xl mx-auto shadow-xs" id="projects_empty_container">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">去标识项目库为空</h3>
          <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
            当前暂未建立合规项目。请点击右上方“新增项目”输入原始课题资产和项目说明。
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-5 inline-flex items-center space-x-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>新增首个合规项目</span>
          </button>
        </div>
      )}

      {/* MODAL 1: ADD PROJECT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add_project_modal">
          <div className="bg-white rounded-xl border-2 border-slate-950 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b-2 border-slate-950">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-blue-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">新增</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddProject} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">项目名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="请输入"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                  id="project_name_input"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">项目说明</label>
                <textarea
                  placeholder="请输入"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full h-32 p-3 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none text-slate-800"
                  id="project_desc_input"
                />
              </div>

              {/* Modal buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded border-2 border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-wider transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all"
                  id="add_project_submit"
                >
                  确定新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PROJECT */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="edit_project_modal">
          <div className="bg-white rounded-xl border-2 border-slate-950 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b-2 border-slate-950">
              <div className="flex items-center space-x-2">
                <Settings2 className="w-4.5 h-4.5 text-blue-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">编辑</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleEditProject} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">项目名称</label>
                <input
                  type="text"
                  disabled
                  value={nameInput}
                  className="w-full p-3 bg-slate-100 border-2 border-slate-200 rounded text-xs font-bold cursor-not-allowed text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">项目说明</label>
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full h-32 p-3 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none text-slate-800"
                />
              </div>

              {/* Modal buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded border-2 border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-wider transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE EXPLANATION NOTICE */}
      {isDeleteAlertOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="delete_project_alert_modal">
          <div className="bg-white rounded-xl border-2 border-slate-950 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b-2 border-slate-950">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">系统提示</h3>
              </div>
              <button 
                onClick={() => setIsDeleteAlertOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-500 shrink-0 border border-amber-200">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">
                    由于原型的数据问题，此按钮不做交互仅做说明，具体说明详见PRD对应内容
                  </p>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteAlertOpen(false)}
                  className="px-6 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
