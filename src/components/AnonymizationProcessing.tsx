import React, { useState, useEffect } from "react";
import { Project, UploadState, FieldConfig, DicomConfig } from "../types";
import { 
  ArrowLeft, Eye, EyeOff, ShieldAlert, Sparkles, Check, Play, RefreshCw, 
  HelpCircle, ChevronRight, FileSpreadsheet, Download, Info, Trash2, 
  Plus, Minus, UploadCloud, CheckCircle2, ShieldCheck, FileCode, ArrowRight, Settings2, Lock, Loader2,
  BarChart2, X, Sliders, Globe, Pencil, FileCheck, Scan, AlertCircle
} from "lucide-react";
import { STANDARD_CSV_FIELDS, STANDARD_DICOM_FIELDS } from "../lib/constants";
import { DirectoryFileTreeSelect } from "./DirectoryFileTreeSelect";

interface AnonymizationProcessingProps {
  project: Project;
  onBack: () => void;
  uploadState: UploadState;
  onStartUpload: (csvFile: { name: string } | null, dicomFile: { name: string } | null, imageFile: { name: string } | null) => void;
  onUpdateUploadState: (state: Partial<UploadState>) => void;
  initialStep?: 1 | 2;
  onSaveSuccess?: () => void;
  onGoToScheme?: () => void;
}

// Interactive sample records representing raw clinical data
const RECORD_MOCKUPS = [
  {
    hospital: "北京协和医院",
    title: "门诊病历记录单",
    name: "陈志强",
    gender: "男",
    age: "52岁",
    id: "OP-4491028",
    date: "2026-07-18",
    dept: "骨关节外科",
    items: [
      { label: "主诉", value: "左侧髋关节隐痛伴跛行3月余，加重5天。" },
      { label: "现病史", value: "患者3月前无明显诱因开始感觉左侧髋关节活动后隐痛，休息后稍缓解。5天前步行负重后疼痛剧烈加重，行走跛行明显，活动受限。" },
      { label: "体格检查", value: "左侧腹股沟中点压痛（+），“4”字试验阳性，左髋关节内旋外展受限，托马斯征可疑。" },
      { label: "辅助检查", value: "左髋关节X光及双侧股骨头MRI示：左侧股骨头负重区不规则斑片状异常信号，关节面无塌陷，提示左股骨头无菌性坏死（ARCO II期）。" },
      { label: "临床诊断", value: "1. 左侧股骨头无菌性坏死（ARCO II期）  2. 左侧髋关节退行性病变" },
    ],
    doctor: "刘建国 主任医师",
  },
  {
    hospital: "上海交通大学医学院附属瑞金医院",
    title: "门诊就诊记录表",
    name: "林春梅",
    gender: "女",
    age: "61岁",
    id: "OP-3310924",
    date: "2026-07-19",
    dept: "脊柱外科",
    items: [
      { label: "主诉", value: "腰部酸痛伴左下肢放射痛1周。" },
      { label: "现病史", value: "患者1周前弯腰提物时突发腰部剧烈酸痛，随后出现左臀部及左下肢后外侧放射性疼痛，伴麻木感，站立、咳嗽或行走时疼痛明显加重，平卧可稍缓解。" },
      { label: "体格检查", value: "腰椎生理弯曲变直，L4-L5、L5-S1棘突旁左侧压痛明显并向左下肢放射。左侧直腿抬高试验40°（+），加强试验（+）。左侧足背伸肌力减弱。" },
      { label: "辅助检查", value: "腰椎MRI检查示：L4-L5、L5-S1椎间盘向左后方突出，压迫硬膜囊及左侧神经根，椎管代偿性狭窄。" },
      { label: "临床诊断", value: "1. 腰椎间盘突出症 (L4-S1)  2. 坐骨神经痛" },
    ],
    doctor: "张明 教授",
  },
  {
    hospital: "四川大学华西医院",
    title: "门诊病历诊疗记录",
    name: "王小东",
    gender: "男",
    age: "29岁",
    id: "OP-8820412",
    date: "2026-07-20",
    dept: "运动医学科",
    items: [
      { label: "主诉", value: "右踝关节外伤扭伤后肿胀、疼痛伴活动受限12小时。" },
      { label: "现病史", value: "患者昨晚打篮球时起跳落地不慎踩到他人脚部，导致右踝关节内翻扭伤，局部当即剧烈疼痛，半小时后迅速肿胀。自行冰敷处理，疼痛无明显缓解，今日无法负重行走。" },
      { label: "体格检查", value: "右踝外踝下方明显肿胀、皮下瘀斑，外侧副韧带（距腓前韧带、跟腓韧带）处压痛极显著。前抽屉试验阳性（+），内翻应力试验阳性（+）。" },
      { label: "辅助检查", value: "右踝X线骨质未见明显骨折征象。超声检查提示：右踝距腓前韧带连续性中断，周围见局限性积液，提示外侧副韧带部分断裂。" },
      { label: "临床诊断", value: "1. 右踝关节外侧副韧带部分断裂  2. 右踝关节软组织挫伤" },
    ],
    doctor: "王晓宇 副主任医师",
  }
];

const ORDER_MOCKUPS = [
  {
    hospital: "北京协和医院",
    title: "门诊电子处方/医嘱单",
    name: "陈志强",
    gender: "男",
    age: "52岁",
    id: "RX-4491028",
    date: "2026-07-18",
    dept: "骨关节外科",
    orders: [
      { name: "1. 硫酸氨基葡萄糖胶囊 (Glucosamine)", spec: "250mg * 40粒 /盒", usage: "Sig: 一次2粒，一日3次，饭后口服" },
      { name: "2. 双氯芬酸钠缓释片 (Diclofenac Sodium)", spec: "75mg * 10片 /盒", usage: "Sig: 一次1片，一日1次，睡前口服 (避开胃肠不适)" },
      { name: "3. 碳酸钙D3片 (Caltrate D3)", spec: "600mg * 30片 /瓶", usage: "Sig: 一次1片，一日1次，随晚餐口服" }
    ],
    totalPrice: "￥189.50",
    pharmacist: "李静 主管药师",
  },
  {
    hospital: "上海交通大学医学院附属瑞金医院",
    title: "门诊处方医嘱记录单",
    name: "林春梅",
    gender: "女",
    age: "61岁",
    id: "RX-3310924",
    date: "2026-07-19",
    dept: "脊柱外科",
    orders: [
      { name: "1. 甲钴胺片 (Mecobalamin Tablets)", spec: "0.5mg * 30片 /盒", usage: "Sig: 一次1片，一日3次，口服 (营养神经用)" },
      { name: "2. 塞来昔布胶囊 (Celecoxib Caps)", spec: "200mg * 10粒 /盒", usage: "Sig: 一次1粒，一日1次，口服 (消炎止痛用)" },
      { name: "3. 氟比洛芬凝胶贴膏 (Flurbiprofen Cataplasm)", spec: "40mg * 6贴 /袋", usage: "Sig: 一日1贴，贴于腰部最痛处，每次不超过12小时" }
    ],
    totalPrice: "￥142.20",
    pharmacist: "赵勇 执业药师",
  },
  {
    hospital: "四川大学华西医院",
    title: "临床门诊处方笺",
    name: "王小东",
    gender: "男",
    age: "29岁",
    id: "RX-8820412",
    date: "2026-07-20",
    dept: "运动医学科",
    orders: [
      { name: "1. 迈之灵片 (Aescin Tablets)", spec: "150mg * 40片 /盒", usage: "Sig: 一次2片，一日2次，早晚饭后服用 (促进淋巴静脉回流、消肿)" },
      { name: "2. 布洛芬缓释胶囊 (Ibuprofen Sustained Release)", spec: "300mg * 10粒 /盒", usage: "Sig: 一次1粒，必要时一日2次，口服 (止痛用)" },
      { name: "3. 云南白药气雾剂套盒 (Yunnan Baiyao Spray)", spec: "85g + 30g /套", usage: "Sig: 一日3-5次，喷于右踝扭伤红肿区域" }
    ],
    totalPrice: "￥115.80",
    pharmacist: "林玉 审核药师",
  }
];

interface RawRecord {
  patientId: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  admissionDate: string;
  occupation: string;
  diagnosis: string; // Sensitive attribute
  zipCode: string;
}

const INITIAL_RAW_DATA: RawRecord[] = [
  { patientId: "110101198506121029", name: "张维华", phone: "13818293041", age: 41, gender: "男", admissionDate: "2026-03-12", occupation: "眼科医生", diagnosis: "急性骨髓性白血病", zipCode: "200120" },
  { patientId: "320502197510043518", name: "李小梅", phone: "18949201948", age: 51, gender: "女", admissionDate: "2026-04-18", occupation: "小学教师", diagnosis: "双膝骨性关节炎(III期)", zipCode: "215000" },
  { patientId: "330103194112211929", name: "赵铁柱", phone: "13148190294", age: 85, gender: "男", admissionDate: "2026-05-02", occupation: "退休工人", diagnosis: "原发性高血压(极高危)", zipCode: "310000" },
  { patientId: "310112198905293410", name: "麦嘉豪", phone: "13641830219", age: 37, gender: "男", admissionDate: "2026-05-15", occupation: "眼科医生", diagnosis: "腰椎间盘突出伴髓核脱出", zipCode: "201100" },
  { patientId: "320102200201115822", name: "王若曦", phone: "15921820412", age: 24, gender: "女", admissionDate: "2026-06-01", occupation: "在校学生", diagnosis: "左股骨颈骨折(Garden IV型)", zipCode: "210000" },
];

