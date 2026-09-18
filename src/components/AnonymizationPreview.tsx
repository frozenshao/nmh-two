import React, { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, FileSpreadsheet, FileCode, Image as ImageIcon, Eye, CheckCircle2, ShieldCheck, ChevronRight, HelpCircle, Layers, ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize2, Minimize2, X, Move, RefreshCw, Search } from "lucide-react";

interface AnonymizationPreviewProps {
  task: {
    id: string;
    name: string;
    status: string;
    createdAt?: string;
  };
  row: {
    modality: string;
    category: string;
    total: string;
    success: string;
    failure: string;
    status: string;
    duration: string;
    dataSource?: string;
  };
  onBack: () => void;
}

// Fixed preview data for CSV modality (Matching Image 3)
const CSV_FIXED_ROWS = [
  {
    patientId: { raw: "2434325", anon: "hgbkl45hih34n" },
    record: {
      raw: '宋国强，男，30岁，于2026/09/01日6:40因“活动后气短1周”进入南方市第一人民医院急诊科就诊。既往有轻度哮喘病史，吸烟史5年。查体：体温36.7℃，脉搏82次/分，呼吸22次/分，血压125/80mmHg。双肺呼吸音粗，未闻及明显干湿啰音。心律齐，腹软无压痛。血常规提示白细胞计数正常，胸部CT检查显示肺纹理稍增粗。初步诊断：支气管炎伴轻度呼吸道感染，给予抗感染及对症治疗。',
      anon: '**，男，21-30岁，于2026/09/03日6:40因“活动后气短1周”进入**医院急诊科就诊。既往有轻度哮喘病史，吸烟史5年。查体：体温36.7℃，脉搏82次/分，呼吸22次/分，血压125/80mmHg。双肺呼吸音粗，未闻及明显干湿啰音。心律齐，腹软无压痛。血常规提示白细胞计数正常，胸部CT检查显示肺纹理稍增粗。初步诊断：支气管炎伴轻度呼吸道感染，给予抗感染及对症治疗。'
    },
    gender: { raw: "男", anon: "男" },
    age: { raw: "30岁", anon: "21-30岁" },
    date: { raw: "2025.01.01", anon: "2025.01.03" }
  },
  {
    patientId: { raw: "534556", anon: "kutxhg54ih34n" },
    record: {
      raw: '王五，男，56岁，于2026/09/05日6:40因“活动后气短1周”进入南方市第一人民医院急诊科就诊。患者主诉持续性干咳伴胸闷胸痛3天，加重1天。体格检查示双下肺闻及少量湿性啰音。心电图正常，生化指标示轻度转氨酶升高。初步临床诊断：慢性支气管炎急性发作，冠状动脉供血不足待查，建议住院进一步观察。',
      anon: '**，男，51-60岁，于2026/09/03日6:40因“活动后气短1周”进入**医院急诊科就诊。患者主诉持续性干咳伴胸闷胸痛3天，加重1天。体格检查示双下肺闻及少量湿性啰音。心电图正常，生化指标示轻度转氨酶升高。初步临床诊断：慢性支气管炎急性发作，冠状动脉供血不足待查，建议住院进一步观察。'
    },
    gender: { raw: "男", anon: "男" },
    age: { raw: "56岁", anon: "51-60岁" },
    date: { raw: "2025.02.12", anon: "2025.02.10" }
  },
  {
    patientId: { raw: "745535", anon: "hgfsjiehr909r" },
    record: {
      raw: '李四，女，38岁，于2026/09/06日6:40因“活动后气短1周”进入南方市第一人民医院急诊科就诊。门诊初步检查发现阵发性心悸，心率108次/分，律齐。血清电解质正常，甲状腺功能常规无特殊。心肌酶谱轻度偏高，初步考虑病毒性心肌炎后遗症状，予以营养心肌及静养方案指导。',
      anon: '**，女，31-40岁，于2026/09/08日6:40因“活动后气短1周”进入**医院急诊科就诊。门诊初步检查发现阵发性心悸，心率108次/分，律齐。血清电解质正常，甲状腺功能常规无特殊。心肌酶谱轻度偏高，初步考虑病毒性心肌炎后遗症状，予以营养心肌及静养方案指导。'
    },
    gender: { raw: "女", anon: "女" },
    age: { raw: "38岁", anon: "31-40岁" },
    date: { raw: "2025.06.20", anon: "2025.06.22" }
  },
  {
    patientId: { raw: "8892104", anon: "pzxnbq82mk91x" },
    record: {
      raw: '张伟，男，45岁，于2026/09/10日14:20因“突发右上腹绞痛伴恶心3小时”进入南方医科大学第二附属医院急诊就诊。既往有胆囊结石病史2年。查体：腹肌紧张，墨菲征阳性。急诊腹部彩超提示：胆囊炎合并多发性胆结石，胆总管未见扩张。初步诊断：急性结石性胆囊炎，拟择期行微创手术。',
      anon: '**，男，41-50岁，于2026/09/12日14:20因“突发右上腹绞痛伴恶心3小时”进入**医院急诊就诊。既往有胆囊结石病史2年。查体：腹肌紧张，墨菲征阳性。急诊腹部彩超提示：胆囊炎合并多发性胆结石，胆总管未见扩张。初步诊断：急性结石性胆囊炎，拟择期行微创手术。'
    },
    gender: { raw: "男", anon: "男" },
    age: { raw: "45岁", anon: "41-50岁" },
    date: { raw: "2025.07.15", anon: "2025.07.18" }
  },
  {
    patientId: { raw: "9120481", anon: "vckldw66yt42q" },
    record: {
      raw: '赵秀英，女，62岁，于2026/09/15日09:15因“反复头晕头痛伴双下肢浮肿半月”就诊于北京市朝阳区中医医院心血管内科。既往高血压病史10年，规律服用降压药。查体：血压165/100mmHg，双下肢轻度凹陷性水肿。实验室检查提示肌酐轻度偏高，尿蛋白+。初步诊断：高血压3级很高危，早期高血压肾病。',
      anon: '**，女，61-70岁，于2026/09/13日09:15因“反复头晕头痛伴双下肢浮肿半月”就诊于**医院心血管内科。既往高血压病史10年，规律服用降压药。查体：血压165/100mmHg，双下肢轻度凹陷性水肿。实验室检查提示肌酐轻度偏高，尿蛋白+。初步诊断：高血压3级很高危，早期高血压肾病。'
    },
    gender: { raw: "女", anon: "女" },
    age: { raw: "62岁", anon: "61-70岁" },
    date: { raw: "2025.08.02", anon: "2025.08.05" }
  },
  {
    patientId: { raw: "3310892", anon: "mnbvc12po89lk" },
    record: {
      raw: '孙明辉，男，27岁，于2026/09/18日11:00因“右侧踝关节扭伤伴局部肿痛2小时”来院就诊。查体：外踝皮下瘀斑，压痛明显，活动受限。X线摄影示外踝骨质未见明确骨折线。初步诊断：右踝关节韧带挫伤，予以冷敷、制动及外用消肿凝胶。',
      anon: '**，男，21-30岁，于2026/09/20日11:00因“右侧踝关节扭伤伴局部肿痛2小时”来院就诊。查体：外踝皮下瘀斑，压痛明显，活动受限。X线摄影示外踝骨质未见明确骨折线。初步诊断：右踝关节韧带挫伤，予以冷敷、制动及外用消肿凝胶。'
    },
    gender: { raw: "男", anon: "男" },
    age: { raw: "27岁", anon: "21-30岁" },
    date: { raw: "2025.08.20", anon: "2025.08.22" }
  },
  {
    patientId: { raw: "4829103", anon: "qweer88tyu23i" },
    record: {
      raw: '周建军，男，53岁，于2026/09/22日15:30因“血糖控制欠佳1月伴多饮多食”就诊于内分泌科门诊。既往2型糖尿病史6年。查体：BMI 27.8kg/m²。空腹血糖9.8mmol/L，糖化血红蛋白8.4%。初步诊断：2型糖尿病血糖控制不佳，调整降糖药物方案并强化饮食宣教。',
      anon: '**，男，51-60岁，于2026/09/25日15:30因“血糖控制欠佳1月伴多饮多食”就诊于内分泌科门诊。既往2型糖尿病史6年。查体：BMI 27.8kg/m²。空腹血糖9.8mmol/L，糖化血红蛋白8.4%。初步诊断：2型糖尿病血糖控制不佳，调整降糖药物方案并强化饮食宣教。'
    },
    gender: { raw: "男", anon: "男" },
    age: { raw: "53岁", anon: "51-60岁" },
    date: { raw: "2025.09.05", anon: "2025.09.08" }
  },
  {
    patientId: { raw: "6109483", anon: "asdfg44hjk77l" },
    record: {
      raw: '钱红梅，女，49岁，于2026/09/24日08:45因“间歇性反酸烧心伴剑突下灼痛1月”就诊于消化内科。胃镜检查提示反流性食管炎（洛杉矶分级B级），慢性非萎缩性胃炎。初步诊断：胃食管反流病，给予质子泵抑制剂及胃黏膜保护剂联合治疗。',
      anon: '**，女，41-50岁，于2026/09/26日08:45因“间歇性反酸烧心伴剑突下灼痛1月”就诊于消化内科。胃镜检查提示反流性食管炎（洛杉矶分级B级），慢性非萎缩性胃炎。初步诊断：胃食管反流病，给予质子泵抑制剂及胃黏膜保护剂联合治疗。'
    },
    gender: { raw: "女", anon: "女" },
    age: { raw: "49岁", anon: "41-50岁" },
    date: { raw: "2025.09.12", anon: "2025.09.15" }
  },
  {
    patientId: { raw: "7291045", anon: "zxcvb99nmk11o" },
    record: {
      raw: '吴国强，男，68岁，于2026/09/27日10:10因“咳嗽咳痰伴活动后胸闷2周”入院。既往慢阻肺病史8年。查体：桶状胸，双肺呼吸音减弱，散在干鸣音。胸片示肺气肿征象。初步诊断：慢性阻塞性肺疾病急性加重期，给予支气管扩张剂吸入及化痰平喘支持。',
      anon: '**，男，61-70岁，于2026/09/29日10:10因“咳嗽咳痰伴活动后胸闷2周”入院。既往慢阻肺病史8年。查体：桶状胸，双肺呼吸音减弱，散在干鸣音。胸片示肺气肿征象。初步诊断：慢性阻塞性肺疾病急性加重期，给予支气管扩张剂吸入及化痰平喘支持。'
    },
    gender: { raw: "男", anon: "男" },
    age: { raw: "68岁", anon: "61-70岁" },
    date: { raw: "2025.10.01", anon: "2025.10.04" }
  },
  {
    patientId: { raw: "8540192", anon: "poiuy66tre33w" },
    record: {
      raw: '郑雅文，女，34岁，于2026/09/29日14:50因“突发皮肤散在风团伴剧烈瘙痒半天”就诊于皮肤科门诊。无既往药物过敏史，发病前食用海鲜。查体：躯干及四肢可见散在大小不等水肿性红色斑块。初步诊断：急性荨麻疹，给予抗组胺药物口服及抗过敏对症治疗。',
      anon: '**，女，31-40岁，于2026/10/01日14:50因“突发皮肤散在风团伴剧烈瘙痒半天”就诊于皮肤科门诊。无既往药物过敏史，发病前食用海鲜。查体：躯干及四肢可见散在大小不等水肿性红色斑块。初步诊断：急性荨麻疹，给予抗组胺药物口服及抗过敏对症治疗。'
    },
    gender: { raw: "女", anon: "女" },
    age: { raw: "34岁", anon: "31-40岁" },
    date: { raw: "2025.10.15", anon: "2025.10.18" }
  }
];

