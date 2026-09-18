import React, { useState } from "react";
import { 
  ArrowLeft, Tag, Bot, Edit, X, CheckCircle2, AlertCircle, 
  HelpCircle, RefreshCw, SlidersHorizontal, FlaskConical 
} from "lucide-react";
import ImageLabelTesting from "./ImageLabelTesting";

interface EnvironmentConfigProps {
  onBack: () => void;
}

interface ConfigItem {
  id: string;
  name: string;
  regex: string;
}

// Data Element configurations combining 4.png + 5.png + 6.png (Total 21 items)
const INITIAL_DATA_ELEMENTS: ConfigItem[] = [
  // From 4.png (7 items)
  {
    id: "de-1",
    name: "时间",
    regex: '["\\\\d{4}[-/年]\\\\d{1,2}[-/月]\\\\d{1,2}(?:日|号)?","\\\\d{4}[-/年]\\\\d{1,2}(?:月|号)?","(\\\\d{4}年)(?:[^前]|$)?","\\\\d{1,2}:\\\\d{2}(?::\\\\d{2})?"]'
  },
  {
    id: "de-2",
    name: "户籍",
    regex: '["户籍[:、\\\\s]*([一-龥0-9 ()]{2,20})","(?:农业|非农业|城镇|农村|常住|临时|集体|家庭)户口"]'
  },
  {
    id: "de-3",
    name: "文化程度",
    regex: '["(?:文化程度|学历|教育程度)[:、\\\\s]*(文盲|小学|初中|高中|中专|大专|本科|硕士|博士|研究生|职高|技校|中学)","(?:^[一-龥A-Za-z0-9])(文盲|小学|初中|高中|中专|大专|本科|硕士|博士|研究生)(?:[^室]|$)"]'
  },
  {
    id: "de-4",
    name: "职业",
    regex: '["(?:职业|现职业)[:、\\\\s]*([一-龥]{1,8})","教师|工程师|会计师|会计|司机|驾驶员|厨师|农民|工人|公务员|职员|警察|军人|学生|退休|无业|待业|家务|经商|个体户|自由职业|务农|务工|营业员|销售员|服务员|快递员|外卖员"]'
  },
  {
    id: "de-5",
    name: "婚姻状况",
    regex: '["未婚未育|已婚|未婚|离异|丧偶|再婚|分居"]'
  },
  {
    id: "de-6",
    name: "籍贯",
    regex: '["籍贯[:、\\\\s]*([一-龥]{2,20})"]'
  },
  {
    id: "de-7",
    name: "学校",
    regex: '["(?:就读于|毕业于|就读|毕业|入读|升入|考入|学校)[:、\\\\s]*([一-龥A-Za-z0-9 ()]{1,20}?(?:职业技术学院|专科学校|师范学校|高级中学|初级中学|大学|学院|中学|小学|幼儿园|学校))(?:\\[^医卫诊血\\]|$)*","(?:^[一-龥A-Za-z0-9 ()])([^就入升考读于在][一-龥A-Za-z0-9 ()]{0,19}?(?:职业技术学院|专科学校|师范学校|高级中学|初级中学|大学|学院|中学|小学|幼儿园|学校))(?:\\[^医卫诊血\\]|$)"]'
  },

  // From 5.png (8 items)
  {
    id: "de-8",
    name: "性别",
    regex: '["性别[:、\\\\s]*([男女])","(?:^[母父])([男女]性)","(?:^[一-龥A-Za-z0-9])([男女])(?:[^-一-龥A-Za-z0-9]|$)"]'
  },
  {
    id: "de-9",
    name: "年龄",
    regex: '["年龄[:、\\\\s]*([零一二三四五六七八九十百\\\\d]{1,4}\\\\s*岁)","(?:出生|生后|日龄|月龄|足月)[一-龥]{0,2}?(\\\\d{1,3}\\\\s*(?:天|个月|日))","(?:^[第程年\\\\d])(\\\\d{1,3}\\\\s*岁)","(?:^[第程嗽续院药年\\\\d])(\\\\d{1,2}\\\\s*个月)(?:[^前]|$)","(?:^[第程嗽续院药年\\\\d])(\\\\d{1,3}\\\\s*天)(?:[^前后]|$)","半岁"]'
  },
  {
    id: "de-10",
    name: "身高",
    regex: '["(?:身高)[:、\\\\s]*(\\\\d+(?:\\\\.\\\\d+)?\\\\s*(?:cm|CM|厘米|m|米))","(?:^[\\\\d.])((?:[5-9]\\\\d|1[0-9]{2}|2[0-2]\\\\d)(?:\\\\.\\\\d+)?\\\\s*(?:cm|CM|厘米))(?:[^*]|$)","(?:^[\\\\d.])((?:1\\\\.[5-9]|2\\\\.[0-2])(?:\\\\d)?\\\\s*(?:m|米))(?:[^*]|$)"]'
  },
  {
    id: "de-11",
    name: "患者姓名",
    regex: '["(?:患者|患儿|病人)(?:姓名)?[:、\\\\s]*([一-龥]{2,4}(?:[··][一-龥]{1,3})?)(?:[^咳诉主于因无有入住就手查来自呕腹发热头痛胸闷气促乏力纳差失眠伴出现感面色神志检0-9]|$)","(?:^[医生护士])姓名[:、\\\\s]*([一-龥]{2,4}(?:[··][一-龥]{1,3})?)"]'
  },
  {
    id: "de-12",
    name: "血型",
    regex: '["(?:血型)[:、\\\\s]*(A|B|AB|O|Rh[一-龥]*)","(?:AB|A|B|O)型","Rh(?:阳性|阴性|[+-])"]'
  },
  {
    id: "de-13",
    name: "体重",
    regex: '["(?:体重)[:、\\\\s]*(\\\\d{1,3}(?:\\\\.\\\\d+)?\\\\s*(?:kg|KG|千克|公斤|斤))","(?:^[\\\\d.])(\\\\d{1,3}(?:\\\\.\\\\d+)?\\\\s*(?:kg|KG|千克|公斤))(?:[^*]|$)","(?:^[\\\\d.])(\\\\d{2,3}(?:\\\\.\\\\d+)?\\\\s*斤)"]'
  },
  {
    id: "de-14",
    name: "肺活量",
    regex: '["(?:肺活量|用力肺活量|FVC|VC)[:、\\\\s]*(\\\\d+(?:\\\\.\\\\d+)?\\\\s*(?:ml|毫升|L|l))","(?:^[\\\\d.])(\\\\d{4}(?:\\\\.\\\\d+)?\\\\s*(?:ml|毫升))"]'
  },
  {
    id: "de-15",
    name: "工作单位",
    regex: '["(?:工作单位|所在单位|任职单位|单位名称|就职于|任职于|工作于)[:、\\\\s]*([一-龥A-Za-z0-9 ()·]{2,30})","([一-龥A-Za-z0-9 ()]{2,20}?(?:有限公司|股份有限公司|集团|公司|工厂|厂|事务所|研究院|设计院|局|处|银行))(?:[^一-龥A-Za-z0-9 ()]|$)"]'
  },

  // From 6.png (6 items)
  {
    id: "de-16",
    name: "医生姓名",
    regex: '["(?:主治医师|接诊医师|接诊医生|手术医生|主刀医师|主刀医生|住院医师|值班医生|首诊医师|主管医生|主管医师|责任护士|麻醉师|麻醉医生)[:、\\\\s]*([一-龥]{2,3})","(?:医生|医师|护士)(?:签名|签字)?[:、\\\\s]+([一-龥]{2,3})","(?:由|经|请)?([一-龥]{2,3})(?:医生|医师|护士)(?:主刀|查房|接诊|签名|签字)"]'
  },
  {
    id: "de-17",
    name: "患者证件号",
    regex: '["(?:^[\\\\d])(\\\\d{17}[\\\\dXx])(?:[^\\\\d]|$)","(?:^[\\\\d])(\\\\d{15})(?:[^\\\\d]|$)","(?:身份证号码|身份证号|身份证|护照号|军官证号|军官证|港澳通行证号|港澳通行证|医保卡号|社保卡号|证件号码|证件号)[:号\\\\s]*([0-9A-Za-z]{6,20})"]'
  },
  {
    id: "de-18",
    name: "患者就诊号",
    regex: '["(?:门诊号|住院号|病历号|病案号|影像号|PACS号|检验号|标本号|就诊卡号|就诊号|预约号)[:、号\\\\s]*([0-9A-Za-z\\\\-]{4,20})"]'
  },
  {
    id: "de-19",
    name: "住址",
    regex: '["(?:家庭住址|现住址|常住地址|常住住址|联系地址|通讯地址|家庭地址|住址)[:、\\\\s]*([^\\\\s,。、;；!！？?\\\\n]+)"]'
  },
  {
    id: "de-20",
    name: "医疗卫生机构名称",
    regex: '["(?:医院名称|就诊医院|转诊医院|入住医院|收治医院|接诊医院|体检医院)[:、\\\\s]*([一-龥]{2,25}?(?:医院|卫生院|社区卫生服务中心|卫生服务中心|体检中心|保健院|疗养院|医疗中心|诊所|卫生室))","(?:就诊于|转诊至|转诊于|转至|入住|收治于|就医于|于|在)[:、\\\\s]*([一-龥]{2,25}?(?:医院|卫生院|社区卫生服务中心|卫生服务中心|体检中心|保健院|疗养院|医疗中心|诊所|卫生室))","(?:^[一-龥A-Za-z0-9 ()])([^就住转入收治医于][一-龥]{1,24}?(?:医院|卫生院|社区卫生服务中心|卫生服务中心|体检中心|保健院|疗养院|医疗中心|诊所|卫生室))(?:[^就诊住院转至收治医于0-9]|$)"]'
  },
  {
    id: "de-21",
    name: "科室名称",
    regex: '["(?:科室名称|所在科室|就诊科室|收治科室|入院科室|转入科室|转出科室|科室)[:、\\\\s]*([一-龥A-Za-z0-9]{1,10}?(?:内科|外科|妇产科|儿科|骨科|眼科|口腔科|皮肤科|检验科|影像科|超声科|病理科|康复科|科|室))","(?:^[一-龥A-Za-z0-9])([一-龥A-Za-z0-9]{1,8}?(?:神经内科|神经外科|呼吸内科|消化内科|内分泌科|重症医学科|泌尿外科|肝胆外科|心胸外科|妇产科|耳鼻喉科|口腔科|皮肤科|心内科|肾内科|血液科|肿瘤科|放射科|检验科|影像科|超声科|病理科|康复科|中医科|急诊科|麻醉科|介入科|内科|外科|儿科|骨科|眼科|普外科|ICU))"]'
  }
];

