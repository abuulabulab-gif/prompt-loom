import { useState, useRef } from "react";
import { callNaturalToTags, callImageToTags } from "../../utils/aiApi.js";

const BLOCK_LABELS = {
  face:        { ja: '顔・髪',         en: 'Face / Hair' },
  attribute:   { ja: '属性・種族',     en: 'Attribute' },
  body:        { ja: '体型',           en: 'Body' },
  outfit:      { ja: '衣装',           en: 'Outfit' },
  artstyle:    { ja: 'アートスタイル', en: 'Art Style' },
  background:  { ja: '背景',           en: 'Background' },
  effect:      { ja: 'エフェクト',     en: 'Effect' },
  composition: { ja: '構図',           en: 'Composition' },
  quality:     { ja: '品質',           en: 'Quality' },
};

const compressToBase64 = (file) => new Promise((resolve, reject) => {
  const MAX_PX = 1024;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg', previewUrl: dataUrl });
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
  img.src = url;
});

export default function NaturalToTagsModal({ lang, apiConfig, blocks, onAddTags, onClose, initialTab = 'text' }) {
  const [mode, setMode] = useState(initialTab); // 'text' | 'image'
  const [input, setInput]     = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData]       = useState(null); // { base64, mediaType }
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(null);
  const [selected, setSelected] = useState({});
  const fileRef = useRef(null);

  const applyResult = (res) => {
    setResult(res);
    const init = {};
    Object.entries(res).forEach(([block, tags]) => tags.forEach(t => { init[`${block}::${t}`] = true; }));
    setSelected(init);
  };

  const handleConvertText = async () => {
    if (!input.trim()) return;
    setBusy(true); setError(''); setResult(null); setSelected({});
    try {
      const res = await callNaturalToTags({ provider: apiConfig.provider, apiKey: apiConfig.apiKey, text: input.trim(), lang });
      applyResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setError(''); setResult(null); setSelected({});
    try {
      const data = await compressToBase64(file);
      setImagePreview(data.previewUrl);
      setImageData({ base64: data.base64, mediaType: data.mediaType });
    } catch {
      setError(lang === 'ja' ? '画像の読み込みに失敗しました' : 'Failed to load image');
    }
  };

  const handleConvertImage = async () => {
    if (!imageData) return;
    setBusy(true); setError(''); setResult(null); setSelected({});
    try {
      const res = await callImageToTags({ provider: apiConfig.provider, apiKey: apiConfig.apiKey, ...imageData, lang });
      applyResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const switchMode = (m) => {
    setMode(m);
    setError(''); setResult(null); setSelected({});
  };

  const toggleTag = (block, tag) => {
    const k = `${block}::${tag}`;
    setSelected(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const handleAdd = () => {
    const toAdd = {};
    Object.entries(selected).forEach(([k, on]) => {
      if (!on) return;
      const [block, tag] = k.split('::');
      if (!toAdd[block]) toAdd[block] = [];
      toAdd[block].push(tag);
    });
    onAddTags(toAdd);
    onClose();
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const blockOrder = ['face', 'attribute', 'body', 'outfit', 'artstyle', 'background', 'effect', 'composition', 'quality'];
  const resultBlocks = result ? blockOrder.filter(b => result[b]?.length) : [];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface border border-linebright rounded-[14px] w-full max-w-[480px] max-h-[86vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-[18px] py-[13px] border-b border-line flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-[10px]">
            {/* Mode tabs */}
            <div className="flex rounded-[6px] overflow-hidden border border-line text-[10px] font-mono">
              <button onClick={() => switchMode('text')}
                className="px-[10px] py-[4px] cursor-pointer transition-colors duration-100"
                style={mode === 'text'
                  ? { background: 'rgb(var(--c-blue) / 0.15)', color: 'rgb(var(--c-blue))', fontWeight: 700 }
                  : { background: 'transparent', color: 'rgb(var(--muted))' }}>
                ✍️ {lang === 'ja' ? 'テキスト' : 'Text'}
              </button>
              <button onClick={() => switchMode('image')}
                className="px-[10px] py-[4px] cursor-pointer transition-colors duration-100 border-l border-line"
                style={mode === 'image'
                  ? { background: 'rgb(var(--c-purple) / 0.15)', color: 'rgb(var(--c-purple))', fontWeight: 700 }
                  : { background: 'transparent', color: 'rgb(var(--muted))' }}>
                🖼 {lang === 'ja' ? '画像' : 'Image'}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-[6px] px-[10px] py-1 text-muted cursor-pointer text-[12px]">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 px-[18px] py-[16px] space-y-[14px]">

          {/* ── Text mode ── */}
          {mode === 'text' && (
            <div className="space-y-[8px]">
              <div className="text-dim text-[10px] font-mono font-bold tracking-widest uppercase">
                {lang === 'ja' ? 'キャラクターの説明を入力' : 'Describe your character'}
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={lang === 'ja'
                  ? '例: 銀髪ロングの女の子。青い目でエルフの耳を持つ。白いドレスを着て、魔法の杖を持っている。背景は幻想的な森。'
                  : 'e.g. A girl with long silver hair and blue eyes, pointed elf ears, wearing a white dress and holding a magic staff in a fantasy forest.'}
                className="w-full rounded-[9px] px-[12px] py-[10px] text-[12px] font-mono outline-none border border-line bg-bg text-fg resize-none leading-[1.7]"
                rows={4}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleConvertText(); }}
              />
              <div className="flex items-center justify-between">
                <span className="text-dim text-[10px] font-mono">
                  {lang === 'ja' ? 'Ctrl+Enter で変換' : 'Ctrl+Enter to convert'}
                </span>
                <button onClick={handleConvertText} disabled={busy || !input.trim()}
                  className="rounded-[8px] px-[16px] py-[7px] text-[12px] font-bold cursor-pointer border-none text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-default"
                  style={{ background: 'linear-gradient(135deg,#4a6fff,#8a4fff)' }}>
                  {busy ? (lang === 'ja' ? '変換中...' : 'Converting...') : (lang === 'ja' ? '▶ タグに変換' : '▶ Convert')}
                </button>
              </div>
            </div>
          )}

          {/* ── Image mode ── */}
          {mode === 'image' && (
            <div className="space-y-[10px]">
              <div className="text-dim text-[10px] font-mono font-bold tracking-widest uppercase">
                {lang === 'ja' ? '画像をアップロード' : 'Upload an image'}
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="rounded-[10px] border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-[8px] transition-colors duration-150 relative overflow-hidden"
                style={{
                  borderColor: imagePreview ? 'rgb(var(--c-purple) / 0.5)' : 'rgb(var(--dim))',
                  minHeight: imagePreview ? '0' : '120px',
                  background: imagePreview ? 'transparent' : 'rgb(var(--surface-alt))',
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview"
                    className="w-full rounded-[8px] object-contain max-h-[200px]" />
                ) : (
                  <>
                    <span className="text-[28px]">🖼</span>
                    <span className="text-muted text-[11px] font-mono text-center px-4">
                      {lang === 'ja'
                        ? 'クリックまたはドラッグ＆ドロップ\nJPG・PNG・WebP対応'
                        : 'Click or drag & drop\nJPG, PNG, WebP'}
                    </span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files[0]) handleImageFile(e.target.files[0]); e.target.value = ''; }} />

              <div className="flex items-center justify-between">
                {imagePreview ? (
                  <button onClick={() => { setImagePreview(null); setImageData(null); setResult(null); setSelected({}); }}
                    className="text-[10px] font-mono text-muted cursor-pointer bg-transparent border-none underline">
                    {lang === 'ja' ? '画像を変更' : 'Change image'}
                  </button>
                ) : <span />}
                <button onClick={handleConvertImage} disabled={busy || !imageData}
                  className="rounded-[8px] px-[16px] py-[7px] text-[12px] font-bold cursor-pointer border-none text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-default"
                  style={{ background: 'linear-gradient(135deg,#7a4fff,#b44fff)' }}>
                  {busy ? (lang === 'ja' ? '解析中...' : 'Analyzing...') : (lang === 'ja' ? '▶ タグを抽出' : '▶ Extract tags')}
                </button>
              </div>

              <p className="text-dim text-[10px] font-mono leading-[1.6]">
                {lang === 'ja'
                  ? 'AIが画像からキャラの特徴（髪・目・衣装・背景など）を読み取りタグに変換します。APIキーが必要です。'
                  : 'AI reads character features from the image (hair, eyes, outfit, background, etc.) and converts them to tags. Requires an API key.'}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-[8px] px-[12px] py-[9px] text-[11px] font-mono text-red-400 bg-red-400/10 border border-red-400/30">
              {error}
            </div>
          )}

          {/* Results — shared between both modes */}
          {result && resultBlocks.length > 0 && (
            <div className="space-y-[10px]">
              <div className="flex items-center justify-between">
                <div className="text-dim text-[10px] font-mono font-bold tracking-widest uppercase">
                  {lang === 'ja' ? '生成されたタグ（クリックで選択）' : 'Generated tags (click to select)'}
                </div>
                <button onClick={() => {
                  const all = {};
                  resultBlocks.forEach(b => result[b].forEach(t => { all[`${b}::${t}`] = true; }));
                  setSelected(all);
                }} className="text-[10px] font-mono text-muted cursor-pointer underline">
                  {lang === 'ja' ? 'すべて選択' : 'Select all'}
                </button>
              </div>

              {resultBlocks.map(block => (
                <div key={block} className="bg-surfalt rounded-[9px] px-[12px] py-[10px]">
                  <div className="text-[10px] font-mono font-bold text-muted mb-[7px]">
                    {BLOCK_LABELS[block]?.[lang] ?? block}
                  </div>
                  <div className="flex flex-wrap gap-[5px]">
                    {result[block].map(tag => {
                      const k = `${block}::${tag}`;
                      const on = selected[k];
                      return (
                        <button key={tag} onClick={() => toggleTag(block, tag)}
                          className="rounded-[6px] px-[9px] py-[4px] text-[11px] font-mono cursor-pointer transition-all duration-100 border"
                          style={on
                            ? { background: 'rgb(var(--c-blue) / 0.15)', color: 'rgb(var(--c-blue))', borderColor: 'rgb(var(--c-blue) / 0.5)' }
                            : { background: 'transparent', color: 'rgb(var(--muted))', borderColor: 'rgb(var(--dim))' }}>
                          {on ? '✓ ' : ''}{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {result && (
          <div className="px-[18px] py-[12px] border-t border-line flex-shrink-0 flex items-center justify-between gap-[10px]">
            <span className="text-muted text-[11px] font-mono">
              {selectedCount}{lang === 'ja' ? ' 件選択中' : ' selected'}
            </span>
            <button onClick={handleAdd} disabled={selectedCount === 0}
              className="rounded-[8px] px-[20px] py-[8px] text-[12px] font-bold cursor-pointer border-none text-white disabled:opacity-40 disabled:cursor-default"
              style={{ background: 'linear-gradient(135deg,#4a6fff,#8a4fff)' }}>
              {lang === 'ja' ? `${selectedCount} 件を追加` : `Add ${selectedCount} tags`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