// Generate 25 DICOM File Paths
const DICOM_FILE_PATHS = Array.from({ length: 25 }, (_, i) => {
  const patientNum = String(Math.floor(i / 5) + 1).padStart(2, '0');
  const visitNum = String((i % 5) + 1).padStart(2, '0');
  const frameNum = String(i + 1).padStart(4, '0');
  return `data/dicom/patient${patientNum}/visit${visitNum}/frame_${frameNum}`;
});

// Generate 25 Picture File Paths
const PICTURE_FILE_PATHS = Array.from({ length: 25 }, (_, i) => {
  const patientNum = String(Math.floor(i / 5) + 1).padStart(2, '0');
  const visitNum = String((i % 5) + 1).padStart(2, '0');
  const picNum = String(i + 1).padStart(4, '0');
  return `data/picture/patient${patientNum}/visit${visitNum}/picture_${picNum}`;
});

export default function AnonymizationPreview({ task, row, onBack }: AnonymizationPreviewProps) {
  // CSV Modality state: expanded rows & search query
  const [expandedCsvRows, setExpandedCsvRows] = useState<Record<number, boolean>>({});
  const [csvSearchInput, setCsvSearchInput] = useState<string>("");
  const [csvSearchQuery, setCsvSearchQuery] = useState<string>("");

  const filteredCsvRows = useMemo(() => {
    if (!csvSearchQuery) return CSV_FIXED_ROWS;
    const q = csvSearchQuery.toLowerCase();
    return CSV_FIXED_ROWS.filter((item, idx) => {
      const rowStr = [
        String(idx + 1),
        item.patientId.raw,
        item.patientId.anon,
        item.record.raw,
        item.record.anon,
        item.gender.raw,
        item.gender.anon,
        item.age.raw,
        item.age.anon,
        item.date.raw,
        item.date.anon
      ].join(' ').toLowerCase();
      return rowStr.includes(q);
    });
  }, [csvSearchQuery]);

  const [hoveredCell, setHoveredCell] = useState<{
    text: string;
    title: string;
    x: number;
    y: number;
  } | null>(null);

  // DICOM Modality state: selected file index (0..24) & expanded rows
  const [selectedDicomIndex, setSelectedDicomIndex] = useState<number>(0);
  const [expandedDicomRows, setExpandedDicomRows] = useState<Record<number, boolean>>({});

  // Picture Modality state: selected file index (0..24)
  const [selectedPictureIndex, setSelectedPictureIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Fullscreen picture viewer state
  const [fullscreenImage, setFullscreenImage] = useState<{
    isOpen: boolean;
    type: "raw" | "anon";
  }>({
    isOpen: false,
    type: "raw"
  });
  const [modalScale, setModalScale] = useState<number>(1);
  const [modalRotation, setModalRotation] = useState<number>(0);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const openFullscreen = (type: "raw" | "anon") => {
    setFullscreenImage({ isOpen: true, type });
    setModalScale(1.1);
    setModalRotation(0);
    setModalPosition({ x: 0, y: 0 });
  };

  const closeFullscreen = () => {
    setFullscreenImage(prev => ({ ...prev, isOpen: false }));
    setIsDragging(false);
  };

  // Keyboard escape handler for fullscreen modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreenImage.isOpen) {
        closeFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenImage.isOpen]);

  // Helper to toggle CSV row expansion
  const toggleCsvRow = (key: string | number) => {
    setExpandedCsvRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper to toggle DICOM row expansion
  const toggleDicomRow = (idx: number) => {
    setExpandedDicomRows(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Determine modality category
  const isCsv = row.modality.includes("CSV") || row.modality.includes("文本");
  const isDicom = row.modality.includes("DICOM") || row.modality.includes("影像");
  const isImage = row.modality.includes("图片") || row.modality.includes("图像");

  // DICOM table mock data (15 rows: 10 original + 5 newly added)
  const getDicomTableRows = (fileIdx: number) => {
    const pId = String(Math.floor(fileIdx / 5) + 1).padStart(4, '0');
    return [
      { tag: "(0008,0020)", field: "StudyDate", original: "2025.01.01", anonymized: "2025.01.03" },
      { tag: "(0008,0030)", field: "StudyTime", original: "093015.000", anonymized: "093015.000" },
      { tag: "(0008,0080)", field: "InstitutionName", original: "北京协和医院放射影像中心", anonymized: "医疗机构***" },
      { tag: "(0008,0090)", field: "ReferringPhysicianName", original: "李明伟 主任医师", anonymized: "医师***" },
      { tag: "(0010,0010)", field: "PatientName", original: `陈志强`, anonymized: `匿名受试者_P${pId}` },
      { tag: "(0010,0020)", field: "PatientID", original: `PID-20250912-${pId}`, anonymized: `HASH_${Math.abs(fileIdx * 19283 + 4721).toString(16).substring(0, 8).toUpperCase()}` },
      { tag: "(0010,0030)", field: "PatientBirthDate", original: "1982.04.15", anonymized: "1980~1985" },
      { tag: "(0010,0040)", field: "PatientSex", original: "M", anonymized: "M" },
      { tag: "(0010,1010)", field: "PatientAge", original: "043Y", anonymized: "41-50Y" },
      { tag: "(0020,000D)", field: "StudyInstanceUID", original: `1.2.840.113619.2.55.3.${fileIdx + 28311}`, anonymized: `1.2.840.113619.9.99.9.${String(fileIdx + 1).padStart(5, '0')}` },
      { tag: "(0008,1030)", field: "StudyDescription", original: "胸部CT平扫增强扫描", anonymized: "CT平扫检查***" },
      { tag: "(0018,0015)", field: "BodyPartExamined", original: "CHEST", anonymized: "CHEST" },
      { tag: "(0018,1000)", field: "DeviceSerialNumber", original: "SN-GE-CT-892104-X", anonymized: "SN-****-MASKED" },
      { tag: "(0010,21B0)", field: "AdditionalPatientHistory", original: "患者无药物过敏史，吸烟史20年，轻度咳嗽", anonymized: "受试者既往史已脱敏清洗" },
      { tag: "(0020,000E)", field: "SeriesInstanceUID", original: `1.2.840.113619.2.55.3.ser.${fileIdx + 41920}`, anonymized: `1.2.840.113619.9.99.9.ser.${String(fileIdx + 1).padStart(5, '0')}` }
    ];
  };

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-[calc(100vh-140px)] min-h-[580px]" id="anonymization_preview_page">
      {/* Header & Back row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-300 hover:border-slate-400 transition-all cursor-pointer shadow-3xs"
            title="返回任务详情"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>项目管理</span>
              <span className="text-slate-300">/</span>
              <span>匿名化任务</span>
              <span className="text-slate-300">/</span>
              <button 
                onClick={onBack}
                className="hover:underline text-slate-500 cursor-pointer bg-transparent border-0 p-0 text-[10px] font-bold"
              >
                任务详情
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-blue-600 font-black">匿名化预览</span>
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                匿名化预览
              </h1>
              <span className="px-2.5 py-1 rounded text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                {row.modality} {row.category !== '-' ? `· ${row.category}` : ''}
              </span>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-bold">
                任务：{task.name || "20260715-001"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALITY 1: CSV 文本数据 ================= */}
      {isCsv && (
        <div className="flex-1 min-h-0 flex flex-col space-y-3">
          {/* Top Search bar & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 px-0.5">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                value={csvSearchInput}
                onChange={(e) => setCsvSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCsvSearchQuery(csvSearchInput.trim());
                  }
                }}
                placeholder="支持搜索表格全部内容"
                className="w-full pl-9 pr-9 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-3xs"
              />
              <Search 
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-blue-600 transition-colors" 
                onClick={() => setCsvSearchQuery(csvSearchInput.trim())}
                title="回车或点击搜索"
              />
              {csvSearchInput && (
                <button
                  onClick={() => {
                    setCsvSearchInput("");
                    setCsvSearchQuery("");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  title="清除搜索"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <span className="font-bold text-slate-700">
                {csvSearchQuery ? `已筛选 ${filteredCsvRows.length} 条（共 ${CSV_FIXED_ROWS.length} 条）` : `共 ${CSV_FIXED_ROWS.length} 条`}
              </span>
            </div>
          </div>

          {/* Table Container Card - only table body scroll, sticky headers */}
          <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs select-text min-w-[1380px]">
                {/* 1st & 2nd Header Rows fixed on scroll */}
                <thead className="sticky top-0 z-20 bg-slate-50 shadow-xs">
                  <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200 text-[13px]">
                    <th rowSpan={2} className="py-2.5 px-3 w-[64px] min-w-[64px] border-r border-slate-200 bg-slate-50 text-center font-black text-slate-900 whitespace-nowrap text-xs">
                      序号
                    </th>
                    <th colSpan={2} className="py-3 px-4 border-r border-slate-200 tracking-wide bg-slate-50 whitespace-nowrap">患者编号</th>
                    <th colSpan={2} className="py-3 px-4 border-r border-slate-200 tracking-wide bg-slate-50 whitespace-nowrap">记录内容</th>
                    <th colSpan={2} className="py-3 px-4 border-r border-slate-200 tracking-wide bg-slate-50 whitespace-nowrap">性别</th>
                    <th colSpan={2} className="py-3 px-4 border-r border-slate-200 tracking-wide bg-slate-50 whitespace-nowrap">就诊年龄</th>
                    <th colSpan={2} className="py-3 px-4 tracking-wide bg-slate-50 whitespace-nowrap">就诊日期</th>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs shadow-xs">
                    <th className="py-2.5 px-4 border-r border-slate-200 bg-slate-50 whitespace-nowrap w-[120px] font-black text-slate-900">原始</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 bg-slate-50 whitespace-nowrap w-[170px] font-black text-slate-900">匿名化后</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 bg-slate-50 whitespace-nowrap min-w-[320px] font-black text-slate-900">原始</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 bg-slate-50 whitespace-nowrap min-w-[320px] font-black text-slate-900">匿名化后</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 bg-slate-50 whitespace-nowrap w-[80px] font-black text-slate-900">原始</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 bg-slate-50 whitespace-nowrap w-[90px] font-black text-slate-900">匿名化后</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 bg-slate-50 whitespace-nowrap w-[90px] font-black text-slate-900">原始</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 bg-slate-50 whitespace-nowrap w-[110px] font-black text-slate-900">匿名化后</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 bg-slate-50 whitespace-nowrap w-[120px] font-black text-slate-900">原始</th>
                    <th className="py-2.5 px-4 bg-slate-50 whitespace-nowrap w-[120px] font-black text-slate-900">匿名化后</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-150 text-slate-800">
                  {filteredCsvRows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-16 text-center text-slate-500 bg-white">
                        <div className="flex flex-col items-center justify-center py-6">
                          <p className="text-sm font-medium text-slate-500">未找到匹配的内容</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCsvRows.map((item, idx) => {
                      const isExpanded = !!expandedCsvRows[item.patientId.raw];

                      return (
                        <tr 
                          key={item.patientId.raw}
                          onClick={() => toggleCsvRow(item.patientId.raw)}
                          className={`transition-colors cursor-pointer ${
                            isExpanded ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'
                          }`}
                          title="点击展开/收起本行全部完整内容"
                        >
                          {/* 0. 序号 */}
                          <td className="py-3 px-3 text-center border-r border-slate-100 font-sans text-slate-500 font-medium text-xs align-top whitespace-nowrap">
                            #{String(idx + 1).padStart(2, '0')}
                          </td>

                          {/* 1. 患者编号 - 原始 */}
                          <td 
                            className="py-3 px-4 border-r border-slate-100 font-sans text-slate-800 align-top"
                            onMouseEnter={(e) => {
                              setHoveredCell({
                                title: "患者编号 (原始)",
                                text: item.patientId.raw,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {item.patientId.raw}
                          </td>

                          {/* 2. 患者编号 - 匿名化后 */}
                          <td 
                            className="py-3 px-4 border-r border-slate-100 font-sans text-slate-900 font-bold align-top"
                            onMouseEnter={(e) => {
                              setHoveredCell({
                                title: "患者编号 (匿名化后)",
                                text: item.patientId.anon,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {item.patientId.anon}
                          </td>

                          {/* 3. 记录内容 - 原始 */}
                          <td 
                            className="py-3 px-4 border-r border-slate-200 text-slate-700 leading-relaxed align-top"
                            onMouseEnter={(e) => {
                              setHoveredCell({
                                title: "记录内容（原始）",
                                text: item.record.raw,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <div 
                              style={isExpanded ? { whiteSpace: 'normal', wordBreak: 'break-word' } : {
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word'
                              }}
                            >
                              {item.record.raw}
                            </div>
                          </td>

                          {/* 4. 记录内容 - 匿名化后 */}
                          <td 
                            className="py-3 px-4 border-r border-slate-100 text-slate-900 font-medium leading-relaxed align-top"
                            onMouseEnter={(e) => {
                              setHoveredCell({
                                title: "记录内容 (匿名化后)",
                                text: item.record.anon,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <div 
                              style={isExpanded ? { whiteSpace: 'normal', wordBreak: 'break-word' } : {
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word'
                              }}
                            >
                              {item.record.anon}
                            </div>
                          </td>

                          {/* 5. 性别 - 原始 */}
                          <td 
                            className="py-3 px-4 border-r border-slate-100 text-slate-700 align-top"
                            onMouseEnter={(e) => {
                              setHoveredCell({
                                title: "性别 (原始)",
                                text: item.gender.raw,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {item.gender.raw}
                          </td>

                          {/* 6. 性别 - 匿名化后 */}
                          <td 
                            className="py-3 px-4 border-r border-slate-100 text-slate-900 font-bold align-top"
                            onMouseEnter={(e) => {
                              setHoveredCell({
                                title: "性别 (匿名化后)",
                                text: item.gender.anon,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {item.gender.anon}
                          </td>

                          {/* 7. 就诊年龄 - 原始 */}
                          <td 
                            className="py-3 px-4 border-r border-slate-100 text-slate-700 align-top"
                            onMouseEnter={(e) => {
                              setHoveredCell({
                                title: "就诊年龄 (原始)",
                                text: item.age.raw,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {item.age.raw}
                          </td>

                          {/* 8. 就诊年龄 - 匿名化后 */}
                          <td 
                            className="py-3 px-4 border-r border-slate-100 text-slate-900 font-bold align-top"
                            onMouseEnter={(e) => {
                              setHoveredCell({
                                title: "就诊年龄 (匿名化后)",
                                text: item.age.anon,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {item.age.anon}
                          </td>

                          {/* 9. 就诊日期 - 原始 */}
                          <td 
                            className="py-3 px-4 border-r border-slate-100 font-sans text-slate-700 align-top"
                            onMouseEnter={(e) => {
                              setHoveredCell({
                                title: "就诊日期 (原始)",
                                text: item.date.raw,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {item.date.raw}
                          </td>

                          {/* 10. 就诊日期 - 匿名化后 */}
                          <td 
                            className="py-3 px-4 font-sans text-slate-900 font-bold align-top"
                            onMouseEnter={(e) => {
                              setHoveredCell({
                                title: "就诊日期 (匿名化后)",
                                text: item.date.anon,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {item.date.anon}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALITY 2: DICOM 影像数据 ================= */}
      {isDicom && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Left Side: 25 File Paths, scrollable horizontally and vertically (reduced ~2cm to w-full lg:w-[270px] shrink-0) */}
            <div className="w-full lg:w-[270px] shrink-0 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[580px]">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-900">文件路径</span>
                </div>
                <span className="text-xs text-slate-900 font-normal">
                  共{DICOM_FILE_PATHS.length}条
                </span>
              </div>

              {/* Scrollable Container (both horizontal and vertical) */}
              <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin divide-y divide-slate-100 bg-white select-none">
                {DICOM_FILE_PATHS.map((path, idx) => {
                  const isSelected = selectedDicomIndex === idx;

                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedDicomIndex(idx)}
                      className={`group flex items-center text-xs font-sans cursor-pointer transition-colors whitespace-nowrap min-w-max ${
                        isSelected 
                          ? 'bg-blue-50/50' 
                          : 'hover:bg-slate-50/80'
                      }`}
                      title={path}
                    >
                      {/* Fixed sticky column: pinned to zero, opaque solid background so scrolled path never leaks to the left */}
                      <span className={`sticky left-0 z-20 w-12 py-2.5 text-center text-[11px] shrink-0 border-r border-slate-200 ${
                        isSelected 
                          ? 'bg-blue-600 text-white font-bold shadow-xs' 
                          : 'bg-white group-hover:bg-slate-50 text-slate-500 font-normal'
                      }`}>
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className={`px-3 py-2.5 ${
                        isSelected ? 'text-blue-700 font-bold' : 'text-slate-700'
                      }`}>
                        {path}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: DICOM Header Table (15 Rows) */}
            <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[580px]">
              {/* Matching header row with left tree */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-900">数据内容</span>
                </div>
                <span className="text-xs text-slate-900 font-normal">
                  共{getDicomTableRows(selectedDicomIndex).length}条
                </span>
              </div>

              <div className="flex-1 overflow-auto scrollbar-thin bg-white">
                <table className="w-full text-left border-collapse text-xs select-text">
                  <thead className="sticky top-0 bg-slate-50 z-10 shadow-2xs">
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs shadow-xs">
                      <th className="py-2.5 px-4 w-[130px] border-r border-slate-200 bg-slate-50 text-slate-700 font-bold whitespace-nowrap">TAG</th>
                      <th className="py-2.5 px-4 w-[180px] border-r border-slate-200 bg-slate-50 text-slate-700 font-bold whitespace-nowrap">数据字段</th>
                      <th className="py-2.5 px-4 w-[240px] border-r border-slate-200 bg-slate-50 text-slate-900 font-black whitespace-nowrap">原始</th>
                      <th className="py-2.5 px-4 bg-slate-50 text-slate-900 font-black whitespace-nowrap">匿名化后</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                      {getDicomTableRows(selectedDicomIndex).map((r, i) => {
                        const isExpanded = !!expandedDicomRows[i];

                        return (
                          <tr 
                            key={i} 
                            onClick={() => toggleDicomRow(i)}
                            className="transition-colors cursor-pointer bg-white hover:bg-slate-50/70"
                            title="点击展开/收起本行全部完整内容"
                          >
                            <td 
                              className="py-3 px-4 font-sans font-normal text-slate-600 border-r border-slate-200 align-top whitespace-nowrap"
                              onMouseEnter={(e) => {
                                setHoveredCell({
                                  title: "TAG 标识",
                                  text: r.tag,
                                  x: e.clientX,
                                  y: e.clientY
                                });
                              }}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div 
                                style={isExpanded ? { whiteSpace: 'normal', wordBreak: 'break-word' } : {
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {r.tag}
                              </div>
                            </td>
                            <td 
                              className="py-3 px-4 font-normal text-slate-600 border-r border-slate-200 align-top whitespace-nowrap"
                              onMouseEnter={(e) => {
                                setHoveredCell({
                                  title: "数据字段",
                                  text: r.field,
                                  x: e.clientX,
                                  y: e.clientY
                                });
                              }}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div 
                                style={isExpanded ? { whiteSpace: 'normal', wordBreak: 'break-word' } : {
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {r.field}
                              </div>
                            </td>
                            <td 
                              className="py-3 px-4 font-sans font-normal text-slate-600 border-r border-slate-200 align-top"
                              onMouseEnter={(e) => {
                                setHoveredCell({
                                  title: `${r.field} (原始)`,
                                  text: r.original,
                                  x: e.clientX,
                                  y: e.clientY
                                });
                              }}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div 
                                style={isExpanded ? { whiteSpace: 'normal', wordBreak: 'break-word' } : {
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {r.original}
                              </div>
                            </td>
                            <td 
                              className="py-3 px-4 font-sans font-normal text-slate-600 align-top"
                              onMouseEnter={(e) => {
                                setHoveredCell({
                                  title: `${r.field} (匿名化后)`,
                                  text: r.anonymized,
                                  x: e.clientX,
                                  y: e.clientY
                                });
                              }}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div 
                                style={isExpanded ? { whiteSpace: 'normal', wordBreak: 'break-word' } : {
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {r.anonymized}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ================= MODALITY 3: 图片数据 ================= */}
      {isImage && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Left Side: 25 Picture File Paths, scrollable horizontally and vertically (reduced ~2cm to w-full lg:w-[270px] shrink-0) */}
            <div className="w-full lg:w-[270px] shrink-0 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[600px]">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-900">文件路径</span>
                </div>
                <span className="text-xs text-slate-900 font-normal">
                  共{PICTURE_FILE_PATHS.length}条
                </span>
              </div>

              {/* Scrollable Container (both horizontal and vertical, no horizontal padding so sticky aligns to edge 0) */}
              <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin divide-y divide-slate-100 bg-white select-none">
                {PICTURE_FILE_PATHS.map((path, idx) => {
                  const isSelected = selectedPictureIndex === idx;

                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedPictureIndex(idx)}
                      className={`group flex items-center text-xs font-sans cursor-pointer transition-colors whitespace-nowrap min-w-max ${
                        isSelected 
                          ? 'bg-blue-50/50' 
                          : 'hover:bg-slate-50/80'
                      }`}
                      title={path}
                    >
                      {/* Fixed sticky column: pinned to zero, solid background so scrolled path never leaks to the left */}
                      <span className={`sticky left-0 z-20 w-12 py-2.5 text-center text-[11px] shrink-0 border-r border-slate-200 ${
                        isSelected 
                          ? 'bg-blue-600 text-white font-bold shadow-xs' 
                          : 'bg-white group-hover:bg-slate-50 text-slate-500 font-normal'
                      }`}>
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className={`px-3 py-2.5 ${
                        isSelected ? 'text-blue-700 font-bold' : 'text-slate-700'
                      }`}>
                        {path}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Dual Image Comparison (Original vs Anonymized) */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. 原始图片 */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[600px]">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span className="text-xs font-bold text-slate-900">原始图片</span>
                  </div>
                  <button 
                    onClick={() => openFullscreen('raw')}
                    className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-100 rounded-md border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                    title="全屏放大、拖拽与旋转"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px] font-medium">全屏查看</span>
                  </button>
                </div>

                <div 
                  onClick={() => openFullscreen('raw')}
                  className="flex-1 p-4 flex justify-center bg-slate-100/50 overflow-auto scrollbar-thin cursor-zoom-in group relative"
                  title="点击可全屏放大显示"
                >
                  <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 w-full max-w-[390px] text-slate-800 text-[11px] relative select-none transition-transform duration-150 group-hover:scale-[1.01]">
                    {/* Document Header */}
                    <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
                      <div className="text-[10px] font-black text-slate-800">北京协和医院</div>
                      <div className="text-base font-black text-slate-900 tracking-wider mt-0.5">门诊就诊及检查记录单</div>
                      <div className="text-[8px] text-slate-400 font-mono">CLINICAL OUTPATIENT RECORD #{String(selectedPictureIndex + 1).padStart(4, '0')}</div>
                    </div>

                    {/* Patient Info Row */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded mb-3 text-[10px] font-bold">
                      <div><span className="text-slate-400">患者姓名:</span> <span className="text-slate-900">宋国强</span></div>
                      <div><span className="text-slate-400">性别/年龄:</span> <span className="text-slate-900">男 / 45岁</span></div>
                      <div><span className="text-slate-400">门诊卡号:</span> <span className="text-slate-900 font-mono">OP-892104</span></div>
                      <div><span className="text-slate-400">就诊日期:</span> <span className="text-slate-900 font-mono">2026-07-18</span></div>
                      <div className="col-span-2"><span className="text-slate-400">身份证号:</span> <span className="text-slate-900 font-mono">110108198107183921</span></div>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-2.5 text-[10px]">
                      <div>
                        <div className="font-black text-slate-900 border-l-2 border-blue-600 pl-1.5 mb-1">主诉及病史</div>
                        <p className="text-slate-600 leading-relaxed pl-2 text-justify">
                          患者因“反复咳嗽、伴活动后胸闷3周”就诊。既往有高血压病史5年，规律服药，吸烟史10年。
                        </p>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 border-l-2 border-blue-600 pl-1.5 mb-1">查体及辅助检查</div>
                        <p className="text-slate-600 leading-relaxed pl-2 text-justify">
                          T: 36.6℃，P: 78次/分，BP: 132/84mmHg。双下肺呼吸音稍弱。心电图窦性心律，胸片示双肺纹理增多紊乱。
                        </p>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 border-l-2 border-blue-600 pl-1.5 mb-1">初步临床诊断</div>
                        <p className="text-slate-900 font-bold pl-2">
                          1. 支气管哮喘急性发作期；2. 原发性高血压(2级)。
                        </p>
                      </div>
                    </div>

                    {/* Footer Stamp & Doctor */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px]">
                      <div>
                        <span className="text-slate-400">接诊医师: </span>
                        <span className="font-bold text-slate-900 underline">王建国 (副主任医师)</span>
                      </div>
                      <div className="w-12 h-12 rounded-full border border-red-400/40 flex items-center justify-center text-red-500/50 text-[8px] font-black uppercase rotate-12">
                        门诊专用章
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 匿名化后图片 */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[600px]">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-900">匿名化后图片</span>
                  </div>
                  <button 
                    onClick={() => openFullscreen('anon')}
                    className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-100 rounded-md border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                    title="全屏放大、拖拽与旋转"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px] font-medium">全屏查看</span>
                  </button>
                </div>

                <div 
                  onClick={() => openFullscreen('anon')}
                  className="flex-1 p-4 flex justify-center bg-slate-100/50 overflow-auto scrollbar-thin cursor-zoom-in group relative"
                  title="点击可全屏放大显示"
                >
                  <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 w-full max-w-[390px] text-slate-800 text-[11px] relative select-none transition-transform duration-150 group-hover:scale-[1.01]">
                    {/* Document Header with Masked Hospital */}
                    <div className="text-center border-b-2 border-slate-900 pb-2 mb-3 relative">
                      <div className="inline-block bg-slate-900 text-white px-3 py-0.5 rounded-xs text-[10px] font-mono tracking-widest">
                        ████████医院
                      </div>
                      <div className="text-base font-black text-slate-900 tracking-wider mt-0.5">门诊就诊及检查记录单</div>
                      <div className="text-[8px] text-slate-400 font-mono">CLINICAL OUTPATIENT RECORD #{String(selectedPictureIndex + 1).padStart(4, '0')}</div>
                    </div>

                    {/* Patient Info Row with Blacked out Masks */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded mb-3 text-[10px] font-bold">
                      <div>
                        <span className="text-slate-400">患者姓名: </span>
                        <span className="inline-block bg-slate-900 text-slate-900 px-2 py-0.5 rounded-xs select-none">
                          ████
                        </span>
                      </div>
                      <div><span className="text-slate-400">性别/年龄:</span> <span className="text-slate-900">男 / 41-50岁</span></div>
                      <div>
                        <span className="text-slate-400">门诊卡号: </span>
                        <span className="inline-block bg-slate-900 text-slate-900 px-2 py-0.5 rounded-xs select-none">
                          ████████
                        </span>
                      </div>
                      <div><span className="text-slate-400">就诊日期:</span> <span className="text-slate-900 font-mono">2026-07-20</span></div>
                      <div className="col-span-2">
                        <span className="text-slate-400">身份证号: </span>
                        <span className="inline-block bg-slate-900 text-slate-900 px-4 py-0.5 rounded-xs select-none">
                          ██████████████████
                        </span>
                      </div>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-2.5 text-[10px]">
                      <div>
                        <div className="font-black text-slate-900 border-l-2 border-emerald-600 pl-1.5 mb-1">主诉及病史</div>
                        <p className="text-slate-600 leading-relaxed pl-2 text-justify">
                          患者因“反复咳嗽、伴活动后胸闷3周”就诊。既往有高血压病史5年，规律服药，吸烟史10年。
                        </p>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 border-l-2 border-emerald-600 pl-1.5 mb-1">查体及辅助检查</div>
                        <p className="text-slate-600 leading-relaxed pl-2 text-justify">
                          T: 36.6℃，P: 78次/分，BP: 132/84mmHg。双下肺呼吸音稍弱。心电图窦性心律，胸片示双肺纹理增多紊乱。
                        </p>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 border-l-2 border-emerald-600 pl-1.5 mb-1">初步临床诊断</div>
                        <p className="text-slate-900 font-bold pl-2">
                          1. 支气管哮喘急性发作期；2. 原发性高血压(2级)。
                        </p>
                      </div>
                    </div>

                    {/* Footer Stamp & Doctor with Blackout */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px]">
                      <div>
                        <span className="text-slate-400">接诊医师: </span>
                        <span className="inline-block bg-slate-900 text-slate-900 px-3 py-0.5 rounded-xs select-none align-middle">
                          ██████
                        </span>
                      </div>
                      {/* Stamp Mask */}
                      <div className="relative w-12 h-12 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-white text-[8px] font-black uppercase rotate-12 shadow-sm">
                        <span>[已遮蔽]</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal (with Zoom, Drag, and Rotation) */}
      {fullscreenImage.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col select-none animate-fade-in"
          onMouseUp={() => setIsDragging(false)}
        >
          {/* Top Control Bar */}
          <div className="px-5 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between text-white shrink-0 z-20">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-black tracking-wide text-white">
                {fullscreenImage.type === "raw" ? "原始图片 (全屏查看)" : "匿名化后图片 (全屏查看)"}
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                {PICTURE_FILE_PATHS[selectedPictureIndex]}
              </span>
            </div>

            {/* Middle Switch Buttons */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setFullscreenImage(prev => ({ ...prev, type: "raw" }))}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  fullscreenImage.type === "raw" 
                    ? "bg-blue-600 text-white shadow-xs" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                原始图片
              </button>
              <button
                onClick={() => setFullscreenImage(prev => ({ ...prev, type: "anon" }))}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  fullscreenImage.type === "anon" 
                    ? "bg-emerald-600 text-white shadow-xs" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                匿名化后图片
              </button>
            </div>

            {/* Action Tools */}
            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-1 py-0.5 text-xs text-slate-300">
                <button
                  onClick={() => setModalScale(s => Math.max(0.4, Number((s - 0.2).toFixed(1))))}
                  className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  title="缩小 (或鼠标滚轮向下)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span 
                  onClick={() => setModalScale(1)}
                  className="px-2 font-mono text-[11px] cursor-pointer hover:text-blue-400 title='点击复位为100%'"
                >
                  {Math.round(modalScale * 100)}%
                </span>
                <button
                  onClick={() => setModalScale(s => Math.min(3.0, Number((s + 0.2).toFixed(1))))}
                  className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  title="放大 (或鼠标滚轮向上)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Rotation Controls */}
              <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-1 py-0.5 text-xs text-slate-300">
                <button
                  onClick={() => setModalRotation(r => r - 90)}
                  className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  title="逆时针旋转 90°"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setModalRotation(r => r + 90)}
                  className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  title="顺时针旋转 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Reset view */}
              <button
                onClick={() => {
                  setModalScale(1);
                  setModalRotation(0);
                  setModalPosition({ x: 0, y: 0 });
                }}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="重置视图位置与旋转"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={closeFullscreen}
                className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                title="关闭全屏 (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Drag & Zoom Stage */}
          <div 
            className="flex-1 overflow-hidden relative flex items-center justify-center"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={(e) => {
              setIsDragging(true);
              dragStartRef.current = {
                x: e.clientX - modalPosition.x,
                y: e.clientY - modalPosition.y
              };
            }}
            onMouseMove={(e) => {
              if (isDragging) {
                setModalPosition({
                  x: e.clientX - dragStartRef.current.x,
                  y: e.clientY - dragStartRef.current.y
                });
              }
            }}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY < 0 ? 0.15 : -0.15;
              setModalScale(s => Math.min(3.0, Math.max(0.4, Number((s + delta).toFixed(2)))));
            }}
          >
            {/* The Transformed Target Container */}
            <div
              style={{
                transform: `translate(${modalPosition.x}px, ${modalPosition.y}px) scale(${modalScale}) rotate(${modalRotation}deg)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              className="will-change-transform shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {fullscreenImage.type === "raw" ? (
                <div className="bg-white border border-slate-300 shadow-2xl rounded-xl p-8 w-[480px] text-slate-800 text-xs relative select-none">
                  {/* Document Header */}
                  <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                    <div className="text-xs font-black text-slate-800">北京协和医院</div>
                    <div className="text-lg font-black text-slate-900 tracking-wider mt-0.5">门诊就诊及检查记录单</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">CLINICAL OUTPATIENT RECORD #{String(selectedPictureIndex + 1).padStart(4, '0')}</div>
                  </div>

                  {/* Patient Info Row */}
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200 p-3 rounded-lg mb-4 text-xs font-bold">
                    <div><span className="text-slate-400">患者姓名:</span> <span className="text-slate-900">宋国强</span></div>
                    <div><span className="text-slate-400">性别/年龄:</span> <span className="text-slate-900">男 / 45岁</span></div>
                    <div><span className="text-slate-400">门诊卡号:</span> <span className="text-slate-900 font-mono">OP-892104</span></div>
                    <div><span className="text-slate-400">就诊日期:</span> <span className="text-slate-900 font-mono">2026-07-18</span></div>
                    <div className="col-span-2"><span className="text-slate-400">身份证号:</span> <span className="text-slate-900 font-mono">110108198107183921</span></div>
                  </div>

                  {/* Content Sections */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="font-black text-slate-900 border-l-3 border-blue-600 pl-2 mb-1">主诉及病史</div>
                      <p className="text-slate-600 leading-relaxed pl-2.5 text-justify">
                        患者因“反复咳嗽、伴活动后胸闷3周”就诊。既往有高血压病史5年，规律服药，吸烟史10年。
                      </p>
                    </div>
                    <div>
                      <div className="font-black text-slate-900 border-l-3 border-blue-600 pl-2 mb-1">查体及辅助检查</div>
                      <p className="text-slate-600 leading-relaxed pl-2.5 text-justify">
                        T: 36.6℃，P: 78次/分，BP: 132/84mmHg。双下肺呼吸音稍弱。心电图窦性心律，胸片示双肺纹理增多紊乱。
                      </p>
                    </div>
                    <div>
                      <div className="font-black text-slate-900 border-l-3 border-blue-600 pl-2 mb-1">初步临床诊断</div>
                      <p className="text-slate-900 font-bold pl-2.5">
                        1. 支气管哮喘急性发作期；2. 原发性高血压(2级)。
                      </p>
                    </div>
                  </div>

                  {/* Footer Stamp & Doctor */}
                  <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">接诊医师: </span>
                      <span className="font-bold text-slate-900 underline">王建国 (副主任医师)</span>
                    </div>
                    <div className="w-14 h-14 rounded-full border border-red-400/50 flex items-center justify-center text-red-500/60 text-[9px] font-black uppercase rotate-12">
                      门诊专用章
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-300 shadow-2xl rounded-xl p-8 w-[480px] text-slate-800 text-xs relative select-none">
                  {/* Document Header with Masked Hospital */}
                  <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 relative">
                    <div className="inline-block bg-slate-900 text-white px-4 py-0.5 rounded-xs text-xs font-mono tracking-widest">
                      ████████医院
                    </div>
                    <div className="text-lg font-black text-slate-900 tracking-wider mt-0.5">门诊就诊及检查记录单</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">CLINICAL OUTPATIENT RECORD #{String(selectedPictureIndex + 1).padStart(4, '0')}</div>
                  </div>

                  {/* Patient Info Row with Blacked out Masks */}
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200 p-3 rounded-lg mb-4 text-xs font-bold">
                    <div>
                      <span className="text-slate-400">患者姓名: </span>
                      <span className="inline-block bg-slate-900 text-slate-900 px-2 py-0.5 rounded-xs select-none">
                        ████
                      </span>
                    </div>
                    <div><span className="text-slate-400">性别/年龄:</span> <span className="text-slate-900">男 / 41-50岁</span></div>
                    <div>
                      <span className="text-slate-400">门诊卡号: </span>
                      <span className="inline-block bg-slate-900 text-slate-900 px-2 py-0.5 rounded-xs select-none">
                        ████████
                      </span>
                    </div>
                    <div><span className="text-slate-400">就诊日期:</span> <span className="text-slate-900 font-mono">2026-07-20</span></div>
                    <div className="col-span-2">
                      <span className="text-slate-400">身份证号: </span>
                      <span className="inline-block bg-slate-900 text-slate-900 px-4 py-0.5 rounded-xs select-none">
                        ██████████████████
                      </span>
                    </div>
                  </div>

                  {/* Content Sections */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="font-black text-slate-900 border-l-3 border-emerald-600 pl-2 mb-1">主诉及病史</div>
                      <p className="text-slate-600 leading-relaxed pl-2.5 text-justify">
                        患者因“反复咳嗽、伴活动后胸闷3周”就诊。既往有高血压病史5年，规律服药，吸烟史10年。
                      </p>
                    </div>
                    <div>
                      <div className="font-black text-slate-900 border-l-3 border-emerald-600 pl-2 mb-1">查体及辅助检查</div>
                      <p className="text-slate-600 leading-relaxed pl-2.5 text-justify">
                        T: 36.6℃，P: 78次/分，BP: 132/84mmHg。双下肺呼吸音稍弱。心电图窦性心律，胸片示双肺纹理增多紊乱。
                      </p>
                    </div>
                    <div>
                      <div className="font-black text-slate-900 border-l-3 border-emerald-600 pl-2 mb-1">初步临床诊断</div>
                      <p className="text-slate-900 font-bold pl-2.5">
                        1. 支气管哮喘急性发作期；2. 原发性高血压(2级)。
                      </p>
                    </div>
                  </div>

                  {/* Footer Stamp & Doctor with Blackout */}
                  <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">接诊医师: </span>
                      <span className="inline-block bg-slate-900 text-slate-900 px-3 py-0.5 rounded-xs select-none align-middle">
                        ██████
                      </span>
                    </div>
                    {/* Stamp Mask */}
                    <div className="relative w-14 h-14 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-white text-[9px] font-black uppercase rotate-12 shadow-sm">
                      <span>[已遮蔽]</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom floating hint */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-20">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-4 py-1.5 text-slate-300 text-xs flex items-center space-x-3 shadow-lg">
                <span className="flex items-center space-x-1">
                  <Move className="w-3.5 h-3.5 text-blue-400" />
                  <span>按住鼠标左键可拖动画布</span>
                </span>
                <span className="text-slate-600">•</span>
                <span>滚轮或工具栏缩放</span>
                <span className="text-slate-600">•</span>
                <span>支持 90° 旋转</span>
                <span className="text-slate-600">•</span>
                <span>ESC 键退出</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip for CSV Cells */}
      {hoveredCell && (
        <div 
          className="fixed z-50 pointer-events-none max-w-sm bg-slate-900 text-white rounded-xl shadow-xl p-3 text-xs leading-relaxed border border-slate-700 animate-fade-in"
          style={{
            left: `${Math.min(window.innerWidth - 320, hoveredCell.x + 15)}px`,
            top: `${Math.min(window.innerHeight - 150, hoveredCell.y + 15)}px`
          }}
        >
          <div className="text-[10px] text-blue-400 font-black uppercase tracking-wider mb-1">
            {hoveredCell.title}
          </div>
          <div className="font-medium text-slate-200 whitespace-pre-wrap break-words">
            {hoveredCell.text}
          </div>
        </div>
      )}
    </div>
  );
}
