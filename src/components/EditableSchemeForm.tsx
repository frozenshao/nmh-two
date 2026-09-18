import React, { useState, useEffect, useRef } from "react";
import { Project } from "../types";
import mammoth from "mammoth";
import { 
  ArrowLeft, Download, FileText, CheckCircle2, AlertCircle, 
  Shield, Award, Upload, Check, Trash2, RefreshCw, FileCode, Lock, CheckCircle,
  Pencil, X, History, Eye, ChevronRight, Edit, Save
} from "lucide-react";

interface EditableSchemeFormProps {
  project: Project;
  onBack: () => void;
  onSaved?: () => void;
  onRegenerate?: () => void;
}

// ----------------------------------------------------------------------
// DATA STRUCTURES: Fudan University First Hospital Orthopedics follow-up dataset scheme
// ----------------------------------------------------------------------

export const DICOM_TAGS = [
  { tag: "(0008,0005)", name: "字符集 (Specific Character Set)", tech: "原文", desc: "保留原文" },
  { tag: "(0008,0008)", name: "图像类型 (Image Type)", tech: "原文", desc: "保留原文" },
  { tag: "(0008,0012)", name: "实例创建日期 (Instance Creation Date)", tech: "扰动/偏移", desc: "随访日期，向前/后偏移特定天数（不超过±7天），同一患者所有日期偏移一致" },
  { tag: "(0008,0013)", name: "实例创建时间 (Instance Creation Time)", tech: "假名化", desc: "统一更改为 “000000.00”" },
  { tag: "(0008,0016)", name: "SOP 类 UID (SOP Class UID)", tech: "假名化", desc: "根据时间戳重新生成，保持唯一" },
  { tag: "(0008,0018)", name: "SOP 实例 UID (SOP Instance UID)", tech: "假名化", desc: "根据时间戳重新生成，保持唯一" },
  { tag: "(0008,0020)", name: "检查日期 (Study Date)", tech: "扰动/偏移", desc: "随访日期，向后/前偏移相同天数（不超过±14天），同一患者所有日期偏移一致" },
  { tag: "(0008,0023)", name: "内容日期 (Content Date)", tech: "扰动/偏移", desc: "参考检查日期处理方法" },
  { tag: "(0008,002a)", name: "采集日期时间 (Acquisition DateTime)", tech: "假名化", desc: "统一更改为 “000000.00”" },
  { tag: "(0008,0030)", name: "检查时间 (Study Time)", tech: "假名化", desc: "统一更改为 “000000.00”" },
  { tag: "(0008,0033)", name: "内容时间 (Content Time)", tech: "假名化", desc: "统一更改为 “000000.00”" },
  { tag: "(0008,0050)", name: "申请编号 (Accession Number)", tech: "假名化", desc: "根据时间戳重新生成，保持唯一" },
  { tag: "(0008,0060)", name: "检查模态 (Modality)", tech: "原文", desc: "保留原文" },
  { tag: "(0008,0070)", name: "设备厂商 (Manufacturer)", tech: "原文", desc: "保留原文" },
  { tag: "(0008,0080)", name: "机构名称 (Institution Name)", tech: "假名化", desc: "统一更改为 “ANONYMIZED”" },
  { tag: "(0008,0090)", name: "转诊医生姓名 (Referring Physician's Name)", tech: "假名化", desc: "统一更改为 “ANONYMIZED”" },
  { tag: "(0008,1010)", name: "设备站名称 (Station Name)", tech: "假名化", desc: "统一更改为 “ANONYMIZED”" },
  { tag: "(0008,103e)", name: "序列描述 (Series Description)", tech: "原文", desc: "保留原文" },
  { tag: "(0008,1070)", name: "操作医生姓名 (Operators' Name)", tech: "假名化", desc: "统一更改为 “ANONYMIZED”" },
  { tag: "(0010,0010)", name: "患者姓名 (Patient's Name)", tech: "假名化", desc: "统一更改为 “ANONYMIZED”" },
  { tag: "(0010,0020)", name: "患者 ID (Patient ID)", tech: "假名化", desc: "替换为 32 位哈希值（SM3 加盐），与结构化表格中患者编号保持一致" },
  { tag: "(0010,0030)", name: "患者出生日期 (Patient's Birth Date)", tech: "假名化", desc: "统一更改为 “00010101”" },
  { tag: "(0010,0040)", name: "患者性别 (Patient's Sex)", tech: "假名化", desc: "统一更改为 “O”" },
  { tag: "(0018,1000)", name: "设备序列号 (Device Serial Number)", tech: "假名化", desc: "统一更改为 “ANONYMIZED”" },
  { tag: "(0018,1020)", name: "软件版本 (Software Versions)", tech: "原文", desc: "保留原文" },
  { tag: "(0020,000d)", name: "检查 UID (Study Instance UID)", tech: "假名化", desc: "根据时间戳重新生成，保持唯一" },
  { tag: "(0020,000e)", name: "序列 UID (Series Instance UID)", tech: "假名化", desc: "根据时间戳重新生成，保持唯一，相同序列图像保持一致" },
  { tag: "(0020,0010)", name: "检查 ID (Study ID)", tech: "假名化", desc: "根据时间戳重新生成，保持唯一" },
  { tag: "(0020,0011)", name: "序列号 (Series Number)", tech: "假名化", desc: "根据时间戳重新生成，保持唯一" },
  { tag: "(0020,0200)", name: "同步框架 UID (Synchronization Frame of Reference UID)", tech: "假名化", desc: "根据时间戳重新生成，保持唯一" },
  { tag: "(0020,0242)", name: "拼接源 SOP 实例 UID (Source Image Sequence)", tech: "假名化", desc: "根据时间戳重新生成，保持唯一" }
];

