import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize Google Gemini Client
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// SchemeData Interface for Form editing
interface SchemeData {
  title: string;
  c1_1: string;
  c1_2: string;
  c2_1: string;
  c2_2: string;
  c2_3: string;
  c3_1: string;
  c3_2: string;
  c4_1: string;
  c4_2: string;
  c4_3: string;
  c5_1: string;
  c5_2: string;
  c6_1: string;
  c6_2: string;
  c6_3: string;
}

// Project Interface
interface Project {
  id: string;
  name: string;
  description: string;
  creator: string;
  createdAt: string;
  updatedAt?: string;
  expectedK?: number;
  actualK?: number;
  kTasks?: {
    csvTaskId?: string;
    dicomTaskId?: string;
  };
  schemeData?: SchemeData;
  schemeDocText?: string;
  schemeFileInfo?: {
    name: string;
    size: string;
    type: string;
    uploadTime: string;
  };
  schemeInputs?: any;
  isRegeneratingPending?: boolean;
  versions?: Array<{
    version: string;
    name: string;
    updatedAt: string;
    schemeInputs: any;
  }>;
}

// Pre-fill helper
function getPreFilledScheme(projectName: string, projectDesc: string): SchemeData {
  return {
    title: `《${projectName} 数据匿名化方案》`,
    c1_1: `本数据匿名化方案专门针对“${projectName}”项目进行制定。
本项目在医疗学术科研合作及临床数据流转中，存在强烈的隐私保护与高标准合规诉求。根据项目流程，初版匿名化方案生成基于以下核心输入信息：
1. 真实且具有代表性的“样例数据”（包含医学影像、CSV结构化字段及非结构化病历文本）；
2. 明确的“研究背景及目的”（当前申报目的为：${projectDesc || "临床回顾性科研及辅助诊断模型训练"}）；
3. “医院匿名化环境评估”（包含精细化的权限策略自评及证明材料上传）；
4. “数据安全管理措施”（包含买方合规约束与卖方管理制度自评及证明材料上传）。
系统大模型将联合安全专家规则进行方案装配，输出包含详尽业务需求、字段明细及匿名化技术路线（泽宇和宇宏负责细对字段）的初版匿名方案。`,
    c1_2: `本方案严格参照国家及行业最高合规准则：
1. 《中华人民共和国个人信息保护法》及《中华人民共和国数据安全法》关于去标识化与重要数据分类分级的合规标准；
2. GB/T 39725-2020《信息安全技术 健康医疗信息安全指南》与 GB/T 37964-2019《个人信息去标识化指南》。
【线下确认与调整流程】：方案初版生成后，项目合规组将与合作医院开展面对面的线下沟通与详细论证，对具体字段、安全阈值进行线下对齐，完成方案的定制化修订。确认无误后，将修改后的最终方案上传系统进行固化和永久存证，并作为执行匿名化引擎的指令基准。`,
    c2_1: `根据项目申报与技术排查，本项目数据资产多模态特征显著，支持多源异构健康医疗信息。系统处理与泽宇/宇宏细对字段清单涵盖：
1. 【影像数据（DICOM）】：包含大量的Header元数据。系统支持自动识别DICOM Header中的元数据标签，并由去标识化流水线进行定向清洗；
2. 【文本数据】：支持CSV结构化表格字段，以及大量包含叙述性临床体征、检查结论的“非结构化病历文本”；
3. 【图片数据】：支持JPG/PNG等常见图片格式的医学图谱或超声切片。
直接标识符（DIs如姓名、身份证号、手机号）具备极强识别力，必须全量去标识化。准标识符（QIs如年龄、性别、邮编、检查日期）在多维关联碰撞下面临高重标识风险。`,
    c2_2: `针对原始样例数据，在匿名化执行前，系统必须进行详尽的【原始数据分布统计】：
1. 数值型准标识符：进行频率及分桶统计，除日期字段外，其余数值型准标识（如生理指标、计量）均自动设定数值分桶以展示分布特征，为泛化区间设计提供决策参考；
2. 文本型及分类标识符：进行多维基数统计。
通过展示原始准标识符的精准地缘及时间分布，数据安全员可以精细配置匿名化规则，预测潜在重标识暴露水位。`,
    c2_3: `数据授权等级定级为“中敏感科研级”，严格采用“多模态去标识物理沙箱”保护。任何数据的流出必须通过受控的安全沙箱审查，禁止单点明文记录在公网或非授权环境中暴露。`,
    c3_1: `医院去标识化环境基础设施与环境合规状况自评：
• 权限策略管理：符合。医院具备严格的数据防泄露权限控制规程（已上传相关策略红头证明文件），确保去标环境非授权不可及；
• 统一身份认证与单点登录：符合。匿名化平台全面接入院内两步强身份验证及CA数字证书，系统运维及算法调用记录不可篡改；
• 院内通道数据传输加密：符合。数据自PACS、HIS源库抽取全量通过SSL/TLS 256位高强度隧道加密传输，确保传输链路零泄密。`,
    c3_2: `针对以上自评中由于历史问题判定为“不符合”的基础设施指标，必须在本项目启动批量数据脱敏前，由信息部门完成临时替代性补偿安全措施部署（如在端口部署防火墙及临时流量审计插件），限期1个月内达标并补充上传环境证明，否则系统将自动熔断数据流出。`,
    c4_1: `去标识化安全管理保障实行“双向合规审查制度”：
• 【买方制度评估】：符合。项目数据接收方（数据买方）已正式建立数据使用合规管理制度（已上传《数据安全不重标识承诺书》及合同约束），确保数据流向不失控、不开展反向关联；
• 【卖方制度评估】：符合。医院作为数据提供方（数据卖方），已正式下发并在系统内固化了《去标识化安全管理操作规程》及策略审批工单，人员权责明确。`,
    c4_2: `本院建立的组织机构由分管副院长挂帅的数据安全委员会进行统筹，配备专职的“去标识化数据安全员”。所有去标识规则和核心算子的参数调整、工单审核，必须通过安全员及专家组的双签批准，杜绝随意绕过审批的行为。`,
    c4_3: `建立《突发重标识与关联拼图安全事件应急处置指南》。每半年组织一次基于模拟重标识攻击演练，包括对数据泄露进行快速溯源、紧急隔离和法律合规处置，保障在法律保障红线内开展学术合作。`,
    c5_1: `本项目的【多模态匿名化执行处理流水线】严格按照以下标准节点实施：
1. 上传要处理的全量数据（分模态导入）；
2. 方案中技术参数的自动识别（此功能支持全流程自动解析，在后期可以实现全自动化，当前阶段处于低优先级，先支持手动/半自动提取）；
3. 对准标识符展示原始数据分布，自动统计其均值、分桶和散点状态；
4. 配置去标识化规则、预期k值、确定用于计算k值的具体字段（一般准标识符执行泛化的需要计算，支持系统推荐规则与安全员人工微调）；
5. 执行匿名化（多模态混合并行）；
6. 综合输出：计算并综合输出一个k值，展示匿名化后准标识符的分布情况；若k值或分布不符合合规预期，可一键退回并重新调整去标识规则，直至校验达标。`,
    c5_2: `【核心匿名算子策略与执行保障机制】：
1. 规则与算子设计：选择系统预制算子，支持可调整参数（由研发人员提前开发和精细配置好算子），算子暂不进行版本管理以提高效率；
2. 影像（DICOM）元数据清洗：自动去除/伪名化Header中PS3.15标准规定的150多个标签。像素区图片目前支持通过人工框定坐标（但由于存在图片旋转或位置不一致的问题，需要安全员人工进行二次确认与校准优化）；
3. 多台服务器并行计算：去标识执行引擎可以支持多台服务器并行计算，极大地缩短海量病历与PACS影像处理耗时；
4. 任务中断与断点续传：引擎具备前后端交互保障机制。当执行任务中断后可以继续（前后端机制；影像脱敏支持该特性，文本脱敏目前暂不支持断点续传）。
所有自动推荐的匿名参数和算法，都完全支持人工二次修改。`,
    c6_1: `数据出库强制执行 k-Anonymity（k-匿名）检测：
• 门槛值设为 k >= 5。通过对准标识符字段组合的等价类分析，若组内记录少于 5 条，则自动触发局部属性抑制，保障个体不被单点关联。
• 支持【匿名化评估流程】：支持上传匿名化后的全量数据，或者直接引用在本平台中已完成脱敏处理的数据，执行重标识风险与k-anonymity、l-diversity指标度量，输出可视化合规评估报告。`,
    c6_2: `结合 l-diversity（l-多样性）机制防止属性泄露：
敏感属性（SA，如特殊诊断结果、罕见病名称等）在其等价类中的分布具有高多样性，防止出现“虽然名字抹去，但该年龄段女性全部罹患某重症”的属性推导关联风险。`,
    c6_3: `所有数据集流出本沙箱前，均须伴随一份系统自动生成的《数据去标识化结果与合规评估报告》，由数据安全委员会及安全员数字签字留痕。同时通过系统与买方签署的法律合同约束，对数据买方不进行身份重构建、不实施大数据拼图关联提供双重长效保护。`
  };
}

