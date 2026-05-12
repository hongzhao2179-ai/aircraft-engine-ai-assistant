# AeroMaint Copilot
## 航空发动机智能故障维保助手

## 1. 项目简介
AeroMaint Copilot 是一个面向航空发动机维修领域的智能故障维保助手系统，基于大语言模型（LLM）与知识图谱（Knowledge Graph）构建，实现故障问答、故障推理、维修知识查询等功能。

本项目目标是构建一个类似 Copilot 的 AI 维修助手，辅助维修工程师进行故障诊断与维修决策，提高维修效率与知识利用率。

---

## 2. MVP阶段目标
MVP（Minimum Viable Product）版本实现以下功能：

- 故障问答
- 故障推理
- Neo4j 知识图谱查询
- 多轮对话
- 流式输出
- 聊天记录本地保存
- Markdown 渲染

注意：MVP阶段不使用向量数据库，只使用 Neo4j + LLM。

---

## 3. 系统架构
系统整体架构如下：

Frontend (React)
    ↓
FastAPI Backend
    ↓
Neo4j Knowledge Graph
    ↓
LLM API
    ↓
Response

系统流程：

用户问题 → Neo4j查询 → 知识上下文 → LLM推理 → 返回答案

---

## 4. 核心功能
1. 故障问答（Fault QA）
2. 故障推理（Fault Diagnosis）
3. 知识图谱查询（Knowledge Graph Query）
4. 多轮对话（Multi-turn Chat）
5. 聊天记录保存（LocalStorage）
6. Markdown 渲染
7. 流式输出（Streaming Response）

---

## 5. 应用场景
- 航空发动机维修
- 工业设备维修
- 故障诊断系统
- 维修知识管理系统
- AI维修助手

---

## 6. 后续扩展方向
- 向量数据库
- RAG 检索增强生成
- Agent 自动维修流程
- 多模态故障诊断
- 预测性维修

## 🚀 项目运行指南

### 1. 准备工作

#### (1) 后端环境配置
1.  进入 `backend` 目录
2.  创建 Python 虚拟环境并安装依赖
3.  配置 `.env` 文件（包含 API Key）

#### (2) 前端环境配置
1.  进入 `frontend` 目录
2.  安装 npm 依赖
3.  配置 `.env` 文件（包含 Supabase 配置）

---

### 2. 后端启动（FastAPI）

**终端 1：启动后端服务**

```powershell
cd backend

# 如果还没有虚拟环境，创建并激活
# Windows 示例：
python -m venv venv
venv\Scripts\Activate.ps1

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
python main.py
```

后端服务启动后，会运行在 `http://localhost:8000`，并且会显示：
- 健康检查地址：`http://localhost:8000/health`
- API 文档地址：`http://localhost:8000/docs`

---

### 3. 前端启动（React + Vite）

**终端 2：启动前端服务**

```powershell
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务启动后，会自动在浏览器中打开，通常是：
- `http://localhost:5173` 或 `http://localhost:3000`

---

### 4. 必要的配置文件

#### 后端 `.env` 文件 (`backend/.env`)

```env
# DashScope API Key (通义千问)
DASHSCOPE_API_KEY=你的API密钥
```

#### 前端 `.env` 文件 (`frontend/.env`)

```env
# Supabase 配置
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的项目的Anon Key
```

---

### 📌 运行顺序

1.  **先启动后端**（终端 1）
2.  **再启动前端**（终端 2）
3.  浏览器会自动打开前端页面