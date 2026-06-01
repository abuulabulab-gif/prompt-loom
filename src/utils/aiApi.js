// APIエラーメッセージを日本語に変換
export function localizeApiError(message, lang) {
  if (lang !== 'ja') return message;
  const m = (message || '').toLowerCase();
  if (m.includes('quota') || m.includes('exceeded') || m.includes('billing') || m.includes('insufficient_quota'))
    return 'APIの利用上限に達しています。プランと請求設定をご確認ください';
  if (m.includes('invalid') && m.includes('key') || m.includes('incorrect api key') || m.includes('authentication'))
    return 'APIキーが正しくありません。設定を確認してください';
  if (m.includes('rate limit') || m.includes('too many requests') || m.includes('rate_limit'))
    return 'リクエストが多すぎます。しばらく待ってから再試行してください';
  if (m.includes('overloaded') || m.includes('529'))
    return 'APIサーバーが混雑しています。しばらく待ってから再試行してください';
  if (m.includes('timeout') || m.includes('network') || m.includes('fetch'))
    return 'ネットワークエラーが発生しました。接続を確認してください';
  if (m.includes('context_length') || m.includes('maximum context'))
    return 'テキストが長すぎます。内容を短くして再試行してください';
  if (m.includes('content_filter') || m.includes('content policy') || m.includes('safety'))
    return 'コンテンツポリシーによりリクエストがブロックされました';
  return message;
}

const SYSTEM_POLISH = {
  ja: 'あなたはAIイラスト生成の専門家です。以下はAIイラストツール用のタグから生成した日本語の自然文です。これをより自然で読みやすい描写文章に整えてください。元の内容・意味は変えず、余分な説明や解釈は加えないでください。文章のみを返してください。',
  en: 'You are an expert in AI image generation. The following is natural language text generated from illustration tags. Rewrite it as more natural, flowing descriptive prose. Keep the original meaning intact and do not add extra details or interpretations. Return only the rewritten text.',
};

const SYSTEM_NATURAL_TO_TAGS = {
  ja: `あなたはAIイラスト生成の専門家です。ユーザーの説明文をAIイラスト生成用の英語タグに変換し、以下のブロックに分類してJSONのみ返してください（説明・コメント不要）。
ブロック: face（顔・髪・目）, attribute（種族・耳・翼など特殊パーツ）, body（体型・肌色）, outfit（衣装・靴・アクセサリー）, artstyle（画風・タッチ）, background（背景・場所）, effect（エフェクト・光・天気）, composition（構図・アングル）, quality（品質タグの追加）
形式: {"face":["tag1","tag2"],"outfit":["tag3"],...}  値のないブロックは省略してください。`,
  en: `You are an AI illustration expert. Convert the user's description into English prompt tags, grouped by block. Return ONLY JSON, no explanation.
Blocks: face, attribute, body, outfit, artstyle, background, effect, composition, quality
Format: {"face":["tag1","tag2"],"outfit":["tag3"],...}  Omit empty blocks.`,
};

const SYSTEM_IMAGE_TO_TAGS = {
  ja: `あなたはAIイラスト生成の専門家です。送られた画像を分析し、AIイラスト生成用の英語プロンプトタグを抽出して以下のブロックに分類してJSONのみ返してください（説明・コメント不要）。
ブロック: face（顔・髪型・目・表情）, attribute（種族・耳・翼など特殊パーツ）, body（体型・肌色）, outfit（衣装・靴・アクセサリー）, artstyle（画風・タッチ・アート媒体）, background（背景・場所・環境）, effect（エフェクト・光・天気）, composition（構図・アングル・カメラ）, quality（品質・解像度タグ）
形式: {"face":["tag1","tag2"],"outfit":["tag3"],...}  値のないブロックは省略してください。`,
  en: `You are an AI illustration expert. Analyze the image and extract English prompt tags, grouped by block. Return ONLY JSON, no explanation.
Blocks: face (face/hair/eyes/expression), attribute (species/ears/wings/special parts), body (physique/skin), outfit (clothing/shoes/accessories), artstyle (art style/medium), background (setting/environment), effect (lighting/weather/effects), composition (angle/framing), quality (resolution/quality tags)
Format: {"face":["tag1","tag2"],"outfit":["tag3"],...}  Omit empty blocks.`,
};

const SYSTEM_TAG_SUGGEST = {
  ja: `あなたはAIイラスト生成の専門家です。現在のプロンプトタグを分析し、画像をより魅力的にする追加タグを5〜7件提案してください。JSONのみ返してください（説明不要）。
形式: [{"tag":"tag name","block":"face","reason":"提案理由を日本語で短く"}]
blockは face / attribute / body / outfit / artstyle / background / effect / composition / quality のいずれか。`,
  en: `You are an AI illustration expert. Analyze the current prompt tags and suggest 5-7 additional tags that would improve the image. Return ONLY JSON, no explanation.
Format: [{"tag":"tag name","block":"face","reason":"short reason in English"}]
block must be one of: face, attribute, body, outfit, artstyle, background, effect, composition, quality`,
};

async function request({ provider, apiKey, system, userContent, maxTokens = 700 }) {
  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],
        max_tokens: maxTokens,
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
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: userContent }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Claude API error');
    return data.content[0].text.trim();
  }

  throw new Error('Unknown provider');
}

async function requestWithImage({ provider, apiKey, system, base64, mediaType, maxTokens = 800 }) {
  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}`, detail: 'low' } },
              { type: 'text', text: 'この画像を分析してタグを抽出してください。' },
            ],
          },
        ],
        max_tokens: maxTokens,
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
        max_tokens: maxTokens,
        system,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: 'この画像を分析してタグを抽出してください。' },
          ],
        }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Claude API error');
    return data.content[0].text.trim();
  }

  throw new Error('Unknown provider');
}

export async function callAI({ provider, apiKey, text, naturalLang }) {
  return request({ provider, apiKey, system: SYSTEM_POLISH[naturalLang] ?? SYSTEM_POLISH.en, userContent: text });
}

export async function callNaturalToTags({ provider, apiKey, text, lang }) {
  const raw = await request({ provider, apiKey, system: SYSTEM_NATURAL_TO_TAGS[lang] ?? SYSTEM_NATURAL_TO_TAGS.en, userContent: text, maxTokens: 800 });
  const json = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(json);
}

export async function callImageToTags({ provider, apiKey, base64, mediaType, lang }) {
  const raw = await requestWithImage({ provider, apiKey, system: SYSTEM_IMAGE_TO_TAGS[lang] ?? SYSTEM_IMAGE_TO_TAGS.en, base64, mediaType });
  const json = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(json);
}

export async function callTagSuggest({ provider, apiKey, currentTags, lang }) {
  const raw = await request({ provider, apiKey, system: SYSTEM_TAG_SUGGEST[lang] ?? SYSTEM_TAG_SUGGEST.en, userContent: `Current tags: ${currentTags}`, maxTokens: 700 });
  const json = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(json);
}