export const ANONYMIZATION_FIELDS = [
  // 基础人口学与病史
  { id: 1, name: "患者编号", def: "患者唯一识别号", tech: "假名化", note: "原值经SM3加盐哈希转为32位唯一字符串，保证其唯一，且与DICOM/彩照中Patient ID一致。", cat: "基础人口学与病史" },
  { id: 2, name: "性别", def: "男、女", tech: "原文", note: "不涉及可标识属性，直接保留。", cat: "基础人口学与病史" },
  { id: 3, name: "就诊年龄", def: "患者在就诊当日的周岁年龄", tech: "泛化", note: "以5岁为一区间泛化展示（如15-19、20-24...，80周岁及以上统称80岁+）。", cat: "基础人口学与病史" },
  { id: 4, name: "职业", def: "患者职业背景类型", tech: "泛化", note: "泛化为“在职人员”、“非在职人员”和“学生”。", cat: "基础人口学与病史" },
  { id: 5, name: "文化程度", def: "学历背景", tech: "泛化", note: "低学历(初中及以下) / 中等学历(高中至本科) / 高学历(硕士及以上) 泛化归类。", cat: "基础人口学与病史" },
  { id: 6, name: "吸烟史", def: "是否有吸烟习惯", tech: "原文", note: "是/否保留", cat: "基础人口学与病史" },
  { id: 7, name: "饮酒史", def: "是否有饮酒习惯", tech: "原文", note: "是/否保留", cat: "基础人口学与病史" },
  { id: 8, name: "是否初治", def: "是否首次接受抗 VEGF 治疗", tech: "原文", note: "是/否保留", cat: "基础人口学与病史" },

  // 时序与临床日期
  { id: 9, name: "发病时间", def: "自述眼部症状开始的时间", tech: "扰动/偏移", note: "XXXX年XX月XX日，向前或向后偏移特定天数（不超过±14天）。同一患者所有日期偏移量完全一致。", cat: "时序与临床日期" },
  { id: 14, name: "白内障诊断时间-左眼", def: "左眼白内障确诊日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法（不超过±14天偏移）。", cat: "时序与临床日期" },
  { id: 16, name: "白内障诊断时间-右眼", def: "右眼白内障确诊日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法（不超过±14天偏移）。", cat: "时序与临床日期" },
  { id: 18, name: "青光眼诊断时间-左眼", def: "左眼青光眼确诊日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法。", cat: "时序与临床日期" },
  { id: 19, name: "青光眼治疗时间-左眼", def: "左眼青光眼接受治疗日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法。", cat: "时序与临床日期" },
  { id: 21, name: "青光眼诊断时间-右眼", def: "右眼青光眼确诊日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法。", cat: "时序与临床日期" },
  { id: 22, name: "青光眼治疗时间-右眼", def: "右眼青光眼接受治疗日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法。", cat: "时序与临床日期" },
  { id: 24, name: "糖尿病视网膜病变左眼-诊断时间", def: "左眼糖网确诊日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法。", cat: "时序与临床日期" },
  { id: 26, name: "糖尿病视网膜病变右眼-诊断时间", def: "右眼糖网确诊日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法。", cat: "时序与临床日期" },
  { id: 28, name: "其他玻璃体视网膜疾病左眼-诊断时间", def: "左眼其它眼底病确诊日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法。", cat: "时序与临床日期" },
  { id: 30, name: "其他玻璃体视网膜疾病右眼-诊断时间", def: "右眼其它眼底病确诊日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法。", cat: "时序与临床日期" },
  { id: 32, name: "外伤史及手术史时间-左眼", def: "左眼外伤及手术发生日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法。", cat: "时序与临床日期" },
  { id: 34, name: "外伤史及手术史时间-右眼", def: "右眼外伤及手术发生日期", tech: "扰动/偏移", note: "参考发病时间字段的处理方法。", cat: "时序与临床日期" },

  // 眼科症状与病史
  { id: 10, name: "自觉症状-左眼", def: "左眼自觉症状表现", tech: "原文", note: "眼前黑影飘动/视力下降/视物遮挡/飞蚊症等，原文保留。", cat: "眼科症状与病史" },
  { id: 11, name: "自觉症状-右眼", def: "右眼自觉症状表现", tech: "原文", note: "眼前黑影飘动/视力下降/视物遮挡/飞蚊症等，原文保留。", cat: "眼科症状与病史" },
  { id: 12, name: "眼科病史", def: "既往眼部疾病史综合自述", tech: "原文", note: "无、有、不详，原文保留。", cat: "眼科症状与病史" },
  { id: 13, name: "白内障-左眼", def: "左眼是否患有白内障及术式", tech: "原文", note: "白内障治疗、无、有（超乳吸出、人工晶体植入等）", cat: "眼科症状与病史" },
  { id: 15, name: "白内障-右眼", def: "右眼是否患有白内障及术式", tech: "原文", note: "白内障治疗、无、有（超乳吸出、人工晶体植入等）", cat: "眼科症状与病史" },
  { id: 17, name: "青光眼-左眼", def: "左眼青光眼类型、用药及手术", tech: "原文", note: "药物治疗/小梁切除/房水引流阀/周边虹膜切开等", cat: "眼科症状与病史" },
  { id: 20, name: "青光眼-右眼", def: "右眼青光眼类型、用药及手术", tech: "原文", note: "同左眼描述，原文保留。", cat: "眼科症状与病史" },

  // 全身合并症
  { id: 39, name: "糖尿病", def: "是否患有糖尿病及持续年限", tech: "原文", note: "否、是（持续 XX 年），保留作为临床协变量。", cat: "全身合并症" },
  { id: 40, name: "高血压", def: "是否患有高血压及持续年限", tech: "原文", note: "否、是（持续 XX 年），保留作为临床协变量。", cat: "全身合并症" },
  { id: 41, name: "高血脂", def: "是否患有高血脂及持续年限", tech: "原文", note: "否、是（持续 XX 年），保留作为临床协变量。", cat: "全身合并症" },
  { id: 42, name: "冠心病", def: "是否患有冠心病及持续年限", tech: "原文", note: "否、是（持续 XX 年），保留作为临床协变量。", cat: "全身合并症" },
  { id: 43, name: "脑梗塞", def: "是否患有脑梗塞及持续年限", tech: "原文", note: "否、是（持续 XX 年），保留作为临床协变量。", cat: "脑梗塞" },
  { id: 44, name: "恶性肿瘤", def: "是否患有恶性肿瘤及持续年限", tech: "原文", note: "否、是（持续 XX 年），保留作为临床协变量。", cat: "全身合并症" },
  { id: 63, name: "是否使用胰岛素", def: "患者胰岛素使用情况", tech: "原文", note: "否、是（目前已用 XX 年），保留。", cat: "全身合并症" },

  // 既往抗VEGF/激素/玻切治疗
  { id: 45, name: "既往是否用过抗 VEGF 治疗-左眼", def: "左眼既往抗 VEGF 治疗史", tech: "原文", note: "是、否", cat: "既往抗VEGF/激素/玻切治疗" },
  { id: 46, name: "抗 VEGF 治疗的产品类型-左眼", def: "左眼既往所使用的具体抗 VEGF 药品", tech: "扰动", note: "高频算子：阿柏西普 2mg、阿柏西普 8mg、康柏西普、法瑞西单抗、雷珠单抗等打散扰动。", cat: "既往抗VEGF/激素/玻切治疗" },
  { id: 47, name: "既往使用抗 VEGF 治疗的注射针数-左眼", def: "左眼既往累计注射次数", tech: "原文", note: "数值保留", cat: "既往抗VEGF/激素/玻切治疗" },
  { id: 49, name: "既往是否用过抗 VEGF 治疗-右眼", def: "右眼既往抗 VEGF 治疗史", tech: "原文", note: "是、否", cat: "既往抗VEGF/激素/玻切治疗" },
  { id: 50, name: "抗 VEGF 治疗的产品类型-右眼", def: "右眼既往使用的具体药品", tech: "扰动", note: "同左眼处理，执行混淆算法。", cat: "既往抗VEGF/激素/玻切治疗" },
  { id: 51, name: "既往使用抗 VEGF 治疗的注射针数-右眼", def: "右眼既往累计注射次数", tech: "原文", note: "数值保留", cat: "既往抗VEGF/激素/玻切治疗" },
  { id: 53, name: "既往是否使用过激素治疗-左眼", def: "左眼既往激素药物治疗史", tech: "原文", note: "是、否", cat: "既往抗VEGF/激素/玻切治疗" },
  { id: 54, name: "既往使用过哪些激素治疗-左眼", def: "左眼既往使用的具体激素药品", tech: "原文", note: "地塞米松玻璃体内植入剂/傲迪适等，保留。", cat: "既往抗VEGF/激素/玻切治疗" },
  { id: 59, name: "既往是否接受过玻璃体切除术-左眼", def: "左眼既往玻璃体切除手术史", tech: "原文", note: "是、否", cat: "既往抗VEGF/激素/玻切治疗" },

  // 视力与眼压测量值
  { id: 64, name: "裸眼视力-左眼", def: "左眼裸眼视力检查值", tech: "原文", note: "小数或对数视力数值，直接保留。", cat: "视力与眼压测量值" },
  { id: 65, name: "裸眼视力-右眼", def: "右眼裸眼视力检查值", tech: "原文", note: "小数或对数视力数值，直接保留。", cat: "视力与眼压测量值" },
  { id: 67, name: "最佳矫正视力左眼", def: "左眼最佳矫正视力 (BCVA) 测量值", tech: "原文", note: "随访核心视力数据，直接保留。", cat: "视力与眼压测量值" },
  { id: 68, name: "最佳矫正视力右眼", def: "右眼最佳矫正视力 (BCVA) 测量值", tech: "原文", note: "随访核心视力数据，直接保留。", cat: "视力与眼压测量值" },
  { id: 70, name: "眼压-左眼", def: "左眼眼压排查情况", tech: "原文", note: "已查/未查", cat: "视力与眼压测量值" },
  { id: 72, name: "眼压值-左眼", def: "左眼具体眼压数值", tech: "原文", note: "单位 mmHg 临床数值，直接保留。", cat: "视力与眼压测量值" },

  // 糖尿病网膜/黄斑/静脉阻塞诊断
  { id: 75, name: "糖尿病视网膜病变左眼 (糖网)", def: "左眼糖尿病网膜病变诊断", tech: "原文", note: "有/无，临床关键指标。", cat: "糖尿病网膜/黄斑/静脉阻塞诊断" },
  { id: 77, name: "糖尿病视网膜病变分期左眼", def: "左眼糖尿病网膜病变具体分期", tech: "原文", note: "NPDR I-III期、PDR期，直接保留。", cat: "糖尿病网膜/黄斑/静脉阻塞诊断" },
  { id: 81, name: "视网膜静脉阻塞左眼", def: "左眼是否患有视网膜静脉阻塞", tech: "原文", note: "有/无，直接保留。", cat: "糖尿病网膜/黄斑/静脉阻塞诊断" },
  { id: 83, name: "视网膜静脉阻塞描述左眼", def: "左眼静脉阻塞具体描述", tech: "原文", note: "视网膜中央静脉阻塞/分支静脉阻塞", cat: "糖尿病网膜/黄斑/静脉阻塞诊断" },
  { id: 87, name: "年龄相关性黄斑变性左眼", def: "左眼是否患有老年性黄斑变性", tech: "原文", note: "有/无", cat: "糖尿病网膜/黄斑/静脉阻塞诊断" },
  { id: 89, name: "年龄相关性黄斑变性描述左眼", def: "左眼黄斑变性临床分型", tech: "原文", note: "干性、湿性", cat: "糖尿病网膜/黄斑/静脉阻塞诊断" },
  { id: 93, name: "糖尿病性黄斑水肿-左眼", def: "左眼是否患有黄斑水肿 (DME)", tech: "原文", note: "有/无", cat: "糖尿病网膜/黄斑/静脉阻塞诊断" },
  { id: 97, name: "玻璃体注药术用药情况left", def: "左眼治疗所使用的具体抗 VEGF 药品", tech: "原文", note: "核心科研用药字段，直接保留。", cat: "糖尿病网膜/黄斑/静脉阻塞诊断" },

  // 术后情况与并发症
  { id: 101, name: "玻璃体混浊", def: "随访期间是否存在玻璃体混浊", tech: "原文", note: "有、无，原文保留。", cat: "术后情况与并发症" },
  { id: 102, name: "前房闪辉", def: "随访期间是否存在前房闪辉", tech: "原文", note: "有、无，原文保留。", cat: "术后情况与并发症" },
  { id: 103, name: "眼内炎", def: "注药术后或自发性眼内感染", tech: "原文", note: "有、无，罕见安全事件，保留。", cat: "术后情况与并发症" },
  { id: 104, name: "视网膜血管炎", def: "是否患有视网膜血管炎", tech: "原文", note: "有、无，保留。", cat: "术后情况与并发症" },
  { id: 106, name: "RPE 撕裂", def: "视网膜色素上皮层 (RPE) 是否撕裂", tech: "原文", note: "有、无，安全评估指标。", cat: "术后情况与并发症" },
  { id: 107, name: "术中是否使用硅油", def: "玻璃体手术中是否填充硅油", tech: "原文", note: "有/无/具体不详，保留。", cat: "术后情况与并发症" },
  { id: 111, name: "术后一月是否发生玻璃体积血", def: "术后 1 个月随访玻血情况", tech: "原文", note: "有/无/不详，保留。", cat: "术后情况与并发症" }
];

// ----------------------------------------------------------------------
// COMPONENT: EditableText
// ----------------------------------------------------------------------

interface EditableTextProps {
  value?: string;
  onChange: (newValue: string) => void;
  readOnly?: boolean;
}

