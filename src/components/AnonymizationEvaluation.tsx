import React, { useState, useEffect } from "react";
import { Project, UploadState, FieldConfig } from "../types";
import { 
  ArrowLeft, Play, BarChart2, X, Loader2, Sparkles, Plus, Search, 
  Server, Clock, AlertTriangle, CheckCircle2, Power, Eye, Settings2, 
  ShieldCheck, HelpCircle, Info, Cpu, ChevronDown, ChevronRight
} from "lucide-react";
import { STANDARD_CSV_FIELDS, STANDARD_DICOM_FIELDS } from "../lib/constants";
import { DICOM_TAGS, ANONYMIZATION_FIELDS } from "./EditableSchemeForm";
import AnonymizationPreview from "./AnonymizationPreview";

interface AnonymizationEvaluationProps {
  project: Project;
  onBack: () => void;
  uploadState?: UploadState;
  onUpdateProject?: (updated: Project) => void;
}

interface TaskItem {
  id: string;
  name: string;
  modality: 'CSV 结构化文本数据' | 'DICOM 影像数据';
  status: '等待执行' | '执行中' | '已完成' | '异常中断' | '手动结束' | '启动中';
  servers: string[];
  startTime: string;
  endTime: string;
  createdAt: string;
  total: number;
  success: number;
  failure: number;
  progress?: number;
  duration?: string;
}

const SERVERS = [
  "服务器 A (瑞金医院 HIS 数据库)",
  "服务器 B (瑞金医院 PACS 影像存储)",
  "服务器 C (张江去标识科研中心云)"
];

