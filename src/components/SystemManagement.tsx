import React, { useState } from "react";
import { 
  Key, Cpu, ShieldAlert, CheckCircle2, RefreshCw, Lock, 
  Activity, ListFilter, Shield, ArrowRight, ShieldCheck, Database
} from "lucide-react";

export default function SystemManagement() {
  const [saltValue, setSaltValue] = useState("K9s#m2L@p8X!z5V$t1Y");
  const [isRotating, setIsRotating] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState("GB/T 37964");

  // Simulated audit logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, time: "2026-07-08 00:01:24", user: "张国栋", action: "生成去标识匿名化合规方案", target: "瑞金医院回顾性科研项目", status: "成功" },
    { id: 2, time: "2026-07-07 23:55:10", user: "张国栋", action: "执行敏感数据脱敏仿真", target: "华山医院骨质疏松影像算法评估", status: "成功" },
    { id: 3, time: "2026-07-07 22:12:45", user: "系统自动", action: "同步院内HIS脱敏节点数据", target: "ACTIVE_HIS_NODE", status: "成功" },
    { id: 4, time: "2026-07-07 19:40:02", user: "刘晓敏", action: "新增脱敏计算项目", target: "中山医院心肌梗死回顾性临床研究", status: "成功" },
    { id: 5, time: "2026-07-06 14:05:31", user: "系统管理员", action: "更新哈希掩膜密钥盐值", target: "全局哈希算子配置", status: "成功" },
  ]);

  const handleRotateSalt = () => {
    setIsRotating(true);
    setTimeout(() => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
      let newSalt = "";
      for (let i = 0; i < 20; i++) {
        newSalt += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setSaltValue(newSalt);
      setIsRotating(false);
      
      // Prepend rotation log
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setAuditLogs(prev => [
        {
          id: Date.now(),
          time: timeStr,
          user: "张国栋",
          action: "轮换哈希掩膜密钥盐值",
          target: "全局哈希算子配置",
          status: "成功"
        },
        ...prev
      ]);
    }, 800);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="system_management_container">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b-2 border-slate-100 pb-6 gap-4" id="system_mgmt_header">
        <div>
          <span className="text-blue-600 font-black text-xs uppercase tracking-widest block mb-1">System Configuration</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">医疗安全合规系统管理控制中心</h1>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 text-white text-[10px] px-4 py-2 rounded border-2 border-slate-900 font-black uppercase tracking-wider shrink-0 md:self-end">
          <Shield className="w-4 h-4 text-blue-400 stroke-[2.5]" />
          <span>系统底层物理隔离面板</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Keys & Standards */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Key Management Card */}
          <div className="bg-white rounded-xl border-2 border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5 flex items-center space-x-2">
              <Key className="w-4.5 h-4.5 text-blue-600 stroke-[2.5]" />
              <span>去标识化哈希密钥管理</span>
            </h3>
            
            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              系统执行单向哈希或哈希映射脱敏时，依赖该动态生成的哈希盐值（Salt）防止彩虹表撞击。
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">当前哈希迭代算法</label>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs font-mono font-bold text-slate-700">
                  HMAC-SHA256 (PBKDF2 Iterations: 10,000)
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">系统全局密钥盐值 (SALT)</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={saltValue}
                    className="w-full p-3 pr-10 bg-slate-100 border-2 border-slate-200 rounded font-mono text-xs font-bold text-slate-800"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </div>
              </div>

              <button
                onClick={handleRotateSalt}
                disabled={isRotating}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white py-3 px-4 rounded font-black text-xs uppercase tracking-wider shadow-md shadow-blue-100 transition-all disabled:opacity-50 cursor-pointer"
                id="btn_rotate_salt"
              >
                <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isRotating ? 'animate-spin' : ''}`} />
                <span>{isRotating ? "轮换密钥处理中..." : "轮换全局盐值密钥"}</span>
              </button>
            </div>
          </div>

          {/* Standards & Guidelines compliance */}
          <div className="bg-white rounded-xl border-2 border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-600 stroke-[2.5]" />
              <span>国家标准规范集成</span>
            </h3>
            
            <div className="space-y-3">
              {[
                { id: "GB/T 37964", title: "GB/T 37964-2019 个人信息去标识化指南", desc: "国家标准规范，对关联分析项目去标识提供A、B、C级风险量化控制。" },
                { id: "GB/T 39725", title: "GB/T 39725-2020 健康医疗信息安全指南", desc: "专为医疗机构就诊数据、影像诊断及基因突变脱敏提供合规物理架构。" },
                { id: "PIPL Art 51", title: "中国个人信息保护法第51条防线", desc: "医疗机构作为个人信息处理者，必须满足不泄露、不追溯的物理防线。" }
              ].map((standard) => (
                <div 
                  key={standard.id}
                  onClick={() => setSelectedStandard(standard.id)}
                  className={`p-3.5 rounded border-2 transition-all cursor-pointer ${
                    selectedStandard === standard.id 
                      ? 'border-blue-600 bg-blue-50/20' 
                      : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900">{standard.id} 标准</span>
                    {selectedStandard === standard.id && <CheckCircle2 className="w-4 h-4 text-blue-600 stroke-[2.5]" />}
                  </div>
                  <p className="text-[11px] text-slate-800 font-bold mb-1">{standard.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{standard.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Performance monitor and audit log */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Performance stats bento panel */}
          <div className="bg-white rounded-xl border-2 border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5 flex items-center space-x-2">
              <Activity className="w-4.5 h-4.5 text-blue-600 stroke-[2.5]" />
              <span>脱敏计算集群健康监测</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded border-2 border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black">集群可用CPU</span>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">92.4%</p>
                <div className="w-full bg-slate-200 h-1 rounded mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded border-2 border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black">内存吞吐负载</span>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">34.1%</p>
                <div className="w-full bg-slate-200 h-1 rounded mt-2 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded" style={{ width: '34%' }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded border-2 border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black">当前去标吞吐率</span>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">1.2 MB/s</p>
                <span className="text-[9px] text-emerald-600 font-bold block mt-1">▲ 运行正常 (GCM)</span>
              </div>

              <div className="bg-slate-50 p-4 rounded border-2 border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black">算法物理加速</span>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">AES-NI</p>
                <span className="text-[9px] text-blue-600 font-bold block mt-1">硬件层级别支持</span>
              </div>
            </div>
          </div>

          {/* Audit Trail list */}
          <div className="bg-white rounded-xl border-2 border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b-2 border-slate-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ListFilter className="w-4 h-4 text-slate-400 stroke-[2.5]" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">系统全局安全合规审计日志</h3>
              </div>
              <span className="text-[10px] bg-slate-900 text-white font-black px-2 py-0.5 rounded border border-slate-950 uppercase tracking-wide">
                只读密态备份
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black uppercase tracking-wider border-b-2 border-slate-200">
                    <th className="py-3 px-4">审计时间</th>
                    <th className="py-3 px-4">操作员</th>
                    <th className="py-3 px-4">合规操作事项</th>
                    <th className="py-3 px-4">目标模块/项目</th>
                    <th className="py-3 px-4 text-right">执行结果</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-bold bg-white">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-all">
                      <td className="py-3 px-4 font-mono text-slate-500">{log.time}</td>
                      <td className="py-3 px-4 text-slate-900">{log.user}</td>
                      <td className="py-3 px-4 text-slate-800">{log.action}</td>
                      <td className="py-3 px-4 text-slate-600">{log.target}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">
                        <span className="inline-flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                          <span>{log.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900 text-slate-400 px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider flex justify-between items-center">
              <span>* 日志自动备份：每24小时物理写入不可篡改WORM审计区。</span>
              <span className="text-white">审计完整性哈希：SEC_OK_7F9E</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
