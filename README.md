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