# D:\Trae-project\AI-Assistant\backend\prompts\user_prompt.py

USER_PROMPT_TEMPLATE = """
【用户问题】：
{question}

【知识图谱查询结果】：
{kg_result}

请以航空发动机维修工程师的身份给出专业解答。如果知识图谱结果为空，请基于专业知识和通用维修手册原则回答，并注明。
"""

def get_formatted_prompt(question: str = "", kg_result: str = "") -> str:
    """
    获取格式化后的用户提示词
    
    Args:
        question: 用户问题
        kg_result: 知识图谱查询结果
    
    Returns:
        格式化后的提示词字符串
    """
    return USER_PROMPT_TEMPLATE.format(
        question=question,
        kg_result=kg_result if kg_result else "无相关结果"
    )


def get_context_prompt(user_query: str, kg_data: dict) -> str:
    """获取带上下文的提示词（接收字典格式的kg_data）"""
    kg_text = format_kg_result(kg_data) if kg_data else "无相关结果"
    return get_formatted_prompt(question=user_query, kg_result=kg_text)


def format_kg_result(kg_data: dict) -> str:
    """格式化知识图谱结果为可读文本"""
    if not kg_data:
        return ""
    
    # 根据您的知识图谱返回格式调整
    formatted = []
    for key, value in kg_data.items():
        formatted.append(f"- {key}: {value}")
    
    return "\n".join(formatted)