const SplitFieldsSelector = ({
  selected,
  onChange
}: {
  selected: string[];
  onChange: (val: string[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["患者姓名", "医生姓名", "日期时间", "医院名称", "科室名称", "疾病诊断", "药品名称", "手术操作"];
  
  return (
    <div className="relative inline-block w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 text-left flex items-center justify-between shadow-3xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className="truncate">
          {selected.length > 0 ? selected.join(", ") : "请选择数据标签"}
        </span>
        <span className="text-slate-400 ml-1 text-[9px]">▼</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto p-2 space-y-1">
            {options.map(opt => {
              const isChecked = selected.includes(opt);
              return (
                <label key={opt} className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer text-xs text-slate-700 select-none">
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
                  <span className="font-medium">{opt}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const SearchableFieldSelect = ({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block w-full text-left">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 text-left flex items-center justify-between shadow-3xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className="truncate font-bold text-slate-800">
          {value || "请选择长文本字段"}
        </span>
        <span className="text-slate-400 ml-1 text-[9px]">▼</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 p-2 space-y-1 w-64">
            <input
              type="text"
              autoFocus
              placeholder="输入以搜索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
            />
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-1.5 hover:bg-slate-100 rounded text-xs select-none font-medium cursor-pointer ${
                      opt === value ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))
              ) : (
                <div className="text-[10px] text-slate-400 text-center py-2">未找到匹配项</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function AnonymizationProcessing({ 
  project, 
  onBack, 
  uploadState, 
  onStartUpload, 
  onUpdateUploadState,
  initialStep,
  onSaveSuccess,
  onGoToScheme
}: AnonymizationProcessingProps) {
  
  // Wizards steps: 1 = Upload, 2 = Config, 3 = Simulation Results
  const [step, setStep] = useState<1 | 2 | 3>(initialStep || (uploadState.isCompleted ? 2 : 1));
  const [activeTab, setActiveTab] = useState<'csv' | 'dicom' | 'image'>('csv');
  const [csvSubTab, setCsvSubTab] = useState<'admission' | 'check' | 'test'>('admission');
  const [imageSubTab, setImageSubTab] = useState<'record' | 'order'>('record');
  const [csvFiles, setCsvFiles] = useState<File[]>([]);
  const [dicomFiles, setDicomFiles] = useState<File[]>([]);

  // Dropdown selections for CSV categories
  const [admissionSelect, setAdmissionSelect] = useState<string>("test002.csv");
  const [checkSelect, setCheckSelect] = useState<string>("test9999.csv");
  const [testSelect, setTestSelect] = useState<string>("test001.csv");

  // Dropdown selection for DICOM
  const [dicomSelect, setDicomSelect] = useState<string>("disk01/data/dicom");

  // Dropdown selections for Image categories
  const [recordSelect, setRecordSelect] = useState<string>("disk01/data/image");
  const [orderSelect, setOrderSelect] = useState<string>("disk01/data/image/record");

  // State for showing the Save Failure dialog
  const [showSaveFailModal, setShowSaveFailModal] = useState<boolean>(false);

  // Step 1 upload page edit and validation states
  const [isEditingUpload, setIsEditingUpload] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validateProgress, setValidateProgress] = useState<number>(0);
  const [validationDone, setValidationDone] = useState<boolean>(false);
  const [backupUploadValues, setBackupUploadValues] = useState<{
    admissionSelect: string;
    checkSelect: string;
    testSelect: string;
    dicomSelect: string;
    recordSelect: string;
    orderSelect: string;
  } | null>(null);

  const handleStartEdit = () => {
    setBackupUploadValues({
      admissionSelect,
      checkSelect,
      testSelect,
      dicomSelect,
      recordSelect,
      orderSelect
    });
    setIsEditingUpload(true);
  };

  const handleCancelEdit = () => {
    if (backupUploadValues) {
      setAdmissionSelect(backupUploadValues.admissionSelect);
      setCheckSelect(backupUploadValues.checkSelect);
      setTestSelect(backupUploadValues.testSelect);
      setDicomSelect(backupUploadValues.dicomSelect);
      setRecordSelect(backupUploadValues.recordSelect);
      setOrderSelect(backupUploadValues.orderSelect);
    }
    setIsEditingUpload(false);
  };

  const handleSaveEdit = () => {
    // Directly exit edit mode without showing any modal dialog
    setIsEditingUpload(false);
  };

  const handleStartValidation = () => {
    setIsValidating(true);
    setValidateProgress(0);
    setValidationDone(false);
  };

  const handleCancelValidation = () => {
    setIsValidating(false);
    setValidateProgress(0);
    setValidationDone(false);
  };

  // Validation timer simulation
  useEffect(() => {
    let interval: any = null;
    if (isValidating) {
      interval = setInterval(() => {
        setValidateProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsValidating(false);
            setValidationDone(true);
            return 100;
          }
          const increment = Math.floor(Math.random() * 12) + 8;
          const next = prev + increment;
          if (next >= 100) {
            clearInterval(interval);
            setIsValidating(false);
            setValidationDone(true);
            return 100;
          }
          return next;
        });
      }, 120);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isValidating]);

  // Default rules state for image categories
  const [recordImageRules, setRecordImageRules] = useState([
    { id: "r1", area: "顶端患者基本信息区 (含就诊卡号、姓名)", action: "区域涂黑 (Blackout)", mode: "智能识别并自动生成黑框遮盖", enabled: true },
    { id: "r2", area: "右侧医生印章及签名区", action: "高斯模糊 (Gaussian Blur)", mode: "OCR文字检测定位并去标识化", enabled: true },
    { id: "r3", area: "左下角条形码及二维码", action: "像素平滑遮盖 (Pixelate)", mode: "条码模式检测与重写遮盖", enabled: true },
    { id: "r4", area: "临床影像拍摄区 (骨折X光彩照部分)", action: "原文保留", mode: "仅清洗残留患者姓名文字", enabled: true },
  ]);

  const [orderImageRules, setOrderImageRules] = useState([
    { id: "o1", area: "主诉与诊断文本描述区", action: "智能文字清洗", mode: "NLP姓名/地址/电话词条自动屏蔽", enabled: true },
    { id: "o2", area: "医生/药剂师手写签名区", action: "高斯模糊 (Gaussian Blur)", mode: "轮廓提取与选择性多层级打码", enabled: true },
    { id: "o3", area: "处方编号及医院抬条", action: "原文保留", mode: "保留用于备案回溯，去标识化", enabled: true },
  ]);

  // Pre-fill default files for the first project (p1) to show "default each category has one data item uploaded"
  useEffect(() => {
    if (project?.id === "p1") {
      setAdmissionSelect("test002.csv");
      setCheckSelect("test9999.csv");
      setTestSelect("test001.csv");
      setDicomSelect("disk01/data/dicom");
      setRecordSelect("disk01/data/image");
      setOrderSelect("disk01/data/image/record");

      if (admissionFiles.length === 0 && checkFiles.length === 0 && testFiles.length === 0 && dicomFiles.length === 0 && recordFiles.length === 0 && orderFiles.length === 0) {
        // Create mock file objects
        const f1 = { name: "骨科住院病历记录表_1000例.csv", size: 1024 * 350, type: "text/csv" } as File;
        const f2 = { name: "骨科放射检查记录表_1000例.csv", size: 1024 * 180, type: "text/csv" } as File;
        const f3 = { name: "骨科实验室检验报告_1000例.csv", size: 1024 * 220, type: "text/csv" } as File;
        const f4 = { name: "骨科CT_重建三维矢状位影像序列", size: 1024 * 1024 * 45, type: "application/dicom" } as File;
        const f5 = { name: "骨科门诊就诊原生态彩照_100例.png", size: 1024 * 1200, type: "image/png" } as File;
        const f6 = { name: "骨科门诊医嘱原生态切片_100例.jpg", size: 1024 * 980, type: "image/jpeg" } as File;

        setAdmissionFiles([f1]);
        setCheckFiles([f2]);
        setTestFiles([f3]);
        setDicomFiles([f4]);
        setRecordFiles([f5]);
        setOrderFiles([f6]);

        setUploadProgresses({
          admission: 100,
          check: 100,
          test: 100,
          dicom: 100,
          record: 100,
          order: 100
        });

        // Update parent state as well
        onUpdateUploadState({
          CSVProgress: 100,
          dicomProgress: 100,
          imageProgress: 100,
          CSVFileName: "骨科住院病历记录表_1000例.csv",
          dicomFileName: "骨科CT_重建三维矢状位影像序列",
          imageFileName: "骨科门诊就诊原生态彩照_100例.png",
          isUploading: false,
          isCompleted: true,
          parsedCSVFields: JSON.parse(JSON.stringify(STANDARD_CSV_FIELDS)),
          parsedDICOMFields: JSON.parse(JSON.stringify(STANDARD_DICOM_FIELDS))
        });
      }
    }
  }, [project?.id]);

  // Categorized upload states
  const [admissionFiles, setAdmissionFiles] = useState<File[]>([]);
  const [checkFiles, setCheckFiles] = useState<File[]>([]);
  const [testFiles, setTestFiles] = useState<File[]>([]);
  const [ctFiles, setCtFiles] = useState<File[]>([]);
  const [mrFiles, setMrFiles] = useState<File[]>([]);
  const [recordFiles, setRecordFiles] = useState<File[]>([]);
  const [orderFiles, setOrderFiles] = useState<File[]>([]);

  const [subCategoryNames, setSubCategoryNames] = useState<Record<string, string>>({});

  const getSubCategoryName = (fileName: string) => {
    return subCategoryNames[fileName] !== undefined ? subCategoryNames[fileName] : fileName;
  };

  const updateSubCategoryName = (fileName: string, val: string) => {
    setSubCategoryNames(prev => ({ ...prev, [fileName]: val }));
  };

  const [csvConfigs, setCsvConfigs] = useState<{
    [fileName: string]: { id: string; textField: string; splitFields: string[] }[];
  }>({});

  useEffect(() => {
    const allCsvFiles = [...admissionFiles, ...checkFiles, ...testFiles];
    setCsvConfigs(prev => {
      const next = { ...prev };
      let changed = false;
      allCsvFiles.forEach(file => {
        if (!next[file.name]) {
          next[file.name] = [
            {
              id: Math.random().toString(36).substring(7),
              textField: "主诉",
              splitFields: ["患者姓名", "医生姓名"]
            }
          ];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [admissionFiles, checkFiles, testFiles]);

  const addConfigRow = (fileName: string) => {
    setCsvConfigs(prev => {
      const current = prev[fileName] || [];
      const nextTextField = ["现病史", "既往史", "个人史", "体格检查", "入院诊断", "出院病历"].find(
        opt => !current.some(c => c.textField === opt)
      ) || "现病史";
      return {
        ...prev,
        [fileName]: [
          ...current,
          {
            id: Math.random().toString(36).substring(7),
            textField: nextTextField,
            splitFields: ["患者姓名", "日期时间"]
          }
        ]
      };
    });
  };

  const removeConfigRow = (fileName: string, rowId: string) => {
    setCsvConfigs(prev => {
      const current = prev[fileName] || [];
      if (current.length <= 1) return prev;
      return {
        ...prev,
        [fileName]: current.filter(r => r.id !== rowId)
      };
    });
  };

  const updateConfigRow = (fileName: string, rowId: string, updates: Partial<{ textField: string; splitFields: string[] }>) => {
    setCsvConfigs(prev => {
      const current = prev[fileName] || [];
      return {
        ...prev,
        [fileName]: current.map(r => r.id === rowId ? { ...r, ...updates } : r)
      };
    });
  };

  const renderCSVTable = () => {
    const filesList: { file: File; subcategory: string; type: 'admission' | 'check' | 'test' }[] = [];
    admissionFiles.forEach(file => filesList.push({ file, subcategory: "住院信息", type: 'admission' }));
    checkFiles.forEach(file => filesList.push({ file, subcategory: "检查信息", type: 'check' }));
    testFiles.forEach(file => filesList.push({ file, subcategory: "检验信息", type: 'test' }));

    if (filesList.length === 0) return null;

    const csvFieldOptions = Array.from(
      new Set(STANDARD_CSV_FIELDS.map(f => f.name))
    ).sort((a, b) => a.localeCompare(b, "zh"));

    return (
      <div className="overflow-x-auto border-2 border-slate-200 rounded-xl shadow-3xs mt-6 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs table-fixed">
          <thead className="bg-slate-50 font-black text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 w-16 text-center border-r border-slate-200">序号</th>
              <th className="px-4 py-3.5 w-60 border-r border-slate-200">子分类名称</th>
              <th className="px-4 py-3.5 w-64 border-r border-slate-200">文件名</th>
              <th className="px-4 py-3.5 w-72 border-r border-slate-200">长文本字段</th>
              <th className="px-4 py-3.5 w-80 border-r border-slate-200">数据标签</th>
              <th className="px-4 py-3.5 w-24 text-center">删除</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filesList.map(({ file, subcategory, type }, fileIdx) => {
              const configs = csvConfigs[file.name] || [
                { id: "default-" + file.name, textField: "主诉", splitFields: ["患者姓名"] }
              ];
              const rowSpan = configs.length;

              return configs.map((config, configIdx) => {
                const isFirstRow = configIdx === 0;

                return (
                  <tr key={`${file.name}-${config.id}`} className={`${isFirstRow && fileIdx > 0 ? "border-t-2 border-slate-200" : ""} hover:bg-slate-50/30`}>
                    {isFirstRow && (
                      <td className="px-4 py-3 text-center align-middle font-bold text-slate-500 bg-slate-50/20 border-r border-slate-200" rowSpan={rowSpan}>
                        {fileIdx + 1}
                      </td>
                    )}
                    {isFirstRow && (
                      <td className="px-4 py-3 align-middle border-r border-slate-200" rowSpan={rowSpan}>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              required
                              value={getSubCategoryName(file.name)}
                              onChange={(e) => updateSubCategoryName(file.name, e.target.value)}
                              className={`p-1.5 px-2 border-2 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${
                                !getSubCategoryName(file.name).trim() ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-200 focus:border-blue-500"
                              }`}
                              placeholder="请输入子分类名称"
                            />
                            <span className="text-red-500 font-bold">*</span>
                          </div>
                          {!getSubCategoryName(file.name).trim() && (
                            <span className="text-[9px] text-red-500 font-semibold">此项为必填项</span>
                          )}
                        </div>
                      </td>
                    )}
                    {isFirstRow && (
                      <td className="px-4 py-3 align-middle border-r border-slate-200" rowSpan={rowSpan}>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 break-all text-xs leading-relaxed">{file.name}</p>
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => addConfigRow(file.name)}
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-[10px] font-black underline cursor-pointer"
                            >
                              <Plus className="w-3 h-3 mr-0.5" /> 增加行
                            </button>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 align-middle border-r border-slate-200">
                      <div className="flex items-center space-x-1.5">
                        <SearchableFieldSelect
                          value={config.textField}
                          onChange={(val) => updateConfigRow(file.name, config.id, { textField: val })}
                          options={csvFieldOptions}
                        />
                        {configs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeConfigRow(file.name, config.id)}
                            className="text-red-500 hover:text-red-700 font-black text-xs px-2 py-1.5 bg-red-50 hover:bg-red-100 rounded transition-colors border border-red-200 shrink-0"
                            title="删除此行配置"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle border-r border-slate-200">
                      <SplitFieldsSelector
                        selected={config.splitFields}
                        onChange={(vals) => updateConfigRow(file.name, config.id, { splitFields: vals })}
                      />
                    </td>
                    {isFirstRow && (
                      <td className="px-4 py-3 text-center align-middle" rowSpan={rowSpan}>
                        <button
                          onClick={() => {
                            if (type === 'admission') {
                              setAdmissionFiles(prev => prev.filter(f => f.name !== file.name));
                              setUploadProgresses(p => ({ ...p, admission: null }));
                            } else if (type === 'check') {
                              setCheckFiles(prev => prev.filter(f => f.name !== file.name));
                              setUploadProgresses(p => ({ ...p, check: null }));
                            } else if (type === 'test') {
                              setTestFiles(prev => prev.filter(f => f.name !== file.name));
                              setUploadProgresses(p => ({ ...p, test: null }));
                            }
                            setCsvConfigs(prev => {
                              const next = { ...prev };
                              delete next[file.name];
                              return next;
                            });
                          }}
                          className="py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-black transition-all cursor-pointer border border-red-100"
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
      </div>
    );
  };

  const renderDicomTable = () => {
    if (dicomFiles.length === 0) return null;

    return (
      <div className="overflow-x-auto border-2 border-slate-200 rounded-xl shadow-3xs mt-6 bg-white max-w-4xl">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs table-fixed">
          <thead className="bg-slate-50 font-black text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 w-16 text-center border-r border-slate-200">序号</th>
              <th className="px-4 py-3.5 w-80 border-r border-slate-200">子分类名称</th>
              <th className="px-4 py-3.5 border-r border-slate-200">文件名</th>
              <th className="px-4 py-3.5 w-24 text-center">删除</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {dicomFiles.map((file, idx) => (
              <tr key={file.name} className="hover:bg-slate-50/30">
                <td className="px-4 py-3 text-center align-middle font-bold text-slate-500 bg-slate-50/20 border-r border-slate-200">
                  {idx + 1}
                </td>
                <td className="px-4 py-3 align-middle border-r border-slate-200">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        required
                        value={getSubCategoryName(file.name)}
                        onChange={(e) => updateSubCategoryName(file.name, e.target.value)}
                        className={`p-1.5 px-2 border-2 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${
                          !getSubCategoryName(file.name).trim() ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-200 focus:border-blue-500"
                        }`}
                        placeholder="请输入子分类名称"
                      />
                      <span className="text-red-500 font-bold">*</span>
                    </div>
                    {!getSubCategoryName(file.name).trim() && (
                      <span className="text-[9px] text-red-500 font-semibold">此项为必填项</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-middle border-r border-slate-200">
                  <p className="font-bold text-slate-900 break-all text-xs leading-relaxed">{file.name}</p>
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <button
                    onClick={() => {
                      setDicomFiles(prev => prev.filter(f => f.name !== file.name));
                      setUploadProgresses(p => ({ ...p, dicom: null }));
                    }}
                    className="py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-black transition-all cursor-pointer border border-red-100"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderImageTable = () => {
    const filesList: { file: File; subcategory: string; type: 'record' | 'order' }[] = [];
    recordFiles.forEach(file => filesList.push({ file, subcategory: "门诊病历", type: 'record' }));
    orderFiles.forEach(file => filesList.push({ file, subcategory: "门诊医嘱", type: 'order' }));

    if (filesList.length === 0) return null;

    return (
      <div className="overflow-x-auto border-2 border-slate-200 rounded-xl shadow-3xs mt-6 bg-white max-w-4xl">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs table-fixed">
          <thead className="bg-slate-50 font-black text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 w-16 text-center border-r border-slate-200">序号</th>
              <th className="px-4 py-3.5 w-80 border-r border-slate-200">子分类名称</th>
              <th className="px-4 py-3.5 border-r border-slate-200">文件名</th>
              <th className="px-4 py-3.5 w-24 text-center">删除</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filesList.map(({ file, subcategory, type }, idx) => (
              <tr key={file.name} className="hover:bg-slate-50/30">
                <td className="px-4 py-3 text-center align-middle font-bold text-slate-500 bg-slate-50/20 border-r border-slate-200">
                  {idx + 1}
                </td>
                <td className="px-4 py-3 align-middle border-r border-slate-200">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        required
                        value={getSubCategoryName(file.name)}
                        onChange={(e) => updateSubCategoryName(file.name, e.target.value)}
                        className={`p-1.5 px-2 border-2 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${
                          !getSubCategoryName(file.name).trim() ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-200 focus:border-blue-500"
                        }`}
                        placeholder="请输入子分类名称"
                      />
                      <span className="text-red-500 font-bold">*</span>
                    </div>
                    {!getSubCategoryName(file.name).trim() && (
                      <span className="text-[9px] text-red-500 font-semibold">此项为必填项</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-middle border-r border-slate-200">
                  <p className="font-bold text-slate-900 break-all text-xs leading-relaxed">{file.name}</p>
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <button
                    onClick={() => {
                      if (type === 'record') {
                        setRecordFiles(prev => prev.filter(f => f.name !== file.name));
                        setUploadProgresses(p => ({ ...p, record: null }));
                      } else if (type === 'order') {
                        setOrderFiles(prev => prev.filter(f => f.name !== file.name));
                        setUploadProgresses(p => ({ ...p, order: null }));
                      }
                    }}
                    className="py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-black transition-all cursor-pointer border border-red-100"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const [uploadProgresses, setUploadProgresses] = useState<{
    admission: number | null;
    check: number | null;
    test: number | null;
    dicom: number | null;
    record: number | null;
    order: number | null;
  }>({
    admission: null,
    check: null,
    test: null,
    dicom: null,
    record: null,
    order: null
  });

  const simulateCategoryUpload = (category: keyof typeof uploadProgresses) => {
    setUploadProgresses(prev => ({ ...prev, [category]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgresses(prev => ({ ...prev, [category]: progress }));
    }, 150);
  };

  const triggerParentUpload = (
    updatedAdmission = admissionFiles,
    updatedCheck = checkFiles,
    updatedTest = testFiles,
    updatedDicom = dicomFiles,
    updatedRecord = recordFiles,
    updatedOrder = orderFiles
  ) => {
    const csvFilesCount = updatedAdmission.length + updatedCheck.length + updatedTest.length;
    const dicomFilesCount = updatedDicom.length;
    const imageFilesCount = updatedRecord.length + updatedOrder.length;

    let csvSummary = null;
    if (csvFilesCount > 0) {
      const firstFile = updatedAdmission[0] || updatedCheck[0] || updatedTest[0];
      csvSummary = {
        name: csvFilesCount > 1 ? `${firstFile.name} 等 ${csvFilesCount} 个结构化文件` : firstFile.name
      };
    }

    let dicomSummary = null;
    if (dicomFilesCount > 0) {
      const firstFile = updatedDicom[0];
      dicomSummary = {
        name: dicomFilesCount > 1 ? `${firstFile.name} 等 ${dicomFilesCount} 个 DICOM 影像序列` : firstFile.name
      };
    }

    let imageSummary = null;
    if (imageFilesCount > 0) {
      const firstFile = updatedRecord[0] || updatedOrder[0];
      imageSummary = {
        name: imageFilesCount > 1 ? `${firstFile.name} 等 ${imageFilesCount} 张临床图片` : firstFile.name
      };
    }

    onStartUpload(csvSummary, dicomSummary, imageSummary);
  };

  // Local state for interactive rule configuration
  const [csvFields, setCsvFields] = useState<FieldConfig[]>([]);
  const [dicomFields, setDicomFields] = useState<DicomConfig[]>([]);

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRawDataVisible, setIsRawDataVisible] = useState(true);
  const [simulatedData, setSimulatedData] = useState<any[] | null>(null);

  // New generalization rule form state per field
  const [newRuleField, setNewRuleField] = useState<string>("");
  const [newRuleKey, setNewRuleKey] = useState<string>("");
  const [newRuleVal, setNewRuleVal] = useState<string>("");

  // Check if all selected categories' upload progress is 100%
  const activeCategories = [
    { files: admissionFiles, progress: uploadProgresses.admission },
    { files: checkFiles, progress: uploadProgresses.check },
    { files: testFiles, progress: uploadProgresses.test },
    { files: dicomFiles, progress: uploadProgresses.dicom },
    { files: recordFiles, progress: uploadProgresses.record },
    { files: orderFiles, progress: uploadProgresses.order }
  ].filter(cat => cat.files.length > 0);

  const showBackBtn = activeCategories.length > 0 && activeCategories.some(cat => cat.progress !== 100);

  // Action execution state
  const [executionState, setExecutionState] = useState<Record<string, { 
    status: 'idle' | 'running' | 'completed'; 
    progress: number; 
    interval?: number;
  }>>({});

  // Prompt / stats dialog states
  const [intervalPromptField, setIntervalPromptField] = useState<{ id: string, name: string, isDicom: boolean } | null>(null);
  const [tempInterval, setTempInterval] = useState<number>(10);
  const [statsViewField, setStatsViewField] = useState<{ id: string, name: string, fieldType: 'text' | 'num', interval?: number, isDicom: boolean } | null>(null);

  // Global settings state
  const [globalOffsetMin, setGlobalOffsetMin] = useState<number>(10);
  const [globalOffsetMax, setGlobalOffsetMax] = useState<number>(14);
  const [globalPseudonymAlgo, setGlobalPseudonymAlgo] = useState<'SM3' | 'SM4' | 'FIXED'>('SM3');
  const [globalPseudonymFixed, setGlobalPseudonymFixed] = useState<string>('ANONYMIZED');

  // 匿名化策略页面是否处于编辑状态（初始化为不可编辑状态，仅显示编辑按钮）
  const [isEditingPolicy, setIsEditingPolicy] = useState<boolean>(false);

  // New customized statistics selection state
  const [statPromptField, setStatPromptField] = useState<{ id: string, name: string, isDicom: boolean } | null>(null);
  const [selectedStatType, setSelectedStatType] = useState<'text' | 'num'>('text');

  // Mapping Config modal states
  const [mappingConfigModal, setMappingConfigModal] = useState<{
    fieldName: string;
    fieldChineseName?: string;
    isDicom: boolean;
    rules: { originalValue: string, generalizedValue: string, type?: 'enum' | 'interval' }[];
  } | null>(null);
  const [mappingType, setMappingType] = useState<'enum' | 'interval'>('enum');
  const [sourceValue, setSourceValue] = useState<string>("");
  const [intervalStart, setIntervalStart] = useState<string>("");
  const [intervalEnd, setIntervalEnd] = useState<string>("");
  const [targetValue, setTargetValue] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Image selections and dynamic medical record states
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number, y: number } | null>(null);
  const [activeSelection, setActiveSelection] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  // 图像数据方式选择：门诊就诊记录默认选中“内容识别”，门诊医嘱默认选中“固定区域”
  const [imageMethodModes, setImageMethodModes] = useState<Record<'record' | 'order', 'content' | 'fixed'>>({
    record: 'content',
    order: 'fixed',
  });

  // 切换方式待确认目标（弹窗提示：“切换后将清空已配置内容，是否确认切换？”）
  const [pendingModeSwitch, setPendingModeSwitch] = useState<{
    tab: 'record' | 'order';
    targetMode: 'content' | 'fixed';
  } | null>(null);

  // 内容识别模式敏感字段配置（时间、医疗卫生机构名称、患者姓名、患者id），默认为是（enabled: true）
  const [recordRecogFields, setRecordRecogFields] = useState<Array<{ id: string; name: string; enabled: boolean; desc: string; sample: string }>>([
    { id: 'time', name: '时间', enabled: true, desc: '就诊及报告时间', sample: '2026-07-18' },
    { id: 'hospital', name: '医疗卫生机构名称', enabled: true, desc: '医疗机构及科室实体', sample: '北京协和医院' },
    { id: 'patient_name', name: '患者姓名', enabled: true, desc: '自然人受试者姓名', sample: '陈志强' },
    { id: 'patient_id', name: '患者id', enabled: true, desc: '门诊流水号/患者ID', sample: 'OP-4491028' },
  ]);

  const [orderRecogFields, setOrderRecogFields] = useState<Array<{ id: string; name: string; enabled: boolean; desc: string; sample: string }>>([
    { id: 'time', name: '时间', enabled: true, desc: '医嘱开具时间', sample: '2026-07-18' },
    { id: 'hospital', name: '医疗卫生机构名称', enabled: true, desc: '医疗机构及开方机构', sample: '北京协和医院' },
    { id: 'patient_name', name: '患者姓名', enabled: true, desc: '自然人受试者姓名', sample: '陈志强' },
    { id: 'patient_id', name: '患者id', enabled: true, desc: '处方流水号/患者ID', sample: 'RX-4491028' },
  ]);

  // 固定区域已框选列表：初始对齐图片1.png预设 (0.2077,0.2690) - (0.6203,0.6916)
  const [confirmedSelections, setConfirmedSelections] = useState<Record<string, Array<{ x: number; y: number; w: number; h: number; normX1?: number; normY1?: number; normX2?: number; normY2?: number }>>>({
    record_0: [
      {
        x: 120,
        y: 172,
        w: 239,
        h: 270,
        normX1: 0.2077,
        normY1: 0.2690,
        normX2: 0.6203,
        normY2: 0.6916
      }
    ]
  });
  const [showImageToast, setShowImageToast] = useState<string | null>(null);

  // 切换脱敏方式请求
  const handleRequestSwitchMode = (tab: 'record' | 'order', targetMode: 'content' | 'fixed') => {
    if (imageMethodModes[tab] === targetMode) return;
    setPendingModeSwitch({ tab, targetMode });
  };

  // 确认切换脱敏方式（清空已配置内容）
  const handleConfirmSwitchMode = () => {
    if (!pendingModeSwitch) return;
    const { tab, targetMode } = pendingModeSwitch;

    // 清空该分类当前图片的已框选区域
    const currentKey = `${tab}_${currentImageIndex}`;
    setConfirmedSelections(prev => ({
      ...prev,
      [currentKey]: []
    }));
    setActiveSelection(null);

    // 重置内容识别字段启停配置（默认为全部“是”）
    if (tab === 'record') {
      setRecordRecogFields(prev => prev.map(f => ({ ...f, enabled: true })));
    } else {
      setOrderRecogFields(prev => prev.map(f => ({ ...f, enabled: true })));
    }

    setImageMethodModes(prev => ({
      ...prev,
      [tab]: targetMode
    }));

    setPendingModeSwitch(null);
    setShowImageToast(`已切换为【${targetMode === 'content' ? '内容识别' : '固定区域'}】并清空已配置内容`);
    setTimeout(() => setShowImageToast(null), 3000);
  };

  // 切换内容识别字段启停状态
  const handleToggleRecogField = (fieldId: string) => {
    if (imageSubTab === 'record') {
      setRecordRecogFields(prev => prev.map(f => f.id === fieldId ? { ...f, enabled: !f.enabled } : f));
    } else {
      setOrderRecogFields(prev => prev.map(f => f.id === fieldId ? { ...f, enabled: !f.enabled } : f));
    }
  };

  // Image Drawing Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setActiveSelection(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!startPos) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!startPos || !currentPos) return;
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(startPos.x - currentPos.x);
    const h = Math.abs(startPos.y - currentPos.y);
    
    // Only accept selections of at least 5x5 pixels to prevent tiny clicks
    if (w > 5 && h > 5) {
      const normX1 = parseFloat((x / 580).toFixed(4));
      const normY1 = parseFloat((y / 640).toFixed(4));
      const normX2 = parseFloat(((x + w) / 580).toFixed(4));
      const normY2 = parseFloat(((y + h) / 640).toFixed(4));
      const newSel = { x, y, w, h, normX1, normY1, normX2, normY2 };
      const currentImageKey = `${imageSubTab}_${currentImageIndex}`;
      setConfirmedSelections(prev => {
        const currentList = prev[currentImageKey] || [];
        return {
          ...prev,
          [currentImageKey]: [...currentList, newSel]
        };
      });
    }
    setStartPos(null);
    setCurrentPos(null);
  };

  const handleClearActiveSelection = () => {
    setActiveSelection(null);
  };

  const handleConfirmActiveSelection = () => {
    if (!activeSelection) return;
    const currentImageKey = `${imageSubTab}_${currentImageIndex}`;
    setConfirmedSelections(prev => {
      const currentList = prev[currentImageKey] || [];
      return {
        ...prev,
        [currentImageKey]: [...currentList, activeSelection]
      };
    });
    setActiveSelection(null);
  };

  const handleClearAllSelectionsForCurrentImage = () => {
    const currentImageKey = `${imageSubTab}_${currentImageIndex}`;
    setConfirmedSelections(prev => {
      const next = { ...prev };
      delete next[currentImageKey];
      return next;
    });
    setShowImageToast("已清除本张图片的所有遮蔽选区");
    setTimeout(() => setShowImageToast(null), 3000);
  };

  const handleRemoveSelectionIdx = (idx: number) => {
    const currentImageKey = `${imageSubTab}_${currentImageIndex}`;
    setConfirmedSelections(prev => {
      const currentList = prev[currentImageKey] || [];
      const updatedList = currentList.filter((_, i) => i !== idx);
      return {
        ...prev,
        [currentImageKey]: updatedList
      };
    });
  };

  // Auto progression of execution timers
  useEffect(() => {
    const runningFields = (Object.values(executionState) as { status: string }[]).filter(s => s && s.status === 'running');
    if (runningFields.length === 0) return;

    const timer = setTimeout(() => {
      setExecutionState(prev => {
        const next = { ...prev };
        let updated = false;
        for (const id of Object.keys(next)) {
          const s = next[id];
          if (s && s.status === 'running') {
            const nextProgress = s.progress + 15;
            if (nextProgress >= 100) {
              next[id] = { ...s, status: 'completed', progress: 100 };
            } else {
              next[id] = { ...s, progress: nextProgress };
            }
            updated = true;
          }
        }
        return updated ? next : prev;
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [executionState]);

  const handleStartExecution = (fieldId: string, fieldName: string, fieldType: 'text' | 'num', isDicom: boolean, intervalVal?: number) => {
    setExecutionState(prev => ({
      ...prev,
      [fieldId]: {
        status: 'running',
        progress: 0,
        interval: intervalVal
      }
    }));
  };

  const handleCancelExecution = (fieldId: string) => {
    setExecutionState(prev => {
      const copy = { ...prev };
      delete copy[fieldId];
      return copy;
    });
  };

  const getFieldStatistics = (fieldId: string, fieldName: string, fieldType: 'text' | 'num', interval: number = 10) => {
    if (fieldType === 'text') {
      if (fieldId === 'gender' || fieldName === 'gender' || fieldName === '性别') {
        return [
          { value: '男', count: 524, pct: 52.4 },
          { value: '女', count: 476, pct: 47.6 },
        ];
      }
      if (fieldId === 'patientId' || fieldName === 'patientId' || fieldName === '患者编号') {
        return [
          { value: 'HASH_A89F...771B', count: 12, pct: 1.2 },
          { value: 'HASH_90B1...2E24', count: 8, pct: 0.8 },
          { value: 'HASH_1F4E...91A2', count: 6, pct: 0.6 },
          { value: '其他唯一识别号', count: 974, pct: 97.4 },
        ];
      }
      if (fieldId === 'name' || fieldName === 'name' || fieldName === '患者姓名' || fieldName === '姓名') {
        return [
          { value: '张*', count: 142, pct: 14.2 },
          { value: '王*', count: 135, pct: 13.5 },
          { value: '李*', count: 128, pct: 12.8 },
          { value: '刘*', count: 94, pct: 9.4 },
          { value: '其他化名/匿名', count: 501, pct: 50.1 },
        ];
      }
      if (fieldName === '图像类型' || fieldId === '(0008,0008)') {
        return [
          { value: 'ORIGINAL\\PRIMARY\\AXIAL', count: 620, pct: 62.0 },
          { value: 'DERIVED\\SECONDARY\\SAGITTAL', count: 280, pct: 28.0 },
          { value: 'ORIGINAL\\PRIMARY\\CORONAL', count: 100, pct: 10.0 },
        ];
      }
      return [
        { value: '分类值 A', count: 450, pct: 45.0 },
        { value: '分类值 B', count: 320, pct: 32.0 },
        { value: '分类值 C', count: 150, pct: 15.0 },
        { value: '其他值', count: 80, pct: 8.0 },
      ];
    } else {
      const groups: { range: string, count: number, pct: number }[] = [];
      const totalCount = 1000;
      const step = interval;
      for (let start = 0; start < 100; start += step) {
        const end = start + step - 1;
        const mid = (start + end) / 2;
        const exponent = -Math.pow(mid - 45, 2) / (2 * Math.pow(20, 2));
        let factor = Math.exp(exponent);
        if (mid > 80) factor = factor * 0.3;
        let count = Math.round(220 * factor * (step / 10));
        if (count < 2) count = 2;
        groups.push({
          range: `${start}-${end}`,
          count,
          pct: parseFloat(((count / totalCount) * 100).toFixed(1))
        });
      }
      return groups.map(g => ({ value: `${g.range} 岁`, count: g.count, pct: g.pct }));
    }
  };

  // Sync state if completed or uploaded
  useEffect(() => {
    if (initialStep) {
      setStep(initialStep);
    } else if (uploadState.isCompleted) {
      setStep(2);
    } else if (uploadState.isUploading) {
      setStep(1);
    }
  }, [uploadState.isCompleted, uploadState.isUploading, initialStep]);

  // Sync categories if changed or completed
  useEffect(() => {
    if (uploadState.isCompleted) {
      if (uploadState.parsedCSVFields && uploadState.parsedCSVFields.length > 0) {
        setCsvFields(uploadState.parsedCSVFields);
      }
      if (uploadState.parsedDICOMFields && uploadState.parsedDICOMFields.length > 0) {
        setDicomFields(uploadState.parsedDICOMFields);
      }
    }
  }, [uploadState.isCompleted, uploadState.parsedCSVFields, uploadState.parsedDICOMFields]);

  const handleManualUpload = () => {
    const csvFilesCount = admissionFiles.length + checkFiles.length + testFiles.length;
    const dicomFilesCount = dicomFiles.length;
    const imageFilesCount = recordFiles.length + orderFiles.length;

    if (csvFilesCount === 0 && dicomFilesCount === 0 && imageFilesCount === 0) {
      alert("请至少选择一个本地分类文件进行上传！");
      return;
    }
    
    let csvSummary = null;
    if (csvFilesCount > 0) {
      const firstFile = admissionFiles[0] || checkFiles[0] || testFiles[0];
      csvSummary = {
        name: csvFilesCount > 1 ? `${firstFile.name} 等 ${csvFilesCount} 个结构化文件` : firstFile.name
      };
    }

    let dicomSummary = null;
    if (dicomFilesCount > 0) {
      const firstFile = dicomFiles[0];
      dicomSummary = {
        name: dicomFilesCount > 1 ? `${firstFile.name} 等 ${dicomFilesCount} 个 DICOM 影像序列` : firstFile.name
      };
    }

    let imageSummary = null;
    if (imageFilesCount > 0) {
      const firstFile = recordFiles[0] || orderFiles[0];
      imageSummary = {
        name: imageFilesCount > 1 ? `${firstFile.name} 等 ${imageFilesCount} 张临床图片` : firstFile.name
      };
    }

    onStartUpload(csvSummary, dicomSummary, imageSummary);
  };

  // Add a generalization rule
  const handleAddGeneralizationRule = (fieldName: string) => {
    if (!newRuleKey.trim() || !newRuleVal.trim()) return;
    
    setCsvFields(prev => prev.map(f => {
      if (f.fieldName === fieldName) {
        const rules = f.generalizationRules ? [...f.generalizationRules] : [];
        if (!rules.some(r => r.originalValue === newRuleKey)) {
          rules.push({ originalValue: newRuleKey, generalizedValue: newRuleVal });
        }
        return { ...f, generalizationRules: rules };
      }
      return f;
    }));
    setNewRuleKey("");
    setNewRuleVal("");
    setNewRuleField("");
  };

  // Remove a generalization rule
  const handleRemoveGeneralizationRule = (fieldName: string, key: string) => {
    setCsvFields(prev => prev.map(f => {
      if (f.fieldName === fieldName) {
        const rules = f.generalizationRules ? f.generalizationRules.filter(r => r.originalValue !== key) : [];
        return { ...f, generalizationRules: rules };
      }
      return f;
    }));
  };

  // Run dynamic simulated pipeline processing
  const handleRunSimulation = () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      const processed = INITIAL_RAW_DATA.map(record => {
        const newRecord = { ...record };

        // We iterate through configured fields to apply anonymization rules
        csvFields.forEach(field => {
          const val = (record as any)[field.fieldName];
          if (val === undefined) return;

          let finalVal = val;

          if (field.tech === "属性删除") {
            finalVal = "[已按技术规范完全删除]";
          } else if (field.tech === "假名化") {
            // Check method
            if (field.pseudonymType === "SM3") {
              finalVal = "SM3_" + Math.abs(hashCode(String(val))).toString(16).substring(0, 8).toUpperCase();
            } else if (field.pseudonymType === "SM4") {
              finalVal = "SM4_CIPHER_" + Math.abs(hashCode(String(val))).toString(36).substring(0, 6).toUpperCase();
            } else if (field.pseudonymType === "FIXED" && field.fixedReplacement) {
              finalVal = field.fixedReplacement;
            } else {
              // Default timestamp/hash
              finalVal = "ID_" + Math.abs(hashCode(String(val) + "salt")).toString(36).substring(0, 8).toUpperCase();
            }
          } else if (field.tech === "泛化") {
            // Apply customized rules if match
            const customRule = field.generalizationRules?.find(r => r.originalValue === String(val));
            if (customRule) {
              finalVal = customRule.generalizedValue;
            } else {
              // Standard defaults
              if (field.fieldName === "age") {
                const ageNum = Number(val);
                if (ageNum >= 80) {
                  finalVal = "≥80 岁 (高位抑制)";
                } else {
                  const low = Math.floor(ageNum / 10) * 10;
                  finalVal = `[${low}-${low + 10}) 岁`;
                }
              } else if (field.fieldName === "occupation") {
                if (String(val).includes("医生") || String(val).includes("教师")) {
                  finalVal = "专业技术人员";
                } else {
                  finalVal = "普通社会从业者";
                }
              } else if (field.fieldName === "zipCode") {
                finalVal = String(val).substring(0, 3) + "***";
              } else {
                finalVal = "已泛化处理";
              }
            }
          } else if (field.tech === "扰动/偏移") {
            if (field.fieldName === "admissionDate") {
              const offsetDays = field.offsetDays !== undefined ? field.offsetDays : -14;
              const d = new Date(String(val));
              d.setDate(d.getDate() + offsetDays);
              finalVal = d.toISOString().split('T')[0] + ` (偏移 ${offsetDays > 0 ? '+' : ''}${offsetDays}天)`;
            } else {
              finalVal = String(val) + " (微调扰动)";
            }
          } else if (field.tech === "扰动(全局)") {
            if (field.fieldName === "admissionDate") {
              const offsetDays = Math.round((globalOffsetMin + globalOffsetMax) / 2);
              const d = new Date(String(val));
              d.setDate(d.getDate() + offsetDays);
              finalVal = d.toISOString().split('T')[0] + ` (全局等距偏移 ${offsetDays > 0 ? '+' : ''}${offsetDays}天)`;
            } else {
              finalVal = String(val) + " (全局等距微调)";
            }
          } else if (field.tech === "假名化(全局)") {
            if (globalPseudonymAlgo === "SM3") {
              finalVal = "SM3_GLB_" + Math.abs(hashCode(String(val))).toString(16).substring(0, 8).toUpperCase();
            } else if (globalPseudonymAlgo === "SM4") {
              finalVal = "SM4_GLB_CIPHER_" + Math.abs(hashCode(String(val))).toString(36).substring(0, 6).toUpperCase();
            } else if (globalPseudonymAlgo === "FIXED" && globalPseudonymFixed) {
              finalVal = globalPseudonymFixed;
            } else {
              finalVal = "GLB_" + Math.abs(hashCode(String(val) + "salt")).toString(36).substring(0, 8).toUpperCase();
            }
          }

          (newRecord as any)[field.fieldName] = finalVal;
        });

        // Simple phone mask override if phone is not already deleted
        if (csvFields.some(f => f.fieldName === "phone" && f.tech === "原文")) {
          // Do nothing
        } else if (!csvFields.some(f => f.fieldName === "phone")) {
          newRecord.phone = record.phone.substring(0, 3) + "****" + record.phone.substring(7);
        }

        return newRecord;
      });

      // Update uploadState on App.tsx with the current configured fields to make changes persistent
      onUpdateUploadState({
        parsedCSVFields: csvFields,
        parsedDICOMFields: dicomFields,
        isConfigCompleted: true
      });

      setSimulatedData(processed);
      setIsSimulating(false);
      setStep(3);
    }, 1200);
  };

  // Helper hashCode
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  // Download simulation csv
  const handleExportCSV = () => {
    if (!simulatedData) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "患者身份证号(去标),患者姓名(伪名),联系电话,就诊年龄,性别,就诊日期(偏移),职业归类,常住地邮编,临床诊断(敏感)\n";
    
    simulatedData.forEach(row => {
      const line = `"${row.patientId}","${row.name}","${row.phone}","${row.age}","${row.gender}","${row.admissionDate}","${row.occupation}","${row.zipCode}","${row.diagnosis}"`;
      csvContent += line + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `去标识化临床数据集_仿真结果_${project.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderParamColumn = (field: any, isDicom: boolean) => {
    const setFields = isDicom ? setDicomFields : setCsvFields;
    const keyProp = isDicom ? 'tag' : 'fieldName';
    const keyValue = isDicom ? field.tag : field.fieldName;

    if (field.tech === "保留原值" || field.tech === "最小化删除" || !field.tech) {
      return <span className="text-xs font-bold text-slate-400">-</span>;
    }

    if (field.tech === "属性删除") {
      const deleteType = field.deleteType || "null";
      const deleteFixedValue = field.deleteFixedValue !== undefined ? field.deleteFixedValue : "";

      if (!isEditingPolicy) {
        return (
          <span className="text-xs font-bold text-slate-800">
            {deleteType === "fixed" ? (deleteFixedValue ? `替换固定值：${deleteFixedValue}` : '替换固定值') : '置空'}
          </span>
        );
      }

      return (
        <div className="space-y-1.5 py-1">
          <div className="flex items-center space-x-3 text-xs font-bold text-slate-600">
            <label className="flex items-center space-x-1 cursor-pointer">
              <input 
                type="radio" 
                name={`delete-type-${keyValue}`}
                checked={deleteType === "null"}
                onChange={() => {
                  setFields((prev: any[]) => prev.map(f => f[keyProp] === keyValue ? { ...f, deleteType: "null" } : f));
                }}
                className="accent-blue-600"
              />
              <span>置空</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input 
                type="radio" 
                name={`delete-type-${keyValue}`}
                checked={deleteType === "fixed"}
                onChange={() => {
                  setFields((prev: any[]) => prev.map(f => f[keyProp] === keyValue ? { ...f, deleteType: "fixed" } : f));
                }}
                className="accent-blue-600"
              />
              <span>替换固定值</span>
            </label>
          </div>
          {deleteType === "fixed" && (
            <input 
              type="text"
              value={deleteFixedValue}
              onChange={(e) => {
                const v = e.target.value;
                setFields((prev: any[]) => prev.map(f => f[keyProp] === keyValue ? { ...f, deleteFixedValue: v } : f));
              }}
              className="w-full p-1 border border-slate-300 rounded text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-600"
              placeholder="请输入"
            />
          )}
        </div>
      );
    }

    if (field.tech === "泛化") {
      const ruleCount = field.generalizationRules?.length || 0;
      return (
        <div className="bg-slate-50 p-2 border border-slate-200 rounded text-xs flex items-center justify-between text-slate-600 font-bold">
          <span>已配置 {ruleCount} 个映射</span>
          <button 
            type="button"
            onClick={() => {
              const existingRules = field.generalizationRules || [];
              const firstRuleType = existingRules[0]?.type || "enum";
              setMappingType(firstRuleType);
              let initialRules = existingRules.filter((r: any) => (r.type || 'enum') === firstRuleType);
              if (initialRules.length === 0) {
                if (firstRuleType === "enum") {
                  initialRules = [{ type: "enum", originalValue: "", generalizedValue: "" }];
                } else {
                  initialRules = [{ type: "interval", originalValue: "-", generalizedValue: "" }];
                }
              }
              setMappingConfigModal({
                fieldName: keyValue,
                fieldChineseName: field.fieldChineseName || field.name || keyValue,
                isDicom: isDicom,
                rules: initialRules
              });
            }}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-0.5 font-bold cursor-pointer border-0 bg-transparent text-xs"
          >
            <span>{isEditingPolicy ? "映射配置" : "查看"}</span>
          </button>
        </div>
      );
    }

    if (field.tech === "假名化") {
      const pseudonymType = field.pseudonymType || "SM3";

      if (!isEditingPolicy) {
        return (
          <span className="text-xs font-bold text-slate-800">
            {pseudonymType === "UID_CONSISTENT" ? "uid一致性替换" : "不可逆加密"}
          </span>
        );
      }

      return (
        <div className="space-y-1.5 py-1">
          <div className="flex items-center space-x-3 text-xs font-bold text-slate-600">
            <label className="flex items-center space-x-1 cursor-pointer">
              <input 
                type="radio" 
                name={`pseudo-type-${keyValue}`}
                checked={pseudonymType === "SM3"}
                onChange={() => {
                  setFields((prev: any[]) => prev.map(f => f[keyProp] === keyValue ? { ...f, pseudonymType: "SM3" } : f));
                }}
                className="accent-blue-600"
              />
              <span>不可逆加密</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input 
                type="radio" 
                name={`pseudo-type-${keyValue}`}
                checked={pseudonymType === "UID_CONSISTENT"}
                onChange={() => {
                  setFields((prev: any[]) => prev.map(f => f[keyProp] === keyValue ? { ...f, pseudonymType: "UID_CONSISTENT" } : f));
                }}
                className="accent-blue-600"
              />
              <span>uid一致性替换</span>
            </label>
          </div>
        </div>
      );
    }

    if (field.tech === "假名化(全局)") {
      return (
        <span className="text-xs text-slate-600 font-bold leading-relaxed block">
          本项目下同一个患者的多模态数据遵循同一不可逆加密规则
        </span>
      );
    }

    if (field.tech === "扰动(全局)") {
      return (
        <span className="text-xs text-slate-600 font-bold leading-relaxed block">
          本项目下同一个患者的多模态数据遵循同一规则，请在上方统一设置扰动参数
        </span>
      );
    }

    return <span className="text-xs font-bold text-slate-400">-</span>;
  };

  const isUploadActive = step === 1;
  const currentTitle = isUploadActive ? "数据源配置" : "匿名化策略";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="anonymization_processing_container">
      
      {/* Upper Navigation Header with Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b-2 border-slate-200 pb-6 gap-4" id="processing_header">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded text-slate-600 border-2 border-slate-200 hover:border-slate-400 transition-all cursor-pointer"
            title="返回项目列表"
            id="processing_back_btn"
          >
            <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>项目管理</span>
              <ChevronRight className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{project.name}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600">{currentTitle}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{currentTitle}</h1>
          </div>
        </div>

        {/* Unified Top Right Buttons */}
        {step === 1 && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
            {isEditingUpload ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300 transition-all active:scale-98 cursor-pointer flex items-center justify-center"
                  id="btn_upload_cancel_edit"
                >
                  <span>取消</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded shadow-xs transition-all active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer"
                  id="btn_upload_save_edit"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>保存</span>
                </button>
              </>
            ) : (
              <>
                {/* 正在扫描状态 */}
                {isValidating && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-2xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                      <span>扫描进度 {validateProgress}%</span>
                      <div className="w-16 bg-blue-200 h-1.5 rounded-full overflow-hidden ml-1">
                        <div 
                          className="bg-blue-600 h-full transition-all duration-150 rounded-full" 
                          style={{ width: `${validateProgress}%` }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelValidation}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded border border-rose-200 transition-all active:scale-98 cursor-pointer flex items-center justify-center space-x-1"
                      id="btn_cancel_validation"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>取消扫描</span>
                    </button>
                  </div>
                )}

                {/* 扫描完成状态 */}
                {!isValidating && validationDone && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowSaveFailModal(true)}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded border border-emerald-300 transition-all active:scale-98 cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs"
                      id="btn_scan_completed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>扫描已完成</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded shadow-xs transition-all active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer"
                      id="btn_start_edit_upload"
                    >
                      <Pencil className="w-3.5 h-3.5 text-white" />
                      <span>编辑</span>
                    </button>
                  </div>
                )}

                {/* 默认未扫描状态 */}
                {!isValidating && !validationDone && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleStartValidation}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded border border-indigo-200 transition-all active:scale-98 cursor-pointer flex items-center justify-center space-x-1.5"
                      id="btn_validate_fields"
                    >
                      <Scan className="w-3.5 h-3.5 text-indigo-600" />
                      <span>数据扫描</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded shadow-xs transition-all active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer"
                      id="btn_start_edit_upload"
                    >
                      <Pencil className="w-3.5 h-3.5 text-white" />
                      <span>编辑</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex items-center gap-3 shrink-0">
            {!isEditingPolicy ? (
              <button
                type="button"
                onClick={() => setIsEditingPolicy(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded shadow-xs transition-all active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer"
                id="btn_edit_policy"
              >
                <Pencil className="w-3.5 h-3.5 text-white" />
                <span>编辑</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditingPolicy(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300 transition-all active:scale-98 cursor-pointer flex items-center justify-center"
                  id="btn_cancel_policy"
                >
                  <span>取消</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPolicy(false);
                    if (onSaveSuccess) onSaveSuccess();
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded shadow-xs transition-all active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer"
                  id="btn_save_policy"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>保存</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ==================== STEP 1: IMPORT AND UPLOAD DATA ==================== */}
      {step === 1 && (
        <div className="space-y-6" id="processing_step1_container">

          {/* Upload selectors and boxes organized by category */}
          <div className="space-y-8 max-w-5xl mx-auto" id="categorized_uploads_wrapper">
              
              {/* Category 1: CSV Text Data */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm flex items-center">
                      CSV文本数据
                      <span className="text-rose-500 ml-1 font-bold" title="必填">*</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">仅支持 CSV 格式，仅支持单sheet</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 住院信息 */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                        <span>住院信息</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">CSV</span>
                      </h4>
                    </div>
                    <div className="mt-4">
                      <DirectoryFileTreeSelect
                        id="admission_csv_select"
                        mode="csv"
                        disabled={!isEditingUpload}
                        value={admissionSelect}
                        onChange={(val) => setAdmissionSelect(val)}
                      />
                    </div>
                  </div>

                  {/* 检查信息 */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                        <span>检查信息</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">CSV</span>
                      </h4>
                    </div>
                    <div className="mt-4">
                      <DirectoryFileTreeSelect
                        id="check_csv_select"
                        mode="csv"
                        disabled={!isEditingUpload}
                        value={checkSelect}
                        onChange={(val) => setCheckSelect(val)}
                      />
                    </div>
                  </div>

                  {/* 检验信息 */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                        <span>检验信息</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">CSV</span>
                      </h4>
                    </div>
                    <div className="mt-4">
                      <DirectoryFileTreeSelect
                        id="test_csv_select"
                        mode="csv"
                        disabled={!isEditingUpload}
                        value={testSelect}
                        onChange={(val) => setTestSelect(val)}
                      />
                    </div>
                  </div>
                </div>


              </div>

              {/* Category 2: DICOM Image Data */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <FileCode className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm flex items-center">
                      DICOM影像数据
                      <span className="text-rose-500 ml-1 font-bold" title="必填">*</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">仅支持DICOM格式</p>
                  </div>
                </div>

                <div className="mt-4 max-w-md">
                  <DirectoryFileTreeSelect
                    id="dicom_select"
                    mode="dicom"
                    disabled={!isEditingUpload}
                    value={dicomSelect}
                    onChange={(val) => setDicomSelect(val)}
                  />
                </div>
              </div>

              {/* Category 3: Images */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm flex items-center">
                      图片数据
                      <span className="text-rose-500 ml-1 font-bold" title="必填">*</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">支持PNG/JPG/JPEG/BMP格式</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 门诊就诊记录 */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                        <span>门诊就诊记录</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">IMG</span>
                      </h4>
                    </div>
                    <div className="mt-4">
                      <DirectoryFileTreeSelect
                        id="record_image_select"
                        mode="image"
                        disabled={!isEditingUpload}
                        value={recordSelect}
                        onChange={(val) => setRecordSelect(val)}
                      />
                    </div>
                  </div>

                  {/* 门诊医嘱 */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                        <span>门诊医嘱</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">IMG</span>
                      </h4>
                    </div>
                    <div className="mt-4">
                      <DirectoryFileTreeSelect
                        id="order_image_select"
                        mode="image"
                        disabled={!isEditingUpload}
                        value={orderSelect}
                        onChange={(val) => setOrderSelect(val)}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Simulated logging console during background uploads */}
            {uploadState.isUploading && (
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-left text-[10px] text-slate-400 mt-6 max-w-4xl mx-auto max-h-[140px] overflow-y-auto border border-slate-950 shadow-md">
                <p className="text-blue-400 font-bold">[11:04:12] [SYSTEM_NODE] 初始化安全传输连接 SSL_TLS_v1.3 ...</p>
                {uploadState.CSVFileName && <p className="text-slate-300">[11:04:13] [CSV_PARSER] 吞吐结构化文件: {uploadState.CSVFileName} (校验通过)</p>}
                {uploadState.dicomFileName && <p className="text-slate-300">[11:04:14] [DICOM_IO] 读取影像 Tag 元数据序列: {uploadState.dicomFileName}</p>}
                
                {/* Dynamically changing based on percentage */}
                {Math.max(uploadState.CSVProgress || 0, uploadState.dicomProgress || 0) < 50 ? (
                  <p className="text-slate-400 animate-pulse">[11:04:15] [AUDIT] 正在对数据字段进行 GB/T 37964 安全特征谱匹配扫描...</p>
                ) : Math.max(uploadState.CSVProgress || 0, uploadState.dicomProgress || 0) < 99 ? (
                  <>
                    <p className="text-emerald-400 font-semibold">[11:04:16] [COMPLIANCE] 已检测到姓名、年龄、就诊日期、邮编等 9 项高风险准标识符。</p>
                    <p className="text-slate-400 animate-pulse">[11:04:17] [PIPELINE] 正在构建首选脱敏清洗候选参数树...</p>
                  </>
                ) : (
                  <p className="text-emerald-400 font-black">[11:04:18] [SUCCESS] 物理级联校验核查圆满通过！正在为您重定向至规则方案配置大厅。</p>
                )}
              </div>
            )}

            {/* Bottom action buttons moved to the top-right header */}

            {/* Save failure / Scan result comparison modal matching image 1.png */}
            {showSaveFailModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200" id="scan_result_modal">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden animate-in zoom-in-95 duration-200 text-left">
                  
                  {/* Header */}
                  <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Scan className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">数据扫描结果</h3>
                        <p className="text-xs text-blue-600 font-bold tracking-tight">字段差异对比</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowSaveFailModal(false)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-0 cursor-pointer"
                      title="关闭"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
                    {/* Sec 1: CSV文本数据 */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="w-1.5 h-4 bg-emerald-600 rounded-full inline-block" />
                        <h4 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight">CSV文本数据</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: 实际数据中未出现的字段 */}
                        <div className="rounded-xl border border-amber-200/90 bg-white overflow-hidden shadow-2xs">
                          <div className="bg-amber-50/70 border-b border-amber-100/90 px-4 py-2.5 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3.5 h-3.5 rounded-full border border-amber-500 text-amber-600 flex items-center justify-center text-[9px] font-black shrink-0">
                                !
                              </div>
                              <span className="text-xs font-bold text-slate-800">实际数据中未出现的字段</span>
                            </div>
                            <span className="text-xs font-bold text-amber-800 bg-white border border-amber-200/80 px-2.5 py-0.5 rounded-full shadow-3xs">
                              11 项
                            </span>
                          </div>
                          <div className="max-h-48 overflow-y-auto p-4 space-y-2.5 text-xs font-bold text-slate-800">
                            <div>就诊号</div>
                            <div>病历名称</div>
                            <div>长文本测试字段</div>
                            <div>主诉</div>
                            <div>现病史</div>
                            <div>既往史</div>
                            <div>婚育史</div>
                            <div>个人史</div>
                            <div>家族史</div>
                            <div>体格检查</div>
                            <div>初步诊断</div>
                          </div>
                        </div>

                        {/* Right: 方案中未添加字段 (出现文件数) */}
                        <div className="rounded-xl border border-rose-200/90 bg-white overflow-hidden shadow-2xs">
                          <div className="bg-rose-50/70 border-b border-rose-100/90 px-4 py-2.5 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-rose-500 font-bold text-xs shrink-0 leading-none">✕</span>
                              <span className="text-xs font-bold text-slate-800">方案中未添加字段 (出现文件数)</span>
                            </div>
                            <span className="text-xs font-bold text-rose-800 bg-white border border-rose-200/80 px-2.5 py-0.5 rounded-full shadow-3xs">
                              5 项
                            </span>
                          </div>
                          <div className="max-h-48 overflow-y-auto p-4 space-y-2.5 text-xs font-bold text-slate-800">
                            <div>id<span className="text-rose-600 font-black ml-0.5">(1)</span></div>
                            <div>x100<span className="text-rose-600 font-black ml-0.5">(1)</span></div>
                            <div>x101<span className="text-rose-600 font-black ml-0.5">(1)</span></div>
                            <div>x102<span className="text-rose-600 font-black ml-0.5">(1)</span></div>
                            <div>name<span className="text-rose-600 font-black ml-0.5">(1)</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sec 2: DICOM影像数据 · 000001 */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block" />
                        <h4 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight">DICOM影像数据 &middot; 000001</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: 实际数据中未出现的字段 */}
                        <div className="rounded-xl border border-amber-200/90 bg-white overflow-hidden shadow-2xs">
                          <div className="bg-amber-50/70 border-b border-amber-100/90 px-4 py-2.5 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3.5 h-3.5 rounded-full border border-amber-500 text-amber-600 flex items-center justify-center text-[9px] font-black shrink-0">
                                !
                              </div>
                              <span className="text-xs font-bold text-slate-800">实际数据中未出现的字段</span>
                            </div>
                            <span className="text-xs font-bold text-amber-800 bg-white border border-amber-200/80 px-2.5 py-0.5 rounded-full shadow-3xs">
                              163 项
                            </span>
                          </div>
                          <div className="max-h-48 overflow-y-auto p-4 space-y-2.5 text-xs font-bold text-slate-800">
                            <div>Focal Spot(s)</div>
                            <div>[Cell spacing]</div>
                            <div>[SFOV Type]</div>
                            <div>Patient Birth Name</div>
                            <div>Other Patient IDs</div>
                            <div>Other Patient Names</div>
                            <div>Medical Record Locator</div>
                            <div>Pregnancy Status</div>
                            <div>Special Needs</div>
                            <div>Patient State</div>
                            <div>Admission ID</div>
                            <div>Issuer of Admission ID</div>
                            <div>Scheduled Study Location</div>
                            <div>Scheduled Study Location Patient Transport Arrangement</div>
                            <div>Reason for Study</div>
                            <div>Requesting Physician</div>
                            <div>Referring Physician's Name</div>
                            <div>Physicians of Record</div>
                            <div>Operators' Name</div>
                            <div>Study Description</div>
                            <div>Series Description</div>
                          </div>
                        </div>

                        {/* Right: 方案中未添加字段 (出现文件数) */}
                        <div className="rounded-xl border border-rose-200/90 bg-white overflow-hidden shadow-2xs">
                          <div className="bg-rose-50/70 border-b border-rose-100/90 px-4 py-2.5 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-rose-500 font-bold text-xs shrink-0 leading-none">✕</span>
                              <span className="text-xs font-bold text-slate-800">方案中未添加字段 (出现文件数)</span>
                            </div>
                            <span className="text-xs font-bold text-rose-800 bg-white border border-rose-200/80 px-2.5 py-0.5 rounded-full shadow-3xs">
                              8 项
                            </span>
                          </div>
                          <div className="max-h-48 overflow-y-auto p-4 space-y-2.5 text-xs font-bold text-slate-800">
                            <div>Source Application Entity Title<span className="text-rose-600 font-black ml-0.5">(4000)</span></div>
                            <div>Secondary Capture Device ID<span className="text-rose-600 font-black ml-0.5">(4000)</span></div>
                            <div>Date of Secondary Capture<span className="text-rose-600 font-black ml-0.5">(4000)</span></div>
                            <div>Time of Secondary Capture<span className="text-rose-600 font-black ml-0.5">(4000)</span></div>
                            <div>Secondary Capture Device Manufacturer<span className="text-rose-600 font-black ml-0.5">(4000)</span></div>
                            <div>Secondary Capture Device Manufacturer's Model Name<span className="text-rose-600 font-black ml-0.5">(4000)</span></div>
                            <div>Secondary Capture Device Software Versions<span className="text-rose-600 font-black ml-0.5">(4000)</span></div>
                            <div>Digital Image Format Code<span className="text-rose-600 font-black ml-0.5">(4000)</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer / Actions */}
                  <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end space-x-4">
                    <button
                      id="modal_close_btn"
                      type="button"
                      onClick={() => setShowSaveFailModal(false)}
                      className="px-6 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg border border-slate-300 transition-colors shadow-3xs cursor-pointer"
                    >
                      关闭
                    </button>
                    <button
                      id="modal_sync_diff_fields_btn"
                      type="button"
                      onClick={() => {
                        setShowSaveFailModal(false);
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>确认并同步差异字段</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

        </div>
      )}


      {/* ==================== STEP 2: RULE CONFIGURATION TABLE ==================== */}
      {step === 2 && (
        <div className="space-y-6" id="processing_step2_container">
          
          {/* 页面最上方增加“扰动(全局)”参数配置模块（带必填标识*） */}
          <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl shadow-3xs space-y-3 animate-fade-in" id="global_perturbation_config_panel">
            <div className="flex items-center space-x-1.5">
              <span className="text-red-500 font-bold text-base">*</span>
              <h3 className="font-black text-slate-900 text-sm">扰动(全局)参数配置</h3>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs font-semibold">
              <p className="text-slate-500 leading-relaxed max-w-2xl">
                请指定扰动范围区间，不同患者将会在区间内随机选择数值进行扰动，同一患者的多模态数据遵循同一扰动参数：
              </p>
              <div className="flex flex-wrap items-center gap-4 text-slate-700 shrink-0 font-bold">
                <div className="flex items-center space-x-2">
                  <span>偏移天数最小值：</span>
                  {isEditingPolicy ? (
                    <input 
                      type="number"
                      step="1"
                      value={globalOffsetMin}
                      onChange={(e) => setGlobalOffsetMin(parseInt(e.target.value) || 0)}
                      className="w-20 border border-slate-300 bg-white p-1 rounded font-black text-center text-slate-800 focus:border-blue-500 focus:outline-none text-xs"
                    />
                  ) : (
                    <span className="font-black text-slate-900 px-1">{globalOffsetMin}</span>
                  )}
                  <span>天</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>偏移天数最大值：</span>
                  {isEditingPolicy ? (
                    <input 
                      type="number"
                      step="1"
                      value={globalOffsetMax}
                      onChange={(e) => setGlobalOffsetMax(parseInt(e.target.value) || 0)}
                      className="w-20 border border-slate-300 bg-white p-1 rounded font-black text-center text-slate-800 focus:border-blue-500 focus:outline-none text-xs"
                    />
                  ) : (
                    <span className="font-black text-slate-900 px-1">{globalOffsetMax}</span>
                  )}
                  <span>天</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section banner */}
          {/* Tab selectors */}
          <div className="flex border-b-2 border-slate-200" id="step2_tabs">
            {csvFields.length > 0 && (
              <button
                onClick={() => setActiveTab('csv')}
                className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-b-4 transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === 'csv' ? 'border-blue-600 text-blue-600 bg-blue-50/20' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4.5 h-4.5" />
                <span>CSV文本数据</span>
              </button>
            )}

            {dicomFields.length > 0 && (
              <button
                onClick={() => setActiveTab('dicom')}
                className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-b-4 transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === 'dicom' ? 'border-blue-600 text-blue-600 bg-blue-50/20' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileCode className="w-4.5 h-4.5" />
                <span>DICOM影像数据</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('image')}
              className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-b-4 transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'image' ? 'border-blue-600 text-blue-600 bg-blue-50/20' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4.5 h-4.5 text-indigo-500" />
              <span>图片数据</span>
            </button>
          </div>

          {/* TAB CONTENT A: CSV STRUCTURED TEXT */}
          {activeTab === 'csv' && csvFields.length > 0 && (
            <div className="space-y-4" id="csv_config_block">
              {/* Secondary category selectors */}
              <div className="flex space-x-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 self-start inline-flex">
                <button
                  onClick={() => setCsvSubTab('admission')}
                  className={`px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    csvSubTab === 'admission' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  住院信息
                </button>
                <button
                  onClick={() => setCsvSubTab('check')}
                  className={`px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    csvSubTab === 'check' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  检查信息
                </button>
                <button
                  onClick={() => setCsvSubTab('test')}
                  className={`px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    csvSubTab === 'test' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  检验信息
                </button>
              </div>

              <div className="bg-white rounded-xl border-2 border-slate-200 shadow-3xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 w-44">数据字段</th>
                        {csvSubTab === 'admission' && (
                          <th className="py-3 px-4 w-44">数据标签</th>
                        )}
                        <th className="py-3 px-4 w-36">数据属性</th>
                        <th className="py-3 px-4 w-48">匿名化技术</th>
                        <th className="py-3 px-4 w-72">参数 <span className="text-red-500 font-bold">*</span></th>
                        <th className="py-3 px-4 w-40">说明</th>
                        <th className="py-3 px-4 w-28 text-center">是否纳入K值计算</th>
                        <th className="py-3 px-4 w-40 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-800 bg-white">
                      {csvFields
                        .filter(field => {
                          if (csvSubTab === 'admission') {
                            return !field.category || field.category === 'admission';
                          }
                          return field.category === csvSubTab;
                        })
                        .map((field, idx) => {
                          const isAdmission = csvSubTab === 'admission';
                          let shouldRenderFieldCell = true;
                          let fieldCellRowSpan = 1;
                          let fieldCellText = field.fieldChineseName;

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
                            <tr key={field.fieldName} className="hover:bg-slate-50/50 transition-colors">
                              
                              {/* 1. Chinese Name (Read Only) */}
                              {shouldRenderFieldCell && (
                                <td className="py-3 px-4 text-slate-900 font-bold" rowSpan={fieldCellRowSpan}>
                                  <span className="block text-slate-900">{fieldCellText}</span>
                                </td>
                              )}

                              {/* 1.5. Split Field (Read Only) */}
                              {isAdmission && (
                                <td className="py-3 px-4 text-slate-900 font-bold border-l border-slate-100">
                                  <span className="block text-slate-900">{field.splitField || <span className="text-slate-400 font-normal">-</span>}</span>
                                </td>
                              )}

                              {/* 2. Attribute Type (Read Only) */}
                              <td className="py-3 px-4 text-slate-700">
                                <span className="text-xs font-bold text-slate-600">{field.attributeType}</span>
                              </td>

                        {/* 4. Anonymization Technology */}
                        <td className="py-3 px-4 text-slate-800">
                          {isEditingPolicy ? (
                            <select
                              value={field.tech}
                              onChange={(e) => {
                                const v = e.target.value as any;
                                setCsvFields(prev => prev.map(f => {
                                  if (f.fieldName === field.fieldName) {
                                    const newTech = v;
                                    const computeK = (f.attributeType === "准标识符" && newTech === "泛化") ? true : false;
                                    let updated = { ...f, tech: newTech, computeK };
                                    if (newTech === "属性删除") {
                                      updated.deleteType = "null";
                                    } else if (newTech === "假名化") {
                                      updated.pseudonymType = "SM3";
                                    }
                                    return updated;
                                  }
                                  return f;
                                }));
                              }}
                              className="w-full text-xs font-black p-1 bg-slate-100 border border-slate-300 rounded focus:bg-white focus:outline-none text-blue-800"
                            >
                              <option value="保留原值">保留原值</option>
                              <option value="属性删除">属性删除</option>
                              <option value="最小化删除">最小化删除</option>
                              <option value="泛化">泛化</option>
                              <option value="扰动(全局)">扰动(全局)</option>
                              <option value="假名化">假名化</option>
                              <option value="假名化(全局)">假名化(全局)</option>
                            </select>
                          ) : (
                            <span className="text-xs font-bold text-slate-800">{field.tech || "保留原值"}</span>
                          )}
                        </td>

                        {/* 4.5. Parameters */}
                        <td className="py-3 px-4 text-slate-800">
                          {renderParamColumn(field, false)}
                        </td>

                        {/* 5. Description (Remarks) */}
                        <td className="py-3 px-4 text-slate-600 text-xs relative group">
                          <div className="line-clamp-2">
                            {field.description || "暂无说明"}
                          </div>
                          <div className="hidden group-hover:block absolute left-4 bottom-full mb-1 z-50 bg-slate-900/95 backdrop-blur-xs text-white text-xs p-2.5 rounded-xl shadow-xl max-w-xs leading-relaxed break-all font-medium border border-slate-700/50">
                            {field.description || "暂无说明"}
                          </div>
                        </td>

                        {/* 6. computeK (Included in K-Anonymity Calculation) */}
                        <td className="py-3 px-4 text-center">
                          {!isEditingPolicy ? (
                            (field.computeK === true || field.computeK === "是") ? (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-black">是</span>
                            ) : (
                              <span className="text-slate-500 text-xs font-bold">否</span>
                            )
                          ) : (field.attributeType === "准标识符" && field.tech === "泛化") ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-black">是</span>
                          ) : (
                            <select
                              value={(field.computeK === true || field.computeK === "是") ? "YES" : "NO"}
                              onChange={(e) => {
                                const v = e.target.value === "YES";
                                setCsvFields(prev => prev.map(f => f.fieldName === field.fieldName ? { ...f, computeK: v } : f));
                              }}
                              className={`text-xs font-black p-1 border rounded focus:outline-none ${
                                (field.computeK === true || field.computeK === "是") ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                            >
                              <option value="YES">是</option>
                              <option value="NO">否</option>
                            </select>
                          )}
                        </td>

                        {/* 7. Action Column */}
                        <td className="py-3 px-4 text-center">
                          {((field.attributeType === "准标识符" || field.attr === "准标识符") && (field.computeK === true || field.computeK === "是")) ? (
                            <div className="flex flex-col items-center justify-center space-y-1.5">
                              {/* Idle state */}
                              {(!executionState[field.fieldName || ""] || executionState[field.fieldName || ""].status === 'idle') && (
                                <button
                                  onClick={() => {
                                    setStatPromptField({
                                      id: field.fieldName || "",
                                      name: field.fieldChineseName || field.name,
                                      isDicom: false
                                    });
                                  }}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] rounded flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-white" />
                                  <span>执行统计</span>
                                </button>
                              )}

                              {/* Running state */}
                              {executionState[field.fieldName || ""]?.status === 'running' && (
                                <div className="flex flex-col items-center space-y-1 w-full max-w-[120px]">
                                  <div className="flex items-center justify-between text-[10px] font-black text-slate-500 w-full px-0.5">
                                    <span className="flex items-center space-x-1 animate-pulse text-blue-600">
                                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                      <span>执行中</span>
                                    </span>
                                    <span>{executionState[field.fieldName || ""].progress}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                                      style={{ width: `${executionState[field.fieldName || ""].progress}%` }}
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleCancelExecution(field.fieldName || "")}
                                    className="text-[10px] text-red-500 hover:text-red-700 font-bold transition-colors cursor-pointer"
                                  >
                                    取消
                                  </button>
                                </div>
                              )}

                              {/* Completed state */}
                              {executionState[field.fieldName || ""]?.status === 'completed' && (
                                <button
                                  onClick={() => {
                                    setStatsViewField({
                                      id: field.fieldName || "",
                                      name: field.fieldChineseName || field.name,
                                      fieldType: executionState[field.fieldName || ""].interval ? 'num' : 'text',
                                      interval: executionState[field.fieldName || ""].interval,
                                      isDicom: false
                                    });
                                  }}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <BarChart2 className="w-3 h-3" />
                                  <span>统计结果</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal italic">-</span>
                          )}
                        </td>

                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}


          {/* TAB CONTENT B: DICOM TAGS CONFIG */}
          {activeTab === 'dicom' && dicomFields.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-slate-200 shadow-3xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 w-32">TAG</th>
                      <th className="py-3 px-4 w-44">数据字段</th>
                      <th className="py-3 px-4 w-36">数据属性</th>
                      <th className="py-3 px-4 w-48">匿名化技术</th>
                      <th className="py-3 px-4 w-72">参数 <span className="text-red-500 font-bold">*</span></th>
                      <th className="py-3 px-4 w-40">说明</th>
                      <th className="py-3 px-4 w-28 text-center">是否纳入K值计算</th>
                      <th className="py-3 px-4 w-40 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-800 bg-white">
                    {dicomFields.map((field) => (
                      <tr key={field.tag} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* 1. Tag Code */}
                        <td className="py-3 px-4 font-mono text-blue-600 font-bold text-[11px]">
                          {field.tag}
                        </td>

                        {/* 2. Tag Name */}
                        <td className="py-3 px-4 text-slate-900 font-bold">
                          <span className="block text-slate-900">{field.name}</span>
                        </td>

                        {/* 3. Attribute Type (Read Only) */}
                        <td className="py-3 px-4 text-slate-700 font-bold">
                          {field.attributeType || field.attr || "敏感属性"}
                        </td>

                        {/* 4. Anonymization Technology */}
                        <td className="py-3 px-4 text-slate-800">
                          {isEditingPolicy ? (
                            <select
                              value={field.tech}
                              onChange={(e) => {
                                const v = e.target.value as any;
                                setDicomFields(prev => prev.map(f => {
                                  if (f.tag === field.tag) {
                                    const newTech = v;
                                    const computeK = (f.attributeType === "准标识符" && newTech === "泛化") ? "是" : "否";
                                    let updated = { ...f, tech: newTech, computeK };
                                    if (newTech === "属性删除") {
                                      updated.deleteType = "null";
                                    } else if (newTech === "假名化") {
                                      updated.pseudonymType = "SM3";
                                    }
                                    return updated;
                                  }
                                  return f;
                                }));
                              }}
                              className="w-full text-xs font-black p-1 bg-slate-100 border border-slate-300 rounded focus:bg-white focus:outline-none text-blue-800"
                            >
                              <option value="保留原值">保留原值</option>
                              <option value="属性删除">属性删除</option>
                              <option value="最小化删除">最小化删除</option>
                              <option value="泛化">泛化</option>
                              <option value="扰动(全局)">扰动(全局)</option>
                              <option value="假名化">假名化</option>
                              <option value="假名化(全局)">假名化(全局)</option>
                            </select>
                          ) : (
                            <span className="text-xs font-bold text-slate-800">{field.tech || "保留原值"}</span>
                          )}
                        </td>

                        {/* 4.5. Parameters */}
                        <td className="py-3 px-4 text-slate-800">
                          {renderParamColumn(field, true)}
                        </td>

                        {/* 5. Description Note (Read Only) */}
                        <td className="py-3 px-4 text-slate-600 text-xs relative group">
                          <div className="line-clamp-2">
                            {field.note || field.description || "暂无说明"}
                          </div>
                          <div className="hidden group-hover:block absolute left-4 bottom-full mb-1 z-50 bg-slate-900/95 backdrop-blur-xs text-white text-xs p-2.5 rounded-xl shadow-xl max-w-xs leading-relaxed break-all font-medium border border-slate-700/50">
                            {field.note || field.description || "暂无说明"}
                          </div>
                        </td>

                        {/* 6. computeK (Included in K-Anonymity Calculation) */}
                        <td className="py-3 px-4 text-center">
                          {!isEditingPolicy ? (
                            (field.computeK === true || field.computeK === "是") ? (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-black">是</span>
                            ) : (
                              <span className="text-slate-500 text-xs font-bold">否</span>
                            )
                          ) : (field.attributeType === "准标识符" && field.tech === "泛化") ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-black">是</span>
                          ) : (
                            <select
                              value={(field.computeK === true || field.computeK === "是") ? "YES" : "NO"}
                              onChange={(e) => {
                                const v = e.target.value === "YES" ? "是" : "否";
                                setDicomFields(prev => prev.map(f => f.tag === field.tag ? { ...f, computeK: v } : f));
                              }}
                              className={`text-xs font-black p-1 border rounded focus:outline-none ${
                                (field.computeK === true || field.computeK === "是") ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                            >
                              <option value="YES">是</option>
                              <option value="NO">否</option>
                            </select>
                          )}
                        </td>

                        {/* 7. Action Column */}
                        <td className="py-3 px-4 text-center">
                          {((field.attributeType === "准标识符") && (field.computeK === true || field.computeK === "是")) ? (
                            <div className="flex flex-col items-center justify-center space-y-1.5">
                              {/* Idle state */}
                              {(!executionState[field.tag] || executionState[field.tag].status === 'idle') && (
                                <button
                                  onClick={() => {
                                    setStatPromptField({
                                      id: field.tag,
                                      name: field.fieldChineseName || field.name,
                                      isDicom: true
                                    });
                                  }}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] rounded flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-white" />
                                  <span>执行统计</span>
                                </button>
                              )}

                              {/* Running state */}
                              {executionState[field.tag]?.status === 'running' && (
                                <div className="flex flex-col items-center space-y-1 w-full max-w-[120px]">
                                  <div className="flex items-center justify-between text-[10px] font-black text-slate-500 w-full px-0.5">
                                    <span className="flex items-center space-x-1 animate-pulse text-blue-600">
                                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                      <span>执行中</span>
                                    </span>
                                    <span>{executionState[field.tag].progress}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                                      style={{ width: `${executionState[field.tag].progress}%` }}
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleCancelExecution(field.tag)}
                                    className="text-[10px] text-red-500 hover:text-red-700 font-bold transition-colors cursor-pointer"
                                  >
                                    取消
                                  </button>
                                </div>
                              )}

                              {/* Completed state */}
                              {executionState[field.tag]?.status === 'completed' && (
                                <button
                                  onClick={() => {
                                    setStatsViewField({
                                      id: field.tag,
                                      name: field.fieldChineseName || field.name,
                                      fieldType: executionState[field.tag].interval ? 'num' : 'text',
                                      interval: executionState[field.tag].interval,
                                      isDicom: true
                                    });
                                  }}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <BarChart2 className="w-3 h-3" />
                                  <span>统计结果</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal italic">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT C: IMAGE DATA CONFIG */}
          {activeTab === 'image' && (() => {
            const currentMockup = (imageSubTab === 'record' ? RECORD_MOCKUPS[currentImageIndex] : ORDER_MOCKUPS[currentImageIndex]) as any;
            const currentImageKey = `${imageSubTab}_${currentImageIndex}`;
            const currentSelections = confirmedSelections[currentImageKey] || [];
            const currentMode = imageMethodModes[imageSubTab];
            const currentRecogFields = imageSubTab === 'record' ? recordRecogFields : orderRecogFields;
            return (
              <div className="space-y-4" id="image_config_block">
                {/* Secondary category selectors */}
                <div className="flex space-x-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 self-start inline-flex">
                  <button
                    type="button"
                    onClick={() => {
                      setImageSubTab('record');
                      setCurrentImageIndex(0);
                      setActiveSelection(null);
                    }}
                    className={`px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      imageSubTab === 'record' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-950 bg-white'
                    }`}
                  >
                    门诊就诊记录
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageSubTab('order');
                      setCurrentImageIndex(0);
                      setActiveSelection(null);
                    }}
                    className={`px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      imageSubTab === 'order' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-950 bg-white'
                    }`}
                  >
                    门诊医嘱
                  </button>
                </div>

                {/* 增加“内容识别“和“固定区域”两种方式，通过单选按钮组样式进行展示与切换 */}
                <div className="flex flex-wrap items-center gap-6 bg-white p-3 rounded-xl border border-slate-200 shadow-3xs">
                  <span className="text-xs font-bold text-slate-700 shrink-0 ml-1">方式选择：</span>
                  {isEditingPolicy ? (
                    <div className="flex items-center space-x-6">
                      <label 
                        onClick={(e) => {
                          e.preventDefault();
                          handleRequestSwitchMode(imageSubTab, 'content');
                        }}
                        className="flex items-center space-x-2 cursor-pointer select-none group"
                      >
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          currentMode === 'content'
                            ? 'border-blue-600 bg-white'
                            : 'border-slate-400 bg-white group-hover:border-slate-500'
                        }`}>
                          {currentMode === 'content' && (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </span>
                        <span className={`text-xs font-semibold ${
                          currentMode === 'content' ? 'text-blue-600 font-bold' : 'text-slate-700'
                        }`}>
                          内容识别
                        </span>
                      </label>

                      <label 
                        onClick={(e) => {
                          e.preventDefault();
                          handleRequestSwitchMode(imageSubTab, 'fixed');
                        }}
                        className="flex items-center space-x-2 cursor-pointer select-none group"
                      >
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          currentMode === 'fixed'
                            ? 'border-blue-600 bg-white'
                            : 'border-slate-400 bg-white group-hover:border-slate-500'
                        }`}>
                          {currentMode === 'fixed' && (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </span>
                        <span className={`text-xs font-semibold ${
                          currentMode === 'fixed' ? 'text-blue-600 font-bold' : 'text-slate-700'
                        }`}>
                          固定区域
                        </span>
                      </label>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      {currentMode === 'content' ? '内容识别' : '固定区域'}
                    </span>
                  )}
                </div>

                {/* Toast notification overlay inside workspace */}
                {showImageToast && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-800 rounded-xl p-3 text-[11px] font-black flex items-center space-x-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{showImageToast}</span>
                  </div>
                )}

                {/* Two Column Layout: Left (Image / Canvas) + Right (Coordinates / Field Toggles) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                  {/* LEFT COLUMN */}
                  <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
                    {currentMode === 'fixed' ? (
                      /* 2. 固定区域：左侧显示现有页面内容 */
                      <div className="w-full flex flex-col items-center">

                        {/* Paper Container (Drawing Canvas) */}
                        <div 
                          className={`relative bg-white border border-slate-300 shadow-lg rounded-xl select-none w-full max-w-[580px] min-h-[640px] p-8 text-slate-800 flex flex-col justify-between overflow-hidden transition-all hover:border-slate-400 hover:shadow-xl ${
                            isEditingPolicy ? 'cursor-crosshair' : 'cursor-default'
                          }`}
                          onMouseDown={isEditingPolicy ? handleMouseDown : undefined}
                          onMouseMove={isEditingPolicy ? handleMouseMove : undefined}
                          onMouseUp={isEditingPolicy ? handleMouseUp : undefined}
                          id="medical_image_drawing_canvas"
                        >
                          {/* Watermark grid background */}
                          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

                          {/* Electronic Patient Document Sheet */}
                          <div className="space-y-4 pointer-events-none relative z-5">
                            {/* Header */}
                            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                              <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase">{currentMockup.hospital}</h4>
                              <h2 className="text-xl font-black text-slate-900 tracking-widest mt-1 uppercase">{currentMockup.title}</h2>
                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 font-mono">Clinical Patient EHR Template</div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-3 gap-3 text-[11px] border border-slate-300 p-3 rounded-lg bg-slate-50/70 mb-4 font-bold">
                              <div><span className="text-slate-400">患者姓名:</span> <span className="text-slate-900">{currentMockup.name}</span></div>
                              <div><span className="text-slate-400">患者性别:</span> <span className="text-slate-900">{currentMockup.gender}</span></div>
                              <div><span className="text-slate-400">患者年龄:</span> <span className="text-slate-900">{currentMockup.age}</span></div>
                              <div><span className="text-slate-400">流水号:</span> <span className="text-slate-900 font-mono text-[10px]">{currentMockup.id}</span></div>
                              <div><span className="text-slate-400">报告日期:</span> <span className="text-slate-900 font-mono text-[10px]">{currentMockup.date}</span></div>
                              <div><span className="text-slate-400">就诊科室:</span> <span className="text-slate-900">{currentMockup.dept}</span></div>
                            </div>

                            {/* Content Details */}
                            {imageSubTab === 'record' ? (
                              <div className="space-y-4 text-xs">
                                {currentMockup.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="space-y-1">
                                    <h5 className="font-black text-slate-900 border-l-4 border-blue-600 pl-2 text-[11px] uppercase tracking-wide">{item.label}</h5>
                                    <p className="text-slate-600 leading-relaxed pl-3 font-semibold text-justify text-[11px]">{item.value}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-4 text-xs">
                                <h5 className="font-black text-slate-900 border-l-4 border-emerald-600 pl-2 text-[11px] uppercase tracking-wide">处方医嘱项目明细</h5>
                                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                                  <table className="w-full text-left border-collapse text-[11px]">
                                    <thead>
                                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black">
                                        <th className="p-2.5 w-2/3">药品/诊疗项目名称</th>
                                        <th className="p-2.5 w-1/3">规格/用药指导</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {currentMockup.orders?.map((ord: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                          <td className="p-2.5 font-bold text-slate-800">{ord.name}</td>
                                          <td className="p-2.5">
                                            <span className="block font-bold text-slate-900">{ord.spec}</span>
                                            <span className="block text-[9px] text-slate-400 font-bold mt-0.5">{ord.usage}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="flex justify-end font-black text-xs text-slate-900 pr-2">
                                  <span>医嘱预估费用: <span className="text-red-600 font-mono text-sm ml-1">{currentMockup.totalPrice}</span></span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="border-t border-slate-200 pt-3 mt-6 flex items-center justify-between text-[11px] pointer-events-none relative z-5">
                            <div className="flex items-center space-x-6">
                              <div>
                                <span className="text-slate-400 font-bold">主审责任人:</span>
                                <span className="ml-1.5 font-black text-slate-800 underline decoration-slate-300 decoration-2">{currentMockup.doctor || currentMockup.pharmacist}</span>
                              </div>
                              <div className="relative w-14 h-14 rounded-full border-2 border-red-500/35 flex items-center justify-center text-red-500/35 text-[9px] font-black uppercase rotate-12 select-none pointer-events-none">
                                <span className="text-center leading-3">核签专用<br/>电子印章</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <div className="h-6 w-24 bg-slate-900 flex items-center space-x-0.5 px-1 py-0.5">
                                <div className="h-full w-0.5 bg-white"></div>
                                <div className="h-full w-1 bg-white"></div>
                                <div className="h-full w-0.5 bg-white"></div>
                                <div className="h-full w-1.5 bg-white"></div>
                                <div className="h-full w-0.5 bg-white"></div>
                                <div className="h-full w-2 bg-white"></div>
                                <div className="h-full w-0.5 bg-white"></div>
                                <div className="h-full w-1 bg-white"></div>
                              </div>
                              <span className="font-mono text-[8px] text-slate-400 mt-0.5 font-bold">SN-{currentMockup.id}</span>
                            </div>
                          </div>

                          {/* INTERACTIVE DRAWING OVERLAYS */}
                          {startPos && currentPos && (
                            <div 
                              className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none z-20 shadow-xs"
                              style={{
                                left: `${Math.min(startPos.x, currentPos.x)}px`,
                                top: `${Math.min(startPos.y, currentPos.y)}px`,
                                width: `${Math.abs(startPos.x - currentPos.x)}px`,
                                height: `${Math.abs(startPos.y - currentPos.y)}px`,
                              }}
                            />
                          )}

                          {activeSelection && (
                            <div 
                              className="absolute border-2 border-blue-600 bg-blue-500/20 z-20 flex items-center justify-center shadow-md animate-pulse"
                              style={{
                                left: `${activeSelection.x}px`,
                                top: `${activeSelection.y}px`,
                                width: `${activeSelection.w}px`,
                                height: `${activeSelection.h}px`,
                              }}
                            >
                              <div className="bg-blue-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-sm scale-90 whitespace-nowrap">
                                选区中 (待确认)
                              </div>
                            </div>
                          )}

                          {currentSelections.map((sel, idx) => (
                            <div 
                              key={idx}
                              className="absolute bg-slate-950 flex items-center justify-center z-10 shadow-xs border border-slate-800 animate-scale-up pointer-events-auto"
                              style={{
                                left: `${sel.x}px`,
                                top: `${sel.y}px`,
                                width: `${sel.w}px`,
                                height: `${sel.h}px`,
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              onMouseMove={(e) => e.stopPropagation()}
                              onMouseUp={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800/40 text-[9px] text-slate-300 font-black">
                                <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                <span>已框选</span>
                                {isEditingPolicy && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveSelectionIdx(idx);
                                    }}
                                    className="ml-1.5 p-0.5 bg-red-600 hover:bg-red-700 hover:scale-105 rounded text-white transition-all cursor-pointer border-0 flex items-center justify-center shrink-0"
                                    title="删除此选中区域"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* 1. 内容识别：仅展示原始图片即可 */
                      <div className="w-full flex flex-col items-center">
                        {/* Sample Image Container */}
                        <div 
                          className="relative bg-white border border-slate-300 shadow-lg rounded-xl select-none w-full max-w-[580px] min-h-[640px] p-8 text-slate-800 flex flex-col justify-between overflow-hidden"
                          id="medical_sample_data_image"
                        >
                          {/* Watermark grid background */}
                          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

                          {/* Electronic Patient Document Sheet */}
                          <div className="space-y-4 relative z-5">
                            {/* Header */}
                            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                              <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase">{currentMockup.hospital}</h4>
                              <h2 className="text-xl font-black text-slate-900 tracking-widest mt-1 uppercase">{currentMockup.title}</h2>
                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 font-mono">Clinical Patient EHR Template</div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-3 gap-3 text-[11px] border border-slate-300 p-3 rounded-lg bg-slate-50/70 mb-4 font-bold">
                              <div><span className="text-slate-400">患者姓名:</span> <span className="text-slate-900">{currentMockup.name}</span></div>
                              <div><span className="text-slate-400">患者性别:</span> <span className="text-slate-900">{currentMockup.gender}</span></div>
                              <div><span className="text-slate-400">患者年龄:</span> <span className="text-slate-900">{currentMockup.age}</span></div>
                              <div><span className="text-slate-400">流水号:</span> <span className="text-slate-900 font-mono text-[10px]">{currentMockup.id}</span></div>
                              <div><span className="text-slate-400">报告日期:</span> <span className="text-slate-900 font-mono text-[10px]">{currentMockup.date}</span></div>
                              <div><span className="text-slate-400">就诊科室:</span> <span className="text-slate-900">{currentMockup.dept}</span></div>
                            </div>

                            {/* Content Details */}
                            {imageSubTab === 'record' ? (
                              <div className="space-y-4 text-xs">
                                {currentMockup.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="space-y-1">
                                    <h5 className="font-black text-slate-900 border-l-4 border-blue-600 pl-2 text-[11px] uppercase tracking-wide">{item.label}</h5>
                                    <p className="text-slate-600 leading-relaxed pl-3 font-semibold text-justify text-[11px]">{item.value}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-4 text-xs">
                                <h5 className="font-black text-slate-900 border-l-4 border-emerald-600 pl-2 text-[11px] uppercase tracking-wide">处方医嘱项目明细</h5>
                                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                                  <table className="w-full text-left border-collapse text-[11px]">
                                    <thead>
                                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black">
                                        <th className="p-2.5 w-2/3">药品/诊疗项目名称</th>
                                        <th className="p-2.5 w-1/3">规格/用药指导</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {currentMockup.orders?.map((ord: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                          <td className="p-2.5 font-bold text-slate-800">{ord.name}</td>
                                          <td className="p-2.5">
                                            <span className="block font-bold text-slate-900">{ord.spec}</span>
                                            <span className="block text-[9px] text-slate-400 font-bold mt-0.5">{ord.usage}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="flex justify-end font-black text-xs text-slate-900 pr-2">
                                  <span>医嘱预估费用: <span className="text-red-600 font-mono text-sm ml-1">{currentMockup.totalPrice}</span></span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="border-t border-slate-200 pt-3 mt-6 flex items-center justify-between text-[11px] relative z-5">
                            <div className="flex items-center space-x-6">
                              <div>
                                <span className="text-slate-400 font-bold">主审责任人:</span>
                                <span className="ml-1.5 font-black text-slate-800 underline decoration-slate-300 decoration-2">{currentMockup.doctor || currentMockup.pharmacist}</span>
                              </div>
                              <div className="relative w-14 h-14 rounded-full border-2 border-red-500/35 flex items-center justify-center text-red-500/35 text-[9px] font-black uppercase rotate-12 select-none">
                                <span className="text-center leading-3">核签专用<br/>电子印章</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <div className="h-6 w-24 bg-slate-900 flex items-center space-x-0.5 px-1 py-0.5">
                                <div className="h-full w-0.5 bg-white"></div>
                                <div className="h-full w-1 bg-white"></div>
                                <div className="h-full w-0.5 bg-white"></div>
                                <div className="h-full w-1.5 bg-white"></div>
                                <div className="h-full w-0.5 bg-white"></div>
                                <div className="h-full w-2 bg-white"></div>
                                <div className="h-full w-0.5 bg-white"></div>
                                <div className="h-full w-1 bg-white"></div>
                              </div>
                              <span className="font-mono text-[8px] text-slate-400 mt-0.5 font-bold">SN-{currentMockup.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs sticky top-4">
                    {currentMode === 'fixed' ? (
                      /* 2. 固定区域：右侧显示已框选区域，并列出已框选区域坐标，支持删除（与图片1中内容样式一致） */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <h4 className="text-sm font-bold text-slate-900">已框选区域</h4>
                          <span className="text-xs text-slate-400 font-medium">共 {currentSelections.length} 个区域</span>
                        </div>

                        {currentSelections.length === 0 ? (
                          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                            <Scan className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                            <p className="text-xs font-bold text-slate-600">暂无已框选区域</p>
                            <p className="text-[11px] text-slate-400 mt-1">可在左侧图片上拖拽鼠标绘制矩形遮蔽选区</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                            {currentSelections.map((sel, idx) => {
                              const x1 = (sel.normX1 !== undefined ? sel.normX1 : sel.x / 580).toFixed(4);
                              const y1 = (sel.normY1 !== undefined ? sel.normY1 : sel.y / 640).toFixed(4);
                              const x2 = (sel.normX2 !== undefined ? sel.normX2 : (sel.x + sel.w) / 580).toFixed(4);
                              const y2 = (sel.normY2 !== undefined ? sel.normY2 : (sel.y + sel.h) / 640).toFixed(4);

                              return (
                                <div
                                  key={idx}
                                  className="bg-slate-50/80 border border-slate-200 rounded-lg px-3.5 py-2.5 flex items-center justify-between hover:border-slate-300 transition-colors shadow-3xs"
                                >
                                  <span className="font-mono text-xs font-semibold text-slate-800 select-all">
                                    区域 {idx + 1}: ({x1},{y1}) - ({x2},{y2})
                                  </span>
                                  {isEditingPolicy && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSelectionIdx(idx)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer border-0 flex items-center justify-center shrink-0"
                                      title="删除该区域"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* 1. 内容识别：右侧显示字段名称（时间、医院名称、患者姓名、患者id）、对应显示启停按钮 */
                      <div className="space-y-4">
                        <div className="pb-2 border-b border-slate-100">
                          <h4 className="text-sm font-bold text-slate-900">图片数据标签启停配置</h4>
                          <p className="text-xs text-slate-500 mt-0.5">匿名化任务将识别启用的图片数据标签并进行处理</p>
                        </div>

                        <div className="space-y-2.5">
                          {currentRecogFields.map((field) => (
                            <div
                              key={field.id}
                              className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-300 transition-all shadow-3xs"
                            >
                              <div className="flex items-center">
                                <span className="text-xs font-bold text-slate-900">{field.name}</span>
                              </div>

                              {/* 启停按钮 */}
                              <div className="flex items-center shrink-0">
                                <button
                                  type="button"
                                  disabled={!isEditingPolicy}
                                  onClick={() => isEditingPolicy && handleToggleRecogField(field.id)}
                                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 border-0 ${
                                    field.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                                  } ${isEditingPolicy ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
                                  title={isEditingPolicy ? `点击切换启停：当前为 ${field.enabled ? '开启' : '关闭'}` : `当前状态：${field.enabled ? '开启' : '关闭'} (不可编辑)`}
                                >
                                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 切换脱敏方式二次确认弹窗：提示“切换后将清空已配置内容，是否确认切换？” */}
                {pendingModeSwitch && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up text-left">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-slate-900">切换配置方式确认</h3>
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            切换后将清空已配置内容，是否确认切换？
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setPendingModeSwitch(null)}
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmSwitchMode}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          确认切换
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Stepper buttons */}
          <div className="flex justify-end items-center bg-slate-50 border-t border-slate-200 p-4 rounded-xl">
            <div className="flex items-center space-x-2.5">
            </div>
          </div>

        </div>
      )}


      {/* ==================== STEP 3: SIMULATION RESULT TABLE ==================== */}
      {step === 3 && simulatedData && (
        <div className="space-y-6" id="processing_step3_container">
          
          {/* Security Compliance Audit Header */}
          <div className="bg-emerald-600 border border-emerald-700 text-white rounded-xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-black text-xs uppercase tracking-wider text-white">去标识化物理管道仿真运行成功</h3>
                    <span className="text-[10px] bg-emerald-800 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wide">
                      合规达标
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100 font-semibold mt-1 leading-relaxed">
                    依据您定制的脱敏算子链，系统已动态重组并生成了高保真临床仿真数据包，并在院内自研审计套件中通过了 k-Anonymity 的数学反比推演校验。
                  </p>
                </div>
              </div>

              {/* Download CSV button */}
              <button
                onClick={handleExportCSV}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-950 font-black text-xs uppercase tracking-wider rounded shadow-md transition-all active:scale-98 flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>导出脱敏 CSV 临床数据集</span>
              </button>
            </div>
          </div>

          {/* Professional Compliance Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="compliance_scores_shelf">
            
            <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-3xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-black text-sm">
                K=5
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-black tracking-wider">k-匿名性水位</span>
                <span className="text-slate-900 font-black text-sm block">已完全对齐 (K=5)</span>
                <span className="text-[9px] text-emerald-600 font-semibold block">重标识几率 &lt; 0.01%</span>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-3xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-black text-sm">
                L=3
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-black tracking-wider">L-多样性系数</span>
                <span className="text-slate-900 font-black text-sm block">临床诊断分布达标</span>
                <span className="text-[9px] text-emerald-600 font-semibold block">抗同质性拼图攻击成功</span>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-3xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-black text-sm animate-pulse">
                92.4%
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-black tracking-wider">科研数据可用度</span>
                <span className="text-slate-900 font-black text-sm block">高保真时序链条</span>
                <span className="text-[9px] text-blue-600 font-semibold block">保留随访绝对时跨</span>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-3xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-black tracking-wider">安全流转策略</span>
                <span className="text-slate-900 font-black text-sm block">GB/T 37964 合规</span>
                <span className="text-[9px] text-emerald-600 font-semibold block">通过脱敏模型安全审查</span>
              </div>
            </div>

          </div>

          {/* Dual tables preview: original vs processed */}
          <div className="space-y-6">
            
            {/* Table A: Original */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-3xs overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">患者原始明文病例数据集 (5条采样核查)</span>
                </div>

                <button
                  onClick={() => setIsRawDataVisible(!isRawDataVisible)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 font-bold cursor-pointer"
                >
                  {isRawDataVisible ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>隐藏敏感标识</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>展示原始明文</span>
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold border-b border-slate-950 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 font-mono">患者唯一身份证号 (PatientID)</th>
                      <th className="py-3 px-4">患者姓名 (Name)</th>
                      <th className="py-3 px-4 font-mono">联系电话 (Phone)</th>
                      <th className="py-3 px-4">年龄</th>
                      <th className="py-3 px-4">性别</th>
                      <th className="py-3 px-4">入院随访日期</th>
                      <th className="py-3 px-4">患者职业 background</th>
                      <th className="py-3 px-4">常住地邮编</th>
                      <th className="py-3 px-4 text-amber-400">临床诊断及病变程度 (敏感属性)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-bold text-slate-700 bg-white">
                    {INITIAL_RAW_DATA.map((r, i) => (
                      <tr key={`${r.patientId}-${i}`} className="hover:bg-slate-50/50 transition-all">
                        <td className="py-2.5 px-4 font-mono text-slate-800">
                          {isRawDataVisible ? r.patientId : "1101***********1029"}
                        </td>
                        <td className="py-2.5 px-4 text-slate-950">{isRawDataVisible ? r.name : "张*"}</td>
                        <td className="py-2.5 px-4 font-mono">{isRawDataVisible ? r.phone : "138****3041"}</td>
                        <td className="py-2.5 px-4">{r.age} 岁</td>
                        <td className="py-2.5 px-4 text-slate-500">{r.gender}</td>
                        <td className="py-2.5 px-4 font-mono">{r.admissionDate}</td>
                        <td className="py-2.5 px-4 text-slate-600">{r.occupation}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{r.zipCode}</td>
                        <td className="py-2.5 px-4 text-slate-900">{r.diagnosis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table B: Processed */}
            <div className="bg-white border-2 border-emerald-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-emerald-50/50 border-b border-emerald-100 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>去标识化清洗仿真合规结果集 (清洗流沙箱采样)</span>
                    <span className="text-[10px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
                      高保真
                    </span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">患者唯一身份证号 (PatientID)</th>
                      <th className="py-3 px-4">患者姓名 (Name)</th>
                      <th className="py-3 px-4">联系电话 (Phone)</th>
                      <th className="py-3 px-4">年龄</th>
                      <th className="py-3 px-4">性别</th>
                      <th className="py-3 px-4">入院随访日期</th>
                      <th className="py-3 px-4">患者职业 background</th>
                      <th className="py-3 px-4">常住地邮编</th>
                      <th className="py-3 px-4 text-emerald-700">临床诊断及病变程度 (敏感属性)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-bold text-slate-800 bg-white">
                    {simulatedData.map((r, i) => (
                      <tr key={`${r.patientId}-${i}`} className="hover:bg-emerald-50/10 transition-all bg-emerald-50/5">
                        <td className="py-2.5 px-4 font-mono text-blue-700">{r.patientId}</td>
                        <td className="py-2.5 px-4 text-emerald-800 bg-emerald-50/10">{r.name}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{r.phone}</td>
                        <td className="py-2.5 px-4 text-amber-800">{r.age}</td>
                        <td className="py-2.5 px-4 text-slate-500">{r.gender}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{r.admissionDate}</td>
                        <td className="py-2.5 px-4 text-slate-600">{r.occupation}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{r.zipCode}</td>
                        <td className="py-2.5 px-4 text-slate-900">{r.diagnosis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* DICOM logs block if DICOM was uploaded */}
          {uploadState.parsedDICOMFields && uploadState.parsedDICOMFields.length > 0 && (
            <div className="bg-slate-900 rounded-xl border border-slate-950 p-5 shadow-sm text-slate-400 text-xs">
              <div className="flex items-center space-x-2 text-white font-black uppercase tracking-wider mb-3 pb-2 border-b border-slate-800">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span>DICOM 影像序列 Headers 清洗审计流水账 (安全校验通过)</span>
              </div>
              
              <div className="font-mono text-[10px] space-y-1.5 max-h-[160px] overflow-y-auto pl-1">
                <p className="text-blue-400 font-bold">[11:05:40] [DICOM_MODULE] 启动影像三维矩阵级联匿名化管道程序 ...</p>
                {dicomFields.map((f, i) => {
                  if (f.tech === "原文") {
                    return <p key={`${f.tag}-${i}`} className="text-slate-500">[11:05:41] [RETAIN] Tag {f.tag} ({f.name}) -&gt; 保留明文原文 (科研必要)</p>;
                  }
                  if (f.tech === "假名化") {
                    return <p key={`${f.tag}-${i}`} className="text-emerald-400">[11:05:42] [MASK] Tag {f.tag} ({f.name}) -&gt; 成功重设为假名/哈希标记: “ANONYMIZED” / “000000.00”</p>;
                  }
                  if (f.tech === "扰动/偏移") {
                    const csvOffset = csvFields.find(c => c.fieldName === "admissionDate")?.offsetDays || -14;
                    return <p key={`${f.tag}-${i}`} className="text-amber-400">[11:05:43] [PERTURB] Tag {f.tag} ({f.name}) -&gt; 成功执行对齐等距日期时间偏移: {csvOffset} 天</p>;
                  }
                  return null;
                })}
                <p className="text-emerald-400 font-black">[11:05:44] [DICOM_IO] 31项影像特征 Tags 清洗及像素烧录遮罩合成完全就绪！MD5 一致性哈希校验通过。</p>
              </div>
            </div>
          )}

          {/* Stepper buttons */}
          <div className="flex justify-between items-center bg-slate-50 border-t border-slate-200 p-4 rounded-xl">
            <button
              onClick={() => {
                setStep(2);
              }}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
            >
              &larr; 返回上一步 (修改算法规则)
            </button>

            <button
              onClick={onBack}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded shadow-md transition-all active:scale-98 cursor-pointer"
            >
              完成并重置项目面板
            </button>
          </div>

        </div>
      )}

      {/* Statistics Type Selector Prompt Modal */}
      {statPromptField && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center space-x-2 text-slate-800 font-black text-sm">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              <span>选择统计方式 - {statPromptField.name}</span>
            </div>

            <div className="space-y-3">
              {/* Option A: Enumeration Statistics */}
              <label className="flex items-start p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="statType"
                  checked={selectedStatType === 'text'}
                  onChange={() => setSelectedStatType('text')}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div className="space-y-0.5">
                  <span className="block text-xs font-black text-slate-800">枚举统计</span>
                  <span className="block text-[10px] text-slate-400 font-bold">对该字段中所有值出现的次数执行统计</span>
                </div>
              </label>

              {/* Option B: Interval Statistics */}
              <label className="flex items-start p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="statType"
                  checked={selectedStatType === 'num'}
                  onChange={() => setSelectedStatType('num')}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div className="space-y-0.5">
                  <span className="block text-xs font-black text-slate-800">区间统计</span>
                  <span className="block text-[10px] text-slate-400 font-bold">适用于数值型字段，指定一个统计间隔，从0开始对取值区间执行合并桶统计</span>
                </div>
              </label>
            </div>

            {/* Conditionally show interval value input */}
            {selectedStatType === 'num' && (
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5 animate-scale-up">
                <label className="block text-[10px] font-black text-blue-800 uppercase">统计间隔</label>
                <input 
                  type="number" 
                  value={tempInterval} 
                  onChange={(e) => setTempInterval(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs font-black p-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  placeholder="例如：5 或 10"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 text-xs pt-2">
              <button 
                onClick={() => {
                  setStatPromptField(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg cursor-pointer transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  const fieldId = statPromptField.id;
                  const intervalVal = selectedStatType === 'num' ? tempInterval : undefined;
                  
                  handleStartExecution(fieldId, statPromptField.name, selectedStatType, statPromptField.isDicom, intervalVal);
                  setStatPromptField(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg cursor-pointer transition-colors border-0"
              >
                开始统计
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Numerical Interval Prompt Modal */}
      {intervalPromptField && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center space-x-2 text-slate-800 font-black text-sm">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              <span>输入统计间隔 - {intervalPromptField.name}</span>
            </div>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              对数值型字段（{intervalPromptField.name}）进行区间分桶统计，请输入您的数值区间间隔（步长）：
            </p>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-1">统计间隔</label>
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
                onClick={() => {
                  setIntervalPromptField(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg cursor-pointer transition-colors"
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

      {/* Dynamic Statistics Distribution Result Modal */}
      {statsViewField && (() => {
        const statsData = getFieldStatistics(
          statsViewField.id,
          statsViewField.name,
          statsViewField.fieldType,
          statsViewField.interval
        );
        const totalSum = statsData.reduce((acc, item) => acc + item.count, 0);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">
                      统计结果-{statsViewField.name}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setStatsViewField(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {statsViewField.fieldType === 'text' ? (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>总数：1000</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="py-2 px-3">字段值</th>
                          <th className="py-2 px-3">出现次数</th>
                          <th className="py-2 px-3">出现频率</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {statsData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-mono">{item.value}</td>
                            <td className="py-2 px-3 font-mono">{item.count}</td>
                            <td className="py-2 px-3 font-mono">{item.pct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-black text-slate-500">
                    <span>数值分布区间 (按间隔 {statsViewField.interval || 10} 统计)</span>
                    <span>次数 / 频率 (总数：1000)</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                    {statsData.map((item, idx) => (
                      <div key={`${item.value}-${idx}`} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="font-mono">{item.value}</span>
                          <span className="font-mono text-slate-600">
                            {item.count} <span className="text-slate-400 font-bold ml-1.5">({item.pct}%)</span>
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
              )}

              <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
                <button 
                  onClick={() => {
                    setStatPromptField({
                      id: statsViewField.id,
                      name: statsViewField.name,
                      isDicom: statsViewField.isDicom
                    });
                    setStatsViewField(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl cursor-pointer transition-colors border border-slate-200"
                >
                  重新统计
                </button>
                <button 
                  onClick={() => setStatsViewField(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Mapping Configuration Modal */}
      {mappingConfigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">映射配置-{mappingConfigModal.fieldChineseName || mappingConfigModal.fieldName}</h3>
                </div>
              </div>
              <button 
                onClick={() => {
                  setMappingConfigModal(null);
                  setEditingIndex(null);
                  setSourceValue("");
                  setIntervalStart("");
                  setIntervalEnd("");
                  setTargetValue("");
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selection of Mapping Type */}
            <div className="space-y-4">
              {isEditingPolicy ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700">选择映射方式</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="mappingType" 
                        checked={mappingType === "enum"}
                        onChange={() => {
                          setMappingType("enum");
                          setMappingConfigModal(prev => {
                            if (!prev) return null;
                            let newRules = prev.rules.filter(r => (r.type || 'enum') === "enum");
                            if (newRules.length === 0) {
                              newRules = [{ type: "enum", originalValue: "", generalizedValue: "" }];
                            }
                            return {
                              ...prev,
                              rules: newRules
                            };
                          });
                          setSourceValue("");
                          setIntervalStart("");
                          setIntervalEnd("");
                          setTargetValue("");
                          setEditingIndex(null);
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-700">枚举映射 (多值 → 单值)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="mappingType" 
                        checked={mappingType === "interval"}
                        onChange={() => {
                          setMappingType("interval");
                          setMappingConfigModal(prev => {
                            if (!prev) return null;
                            let newRules = prev.rules.filter(r => r.type === "interval");
                            if (newRules.length === 0) {
                              newRules = [{ type: "interval", originalValue: "-", generalizedValue: "" }];
                            }
                            return {
                              ...prev,
                              rules: newRules
                            };
                          });
                          setSourceValue("");
                          setIntervalStart("");
                          setIntervalEnd("");
                          setTargetValue("");
                          setEditingIndex(null);
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-700">区间映射 (区间段 → 单值)</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {mappingType === "enum" ? "枚举映射 (多值 → 单值)" : "区间映射 (区间段 → 单值)"}
                  </span>
                </div>
              )}

              {/* Dynamic Rows Container */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {mappingConfigModal.rules.map((rule, idx) => {
                  if (mappingType === "enum") {
                    if (!isEditingPolicy) {
                      return (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-black text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                              <span className="block text-[10px] font-black text-slate-400">原始值</span>
                              <span className="block text-xs font-bold text-slate-800 mt-0.5">{rule.originalValue || "-"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-black text-slate-400">目标值</span>
                              <span className="block text-xs font-bold text-blue-700 mt-0.5">{rule.generalizedValue || "-"}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-black text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-5 space-y-1">
                            <label className="block text-[10px] font-black text-slate-400">原始值(逗号分隔)</label>
                            <input 
                              type="text"
                              value={rule.originalValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMappingConfigModal(prev => {
                                  if (!prev) return null;
                                  const updated = [...prev.rules];
                                  updated[idx] = { ...updated[idx], originalValue: val };
                                  return { ...prev, rules: updated };
                                });
                              }}
                              placeholder="例如: 教师,医生,律师"
                              className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                            />
                          </div>
                          <div className="col-span-5 space-y-1">
                            <label className="block text-[10px] font-black text-slate-400">目标值</label>
                            <input 
                              type="text"
                              value={rule.generalizedValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMappingConfigModal(prev => {
                                  if (!prev) return null;
                                  const updated = [...prev.rules];
                                  updated[idx] = { ...updated[idx], generalizedValue: val };
                                  return { ...prev, rules: updated };
                                });
                              }}
                              placeholder="例如: 专业人员"
                              className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                            />
                          </div>
                          <div className="col-span-2 flex justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                setMappingConfigModal(prev => {
                                  if (!prev) return null;
                                  const updated = [...prev.rules];
                                  updated.splice(idx + 1, 0, { type: "enum", originalValue: "", generalizedValue: "" });
                                  return { ...prev, rules: updated };
                                });
                              }}
                              className="p-2 bg-white hover:bg-slate-100 text-blue-600 rounded-lg transition-colors border border-slate-200 hover:border-slate-300 cursor-pointer flex items-center justify-center"
                              title="添加一行"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            {mappingConfigModal.rules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMappingConfigModal(prev => {
                                    if (!prev) return null;
                                    const updated = prev.rules.filter((_, i) => i !== idx);
                                    return { ...prev, rules: updated };
                                  });
                                }}
                                className="p-2 bg-white hover:bg-red-50 text-red-500 rounded-lg transition-colors border border-slate-200 hover:border-red-200 cursor-pointer flex items-center justify-center"
                                title="删除本行"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    const parts = rule.originalValue ? rule.originalValue.split("-") : ["", ""];
                    const start = parts[0] || "";
                    const end = parts[1] || "";
                    if (!isEditingPolicy) {
                      return (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-black text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-4">
                            <div>
                              <span className="block text-[10px] font-black text-slate-400">区间起点(含)</span>
                              <span className="block text-xs font-bold text-slate-800 mt-0.5">{start || "-"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-black text-slate-400">区间终点(不含)</span>
                              <span className="block text-xs font-bold text-slate-800 mt-0.5">{end || "-"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-black text-slate-400">目标值</span>
                              <span className="block text-xs font-bold text-blue-700 mt-0.5">{rule.generalizedValue || "-"}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-black text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-3 space-y-1">
                            <label className="block text-[10px] font-black text-slate-400">区间起点(含)</label>
                            <input 
                              type="text"
                              value={start}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMappingConfigModal(prev => {
                                  if (!prev) return null;
                                  const updated = [...prev.rules];
                                  const currentParts = updated[idx].originalValue ? updated[idx].originalValue.split("-") : ["", ""];
                                  updated[idx] = { ...updated[idx], originalValue: `${val}-${currentParts[1] || ""}` };
                                  return { ...prev, rules: updated };
                                });
                              }}
                              placeholder="例如: 45"
                              className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                            />
                          </div>
                          <div className="col-span-3 space-y-1">
                            <label className="block text-[10px] font-black text-slate-400">区间终点(不含)</label>
                            <input 
                              type="text"
                              value={end}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMappingConfigModal(prev => {
                                  if (!prev) return null;
                                  const updated = [...prev.rules];
                                  const currentParts = updated[idx].originalValue ? updated[idx].originalValue.split("-") : ["", ""];
                                  updated[idx] = { ...updated[idx], originalValue: `${currentParts[0] || ""}-${val}` };
                                  return { ...prev, rules: updated };
                                });
                              }}
                              placeholder="例如: 60"
                              className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                            />
                          </div>
                          <div className="col-span-4 space-y-1">
                            <label className="block text-[10px] font-black text-slate-400">目标值</label>
                            <input 
                              type="text"
                              value={rule.generalizedValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMappingConfigModal(prev => {
                                  if (!prev) return null;
                                  const updated = [...prev.rules];
                                  updated[idx] = { ...updated[idx], generalizedValue: val };
                                  return { ...prev, rules: updated };
                                });
                              }}
                              placeholder="例如: 中老年"
                              className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                            />
                          </div>
                          <div className="col-span-2 flex justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                setMappingConfigModal(prev => {
                                  if (!prev) return null;
                                  const updated = [...prev.rules];
                                  updated.splice(idx + 1, 0, { type: "interval", originalValue: "-", generalizedValue: "" });
                                  return { ...prev, rules: updated };
                                });
                              }}
                              className="p-2 bg-white hover:bg-slate-100 text-blue-600 rounded-lg transition-colors border border-slate-200 hover:border-slate-300 cursor-pointer flex items-center justify-center"
                              title="添加一行"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            {mappingConfigModal.rules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMappingConfigModal(prev => {
                                    if (!prev) return null;
                                    const updated = prev.rules.filter((_, i) => i !== idx);
                                    return { ...prev, rules: updated };
                                  });
                                }}
                                className="p-2 bg-white hover:bg-red-50 text-red-500 rounded-lg transition-colors border border-slate-200 hover:border-red-200 cursor-pointer flex items-center justify-center"
                                title="删除本行"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            {/* Save Controls */}
            {isEditingPolicy ? (
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setMappingConfigModal(null);
                    setEditingIndex(null);
                    setSourceValue("");
                    setIntervalStart("");
                    setIntervalEnd("");
                    setTargetValue("");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg cursor-pointer transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    const { fieldName, isDicom, rules } = mappingConfigModal;
                    if (isDicom) {
                      setDicomFields(prev => prev.map(f => f.tag === fieldName ? { ...f, generalizationRules: rules } : f));
                    } else {
                      setCsvFields(prev => prev.map(f => f.fieldName === fieldName ? { ...f, generalizationRules: rules } : f));
                    }
                    setMappingConfigModal(null);
                    setEditingIndex(null);
                    setSourceValue("");
                    setIntervalStart("");
                    setIntervalEnd("");
                    setTargetValue("");
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg cursor-pointer transition-colors border-0"
                >
                  确定
                </button>
              </div>
            ) : (
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setMappingConfigModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg cursor-pointer transition-colors"
                >
                  关闭
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
