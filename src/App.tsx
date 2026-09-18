import React, { useState } from "react";
import { Project, ViewState, UploadState } from "./types";
import ProjectList from "./components/ProjectList";
import AnonymizationScheme from "./components/AnonymizationScheme";
import EditableSchemeForm from "./components/EditableSchemeForm";
import AnonymizationProcessing from "./components/AnonymizationProcessing";
import AnonymizationEvaluation from "./components/AnonymizationEvaluation";
import SystemManagement from "./components/SystemManagement";
import EnvironmentConfig from "./components/EnvironmentConfig";
import { Shield, ShieldCheck, Cpu, Database, Award, Server, User, ChevronDown, ChevronUp, SlidersHorizontal, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { STANDARD_CSV_FIELDS, STANDARD_DICOM_FIELDS } from "./lib/constants";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [processingInitialStep, setProcessingInitialStep] = useState<1 | 2 | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState(false);
  
  // Background upload states indexed by project ID
  const [projectUploadStates, setProjectUploadStates] = useState<{ [projectId: string]: UploadState }>({});

  // Background upload simulation function
  const startBackgroundUpload = (projectId: string, CSVFile: { name: string, headers?: string[] } | null, dicomFile: { name: string } | null, imageFile: { name: string } | null) => {
    // Initialize state
    setProjectUploadStates(prev => ({
      ...prev,
      [projectId]: {
        CSVProgress: CSVFile ? 0 : null,
        dicomProgress: dicomFile ? 0 : null,
        imageProgress: imageFile ? 0 : null,
        CSVFileName: CSVFile ? CSVFile.name : null,
        dicomFileName: dicomFile ? dicomFile.name : null,
        imageFileName: imageFile ? imageFile.name : null,
        isUploading: true,
        isCompleted: false,
        parsedCSVFields: [],
        parsedDICOMFields: []
      }
    }));

    let currentCSV = CSVFile ? 0 : null;
    let currentDicom = dicomFile ? 0 : null;
    let currentImage = imageFile ? 0 : null;

    const interval = setInterval(() => {
      let isStillUploading = false;

      if (currentCSV !== null && currentCSV < 100) {
        currentCSV = Math.min(100, currentCSV + Math.floor(Math.random() * 12) + 6);
        isStillUploading = true;
      }
      if (currentDicom !== null && currentDicom < 100) {
        currentDicom = Math.min(100, currentDicom + Math.floor(Math.random() * 10) + 4);
        isStillUploading = true;
      }
      if (currentImage !== null && currentImage < 100) {
        currentImage = Math.min(100, currentImage + Math.floor(Math.random() * 14) + 7);
        isStillUploading = true;
      }

      setProjectUploadStates(prev => {
        const currentProjectState = prev[projectId];
        if (!currentProjectState) {
          clearInterval(interval);
          return prev;
        }

        const isCompletedNow = 
          (currentCSV === null || currentCSV === 100) && 
          (currentDicom === null || currentDicom === 100) &&
          (currentImage === null || currentImage === 100);

        let parsedCSVFields = currentProjectState.parsedCSVFields || [];
        let parsedDICOMFields = currentProjectState.parsedDICOMFields || [];

        if (isCompletedNow && parsedCSVFields.length === 0 && parsedDICOMFields.length === 0) {
          // Upload complete - generate standard/custom parsed fields
          if (CSVFile) {
            if (CSVFile.headers && CSVFile.headers.length > 0) {
              parsedCSVFields = CSVFile.headers.map((h, i) => {
                const standard = STANDARD_CSV_FIELDS.find(sf => sf.name === h);
                if (standard) {
                  return { ...standard, id: i + 1 };
                } else {
                  return {
                    id: i + 1,
                    name: h,
                    def: "上传解析列",
                    attr: "敏感属性" as const,
                    tech: "原文" as const,
                    note: "直接保留原文",
                    computeK: "否" as const,
                    generalizationRules: [],
                    offsetDirection: "向后" as const,
                    offsetDays: 7,
                    pseudonymizationMode: "加密算法" as const,
                    pseudonymizationAlgo: "SM3" as const,
                    pseudonymizationFixed: ""
                  };
                }
              });
            } else {
              parsedCSVFields = JSON.parse(JSON.stringify(STANDARD_CSV_FIELDS));
            }
          } else {
            parsedCSVFields = JSON.parse(JSON.stringify(STANDARD_CSV_FIELDS));
          }
          if (dicomFile) {
            parsedDICOMFields = JSON.parse(JSON.stringify(STANDARD_DICOM_FIELDS));
          } else {
            parsedDICOMFields = JSON.parse(JSON.stringify(STANDARD_DICOM_FIELDS));
          }
        }

        return {
          ...prev,
          [projectId]: {
            ...currentProjectState,
            CSVProgress: currentCSV,
            dicomProgress: currentDicom,
            imageProgress: currentImage,
            isUploading: isStillUploading,
            isCompleted: isCompletedNow || currentProjectState.isCompleted,
            parsedCSVFields,
            parsedDICOMFields
          }
        };
      });

      if (!isStillUploading) {
        clearInterval(interval);
      }
    }, 200);
  };

  // Handle action selection from card operations list
  const handleSelectAction = (project: Project, action: ViewState, initialStep?: 1 | 2) => {
    setSelectedProject(project);
    setCurrentView(action);
    setProcessingInitialStep(initialStep !== undefined ? initialStep : null);
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    setCurrentView('projects');
    setSelectedProject(null);
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col justify-between" id="platform_root_app">
      
      {/* Platform Professional Corporate Header - Bold Typography Theme */}
      <header className="bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-xs" id="platform_top_header">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 py-4">
          
          {/* Logo Brand Group */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center shadow-md shadow-blue-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                医疗健康数据智能匿名化平台
              </h1>
            </div>
          </div>

          {/* Quick Stats & User Profile Group - Matching 2.png */}
          <div className="relative">
            {/* User Dropdown Trigger */}
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer select-none bg-transparent"
            >
              <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-3xs">
                <User className="w-4.5 h-4.5 text-blue-600 stroke-[2.2]" />
              </div>
              <span className="font-bold text-slate-800 text-sm">张三</span>
              {isUserMenuOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400 stroke-[2.2]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 stroke-[2.2]" />
              )}
            </button>

            {/* Dropdown Menu - Exact style from 2.png */}
            {isUserMenuOpen && (
              <>
                {/* Backdrop to dismiss on outside click */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsUserMenuOpen(false)} 
                />
                
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 py-2 z-50 animate-scale-up overflow-hidden">
                  {/* Environment Config Option */}
                  <button
                    onClick={() => {
                      setCurrentView('env-config');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-3 transition-colors cursor-pointer border-0 bg-transparent"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0 stroke-[2]" />
                    <span>环境参数配置</span>
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 my-1 mx-3" />

                  {/* Logout Option */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setLogoutNotice(true);
                      setTimeout(() => setLogoutNotice(false), 2500);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center space-x-3 transition-colors cursor-pointer border-0 bg-transparent"
                  >
                    <LogOut className="w-4 h-4 text-slate-500 shrink-0 stroke-[2]" />
                    <span>退出登录</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 pb-16">
        
        {/* Dynamic page transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="w-full"
          >
            {currentView === 'projects' && (
              <ProjectList onSelectAction={handleSelectAction} projectUploadStates={projectUploadStates} />
            )}

            {currentView === 'scheme' && selectedProject && (
              <AnonymizationScheme 
                project={selectedProject} 
                onBack={handleBackToDashboard} 
                onSchemeGenerated={() => setCurrentView('scheme-doc')}
              />
            )}

            {currentView === 'scheme-doc' && selectedProject && (
              <EditableSchemeForm
                project={selectedProject}
                onBack={handleBackToDashboard}
                onRegenerate={async () => {
                  try {
                    await fetch(`/api/projects/${selectedProject.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ isRegeneratingPending: true })
                    });
                  } catch (err) {
                    console.error("Failed to update project regeneration status:", err);
                  }

                  // Clear client-side project fields
                  selectedProject.schemeDocText = undefined;
                  selectedProject.schemeData = undefined;
                  selectedProject.isRegeneratingPending = true;

                  // Clear upload and config states in client state
                  setProjectUploadStates(prev => ({
                    ...prev,
                    [selectedProject.id]: {
                      CSVProgress: null,
                      dicomProgress: null,
                      imageProgress: null,
                      CSVFileName: null,
                      dicomFileName: null,
                      imageFileName: null,
                      isUploading: false,
                      isCompleted: false,
                      isConfigCompleted: false,
                      parsedCSVFields: [],
                      parsedDICOMFields: []
                    }
                  }));

                  setCurrentView('scheme');
                }}
              />
            )}

            {currentView === 'processing' && selectedProject && (
              <AnonymizationProcessing 
                project={selectedProject} 
                onBack={handleBackToDashboard} 
                onGoToScheme={() => setCurrentView('scheme')}
                initialStep={processingInitialStep || undefined}
                onSaveSuccess={() => setShowSaveSuccess(true)}
                uploadState={projectUploadStates[selectedProject.id] || {
                  CSVProgress: null,
                  dicomProgress: null,
                  imageProgress: null,
                  CSVFileName: null,
                  dicomFileName: null,
                  imageFileName: null,
                  isUploading: false,
                  isCompleted: false,
                  parsedCSVFields: [],
                  parsedDICOMFields: []
                }}
                onStartUpload={(CSVFile, dicomFile, imageFile) => startBackgroundUpload(selectedProject.id, CSVFile, dicomFile, imageFile)}
                onUpdateUploadState={(state) => {
                  setProjectUploadStates(prev => ({
                    ...prev,
                    [selectedProject.id]: {
                      ...(prev[selectedProject.id] || {
                        CSVProgress: null,
                        dicomProgress: null,
                        CSVFileName: null,
                        dicomFileName: null,
                        isUploading: false,
                        isCompleted: false,
                        parsedCSVFields: [],
                        parsedDICOMFields: []
                      }),
                      ...state
                    }
                  }));
                }}
              />
            )}

            {currentView === 'evaluation' && selectedProject && (
              <AnonymizationEvaluation 
                project={selectedProject} 
                onBack={handleBackToDashboard} 
                onUpdateProject={(updatedProject) => {
                  setSelectedProject(updatedProject);
                }}
                uploadState={projectUploadStates[selectedProject.id] || {
                  CSVProgress: null,
                  dicomProgress: null,
                  CSVFileName: null,
                  dicomFileName: null,
                  isUploading: false,
                  isCompleted: false,
                  parsedCSVFields: [],
                  parsedDICOMFields: []
                }}
              />
            )}

            {currentView === 'system-mgmt' && (
              <SystemManagement />
            )}

            {currentView === 'env-config' && (
              <EnvironmentConfig onBack={handleBackToDashboard} />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Logout Notice Toast */}
      {logoutNotice && (
        <div className="fixed top-6 right-6 z-50 bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 animate-fade-in">
          <LogOut className="w-4 h-4 text-slate-300" />
          <span>已成功退出登录</span>
        </div>
      )}

      {/* Save Success Modal */}
      {showSaveSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">保存成功</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                匿名化策略保存成功！
              </p>
            </div>
            <button
              id="strategy_save_success_dismiss_btn"
              onClick={() => setShowSaveSuccess(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded shadow-xs transition-colors cursor-pointer"
            >
              确定
            </button>
          </div>
        </div>
      )}

      {/* Professional toB Dashboard Footer */}
      <footer className="bg-white border-t border-gray-150 py-6" id="platform_footer">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center space-x-2.5">
            <Database className="w-4 h-4 text-gray-300" />
            <span>医疗健康数据去标识化智能安全管理控制系统 (V3.2.0-Enterprise)</span>
          </div>
          <div className="flex space-x-4">
            <span className="flex items-center space-x-1">
              <Server className="w-3.5 h-3.5 text-gray-300" />
              <span>专线数据节点: RUIJIN_HIS_NODE</span>
            </span>
            <span className="flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-gray-300" />
              <span>国家标准: GB/T 37964 严密符合</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