// Image Data Labels configuration (4 items as requested)
const INITIAL_IMAGE_LABELS: ConfigItem[] = [
  {
    id: "il-1",
    name: "时间",
    regex: '["\\\\d{4}[-/年]\\\\d{1,2}[-/月]\\\\d{1,2}(?:日|号)?","\\\\d{4}[-/年]\\\\d{1,2}(?:月|号)?","(\\\\d{4}年)(?:[^前]|$)?","\\\\d{1,2}:\\\\d{2}(?::\\\\d{2})?"]'
  },
  {
    id: "il-2",
    name: "医疗卫生机构名称",
    regex: '["(?:医院名称|就诊医院|转诊医院|入住医院|收治医院|接诊医院|体检医院)[:、\\\\s]*([一-龥]{2,25}?(?:医院|卫生院|社区卫生服务中心|卫生服务中心|体检中心|保健院|疗养院|医疗中心|诊所|卫生室))","(?:就诊于|转诊至|转诊于|转至|入住|收治于|就医于|于|在)[:、\\\\s]*([一-龥]{2,25}?(?:医院|卫生院|社区卫生服务中心|卫生服务中心|体检中心|保健院|疗养院|医疗中心|诊所|卫生室))","(?:^[一-龥A-Za-z0-9 ()])([^就住转入收治医于][一-龥]{1,24}?(?:医院|卫生院|社区卫生服务中心|卫生服务中心|体检中心|保健院|疗养院|医疗中心|诊所|卫生室))(?:[^就诊住院转至收治医于0-9]|$)"]'
  },
  {
    id: "il-3",
    name: "患者姓名",
    regex: '["(?:患者|患儿|病人)(?:姓名)?[:、\\\\s]*([一-龥]{2,4}(?:[··][一-龥]{1,3})?)(?:[^咳诉主于因无有入住就手查来自呕腹发热头痛胸闷气促乏力纳差失眠伴出现感面色神志检0-9]|$)","(?:^[医生护士])姓名[:、\\\\s]*([一-龥]{2,4}(?:[··][一-龥]{1,3})?)"]'
  },
  {
    id: "il-4",
    name: "患者id",
    regex: '["(?:门诊号|住院号|病历号|病案号|影像号|PACS号|检验号|标本号|就诊卡号|就诊号|预约号)[:、号\\\\s]*([0-9A-Za-z\\\\-]{4,20})","(?:^[\\\\d])(\\\\d{17}[\\\\dXx])(?:[^\\\\d]|$)"]'
  }
];