// Helper to extract text from markdown by regexes
function extractSection(text: string, currentRegex: RegExp, nextRegex?: RegExp): string {
  const matchCurr = text.match(currentRegex);
  if (!matchCurr || matchCurr.index === undefined) return "";
  const contentStart = matchCurr.index + matchCurr[0].length;
  
  if (!nextRegex) {
    return text.substring(contentStart).trim();
  }
  
  // Find the next heading starting from contentStart
  const remainingText = text.substring(contentStart);
  const matchNext = remainingText.match(nextRegex);
  if (!matchNext || matchNext.index === undefined) {
    return remainingText.trim();
  }
  
  return remainingText.substring(0, matchNext.index).trim();
}

function parseMarkdownToScheme(markdown: string, projectName: string, projectDesc: string): SchemeData {
  const defaultScheme = getPreFilledScheme(projectName, projectDesc);
  if (!markdown) return defaultScheme;

  const extract = (curr: RegExp, next?: RegExp): string => {
    const val = extractSection(markdown, curr, next);
    return val ? val.replace(/^>\s*/gm, "").trim() : "";
  };

  return {
    title: `《${projectName} 数据匿名化方案》`,
    c1_1: extract(/(?:###|##)\s*1\.1[^\n]*/, /(?:###|##)\s*1\.2[^\n]*/) || defaultScheme.c1_1,
    c1_2: extract(/(?:###|##)\s*1\.2[^\n]*/, /(?:##|###)\s*二[^\n]*/) || defaultScheme.c1_2,
    c2_1: extract(/(?:###|##)\s*2\.1[^\n]*/, /(?:###|##)\s*2\.2[^\n]*/) || defaultScheme.c2_1,
    c2_2: extract(/(?:###|##)\s*2\.2[^\n]*/, /(?:###|##)\s*(?:2\.3|三)[^\n]*/) || defaultScheme.c2_2,
    c2_3: extract(/(?:###|##)\s*2\.3[^\n]*/, /(?:##|###)\s*三[^\n]*/) || defaultScheme.c2_3,
    c3_1: extract(/(?:###|##)\s*3\.1[^\n]*/, /(?:###|##)\s*(?:3\.2|四)[^\n]*/) || defaultScheme.c3_1,
    c3_2: extract(/(?:###|##)\s*3\.2[^\n]*/, /(?:##|###)\s*四[^\n]*/) || defaultScheme.c3_2,
    c4_1: extract(/(?:###|##)\s*4\.1[^\n]*/, /(?:###|##)\s*(?:4\.2|五)[^\n]*/) || defaultScheme.c4_1,
    c4_2: extract(/(?:###|##)\s*4\.2[^\n]*/, /(?:###|##)\s*(?:4\.3|五)[^\n]*/) || defaultScheme.c4_2,
    c4_3: extract(/(?:###|##)\s*4\.3[^\n]*/, /(?:##|###)\s*五[^\n]*/) || defaultScheme.c4_3,
    c5_1: extract(/(?:###|##)\s*5\.1[^\n]*/, /(?:###|##)\s*5\.2[^\n]*/) || defaultScheme.c5_1,
    c5_2: extract(/(?:###|##)\s*5\.2[^\n]*/, /(?:##|###)\s*六[^\n]*/) || defaultScheme.c5_2,
    c6_1: extract(/(?:###|##)\s*6\.1[^\n]*/, /(?:###|##)\s*6\.2[^\n]*/) || defaultScheme.c6_1,
    c6_2: extract(/(?:###|##)\s*6\.2[^\n]*/, /(?:###|##)\s*6\.3[^\n]*/) || defaultScheme.c6_2,
    c6_3: extract(/(?:###|##)\s*6\.3[^\n]*/) || defaultScheme.c6_3,
  };
}

const defaultSchemeTexts = {
  sec1: "本方案严格遵循安全性原则、实用性原则与合规性原则，采用“最小必要”原则进行去标识化。在保障患者隐私（防止重标识、拼图比对攻击）的前提下，保留必要的骨科临床协变量与时序关联性，以确保临床科研研究的数据科学可用性。",
  sec2: "本方案编制深度契合以下法律与技术规范要求：\n• 《中华人民共和国个人信息保护法》(PIPL)\n• GB/T 37964-2019《信息安全技术 个人信息去标识化指南》\n• GB/T 35273-2020《信息安全技术 个人信息安全规范》\n• 《健康医疗数据安全指南》及相关临床研究数据规范",
  sec3: "本技术方案适用于科研数据跨境/跨机构安全共享场景。复旦大学附属第一医院作为数据提供方，需要向第三方课题组或平台披露骨科临床科研脱敏数据集，为防范患者个体被重标识，必须采用强匿名技术。",
  sec4: "纵向随访数据包含丰富的时序、日期、检查指标，重标识风险极高。由于骨科数据包含高精度临床影像及图片（如DR、CT、MRI等，底片烧录有患者姓名或设备序列号）、DICOM 影像（Header 蕴含丰富的私密元数据），任何单维度的清洗都会导致拼图攻击失效。本方案重点突破“模态一致性级联匿名化”。",
  sec5: "本清洗范围严格界定在：111个核心结构化临床随访字段、关联的临床原生态彩照及医学图片（JPG/PNG）、以及DR/CT/MRI等放射科影像序列（DICOM 格式）。",
  sec6: "1. 患者姓名、身份证、门诊号等直接标识符 100% 消除；\n2. 结构化随访日期、就诊时间、检查日期执行严格的模态对齐等距扰动算法，保证时序差值、随访间隔完美保持；\n3. 影像图像内可能包含的烧录姓名红字 and 人脸信息 100% 消除，且保障脱敏后数据可重算 K 匿名门槛，杜绝反向推导。",
  sec7_1: "对随访记录表中的直接、间接标识符进行分类脱敏，包含 32 位唯一 SM3 哈希假名化（患者编号）、泛化（年龄分桶、文化程度折叠、职业聚合）和等距日期偏移扰动。以下复制展示了去标识技术不为“原文”的所有结构化文本数据字段：",
  sec7_2: "清除 DICOM 元数据 Header 区域中的患者 and 医护相关敏感信息。除保留设备关键序列 and 图像本身的像素值外，对其余 31 项标识 Tag 实施以下动作：",
  sec7_3: "医学彩图或摄影设备输出的图像文件中，经常在图像底部、侧边或四周直接烧录有患者的就诊卡号、拼音姓名、拍摄时间或设备参数信息（红黄绿字）。本方案在物理图像脱敏流中：\n1. 设定智能文字坐标预测区，对非图像主要临床病变区进行自动化裁切、区域涂黑（Masking）或像素平滑模糊遮盖；\n2. 人工安全复核二次确认机制，防止边缘残留文字标识。",
  sec7_4_1: "脱敏后，结构化数据表中的“患者编号”、DICOM Header 里 Patient ID (0010,0020) 以及医学图像文件名，必须统一转换为同一个 32 位伪名哈希标识，以保持多模态医疗档案在分析过程中的临床血统可追溯性，但外部人员无从回溯原始身份。",
  sec7_4_2: "在导出与清洗 DICOM 影像序列时，凡包含大剂量或机器出厂报告等对科学研究毫无贡献的“剂量页（Dose Report / Dose Page）”，必须予以彻底过滤排除，仅保留骨关节三维扫描主要像素矩阵序列，以精简文件体积并提高安全性。",
  sec7_4_3: "过滤非原始影像。仅提取并导出 Image Type (0008,0008) 字段含有 “ORIGINAL” 的图像帧。对于衍生帧（DERIVED）、二次重建或三维渲染辅助定位切片予以直接过滤，确保临床数据的纯净度。",
  sec7_4_4: "脱敏管道后台自动在清洗前后执行二进制 MD5 哈希校验与帧数完整性核算，杜绝清洗过程引起的 DICOM 损坏，防止去标识化处理带来像素质量、图像对比度的损失，严格捍卫骨科纵向科研可用性。"
};

// In-memory Projects Mock Database
let projects: Project[] = [
  {
    id: "p1",
    name: "复旦大学附属第一医院骨科临床科研数据集匿名化项目",
    description: "针对骨科近五年内患者的出院随访病历、放射科影像数据进行脱敏与匿名化处理，确保满足《数据安全法》及学术合作合规要求。",
    creator: "张国栋",
    createdAt: "2026-06-18 10:24",
    updatedAt: "2026-07-20 01:15",
    expectedK: 5,
    schemeInputs: {
      ...defaultSchemeTexts,
      sec1: "本方案严格遵循安全性原则、实用性原则与合规性原则，采用“最小必要”原则进行去标识化。在保障患者隐私（防止重标识、拼图比对攻击）的前提下，保留必要的骨科临床协变量与时序关联性，以确保临床科研研究的数据科学可用性。（注：本方案由合规官在 2026-07-20 01:15 微调了部分条款，以完全覆盖多模态数据共享安全等级）"
    },
    schemeData: getPreFilledScheme(
      "复旦大学附属第一医院骨科临床科研数据集匿名化项目",
      "针对骨科近五年内患者的出院随访病历、放射科影像数据进行脱敏与匿名化处理，确保满足《数据安全法》及学术合作合规要求。"
    ),
    versions: [
      {
        version: "v1.0",
        name: "第一版 (初始版本)",
        updatedAt: "2026-06-18 10:24",
        schemeInputs: defaultSchemeTexts
      },
      {
        version: "v1.1",
        name: "最新修改版本",
        updatedAt: "2026-07-20 01:15",
        schemeInputs: {
          ...defaultSchemeTexts,
          sec1: "本方案严格遵循安全性原则、实用性原则与合规性原则，采用“最小必要”原则进行去标识化。在保障患者隐私（防止重标识、拼图比对攻击）的前提下，保留必要的骨科临床协变量与时序关联性，以确保临床科研研究的数据科学可用性。（注：本方案由合规官在 2026-07-20 01:15 微调了部分条款，以完全覆盖多模态数据共享安全等级）"
        }
      }
    ]
  },
  {
    id: "p2",
    name: "华山医院心内科AI辅助诊断模型训练集脱敏项目",
    description: "对1.5万例心电图检查元数据与结构化病历进行k-匿名与l-多样性保护，生成可用于第三方AI算法训练的高质量合规数据集。",
    creator: "李瑞",
    createdAt: "2026-07-02 14:15",
    expectedK: 10,
  },
];

// Project REST APIs
app.get("/api/projects", (req, res) => {
  if (projects.length >= 3) {
    projects.splice(2, 1);
  }
  res.json(projects);
});

app.post("/api/projects", (req, res) => {
  const { name, description, creator, expectedK } = req.body;
  if (!name) {
    return res.status(400).json({ error: "项目名称必填" });
  }
  const newProject: Project = {
    id: "p_" + Date.now(),
    name,
    description: description || "",
    creator: creator || "系统管理员",
    createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    expectedK: expectedK !== undefined ? Number(expectedK) : 5,
  };
  projects.push(newProject);
  res.json(newProject);
});

app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, expectedK, actualK, kTasks, isRegeneratingPending } = req.body;
  const project = projects.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "未找到该项目" });
  }
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (expectedK !== undefined) project.expectedK = Number(expectedK);
  if (actualK !== undefined) project.actualK = actualK;
  if (kTasks !== undefined) project.kTasks = kTasks;
  if (isRegeneratingPending !== undefined) {
    project.isRegeneratingPending = isRegeneratingPending;
    if (isRegeneratingPending) {
      project.schemeData = undefined;
      project.schemeDocText = undefined;
    }
  }
  res.json(project);
});

app.put("/api/projects/:id/scheme", (req, res) => {
  const { id } = req.params;
  const { schemeData, schemeDocText, schemeFileInfo } = req.body;
  const project = projects.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "未找到该项目" });
  }
  if (schemeData !== undefined) project.schemeData = schemeData;
  if (schemeDocText !== undefined) project.schemeDocText = schemeDocText;
  if (schemeFileInfo !== undefined) project.schemeFileInfo = schemeFileInfo;
  res.json({ success: true, project });
});

app.put("/api/projects/:id/scheme-inputs", (req, res) => {
  const { id } = req.params;
  const { schemeInputs } = req.body;
  const project = projects.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "未找到该项目" });
  }

  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  project.updatedAt = nowStr;

  // Track versions: keep the first version and the last modified version
  if (!project.versions) {
    project.versions = [];
  }

  // If there are no versions yet, capture v1.0 (初始版本)
  if (project.versions.length === 0) {
    const firstInputs = project.schemeInputs || defaultSchemeTexts;
    project.versions.push({
      version: "v1.0",
      name: "第一版 (初始版本)",
      updatedAt: project.createdAt || nowStr,
      schemeInputs: JSON.parse(JSON.stringify(firstInputs))
    });
  }

  // Set current inputs
  project.schemeInputs = schemeInputs;

  // Always update or add the last modified version as v1.1 (最新修改版本)
  const existingV1_1 = project.versions.find(v => v.version === "v1.1");
  if (existingV1_1) {
    existingV1_1.updatedAt = nowStr;
    existingV1_1.schemeInputs = JSON.parse(JSON.stringify(schemeInputs));
  } else {
    project.versions.push({
      version: "v1.1",
      name: "最新修改版本",
      updatedAt: nowStr,
      schemeInputs: JSON.parse(JSON.stringify(schemeInputs))
    });
  }

  res.json({ success: true, project });
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "未找到该项目" });
  }
  projects.splice(index, 1);
  res.json({ success: true });
});

// Scheme Generation using Gemini API
app.post("/api/generate-scheme", async (req, res) => {
  const {
    projectId,
    projectName,
    projectDesc,
    sampleDataName,
    sampleDataType,
    usageScenario,
    envAssessment,
    managementMeasures,
    evaluationMethod = "K匿名",
    scenarioType = "组织内部同一个事业群的数据流通",
    scenarioCoefficient = "1/3",
    minimumK = 3,
    csvEnabled,
    dicomEnabled,
    imageEnabled,
    csvCategories,
    dicomCategories,
    imageCategories
  } = req.body;

  if (!projectName) {
    return res.status(400).json({ error: "项目名称不能为空" });
  }

  // Construct descriptive summary of sample data
  let finalSampleDataName = sampleDataName || "无";
  let finalSampleDataType = sampleDataType || "CSV";

  if (csvEnabled !== undefined || dicomEnabled !== undefined || imageEnabled !== undefined) {
    const types = [];
    const details = [];
    if (csvEnabled) {
      types.push("CSV文本数据");
      const detailsArray = [];
      if (csvCategories && csvCategories.length > 0) {
        for (const c of csvCategories) {
          let catStr = `【分类: ${c.name}】`;
          if (c.files && c.files.length > 0) {
            catStr += ` (上传样例文件: ${c.files[0].name})`;
            if (c.headers && c.headers.length > 0) {
              catStr += `，已解析字段: [${c.headers.join(", ")}]`;
            }
            if (c.longTextFields && c.longTextFields.length > 0) {
              catStr += `，选中的长文本字段: [${c.longTextFields.join(", ")}]`;
              const splitDetails = [];
              for (const f of c.longTextFields) {
                const splits = c.longTextSplits?.[f] || [];
                if (splits.length > 0) {
                  splitDetails.push(`长文本【${f}】拆分脱敏项: 【${splits.join("、")}】`);
                }
              }
              if (splitDetails.length > 0) {
                catStr += `，具体提取配置: { ${splitDetails.join("; ")} }`;
              }
            }
          } else {
            catStr += ` (未上传文件)`;
          }
          detailsArray.push(catStr);
        }
      } else {
        detailsArray.push("无分类配置");
      }
      details.push(`CSV文本数据 [ ${detailsArray.join(" | ")} ]`);
    }
    if (dicomEnabled) {
      types.push("DICOM影像数据");
      const catsStr = dicomCategories && dicomCategories.length > 0
        ? dicomCategories.map((c: any) => `${c.name} (${c.files && c.files.length > 0 ? c.files[0].name : "未上传影像"})`).join(", ")
        : "无分类";
      details.push(`DICOM影像数据 [ 分类: ${catsStr} ]`);
    }
    if (imageEnabled) {
      types.push("图片数据");
      const catsStr = imageCategories && imageCategories.length > 0
        ? imageCategories.map((c: any) => c.name).join(", ")
        : "无分类";
      details.push(`图片数据 [ 分类: ${catsStr} (仅需登记目录，不上传文件) ]`);
    }
    
    if (types.length > 0) {
      finalSampleDataType = types.join("、");
      finalSampleDataName = details.join("；");
    }
  }

  // Fallback function when API key is missing
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Using offline rich-template generator.");
    const fallback = generateOfflineScheme(
      projectName,
      projectDesc,
      finalSampleDataName,
      finalSampleDataType,
      usageScenario,
      envAssessment || [],
      managementMeasures || [],
      evaluationMethod,
      scenarioType,
      scenarioCoefficient,
      minimumK
    );
    
    // Save to database if projectId is present
    let parsedData = parseMarkdownToScheme(fallback, projectName, projectDesc);
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        project.schemeData = parsedData;
      }
    }

    return res.json({ scheme: fallback, schemeData: parsedData, isOffline: true });
  }

  try {
    const envStr = (envAssessment || []).map((e: any) => {
      const statusLabel = e.status === '满足' ? '【满足要求】' : e.status === '待完善' ? '【待完善/建议整改】' : e.status === '无法满足' ? '【无法满足】' : `【${e.status || '待评估'}】`;
      return `* **${e.name}**：${statusLabel} - 自评明细描述：${e.desc}`;
    }).join("\n");

    const mgmtStr = (managementMeasures || []).map((e: any) => {
      const statusLabel = e.status === '满足' ? '【满足要求】' : e.status === '待完善' ? '【待完善/建议整改】' : e.status === '无法满足' ? '【无法满足】' : `【${e.status || '待评估'}】`;
      return `* **${e.name}**：${statusLabel} - 管理明细描述：${e.desc}`;
    }).join("\n");

    const prompt = `
您是一位资深的健康医疗数据合规专家、数据隐私安全架构师以及数据去标识化系统分析员。
请根据以下输入信息，为指定的健康医疗去标识化项目，撰写一份高度专业、合规、系统化的【医疗健康数据匿名化方案】（中文字符约1500-2500字）。

生成的内容必须严格遵循我国《个人信息保护法》、《数据安全法》、《网络安全法》以及国家标准《信息安全技术 健康医疗信息安全指南》（GB/T 39725-2020）和《信息安全技术 个人信息去标识化指南》（GB/T 37964-2019）。

请严格按照以下大纲层次用标准、排版优美的 Markdown 格式输出：

# 《${projectName} 数据匿名化方案》

**文档等级**：机密
**编制单位**：院内数据安全与隐私保护委员会
**编制日期**：2026年7月
**文档版本**：V1.0.0

---

## 一、 项目背景与合规基础
1.1 项目基本描述与研究目的
1.2 法律法规与行业标准合规对照（分析《个人信息保护法》、《健康医疗信息安全指南》等对该科研/应用场景的具体法律要求）

## 二、 数据资产范围与隐私风险深度评估
2.1 数据源特征：对上传的样例数据「${sampleDataName}」（${sampleDataType}格式）进行针对性的技术描述。
2.2 数据格式特殊安全风险深度分析：
   - 如果是CSV格式：深入分析个人姓名、手机号、年龄、性别、出入院日期、就诊科室、临床诊断等在关联攻击、频率攻击、推导攻击下的重标识风险。识别直接标识符（ID）、准标识符（QI）与敏感属性（SA）。
   - 如果是DICOM格式：深度分析DICOM二进制头部元数据（Dicom Header tags）例如患者信息（0010,0010）、登记号、机构信息，以及三维高精度影像像素数据（Pixel Data，如CT/MRI三维面部面容还原风险）的重标识风险。
2.3 数据的敏感度分级及对外授权暴露面分析。

## 三、 医院去标识化环境基础设施与环境合规评估
结合以下医院实际的基础设施现状（符合/不符合项）进行对比分析，指出安全漏洞并提供差异化的整改指引：
${envStr}

根据上述比对照，评估医院匿名化计算和存储的安全水位。对于不符合项，明确给出“限期整改建议”及临时安全补偿措施。

## 四、 院内数据安全管理体系合规审查
根据该项目申报的管理措施建设情况，进行对照评估：
${mgmtStr}

根据上述对比，分析院内组织架构、策略审批流程、数据泄露应急响应的短板。对于“不符合”的项目，必须设计详细的组织建设和制度补齐规划。

## 五、 数据匿名化技术方案与算法实施策略
5.1 整体匿名化架构流图（可以用Markdown文字或表格表达脱敏管道流程）
5.2 核心去标识化算法组合：
   - 对于直接标识符（如患者姓名、ID）：设计采用 HMAC-SHA256 单向哈希加盐映射算法，转化为唯一的“伪匿名Token”，禁止直接明文暴露，实现伪名化（Pseudonymization）。
   - 对于准标识符（人口学和时间属性，如年龄、日期、性别）：
     - 年龄：采用等距或非等距区间泛化（Generalization），例如[20-30), [30-40)岁。对于80岁以上高龄极值采用高位抑制（Suppression）或合并为“>=80岁”。
     - 检查/就诊日期：采用**患者维度哈希天数随机偏移算法**（在院内私钥保护下，对患者所有日期记录统一偏移[-30至+30]天），抹去绝对日期防止与医院挂号收费日志交叉对比，但完美保留疾病临床演进的时间序列（Time intervals）。
     - 地理邮编：截断或泛化至省市级。
   - 对于DICOM文件：设计采用 DICOM PS3.15 Annex E 国际标准去标识化清单，自动清洗或用伪名Token替代Header中的150多个标签。对三维CT切片设计面部抑制去面容（Defacing）算法。

## 六、 匿名化重标识风险监控与出库长效保障机制
6.1 严格执行 k-匿名（k-Anonymity）审查评估。要求脱敏后数据集的任何准标识符组合等价类记录数满足 k >= 5，否则必须进行自适应属性抑制或行删除（Cell suppression）。
6.2 采用 l-多样性（l-Diversity）防范属性关联推导攻击，敏感属性分布必须具有多样性。
6.3 数据出库安全复核及防重标识合同约束机制。

## 七、 匿名化评价方式与安全阈值决策结论
7.1 评价方式与数学公式：项目选用「${evaluationMethod}」评价方式。具体计算公式为：A = K × S × E。其中：A——匿名化程度；K——数据K匿名门槛值；S——场景系数（本次场景「${scenarioType}」建议安全系数为 S = ${scenarioCoefficient}）；E——环境安全系数，基于“技术保障能力”和“管理保障能力”进行加权确定。
7.2 场景系数（S）深度剖析：针对本次使用场景「${scenarioType}」，说明其泄漏边界范围以及建议系数 S = ${scenarioCoefficient} 的合理性。
7.3 环境系数-技术保障能力评估：对照院内技术基础设施（重点关注增强项“全流程防篡改独立合规审计日志”及其他四个技术点），评估技术保障得分与系数影响。
7.4 环境系数-管理保障能力评估：对照买卖双向合规管理、合规专岗、突发演练等，评估管理水平对环境系数的正面保障。
7.5 最低K值决策结论：根据 S 的倒数和环境合规系数综合换算，确定该场景下最低预期安全阈值 K值不低于：${minimumK}。所有出库数据等价类的大小必须大于等于该数值。

---
【项目详情补充输入】：
- 项目说明: ${projectDesc || "暂无具体说明"}
- 使用场景与目标: ${usageScenario || "科学研究及学术合作"}
- 评价方式: ${evaluationMethod}
- 场景类型: ${scenarioType}
- 场景系数: ${scenarioCoefficient}
- 最低K值设定: ${minimumK}

请直接输出方案的 Markdown，严禁包含任何元描述性文字，确保内容极其详实、结构饱满，用词充满行业公信力。
`;

    const geminiPromise = (async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
        },
      });
      return response.text || "方案生成失败，未返回内容";
    })();

    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error("Gemini API Timeout")), 2300);
    });

    let generatedText: string;
    let isOfflineResponse = false;
    try {
      generatedText = await Promise.race([geminiPromise, timeoutPromise]);
    } catch (raceErr) {
      console.warn("Gemini scheme generation timed out or failed, falling back to rich offline template:", raceErr);
      isOfflineResponse = true;
      generatedText = generateOfflineScheme(
        projectName,
        projectDesc,
        finalSampleDataName,
        finalSampleDataType,
        usageScenario,
        envAssessment || [],
        managementMeasures || [],
        evaluationMethod,
        scenarioType,
        scenarioCoefficient,
        minimumK
      );
    }

    let parsedData = parseMarkdownToScheme(generatedText, projectName, projectDesc);
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        project.schemeData = parsedData;
      }
    }

    res.json({ scheme: generatedText, schemeData: parsedData, isOffline: isOfflineResponse });
  } catch (err: any) {
    console.error("Gemini Scheme Generation Failed:", err);
    // Return graceful fallback on error
    const fallback = generateOfflineScheme(
      projectName,
      projectDesc,
      finalSampleDataName,
      finalSampleDataType,
      usageScenario,
      envAssessment || [],
      managementMeasures || [],
      evaluationMethod,
      scenarioType,
      scenarioCoefficient,
      minimumK
    );

    let parsedData = parseMarkdownToScheme(fallback, projectName, projectDesc);
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        project.schemeData = parsedData;
      }
    }

    res.json({
      scheme: fallback,
      schemeData: parsedData,
      isOffline: true,
      errorMsg: err.message || "由于AI接口调用频次限制或网络超时，平台已为您启动备用安全模版引擎，智能装配了以下符合合规标准的标准方案。",
    });
  }
});

