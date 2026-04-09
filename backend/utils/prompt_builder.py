from typing import List, Dict
from prompts.system_prompt import SYSTEM_PROMPT
from prompts.user_prompt import USER_PROMPT_TEMPLATE

class PromptBuilder:
    @staticmethod
    def build_chat_messages(user_message: str, history: List[Dict], kg_result: str = "暂无知识图谱查询结果。") -> List[Dict]:
        """
        构建 DashScope 要求的 messages 格式。
        确保系统提示词始终位于消息列表的第一位。
        """
        messages = []
        
        # 1. 始终在最前面添加系统提示词
        messages.append({
            "role": "system",
            "content": SYSTEM_PROMPT
        })
        
        # 2. 添加对话历史
        if history:
            for msg in history:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
        
        # 3. 添加当前用户提问（使用模板包裹）
        user_content = USER_PROMPT_TEMPLATE.format(
            question=user_message,
            kg_result=kg_result
        )
        
        messages.append({
            "role": "user",
            "content": user_content
        })
        
        return messages

prompt_builder = PromptBuilder()