export default function EnvironmentConfig({ onBack }: EnvironmentConfigProps) {
  // Category tab: 'data-element' | 'image-label'
  const [activeCategory, setActiveCategory] = useState<'data-element' | 'image-label'>('data-element');
  const [isTestingMode, setIsTestingMode] = useState<boolean>(false);

  // Items state
  const [dataElements, setDataElements] = useState<ConfigItem[]>(INITIAL_DATA_ELEMENTS);
  const [imageLabels, setImageLabels] = useState<ConfigItem[]>(INITIAL_IMAGE_LABELS);

  // Edit modal state
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editRegex, setEditRegex] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Open edit modal
  const handleOpenEdit = (item: ConfigItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditRegex(item.regex);
  };

  // Save edit modal
  const handleSaveEdit = () => {
    if (!editingItem) return;

    if (!editName.trim()) {
      alert("数据标签不能为空");
      return;
    }

    // Optional validation for json array format or regex syntax
    if (editRegex.trim()) {
      try {
        const parsed = JSON.parse(editRegex.trim());
        if (Array.isArray(parsed)) {
          for (const pattern of parsed) {
            new RegExp(pattern);
          }
        }
      } catch (err) {
        // If not standard JSON, check if it compiles as single regex
        try {
          new RegExp(editRegex.trim());
        } catch (regErr) {
          alert("正则语法不合法，请检查正则表达式后重试");
          return;
        }
      }
    }

    if (activeCategory === 'data-element') {
      setDataElements(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return { ...item, name: editName.trim(), regex: editRegex.trim() };
        }
        return item;
      }));
    } else {
      setImageLabels(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return { ...item, name: editName.trim(), regex: editRegex.trim() };
        }
        return item;
      }));
    }

    setEditingItem(null);
    showToast(`“${editName}”配置保存成功`);
  };

  const currentItems = activeCategory === 'data-element' ? dataElements : imageLabels;
  const currentTitle = activeCategory === 'data-element' ? "长文本数据标签配置" : "图片数据标签配置";

  if (isTestingMode) {
    return <ImageLabelTesting onBack={() => setIsTestingMode(false)} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="environment_config_page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-5 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded text-slate-600 border-2 border-slate-200 hover:border-slate-400 transition-all cursor-pointer"
          title="返回控制台"
        >
          <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
        <div>
          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>系统管理</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600 font-black">环境参数配置</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            环境参数配置
          </h1>
        </div>
      </div>

      {/* Main Two-Column Structure: Left Sidebar (Parameter Categories) + Right Content Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR: 参数分类 (图片数据标签配置排在下方) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="text-xs font-bold text-slate-400 pl-1">
            参数分类
          </div>

          <div className="space-y-3">
            {/* 1. 长文本数据标签配置 */}
            <div
              onClick={() => setActiveCategory('data-element')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center space-x-3.5 select-none ${
                activeCategory === 'data-element'
                  ? 'border-2 border-blue-600 bg-white shadow-xs ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                activeCategory === 'data-element' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <Tag className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <span className={`text-xs tracking-tight ${
                activeCategory === 'data-element' ? 'font-black text-blue-600' : 'font-bold text-slate-700'
              }`}>
                长文本数据标签配置
              </span>
            </div>

            {/* 2. 图片数据标签配置 (排在下方) */}
            <div
              onClick={() => setActiveCategory('image-label')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center space-x-3.5 select-none ${
                activeCategory === 'image-label'
                  ? 'border-2 border-blue-600 bg-white shadow-xs ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                activeCategory === 'image-label' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <Bot className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <span className={`text-xs tracking-tight ${
                activeCategory === 'image-label' ? 'font-black text-blue-600' : 'font-bold text-slate-700'
              }`}>
                图片数据标签配置
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT TABLE */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
          {/* Header Title */}
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              {currentTitle}
            </h2>
            {activeCategory === 'image-label' && (
              <button
                type="button"
                onClick={() => setIsTestingMode(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>测试</span>
              </button>
            )}
          </div>

          {/* Table Container */}
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs">
                    <th className="py-3 px-5 w-44 shrink-0">
                      数据标签
                    </th>
                    <th className="py-3 px-5">
                      解析正则
                    </th>
                    <th className="py-3 px-5 text-right w-24 shrink-0">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name Column */}
                      <td className="py-4 px-5 font-bold text-slate-900 align-top whitespace-nowrap">
                        {item.name}
                      </td>

                      {/* Regex Column */}
                      <td className="py-4 px-5 text-slate-700 font-mono text-[11px] leading-relaxed break-all align-top">
                        {item.regex}
                      </td>

                      {/* Action Column */}
                      <td className="py-4 px-5 text-right align-top whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-bold cursor-pointer bg-transparent border-0 text-xs transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>编辑</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EDIT MODAL: MATCHING 7.png ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-fade-in">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-3xs">
                  <Tag className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  编辑
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 space-y-4">
              {/* Field 1: 数据标签 * */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  数据标签 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="请输入数据标签"
                />
              </div>

              {/* Field 2: 解析正则 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  解析正则
                </label>
                <textarea
                  rows={6}
                  value={editRegex}
                  onChange={(e) => setEditRegex(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-bold font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder='["..."]'
                />
              </div>

              {/* Hint footer text */}
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                保存时将校验正则语法是否合法；留空表示不配置解析正则。
              </p>
            </div>

            {/* Modal Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-3xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