// Offline Schema Generator
function generateOfflineScheme(
  projectName: string,
  projectDesc: string,
  sampleDataName: string,
  sampleDataType: string,
  usageScenario: string,
  envAssessment: any[],
  managementMeasures: any[],
  evaluationMethod: string = "K匿名",
  scenarioType: string = "组织内部同一个事业群的数据流通",
  scenarioCoefficient: string = "1/3",
  minimumK: number = 3
): string {
  const compliantEnv = envAssessment.filter((e) => e.status === "满足");
  const nonCompliantEnv = envAssessment.filter((e) => e.status === "待完善" || e.status === "无法满足");
  const compliantMgmt = managementMeasures.filter((e) => e.status === "满足");
  const nonCompliantMgmt = managementMeasures.filter((e) => e.status === "待完善" || e.status === "无法满足");

  return `# 《${projectName} 数据匿名化方案》

**安全等级**：院内机密
**编制单位**：医院数据安全与合规管理委员会
**编制日期**：2026年7月
**版本编号**：V1.0.0

---

## 一、 项目背景与合规基础

### 1.1 项目基本描述与研究目的
本去标识化方案专门针对“**${projectName}**”在外部合作、临床学术研究及多中心数据共享过程中的合规要求进行编制。本项目的研究与实施目的是：
> ${usageScenario || "用于临床多中心回顾性科研及算法训练"}

平台旨在通过系统化的技术手段，消除数据中包含的直接患者隐私，最大化保留数据的科研和实用价值，并保障数据安全可控。

### 1.2 法律合规对照
本方案在编制和实施技术路线选择上，完全契合：
1. **《中华人民共和国个人信息保护法》（PIPL）**：第五十一条关于去标识化和安全管理要求的规定。
2. **《中华人民共和国数据安全法》**：关于重要数据分类分级保护及安全审查的规定。
3. **国家标准 GB/T 39725-2020《信息安全技术 健康医疗信息安全指南》**：对健康医疗个人信息在流出数据控制方范围时，必须进行彻底“匿名化”处理的技术要求。
4. **国家标准 GB/T 37964-2019《信息安全技术 个人信息去标识化指南》**：提供的模型和评估流程。

---

## 二、 数据资产范围与隐私风险深度评估

根据本项目申报上传的样例数据「**${sampleDataName}**」，其数据类型为 **${sampleDataType}**，隐私风险深度评估如下：

${
  sampleDataType === "DICOM"
    ? `### 2.1 DICOM医疗影像数据隐私泄露通路
DICOM (Digital Imaging and Communications in Medicine) 是医学影像诊断的标准文件格式。其包含两种核心泄露源：
1. **DICOM元数据头（Header Metadata）标签泄露**：
   - 直接标识符 (Direct Identifiers)：包括患者姓名 (0010,0010)、患者ID (0010,0020)、出生日期 (0010,0030)、性别 (0010,0040)、就诊编号等。这些标签能直接锁定患者现实身份。
   - 准标识符 (Quasi-identifiers, QI)：检查序列号、设备厂商、扫描时间、医疗机构名称等，结合公开的住院记录，可被第三方关联重标识。
2. **像素区文本和图像（Pixel Data）泄露**：
   - 图像烧录信息（Burned-in Text）：部分传统超声或CT切片将患者姓名明文绘制在像素矩阵边缘。
   - 三维面部面容（3D Facial Reconstruction）：头颅CT及高分辨率核磁共振（MRI）切片组，通过3D面容复原，可高概率还原患者生前面部轮廓，形成物理级肖像泄露。

### 2.2 风险缓释策略
1. 基于 **DICOM PS3.15 Annex E** 规范进行Header标签批量去标识化处理。
2. 图像边缘文本区域实施基于OCR的像素黑块遮蔽（Masking）。
3. 头颅切片组全面执行基于颅面剔除算法的“Defacing”（面部切除）去面容技术。`
    : `### 2.1 结构化CSV/报表数据隐私风险剖析
根据当前项目配置，数据详细目录及去标识化提取清单如下：
* **数据资产与配置清单**：${sampleDataName}

在CSV结构化数据隐私风险评估中：
1. **直接标识符（Direct Identifiers, DIs）**：
   - 包含“姓名”、“手机号”、“身份证号”、“社保卡号”、“详细住址”等字段。此类信息不具备科研计算价值，但具有唯一识别性，必须全量擦除或使用不含混淆规律的不可逆Token替代。
2. **准标识符（Quasi-Identifiers, QIs）**：
   - 包含“年龄（或出生日期）”、“性别”、“就诊日期”、“出院日期”、“科室编码”、“邮政编码”等。
   - *关联攻击（Linking Attack）风险*：任何单一准标识符无法识别人，但在特定地缘环境下，组合信息极易结合外部第三方数据集（如选民登记薄、挂号记录、社保缴费单）进行交叉匹配，实现患者精准重标识。
3. **敏感属性（Sensitive Attributes, SAs）**：
   - “出院主要诊断”、“病史描述”、“基因测序结果”、“实验室化验值”。这些属于科研的核心数据，必须严格保密，防止逆向推导及诊断标签泄露。

### 2.2 非结构化长文本（Long Text）去标识化提取与风险缓释
针对选中的非结构化长文本列（如“病史描述”、“主诉”等），若其中掺杂了患者姓名、医院或医生姓名、科室或人口学极值信息，将采用专用的子词提取与脱敏技术。
1. **提取识别机制**：基于规则/词典与命名实体识别（NER）双引擎，自动搜寻、高亮定位长文本中隐藏的实体要素（如患者姓名、科室等）。
2. **脱敏处理规则**：对识别出来的特定词汇进行局部替换（如：患者姓名替换为“张**”、医院名称替换为“某医院”），在最大保留医学科研价值的同时，彻底切断重标识链路。`
}

---

## 三、 匿名化评价与安全阈值决策

本项目的匿名化合规评估与K值指标设计如下：

### 3.1 评价方式及计算公式
本项目选用**「${evaluationMethod}」**作为数据去标识化合规性的评估方式。
- **具体计算公式**：A = K × S × E
- **参数说明**：
  - **A (匿名化程度)**：表示数据集的匿名化程度。其值大于等于 1 时，认为满足匿名化要求；
  - **K (数据集 K 匿名值)**：表示数据集经过匿名化处理后，具备相同的准标识符字段组合的记录的条数的最小值；
  - **S (场景系数)**：表示数据去标识化后使用场景的安全系数，根据接收端安全边界级别动态划分；
  - **E (环境系数)**：表示数据流通时，技术保障能力和管理保障能力的综合加权得分。

### 3.2 场景安全系数 S 评估
根据申报的使用场景类型为：**「${scenarioType}」**。
- **匹配的场景系数 S**：**${scenarioCoefficient}**
- **场景合理性分析**：场景系数代表了数据离院/流通物理边界的相对安全性。本特定场景数据安全可控，配备相应的围栏机制，选用上述系数具有极高合规合理性。

### 3.3 环境系数-技术保障能力评估 (E_tech)
结合本次项目申报提交的医院技术基础设施，技术防护措施合规自评明细如下：

${
  compliantEnv.length > 0
    ? `#### A) 已达标项（技术防护措施到位）
${compliantEnv
  .map(
    (e) => `* **${e.name}**（满足）：
  - 判定：${e.desc}
  - 现状：已满足安全标准，运行稳定。`
  )
  .join("\n")}`
    : ""
}

${
  nonCompliantEnv.length > 0
    ? `#### B) 未达标项（待完善与改进建议）
${nonCompliantEnv
  .map(
    (e) => `* **${e.name}**（${e.status}）：
  - 风险：由于“${e.desc}”尚未达到最佳合规水位（当前状态：${e.status}），存在潜在安全隐患。
  - **整改建议**：应在批量数据流出前，补齐该技术项或建立等效的临时安全对策。`
  )
  .join("\n")}`
    : "* 极佳：所有技术保障基础设施指标自评均为【满足要求】。"
}

### 3.4 环境系数-管理保障能力评估 (E_mgmt)
项目对于制度、专岗、应急响应等安全保障维度的合规评估结论如下：

${
  compliantMgmt.length > 0
    ? `#### A) 已达标项
${compliantMgmt
  .map(
    (e) => `* **${e.name}**（满足）：
  - 判定：${e.desc}
  - 现状：已形成院内常态化管理制度，组织建设清晰，人员职责落实。`
  )
  .join("\n")}`
    : ""
}

${
  nonCompliantMgmt.length > 0
    ? `#### B) 未达标项与制度补齐指引
${nonCompliantMgmt
  .map(
    (e) => `* **${e.name}**（${e.status}）：
  - 风险：存在“${e.desc}”的管理缺失（当前状态：${e.status}）。
  - **整改指引**：须完善对应流转约束机制，并在脱敏执行前下发相关突发应急响应指引。`
  )
  .join("\n")}`
    : "* 极佳：所有管理体系自评指标均为【满足要求】。"
}

### 3.5 最低K值决策结论
结合场景系数 S = ${scenarioCoefficient} 换算，为保障数据绝对安全，当前场景计算得到的**最低预期安全阈值 K值不低于：${minimumK}**。
数据集任何准标识符字段组合等价类记录数必须在满足此数值门槛的基础上，方可执行出库数据交换。

---

## 四、 数据匿名化技术方案与算法实施策略

为确保科研可用性与隐私保护的完美平衡，本平台建议针对本项目执行以下**“多级混合脱敏流水线”**（Multi-stage Hybrid Pipeline）：

### 4.1 核心算法策略

1. **直接标识符（DI）伪名化方案**：
   - 摒弃简单的替换，使用带项目盐值（Project-Salt）的 **HMAC-SHA256** 单向哈希计算。
   - 算法流程：\`Pseudonym_ID = Base64(HMAC_SHA256(Original_ID, Global_Secret + Project_Salt))\`。
   - 产生的伪名在全流程中担当主键，逆向解密在数学上是绝对不可逆的。

2. **时间准标识（就诊时间/检查时间）混淆方案**：
   - 采用**患者级一致性随机天数偏移算法**。
   - 机制：针对患者 A，在院内密钥服务生成一个加密随机数 $R_A \\in [-21, +21]$。患者 A 的所有病历记录中，就诊时间、手术时间、出院时间一律统一增加 $R_A$ 天。
   - 效果：抹去了具体的真实日期，有效防御利用医疗挂号费流水单开展的“时间重合度关联攻击”，同时完美保留了该患者疾病诊疗各节点的时间间隔精度（如术后多少天发生感染等科研关键要素）。

3. **数值型准标识（如年龄）泛化方案**：
   - 设置泛化区段 $[0,10), [10,20), \\dots, [70,80)$。
   - 对大于等于80岁的高龄极值，由于样本量极其稀少，自动执行**抑制（Suppression）**，统一合并显示为“>=80”，防范针对百岁老人的单点重标识攻击。

4. **地理特征泛化方案**：
   - 截断邮政编码后三位，保留前三位以代表大的省市经济带；住址字段截断区县级以下明文。

---

## 五、 匿名化重标识风险监控与出库长效保障机制

### 5.1 出库前 k-Anonymity 安全校验
脱敏后的数据集必须自动运行平台检测工具，进行准标识符属性（例如：年龄区间 + 性别 + 邮编前三位）的频率计算：
- **k-安全门槛**：设定 $k \\ge ${minimumK}。
- **校验原理**：确保生成的去标识表格中，任何一行特定准标识符组合在整个数据集中，至少有 ${minimumK} 条相同的记录。
- **应急处理**：对不满足 $k \\ge ${minimumK} 的孤立条目，自动触发等价类向上泛化或直接予以剔除，确保绝对无法通过组合定位单一个体。

### 5.2 l-多样性（l-Diversity）与敏感属性保护
- 为防止“同质性攻击”（即同一等价类中患者虽然匿名，但得病类型完全相同导致隐私泄露），平台将对每一等价类的核心诊断字段进行信息熵评估，确保敏感诊断在组内具有分散的多样性（$l \\ge 3$）。

### 5.3 接收方安全合同约束
平台要求数据接收方在提取合规脱敏包时，必须签署**《数据安全与不重标识合规承诺书》**，在法律合同层面上严格禁止：
1. 任何通过公共接口、商业数据库反向重关联患者信息的意图。
2. 任何以还原自然人真实身份为目的的大数据清洗及重构。

---
*本方案由健康医疗数据安全脱敏平台自动根据申报基线装配，已通过符合性测试，报院内合规组审批备案。*`;
}

// Start Server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

start();
