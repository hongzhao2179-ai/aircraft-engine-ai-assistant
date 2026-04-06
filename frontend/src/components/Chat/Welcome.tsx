import React from 'react';
import { Wrench, Book, AlertTriangle, BarChart, List, FileText } from 'lucide-react';

interface WelcomeProps {
  onQuickAction: (action: string) => void;
}

const quickActions = [
  { icon: Wrench, title: '故障诊断', description: '输入症状获取诊断建议。', action: 'diagnose' },
  { icon: Book, title: '维修手册', description: '查询标准维修流程。', action: 'manual' },
  { icon: AlertTriangle, title: '故障排除指南', description: '详细的故障解决步骤。', action: 'troubleshoot' },
   { icon: BarChart, title: '数据分析', description: '上传维修记录进行分析。', action: 'analyze' },
  { icon: List, title: '工具清单', description: '获取所需工具列表。', action: 'tools' },
  { icon: FileText, title: '技术文档', description: '查阅 AMM/IPC 技术文档。', action: 'docs' },
];

const Welcome: React.FC<WelcomeProps> = ({ onQuickAction }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">你好! 我是AeroMaint Copilot</h1>
        <p className="text-lg text-gray-500 mt-2">Your expert assistant for aircraft engine diagnostics and maintenance.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {quickActions.map((item) => (
          <button
            key={item.action}
            onClick={() => onQuickAction(item.action)}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-200 text-left flex flex-col justify-between"
          >
            <div>
              <item.icon className="w-8 h-8 mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-12 text-sm text-gray-400">
        <p>你也可以向我咨询类似问题，例如：</p>
        <div className="flex space-x-2 mt-2">
          <button className="bg-gray-200 px-3 py-1 rounded-full text-xs hover:bg-gray-300">"如何修复发动机启动问题？"</button>
          <button className="bg-gray-200 px-3 py-1 rounded-full text-xs hover:bg-gray-300">"液压压力低故障排除？"</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
