# 技术栈说明

## 1. 前端技术栈
- React
- TypeScript
- Vite
- Tailwind CSS
- react-markdown
- Axios

## 2. 后端技术栈
- Python
- FastAPI
- Uvicorn
- Neo4j Python Driver
- LLM API（Qwen）

## 3. 数据库
- Neo4j（知识图谱）
- LocalStorage（聊天记录）

## 4. 系统架构
Frontend → Backend → Neo4j → LLM → Response

## 5. LLM调用方式
后端调用 LLM API：
- Chat Completions API
- Stream 流式输出
- 多轮对话历史一起发送

## 6. Neo4j 知识图谱结构

### 实体类型
- Engine（发动机）
- System（系统）
- Component（部件）
- Fault（故障）
- Symptom（症状）
- Repair（维修方法）

### 关系类型
- contains（包含）
- part_of（属于）
- causes（导致）
- symptom_of（症状）
- repair_method（维修方法）

### 三元组示例
(发动机, 包含, 燃油系统)
(燃油系统, 包含, 燃油泵)
(燃油泵, 故障, 压力不足)
(压力不足, 维修方法, 更换燃油泵)