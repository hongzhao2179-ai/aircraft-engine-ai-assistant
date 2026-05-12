from prompts.system_prompt import get_system_prompt
from prompts.user_prompt import get_formatted_prompt


def build_full_prompt(question: str) -> str:
    system = get_system_prompt()
    user = get_formatted_prompt(question)
    return f"{system}\n\n{user}"
