import React, { useState, useRef } from "react";
import { Project, ComplianceItem } from "../types";
import { 
  ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Download, 
  ChevronRight, RefreshCw, Layers, ShieldCheck, Database, FileSpreadsheet, Image,
  Plus, Trash2
} from "lucide-react";

interface AnonymizationSchemeProps {
  project: Project;
  onBack: () => void;
  onSchemeGenerated?: () => void;
}

// Searchable single select component for Long Text Field in Table
const SearchableSingleSelect = ({
  value,
  onChange,
  options,
  placeholder = "请选择字段"
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const sortedOptions = [...options].sort((a, b) => a.localeCompare(b, "en"));
  const filteredOptions = sortedOptions.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 text-left flex items-center justify-between shadow-3xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className="truncate">{value || placeholder}</span>
        <span className="text-slate-400 ml-1 text-[9px]">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-40 max-h-48 overflow-y-auto p-2 space-y-2">
            <div className="flex items-center border border-slate-200 rounded px-2 py-1 bg-slate-50">
              <input
                type="text"
                placeholder="搜索字段..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-xs focus:outline-none focus:ring-0 p-1"
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {filteredOptions.length === 0 ? (
                <p className="text-center text-slate-400 text-[10px] py-1">未找到匹配的字段</p>
              ) : (
                filteredOptions.map(opt => (
                  <div
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors text-xs font-mono text-slate-800 ${
                      value === opt ? "bg-blue-50 text-blue-800 font-semibold" : ""
                    }`}
                  >
                    {opt}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Dropdown multiselect for Split Fields in Table with fuzzy search support
const SplitFieldsMultiSelect = ({
  selected,
  onChange,
  options
}: {
  selected: string[];
  onChange: (val: string[]) => void;
  options: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 text-left flex items-center justify-between shadow-3xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className="truncate">
          {selected.length === 0 
            ? "请选择数据标签" 
            : selected.length === 1 
              ? selected[0] 
              : `+${selected.length}`}
        </span>
        <span className="text-slate-400 ml-1 text-[9px]">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => { setIsOpen(false); setSearchQuery(""); }} />
          <div className="absolute right-0 left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-40 p-2 space-y-2 flex flex-col max-h-60">
            {/* Search Input */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                placeholder="搜索数据标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Options List */}
            <div className="overflow-y-auto space-y-1 max-h-40">
              {filteredOptions.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-2 font-medium">无匹配项</p>
              ) : (
                filteredOptions.map(opt => {
                  const isChecked = selected.includes(opt);
                  return (
                    <label
                      key={opt}
                      className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer text-xs text-slate-700 select-none w-full"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            onChange(selected.filter(s => s !== opt));
                          } else {
                            onChange([...selected, opt]);
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function AnonymizationScheme({ project, onBack, onSchemeGenerated }: AnonymizationSchemeProps) {
  // Form States split into 3 parts
  const [csvEnabled, setCsvEnabled] = useState<boolean>(() => {
    return project.schemeInputs?.csvEnabled ?? true;
  });
  const [dicomEnabled, setDicomEnabled] = useState<boolean>(() => {
    return project.schemeInputs?.dicomEnabled ?? false;
  });
  const [imageEnabled, setImageEnabled] = useState<boolean>(() => {
    return project.schemeInputs?.imageEnabled ?? false;
  });

  const [csvCategories, setCsvCategories] = useState<Array<{
    id: string;
    name: string;
    files: Array<{ name: string, size: string }>;
    headers: string[];
    longTextFields: string[];
    longTextSplits: Record<string, string[]>;
    configs: Array<{ id: string; textField: string; splitFields: string[] }>;
  }>>(() => {
    const raw = project.schemeInputs?.csvCategories || [];
    return raw.map((cat: any) => {
      if (cat.configs) return cat;
      const fields = cat.longTextFields || [];
      const configs = fields.map((field: string) => ({
        id: "config_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        textField: field,
        splitFields: cat.longTextSplits?.[field] || []
      }));
      if (configs.length === 0) {
        configs.push({
          id: "config_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
          textField: "",
          splitFields: []
        });
      }
      return {
        id: cat.id,
        name: cat.name,
        files: cat.files || [],
        headers: cat.headers || [],
        configs,
        longTextFields: cat.longTextFields || [],
        longTextSplits: cat.longTextSplits || {}
      };
    });
  });

  const [dicomCategories, setDicomCategories] = useState<Array<{
    id: string;
    name: string;
    files: Array<{ name: string, size: string }>;
  }>>(() => {
    return project.schemeInputs?.dicomCategories || [];
  });

  const [imageCategories, setImageCategories] = useState<Array<{
    id: string;
    name: string;
    files: Array<{ name: string, size: string }>;
  }>>(() => {
    return project.schemeInputs?.imageCategories || [];
  });

  // Hidden file input refs for batch uploading
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const dicomFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const [usageScenario, setUsageScenario] = useState(() => {
    return project.schemeInputs?.usageScenario || "";
  });
  const [dataScale, setDataScale] = useState(() => {
    return project.schemeInputs?.dataScale || "";
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generatedScheme, setGeneratedScheme] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [csvSearchQueries, setCsvSearchQueries] = useState<Record<string, string>>({});
  const [csvDropdownOpen, setCsvDropdownOpen] = useState<Record<string, boolean>>({});

  // File headers simulation based on selection
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>(() => {
    return ['PatientID', 'PatientName', 'Gender', 'Age', 'AdmissionDate', 'MainDiagnosis', 'PhoneNumber', 'ZipCode'];
  });

  const [evaluationMethod, setEvaluationMethod] = useState<string>(() => {
    return project.schemeInputs?.evaluationMethod || "K匿名";
  });
  const [scenarioType, setScenarioType] = useState<string>(() => {
    return project.schemeInputs?.scenarioType || "";
  });

  // hospital infrastructure checklists (满足/待完善/无法满足)
  const [envItems, setEnvItems] = useState<ComplianceItem[]>(() => {
    const defaultItems = [
      { id: "env_1", name: "1）身份认证（多因素鉴别）", desc: "", status: "", proofFile: null },
      { id: "env_2", name: "2）访问控制（功能权限+数据权限）", desc: "", status: "", proofFile: null },
      { id: "env_3", name: "3）安全隔离（不同接收方逻辑/物理隔离）", desc: "", status: "", proofFile: null },
      { id: "env_4", name: "4）加密保护（敏感数据加密存储）", desc: "", status: "", proofFile: null },
      { id: "env_5", name: "5）安全传输（传输加密）", desc: "", status: "", proofFile: null },
      { id: "env_6", name: "6）数据销毁（任务完成后删除原始数据和中间结果）", desc: "", status: "", proofFile: null },
      { id: "env_7", name: "7）数据防泄漏", desc: "", status: "", proofFile: null },
      { id: "env_8", name: "8）附加信息保护（假名化附加信息隔离加密）", desc: "", status: "", proofFile: null },
      { id: "env_9", name: "9）接口安全", desc: "", status: "", proofFile: null },
      { id: "env_10", name: "10）安全审计", desc: "", status: "", proofFile: null },
      { id: "env_11", name: "11）容器化/虚拟化隔离、环境管控（阻断攻击/防止非预期输入输出）、完整操作日志", desc: "", status: "", proofFile: null }
    ];
    const saved = project.schemeInputs?.envItems || [];
    return defaultItems.map(item => {
      const matched = saved.find((s: any) => s.id === item.id || s.name === item.name);
      return {
        ...item,
        status: matched ? (matched.status === '符合' ? '满足' : matched.status === '不符合' ? '待完善' : matched.status) : ""
      };
    });
  });

  // Management measures checklists (满足/待完善/无法满足)
  const [mgmtItems, setMgmtItems] = useState<ComplianceItem[]>(() => {
    const defaultItems = [
      // （1）数据持有方
      { id: "mgmt_holder_1", category: "数据持有方", name: "1）数据流通管理制度", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_2", category: "数据持有方", name: "2）审核需求方使用场景、目的和处理流程", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_3", category: "数据持有方", name: "3）合同约束（目的范围/数据保护义务/禁止重识别/泄露通知等）", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_4", category: "数据持有方", name: "4）明确人员职责并定期培训", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_5", category: "数据持有方", name: "5）留存匿名化策略、规则制定/审核/更新记录", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_6", category: "数据持有方", name: "6）制定应急预案并定期演练", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_7", category: "数据持有方", name: "7）持续监控风险，定期更新策略", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_8", category: "数据持有方", name: "8）审核需求方使用场景、目的和处理流程", desc: "", status: "", proofFile: null },

      // （2）数据使用方
      { id: "mgmt_user_1", category: "数据使用方", name: "1）按最少够用原则申请数据", desc: "", status: "", proofFile: null },
      { id: "mgmt_user_2", category: "数据使用方", name: "2）合同约束", desc: "", status: "", proofFile: null },
      { id: "mgmt_user_3", category: "数据使用方", name: "3）禁止重识别行为", desc: "", status: "", proofFile: null },
      { id: "mgmt_user_4", category: "数据使用方", name: "4）对接触人员培训并签署保密协议", desc: "", status: "", proofFile: null },
      { id: "mgmt_user_5", category: "数据使用方", name: "5）权限离职离岗回收机制", desc: "", status: "", proofFile: null },
      { id: "mgmt_user_6", category: "数据使用方", name: "6）数据使用监控", desc: "", status: "", proofFile: null },
      { id: "mgmt_user_7", category: "数据使用方", name: "7）数据销毁", desc: "", status: "", proofFile: null },

      // （3）数据运营方
      { id: "mgmt_operator_1", category: "数据运营方", name: "1）提供并公告安全技术能力", desc: "", status: "", proofFile: null },
      { id: "mgmt_operator_2", category: "数据运营方", name: "2）定期安全评估", desc: "", status: "", proofFile: null },
      { id: "mgmt_operator_3", category: "数据运营方", name: "3）严格访问控制", desc: "", status: "", proofFile: null },
      { id: "mgmt_operator_4", category: "数据运营方", name: "4）对相关方操作留存日志并定期审计", desc: "", status: "", proofFile: null },
      { id: "mgmt_operator_5", category: "数据运营方", name: "5）应急预案演练", desc: "", status: "", proofFile: null }
    ];
    const saved = project.schemeInputs?.mgmtItems || [];
    return defaultItems.map(item => {
      const matched = saved.find((s: any) => s.id === item.id || s.name === item.name);
      return {
        ...item,
        status: matched ? (matched.status === '符合' ? '满足' : matched.status === '不符合' ? '待完善' : matched.status) : ""
      };
    });
  });

  // Table helper functions to manage configs for each CSV file category
  const addConfigRow = (catId: string) => {
    setCsvCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const currentConfigs = cat.configs || [];
      const newConfig = {
        id: "config_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
        textField: "",
        splitFields: []
      };
      const updatedConfigs = [...currentConfigs, newConfig];
      
      const validConfigs = updatedConfigs.filter(c => c.textField.trim() !== "");
      const longTextFields = validConfigs.map(c => c.textField);
      const longTextSplits: Record<string, string[]> = {};
      validConfigs.forEach(c => {
        longTextSplits[c.textField] = c.splitFields;
      });

      return {
        ...cat,
        configs: updatedConfigs,
        longTextFields,
        longTextSplits
      };
    }));
  };

  const removeConfigRow = (catId: string, configId: string) => {
    setCsvCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const currentConfigs = cat.configs || [];
      if (currentConfigs.length <= 1) return cat;
      const updatedConfigs = currentConfigs.filter(c => c.id !== configId);

      const validConfigs = updatedConfigs.filter(c => c.textField.trim() !== "");
      const longTextFields = validConfigs.map(c => c.textField);
      const longTextSplits: Record<string, string[]> = {};
      validConfigs.forEach(c => {
        longTextSplits[c.textField] = c.splitFields;
      });

      return {
        ...cat,
        configs: updatedConfigs,
        longTextFields,
        longTextSplits
      };
    }));
  };

  const updateConfigRow = (catId: string, configId: string, updates: Partial<{ textField: string; splitFields: string[] }>) => {
    setCsvCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const currentConfigs = cat.configs || [];
      const updatedConfigs = currentConfigs.map(c => c.id === configId ? { ...c, ...updates } : c);

      const validConfigs = updatedConfigs.filter(c => c.textField.trim() !== "");
      const longTextFields = validConfigs.map(c => c.textField);
      const longTextSplits: Record<string, string[]> = {};
      validConfigs.forEach(c => {
        longTextSplits[c.textField] = c.splitFields;
      });

      return {
        ...cat,
        configs: updatedConfigs,
        longTextFields,
        longTextSplits
      };
    }));
  };

  // Batch upload handlers for CSV, DICOM, Images
  const handleCsvBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      
      filesArray.forEach((file: File) => {
        const subName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newFile = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB"
        };
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          let headers: string[] = ['PatientID', 'PatientName', 'Gender', 'Age', 'MainDiagnosis', 'ChiefComplaint', 'PresentIllness', 'DoctorNotes'];
          if (text) {
            const firstLine = text.split(/\r?\n/)[0];
            const parsed = firstLine.split(',')
              .map(h => h.replace(/^["']|["']$/g, '').trim())
              .filter(h => h.length > 0);
            if (parsed.length > 0) {
              headers = parsed;
            }
          }
          
          setCsvCategories(prev => {
            const id = "csv_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
            return [...prev, {
              id,
              name: subName,
              files: [newFile],
              headers: headers,
              configs: [{
                id: "config_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
                textField: "",
                splitFields: []
              }],
              longTextFields: [],
              longTextSplits: {}
            }];
          });
        };
        reader.readAsText(file);
      });
      
      if (csvFileInputRef.current) csvFileInputRef.current.value = "";
    }
  };

  const handleDicomBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      
      const newCats = filesArray.map((file: File) => {
        const subName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newFile = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB"
        };
        return {
          id: "dicom_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
          name: subName,
          files: [newFile]
        };
      });
      
      setDicomCategories(prev => [...prev, ...newCats]);
      if (dicomFileInputRef.current) dicomFileInputRef.current.value = "";
    }
  };

  const handleImageBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      
      const newCats = filesArray.map((file: File) => {
        const subName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newFile = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB"
        };
        return {
          id: "image_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
          name: subName,
          files: [newFile]
        };
      });
      
      setImageCategories(prev => [...prev, ...newCats]);
      if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    }
  };

  const splitOptions = [
    "患者姓名",
    "医生姓名",
    "医院名称",
    "科室名称",
    "性别",
    "年龄",
    "身高",
    "体重"
  ];

  // Pre-fill quick scenario template
  const applyScenarioTemplate = (text: string) => {
    setUsageScenario(text);
  };

  // Change compliance status (满足, 待完善, 无法满足)
  const handleStatusChange = (id: string, type: "env" | "mgmt", status: string) => {
    if (type === "env") {
      setEnvItems(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, status };
        }
        return item;
      }));
    } else {
      setMgmtItems(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, status };
        }
        return item;
      }));
    }
  };

  // Validation before generating scheme
  const handleGenerateScheme = async () => {
    // 1. Validation
    const anyEnabled = csvEnabled || dicomEnabled || imageEnabled;
    if (!anyEnabled) {
      alert("样例数据模块：CSV文本数据、DICOM影像数据、图片数据 至少有一项必须选择【有】！");
      return;
    }

    if (csvEnabled) {
      if (csvCategories.length === 0) {
        alert("您开启了CSV文本数据，请上传至少一个 .csv 样例文件！");
        return;
      }
      const emptyCsvCat = csvCategories.find(c => !c.name || !c.name.trim());
      if (emptyCsvCat) {
        alert("CSV文本数据中存在空子分类名称，请输入完整！");
        return;
      }
    }

    if (dicomEnabled) {
      if (dicomCategories.length === 0) {
        alert("您开启了DICOM影像数据，请上传至少一个 .dcm 样例文件！");
        return;
      }
      const emptyDicomCat = dicomCategories.find(c => !c.name || !c.name.trim());
      if (emptyDicomCat) {
        alert("DICOM影像数据中存在空子分类名称，请输入完整！");
        return;
      }
    }

    if (imageEnabled) {
      if (imageCategories.length === 0) {
        alert("您开启了图片数据，请上传至少一个医学图片文件！");
        return;
      }
      const emptyImageCat = imageCategories.find(c => !c.name || !c.name.trim());
      if (emptyImageCat) {
        alert("图片数据中存在空子分类名称，请输入完整！");
        return;
      }
    }

    if (!dataScale.trim()) {
      alert("请输入数据规模！");
      return;
    }

    if (!usageScenario.trim()) {
      alert("请输入数据的使用场景说明！");
      return;
    }

    if (!scenarioType) {
      alert("请选择场景系数！");
      return;
    }

    // Check environment items: Required selection
    const unfilledEnv = envItems.find(item => item.status === "");
    if (unfilledEnv) {
      alert(`请对环境系数评估项 [${unfilledEnv.name}] 做出评估选择！`);
      return;
    }

    // Check management items: Required selection
    const unfilledMgmt = mgmtItems.find(item => item.status === "");
    if (unfilledMgmt) {
      alert(`请对安全管理措施项 [${unfilledMgmt.name}] 做出评估选择！`);
      return;
    }

    const minKVal = scenarioType === "组织内部同一个事业群的数据流通" ? 3 :
                     scenarioType === "组织内部跨事业群的数据流通" ? 4 :
                     scenarioType === "组织外部两方的数据流通" ? 5 :
                     scenarioType === "组织外部多方的数据流通" ? 6 : 20;

    const coeffVal = scenarioType === "组织内部同一个事业群的数据流通" ? "1/3" :
                      scenarioType === "组织内部跨事业群的数据流通" ? "1/4" :
                      scenarioType === "组织外部两方的数据流通" ? "1/5" :
                      scenarioType === "组织外部多方的数据流通" ? "1/6" : "1/20";

    // Trigger API call and Generation Screen
    setIsGenerating(true);
    setGenerationError("");

    try {
      const apiPromise = fetch("/api/generate-scheme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          projectDesc: project.description,
          csvEnabled,
          dicomEnabled,
          imageEnabled,
          csvCategories,
          dicomCategories,
          imageCategories,
          usageScenario: usageScenario,
          dataScale: dataScale,
          envAssessment: envItems.map(e => ({ name: e.name, status: e.status, desc: e.desc, hasProof: false })),
          managementMeasures: mgmtItems.map(m => ({ name: m.name, status: m.status, desc: m.desc, hasProof: false })),
          evaluationMethod,
          scenarioType,
          scenarioCoefficient: coeffVal,
          minimumK: minKVal
        })
      });

      const delayPromise = new Promise(resolve => setTimeout(resolve, 3000));

      const [response] = await Promise.all([apiPromise, delayPromise]);

      const data = await response.json();
      if (response.ok) {
        // Save the inputs to the backend to support regeneration
        try {
          await fetch(`/api/projects/${project.id}/scheme-inputs`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              schemeInputs: {
                csvEnabled,
                dicomEnabled,
                imageEnabled,
                csvCategories,
                dicomCategories,
                imageCategories,
                usageScenario,
                dataScale,
                envItems,
                mgmtItems,
                evaluationMethod,
                scenarioType
              }
            })
          });
          project.schemeInputs = {
            csvEnabled,
            dicomEnabled,
            imageEnabled,
            csvCategories,
            dicomCategories,
            imageCategories,
            usageScenario,
            dataScale,
            envItems,
            mgmtItems,
            evaluationMethod,
            scenarioType
          };
          // Dynamically update the project's expectedK locally as well
          project.expectedK = minKVal;

          // Clear isRegeneratingPending status as it is now successfully generated
          await fetch(`/api/projects/${project.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRegeneratingPending: false })
          });
          project.isRegeneratingPending = false;
        } catch (saveErr) {
          console.error("Failed to persist scheme inputs:", saveErr);
        }

        setGeneratedScheme(data.scheme);
        setIsOffline(data.isOffline || false);
        if (data.errorMsg) {
          setGenerationError(data.errorMsg);
        }
        
        // Save scheme to project immediately so that the status is synchronized
        project.schemeDocText = data.scheme;
        
        // Directly transition to the editable scheme document view
        if (onSchemeGenerated) {
          onSchemeGenerated();
        }
      } else {
        throw new Error(data.error || "服务端在装配方案文档时发生未知异常");
      }
    } catch (err: any) {
      setGenerationError(err.message || "连接服务器装配引擎失败，请重试。");
      alert(err.message || "装配方案时遇到异常，请检查后端服务。");
    } finally {
      setIsGenerating(false);
    }
  };

  // Real Microsoft Word download compatibility output
  const handleDownloadWord = () => {
    if (!generatedScheme) return;
    
    // HTML conversion to bundle inside .doc
    const formattedHtml = generatedScheme
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\s*[\*\-]\s+(.*$)/gim, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code style="background-color:#f1f5f9;padding:2px 4px;border-radius:4px;font-family:monospace;">$1</code>')
      .replace(/\n\n/g, '<p></p>')
      .replace(/^> (.*$)/gim, '<blockquote style="border-left:4px solid #2563eb;padding-left:15px;color:#4b5563;font-style:italic;">$1</blockquote>');

    const documentHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${project.name} 数据去标识化匿名方案</title>
        <style>
          body { font-family: "Microsoft YaHei", SimSun, sans-serif; line-height: 1.6; padding: 40px; color: #1f2937; }
          h1 { font-family: "Microsoft YaHei", SimHei; color: #1e3a8a; text-align: center; margin-bottom: 30px; font-size: 24pt; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
          h2 { font-family: "Microsoft YaHei", SimHei; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 35px; margin-bottom: 15px; font-size: 16pt; }
          h3 { font-family: "Microsoft YaHei", SimHei; color: #1d4ed8; margin-top: 20px; margin-bottom: 10px; font-size: 12pt; }
          p { margin-bottom: 12px; font-size: 11pt; text-align: justify; }
          li { font-size: 11pt; margin-bottom: 6px; }
          blockquote { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin: 15px 0; border-radius: 4px; }
          .meta-box { border: 1px solid #cbd5e1; padding: 15px; background-color: #f8fafc; margin-bottom: 30px; border-radius: 6px; }
          .footer { text-align: center; margin-top: 60px; font-size: 9pt; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="meta-box">
          <p><strong>项目名称：</strong> ${project.name}</p>
          <p><strong>密级等级：</strong> 院内机密 (Confidential)</p>
          <p><strong>版本代码：</strong> V1.0.0 (正式方案)</p>
          <p><strong>生成时间：</strong> 2026年7月</p>
        </div>
        ${formattedHtml}
        <div class="footer">
          此方案由 医疗健康数据智能匿名化平台 依照国家去标识化指南规范分析生成
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + documentHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `医疗数据匿名化方案_${project.name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="anonymization_scheme_container">
      {/* Hidden inputs for batch uploads */}
      <input 
        type="file" 
        ref={csvFileInputRef} 
        onChange={handleCsvBatchUpload} 
        accept=".csv" 
        multiple
        className="hidden" 
      />
      <input 
        type="file" 
        ref={dicomFileInputRef} 
        onChange={handleDicomBatchUpload} 
        accept=".dcm" 
        multiple
        className="hidden" 
      />
      <input 
        type="file" 
        ref={imageFileInputRef} 
        onChange={handleImageBatchUpload} 
        accept=".jpg,.jpeg,.png,.bmp" 
        multiple
        className="hidden" 
      />

      {/* Header breadcrumbs */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-slate-900 pb-5" id="scheme_header_navigation">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 border-2 border-slate-900 hover:bg-slate-100 rounded text-slate-950 transition-colors cursor-pointer"
            title="返回项目列表"
            id="scheme_back_btn"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span>项目管理</span>
              <ChevronRight className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{project.name}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600 font-bold">方案生成</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">匿名化方案生成</h1>
          </div>
        </div>

        {/* Unified Top Right Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300 transition-all active:scale-98 cursor-pointer flex items-center justify-center"
          >
            <span>取消</span>
          </button>
          <button
            type="button"
            onClick={handleGenerateScheme}
            disabled={isGenerating}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded shadow-xs transition-all active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 text-blue-100 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-100" />
            )}
            <span>{isGenerating ? "生成中..." : "保存并生成"}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative" id="scheme_input_view">
          
          {/* Field 1: Sample Data */}
          <div className="bg-white rounded-xl shadow-xs border-2 border-slate-200 p-6" id="section_sample_data">
            <div className="mb-5">
              <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-xs inline-block"></span>
                <span>1. 样例数据 <span className="text-red-500">*</span></span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                至少选择一类数据上传，若存在多个子分类直接批量上传多个文件，将自动识别文件名为子分类名称
              </p>
            </div>

            <div className="space-y-6">
              {/* (1) CSV Text Data */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">（1）CSV文本数据</h3>
                    <p className="text-xs text-slate-500 mt-0.5">仅支持 csv 格式，仅支持单sheet，若存在多个子分类直接批量上传多个文件，将自动识别文件名为子分类名称</p>
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded border border-slate-300 text-xs font-bold gap-0.5">
                    <button
                      type="button"
                      onClick={() => setCsvEnabled(true)}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${csvEnabled ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      有
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCsvEnabled(false);
                      }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${!csvEnabled ? 'bg-slate-300 text-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      无
                    </button>
                  </div>
                </div>

                {csvEnabled && (
                  <div className="space-y-4">
                    {/* Batch Upload Area */}
                    <div 
                      onClick={() => csvFileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-6 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      <Upload className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black text-slate-700">点击批量选择或拖拽多个 CSV 格式样例数据文件</span>
                    </div>

                    {/* Category List in Table Form */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-3xs">
                      {csvCategories.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 bg-white font-medium">暂无CSV数据分类，请在上方上传文件</p>
                      ) : (
                        <table className="min-w-full table-fixed bg-white divide-y divide-slate-200 text-xs text-left">
                          <thead className="bg-slate-50 font-black text-slate-700 text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="px-3 py-3 text-center border-b border-r border-slate-200 w-16">序号</th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-64">子分类名称<span className="text-red-500 font-bold ml-0.5">*</span></th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-60">文件名</th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-72">长文本字段</th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-80">数据标签</th>
                              <th className="px-3 py-3 text-center border-b border-slate-200 w-24">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150">
                            {csvCategories.map((cat, catIdx) => {
                              const configs = cat.configs || [{ id: "temp", textField: "", splitFields: [] }];
                              const rowSpan = configs.length;
                              const hasFile = cat.files && cat.files.length > 0;
                              const fileName = hasFile ? cat.files[0].name : "未上传文件";

                              return configs.map((config, configIdx) => {
                                const isFirstRow = configIdx === 0;
                                return (
                                  <tr key={`${cat.id}-${config.id}`} className="hover:bg-slate-50/40 transition-colors">
                                    {isFirstRow && (
                                      <td className="px-3 py-3.5 text-center align-middle border-r border-slate-200 bg-slate-50/20 font-semibold font-mono" rowSpan={rowSpan}>
                                        {catIdx + 1}
                                      </td>
                                    )}
                                    {isFirstRow && (
                                      <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white" rowSpan={rowSpan}>
                                        <div className="flex flex-col space-y-1">
                                          <div className="flex items-center space-x-1">
                                            <input
                                              type="text"
                                              required
                                              value={cat.name}
                                              onChange={(e) => {
                                                const newName = e.target.value;
                                                setCsvCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: newName } : c));
                                              }}
                                              className={`p-1.5 border rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${
                                                !cat.name.trim() ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-250 focus:border-blue-500 bg-slate-50/30"
                                              }`}
                                              placeholder="修改子分类名称"
                                            />
                                          </div>
                                          {!cat.name.trim() && (
                                            <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                                              <AlertCircle className="w-3 h-3" />
                                              必填项
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    )}
                                    {isFirstRow && (
                                      <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white" rowSpan={rowSpan}>
                                        <div className="font-mono text-slate-600 break-all text-xs font-semibold leading-relaxed">
                                          {fileName}
                                        </div>
                                      </td>
                                    )}
                                    
                                    {/* Column 4: Long Text Field Dropdown with "+" and remove actions */}
                                    <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                      <div className="flex items-center space-x-1.5">
                                        <div className="flex-1">
                                          <SearchableSingleSelect
                                            value={config.textField}
                                            options={cat.headers}
                                            onChange={(val) => updateConfigRow(cat.id, config.id, { textField: val })}
                                            placeholder="请选择长文本字段"
                                          />
                                        </div>
                                        
                                        <button
                                          type="button"
                                          onClick={() => addConfigRow(cat.id)}
                                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded transition-colors cursor-pointer shrink-0 flex items-center justify-center w-6 h-6 font-bold text-sm"
                                          title="增加行"
                                        >
                                          +
                                        </button>

                                        {rowSpan > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeConfigRow(cat.id, config.id)}
                                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded transition-colors cursor-pointer shrink-0 flex items-center justify-center w-6 h-6"
                                            title="删除此行长文本"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </td>

                                    {/* Column 5: Split Fields Dropdown (Multi-select) */}
                                    <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                      <SplitFieldsMultiSelect
                                        selected={config.splitFields}
                                        options={splitOptions}
                                        onChange={(val) => updateConfigRow(cat.id, config.id, { splitFields: val })}
                                      />
                                    </td>

                                    {isFirstRow && (
                                      <td className="px-3 py-3.5 text-center align-middle border-slate-200 bg-white" rowSpan={rowSpan}>
                                        <button
                                          type="button"
                                          onClick={() => setCsvCategories(prev => prev.filter(c => c.id !== cat.id))}
                                          className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-bold border border-red-100 transition-colors cursor-pointer"
                                        >
                                          删除
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                );
                              });
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* (2) DICOM Image Data */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">（2）DICOM影像数据</h3>
                    <p className="text-xs text-slate-500 mt-0.5">仅支持DICOM格式，若存在多个子分类直接批量上传多个文件，将自动识别文件名为子分类名称</p>
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded border border-slate-300 text-xs font-bold gap-0.5">
                    <button
                      type="button"
                      onClick={() => setDicomEnabled(true)}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${dicomEnabled ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      有
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDicomEnabled(false);
                      }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${!dicomEnabled ? 'bg-slate-300 text-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      无
                    </button>
                  </div>
                </div>

                {dicomEnabled && (
                  <div className="space-y-4">
                    {/* Batch Upload Area */}
                    <div 
                      onClick={() => dicomFileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-6 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      <Upload className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black text-slate-700">点击批量选择或拖拽多个 .dcm 格式医学影像文件</span>
                    </div>

                    {/* Category List in Table Form */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-3xs">
                      {dicomCategories.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 bg-white font-medium">暂无DICOM影像分类，请在上方上传文件</p>
                      ) : (
                        <table className="min-w-full bg-white divide-y divide-slate-200 text-xs text-left">
                          <thead className="bg-slate-50 font-black text-slate-700 text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="px-3 py-3 text-center border-b border-r border-slate-200 w-16">序号</th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-80">子分类名称<span className="text-red-500 font-bold ml-0.5">*</span></th>
                              <th className="px-3 py-3 border-b border-r border-slate-200">文件名</th>
                              <th className="px-3 py-3 text-center border-b border-slate-200 w-24">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150">
                            {dicomCategories.map((cat, catIdx) => {
                              const hasFile = cat.files && cat.files.length > 0;
                              const fileName = hasFile ? cat.files[0].name : "未上传文件";
                              return (
                                <tr key={cat.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="px-3 py-3.5 text-center align-middle border-r border-slate-200 bg-slate-50/20 font-semibold font-mono">
                                    {catIdx + 1}
                                  </td>
                                  <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                    <div className="flex flex-col space-y-1">
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="text"
                                          required
                                          value={cat.name}
                                          onChange={(e) => {
                                            const newName = e.target.value;
                                            setDicomCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: newName } : c));
                                          }}
                                          className={`p-1.5 border rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${
                                            !cat.name.trim() ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-250 focus:border-blue-500 bg-slate-50/30"
                                          }`}
                                          placeholder="修改子分类名称"
                                        />
                                      </div>
                                      {!cat.name.trim() && (
                                        <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                                          <AlertCircle className="w-3 h-3" />
                                          必填项
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                    <div className="font-mono text-slate-600 break-all text-xs font-semibold leading-relaxed">
                                      {fileName}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3.5 text-center align-middle border-slate-200 bg-white">
                                    <button
                                      type="button"
                                      onClick={() => setDicomCategories(prev => prev.filter(c => c.id !== cat.id))}
                                      className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-bold border border-red-100 transition-colors cursor-pointer"
                                    >
                                      删除
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* (3) Image Data */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">（3）图片数据</h3>
                    <p className="text-xs text-slate-500 mt-0.5">支持PNG/JPG/JPEG/BMP格式，若存在多个子分类直接批量上传多个文件，将自动识别文件名为子分类名称</p>
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded border border-slate-300 text-xs font-bold gap-0.5">
                    <button
                      type="button"
                      onClick={() => setImageEnabled(true)}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${imageEnabled ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      有
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageEnabled(false);
                      }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${!imageEnabled ? 'bg-slate-300 text-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      无
                    </button>
                  </div>
                </div>

                {imageEnabled && (
                  <div className="space-y-4">
                    {/* Batch Upload Area */}
                    <div 
                      onClick={() => imageFileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-6 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      <Upload className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black text-slate-700">点击批量选择或拖拽多个医学图片 (.jpg/.jpeg/.png/.bmp) 文件</span>
                    </div>

                    {/* Category List in Table Form */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-3xs">
                      {imageCategories.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 bg-white font-medium">暂无图片数据分类，请在上方上传文件</p>
                      ) : (
                        <table className="min-w-full bg-white divide-y divide-slate-200 text-xs text-left">
                          <thead className="bg-slate-50 font-black text-slate-700 text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="px-3 py-3 text-center border-b border-r border-slate-200 w-16">序号</th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-80">子分类名称<span className="text-red-500 font-bold ml-0.5">*</span></th>
                              <th className="px-3 py-3 border-b border-r border-slate-200">文件名</th>
                              <th className="px-3 py-3 text-center border-b border-slate-200 w-24">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150">
                            {imageCategories.map((cat, catIdx) => {
                              const hasFile = cat.files && cat.files.length > 0;
                              const fileName = hasFile ? cat.files[0].name : "未上传文件";
                              return (
                                <tr key={cat.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="px-3 py-3.5 text-center align-middle border-r border-slate-200 bg-slate-50/20 font-semibold font-mono">
                                    {catIdx + 1}
                                  </td>
                                  <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                    <div className="flex flex-col space-y-1">
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="text"
                                          required
                                          value={cat.name}
                                          onChange={(e) => {
                                            const newName = e.target.value;
                                            setImageCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: newName } : c));
                                          }}
                                          className={`p-1.5 border rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${
                                            !cat.name.trim() ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-250 focus:border-blue-500 bg-slate-50/30"
                                          }`}
                                          placeholder="修改子分类名称"
                                        />
                                      </div>
                                      {!cat.name.trim() && (
                                        <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                                          <AlertCircle className="w-3 h-3" />
                                          必填项
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                    <div className="font-mono text-slate-600 break-all text-xs font-semibold leading-relaxed">
                                      {fileName}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3.5 text-center align-middle border-slate-200 bg-white">
                                    <button
                                      type="button"
                                      onClick={() => setImageCategories(prev => prev.filter(c => c.id !== cat.id))}
                                      className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-bold border border-red-100 transition-colors cursor-pointer"
                                    >
                                      删除
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Field 2: Data Scale */}
          <div className="bg-white rounded-xl shadow-xs border-2 border-slate-200 p-6" id="section_data_scale">
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2 mb-4">
              <span className="w-1.5 h-4 bg-blue-600 rounded-xs inline-block"></span>
              <span>2. 数据规模 <span className="text-red-500">*</span></span>
            </h2>
            
            <input
              type="text"
              required
              value={dataScale}
              onChange={(e) => setDataScale(e.target.value)}
              placeholder="请输入"
              className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
              id="data_scale_input"
            />
          </div>

          {/* Field 3: Usage Scenario */}
          <div className="bg-white rounded-xl shadow-xs border-2 border-slate-200 p-6" id="section_usage_scenario">
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2 mb-4">
              <span className="w-1.5 h-4 bg-blue-600 rounded-xs inline-block"></span>
              <span>3. 使用场景说明 <span className="text-red-500">*</span></span>
            </h2>
            
            <textarea
              value={usageScenario}
              onChange={(e) => setUsageScenario(e.target.value)}
              placeholder="例如：xx医院作为一所以xx为重点学科的三级甲等综合医院，已系统性积累了规模庞大的xx数据集。医院拟根据xx公司的需求，在匿名化处理后，向xx公司进行合规流通，用于医疗大模型能力评估与优化。"
              className="w-full h-32 p-3 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none text-slate-800"
              id="usage_scenario_textarea"
            />
          </div>

          {/* Field 4: Anonymization Evaluation Method */}
          <div className="bg-white rounded-xl shadow-xs border-2 border-slate-200 p-6" id="section_evaluation_method">
            <div className="border-b-2 border-slate-100 pb-4 mb-5">
              <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-xs inline-block"></span>
                <span>4. 匿名化评价方式</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">选择具体的评价方式，并配置相应的参数</p>
            </div>

            <div className="space-y-6">
              {/* (1) Evaluation Method */}
              <div className="border-b border-slate-100 pb-5">
                <label className="block text-sm font-bold text-slate-900 tracking-tight mb-2">
                  （1）评价方式<span className="text-rose-600 ml-1 font-black">*</span>
                </label>
                <select
                  value={evaluationMethod}
                  onChange={(e) => setEvaluationMethod(e.target.value)}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border-2 border-slate-200 rounded text-xs font-bold text-slate-500 focus:outline-none cursor-not-allowed"
                >
                  <option value="K匿名">k-匿名值</option>
                </select>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
                  具体计算公式：A = K × S × E 其中：A——匿名化程度，表示数据集的匿名化程度。其值大于等于 1 时，认为满足匿名化要求；K——数据集 K 匿名值，表示数据集经过匿名化处理后，具备相同的准标识符字段组合的记录的条数的最小值；S——场景系数，表示数据匿名化后使用场景的安全系数，如领地公开共享、受控公开共享、完全公开共享等；E——环境系数，表示数据流通时，数据流通环境的技术保障能力和管理保障能力。
                </p>
              </div>

              {/* (2) Scenario Coefficient */}
              <div className="border-b border-slate-100 pb-5">
                <label className="block text-sm font-bold text-slate-900 tracking-tight mb-2">
                  （2）场景系数<span className="text-rose-600 ml-1 font-black">*</span>
                </label>
                <select
                  value={scenarioType}
                  onChange={(e) => setScenarioType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">请选择</option>
                  <option value="组织内部同一个事业群的数据流通">组织内部同一个事业群的数据流通</option>
                  <option value="组织内部跨事业群的数据流通">组织内部跨事业群的数据流通</option>
                  <option value="组织外部两方的数据流通">组织外部两方的数据流通</option>
                  <option value="组织外部多方的数据流通">组织外部多方的数据流通</option>
                  <option value="对外公开">对外公开</option>
                </select>
                <div className="mt-2 text-xs font-bold text-slate-600 flex items-center space-x-1">
                  <span>建议的场景系数 S：</span>
                  <span className="text-blue-600 font-black">
                    {scenarioType === "组织内部同一个事业群的数据流通" && "1/3"}
                    {scenarioType === "组织内部跨事业群的数据流通" && "1/4"}
                    {scenarioType === "组织外部两方的数据流通" && "1/5"}
                    {scenarioType === "组织外部多方的数据流通" && "1/6"}
                    {scenarioType === "对外公开" && "1/20"}
                    {!scenarioType && "-"}
                  </span>
                </div>
              </div>

              {/* (3) Environmental Coefficient - Technical Guard */}
              <div className="border-b border-slate-100 pb-5">
                <label className="block text-sm font-bold text-slate-900 tracking-tight mb-2">
                  （3）环境系数-技术保障能力<span className="text-rose-600 ml-1 font-black">*</span>
                </label>
                <div className="space-y-5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {envItems.map((item) => {
                    return (
                      <div key={item.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center flex-wrap gap-1.5">
                              <span>{item.name}</span>
                            </h3>
                            {item.desc && (
                              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                            )}
                          </div>

                          {/* Options */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                            <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-bold">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'env', '满足')}
                                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                                  item.status === '满足' 
                                    ? 'bg-emerald-600 text-white shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                满足
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'env', '待完善')}
                                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                                  item.status === '待完善' 
                                    ? 'bg-amber-500 text-white shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                待完善
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* (4) Environmental Coefficient - Management Guard */}
              <div className="border-b border-slate-100 pb-5">
                <label className="block text-sm font-bold text-slate-900 tracking-tight mb-2">
                  （4）环境系数-管理保障能力<span className="text-rose-600 ml-1 font-black">*</span>
                </label>
                <div className="space-y-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {["数据持有方", "数据使用方", "数据运营方"].map((categoryName) => {
                    const categoryItems = mgmtItems.filter(item => item.category === categoryName);
                    if (categoryItems.length === 0) return null;
                    return (
                      <div key={categoryName} className="space-y-3">
                        <div className="flex items-center space-x-1.5 border-b border-slate-200/60 pb-1.5 mb-2">
                          <span className="w-1 h-3 bg-blue-600 rounded-full"></span>
                          <h4 className="text-xs font-black text-blue-800">
                            {categoryName}
                          </h4>
                        </div>
                        <div className="space-y-4 pl-1">
                          {categoryItems.map((item) => {
                            return (
                              <div key={item.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                  <div className="flex-1">
                                    <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center flex-wrap gap-1.5">
                                      <span>{item.name}</span>
                                    </h3>
                                    {item.desc && (
                                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                                    )}
                                  </div>

                                  {/* Options */}
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                                    <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-bold">
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(item.id, 'mgmt', '满足')}
                                        className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                                          item.status === '满足' 
                                            ? 'bg-emerald-600 text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                      >
                                        满足
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(item.id, 'mgmt', '待完善')}
                                        className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                                          item.status === '待完善' 
                                            ? 'bg-amber-500 text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                      >
                                        待完善
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* (5) Minimum K Value */}
              <div>
                <label className="block text-sm font-bold text-slate-900 tracking-tight mb-2">
                  （5）最低K值
                </label>
                <div className="flex items-center space-x-3 bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">根据上述填写的场景系数和环境系数，为满足匿名化要求，K-匿名值应不低于：</p>
                  </div>
                  <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-blue-600">
                      {scenarioType === "组织内部同一个事业群的数据流通" && "3"}
                      {scenarioType === "组织内部跨事业群的数据流通" && "4"}
                      {scenarioType === "组织外部两方的数据流通" && "5"}
                      {scenarioType === "组织外部多方的数据流通" && "6"}
                      {scenarioType === "对外公开" && "20"}
                      {!scenarioType && "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action generate button removed */}

      </div>

      {/* Generating Overlay Modal */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-4 border-slate-900 shadow-2xl max-w-lg w-full p-8 text-center">
            <div className="relative mb-6 mx-auto w-16 h-16">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">匿名化方案生成中</h2>
          </div>
        </div>
      )}

      {/* Success Modal Overlay */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-4 border-slate-900 shadow-2xl max-w-xl w-full p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">🎉 医疗数据匿名化方案装配成功！</h2>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed max-w-md mx-auto">
              系统已基于我国 <strong>GB/T 39725 医疗安全指南</strong> 和 <strong>GB/T 37964 去标识化指南</strong> 装配完成了针对项目 <strong className="text-blue-600 font-extrabold">《{project.name}》</strong> 的合规保护方案文档，并已同步存入项目资产中。
            </p>
            
            {generationError && (
              <div className="mt-4 bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-lg p-4 text-left text-xs leading-relaxed">
                <span className="font-black text-amber-950 uppercase block mb-1">⚠️ 补偿性合规说明：</span>
                <p className="text-amber-800 font-bold">{generationError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={onBack}
                className="py-3 px-4 border-2 border-slate-300 hover:border-slate-800 rounded font-black text-xs text-slate-700 hover:text-slate-950 uppercase tracking-wider transition-all cursor-pointer"
              >
                返回项目大厅
              </button>
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  if (onSchemeGenerated) onSchemeGenerated();
                }}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-200 transition-all cursor-pointer animate-none"
              >
                查看匿名化方案
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
