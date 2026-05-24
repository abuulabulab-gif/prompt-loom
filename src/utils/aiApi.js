const SYSTEM_POLISH = {
  ja: 'あなたはAIイラスト生成の専門家です。以下はAIイラストツール用のタグから生成した日本語の自然文です。これをより自然で読みやすい描写文章に整えてください。元の内容・意味は変えず、余分な説明や解釈は加えないでください。文章のみを返してください。',
  en: 'You are an expert in AI image generation. The following is natural language text generated from illustration tags. Rewrite it as more natural, flowing descriptive prose. Keep the original meaning intact and do not add extra details or interpretations. Return only the rewritten text.',
};

export async function callAI({ provider, apiKey, text, naturalLang }) {
  const system = SYSTEM_POLISH[naturalLang] ?? SYSTEM_POLISH.en;

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: text }],
        max_tokens: 600,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'OpenAI API error');
    return data.choices[0].message.content.trim();
  }

  if (provider === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-allow-browser': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system,
        messages: [{ role: 'user', content: text }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Claude API error');
    return data.content[0].text.trim();
  }

  throw new Error('Unknown provider');
}