// 媒体数据（DICOM影像数据 / 图片数据）目录树形结构弹窗
function MediaDirectoryStatsModal({
  data,
  onClose
}: {
  data: any;
  onClose: () => void;
}) {
  const isDicom = data.modality === "DICOM影像数据";
  const title = isDicom ? "DICOM-frame_0001" : (data.category && data.category !== "-" ? `IMG-${data.category}` : "DICOM-frame_0001");
  const rootName = "dicom";

  const [rootExpanded, setRootExpanded] = useState<boolean>(true);
  const [expandedSubDirs, setExpandedSubDirs] = useState<string[]>(["p1"]);

  const toggleSubDir = (subDir: string) => {
    setExpandedSubDirs(prev => 
      prev.includes(subDir) ? prev.filter(s => s !== subDir) : [...prev, subDir]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="dimension_stats_modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-left animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary line */}
        <div className="flex items-center gap-6 sm:gap-8 text-sm font-bold text-slate-800 pb-4">
          <div className="flex items-center">
            <span className="text-slate-700">文件总数： </span>
            <span className="font-extrabold text-slate-900 font-mono ml-1">4,000</span>
          </div>
          <div className="flex items-center">
            <span className="text-slate-700">一级目录总数： </span>
            <span className="font-extrabold text-slate-900 font-mono ml-1">10</span>
          </div>
          <div className="flex items-center">
            <span className="text-slate-700">二级目录总数： </span>
            <span className="font-extrabold text-slate-900 font-mono ml-1">100</span>
          </div>
        </div>

        {/* Tree Container */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-[460px] overflow-y-auto">
          {/* Root Level */}
          <div 
            onClick={() => setRootExpanded(!rootExpanded)}
            className="py-3 px-4 flex items-center border-b border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer select-none"
          >
            {rootExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            )}
            <span className="font-bold text-slate-900 text-sm">{rootName}</span>
            <span className="font-bold text-blue-600 text-sm ml-1.5">(子目录数:10)</span>
          </div>

          {/* Level 1 Subdirs (p1 - p10) */}
          {rootExpanded && (
            <div>
              {Array.from({ length: 10 }, (_, i) => `p${i + 1}`).map((subDir) => {
                const isExpanded = expandedSubDirs.includes(subDir);
                return (
                  <div key={subDir}>
                    <div 
                      onClick={() => toggleSubDir(subDir)}
                      className="py-3 px-4 pl-10 flex items-center border-b border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer select-none"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                      )}
                      <span className="font-bold text-slate-900 text-sm">{subDir}</span>
                      <span className="font-bold text-blue-600 text-sm ml-1.5">(子目录数:10)</span>
                    </div>

                    {/* Level 2 Leaf Files (v001 - v010) */}
                    {isExpanded && (
                      <div className="bg-white">
                        {Array.from({ length: 10 }, (_, j) => {
                          const fileNum = String(j + 1).padStart(3, '0');
                          const fileName = `v${fileNum}`;
                          return (
                            <div 
                              key={fileName}
                              className="py-3 px-4 pl-16 flex items-center border-b border-slate-100 hover:bg-slate-50/50 transition-colors select-none"
                            >
                              <span className="font-bold text-slate-900 text-sm">{fileName}</span>
                              <span className="font-bold text-emerald-600 text-sm ml-1.5">(文件数:40)</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnonymizationEvaluation({ project, onBack, uploadState, onUpdateProject }: AnonymizationEvaluationProps) {
  const getFieldStatsData = (fieldName: string, fieldNameZh: string) => {
    if (fieldName === "age" || fieldNameZh === "就诊年龄") {
      return {
        fieldName: "age",
        name: "就诊年龄",
        total: 5612,
        data: [
          { value: "60-64岁", count: 800, freq: "14.3%" },
          { value: "65-69岁", count: 750, freq: "13.4%" },
          { value: "70-74岁", count: 700, freq: "12.5%" },
          { value: "55-59岁", count: 650, freq: "11.6%" },
          { value: "50-54岁", count: 550, freq: "9.8%" },
          { value: "75-79岁", count: 500, freq: "8.9%" },
          { value: "45-49岁", count: 450, freq: "8.0%" },
          { value: "40-44岁", count: 350, freq: "6.2%" },
          { value: "80-84岁", count: 250, freq: "4.4%" },
          { value: "35-39岁", count: 200, freq: "3.6%" },
          { value: "30-34岁", count: 150, freq: "2.7%" },
          { value: "25-29岁", count: 100, freq: "1.8%" },
          { value: "85-89岁", count: 50, freq: "0.9%" },
          { value: "20-24岁", count: 40, freq: "0.7%" },
          { value: "90岁及以上", count: 30, freq: "0.5%" },
          { value: "15-19岁", count: 20, freq: "0.3%" },
          { value: "10-14岁", count: 12, freq: "0.2%" },
          { value: "5-9岁", count: 6, freq: "0.1%" },
          { value: "0-4岁", count: 4, freq: "0.1%" }
        ]
      };
    } else {
      return {
        fieldName: fieldName,
        name: fieldNameZh,
        total: 1390,
        data: [
          { value: "特征值 A", count: 208, freq: "15.0%" },
          { value: "特征值 B", count: 188, freq: "13.5%" },
          { value: "特征值 C", count: 177, freq: "12.7%" },
          { value: "特征值 D", count: 167, freq: "12.0%" },
          { value: "特征值 E", count: 156, freq: "11.2%" },
          { value: "特征值 F", count: 145, fontNormal: true, freq: "10.4%" },
          { value: "特征值 G", count: 125, freq: "9.0%" },
          { value: "特征值 H", count: 104, freq: "7.5%" },
          { value: "特征值 I", count: 63, freq: "4.5%" },
          { value: "特征值 J", count: 31, freq: "2.2%" },
          { value: "特征值 K", count: 11, freq: "0.8%" },
          { value: "特征值 L", count: 7, freq: "0.5%" },
          { value: "特征值 M", count: 4, freq: "0.3%" },
          { value: "特征值 N", count: 3, freq: "0.2%" },
          { value: "特征值 O", count: 3, freq: "0.2%" }
        ]
      };
    }
  };

  // Task list state initialized with realistic seed tasks
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "TASK-1002",
      name: "20260715-001",
      modality: "DICOM 影像数据",
      status: "执行中",
      servers: ["服务器 A (瑞金医院 HIS 数据库)", "服务器 B (瑞金医院 PACS 影像存储)"],
      startTime: "2026-07-15 03:00:00",
      endTime: "-",
      createdAt: "2026-07-15 02:50:00",
      total: 1000,
      success: 650,
      failure: 0,
      progress: 65,
      duration: "1h56min"
    },
    {
      id: "TASK-1003",
      name: "20260714-004",
      modality: "CSV 结构化文本数据",
      status: "启动中",
      servers: ["服务器 C (张江去标识科研中心云)"],
      startTime: "2026-07-14 18:30:00",
      endTime: "-",
      createdAt: "2026-07-14 18:00:00",
      total: 1000,
      success: 0,
      failure: 0,
      duration: "-"
    },
    {
      id: "TASK-1004",
      name: "20260714-003",
      modality: "DICOM 影像数据",
      status: "异常中断",
      servers: ["服务器 B (瑞金医院 PACS 影像存储)"],
      startTime: "2026-07-14 16:30:00",
      endTime: "2026-07-14 16:31:12",
      createdAt: "2026-07-14 16:00:00",
      total: 1000,
      success: 420,
      failure: 15,
      duration: "1min"
    },
    {
      id: "TASK-1005",
      name: "20260714-002",
      modality: "CSV 结构化文本数据",
      status: "手动结束",
      servers: ["服务器 A (瑞金医院 HIS 数据库)"],
      startTime: "2026-07-14 11:15:00",
      endTime: "2026-07-14 11:15:30",
      createdAt: "2026-07-14 11:10:00",
      total: 1000,
      success: 230,
      failure: 0,
      duration: "30min"
    },
    {
      id: "TASK-1001",
      name: "20260714-001",
      modality: "CSV 结构化文本数据",
      status: "已完成",
      servers: ["服务器 A (瑞金医院 HIS 数据库)"],
      startTime: "2026-07-14 10:00:00",
      endTime: "2026-07-14 10:50:00",
      createdAt: "2026-07-14 09:55:00",
      total: 1000,
      success: 995,
      failure: 5,
      duration: "50min"
    }
  ]);

  // UI state
  const [statusFilter, setStatusFilter] = useState("全部");
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);
  const [previewTaskRow, setPreviewTaskRow] = useState<any | null>(null);
  const [policyChangedAlertOpen, setPolicyChangedAlertOpen] = useState(false);

  // K-value calculation state for tasks
  const [taskKCalcStates, setTaskKCalcStates] = useState<{[taskId: string]: {
    status: 'idle' | 'calculating' | 'completed' | 'interrupted';
    progress: number;
    result?: number;
  }}>({});

  // Rerun confirmation task state
  const [rerunConfirmTask, setRerunConfirmTask] = useState<TaskItem | null>(null);

  // Scheduled datetime state
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  const getTaskDuration = (task: TaskItem): string => {
    if (task.duration) return task.duration;
    if (task.id === 'TASK-1001') return '50min';
    if (task.id === 'TASK-1002') return '1h56min';
    if (task.id === 'TASK-1003') return '-';
    if (task.id === 'TASK-1004') return '1min';
    if (task.id === 'TASK-1005') return '30min';
    if (task.status === '等待执行') return '-';
    return '1min';
  };

  // Keep a ref to store active intervals for K-value calculations
  const kCalcIntervals = React.useRef<{[taskId: string]: any}>({});

  const handleStartKCalc = (taskId: string) => {
    // Clear any existing interval
    if (kCalcIntervals.current[taskId]) {
      clearInterval(kCalcIntervals.current[taskId]);
    }

    setTaskKCalcStates(prev => ({
      ...prev,
      [taskId]: { status: 'calculating', progress: 0 }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(kCalcIntervals.current[taskId]);
        const kResult = taskId === 'TASK-1001' ? 8 : (taskId === 'TASK-1004' ? 5 : 12);
        setTaskKCalcStates(prev => ({
          ...prev,
          [taskId]: { status: 'completed', progress: 100, result: kResult }
        }));
      } else {
        setTaskKCalcStates(prev => ({
          ...prev,
          [taskId]: { status: 'calculating', progress }
        }));
      }
    }, 300);

    kCalcIntervals.current[taskId] = interval;
  };

  const handleInterruptKCalc = (taskId: string) => {
    if (kCalcIntervals.current[taskId]) {
      clearInterval(kCalcIntervals.current[taskId]);
    }
    setTaskKCalcStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], status: 'interrupted' }
    }));
  };

  const handleRerunTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: '执行中',
          progress: 0,
          success: 0,
          failure: 0,
          startTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          endTime: '-',
          duration: '1min'
        };
      }
      return t;
    }));
    setRerunConfirmTask(null);
  };

  useEffect(() => {
    return () => {
      Object.values(kCalcIntervals.current).forEach(clearInterval);
    };
  }, []);

  // States for Task Details Table
  const [detailRows, setDetailRows] = useState([
    {
      modality: "CSV文本数据",
      category: "住院信息",
      total: "5,612",
      success: "5,612",
      failure: "0",
      status: "已完成" as const,
      duration: "1h5m",
      dataSource: "test002.csv"
    },
    {
      modality: "CSV文本数据",
      category: "检查信息",
      total: "1,390",
      success: "1,370",
      failure: "20",
      status: "已完成" as const,
      duration: "46min",
      dataSource: "test9999.csv"
    },
    {
      modality: "CSV文本数据",
      category: "检验信息",
      total: "2,432",
      success: "2,432",
      failure: "0",
      status: "异常中断" as const,
      duration: "15m",
      dataSource: "test001.csv"
    },
    {
      modality: "DICOM影像数据",
      category: "-",
      total: "8,677",
      success: "546",
      failure: "50",
      status: "进行中" as const,
      progress: 34,
      duration: "1h56min",
      dataSource: "disk01/data/dicom"
    },
    {
      modality: "图片数据",
      category: "门诊就诊记录",
      total: "1,348",
      success: "42",
      failure: "23",
      status: "进行中" as const,
      progress: 12,
      duration: "1h56min",
      dataSource: "disk01/data/image"
    },
    {
      modality: "图片数据",
      category: "门诊医嘱",
      total: "2,348",
      success: "342",
      failure: "0",
      status: "进行中" as const,
      progress: 45,
      duration: "1h56min",
      dataSource: "disk01/data/image/record"
    }
  ]);

  // Timer to increment progress on '进行中' items of detailRows
  useEffect(() => {
    const timer = setInterval(() => {
      setDetailRows(prev => prev.map(row => {
        if (row.status === "进行中" && row.progress !== undefined && row.progress < 100) {
          const nextProgress = Math.min(row.progress + 1, 99);
          const totalNum = parseInt(row.total.replace(/,/g, '')) || 0;
          const failureNum = parseInt(row.failure.replace(/,/g, '')) || 0;
          // Dynamically compute success based on progress percentage
          const nextSuccess = Math.round((totalNum - failureNum) * (nextProgress / 100));
          return {
            ...row,
            progress: nextProgress,
            success: nextSuccess.toLocaleString()
          };
        }
        return row;
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const [viewingRuleRow, setViewingRuleRow] = useState<any | null>(null);
  const [dimensionStatsModal, setDimensionStatsModal] = useState<any | null>(null);
  const [failureDetailsModal, setFailureDetailsModal] = useState<any | null>(null);
  const [selectedFailureReasonIdx, setSelectedFailureReasonIdx] = useState<number>(0);
  const [taskNotSupportedAlertOpen, setTaskNotSupportedAlertOpen] = useState(false);
  const [stopTaskConfirm, setStopTaskConfirm] = useState<TaskItem | null>(null);
  const [viewingKCalculatedStats, setViewingKCalculatedStats] = useState<{
    fieldName: string;
    name: string;
    total: number;
    data: { value: string; count: number; freq: string }[];
  } | null>(null);
  const [kCalculatedStatsPage, setKCalculatedStatsPage] = useState(1);

  // States for K-value calculation
  const [isKCalcModalOpen, setIsKCalcModalOpen] = useState(false);
  const [selectedCsvTaskIdForK, setSelectedCsvTaskIdForK] = useState(project.kTasks?.csvTaskId || "");
  const [selectedDicomTaskIdForK, setSelectedDicomTaskIdForK] = useState(project.kTasks?.dicomTaskId || "");
  const [isCalculatingK, setIsCalculatingK] = useState(false);

  // Global K-value calculation state next to "创建任务" button
  const [globalKCalcState, setGlobalKCalcState] = useState<'idle' | 'calculating' | 'completed'>('idle');
  const [globalKValue, setGlobalKValue] = useState<number | null>(null);
  const [showReadOnlyMapping, setShowReadOnlyMapping] = useState(false);

  // Sync state with selected project if it changes
  useEffect(() => {
    setSelectedCsvTaskIdForK(project.kTasks?.csvTaskId || "");
    setSelectedDicomTaskIdForK(project.kTasks?.dicomTaskId || "");
  }, [project]);

  // New task form state
  const [newTaskName, setNewTaskName] = useState("");
  const [newModality, setNewModality] = useState<'CSV 结构化文本数据' | 'DICOM 影像数据'>('CSV 结构化文本数据');
  const [newSelectedServers, setNewSelectedServers] = useState<string[]>([]);
  const [newTimeMode, setNewTimeMode] = useState<'immediate' | 'scheduled'>('immediate');
  
  // Datetime states for scheduled run
  const [schedYear, setSchedYear] = useState("2026");
  const [schedMonth, setSchedMonth] = useState("07");
  const [schedDay, setSchedDay] = useState("15");
  const [schedHour, setSchedHour] = useState("12");
  const [schedMinute, setSchedMinute] = useState("00");
  const [schedSecond, setSchedSecond] = useState("00");

  // Interaction Column states for details view
  const [executionState, setExecutionState] = useState<{ [fieldId: string]: { status: 'idle' | 'running' | 'completed', progress: number, interval?: number } }>({});
  const [intervalPromptField, setIntervalPromptField] = useState<{ id: string, name: string, isDicom: boolean } | null>(null);
  const [tempInterval, setTempInterval] = useState(10);
  const [statsViewField, setStatsViewField] = useState<{ id: string, name: string, fieldType: 'text' | 'num', interval?: number, isDicom: boolean } | null>(null);

  // Automatically progress simulated "执行中" tasks
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks(prevTasks => {
        let changed = false;
        const nextTasks = prevTasks.map(task => {
          if (task.status === '执行中' && task.id !== 'TASK-1002') {
            changed = true;
            const currentProgress = task.progress !== undefined ? task.progress : 0;
            if (currentProgress < 100) {
              const step = Math.floor(Math.random() * 12) + 8;
              const nextProgress = Math.min(100, currentProgress + step);
              const isCompleted = nextProgress === 100;
              
              // simulated counts
              const totalAmount = task.total || 1000;
              const successAmt = Math.round(totalAmount * (nextProgress / 100));
              const failureAmt = isCompleted ? (task.id === 'TASK-1004' ? 15 : 0) : 0;

              return {
                ...task,
                progress: isCompleted ? undefined : nextProgress,
                status: isCompleted ? '已完成' : '执行中',
                success: successAmt,
                failure: failureAmt,
                endTime: isCompleted ? new Date().toISOString().replace('T', ' ').substring(0, 19) : task.endTime
              };
            }
          }
          return task;
        });
        return changed ? nextTasks : prevTasks;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Filter tasks by status filter
  const filteredTasks = tasks.filter(task => {
    if (statusFilter === '全部') return true;
    if (statusFilter === '进行中') return task.status === '执行中';
    return task.status === statusFilter;
  });

  // Toggle server selection
  const handleToggleServer = (srv: string) => {
    setNewSelectedServers(prev => 
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  // Launch task handler
  const handleLaunchTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      alert("请输入任务名称");
      return;
    }
    
    // Default server if none is specified or hidden from form
    let serversToUse = newSelectedServers;
    if (serversToUse.length === 0) {
      serversToUse = [SERVERS[0]];
    }

    const taskId = `TASK-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    let scheduledTimeStr = "-";
    let initStatus: TaskItem['status'] = '执行中';
    
    if (newTimeMode === 'scheduled') {
      scheduledTimeStr = scheduledDateTime ? scheduledDateTime.replace('T', ' ') + ':00' : nowStr;
      initStatus = '等待执行';
    }

    const newTask: TaskItem = {
      id: taskId,
      name: newTaskName.trim(),
      modality: newModality || 'CSV 结构化文本数据',
      status: initStatus,
      servers: serversToUse,
      startTime: initStatus === '执行中' ? nowStr : "-",
      endTime: "-",
      createdAt: nowStr,
      total: 1000,
      success: 0,
      failure: 0,
      progress: initStatus === '执行中' ? 0 : undefined,
      duration: initStatus === '执行中' ? '1min' : '-'
    };

    setTasks(prev => [newTask, ...prev]);
    setIsLaunchModalOpen(false);

    // reset form
    setNewTaskName("");
    setNewModality("CSV 结构化文本数据");
    setNewSelectedServers([SERVERS[0]]);
    setNewTimeMode("immediate");
    setScheduledDateTime("");
  };

  // Immediate execute action
  const handleStartTaskImmediately = (taskId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: '执行中',
          startTime: nowStr,
          progress: 0,
          success: 0,
          failure: 0
        };
      }
      return t;
    }));
  };

  // Handle K-value calculation submission
  const handleCalculateK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCsvTaskIdForK && !selectedDicomTaskIdForK) {
      alert("请选择至少一个已完成的去标识任务以计算k值");
      return;
    }

    setIsCalculatingK(true);

    // Simulate 1.5 seconds calculation time
    setTimeout(async () => {
      // Create a deterministic yet realistic K-value
      const expectedK = project.expectedK || 5;
      const mockActualK = expectedK + Math.floor(Math.random() * 4) + 1;

      try {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actualK: mockActualK,
            kTasks: {
              csvTaskId: selectedCsvTaskIdForK || undefined,
              dicomTaskId: selectedDicomTaskIdForK || undefined
            }
          })
        });

        if (response.ok) {
          const updatedProject = await response.json();
          if (onUpdateProject) {
            onUpdateProject(updatedProject);
          }
          setIsKCalcModalOpen(false);
        } else {
          alert("计算k值失败，请重试");
        }
      } catch (err) {
        console.error("Failed to compute and save actualK:", err);
        alert("计算k值出现异常");
      } finally {
        setIsCalculatingK(false);
      }
    }, 1500);
  };

  // Stop executing action
  const handleStopTask = (taskId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: '手动结束',
          endTime: nowStr,
          progress: undefined
        };
      }
      return t;
    }));
  };

  // Fields mapping for the selected task details page
  const getDetailFields = (): any[] => {
    if (!selectedTaskForDetail) return [];
    if (selectedTaskForDetail.modality === 'CSV 结构化文本数据') {
      return (uploadState && uploadState.parsedCSVFields && uploadState.parsedCSVFields.length > 0)
        ? uploadState.parsedCSVFields
        : STANDARD_CSV_FIELDS;
    } else {
      return (uploadState && uploadState.parsedDICOMFields && uploadState.parsedDICOMFields.length > 0)
        ? uploadState.parsedDICOMFields
        : STANDARD_DICOM_FIELDS;
    }
  };

  // Details Column execution simulation
  const handleStartExecution = (fieldId: string, fieldChineseName: string, fieldType: 'text' | 'num', isDicom: boolean, intervalValue?: number) => {
    setExecutionState(prev => ({
      ...prev,
      [fieldId]: { status: 'running', progress: 0, interval: intervalValue }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setExecutionState(prev => ({
          ...prev,
          [fieldId]: { status: 'completed', progress: 100, interval: intervalValue }
        }));
      } else {
        setExecutionState(prev => ({
          ...prev,
          [fieldId]: { status: 'running', progress, interval: intervalValue }
        }));
      }
    }, 400);
  };

  const handleCancelExecution = (fieldId: string) => {
    setExecutionState(prev => ({
      ...prev,
      [fieldId]: { status: 'idle', progress: 0 }
    }));
  };

  // Simulated Distribution Statistics data generator
  const getFieldStatistics = (fieldId: string, fieldName: string, fieldType: 'text' | 'num', interval?: number) => {
    if (fieldType === 'num') {
      const step = interval || 10;
      return [
        { value: `0 - ${step}`, count: 420, pct: 42 },
        { value: `${step} - ${step * 2}`, count: 310, pct: 31 },
        { value: `${step * 2} - ${step * 3}`, count: 180, pct: 18 },
        { value: `${step * 3} - ${step * 4}`, count: 70, pct: 7 },
        { value: `> ${step * 4}`, count: 20, pct: 2 },
      ];
    }

    if (fieldName.includes("性别") || fieldId.includes("gender")) {
      return [
        { value: "男 (Male)", count: 540, pct: 54 },
        { value: "女 (Female)", count: 460, pct: 46 },
      ];
    }
    if (fieldName.includes("医疗机构") || fieldName.includes("institution")) {
      return [
        { value: "瑞金总院", count: 780, pct: 78 },
        { value: "卢湾分院", count: 150, pct: 15 },
        { value: "临港分院", count: 70, pct: 7 },
      ];
    }
    // Generic fallback text fields
    return [
      { value: "类型 / 分类值 A", count: 500, pct: 50 },
      { value: "类型 / 分类值 B", count: 350, pct: 35 },
      { value: "类型 / 分类值 C", count: 150, pct: 15 },
    ];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="anonymization_tasks_workspace">
      
      {!selectedTaskForDetail ? (
        /* ================= MAIN TASK LIST VIEW ================= */
        <div className="space-y-6">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded text-slate-600 border-2 border-slate-200 hover:border-slate-400 transition-all cursor-pointer"
                title="返回项目列表"
              >
                <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
              <div>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>项目管理</span>
                  <span className="text-slate-300">/</span>
                  <span className="truncate max-w-[200px]">{project.name}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-blue-600 font-black">匿名化任务</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">匿名化任务</h1>
              </div>
            </div>
          </div>

          {/* Filter condition and Launch task button bar */}
          {/* Filter condition and Launch task button bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            {/* Filter Dropdown */}
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
              <span className="text-slate-500 font-bold shrink-0">任务状态：</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 cursor-pointer min-w-[120px]"
              >
                <option value="全部">全部</option>
                <option value="启动中">启动中</option>
                <option value="进行中">进行中</option>
                <option value="异常中断">异常中断</option>
                <option value="手动结束">手动结束</option>
                <option value="已完成">已完成</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              {/* Display "计算中" during loading */}
              {globalKCalcState === 'calculating' && (
                <span className="flex items-center space-x-1 px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-black animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  <span>计算中</span>
                </span>
              )}

              {/* Display K-value, matching 10.png pill box */}
              {globalKCalcState !== 'calculating' && (
                <div 
                  className="flex items-center space-x-2 px-3.5 py-2 bg-blue-50/40 border border-blue-200 rounded-lg text-xs font-bold text-blue-700 shadow-2xs select-none"
                  title="K值"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 font-black">K 值</span>
                  <span className="text-slate-900 font-black text-sm ml-1">
                    {globalKValue !== null ? globalKValue : 0}
                  </span>
                </div>
              )}

              {/* Launch Task Button */}
              <button
                onClick={() => {
                  setIsLaunchModalOpen(true);
                }}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-md shadow-blue-200/50 transition-colors cursor-pointer border-0"
              >
                <Plus className="w-4 h-4 stroke-[3px]" />
                <span>创建任务</span>
              </button>
            </div>
          </div>

          {/* 最新任务与历史任务列表 */}
          {(() => {
            // "20260715-001" 这条数据在最新任务中，其余数据在历史任务中
            const latestTasks = filteredTasks.filter(task => task.name === "20260715-001");
            const historyTasks = filteredTasks.filter(task => task.name !== "20260715-001");

            const renderTaskTable = (taskList: TaskItem[], emptyText: string, isLatestCard: boolean) => (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-200">
                      <th className="py-4 px-5 font-bold">任务名称</th>
                      <th className="py-4 px-4 font-bold text-center">任务状态</th>
                      <th className="py-4 px-4 font-bold text-center">
                        <div>任务情况</div>
                        <div className="text-[10px] text-slate-400 font-normal flex items-center justify-center space-x-1.5 mt-0.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00c5a0] mr-0.5"></span>
                          <span>成功</span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 ml-1 mr-0.5"></span>
                          <span>失败</span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5"></span>
                          <span>未完成</span>
                          <span className="text-slate-300 ml-1.5">|</span>
                          <span className="ml-1">成功/失败/总数</span>
                        </div>
                      </th>
                      <th className="py-4 px-4 font-bold">任务开始 ~ 结束时间</th>
                      <th className="py-4 px-4 font-bold text-center">耗时</th>
                      <th className="py-4 px-5 font-bold text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                    {taskList.length > 0 ? (
                      taskList.map((task) => {
                        const isLatestTask = isLatestCard || (tasks[0] && task.id === tasks[0].id);
                        return (
                          <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* Task name & ID */}
                            <td className="py-4 px-5">
                              <div className="font-black text-slate-900">{task.name}</div>
                            </td>

                            {/* Status badge with animated progression if running */}
                            <td className="py-4 px-4 text-center">
                              <div className="flex flex-col items-center justify-center space-y-1">
                                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                                  task.status === '已完成' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  task.status === '执行中' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  task.status === '启动中' ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse' :
                                  task.status === '等待执行' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  task.status === '异常中断' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  'bg-slate-100 text-slate-600 border-slate-300'
                                }`}>
                                  {(task.status === '执行中' || task.status === '启动中') && <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600 mr-0.5" />}
                                  <span>{task.status === '执行中' ? '进行中' : task.status}</span>
                                </span>
                                {task.status === '执行中' && task.progress !== undefined && task.id !== 'TASK-1002' && (
                                  <div className="w-24 mt-1">
                                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-0.5">
                                      <span>进度</span>
                                      <span>{task.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden border border-slate-200">
                                      <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Situation counts, formatted differently by data modality */}
                            <td className="py-4 px-4">
                              {task.status === '启动中' ? null : (() => {
                                const total = task.total || 1000;
                                const success = task.success || 0;
                                const failure = task.failure || 0;

                                const csv_ratio = 0.5;
                                const dicom_ratio = 0.3;

                                const csv_total = Math.round(total * csv_ratio);
                                const csv_failure = Math.min(csv_total, Math.round(failure * csv_ratio));
                                const progressPercent = total > 0 ? (success / total) : 0;
                                const csv_success = Math.min(csv_total - csv_failure, Math.round(csv_total * progressPercent));

                                const dicom_total = Math.round(total * dicom_ratio);
                                const dicom_failure = Math.min(dicom_total, Math.round(failure * dicom_ratio));
                                const dicom_success = Math.min(dicom_total - dicom_failure, Math.round(dicom_total * progressPercent));

                                const image_total = Math.max(0, total - csv_total - dicom_total);
                                const image_failure = Math.min(image_total, Math.max(0, failure - csv_failure - dicom_failure));
                                const image_success = Math.min(image_total - image_failure, Math.max(0, success - csv_success - dicom_success));

                                const renderModalityRow = (label: string, successVal: number, failureVal: number, totalVal: number) => {
                                  if (totalVal <= 0) return null;
                                  const sPct = Math.min(100, Math.max(0, (successVal / totalVal) * 100));
                                  const fPct = Math.min(100 - sPct, Math.max(0, (failureVal / totalVal) * 100));

                                  return (
                                    <div className="flex items-center space-x-3 text-[11px] leading-none py-1">
                                      {/* Label */}
                                      <span className="text-slate-500 font-bold w-11 shrink-0 text-left">{label}</span>

                                      {/* Progress Bar (green for success, amber for failure, light gray for uncompleted) */}
                                      <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden flex shrink-0">
                                        {sPct > 0 && (
                                          <div 
                                            className="bg-[#00c5a0] h-full transition-all duration-300" 
                                            style={{ width: `${sPct}%` }} 
                                          />
                                        )}
                                        {fPct > 0 && (
                                          <div 
                                            className="bg-amber-500 h-full transition-all duration-300" 
                                            style={{ width: `${fPct}%` }} 
                                          />
                                        )}
                                      </div>

                                      {/* Counts: 成功 / 失败 / 总数 (No percentage) */}
                                      <div className="font-mono text-[11px] flex items-center space-x-1 shrink-0">
                                        <span className="text-teal-600 font-bold">{successVal}</span>
                                        <span className="text-slate-300 font-normal">/</span>
                                        <span className={failureVal > 0 ? "text-amber-500 font-bold" : "text-slate-400 font-bold"}>
                                          {failureVal}
                                        </span>
                                        <span className="text-slate-300 font-normal">/</span>
                                        <span className="text-slate-700 font-bold">{totalVal}</span>
                                      </div>
                                    </div>
                                  );
                                };

                                return (
                                  <div className="flex flex-col space-y-1 font-bold text-[11px] leading-tight text-slate-700 min-w-[260px]">
                                    {renderModalityRow("CSV", csv_success, csv_failure, csv_total)}
                                    {renderModalityRow("DICOM", dicom_success, dicom_failure, dicom_total)}
                                    {renderModalityRow("图片", image_success, image_failure, image_total)}
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Start~End time */}
                            <td className="py-4 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                              <div>始: {task.startTime}</div>
                              {task.status !== '启动中' && task.status !== '执行中' && task.endTime && task.endTime !== '-' && (
                                <div className="mt-1 text-slate-400">终: {task.endTime}</div>
                              )}
                            </td>

                            {/* Duration column */}
                            <td className="py-4 px-4 font-mono text-[11px] text-slate-600 text-center whitespace-nowrap">
                              {getTaskDuration(task)}
                            </td>

                            {/* Action buttons matching status rules */}
                            <td className="py-4 px-5 text-center">
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                                {/* Rerun Failed if conditions are met: latest task, completed, has failures */}
                                {((isLatestTask && task.status === '已完成' && task.failure > 0) || task.name === '20260714-001') && (
                                  <button
                                    onClick={() => {
                                      if (task.name === '20260714-001') {
                                        setTaskNotSupportedAlertOpen(true);
                                      } else {
                                        setRerunConfirmTask(task);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded text-[10px] shadow-2xs transition-all cursor-pointer border-0"
                                  >
                                    <span>失败重跑</span>
                                  </button>
                                )}

                                {/* 启动中: 显示【结束任务】 */}
                                {task.status === '启动中' && (
                                  <button
                                    onClick={() => setStopTaskConfirm(task)}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded text-[10px] border border-rose-200 transition-colors cursor-pointer"
                                  >
                                    <span>结束任务</span>
                                  </button>
                                )}

                                {/* 等待执行: 显示【立即执行】 */}
                                {task.status === '等待执行' && (
                                  <button
                                    onClick={() => handleStartTaskImmediately(task.id)}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded text-[10px] shadow-2xs transition-colors cursor-pointer border-0"
                                  >
                                    <span>立即执行</span>
                                  </button>
                                )}

                                {/* 执行中: 显示【结束任务、详情】 */}
                                {task.status === '执行中' && (
                                  <>
                                    <button
                                      onClick={() => setStopTaskConfirm(task)}
                                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded text-[10px] border border-rose-200 transition-colors cursor-pointer"
                                    >
                                      <span>结束任务</span>
                                    </button>
                                    <button
                                      onClick={() => setSelectedTaskForDetail(task)}
                                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded text-[10px] border border-slate-300 transition-colors cursor-pointer"
                                    >
                                      <span>详情</span>
                                    </button>
                                  </>
                                )}

                                {/* 已完成: 显示【详情】 */}
                                {task.status === '已完成' && (
                                  <button
                                    onClick={() => setSelectedTaskForDetail(task)}
                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded text-[10px] border border-blue-200 transition-colors cursor-pointer"
                                  >
                                    <span>详情</span>
                                  </button>
                                )}

                                {/* 异常中断: 显示【立即执行、结束任务、详情】 */}
                                {task.status === '异常中断' && (
                                  <>
                                    {task.id === 'TASK-1004' ? (
                                      <button
                                        onClick={() => setTaskNotSupportedAlertOpen(true)}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded text-[10px] shadow-2xs transition-colors cursor-pointer border-0"
                                      >
                                        <span>继续执行</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleStartTaskImmediately(task.id)}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded text-[10px] shadow-2xs transition-colors cursor-pointer border-0"
                                      >
                                        <span>立即执行</span>
                                      </button>
                                    )}

                                    {task.id !== 'TASK-1004' && (
                                      <button
                                        onClick={() => setStopTaskConfirm(task)}
                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded text-[10px] border border-rose-200 transition-colors cursor-pointer"
                                      >
                                        <span>结束任务</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() => setSelectedTaskForDetail(task)}
                                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded text-[10px] border border-slate-300 transition-colors cursor-pointer"
                                    >
                                      <span>详情</span>
                                    </button>
                                  </>
                                )}

                                {/* 手动结束: 显示【详情】(不显示立即执行) */}
                                {task.status === '手动结束' && (
                                  <button
                                    onClick={() => setSelectedTaskForDetail(task)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded text-[10px] border border-slate-300 transition-colors cursor-pointer"
                                  >
                                    <span>详情</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 font-medium bg-slate-50/50">
                          {emptyText}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );

            return (
              <div className="space-y-6">
                {/* 1. 最新任务卡片（优先关注当前最新一条） */}
                <div className="bg-white rounded-xl border border-blue-300 ring-2 ring-blue-100/70 overflow-hidden shadow-xs">
                  <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/30">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[11px] font-black rounded tracking-wide">最新</span>
                      <span className="text-sm font-black text-slate-900">最新任务</span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">优先关注当前最新一条</span>
                  </div>
                  {renderTaskTable(latestTasks, "未匹配到符合条件的最新任务。", true)}
                </div>

                {/* 2. 历史任务卡片（仅可查看详情） */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                    <span className="text-sm font-black text-slate-900">历史任务</span>
                    <span className="text-xs text-slate-400 font-medium">仅可查看详情</span>
                  </div>
                  {renderTaskTable(historyTasks, "未匹配到符合条件的历史任务。", false)}
                </div>
              </div>
            );
          })()}
        </div>
      ) : previewTaskRow ? (
        /* ================= ANONYMIZATION PREVIEW SUBPAGE VIEW ================= */
        <AnonymizationPreview
          task={selectedTaskForDetail}
          row={previewTaskRow}
          onBack={() => setPreviewTaskRow(null)}
        />
      ) : (
        /* ================= TASK DETAIL SUBPAGE VIEW ================= */
        <div className="space-y-6 animate-fade-in">
          {/* Header & Back row */}
          <div className="flex items-center space-x-3 border-b border-slate-200 pb-5">
            <button 
              onClick={() => {
                setSelectedTaskForDetail(null);
                setPreviewTaskRow(null);
              }}
              className="p-2 hover:bg-slate-100 rounded text-slate-600 border-2 border-slate-200 hover:border-slate-400 transition-all cursor-pointer"
              title="返回匿名化任务列表"
            >
              <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
            <div>
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>项目管理</span>
                <span className="text-slate-300">/</span>
                <span>匿名化任务</span>
                <span className="text-slate-300">/</span>
                <span className="text-blue-600 font-black">任务详情</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                任务详情
              </h1>
            </div>
          </div>

          {/* Above Panel Summary display */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-950 p-6 shadow-md relative overflow-hidden flex flex-col space-y-5">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 bg-slate-800/40 rounded-full blur-2xl"></div>
            
            {/* Row 1: Task Name + Status, and Task ID */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">任务名称</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-base font-black text-white tracking-tight leading-snug">
                    {selectedTaskForDetail.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    selectedTaskForDetail.status === '已完成' ? 'bg-emerald-600 text-white' :
                    selectedTaskForDetail.status === '执行中' ? 'bg-blue-600 text-white' :
                    selectedTaskForDetail.status === '等待执行' ? 'bg-amber-600 text-white' :
                    selectedTaskForDetail.status === '异常中断' ? 'bg-rose-600 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {selectedTaskForDetail.status === '执行中' ? '进行中' : selectedTaskForDetail.status}
                  </span>
                </div>
              </div>
              <div className="md:text-right shrink-0">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">任务ID</span>
                <span className="text-xs font-mono text-blue-400 font-black tracking-wider block mt-1">{selectedTaskForDetail.id}</span>
              </div>
            </div>

            {/* Row 2: Created Time, and execution times + duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-bold text-slate-300">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">创建时间</span>
                <span className="text-sm font-mono text-slate-200 mt-1 block">
                  {selectedTaskForDetail.createdAt || "2026-07-14 09:55:00"}
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">执行时间及耗时</span>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 mt-1">
                  <div className="text-xs font-mono text-slate-400">始: {selectedTaskForDetail.startTime}</div>
                  <div className="text-xs font-mono text-slate-400">终: {selectedTaskForDetail.endTime}</div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 whitespace-nowrap self-start sm:self-auto sm:ml-2">
                    耗时: {selectedTaskForDetail.duration || "1h56m"}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">数据存储位置</span>
                <span className="text-sm font-mono text-slate-200 mt-1 block">
                  bysy/niminghua/jieguo
                </span>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-5">数据模态</th>
                    <th className="py-4 px-4">分类</th>
                    <th className="py-4 px-4 text-center">总数</th>
                    <th className="py-4 px-4 text-center">成功数</th>
                    <th className="py-4 px-4 text-center">失败数</th>
                    <th className="py-4 px-4 text-center">状态</th>
                    <th className="py-4 px-4 text-center">耗时</th>
                    <th className="py-4 px-5 text-center">匿名化预览</th>
                    <th className="py-4 px-5 text-center">匿名化策略</th>
                    <th className="py-4 px-5 text-center">数据来源</th>
                    <th className="py-4 px-5 text-center">报错信息</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {(() => {
                    const status = selectedTaskForDetail.status;
                    let filteredRows = [...detailRows];
                    if (status === '已完成') {
                      filteredRows = detailRows.filter(row => row.status === '已完成');
                    } else if (status === '异常中断') {
                      filteredRows = detailRows.filter(row => row.status === '已完成' || row.status === '异常中断');
                    } else if (status === '手动结束') {
                      filteredRows = detailRows.map(row => ({
                        ...row,
                        status: row.status === '进行中' ? '手动结束' as const : row.status
                      }));
                    }
                    return filteredRows.map((row, idx) => {
                      const isMedia = row.modality === "DICOM影像数据" || row.modality === "图片数据";
                      const hasFailures = parseInt(row.failure.replace(/,/g, '')) > 0;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                          {/* 数据模态 */}
                          <td className="py-4 px-5 text-slate-900 font-black">{row.modality}</td>

                          {/* 分类 */}
                          <td className="py-4 px-4 text-slate-500 font-medium">{row.category}</td>

                          {/* 总数 */}
                          <td className="py-4 px-4 text-center font-mono">
                            {isMedia ? (
                              <button
                                onClick={() => setDimensionStatsModal(row)}
                                className="text-blue-600 hover:text-blue-800 underline font-black cursor-pointer bg-transparent border-0"
                              >
                                {row.total}
                              </button>
                            ) : (
                              <span>{row.total}</span>
                            )}
                          </td>

                          {/* 成功数 */}
                          <td className="py-4 px-4 text-center font-mono text-emerald-600">{row.success}</td>

                          {/* 失败数 */}
                          <td className="py-4 px-4 text-center font-mono">
                            {hasFailures ? (
                              <button
                                onClick={() => {
                                  setSelectedFailureReasonIdx(0);
                                  setFailureDetailsModal(row);
                                }}
                                className="text-rose-600 hover:text-rose-800 underline font-black cursor-pointer bg-transparent border-0"
                              >
                                {row.failure}
                              </button>
                            ) : (
                              <span className="text-slate-400">{row.failure}</span>
                            )}
                          </td>

                          {/* 状态 */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-black border ${
                                row.status === '已完成' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                row.status === '进行中' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                row.status === '异常中断' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                row.status === '手动结束' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                                'bg-slate-100 text-slate-600 border-slate-300'
                              }`}>
                                {row.status === '进行中' && <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600 shrink-0" />}
                                <span>{row.status}</span>
                              </span>
                              {row.status === '进行中' && row.progress !== undefined && (
                                <div className="w-20 mt-1">
                                  <div className="flex justify-between text-[8px] text-slate-400 font-bold mb-0.5">
                                    <span>进度</span>
                                    <span>{row.progress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-0.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${row.progress}%` }}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 耗时 */}
                          <td className="py-4 px-4 text-center font-mono text-slate-500">{row.duration}</td>

                          {/* 匿名化预览 */}
                          <td className="py-4 px-5 text-center">
                            <button
                              onClick={() => setPreviewTaskRow(row)}
                              className="text-blue-600 hover:text-blue-800 font-black cursor-pointer bg-transparent border-0"
                            >
                              查看
                            </button>
                          </td>

                          {/* 匿名化策略 */}
                          <td className="py-4 px-5 text-center">
                            <button
                              onClick={() => setViewingRuleRow(row)}
                              className="text-blue-600 hover:text-blue-800 font-black cursor-pointer bg-transparent border-0"
                            >
                              查看
                            </button>
                          </td>

                          {/* 数据来源 */}
                          <td className="py-4 px-5 text-center text-slate-500 font-medium">
                            {row.dataSource || "-"}
                          </td>

                          {/* 报错信息 */}
                          <td className="py-4 px-5 text-center font-bold text-rose-600">
                            {row.status === '异常中断' ? '连接主节点超时，传输异常中断 (错误码: 504)' : '-'}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: LAUNCH NEW TASK ================= */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="launch_task_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">创建任务</h3>
              </div>
              <button 
                onClick={() => setIsLaunchModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-left">
              <div className="text-slate-700 text-sm font-bold leading-relaxed">
                本项目下存在进行中的任务，无法再次创建任务，您可以等待任务执行完成或手动结束任务后再次创建任务
              </div>

              {/* Action buttons */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLaunchModalOpen(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-950 text-white text-xs font-black rounded uppercase tracking-wider transition-colors border-0 cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= POLICY CHANGED ALERT MODAL ================= */}
      {policyChangedAlertOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="policy_changed_alert_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                <h3 className="font-black text-sm uppercase tracking-wider">提示</h3>
              </div>
              <button 
                onClick={() => setPolicyChangedAlertOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 space-y-4 text-left">
              <div className="text-slate-700 text-sm font-bold leading-relaxed">
                匿名化策略存在变更，无法执行当前任务，请重新创建任务
              </div>
            </div>
            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 flex justify-end">
              <button
                onClick={() => setPolicyChangedAlertOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-950 text-white text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer border-0"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TASK NOT SUPPORTED ALERT MODAL ================= */}
      {taskNotSupportedAlertOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="task_not_supported_alert_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                <h3 className="font-black text-sm uppercase tracking-wider">提示</h3>
              </div>
              <button 
                onClick={() => setTaskNotSupportedAlertOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 space-y-4 text-left">
              <div className="text-slate-700 text-sm font-bold leading-relaxed">
                本项目下已存在新的任务，暂不支持在当前任务上执行操作
              </div>
            </div>
            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 flex justify-end">
              <button
                onClick={() => setTaskNotSupportedAlertOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-950 text-white text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer border-0"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STOP TASK CONFIRMATION MODAL ================= */}
      {stopTaskConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="stop_task_confirm_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                <h3 className="font-black text-sm uppercase tracking-wider">确认结束任务</h3>
              </div>
              <button 
                onClick={() => setStopTaskConfirm(null)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 space-y-4 text-left">
              <div className="text-slate-700 text-sm font-bold leading-relaxed">
                是否确认结束{stopTaskConfirm.name}任务？
              </div>
            </div>
            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 flex justify-end space-x-2">
              <button
                onClick={() => setStopTaskConfirm(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer border-0"
              >
                取消
              </button>
              <button
                onClick={() => {
                  handleStopTask(stopTaskConfirm.id);
                  setStopTaskConfirm(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer border-0"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW STATS MODAL (查看统计弹窗) ================= */}
      {viewingKCalculatedStats && (() => {
        const stats = viewingKCalculatedStats;
        const totalCount = stats.total;
        const itemsPerPage = 10;
        const totalPages = Math.ceil(stats.data.length / itemsPerPage);
        const startIndex = (kCalculatedStatsPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = stats.data.slice(startIndex, endIndex);

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-fade-in" id="k_calculated_stats_modal">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-2xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    统计结果-{stats.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setViewingKCalculatedStats(null)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto text-left flex-1">
                <div className="text-xs font-bold text-slate-700">
                  总数：{totalCount.toLocaleString()} 
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-5">字段值</th>
                        <th className="py-3 px-4 text-center">出现次数</th>
                        <th className="py-3 px-4 text-center">出现频率</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-5 text-slate-900 font-normal">{item.value}</td>
                          <td className="py-3 px-4 text-center font-mono text-slate-600">{item.count.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-600">{item.freq}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
                    <span>
                      第 {kCalculatedStatsPage} / {totalPages} 页
                    </span>
                    <div className="flex space-x-1">
                      <button
                        disabled={kCalculatedStatsPage === 1}
                        onClick={() => setKCalculatedStatsPage(prev => Math.max(1, prev - 1))}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-600 text-xs font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        上一页
                      </button>
                      <button
                        disabled={kCalculatedStatsPage === totalPages}
                        onClick={() => setKCalculatedStatsPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-600 text-xs font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                <button 
                  onClick={() => setViewingKCalculatedStats(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= MODAL: K-VALUE CALCULATION ================= */}
      {isKCalcModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="k_calc_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="font-black text-sm uppercase tracking-wider">
                  {project.actualK !== undefined ? '修改k值计算任务 & 重新计算' : '计算实际k值'}
                </h3>
              </div>
              <button 
                onClick={() => setIsKCalcModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                disabled={isCalculatingK}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {isCalculatingK ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  正在读取已完成的去标识数据集...
                </p>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-xs">
                  系统正在并行对选定的结构化文本等价类与影像去标结果进行安全重叠分析与重标识概率矩阵碰撞，耗时约需数秒...
                </p>
              </div>
            ) : (
              <form onSubmit={handleCalculateK} className="p-6 space-y-5 text-left">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">项目安全定级基准</div>
                  <div className="text-xs font-bold text-slate-700 flex justify-between items-center">
                    <span>预期 K-Anonymity 安全值:</span>
                    <span className="text-purple-600 font-black bg-purple-50 px-2.5 py-1 rounded border border-purple-100">
                      预期k值 = {project.expectedK || 5}
                    </span>
                  </div>
                  {project.actualK !== undefined && (
                    <div className="text-xs font-bold text-slate-700 flex justify-between items-center mt-2 pt-2 border-t border-slate-200/60">
                      <span>当前已计算实际 k 值:</span>
                      <span className="text-emerald-600 font-black bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                        实际k值 = {project.actualK}
                      </span>
                    </div>
                  )}
                </div>

                {/* CSV Modality Task Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    CSV 结构化文本数据 任务选择 (已完成)
                  </label>
                  {tasks.filter(t => t.modality === 'CSV 结构化文本数据' && t.status === '已完成').length > 0 ? (
                    <select
                      value={selectedCsvTaskIdForK}
                      onChange={(e) => setSelectedCsvTaskIdForK(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 cursor-pointer"
                    >
                      <option value="">-- 不选择 (本次计算不合并此模态) --</option>
                      {tasks
                        .filter(t => t.modality === 'CSV 结构化文本数据' && t.status === '已完成')
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            [{t.id}] {t.name} (完成时间: {t.endTime || t.createdAt})
                          </option>
                        ))
                      }
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50/50 border border-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>暂无已完成的 CSV 结构化文本任务。请先发起并完成该类型的任务。</span>
                    </div>
                  )}
                </div>

                {/* DICOM Modality Task Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    DICOM 影像数据 任务选择 (已完成)
                  </label>
                  {tasks.filter(t => t.modality === 'DICOM 影像数据' && t.status === '已完成').length > 0 ? (
                    <select
                      value={selectedDicomTaskIdForK}
                      onChange={(e) => setSelectedDicomTaskIdForK(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 cursor-pointer"
                    >
                      <option value="">-- 不选择 (本次计算不合并此模态) --</option>
                      {tasks
                        .filter(t => t.modality === 'DICOM 影像数据' && t.status === '已完成')
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            [{t.id}] {t.name} (完成时间: {t.endTime || t.createdAt})
                          </option>
                        ))
                      }
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50/50 border border-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>暂无已完成的 DICOM 影像数据任务。请等候现有任务执行完毕或发起新任务。</span>
                    </div>
                  )}
                </div>

                {/* Guidance Helper */}
                <div className="text-[11px] text-slate-500 font-bold leading-relaxed bg-slate-50 p-3 rounded border border-slate-200/55 flex items-start space-x-2">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    系统支持只选择一个类型，也可以选择两个类型。每个类型只能选择一个已完成状态的任务。
                    点击“确认并计算”后，系统将自动进行多模态等价类聚合分析，输出最终合规的实际k值并固化记录。
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsKCalcModalOpen(false)}
                    className="px-5 py-2.5 rounded border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-wider transition-colors bg-white cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedCsvTaskIdForK && !selectedDicomTaskIdForK}
                    className={`px-6 py-2.5 rounded text-white text-xs font-black uppercase tracking-wider shadow-md transition-all border-0 ${
                      (!selectedCsvTaskIdForK && !selectedDicomTaskIdForK)
                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-purple-600 hover:bg-purple-700 cursor-pointer shadow-purple-100'
                    }`}
                  >
                    确认并计算
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 2: NUMERICAL INTERVAL PROMPT ================= */}
      {intervalPromptField && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-scale-up text-left">
            <div className="flex items-center space-x-2 text-slate-800 font-black text-sm">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              <span>输入统计间隔 - {intervalPromptField.name}</span>
            </div>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              对数值型字段（{intervalPromptField.name}）进行去标识化区间分桶统计，请输入您的数值区间间隔（步长）：
            </p>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-1">统计间隔 (步长)</label>
              <input 
                type="number" 
                value={tempInterval} 
                onChange={(e) => setTempInterval(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-sm font-black p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                placeholder="例如：5 或 10"
              />
            </div>
            <div className="flex justify-end space-x-2 text-xs">
              <button 
                onClick={() => setIntervalPromptField(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg cursor-pointer transition-colors border-0"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  const fieldId = intervalPromptField.id;
                  handleStartExecution(fieldId, intervalPromptField.name, 'num', intervalPromptField.isDicom, tempInterval);
                  setIntervalPromptField(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg cursor-pointer transition-colors border-0"
              >
                确认并执行
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: STATS POPUP DISTRIBUTION ================= */}
      {statsViewField && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] animate-fade-in" id="stats_view_modal">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">探查去标识统计结果</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    字段: {statsViewField.name} ({statsViewField.isDicom ? 'DICOM TAG' : 'CSV 字段'})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setStatsViewField(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-black text-slate-500">
                <span>{statsViewField.fieldType === 'text' ? '字段去标识频数分发 (由高到低)' : `数值分布区间 (按步长 ${statsViewField.interval || 10} 统计)`}</span>
                <span>样本频数 / 频率 (样本量: 1000)</span>
              </div>

              <div className="max-h-60 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                {getFieldStatistics(
                  statsViewField.id,
                  statsViewField.name,
                  statsViewField.fieldType,
                  statsViewField.interval
                ).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="font-mono">{item.value}</span>
                      <span className="font-mono text-slate-600">
                        {item.count}次 <span className="text-slate-400 font-bold ml-1.5">({item.pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button 
                onClick={() => setStatsViewField(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW MODAL: ANONYMIZATION RULES (查看) ================= */}
      {viewingRuleRow && (() => {
        const mockRecordDoc = {
          hospital: "上海交通大学医学院附属瑞金医院",
          title: "电子病历门诊诊疗记录",
          name: "■■■■ (已遮蔽)",
          gender: "男",
          age: "45岁",
          id: "■■■■■■■■ (已遮蔽)",
          date: "2026-07-14",
          dept: "心血管内科",
          items: [
            { label: "主诉", value: "反复胸闷、气促2周，加重2天，伴夜间阵发性呼吸困难。" },
            { label: "现病史", value: "患者于2周前无明显诱因出现胸闷、气促，活动后明显，休息后可稍缓解。2天前上述症状明显加重，伴咳嗽、粉红色泡沫样痰，夜间无法平卧。" },
            { label: "既往史", value: "高血压病史10年，最高收缩压达180mmHg，规律服用降压药；无糖尿病及冠心病史。" },
            { label: "体格检查", value: "体温 36.8℃，脉搏 102次/分，呼吸 24次/分，血压 156/92 mmHg。双肺底可闻及湿性啰音。" },
            { label: "诊断意见", value: "1. 慢性心力衰竭急性加重； 2. 高血压病3级（极高危）。" }
          ],
          doctor: "■■■ (已遮蔽)"
        };

        const mockOrderDoc = {
          hospital: "上海交通大学医学院附属瑞金医院",
          title: "临床门诊处方笺 (西药房)",
          name: "■■■■ (已遮蔽)",
          gender: "女",
          age: "62岁",
          id: "■■■■■■■■ (已遮蔽)",
          date: "2026-07-14",
          dept: "神经内科",
          orders: [
            { name: "1. 盐酸多奈哌齐片 (Donepezil Hydrochloride Tablets)", spec: "5mg * 14片 /盒", usage: "Sig: 一次1片，一日1次，睡前口服 (改善认知功能)" },
            { name: "2. 胞磷胆碱钠胶囊 (Citicoline Sodium Capsules)", spec: "0.1g * 24粒 /盒", usage: "Sig: 一次2粒，一日3次，口服 (营养脑神经)" },
            { name: "3. 银杏叶提取物片 (Ginkgo Biloba Extract Tablets)", spec: "40mg * 30片 /盒", usage: "Sig: 一次1片，一日3次，饭后口服 (促进脑部循环)" }
          ],
          totalPrice: "￥258.40",
          doctor: "■■■ (已遮蔽)"
        };

        let fields: any[] = [];
        if (viewingRuleRow.modality === "CSV文本数据" || viewingRuleRow.modality === "CSV") {
          if (viewingRuleRow.category === "住院信息") {
            fields = [
              {
                name: "患者编号",
                fieldName: "patientId",
                fieldType: "text",
                attr: "直接标识符",
                tech: "假名化(全局)",
                param: "本项目下同一个患者的多模态数据遵循同一不可逆加密规则",
                desc: "采用不可逆加密算法，生成16位哈希值",
                canStat: false,
                isKCalculated: "否",
                splitField: ""
              },
              {
                name: "患者姓名",
                fieldName: "name",
                fieldType: "text",
                attr: "直接标识符",
                tech: "属性删除",
                param: "置空",
                desc: "置空",
                canStat: false,
                isKCalculated: "否",
                splitField: "患者姓名"
              },
              {
                name: "性别",
                fieldName: "gender",
                fieldType: "text",
                attr: "准标识符",
                tech: "保留原值",
                param: "-",
                desc: "不涉及敏感隐私，直接保留原文。",
                canStat: true,
                isKCalculated: "否",
                splitField: "性别"
              },
              {
                name: "就诊年龄",
                fieldName: "age",
                fieldType: "num",
                attr: "准标识符",
                tech: "泛化",
                param: "18-29→青年\n30-59→中年\n60-100→老年",
                desc: "青年：18-29，中年：30-59，老年：60-100 2、80岁及以上",
                canStat: true,
                isKCalculated: "是",
                splitField: "就诊年龄",
                isAgeMapping: true
              },
              {
                name: "就诊日期",
                fieldName: "admissionDate",
                fieldType: "date",
                attr: "准标识符",
                tech: "扰动(全局)",
                param: "本项目下同一个患者的多模态数据遵循同一规则，扰动参数-14 ~ 14天",
                desc: "XXXX年XX月XX日，时分秒不保留，向前/后偏移特定天数，保持同一患者的所有日期类字段偏移量一致，不同患者的偏移量不一致",
                canStat: false,
                isKCalculated: "否",
                splitField: ""
              }
            ];
          } else if (viewingRuleRow.category === "检查信息") {
            fields = [
              {
                name: "患者编号",
                fieldName: "patientId",
                fieldType: "text",
                attr: "直接标识符",
                tech: "假名化(全局)",
                param: "本项目下同一个患者的多模态数据遵循同一不可逆加密规则",
                desc: "采用不可逆加密算法，生成16位哈希值；与“住院信息”中的患者编号保持一致",
                canStat: false,
                isKCalculated: "否",
                splitField: ""
              },
              {
                name: "检查名称",
                fieldName: "checkName",
                fieldType: "text",
                attr: "敏感属性",
                tech: "保留原值",
                param: "-",
                desc: "例如 上腹部磁共振增强成像",
                canStat: false,
                isKCalculated: "否",
                splitField: ""
              },
              {
                name: "检查时间",
                fieldName: "checkTime",
                fieldType: "date",
                attr: "准标识符",
                tech: "扰动(全局)",
                param: "本项目下同一个患者的多模态数据遵循同一规则，扰动参数-14 ~ 14天",
                desc: "XXXX年XX月XX日，时分秒不保留，向前/后偏移特定天数，保持同一患者的所有日期类字段偏移量一致，不同患者的偏移量不一致",
                canStat: false,
                isKCalculated: "否",
                splitField: ""
              }
            ];
          } else {
            // 检验信息
            fields = [
              {
                name: "患者编号",
                fieldName: "patientId",
                fieldType: "text",
                attr: "直接标识符",
                tech: "假名化(全局)",
                param: "本项目下同一个患者的多模态数据遵循同一不可逆加密规则",
                desc: "采用不可逆加密算法，生成16位哈希值；与“住院信息”中的患者编号保持一致",
                canStat: false,
                isKCalculated: "否",
                splitField: ""
              },
              {
                name: "检验名称",
                fieldName: "testName",
                fieldType: "text",
                attr: "敏感属性",
                tech: "保留原值",
                param: "-",
                desc: "例如 肝功能",
                canStat: false,
                isKCalculated: "否",
                splitField: ""
              },
              {
                name: "检验时间",
                fieldName: "testTime",
                fieldType: "date",
                attr: "准标识符",
                tech: "扰动(全局)",
                param: "本项目下同一个患者的多模态数据遵循同一规则，扰动参数-14 ~ 14天",
                desc: "XXXX年XX月XX日，时分秒不保留，向前/后偏移特定天数，保持同一患者的所有日期类字段偏移量一致，不同患者的偏移量不一致",
                canStat: false,
                isKCalculated: "否",
                splitField: ""
              }
            ];
          }
        } else if (viewingRuleRow.modality === "DICOM影像数据" || viewingRuleRow.modality === "DICOM") {
          fields = [
            {
              tag: "(0008,0008)",
              name: "ImageType",
              attr: "敏感属性",
              tech: "保留原值",
              param: "-",
              desc: "暂无说明",
              isKCalculated: "否",
              canStat: false,
              fieldName: "imageType",
              fieldType: "text"
            },
            {
              tag: "(0010,0020)",
              name: "Patient ID",
              attr: "直接标识符",
              tech: "假名化(全局)",
              param: "本项目下同一个患者的多模态数据遵循同一不可逆加密规则",
              desc: "采用不可逆加密算法，生成16位哈希值；与“住院信息”中的患者标识号保持一致",
              isKCalculated: "否",
              canStat: false,
              fieldName: "patientId",
              fieldType: "text"
            },
            {
              tag: "(0008,0030)",
              name: "PatientName",
              attr: "直接标识符",
              tech: "假名化",
              param: "uid一致性替换",
              desc: "统一更改为“ANONYMIZED”",
              isKCalculated: "否",
              canStat: false,
              fieldName: "patientName",
              fieldType: "text"
            },
            {
              tag: "(0008,0020)",
              name: "StudyDate",
              attr: "准标识符",
              tech: "扰动(全局)",
              param: "本项目下同一个患者的多模态数据遵循同一规则，扰动参数-14 ~ 14天",
              desc: "XXXX年XX月XX日，时分秒不保留，向前/后偏移特定天数，保持同一患者的所有日期类字段偏移量一致，不同患者的偏移量不一致",
              isKCalculated: "否",
              canStat: true,
              fieldName: "studyDate",
              fieldType: "text",
              isDicomStats: true
            }
          ];
        }

        const isStructured = viewingRuleRow.modality === "CSV文本数据" || viewingRuleRow.modality === "DICOM影像数据" || viewingRuleRow.modality === "CSV" || viewingRuleRow.modality === "DICOM";

        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="view_rules_modal">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-300 max-w-5xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">
                      匿名化策略-{viewingRuleRow.modality}{viewingRuleRow.category && viewingRuleRow.category !== '-' ? `-${viewingRuleRow.category}` : ''}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingRuleRow(null)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-left flex-1">
                {isStructured ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 animate-fade-in">
                    <table className="w-full text-left border-collapse text-xs">
                      {viewingRuleRow.modality === "DICOM影像数据" || viewingRuleRow.modality === "DICOM" ? (
                        <>
                          <thead>
                            <tr className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-4">TAG</th>
                              <th className="py-3 px-4">数据字段</th>
                              <th className="py-3 px-4 text-center">数据属性</th>
                              <th className="py-3 px-4">匿名化技术</th>
                              <th className="py-3 px-4">参数</th>
                              <th className="py-3 px-4">说明</th>
                              <th className="py-3 px-4 text-center">是否纳入K值计算</th>
                              <th className="py-3 px-4 text-center">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-normal text-slate-700 bg-white">
                            {fields.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/20 font-normal">
                                {/* TAG */}
                                <td className="py-3.5 px-4 font-mono text-xs text-slate-700 text-left font-normal">
                                  {item.tag}
                                </td>

                                {/* 数据字段 */}
                                <td className="py-3.5 px-4 text-xs text-slate-700 text-left font-normal">
                                  {item.name}
                                </td>

                                {/* 数据属性 */}
                                <td className="py-3.5 px-4 text-xs text-slate-700 text-center font-normal">
                                  {item.attr}
                                </td>

                                {/* 匿名化策略 / 匿名化技术 */}
                                <td className="py-3.5 px-4 text-xs text-slate-700 text-left font-normal">
                                  {item.tech}
                                </td>

                                {/* 参数 */}
                                <td className="py-3.5 px-4 text-xs text-slate-700 text-left leading-relaxed font-normal">
                                  {item.param || "-"}
                                </td>

                                {/* 说明 */}
                                <td className="py-3.5 px-4 text-xs text-slate-700 text-left leading-relaxed max-w-[200px] font-normal">
                                  {item.desc || "-"}
                                </td>

                                {/* 是否纳入K值计算 */}
                                <td className="py-3.5 px-4 text-center text-xs text-slate-700 font-normal">
                                  {item.isKCalculated || "否"}
                                </td>

                                {/* 操作 */}
                                <td className="py-3.5 px-4 text-center">
                                  {item.isKCalculated === "是" ? (
                                    <div className="flex justify-center">
                                      <button
                                        onClick={() => {
                                          setKCalculatedStatsPage(1);
                                          setViewingKCalculatedStats(getFieldStatsData(item.fieldName, item.name));
                                        }}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] rounded shadow-2xs transition-colors cursor-pointer border-0 font-normal"
                                      >
                                        <span>查看统计</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-normal">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      ) : (
                        <>
                          <thead>
                            <tr className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-4">数据字段</th>
                              {viewingRuleRow.category === "住院信息" && (
                                <th className="py-3 px-4">数据标签</th>
                              )}
                              <th className="py-3 px-4 text-center">数据属性</th>
                              <th className="py-3 px-4">匿名化策略</th>
                              <th className="py-3 px-4">参数</th>
                              <th className="py-3 px-4">说明</th>
                              <th className="py-3 px-4 text-center">是否纳入K值计算</th>
                              <th className="py-3 px-4 text-center">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-normal text-slate-700 bg-white">
                            {fields.map((item, idx) => {
                              const isAdmission = viewingRuleRow.category === "住院信息";
                              let shouldRenderFieldCell = true;
                              let fieldCellRowSpan = 1;
                              let fieldCellText = item.name;

                              if (isAdmission) {
                                if (idx === 1) {
                                  shouldRenderFieldCell = true;
                                  fieldCellRowSpan = 3;
                                  fieldCellText = "记录内容";
                                } else if (idx === 2 || idx === 3) {
                                  shouldRenderFieldCell = false;
                                }
                              }

                              return (
                                <tr key={idx} className="hover:bg-slate-50/20 font-normal">
                                  {/* 数据字段 */}
                                  {shouldRenderFieldCell && (
                                    <td className="py-3.5 px-4 text-xs text-slate-700 text-left font-normal" rowSpan={fieldCellRowSpan}>
                                      {fieldCellText}
                                    </td>
                                  )}

                                  {/* 数据标签 */}
                                  {isAdmission && (
                                    <td className="py-3.5 px-4 text-xs text-slate-700 text-left font-normal">
                                      {item.splitField || "-"}
                                    </td>
                                  )}

                                  {/* 数据属性 */}
                                  <td className="py-3.5 px-4 text-center text-xs text-slate-700 font-normal">
                                    {item.attr}
                                  </td>

                                  {/* 匿名化策略 / 匿名化技术 */}
                                  <td className="py-3.5 px-4 text-xs text-slate-700 text-left font-normal">
                                    {item.tech}
                                  </td>

                                  {/* 参数 */}
                                  <td className="py-3.5 px-4 text-xs text-slate-700 text-left leading-relaxed font-normal">
                                    {item.isAgeMapping ? (
                                      <div className="space-y-1 font-normal text-slate-700 text-xs py-0.5 leading-snug">
                                        <div>18-29→青年</div>
                                        <div>30-59→中年</div>
                                        <div>60-100→老年</div>
                                      </div>
                                    ) : (
                                      item.param || "-"
                                    )}
                                  </td>

                                  {/* 说明 */}
                                  <td className="py-3.5 px-4 text-xs text-slate-700 text-left leading-relaxed max-w-[200px] font-normal">
                                    {item.desc || "-"}
                                  </td>

                                  {/* 是否纳入K值计算 */}
                                  <td className="py-3.5 px-4 text-center text-xs text-slate-700 font-normal">
                                    {item.isKCalculated || "否"}
                                  </td>

                                  {/* 操作 */}
                                  <td className="py-3.5 px-4 text-center">
                                    {item.isKCalculated === "是" ? (
                                      <div className="flex justify-center">
                                        <button
                                          onClick={() => {
                                            setKCalculatedStatsPage(1);
                                            setViewingKCalculatedStats(getFieldStatsData(item.fieldName, item.name));
                                          }}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] rounded shadow-2xs transition-colors cursor-pointer border-0 font-normal"
                                        >
                                          <span>查看统计</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 font-normal">-</span>
                                    )}
                                  </td>
                                </tr>
                              )})}
                          </tbody>
                        </>
                      )}
                    </table>
                  </div>
                ) : (
                  /* Image Masking View */
                  (() => {
                    const doc = viewingRuleRow.category === "门诊就诊记录" ? mockRecordDoc : mockOrderDoc;
                    return (
                      <div className="flex justify-center w-full">
                        {/* EHR Document layout simulating the redacted result */}
                        <div className="w-full bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 flex justify-center">
                          <div className="bg-white border-2 border-slate-900 p-6 w-full max-w-lg rounded-sm shadow-md font-sans text-left relative overflow-hidden">
                            {/* Watermark/Redaction overlay legend */}
                            <div className="absolute right-0 top-0 translate-x-8 translate-y-2 rotate-45 bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest px-6 py-1 z-30 select-none shadow-xs text-center border border-white">
                              De-Identified
                            </div>

                            {/* Title */}
                            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                              <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase">{doc.hospital}</h4>
                              <h2 className="text-xl font-black text-slate-900 tracking-widest mt-1 uppercase">{doc.title}</h2>
                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 font-mono">Clinical EHR Template (Secured)</div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-3 gap-2.5 text-[11px] border border-slate-200 p-3 rounded bg-slate-50/70 mb-4 font-bold">
                              <div><span className="text-slate-400">患者姓名:</span> <span className="bg-slate-950 text-slate-950 select-none px-4 py-0.5 rounded ml-1 text-[9px] font-mono">■■■</span></div>
                              <div><span className="text-slate-400">患者性别:</span> <span className="text-slate-900">{doc.gender}</span></div>
                              <div><span className="text-slate-400">患者年龄:</span> <span className="text-slate-900">{doc.age}</span></div>
                              <div className="col-span-2"><span className="text-slate-400">流水/病历号:</span> <span className="bg-slate-950 text-slate-950 select-none px-8 py-0.5 rounded ml-1 text-[9px] font-mono">■■■■■■■</span></div>
                              <div><span className="text-slate-400">就诊科室:</span> <span className="text-slate-900">{doc.dept}</span></div>
                            </div>

                            {/* Content Details */}
                            {"items" in doc ? (
                              <div className="space-y-3.5 text-xs">
                                {(doc.items as any[]).map((item, index) => (
                                  <div key={index} className="space-y-1">
                                    <h5 className="font-black text-slate-900 border-l-4 border-blue-600 pl-2 text-[10px] uppercase tracking-wide">{item.label}</h5>
                                    <p className="text-slate-600 leading-relaxed pl-3 font-semibold text-justify text-[11px]">{item.value}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-3.5 text-xs">
                                <h5 className="font-black text-slate-900 border-l-4 border-emerald-600 pl-2 text-[10px] uppercase tracking-wide">处方医嘱项目明细</h5>
                                <div className="border border-slate-300 rounded overflow-hidden bg-white">
                                  <table className="w-full text-left border-collapse text-[10px]">
                                    <thead>
                                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black">
                                        <th className="p-2 w-2/3">药品/诊疗项目名称</th>
                                        <th className="p-2 w-1/3">规格/用药指导</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {(doc.orders as any[]).map((ord, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50">
                                          <td className="p-2 font-bold text-slate-800">{ord.name}</td>
                                          <td className="p-2">
                                            <span className="block font-bold text-slate-900">{ord.spec}</span>
                                            <span className="block text-[8px] text-slate-400 font-bold mt-0.5">{ord.usage}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="flex justify-end font-black text-xs text-slate-900 pr-1">
                                  <span>医嘱总费用: <span className="text-red-600 font-mono text-xs ml-1">{(doc as any).totalPrice}</span></span>
                                </div>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="border-t border-slate-200 pt-3 mt-5 flex items-center justify-between text-[11px]">
                              <div>
                                <span className="text-slate-400 font-bold">责任人核签:</span>
                                <span className="bg-slate-950 text-slate-950 select-none px-6 py-0.5 rounded ml-1.5 text-[9px] font-mono">■■■</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="relative w-11 h-11 rounded-full border border-red-500/25 flex items-center justify-center text-red-500/25 text-[8px] font-black uppercase rotate-12 select-none">
                                  <span className="text-center leading-2">脱敏审核<br/>电子签名</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Footer buttons */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                <button 
                  onClick={() => setViewingRuleRow(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= NEW MODAL: DIMENSION STATISTICS (多维度去标识化执行统计) ================= */}
      {dimensionStatsModal && (() => {
        const isMediaStats = dimensionStatsModal.modality === "DICOM影像数据" || dimensionStatsModal.modality === "图片数据";

        if (isMediaStats) {
          return (
            <MediaDirectoryStatsModal 
              data={dimensionStatsModal}
              onClose={() => setDimensionStatsModal(null)}
            />
          );
        }

        let rows: any[] = [];
        if (dimensionStatsModal.modality === "CSV文本数据" || dimensionStatsModal.modality === "CSV") {
          if (dimensionStatsModal.category === "住院信息") {
            rows = [
              { dim: "患者", total: "800", success: "780", failure: "20" },
              { dim: "就诊", total: "1,200", success: "1,180", failure: "20" },
              { dim: "记录", total: "5,400", success: "5,350", failure: "50" }
            ];
          } else if (dimensionStatsModal.category === "检查信息") {
            rows = [
              { dim: "患者", total: "600", success: "590", failure: "10" },
              { dim: "就诊", total: "900", success: "885", failure: "15" },
              { dim: "记录", total: "3,200", success: "3,180", failure: "20" }
            ];
          } else {
            rows = [
              { dim: "患者", total: "750", success: "740", failure: "10" },
              { dim: "就诊", total: "1,100", success: "1,090", failure: "10" },
              { dim: "记录", total: "4,800", success: "4,750", failure: "50" }
            ];
          }
        }

        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="dimension_stats_modal">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-300 max-w-xl w-full overflow-hidden animate-scale-up">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-blue-400" />
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    多维度去标识化执行统计
                  </h3>
                </div>
                <button 
                  onClick={() => setDimensionStatsModal(null)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">当前分类情况</span>
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                    {dimensionStatsModal.modality} &middot; {dimensionStatsModal.category}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-5">统计维度</th>
                        <th className="py-3 px-4 text-center">总数</th>
                        <th className="py-3 px-4 text-center">成功数</th>
                        <th className="py-3 px-4 text-center">失败数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-5 text-slate-900 font-black">{row.dim}</td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-600">{row.total}</td>
                          <td className="py-3.5 px-4 text-center font-mono text-emerald-600">{row.success}</td>
                          <td className={`py-3.5 px-4 text-center font-mono ${parseInt(row.failure) > 0 ? "text-rose-600 font-black" : "text-slate-400"}`}>
                            {row.failure}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={() => setDimensionStatsModal(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= NEW MODAL: FAILURE DETAILS (去标识任务失败详情报告) ================= */}
      {failureDetailsModal && (() => {
        let reasons: any[] = [];
        let errorsForReason: { [reasonIndex: number]: string[] } = {};

        const modality = failureDetailsModal.modality;
        const category = failureDetailsModal.category;

        if (modality === "DICOM影像数据") {
          reasons = [
            { text: "图像内文字烧录区域OCR与脱敏超时", count: "35", pct: 70 },
            { text: "图像切片元数据(Metadata)损坏无法重写", count: "15", pct: 30 }
          ];
          errorsForReason = {
            0: [
              "DCM_SOP_982103_01", "DCM_SOP_982103_02", "DCM_SOP_982103_03", "DCM_SOP_982103_04", "DCM_SOP_982103_05",
              "DCM_SOP_982103_06", "DCM_SOP_982103_07", "DCM_SOP_982103_08", "DCM_SOP_982103_09", "DCM_SOP_982103_10"
            ],
            1: [
              "DCM_ERR_META_01", "DCM_ERR_META_02", "DCM_ERR_META_03", "DCM_ERR_META_04", "DCM_ERR_META_05",
              "DCM_ERR_META_06", "DCM_ERR_META_07", "DCM_ERR_META_08", "DCM_ERR_META_09", "DCM_ERR_META_10"
            ]
          };
        } else if (modality === "图片数据") {
          reasons = [
            { text: "手写敏感体征区域自动定位失败", count: "15", pct: 65 },
            { text: "纸张扫描反光/重度畸变导致OCR重试超限", count: "8", pct: 35 }
          ];
          errorsForReason = {
            0: [
              "IMG_REC_ERR_0101", "IMG_REC_ERR_0102", "IMG_REC_ERR_0103", "IMG_REC_ERR_0104", "IMG_REC_ERR_0105",
              "IMG_REC_ERR_0106", "IMG_REC_ERR_0107", "IMG_REC_ERR_0108", "IMG_REC_ERR_0109", "IMG_REC_ERR_0110"
            ],
            1: [
              "IMG_ERR_REFLECT_01", "IMG_ERR_REFLECT_02", "IMG_ERR_REFLECT_03", "IMG_ERR_REFLECT_04", "IMG_ERR_REFLECT_05",
              "IMG_ERR_REFLECT_06", "IMG_ERR_REFLECT_07", "IMG_ERR_REFLECT_08", "IMG_ERR_REFLECT_09", "IMG_ERR_REFLECT_10"
            ]
          };
        } else { // CSV文本数据 / CSV
          if (category === "住院信息") {
            reasons = [
              { text: "字段格式校验失败 (身份证非标准18位)", count: "8", pct: 67 },
              { text: "住院号/就诊卡号存在未知乱码字符", count: "4", pct: 33 }
            ];
            errorsForReason = {
              0: [
                "ROW_48_COL_1", "ROW_112_COL_1", "ROW_256_COL_1", "ROW_380_COL_1", "ROW_415_COL_1",
                "ROW_589_COL_1", "ROW_642_COL_1", "ROW_711_COL_1", "ROW_853_COL_1", "ROW_924_COL_1"
              ],
              1: [
                "ROW_12_COL_3", "ROW_95_COL_3", "ROW_180_COL_3", "ROW_202_COL_3", "ROW_315_COL_3",
                "ROW_424_COL_3", "ROW_511_COL_3", "ROW_672_COL_3", "ROW_743_COL_3", "ROW_890_COL_3"
              ]
            };
          } else if (category === "检查信息") {
            reasons = [
              { text: "检查申请单号包含不可解析格式", count: "10", pct: 50 },
              { text: "检查时间格式非标准(无法自动对齐到年)", count: "10", pct: 50 }
            ];
            errorsForReason = {
              0: [
                "ROW_33_COL_1", "ROW_72_COL_1", "ROW_145_COL_1", "ROW_210_COL_1", "ROW_388_COL_1",
                "ROW_451_COL_1", "ROW_529_COL_1", "ROW_612_COL_1", "ROW_740_COL_1", "ROW_888_COL_1"
              ],
              1: [
                "ROW_15_COL_4", "ROW_88_COL_4", "ROW_195_COL_4", "ROW_280_COL_4", "ROW_399_COL_4",
                "ROW_501_COL_4", "ROW_615_COL_4", "ROW_722_COL_4", "ROW_834_COL_4", "ROW_945_COL_4"
              ]
            };
          } else { // 检验信息
            reasons = [
              { text: "检验科室及检验项目编码未匹配字典", count: "12", pct: 60 },
              { text: "检验数值异常包含多重运算符或溢出字符", count: "8", pct: 40 }
            ];
            errorsForReason = {
              0: [
                "ROW_22_COL_2", "ROW_64_COL_2", "ROW_105_COL_2", "ROW_188_COL_2", "ROW_299_COL_2",
                "ROW_312_COL_2", "ROW_480_COL_2", "ROW_590_COL_2", "ROW_688_COL_2", "ROW_820_COL_2"
              ],
              1: [
                "ROW_40_COL_5", "ROW_99_COL_5", "ROW_150_COL_5", "ROW_233_COL_5", "ROW_345_COL_5",
                "ROW_412_COL_5", "ROW_520_COL_5", "ROW_631_COL_5", "ROW_755_COL_5", "ROW_902_COL_5"
              ]
            };
          }
        }

        const activeErrors = errorsForReason[selectedFailureReasonIdx] || [];

        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="failure_details_modal">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-300 max-w-4xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between shrink-0">
                <h3 className="font-black text-sm uppercase tracking-wider">失败详情</h3>
                <button 
                  onClick={() => setFailureDetailsModal(null)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 text-left overflow-y-auto flex-1">
                {/* Meta info bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold text-slate-700 shadow-2xs">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">数据模态</span>
                    <span className="text-slate-900 font-black text-sm">{failureDetailsModal.modality}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">分类</span>
                    <span className="text-slate-900 font-black text-sm">{failureDetailsModal.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">失败数</span>
                    <span className="text-rose-600 font-black text-sm">{failureDetailsModal.failure}</span>
                  </div>
                </div>

                {/* Left and Right splits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Left panel: 失败原因分布 */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest block border-l-4 border-rose-500 pl-2">
                      失败原因分布
                    </span>
                    <div className="space-y-3">
                      {reasons.map((item, idx) => {
                        const isSelected = selectedFailureReasonIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedFailureReasonIdx(idx)}
                            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col space-y-2 ${
                              isSelected 
                                ? "bg-rose-50/60 border-rose-300 shadow-2xs" 
                                : "bg-white border-slate-200 hover:bg-slate-50/50 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-start text-xs font-bold text-slate-800">
                              <span className="pr-2 leading-relaxed">{item.text}</span>
                              <span className="font-mono text-slate-950 font-black shrink-0">
                                {item.count} <span className="text-rose-600 ml-1">({item.pct}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${isSelected ? 'bg-rose-500' : 'bg-slate-400'}`} 
                                style={{ width: `${item.pct}%` }}
                              ></div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right panel: 问题数据唯一标识 */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest block border-l-4 border-rose-500 pl-2">
                      问题数据唯一标识
                    </span>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-[350px] overflow-y-auto">
                      <ul className="space-y-1.5 divide-y divide-slate-200/40 font-bold">
                        {activeErrors.map((err, idx) => (
                          <li key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs text-slate-900">
                            <span className="font-bold text-slate-900">id</span>
                            <span className="font-mono font-black text-slate-900">{err}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                <button 
                  onClick={() => setFailureDetailsModal(null)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0 shadow-2xs"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= NEW MODAL: RERUN CONFIRMATION ================= */}
      {rerunConfirmTask && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="rerun_confirmation_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-scale-up text-left">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="font-black text-sm uppercase tracking-wider">确认失败重跑</h3>
              </div>
              <button 
                onClick={() => setRerunConfirmTask(null)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs font-bold text-amber-800">
                您即将重新执行任务 <span className="font-black text-slate-900 font-mono">[{rerunConfirmTask.id}] {rerunConfirmTask.name}</span>。
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                重跑操作将清除原任务下的错误计数，并针对失败的 <span className="font-mono font-bold text-red-600">{rerunConfirmTask.failure}</span> 个去标识化文件启动重新执行逻辑。此操作不可逆，是否继续？
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button 
                onClick={() => setRerunConfirmTask(null)}
                className="px-5 py-2.5 rounded border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-wider transition-colors bg-white cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={() => handleRerunTask(rerunConfirmTask.id)}
                className="px-6 py-2.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-amber-100 transition-colors border-0 cursor-pointer"
              >
                开始重跑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW MODAL: READ-ONLY MAPPING CONFIGURATION ================= */}
      {showReadOnlyMapping && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-fade-in" id="read_only_mapping_modal">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-300 max-w-2xl w-full overflow-hidden animate-scale-up flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-900/50 rounded-lg text-blue-400">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">映射配置-就诊年龄</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    字段: age &middot; 查看模式 (只读)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowReadOnlyMapping(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 text-left overflow-y-auto flex-1">
              {/* Mapping Type Option */}
              <div className="space-y-1.5 border-b border-slate-100 pb-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">映射方式</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-not-allowed opacity-90">
                    <input 
                      type="radio" 
                      checked={true}
                      readOnly
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                    />
                    <span className="text-xs font-bold text-slate-800">区间映射 (区间段 &rarr; 单值)</span>
                  </label>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                  泛化映射规则 (Mapping Rules)
                </span>
                <div className="space-y-2.5">
                  {[
                    { index: 1, range: "18 - 29", target: "青年" },
                    { index: 2, range: "30 - 59", target: "中年" },
                    { index: 3, range: "60 - 100", target: "老年" }
                  ].map((rule) => (
                    <div key={rule.index} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-black text-xs shrink-0">
                        {rule.index}
                      </div>
                      <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5 space-y-1">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">原始区间 (岁)</span>
                          <div className="text-xs font-black text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 select-none shadow-3xs">
                            {rule.range}
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center justify-center text-slate-400 font-bold text-base pt-4">
                          &rarr;
                        </div>
                        <div className="col-span-5 space-y-1">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">目标泛化值</span>
                          <div className="text-xs font-black text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 select-none shadow-3xs">
                            {rule.target}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button 
                onClick={() => setShowReadOnlyMapping(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
