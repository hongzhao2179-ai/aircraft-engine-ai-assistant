import json
from http import HTTPStatus
import dashscope
from config.settings import settings

class LLMService:
    def __init__(self):
        dashscope.api_key = settings.DASHSCOPE_API_KEY

    def get_streaming_response(self, messages):
        """调用通义千问流式接口"""
        print(f"Calling DashScope with messages: {json.dumps(messages, ensure_ascii=False)}")
        try:
            responses = dashscope.Generation.call(
                model=settings.MODEL_NAME,
                messages=messages,
                result_format='message',
                stream=True,
                incremental_output=True
            )
            
            for response in responses:
                if response.status_code == HTTPStatus.OK:
                    content = response.output.choices[0]['message']['content']
                    if content:
                        yield content
                else:
                    error_msg = f"DashScope Error: {response.code} - {response.message}"
                    print(error_msg)
                    yield f"\n[Error] {error_msg}"
        except Exception as e:
            error_msg = f"Unexpected Error: {str(e)}"
            print(error_msg)
            yield f"\n[Error] {error_msg}"

    def get_non_streaming_response(self, messages):
        """调用通义千问非流式接口"""
        try:
            response = dashscope.Generation.call(
                model=settings.MODEL_NAME,
                messages=messages,
                result_format='message',
            )
            if response.status_code == HTTPStatus.OK:
                return response.output.choices[0]['message']
            else:
                return {"role": "assistant", "content": f"[Error] {response.code} - {response.message}"}
        except Exception as e:
            return {"role": "assistant", "content": f"[Error] {str(e)}"}

llm_service = LLMService()