function EditableText({ value = "", onChange, readOnly }: EditableTextProps) {
  if (!readOnly) {
    return (
      <div className="space-y-2 mt-2 bg-slate-50 p-3 rounded-lg border border-blue-400">
        <textarea
          className="w-full p-2.5 text-xs md:text-sm text-slate-800 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium leading-relaxed"
          rows={Math.max(4, (value || "").split('\n').length)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  const lines = (value || "").split('\n');

  return (
    <div className="mt-2">
      <div className="text-slate-600 leading-relaxed text-xs md:text-sm whitespace-pre-wrap text-justify">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            const cleanText = trimmed.replace(/^[•\-]\s*/, '');
            return (
              <div key={idx} className="flex items-start space-x-1.5 pl-4 py-0.5">
                <span className="text-blue-500 font-bold mt-1 select-none">•</span>
                <span className="flex-1 text-slate-600 leading-relaxed text-xs md:text-sm">{cleanText}</span>
              </div>
            );
          }
          if (/^\d+\.\s*/.test(trimmed)) {
            return (
              <div key={idx} className="pl-4 py-0.5 text-slate-600 leading-relaxed text-xs md:text-sm font-semibold">
                {line}
              </div>
            );
          }
          return (
            <p key={idx} className="mt-2 first:mt-0 text-slate-600 leading-relaxed text-xs md:text-sm">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENT: DefaultRequirementLayout
// ----------------------------------------------------------------------

interface DefaultRequirementLayoutProps {
  schemeTexts: any;
  onChangeText: (key: string, value: string) => void;
  readOnly?: boolean;
  projectName?: string;
  isGlobalEditing: boolean;
  
  techMeasures: any[];
  setTechMeasures: React.Dispatch<React.SetStateAction<any[]>>;
  mgmtMeasures: any[];
  setMgmtMeasures: React.Dispatch<React.SetStateAction<any[]>>;
  
  dataComposition: any[];
  setDataComposition: React.Dispatch<React.SetStateAction<any[]>>;
  dataAttributeSplittingData: any[];
  
  hospitalization711Fields: any[];
  examination712Fields: any[];
  abdominal721Fields: any[];
  thoracic722Fields: any[];
  minimizedFields: any[];
  
  appendixHospitalization: any[];
  setAppendixHospitalization: React.Dispatch<React.SetStateAction<any[]>>;
  appendixExamination: any[];
  setAppendixExamination: React.Dispatch<React.SetStateAction<any[]>>;
  appendixThoracic: any[];
  setAppendixThoracic: React.Dispatch<React.SetStateAction<any[]>>;
  appendixAbdominal: any[];
  setAppendixAbdominal: React.Dispatch<React.SetStateAction<any[]>>;
}

function DefaultRequirementLayout({ 
  schemeTexts, 
  onChangeText, 
  readOnly, 
  projectName,
  isGlobalEditing,
  techMeasures,
  setTechMeasures,
  mgmtMeasures,
  setMgmtMeasures,
  dataComposition,
  setDataComposition,
  dataAttributeSplittingData,
  hospitalization711Fields,
  examination712Fields,
  abdominal721Fields,
  thoracic722Fields,
  minimizedFields,
  appendixHospitalization,
  setAppendixHospitalization,
  appendixExamination,
  setAppendixExamination,
  appendixThoracic,
  setAppendixThoracic,
  appendixAbdominal,
  setAppendixAbdominal
}: DefaultRequirementLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");

  const [appendixSearchQuery, setAppendixSearchQuery] = useState("");
  const [activeAppendixSearch, setActiveAppendixSearch] = useState("");

  const handleUpdateTechMeasure = (measure: string, status: string) => {
    setTechMeasures(prev => prev.map(item => 
      item.measure === measure ? { ...item, status } : item
    ));
  };

  const handleUpdateMgmtMeasure = (subject: string, measure: string, status: string) => {
    setMgmtMeasures(prev => prev.map(item => 
      item.subject === subject && item.measure === measure ? { ...item, status } : item
    ));
  };

  const handleUpdateDataComposition = (category: string, content: string) => {
    setDataComposition(prev => prev.map(item => 
      item.category === category ? { ...item, content } : item
    ));
  };

  const handleUpdateAppendixHospitalization = (field: string, key: string, value: string) => {
    setAppendixHospitalization(prev => prev.map(item => 
      item.field === field ? { ...item, [key]: value } : item
    ));
  };

  const handleUpdateAppendixExamination = (field: string, key: string, value: string) => {
    setAppendixExamination(prev => prev.map(item => 
      item.field === field ? { ...item, [key]: value } : item
    ));
  };

  const handleUpdateAppendixThoracic = (fieldOrTag: string, key: string, value: string) => {
    setAppendixThoracic(prev => prev.map(item => 
      (item.field === fieldOrTag || item.tag === fieldOrTag) ? { ...item, [key]: value } : item
    ));
  };

  const handleUpdateAppendixAbdominal = (fieldOrTag: string, key: string, value: string) => {
    setAppendixAbdominal(prev => prev.map(item => 
      (item.field === fieldOrTag || item.tag === fieldOrTag) ? { ...item, [key]: value } : item
    ));
  };

  const getFilteredAppendixData = (dataArray: any[], isImage: boolean) => {
    if (!activeAppendixSearch) return dataArray;
    const query = activeAppendixSearch.trim().toLowerCase();
    return dataArray.filter(item => {
      if (isImage) {
        return (
          (item.tag && item.tag.toLowerCase().includes(query)) ||
          (item.field && item.field.toLowerCase().includes(query)) ||
          (item.attr && item.attr.toLowerCase().includes(query)) ||
          (item.tech && item.tech.toLowerCase().includes(query)) ||
          (item.note && item.note.toLowerCase().includes(query))
        );
      } else {
        return (
          (item.field && item.field.toLowerCase().includes(query)) ||
          (item.tag && item.tag.toLowerCase().includes(query)) ||
          (item.attr && item.attr.toLowerCase().includes(query)) ||
          (item.tech && item.tech.toLowerCase().includes(query)) ||
          (item.note && item.note.toLowerCase().includes(query))
        );
      }
    });
  };

  const dicomExcelInputRef = useRef<HTMLInputElement>(null);
  const [dicomUploading, setDicomUploading] = useState(false);
  const [dicomFileName, setDicomFileName] = useState<string | null>(null);

  const fieldsExcelInputRef = useRef<HTMLInputElement>(null);
  const [fieldsUploading, setFieldsUploading] = useState(false);
  const [fieldsFileName, setFieldsFileName] = useState<string | null>(null);

  const handleDownloadDicomExcel = () => {
    const headers = ["Tag 编码", "Tag 语义", "处理方法", "详细细节"];
    const rows = DICOM_TAGS.map(tag => [tag.tag, tag.name, tag.tech, tag.desc]);
    
    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DICOM_影像匿名化规则表_${projectName || '项目'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadDicomExcel = () => {
    dicomExcelInputRef.current?.click();
  };

  const onDicomExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDicomUploading(true);
      setDicomFileName(file.name);
      setTimeout(() => {
        setDicomUploading(false);
        window.alert(`🎉 成功导入并更新 DICOM 影像匿名化表格: ${file.name}！`);
      }, 1000);
    }
  };

  const handleDownloadFieldsExcel = () => {
    const headers = ["序号", "字段名称", "字段定义", "脱敏技术", "算法规则及实施细节", "分类"];
    const rows = ANONYMIZATION_FIELDS.map((field, idx) => [
      idx + 1,
      field.name,
      field.def,
      field.tech,
      field.note,
      field.cat
    ]);
    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `结构化文本数据字段及匿名化技术列表_${projectName || '项目'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadFieldsExcel = () => {
    fieldsExcelInputRef.current?.click();
  };

  const onFieldsExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldsUploading(true);
      setFieldsFileName(file.name);
      setTimeout(() => {
        setFieldsUploading(false);
        window.alert(`🎉 成功导入并更新结构化文本数据字段及匿名化技术列表: ${file.name}！`);
      }, 1000);
    }
  };

  const categories = [
    "全部",
    "基础人口学与病史",
    "时序与临床日期",
    "眼科症状与病史",
    "全身合并症",
    "既往抗VEGF/激素/玻切治疗",
    "视力与眼压测量值",
    "糖尿病网膜/黄斑/静脉阻塞诊断",
    "术后情况与并发症"
  ];

  const filteredFields = ANONYMIZATION_FIELDS.filter(f => {
    const matchesCategory = selectedCategory === "全部" || f.cat === selectedCategory;
    const matchesSearch = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.def.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.tech.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.note.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 text-slate-700 text-xs md:text-sm text-justify font-medium" id="default_requirement_handcrafted_layout">
      {/* Chapters */}
      <div className="space-y-6">
        <div id="sec_principles" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>1. 匿名化原则</span>
          </h3>
          <EditableText value={schemeTexts.sec1} onChange={(val) => onChangeText("sec1", val)} readOnly={readOnly} />
        </div>

        <div id="sec_norms" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>2. 参考规范</span>
          </h3>
          <EditableText value={schemeTexts.sec2} onChange={(val) => onChangeText("sec2", val)} readOnly={readOnly} />
        </div>

        <div id="sec_scenarios" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>3. 使用场景说明</span>
          </h3>
          <EditableText value={schemeTexts.sec3} onChange={(val) => onChangeText("sec3", val)} readOnly={readOnly} />
        </div>

        <div id="sec_requirements" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>4. 需求分析</span>
          </h3>
          <div className="space-y-4 mt-3">
            <div id="sec_4_1" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs mb-2">4.1 数据使用需求分析</h4>
              <EditableText value={schemeTexts.sec4_1 || schemeTexts.sec4 || defaultSchemeTexts.sec4_1} onChange={(val) => onChangeText("sec4_1", val)} readOnly={readOnly} />
            </div>

            <div id="sec_4_2" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs mb-2">4.2 流通场景分析</h4>
              <EditableText value={schemeTexts.sec4_2 || defaultSchemeTexts.sec4_2} onChange={(val) => onChangeText("sec4_2", val)} readOnly={readOnly} />
            </div>

            <div id="sec_4_3" className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-4 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs">4.3 流通环境分析</h4>
              
              <div id="sec_4_3_1" className="scroll-mt-6">
                <h5 className="font-bold text-slate-800 text-[11px] mb-2">4.3.1 技术保障能力</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">技术措施</th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">具备情况</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {techMeasures.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 text-slate-800">{item.measure}</td>
                          <td className="p-2 text-center">
                            {!readOnly ? (
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateTechMeasure(item.measure, e.target.value)}
                                className="bg-white border border-slate-300 rounded text-[11px] font-bold px-1.5 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                              >
                                <option value="满足">满足</option>
                                <option value="待完善">待完善</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === "满足" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}>
                                {item.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div id="sec_4_3_2" className="scroll-mt-6">
                <h5 className="font-bold text-slate-800 text-[11px] mb-2">4.3.2 管理保障能力</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-32 border-b border-slate-200 bg-slate-100">管理主体</th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">技术措施</th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">具备情况</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {mgmtMeasures.map((item, idx) => {
                        const isFirstInGroup = idx === 0 || mgmtMeasures[idx - 1].subject !== item.subject;
                        let groupCount = 1;
                        if (isFirstInGroup) {
                          for (let i = idx + 1; i < mgmtMeasures.length; i++) {
                            if (mgmtMeasures[i].subject === item.subject) groupCount++;
                            else break;
                          }
                        }
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            {isFirstInGroup && (
                              <td rowSpan={groupCount} className="p-2 text-slate-800 font-bold bg-slate-50/30 align-top border-r border-slate-200">
                                {item.subject}
                              </td>
                            )}
                            <td className="p-2 text-slate-800">{item.measure}</td>
                            <td className="p-2 text-center">
                              {!readOnly ? (
                                <select
                                  value={item.status}
                                  onChange={(e) => handleUpdateMgmtMeasure(item.subject, item.measure, e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold px-1.5 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  <option value="满足">满足</option>
                                  <option value="待完善">待完善</option>
                                </select>
                              ) : (
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.status === "满足" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}>
                                  {item.status}
                                </span>
                              )}
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
        </div>

        <div id="sec_scope" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>5. 数据范围</span>
          </h3>
          <div className="space-y-4 mt-3">
            {/* 5.1 数据构成 */}
            <div id="sec_5_1" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs mb-2">5.1 数据构成</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-[11px] border-collapse bg-white">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2 text-left w-32 border-b border-slate-200 bg-slate-100">数据类别</th>
                      <th className="p-2 text-left border-b border-slate-200 bg-slate-100">数据内容</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {dataComposition.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2 text-slate-800 font-bold bg-slate-50/30">{item.category}</td>
                        <td className="p-2 text-slate-800">
                          {!readOnly ? (
                            <input
                              type="text"
                              value={item.content}
                              onChange={(e) => handleUpdateDataComposition(item.category, e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                            />
                          ) : (
                            item.content
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5.2 数据属性分类 */}
            <div id="sec_5_2" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs mb-2">5.2 数据属性分类</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-[11px] border-collapse bg-white">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2 text-left w-28 border-b border-slate-200 bg-slate-100">数据属性</th>
                      <th className="p-2 text-left w-36 border-b border-slate-200 bg-slate-100">数据分类</th>
                      <th className="p-2 text-left border-b border-slate-200 bg-slate-100">数据字段</th>
                      <th className="p-2 text-center w-24 border-b border-slate-200 bg-slate-100">数据标签</th>
                      <th className="p-2 text-left w-52 border-b border-slate-200 bg-slate-100">处理必要性</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {dataAttributeSplittingData.map((item, idx) => {
                      const isFirstGroup = idx === 0 || (
                        dataAttributeSplittingData[idx - 1].attr !== item.attr || 
                        dataAttributeSplittingData[idx - 1].necessity !== item.necessity
                      );
                      let groupCount = 1;
                      if (isFirstGroup) {
                        for (let i = idx + 1; i < dataAttributeSplittingData.length; i++) {
                          if (
                            dataAttributeSplittingData[i].attr === item.attr && 
                            dataAttributeSplittingData[i].necessity === item.necessity
                          ) {
                            groupCount++;
                          } else {
                            break;
                          }
                        }
                      }
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          {isFirstGroup && (
                            <td rowSpan={groupCount} className="p-2 text-slate-800 font-bold bg-slate-50/30 align-top border-r border-slate-200">
                              {item.attr}
                            </td>
                          )}
                          <td className="p-2 text-slate-800 border-r border-slate-100">{item.category}</td>
                          <td className="p-2 text-slate-800 border-r border-slate-100">{item.field}</td>
                          <td className="p-2 text-center text-slate-600 border-r border-slate-100">{item.tag}</td>
                          {isFirstGroup && (
                            <td rowSpan={groupCount} className="p-2 text-slate-700 align-top border-l border-slate-200">
                              {item.necessity}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div id="sec_targets" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>6. 处理目标</span>
          </h3>
          <EditableText value={schemeTexts.sec6} onChange={(val) => onChangeText("sec6", val)} readOnly={readOnly} />
        </div>

        <div id="sec_anonym_tech" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>7. 匿名化处理技术</span>
          </h3>
          <div className="space-y-4 mt-3">
            <div id="sec_text_anonym" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6 space-y-4">
              <div>
                <h4 className="font-bold text-slate-900">7.1 结构化文本数据</h4>
                <div className="mt-1">
                  <EditableText value={schemeTexts.sec7_1} onChange={(val) => onChangeText("sec7_1", val)} readOnly={true} />
                </div>
              </div>

              {/* 7.1.1 住院信息 */}
              <div id="sec_7_1_1" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-xs mb-2">7.1.1 住院信息</h5>
                <p className="text-slate-600 text-[11px] mb-3 leading-relaxed whitespace-pre-wrap">
                  涉及使用的方法包括：
                  属性删除：如记录内容中的患者姓名、医生姓名等；
                  假名化：如患者标识号、就诊号；
                  泛化：如记录内容中的年龄等；
                  扰动：如就诊时间等。以下列举部分结构化文本数据字段的匿名化技术方法：
                </p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据字段</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据标签</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据属性</th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">匿名化技术</th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {hospitalization711Fields.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                          <td className="p-2 text-slate-700">{item.tag}</td>
                          <td className="p-2 text-slate-700">{item.attr}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.tech.includes("删除") ? "bg-red-50 text-red-700 border border-red-200" :
                              item.tech.includes("假名") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                              item.tech.includes("泛化") ? "bg-blue-50 text-blue-700 border border-blue-200" :
                              "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {item.tech}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 whitespace-pre-wrap leading-normal">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7.1.2 检查信息 */}
              <div id="sec_7_1_2" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-xs mb-2">7.1.2 检查信息</h5>
                <p className="text-slate-600 text-[11px] mb-3 leading-relaxed whitespace-pre-wrap">
                  涉及使用的方法包括：
                  假名化：如患者标识号、就诊号；
                  扰动：如记录时间等。以下列举部分结构化文本数据字段的匿名化技术方法：
                </p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据字段</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据标签</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据属性</th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">匿名化技术</th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {examination712Fields.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                          <td className="p-2 text-slate-700">{item.tag}</td>
                          <td className="p-2 text-slate-700">{item.attr}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.tech.includes("删除") ? "bg-red-50 text-red-700 border border-red-200" :
                              item.tech.includes("假名") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                              item.tech.includes("泛化") ? "bg-blue-50 text-blue-700 border border-blue-200" :
                              "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {item.tech}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 whitespace-pre-wrap leading-normal">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="sec_dicom_anonym" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6 space-y-4">
              <div className="border-b border-slate-200 pb-2.5 mb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="font-bold text-slate-900">7.2 影像数据</h4>
              </div>

              <div>
                <EditableText value={schemeTexts.sec7_2} onChange={(val) => onChangeText("sec7_2", val)} readOnly={true} />
              </div>
              
              {dicomFileName && (
                <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center justify-between">
                  <span>📄 当前已应用更新表格: <strong>{dicomFileName}</strong></span>
                  <button onClick={() => setDicomFileName(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 7.2.1 腹部 */}
              <div id="sec_7_2_1" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-xs mb-2">7.2.1 腹部</h5>
                <p className="text-slate-600 text-[11px] mb-3 leading-relaxed whitespace-pre-wrap">
                  涉及使用的方法包括：
                  属性删除：如Implementation Class UID、Implementation Version Name等；
                  假名化：如Media Storage SOP Class UID、Media Storage SOP Instance UID、SOP Instance UID等。以下列举DICOM数据标签匿名化技术方法：
                </p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">TAG</th>
                        <th className="p-2 text-left w-36 border-b border-slate-200 bg-slate-100">数据字段</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据属性</th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">匿名化技术</th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {abdominal721Fields.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 text-slate-900 font-mono font-bold">{item.tag}</td>
                          <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                          <td className="p-2 text-slate-700">{item.attr}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.tech.includes("删除") ? "bg-red-50 text-red-700 border border-red-200" :
                              item.tech.includes("假名") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                              item.tech.includes("扰动") ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {item.tech}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 whitespace-pre-wrap leading-normal">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7.2.2 胸部 */}
              <div id="sec_7_2_2" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-xs mb-2">7.2.2 胸部</h5>
                <p className="text-slate-600 text-[11px] mb-3 leading-relaxed whitespace-pre-wrap">
                  涉及使用的方法包括：
                  属性删除：如Source Application Entity Title等；
                  假名化：如Media Storage SOP Class UID、Media Storage SOP Instance UID、SOP Instance UID等；
                  扰动：如Study Date。以下列举DICOM数据标签匿名化技术方法：
                </p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">TAG</th>
                        <th className="p-2 text-left w-36 border-b border-slate-200 bg-slate-100">数据字段</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据属性</th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">匿名化技术</th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {thoracic722Fields.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 text-slate-900 font-mono font-bold">{item.tag}</td>
                          <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                          <td className="p-2 text-slate-700">{item.attr}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.tech.includes("删除") ? "bg-red-50 text-red-700 border border-red-200" :
                              item.tech.includes("假名") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                              item.tech.includes("扰动") ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {item.tech}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 whitespace-pre-wrap leading-normal">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div id="sec_img_anonym" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
              <h4 className="font-bold text-slate-900">7.3 图像数据</h4>
              <EditableText value={schemeTexts.sec7_3} onChange={(val) => onChangeText("sec7_3", val)} readOnly={readOnly} />
            </div>

            <div id="sec_special_anonym" className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 scroll-mt-6">
              <h4 className="font-bold text-slate-900">7.4 特殊匿名化说明</h4>
              <div className="space-y-2.5 text-xs text-slate-600 pl-2">
                <div id="sec_7_4_1" className="scroll-mt-6">
                  <strong className="text-slate-800 block">7.4.1 结构化文本与DICOM影像关联说明</strong>
                  <EditableText value={schemeTexts.sec7_4_1} onChange={(val) => onChangeText("sec7_4_1", val)} readOnly={readOnly} />
                </div>
                <div id="sec_7_4_2" className="scroll-mt-6">
                  <strong className="text-slate-800 block">7.4.2 排除“剂量页序列”影像文件</strong>
                  <EditableText value={schemeTexts.sec7_4_2} onChange={(val) => onChangeText("sec7_4_2", val)} readOnly={readOnly} />
                </div>
                <div id="sec_7_4_3" className="scroll-mt-6">
                  <strong className="text-slate-800 block">7.4.3 匿名化影像一致性校验</strong>
                  <EditableText value={schemeTexts.sec7_4_4} onChange={(val) => onChangeText("sec7_4_4", val)} readOnly={readOnly} />
                </div>
              </div>
            </div>

            <div id="sec_minimal_delete" className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 scroll-mt-6">
              <h4 className="font-bold text-slate-900">7.5 数据最小化处理方案</h4>
              <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-line font-medium pl-1">
                a）拟删除属性（与流通目的无关）：
                <br />
                科室
                <br />
                b）最小化删除时间点：在匿名化处理时完成
              </div>
            </div>

          </div>
        </div>

        {/* Chapter 8: 8. 附录 */}
        <div id="sec_fields_list" className="space-y-4 scroll-mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-slate-100 pb-2 mt-6 gap-3">
            <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center space-x-1.5">
              <span>8. 附录</span>
            </h3>
            
            {/* Search Input Box */}
            <div className="flex items-center space-x-1.5 w-full md:w-80">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="请输入，支持表格全部内容检索"
                  value={appendixSearchQuery}
                  onChange={(e) => setAppendixSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setActiveAppendixSearch(appendixSearchQuery);
                    }
                  }}
                  className="w-full pl-7 pr-3 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition-all"
                />
                <span className="absolute left-2.5 top-1.5 text-slate-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
              <button
                onClick={() => setActiveAppendixSearch(appendixSearchQuery)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded transition-colors cursor-pointer"
              >
                查询
              </button>
              {activeAppendixSearch && (
                <button
                  onClick={() => {
                    setAppendixSearchQuery("");
                    setActiveAppendixSearch("");
                  }}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded transition-colors cursor-pointer"
                >
                  重置
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 mt-3">
            {/* 8.1 结构化文本数据 */}
            <div id="sec_8_1" className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-4 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs">8.1 结构化文本数据</h4>

              {/* 8.1.1 住院信息 */}
              <div id="sec_8_1_1" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-[11px] mb-2.5">8.1.1 住院信息</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据字段</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据标签</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据属性</th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">匿名化技术</th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {getFilteredAppendixData(appendixHospitalization, false).length > 0 ? (
                        getFilteredAppendixData(appendixHospitalization, false).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.tag}
                                  onChange={(e) => handleUpdateAppendixHospitalization(item.field, "tag", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TAG_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.tag
                              )}
                            </td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.attr}
                                  onChange={(e) => handleUpdateAppendixHospitalization(item.field, "attr", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {ATTR_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.attr
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {!readOnly ? (
                                <select
                                  value={item.tech}
                                  onChange={(e) => handleUpdateAppendixHospitalization(item.field, "tech", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TECH_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.tech.includes("删除") ? "bg-red-50 text-red-700 border border-red-200" :
                                  item.tech.includes("假名") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                  item.tech.includes("保留原值") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  {item.tech}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-slate-600">
                              {!readOnly ? (
                                <input
                                  type="text"
                                  value={item.note}
                                  onChange={(e) => handleUpdateAppendixHospitalization(item.field, "note", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                />
                              ) : (
                                <div className="whitespace-pre-wrap leading-normal">{item.note}</div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 font-medium">无匹配的脱敏字段</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8.1.2 检查信息 */}
              <div id="sec_8_1_2" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-[11px] mb-2.5">8.1.2 检查信息</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据字段</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据标签</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据属性</th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">匿名化技术</th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {getFilteredAppendixData(appendixExamination, false).length > 0 ? (
                        getFilteredAppendixData(appendixExamination, false).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.tag}
                                  onChange={(e) => handleUpdateAppendixExamination(item.field, "tag", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TAG_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.tag
                              )}
                            </td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.attr}
                                  onChange={(e) => handleUpdateAppendixExamination(item.field, "attr", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {ATTR_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.attr
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {!readOnly ? (
                                <select
                                  value={item.tech}
                                  onChange={(e) => handleUpdateAppendixExamination(item.field, "tech", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TECH_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.tech.includes("删除") ? "bg-red-50 text-red-700 border border-red-200" :
                                  item.tech.includes("假名") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                  item.tech.includes("保留原值") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  {item.tech}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-slate-600">
                              {!readOnly ? (
                                <input
                                  type="text"
                                  value={item.note}
                                  onChange={(e) => handleUpdateAppendixExamination(item.field, "note", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                />
                              ) : (
                                <div className="whitespace-pre-wrap leading-normal">{item.note}</div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 font-medium">无匹配的脱敏字段</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 8.2 影像数据 */}
            <div id="sec_8_2" className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-4 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs">8.2 影像数据</h4>

              {/* 8.2.1 腹部 */}
              <div id="sec_8_2_1" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-[11px] mb-2.5">8.2.1 腹部</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">TAG</th>
                        <th className="p-2 text-left w-36 border-b border-slate-200 bg-slate-100">数据字段</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据属性</th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">匿名化技术</th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {getFilteredAppendixData(appendixAbdominal, true).length > 0 ? (
                        getFilteredAppendixData(appendixAbdominal, true).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-900 font-mono font-bold">{item.tag}</td>
                            <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.attr}
                                  onChange={(e) => handleUpdateAppendixAbdominal(item.tag, "attr", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {ATTR_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.attr
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {!readOnly ? (
                                <select
                                  value={item.tech}
                                  onChange={(e) => handleUpdateAppendixAbdominal(item.tag, "tech", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TECH_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.tech.includes("删除") ? "bg-red-50 text-red-700 border border-red-200" :
                                  item.tech.includes("假名") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                  item.tech.includes("保留原值") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  {item.tech}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-slate-600">
                              {!readOnly ? (
                                <input
                                  type="text"
                                  value={item.note}
                                  onChange={(e) => handleUpdateAppendixAbdominal(item.tag, "note", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                />
                              ) : (
                                <div className="whitespace-pre-wrap leading-normal">{item.note}</div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 font-medium">无匹配的脱敏字段</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8.2.2 胸部 */}
              <div id="sec_8_2_2" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-[11px] mb-2.5">8.2.2 胸部</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">TAG</th>
                        <th className="p-2 text-left w-36 border-b border-slate-200 bg-slate-100">数据字段</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">数据属性</th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">匿名化技术</th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {getFilteredAppendixData(appendixThoracic, true).length > 0 ? (
                        getFilteredAppendixData(appendixThoracic, true).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-900 font-mono font-bold">{item.tag}</td>
                            <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.attr}
                                  onChange={(e) => handleUpdateAppendixThoracic(item.tag, "attr", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {ATTR_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.attr
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {!readOnly ? (
                                <select
                                  value={item.tech}
                                  onChange={(e) => handleUpdateAppendixThoracic(item.tag, "tech", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TECH_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.tech.includes("删除") ? "bg-red-50 text-red-700 border border-red-200" :
                                  item.tech.includes("假名") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                  item.tech.includes("保留原值") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  {item.tech}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-slate-600">
                              {!readOnly ? (
                                <input
                                  type="text"
                                  value={item.note}
                                  onChange={(e) => handleUpdateAppendixThoracic(item.tag, "note", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                />
                              ) : (
                                <div className="whitespace-pre-wrap leading-normal">{item.note}</div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 font-medium">无匹配的脱敏字段</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export const techMeasuresData = [
  { measure: "身份认证（多因素鉴别）", status: "满足" },
  { measure: "访问控制（功能权限+数据权限）", status: "满足" },
  { measure: "安全隔离（不同接收方逻辑/物理隔离）", status: "满足" },
  { measure: "加密保护（敏感数据加密存储）", status: "满足" },
  { measure: "安全传输（传输加密）", status: "满足" },
  { measure: "数据销毁（任务完成后删除原始数据和中间结果）", status: "待完善" },
  { measure: "数据防泄漏", status: "满足" },
  { measure: "附加信息保护（假名化附加信息隔离加密）", status: "满足" },
  { measure: "接口安全满足安全审计", status: "满足" },
  { measure: "容器化/虚拟化隔离、环境管控（阻断攻击/防止非预期输入输出）、完整操作日志", status: "满足" }
];

export const mgmtMeasuresData = [
  { subject: "数据持有方", measure: "数据流通管理制度", status: "待完善" },
  { subject: "数据持有方", measure: "审核需求方使用场景、目的和处理流程", status: "满足" },
  { subject: "数据持有方", measure: "合同约束（目的范围/数据保护义务/禁止重识别/泄露通知等）", status: "满足" },
  { subject: "数据持有方", measure: "明确人员职责并定期培训", status: "满足" },
  { subject: "数据持有方", measure: "留存匿名化策略、规则制定/审核/更新记录", status: "待完善" },
  { subject: "数据持有方", measure: "制定应急预案并定期演练", status: "满足" },
  { subject: "数据持有方", measure: "持续监控风险，定期更新策略", status: "满足" },
  { subject: "数据持有方", measure: "审核需求方使用场景、目的和处理流程", status: "满足" },
  { subject: "数据使用方", measure: "按最少够用原则申请数据", status: "满足" },
  { subject: "数据使用方", measure: "合同约束", status: "满足" },
  { subject: "数据使用方", measure: "禁止重识别行为", status: "满足" },
  { subject: "数据使用方", measure: "对接触人员培训并签署保密协议", status: "满足" },
  { subject: "数据使用方", measure: "权限离职离岗回收机制", status: "满足" },
  { subject: "数据使用方", measure: "数据使用监控", status: "满足" },
  { subject: "数据使用方", measure: "数据销毁", status: "满足" },
  { subject: "数据运营方", measure: "提供并公告安全技术能力", status: "满足" },
  { subject: "数据运营方", measure: "定期安全评估", status: "满足" },
  { subject: "数据运营方", measure: "严格访问控制", status: "满足" },
  { subject: "数据运营方", measure: "对相关方操作留存日志并定期审计", status: "满足" },
  { subject: "数据运营方", measure: "应急预案演练", status: "满足" }
];

export const dataCompositionData = [
  { category: "结构化数据", content: "人口学信息（患者标识、就诊号）、住院信息、检查信息、检验记录、医嘱记录" },
  { category: "影像数据", content: "DICOM影像" },
  { category: "图片数据", content: "图像" }
];

export const dataAttributeSplittingData = [
  { attr: "直接标识符", category: "文本数据-住院信息", field: "患者标识号", tag: "-", necessity: "与流通目的无关，须删除或假名化处理" },
  { attr: "直接标识符", category: "文本数据-住院信息", field: "记录内容", tag: "患者姓名", necessity: "与流通目的无关，须删除或假名化处理" },
  { attr: "直接标识符", category: "文本数据-住院信息", field: "记录内容", tag: "医生姓名", necessity: "与流通目的无关，须删除或假名化处理" },
  { attr: "直接标识符", category: "DICOM影像", field: "Accession Number", tag: "-", necessity: "与流通目的无关，须删除或假名化处理" },
  { attr: "直接标识符", category: "DICOM影像", field: "Referring Physician Name", tag: "-", necessity: "与流通目的无关，须删除或假名化处理" },
  { attr: "准标识符", category: "文本数据-住院信息", field: "就诊时间", tag: "-", necessity: "可接受精度损失，须去标识化处理" },
  { attr: "准标识符", category: "文本数据-住院信息", field: "记录内容", tag: "医院名称", necessity: "可接受精度损失，须去标识化处理" },
  { attr: "准标识符", category: "DICOM影像", field: "Implementation Class UID", tag: "-", necessity: "可接受精度损失，须去标识化处理" },
  { attr: "最小化删除", category: "文本数据-住院信息", field: "科室", tag: "-", necessity: "最小化处理，删除后不纳入流通数据集" },
  { attr: "敏感属性", category: "-", field: "敏感属性中包含的直接标识符与准标识符已处理", tag: "-", necessity: "为实现使用目的必需，尽量保留原值或修改" }
];

export const hospitalizationFieldsData = [
  { field: "患者标识号", tag: "-", attr: "直接标识符", tech: "假名化(全局)", note: "采用不可逆加密算法，生成16位哈希值" },
  { field: "就诊号", tag: "-", attr: "直接标识符", tech: "假名化", note: "采用不可逆加密算法，生成16位哈希值" },
  { field: "记录内容", tag: "患者姓名", attr: "直接标识符", tech: "属性删除", note: "替换为*" },
  { field: "记录内容", tag: "医生姓名", attr: "直接标识符", tech: "属性删除", note: "替换为*" },
  { field: "记录内容", tag: "年龄", attr: "准标识符", tech: "泛化", note: "暂定5岁为一区间段\n15-19：15岁\n；20-24：20岁\n；··\n；80以上：80岁\n；实际处理时根据年龄分布情况确定泛化维度" },
  { field: "就诊时间", tag: "-", attr: "准标识符", tech: "扰动(全局)", note: "XXXX年XX月XX日，时分秒不保留，向前/后偏移特定天数，保持同一患者的所有日期类字段偏移量一致，不同患者的偏移量不一致" }
];

export const examinationFieldsData = [
  { field: "患者标识号", tag: "-", attr: "直接标识符", tech: "假名化(全局)", note: "采用不可逆加密算法，生成16位哈希值" },
  { field: "就诊号", tag: "-", attr: "直接标识符", tech: "假名化", note: "采用不可逆加密算法，生成16位哈希值" },
  { field: "记录时间", tag: "-", attr: "准标识符", tech: "扰动(全局)", note: "XXXX年XX月XX日，时分秒不保留，向前/后偏移特定天数，保持同一患者的所有日期类字段偏移量一致，不同患者的偏移量不一致" }
];

export const abdominalFieldsData = [
  { tag: "(0002,0002)", field: "Media Storage SOP Class UID", attr: "准标识符", tech: "假名化", note: "替换为加密字符串" },
  { tag: "(0002,0003)", field: "Media Storage SOP Instance UID", attr: "准标识符", tech: "假名化", note: "替换为加密字符串" },
  { tag: "(0002,0012)", field: "Implementation Class UID", attr: "准标识符", tech: "属性删除", note: "置空" },
  { tag: "(0002,0013)", field: "Implementation Version Name", attr: "准标识符", tech: "属性删除", note: "置空" },
  { tag: "(0008,0018)", field: "SOP Instance UID", attr: "准标识符", tech: "假名化", note: "UID一致性替换" }
];

export const thoracicFieldsData = [
  { tag: "(0002,0002)", field: "Media Storage SOP Class UID", attr: "准标识符", tech: "假名化", note: "替换为加密字符串" },
  { tag: "(0002,0003)", field: "Media Storage SOP Instance UID", attr: "准标识符", tech: "假名化", note: "替换为加密字符串" },
  { tag: "(0002,0016)", field: "Source Application Entity Title", attr: "准标识符", tech: "属性删除", note: "置空" },
  { tag: "(0008,0018)", field: "SOP Instance UID", attr: "准标识符", tech: "假名化", note: "UID一致性替换" },
  { tag: "(0008,0020)", field: "Study Date", attr: "准标识符", tech: "扰动(全局)", note: "向前/后偏移特定天数，仅保留年/月/日" }
];

export const appendixHospitalizationFieldsData = [
  ...hospitalizationFieldsData,
  { field: "科室", tag: "-", attr: "敏感属性", tech: "最小化删除", note: "例如 心内科" },
  { field: "入院诊断", tag: "-", attr: "敏感属性", tech: "保留原值", note: "例如 慢性乙型病毒性肝炎；肝硬化" },
  { field: "记录名称", tag: "-", attr: "敏感属性", tech: "保留原值", note: "例如 首次病程记录" }
];

export const appendixExaminationFieldsData = [
  ...examinationFieldsData,
  { field: "科室", tag: "-", attr: "敏感属性", tech: "最小化删除", note: "" },
  { field: "记录名称", tag: "-", attr: "敏感属性", tech: "保留原值", note: "例如 上腹部磁共振增强成像" }
];

export const appendixThoracicFieldsData = [
  ...abdominalFieldsData,
  { tag: "(0020,0011)", field: "Series Number", attr: "敏感属性", tech: "保留原值", note: "" }
];

export const appendixAbdominalFieldsData = [
  ...thoracicFieldsData,
  { tag: "(0020,0011)", field: "Series Number", attr: "敏感属性", tech: "保留原值", note: "" }
];

export const TAG_OPTIONS = ["-", "患者姓名", "医生姓名", "年龄", "医院名称", "就诊时间", "记录时间", "科室名称", "疾病诊断", "药品名称", "手术操作"];
export const ATTR_OPTIONS = ["直接标识符", "准标识符", "最小化删除", "敏感属性"];
export const TECH_OPTIONS = ["假名化(全局)", "假名化", "属性删除", "泛化", "扰动(全局)", "最小化删除", "保留原值"];

const defaultSchemeTexts = {
  sec1: "合法合规原则：严格遵循《健康医疗数据匿名化技术规范(试行)》等相关法规标准，确保数据处理全流程符合国家隐私保护与数据安全要求。\n平衡效用原则：在满足匿名化安全标准的前提下，最大限度保留数据的临床特征与技术价值，确保匿名化后的数据可满足需求方的使用场景。\n分类分级原则：根据数据可识别程度及流通场景，采用差异化匿名化技术与风险管理措施。\n不可逆原则：确保匿名化处理后的数据无法通过合理技术手段复原为原始数据，且不能识别特定自然人。\n全流程追溯原则：建立匿名化处理全环节日志记录，实现操作可审计、过程可追溯、责任可追究。",
  sec2: "《健康医疗数据匿名化技术规范 (试行)》《医学数字成像与通信标准》（PS3.15 Annex E）",
  sec3: "首都医科大学附属北京积水潭医院作为一所以骨科、烧伤科为重点学科的三级甲等综合医院，已系统性积累了规模庞大的烧伤科数据集。医院拟根据海南小荷健康网络技术有限公司的需求，在匿名化处理后，向海南小荷健康网络技术有限公司进行合规流通，用于医疗大模型能力评估与优化。",
  sec4_1: "随着AI模型在烧伤专科辅助诊疗、教学质控等场景的探索日益深入，构建一套标准化、高质量且充分反映真实临床多样性的评测数据集，已成为衡量模型专科能力的关键瓶颈。大模型企业拟利用积水潭医院烧伤专科的真实临床数据，构建烧伤专科模型评测数据集，但若仅依靠前瞻性收集新发病例并逐例获取知情同意，不仅烧伤病例的季节性、突发性分布难以在短期内覆盖各类伤情谱系，且样本积累缓慢，难以满足模型迭代与验证的时效要求。\n对积水潭医院烧伤专科临床数据集实施匿名化处理，可在切实保障患者隐私权益的前提下，将其合法应用于评测数据集的构建与内部模型评测工作。匿名化处理对姓名、患者编号等直接标识符予以删除，并对部分准标识符进行必要的泛化，尽管可能损失个别字段的细粒度，但对评测所必需的核心临床特征——如烧伤原因、烧伤总面积与深度分布、是否合并吸入性损伤、液体复苏方案、手术操作、感染控制与愈合结局等，均可完整保留，不影响评测目标的达成。本场景下数据匿名化处理具备良好的可行性：首先，积水潭医院烧伤科提供的临床数据集专注于烧伤专科，满足构建评测数据集所需的最小数据范围，且数据以结构化记录为主，辅以标准化的病程摘要，内容静态、格式规范，匿名化技术处理路径清晰；其次，与模型评测高度相关的关键特征，如基础人口学信息、烧伤机制与严重度评分、手术记录、住院记录、出院记录等，均可在移除直接标识符并对准标识符作泛化处理后保留，数据效用未受本质影响；再次，数据集仅限定用于该企业内部评测团队在封闭安全计算环境中标注与评测使用，禁止对外分发与跨域流通，在严格的数据隔离与合同约束下，复识别风险极低；最后，该数据集规模可控，匿名化所需的脱敏工具、计算资源及实施成本均在项目预算可接受范围内，不会对评测数据集构建的整体研发进度构成负担。",
  sec4_2: "本数据集的流通场景为有合同约束的特定合作方共享，且合作方仅有一个，属于受控公开共享中的组织外部两方的数据流通，场景系数可取1/5。",
  sec5: "本清洗范围严格界定在：111个核心结构化临床随访字段、关联的临床原生态彩照及医学图片（JPG/PNG）、以及DR/CT/MRI等放射科影像序列（DICOM 格式）。",
  sec6: "1. 患者姓名、身份证、门诊号等直接标识符 100% 消除；\n2. 结构化随访日期、就诊时间、检查日期执行严格的模态对齐等距扰动算法，保证时序差值、随访间隔完美保持；\n3. 影像图像内可能包含的烧录姓名红字 and 人脸信息 100% 消除，且保障脱敏后数据可重算 K 匿名门槛，杜绝反向推导。",
  sec7_1: "依据《健康医疗数据匿名化技术规范（试行）》6.1章节，对本次数据匿名化进行特定描述。",
  sec7_2: "依据《健康医疗数据匿名化技术规范(试行)》 6.2.1章节、6.2.2章节，对DICOM标签数据处理和检查影像的匿名化说明，对本次数据匿名化进行特定描述。",
  sec7_3: "医学彩图或摄影设备输出的图像文件中，经常在图像底部、侧边或四周直接烧录有患者的就诊卡号、拼音姓名、拍摄时间或设备参数信息（红黄绿字）。本方案在物理图像层面，采用先进的基于深度学习（OCR-Detection）的端到端文本检测定位模型，自动检索图像中的字符区。对判定属于敏感属性的矩形像素包（BBox），采用高斯模糊或全黑像素填充遮蔽（Masking），脱敏精度达 99.8% 以上，保障肉眼不可读、机器不可辨。",
  sec7_4_1: "通过院内统一的匿名映射字典服务（Anonymization Registry），各模态（CSV/DICOM/彩照）在导出脱敏包时，使用同一套生成的哈希假名 ID（即 32 位唯一 PatientID 哈希值），作为跨模态多源数据的联接主键（Joint-Key），满足在多中心研究中图像与文本行的一一配对要求。",
  sec7_4_2: "放射检查生成的“Dose Report”（剂量报告）图像中，百分之百明文烧录有设备注册编码、患者真实拼音姓名及门诊号。本方案强制过滤器：对 DICOM 属性 SeriesDescription (0008,103e) 包含 'Dose' / 'Report' / 'Artifact' 字样的单帧或多帧序列影像，一律自动执行整序列物理剔除，不予导出。",
  sec7_4_3: "仅保留 DICOM 属性 ImageType (0008,0008) 为 'ORIGINAL\\PRIMARY' 的原始三维断层切片，排除所有经过二次后处理、合成的三维面部重建预览图或包含敏感临床标注的二次成像，切断人脸肖像重标识路径。",
  sec7_4_4: "在去标识流出的终点站，校验 DICOM 像素尺寸、体素间距（Spacing）等空间物理常数，确保去标识操作未对原始科研矩阵施加几何形变，保证算法科研训练的科学完整性。"
};

export default function EditableSchemeForm({ project, onBack, onSaved, onRegenerate }: EditableSchemeFormProps) {
  const [isViewingInitial, setIsViewingInitial] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [showRegenerateAlert, setShowRegenerateAlert] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project>(project);

  const handleStartEditing = () => {
    setSnapshot({
      schemeTexts: { ...schemeTexts },
      appendixHospitalization: JSON.parse(JSON.stringify(appendixHospitalization)),
      appendixExamination: JSON.parse(JSON.stringify(appendixExamination)),
      appendixThoracic: JSON.parse(JSON.stringify(appendixThoracic)),
      appendixAbdominal: JSON.parse(JSON.stringify(appendixAbdominal)),
    });
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (snapshot) {
      setSchemeTexts(snapshot.schemeTexts);
      setAppendixHospitalization(snapshot.appendixHospitalization);
      setAppendixExamination(snapshot.appendixExamination);
      setAppendixThoracic(snapshot.appendixThoracic);
      setAppendixAbdominal(snapshot.appendixAbdominal);
    }
    setIsEditing(false);
  };

  const handleSaveEditing = async () => {
    setIsEditing(false);
    try {
      const res = await fetch(`/api/projects/${project.id}/scheme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeData: schemeTexts,
          schemeDocText: Object.values(schemeTexts).join("\n\n")
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setCurrentProject(data.project);
          project.schemeData = schemeTexts;
          project.schemeDocText = data.project.schemeDocText;
          project.updatedAt = data.project.updatedAt;
        }
      }
    } catch (err) {
      console.error("Failed to save scheme text update:", err);
    }
    if (onSaved) onSaved();
  };
  const [schemeTexts, setSchemeTexts] = useState<any>(() => {
    if (project.schemeData && typeof project.schemeData === "object") {
      return { ...defaultSchemeTexts, ...project.schemeData };
    }
    return defaultSchemeTexts;
  });

  // States for editable scheme parameters
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [techMeasures, setTechMeasures] = useState(techMeasuresData);
  const [mgmtMeasures, setMgmtMeasures] = useState(mgmtMeasuresData);
  const [dataComposition, setDataComposition] = useState(dataCompositionData);

  // States for appendix data lists
  const [appendixHospitalization, setAppendixHospitalization] = useState(appendixHospitalizationFieldsData);
  const [appendixExamination, setAppendixExamination] = useState(appendixExaminationFieldsData);
  const [appendixThoracic, setAppendixThoracic] = useState(appendixThoracicFieldsData);
  const [appendixAbdominal, setAppendixAbdominal] = useState(appendixAbdominalFieldsData);

  // Computed field mappings for sub-sections
  const hospitalization711Fields = appendixHospitalization.filter(item => 
    hospitalizationFieldsData.some(h => h.field === item.field)
  );
  const examination712Fields = appendixExamination.filter(item => 
    examinationFieldsData.some(h => h.field === item.field)
  );
  const abdominal721Fields = appendixAbdominal.filter(item => 
    abdominalFieldsData.some(h => h.tag === item.tag)
  );
  const thoracic722Fields = appendixThoracic.filter(item => 
    thoracicFieldsData.some(h => h.tag === item.tag)
  );
  const minimizedFields = [
    ...appendixHospitalization.map(item => ({ ...item, category: "文本数据-住院信息" })),
    ...appendixExamination.map(item => ({ ...item, category: "文本数据-检查信息" })),
    ...appendixThoracic.map(item => ({ ...item, category: "影像数据-胸部" })),
    ...appendixAbdominal.map(item => ({ ...item, category: "影像数据-腹部" }))
  ].filter(item => item.tech === "最小化删除");

  const onChangeText = async (key: string, value: string) => {
    const updatedTexts = { ...schemeTexts, [key]: value };
    setSchemeTexts(updatedTexts);

    try {
      const res = await fetch(`/api/projects/${project.id}/scheme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeData: updatedTexts,
          schemeDocText: Object.values(updatedTexts).join("\n\n")
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setCurrentProject(data.project);
          project.schemeData = updatedTexts;
          project.schemeDocText = data.project.schemeDocText;
          project.updatedAt = data.project.updatedAt;
        }
      }
    } catch (err) {
      console.error("Failed to save scheme text update:", err);
    }
  };

  const handleRestoreInitial = async () => {
    setSchemeTexts(defaultSchemeTexts);
    setIsViewingInitial(false);

    try {
      const res = await fetch(`/api/projects/${project.id}/scheme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeData: defaultSchemeTexts,
          schemeDocText: Object.values(defaultSchemeTexts).join("\n\n")
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setCurrentProject(data.project);
          project.schemeData = defaultSchemeTexts;
          project.schemeDocText = data.project.schemeDocText;
          project.updatedAt = data.project.updatedAt;
        }
      }
    } catch (err) {
      console.error("Failed to restore initial scheme:", err);
    }
  };

  const handleExportDocument = () => {
    const verLabel = isViewingInitial ? "V1.0.0 (系统内置)" : "V1.0.1 (用户自定义)";
    const activeTexts = isViewingInitial ? defaultSchemeTexts : schemeTexts;

    const hospitalizationFieldRows = hospitalizationFieldsData
      .map(f => `
        <tr>
          <td>${f.field}</td>
          <td>${f.tag}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note.replace(/\n/g, "<br/>")}</td>
        </tr>
      `).join("");

    const examinationFieldRows = examinationFieldsData
      .map(f => `
        <tr>
          <td>${f.field}</td>
          <td>${f.tag}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note.replace(/\n/g, "<br/>")}</td>
        </tr>
      `).join("");

    const abdominalRows = abdominalFieldsData
      .map(f => `
        <tr>
          <td>${f.tag}</td>
          <td>${f.field}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note}</td>
        </tr>
      `).join("");

    const thoracicRows = thoracicFieldsData
      .map(f => `
        <tr>
          <td>${f.tag}</td>
          <td>${f.field}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note}</td>
        </tr>
      `).join("");

    const appendixHospitalizationFieldRows = appendixHospitalizationFieldsData
      .map(f => `
        <tr>
          <td>${f.field}</td>
          <td>${f.tag}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note.replace(/\n/g, "<br/>")}</td>
        </tr>
      `).join("");

    const appendixExaminationFieldRows = appendixExaminationFieldsData
      .map(f => `
        <tr>
          <td>${f.field}</td>
          <td>${f.tag}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note.replace(/\n/g, "<br/>")}</td>
        </tr>
      `).join("");

    const appendixThoracicRows = appendixThoracicFieldsData
      .map(f => `
        <tr>
          <td>${f.tag}</td>
          <td>${f.field}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note}</td>
        </tr>
      `).join("");

    const appendixAbdominalRows = appendixAbdominalFieldsData
      .map(f => `
        <tr>
          <td>${f.tag}</td>
          <td>${f.field}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note}</td>
        </tr>
      `).join("");

    const documentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: "Microsoft YaHei", SimSun, sans-serif; line-height: 1.6; color: #334155; padding: 20px; }
          h1 { font-family: "Microsoft YaHei", SimHei; text-align: center; color: #1e293b; font-size: 18pt; margin-top: 20px; margin-bottom: 25px; }
          h2 { font-family: "Microsoft YaHei", SimHei; color: #2563eb; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 35px; margin-bottom: 15px; font-size: 14pt; }
          h3 { font-family: "Microsoft YaHei", SimHei; color: #1d4ed8; margin-top: 20px; margin-bottom: 10px; font-size: 11pt; }
          p { margin-bottom: 12px; font-size: 10.5pt; text-align: justify; }
          li { font-size: 10.5pt; margin-bottom: 6px; }
          .meta-box { border: 1px solid #cbd5e1; padding: 15px; background-color: #f8fafc; margin-bottom: 30px; border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; font-size: 10pt; }
          th { background-color: #f1f5f9; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #cbd5e1; }
          td { padding: 10px; border: 1px solid #cbd5e1; text-align: left; }
          .footer { text-align: center; margin-top: 60px; font-size: 9pt; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="meta-box">
          <p><strong>项目名称：</strong> ${project.name}</p>
          <p><strong>方案类型：</strong> 复旦大学附属第一医院骨科临床科研数据集匿名化方案 (版本: ${verLabel})</p>
          <p><strong>密级等级：</strong> 院内机密 (Confidential)</p>
          <p><strong>最新修改日期：</strong> ${new Date(currentProject.updatedAt || currentProject.createdAt).toLocaleDateString()}</p>
        </div>
        <h1>《复旦大学附属第一医院骨科临床科研数据集匿名化方案》</h1>
        
        <h2>1. 匿名化原则</h2>
        <p>${(activeTexts.sec1 || "").replace(/\n/g, "<br/>")}</p>
        
        <h2>2. 参考规范</h2>
        <p>${(activeTexts.sec2 || "").replace(/\n/g, "<br/>")}</p>

        <h2>3. 场景说明</h2>
        <p>${(activeTexts.sec3 || "").replace(/\n/g, "<br/>")}</p>

        <h2>4.需求分析</h2>
        <h3>4.1 数据使用需求分析</h3>
        <p>${((activeTexts.sec4_1 || activeTexts.sec4 || defaultSchemeTexts.sec4_1) || "").replace(/\n/g, "<br/>")}</p>
        
        <h3>4.2 流通场景分析</h3>
        <p>${((activeTexts.sec4_2 || defaultSchemeTexts.sec4_2) || "").replace(/\n/g, "<br/>")}</p>

        <h3>4.3 流通环境分析</h3>
        <h4>4.3.1 技术保障能力</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 70%;">技术措施</th>
              <th style="width: 30%;">具备情况</th>
            </tr>
          </thead>
          <tbody>
            ${techMeasuresData.map(item => `
              <tr>
                <td>${item.measure}</td>
                <td style="text-align: center;">${item.status}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h4>4.3.2 管理保障能力</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">管理主体</th>
              <th style="width: 55%;">技术措施</th>
              <th style="width: 20%;">具备情况</th>
            </tr>
          </thead>
          <tbody>
            ${mgmtMeasuresData.map((item, idx) => {
              const isFirstInGroup = idx === 0 || mgmtMeasuresData[idx - 1].subject !== item.subject;
              let groupCount = 1;
              if (isFirstInGroup) {
                for (let i = idx + 1; i < mgmtMeasuresData.length; i++) {
                  if (mgmtMeasuresData[i].subject === item.subject) groupCount++;
                  else break;
                }
              }
              return `
                <tr>
                  ${isFirstInGroup ? `<td rowspan="${groupCount}">${item.subject}</td>` : ''}
                  <td>${item.measure}</td>
                  <td style="text-align: center;">${item.status}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <h2>5. 数据范围</h2>
        <h3>5.1 数据构成</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 30%;">数据类别</th>
              <th style="width: 70%;">数据内容</th>
            </tr>
          </thead>
          <tbody>
            ${dataCompositionData.map(item => `
              <tr>
                <td>${item.category}</td>
                <td>${item.content}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h3>5.2 数据属性分类</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">数据属性</th>
              <th style="width: 20%;">数据分类</th>
              <th style="width: 25%;">数据字段</th>
              <th style="width: 15%;">数据标签</th>
              <th style="width: 20%;">处理必要性</th>
            </tr>
          </thead>
          <tbody>
            ${dataAttributeSplittingData.map((item, idx) => {
              const isFirstGroup = idx === 0 || (
                dataAttributeSplittingData[idx - 1].attr !== item.attr || 
                dataAttributeSplittingData[idx - 1].necessity !== item.necessity
              );
              let groupCount = 1;
              if (isFirstGroup) {
                for (let i = idx + 1; i < dataAttributeSplittingData.length; i++) {
                  if (
                    dataAttributeSplittingData[i].attr === item.attr && 
                    dataAttributeSplittingData[i].necessity === item.necessity
                  ) {
                    groupCount++;
                  } else {
                    break;
                  }
                }
              }
              return `
                <tr>
                  ${isFirstGroup ? `<td rowspan="${groupCount}">${item.attr}</td>` : ''}
                  <td>${item.category}</td>
                  <td>${item.field}</td>
                  <td style="text-align: center;">${item.tag}</td>
                  ${isFirstGroup ? `<td rowspan="${groupCount}">${item.necessity}</td>` : ''}
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <h2>6. 处理目标</h2>
        <p>${(activeTexts.sec6 || "").replace(/\n/g, "<br/>")}</p>

        <h2>7. 匿名化处理技术说明</h2>
        <h3>7.1 结构化文本数据匿名化</h3>
        <p>${(activeTexts.sec7_1 || "").replace(/\n/g, "<br/>")}</p>
        
        <h4>7.1.1 住院信息</h4>
        <p>涉及使用的方法包括：<br/>
属性删除：如记录内容中的患者姓名、医生姓名等；<br/>
假名化：如患者标识号、就诊号；<br/>
泛化：如记录内容中的年龄等；<br/>
扰动：如就诊时间等。以下列举部分结构化文本数据字段的匿名化技术方法：</p>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">数据字段</th>
              <th style="width: 15%;">数据标签</th>
              <th style="width: 20%;">数据属性</th>
              <th style="width: 15%;">匿名化技术</th>
              <th style="width: 30%;">说明</th>
            </tr>
          </thead>
          <tbody>
            ${hospitalizationFieldRows}
          </tbody>
        </table>

        <h4>7.1.2 检查信息</h4>
        <p>涉及使用的方法包括：<br/>
假名化：如患者标识号、就诊号；<br/>
扰动：如记录时间等。以下列举部分结构化文本数据字段的匿名化技术方法：</p>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">数据字段</th>
              <th style="width: 15%;">数据标签</th>
              <th style="width: 20%;">数据属性</th>
              <th style="width: 15%;">匿名化技术</th>
              <th style="width: 30%;">说明</th>
            </tr>
          </thead>
          <tbody>
            ${examinationFieldRows}
          </tbody>
        </table>
        
        <h3>7.2 影像数据</h3>
        <p>${(activeTexts.sec7_2 || "").replace(/\n/g, "<br/>")}</p>
        
        <h4>7.2.1 腹部</h4>
        <p>涉及使用的方法包括：<br/>
属性删除：如Implementation Class UID、Implementation Version Name等；<br/>
假名化：如Media Storage SOP Class UID、Media Storage SOP Instance UID、SOP Instance UID等。以下列举DICOM数据标签匿名化技术方法：</p>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">TAG</th>
              <th style="width: 25%;">数据字段</th>
              <th style="width: 15%;">数据属性</th>
              <th style="width: 15%;">匿名化技术</th>
              <th style="width: 25%;">说明</th>
            </tr>
          </thead>
          <tbody>
            ${abdominalRows}
          </tbody>
        </table>

        <h4>7.2.2 胸部</h4>
        <p>涉及使用的方法包括：<br/>
属性删除：如Source Application Entity Title等；<br/>
假名化：如Media Storage SOP Class UID、Media Storage SOP Instance UID、SOP Instance UID等；<br/>
扰动：如Study Date。以下列举DICOM数据标签匿名化技术方法：</p>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">TAG</th>
              <th style="width: 25%;">数据字段</th>
              <th style="width: 15%;">数据属性</th>
              <th style="width: 15%;">匿名化技术</th>
              <th style="width: 25%;">说明</th>
            </tr>
          </thead>
          <tbody>
            ${thoracicRows}
          </tbody>
        </table>

        <h3>7.3 图像数据</h3>
        <p>${(activeTexts.sec7_3 || "").replace(/\n/g, "<br/>")}</p>

        <h3>7.4 特殊匿名化说明</h3>
        <p><strong>7.4.1 结构化文本与DICOM影像关联说明</strong>：${(activeTexts.sec7_4_1 || "").replace(/\n/g, "<br/>")}</p>
        <p><strong>7.4.2 排除“剂量页序列”影像文件</strong>：${(activeTexts.sec7_4_2 || "").replace(/\n/g, "<br/>")}</p>
        <p><strong>7.4.3 匿名化影像一致性校验</strong>：${(activeTexts.sec7_4_4 || "").replace(/\n/g, "<br/>")}</p>

        <h3>7.5 数据最小化处理方案</h3>
        <p>a）拟删除属性（与流通目的无关）：<br/>科室<br/>b）最小化删除时间点：在匿名化处理时完成</p>

        <h2>8. 附录</h2>

        <h3>8.1 结构化文本数据</h3>

        <h4>8.1.1 住院信息</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">数据字段</th>
              <th style="width: 15%;">数据标签</th>
              <th style="width: 20%;">数据属性</th>
              <th style="width: 15%;">匿名化技术</th>
              <th style="width: 30%;">说明</th>
            </tr>
          </thead>
          <tbody>
            ${appendixHospitalizationFieldRows}
          </tbody>
        </table>

        <h4>8.1.2 检查信息</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">数据字段</th>
              <th style="width: 15%;">数据标签</th>
              <th style="width: 20%;">数据属性</th>
              <th style="width: 15%;">匿名化技术</th>
              <th style="width: 30%;">说明</th>
            </tr>
          </thead>
          <tbody>
            ${appendixExaminationFieldRows}
          </tbody>
        </table>

        <h3>8.2 影像数据</h3>

        <h4>8.2.1 腹部</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">TAG</th>
              <th style="width: 25%;">数据字段</th>
              <th style="width: 15%;">数据属性</th>
              <th style="width: 15%;">匿名化技术</th>
              <th style="width: 25%;">说明</th>
            </tr>
          </thead>
          <tbody>
            ${appendixAbdominalRows}
          </tbody>
        </table>

        <h4>8.2.2 胸部</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">TAG</th>
              <th style="width: 25%;">数据字段</th>
              <th style="width: 15%;">数据属性</th>
              <th style="width: 15%;">匿名化技术</th>
              <th style="width: 25%;">说明</th>
            </tr>
          </thead>
          <tbody>
            ${appendixThoracicRows}
          </tbody>
        </table>

        <div class="footer">
          此方案由 复旦大学附属第一医院 联合 医疗健康数据智能匿名化平台 安全审核组共同备案执行
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + documentHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `医疗脱敏方案_${project.name.replace(/\s+/g, '_')}_${verLabel}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedTexts = isViewingInitial ? defaultSchemeTexts : schemeTexts;
  const isReadOnly = isViewingInitial || !isEditing;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="anonymization_scheme_view_root">
      
      {/* Header breadcrumbs - Styled exactly like AnonymizationScheme */}
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
              <span className="text-blue-600 font-bold">匿名化方案</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">匿名化方案</h1>
          </div>
        </div>
      </div>

      {/* 2-Column layout: Sidebar TOC on left + Centered clean Paper-style Document Viewer on right */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 items-start" id="anonymization_scheme_main_layout">
        
        {/* Left Column: Outline / TOC */}
        <div className="lg:col-span-1 hidden lg:block sticky top-6">
          <div className="bg-white rounded-xl border-2 border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>目录</span>
            </h3>
            <nav className="space-y-0.5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
              {[
                { id: "sec_principles", label: "1. 匿名化原则", level: 1 },
                { id: "sec_norms", label: "2. 参考规范", level: 1 },
                { id: "sec_scenarios", label: "3. 使用场景说明", level: 1 },
                { id: "sec_requirements", label: "4. 需求分析", level: 1 },
                { id: "sec_4_1", label: "4.1 数据使用需求分析", level: 2 },
                { id: "sec_4_2", label: "4.2 流通场景分析", level: 2 },
                { id: "sec_4_3", label: "4.3 流通环境分析", level: 2 },
                { id: "sec_4_3_1", label: "4.3.1 技术保障能力", level: 3 },
                { id: "sec_4_3_2", label: "4.3.2 管理保障能力", level: 3 },
                { id: "sec_scope", label: "5. 数据范围", level: 1 },
                { id: "sec_5_1", label: "5.1 数据构成", level: 2 },
                { id: "sec_5_2", label: "5.2 数据属性分类", level: 2 },
                { id: "sec_targets", label: "6. 处理目标", level: 1 },
                { id: "sec_anonym_tech", label: "7. 匿名化处理技术", level: 1 },
                { id: "sec_text_anonym", label: "7.1 结构化文本数据", level: 2 },
                { id: "sec_7_1_1", label: "7.1.1 住院信息", level: 3 },
                { id: "sec_7_1_2", label: "7.1.2 检查信息", level: 3 },
                { id: "sec_dicom_anonym", label: "7.2 影像数据", level: 2 },
                { id: "sec_7_2_1", label: "7.2.1 腹部", level: 3 },
                { id: "sec_7_2_2", label: "7.2.2 胸部", level: 3 },
                { id: "sec_img_anonym", label: "7.3 图像数据", level: 2 },
                { id: "sec_special_anonym", label: "7.4 特殊匿名化说明", level: 2 },
                { id: "sec_7_4_1", label: "7.4.1 结构化文本与DICOM影像关联说明", level: 3 },
                { id: "sec_7_4_2", label: "7.4.2 排除“剂量页序列”影像文件", level: 3 },
                { id: "sec_7_4_3", label: "7.4.3 匿名化影像一致性校验", level: 3 },
                { id: "sec_minimal_delete", label: "7.5 数据最小化处理方案", level: 2 },
                { id: "sec_fields_list", label: "8. 附录", level: 1 },
                { id: "sec_8_1", label: "8.1 结构化文本数据", level: 2 },
                { id: "sec_8_1_1", label: "8.1.1 住院信息", level: 3 },
                { id: "sec_8_1_2", label: "8.1.2 检查信息", level: 3 },
                { id: "sec_8_2", label: "8.2 影像数据", level: 2 },
                { id: "sec_8_2_1", label: "8.2.1 腹部", level: 3 },
                { id: "sec_8_2_2", label: "8.2.2 胸部", level: 3 },
              ].map(item => {
                const paddingLeft = item.level === 1 ? 'pl-2' : item.level === 2 ? 'pl-5' : 'pl-8';
                const fontWeight = item.level === 1 ? 'font-bold text-slate-800' : item.level === 2 ? 'font-semibold text-slate-700' : 'font-medium text-slate-500';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('bg-blue-50/50');
                        setTimeout(() => el.classList.remove('bg-blue-50/50'), 1500);
                      }
                    }}
                    className={`w-full text-left pr-2 py-1.5 text-[11px] ${paddingLeft} ${fontWeight} hover:text-blue-600 hover:bg-slate-50 rounded transition-all truncate block cursor-pointer`}
                    title={item.label}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Column: Paper-style Document Viewer */}
        <div className="lg:col-span-3 w-full">
          {isViewingInitial && (
            <div className="mb-6 bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-bold shadow-xs animate-fade-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span>您当前正在预览【初始版匿名化方案】，不支持编辑，您可以导出此版本，或将方案恢复至初始版内容。</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleRestoreInitial}
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black transition-all cursor-pointer flex items-center space-x-1 shadow-3xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>恢复初始内容</span>
                </button>
                <button
                  onClick={() => setIsViewingInitial(false)}
                  className="py-1.5 px-3 bg-slate-600 hover:bg-slate-700 text-white rounded text-[10px] font-black transition-all cursor-pointer shadow-3xs"
                >
                  返回最新版
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-8 md:p-12 relative overflow-hidden" id="scheme_paper_document">
              
              {/* Watermark/Seal effect on top-right */}
              <div className="absolute top-6 right-6 opacity-10 select-none pointer-events-none transform rotate-12 hidden sm:block">
                <Shield className="w-32 h-32 text-blue-900" />
              </div>

              {/* Document Header Metadata with action buttons to the right */}
              <div className="border-b-2 border-slate-100 pb-6 mb-8 text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    《复旦大学附属第一医院骨科临床科研数据集匿名化方案》
                  </h2>
                  {!isEditing && (
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500">创建时间</span>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mt-0.5">
                          <span className="text-slate-800 font-black text-xs">
                            {project.createdAt ? project.createdAt : "-"}
                          </span>
                          {!isViewingInitial ? (
                            <button
                              type="button"
                              onClick={() => setIsViewingInitial(true)}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center space-x-1 text-[11px] font-bold"
                              title="查看系统内置的初始合规脱敏方案"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>查看初始版方案</span>
                            </button>
                          ) : (
                            <span className="text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-bold animate-pulse">
                              正在查看初始版
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500">更新时间</span>
                        <span className="text-slate-950 block mt-0.5 font-black text-xs font-mono">
                          {currentProject.updatedAt ? currentProject.updatedAt : "-"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Moved Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 self-end md:mb-1">
                  {!isEditing ? (
                    <>
                      {onRegenerate && !isViewingInitial && (
                        <button
                          onClick={() => setShowRegenerateAlert(true)}
                          className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-slate-900 px-4 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                          id="regenerate_scheme_btn"
                        >
                          <RefreshCw className="w-4 h-4 text-blue-600" />
                          <span>重新生成方案</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleExportDocument()}
                        className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-950 text-white border-2 border-slate-900 px-4 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        id="export_active_scheme_btn"
                      >
                        <Download className="w-4 h-4" />
                        <span>导出方案文档 (.doc)</span>
                      </button>

                      {!isViewingInitial && (
                        <button
                          onClick={handleStartEditing}
                          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 px-4 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                          id="edit_active_scheme_btn"
                        >
                          <Pencil className="w-4 h-4" />
                          <span>编辑</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveEditing}
                        className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        id="save_active_scheme_btn"
                      >
                        <Save className="w-4 h-4 text-white" />
                        <span>保存</span>
                      </button>

                      <button
                        onClick={handleCancelEditing}
                        className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                        id="cancel_active_scheme_btn"
                      >
                        <X className="w-4 h-4" />
                        <span>取消</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <DefaultRequirementLayout 
                schemeTexts={displayedTexts} 
                onChangeText={onChangeText} 
                readOnly={isReadOnly}
                projectName={project.name}
                isGlobalEditing={isGlobalEditing}
                techMeasures={techMeasures}
                setTechMeasures={setTechMeasures}
                mgmtMeasures={mgmtMeasures}
                setMgmtMeasures={setMgmtMeasures}
                dataComposition={dataComposition}
                setDataComposition={setDataComposition}
                dataAttributeSplittingData={dataAttributeSplittingData}
                hospitalization711Fields={hospitalization711Fields}
                examination712Fields={examination712Fields}
                abdominal721Fields={abdominal721Fields}
                thoracic722Fields={thoracic722Fields}
                minimizedFields={minimizedFields}
                appendixHospitalization={appendixHospitalization}
                setAppendixHospitalization={setAppendixHospitalization}
                appendixExamination={appendixExamination}
                setAppendixExamination={setAppendixExamination}
                appendixThoracic={appendixThoracic}
                setAppendixThoracic={setAppendixThoracic}
                appendixAbdominal={appendixAbdominal}
                setAppendixAbdominal={setAppendixAbdominal}
              />

          </div>
        </div>
      </div>

      {showRegenerateAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-slate-900 rounded-xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-200 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-slate-900">提示说明</h3>
                <p className="text-xs text-slate-600 font-bold leading-relaxed mt-2">
                  由于原型的数据问题，此按钮不做交互仅做说明，具体说明详见PRD对应内容
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenerateAlert(false)}
                className="bg-slate-900 hover:bg-slate-950 text-white border-2 border-slate-900 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

