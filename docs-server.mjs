import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.join(import.meta.dirname, 'docs');
const PORT = 3001;

function findMdFiles(dir, base = '') {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdFiles(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith('.md')) {
      results.push(rel);
    }
  }
  return results;
}

// Also include todo.md from project root
const TODO_PATH = path.join(import.meta.dirname, 'todo.md');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // API: list docs
  if (url.pathname === '/api/docs' && req.method === 'GET') {
    const files = findMdFiles(DOCS_DIR);
    files.unshift('../todo.md'); // Add todo.md as first tab
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(files));
    return;
  }

  // API: read a doc
  if (url.pathname === '/api/doc' && req.method === 'GET') {
    const file = url.searchParams.get('file');
    if (!file) { res.writeHead(400); res.end('Missing file param'); return; }
    const fullPath = file === '../todo.md' ? TODO_PATH : path.join(DOCS_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(content);
    } catch {
      res.writeHead(404); res.end('Not found');
    }
    return;
  }

  // API: save a doc
  if (url.pathname === '/api/doc' && req.method === 'PUT') {
    const file = url.searchParams.get('file');
    if (!file) { res.writeHead(400); res.end('Missing file param'); return; }
    const fullPath = file === '../todo.md' ? TODO_PATH : path.join(DOCS_DIR, file);
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        fs.writeFileSync(fullPath, body, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500); res.end(String(e));
      }
    });
    return;
  }

  // Serve the HTML app
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Docs server running on http://localhost:${PORT}`);
});

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>sandybox docs</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0f1117; color: #c8d0e8; }

  #app { display: flex; flex-direction: column; height: 100%; }

  /* Header */
  header { background: #161822; border-bottom: 1px solid rgba(100,140,255,0.15); padding: 0 16px; display: flex; align-items: center; height: 48px; flex-shrink: 0; }
  header h1 { font-size: 15px; font-weight: 600; color: #8ba4ff; letter-spacing: 1px; }
  header .mode-toggle { margin-left: auto; display: flex; gap: 4px; }
  header .mode-toggle button {
    padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(100,140,255,0.2);
    background: transparent; color: #7888a8; font-size: 12px; cursor: pointer; transition: all 0.15s;
  }
  header .mode-toggle button.active { background: rgba(60,80,160,0.4); color: #fff; border-color: #8ba4ff; }
  header .mode-toggle button:hover { border-color: rgba(100,140,255,0.5); }

  /* Tabs */
  .tabs { display: flex; background: #12141e; border-bottom: 1px solid rgba(100,140,255,0.1); flex-shrink: 0; overflow-x: auto; scrollbar-width: thin; }
  .tab {
    padding: 10px 18px; font-size: 13px; color: #5a6a8a; cursor: pointer; border-bottom: 2px solid transparent;
    white-space: nowrap; transition: all 0.15s; flex-shrink: 0;
  }
  .tab:hover { color: #8ba4ff; background: rgba(60,80,160,0.1); }
  .tab.active { color: #a8b8ff; border-bottom-color: #8ba4ff; background: rgba(60,80,160,0.15); }

  /* Content area */
  .content { flex: 1; overflow: hidden; position: relative; }

  /* Preview mode */
  .preview {
    padding: 32px 48px; overflow-y: auto; height: 100%; max-width: 860px; margin: 0 auto;
    line-height: 1.7; font-size: 15px;
  }
  .preview h1 { font-size: 28px; color: #a8b8ff; margin: 32px 0 16px; border-bottom: 1px solid rgba(100,140,255,0.15); padding-bottom: 8px; }
  .preview h1:first-child { margin-top: 0; }
  .preview h2 { font-size: 22px; color: #8ba4ff; margin: 28px 0 12px; }
  .preview h3 { font-size: 17px; color: #7ecfff; margin: 20px 0 8px; }
  .preview p { margin: 8px 0; }
  .preview ul, .preview ol { margin: 8px 0 8px 24px; }
  .preview li { margin: 4px 0; }
  .preview code {
    background: rgba(100,140,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 13px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace; color: #a8e6cf;
  }
  .preview pre {
    background: #1a1e2e; border: 1px solid rgba(100,140,255,0.15); border-radius: 8px;
    padding: 16px; margin: 12px 0; overflow-x: auto; line-height: 1.5;
  }
  .preview pre code { background: none; padding: 0; color: #c8d0e8; }
  .preview table { border-collapse: collapse; margin: 12px 0; width: 100%; }
  .preview th { background: rgba(60,80,160,0.2); padding: 8px 12px; text-align: left; font-size: 13px; color: #8ba4ff; border: 1px solid rgba(100,140,255,0.15); }
  .preview td { padding: 8px 12px; border: 1px solid rgba(100,140,255,0.1); font-size: 13px; }
  .preview tr:hover td { background: rgba(60,80,160,0.08); }
  .preview blockquote { border-left: 3px solid #8ba4ff; padding-left: 16px; margin: 12px 0; color: #7888a8; }
  .preview strong { color: #e0e4f0; }
  .preview hr { border: none; border-top: 1px solid rgba(100,140,255,0.15); margin: 24px 0; }
  .preview a { color: #7ecfff; text-decoration: none; }
  .preview a:hover { text-decoration: underline; }

  /* Editor mode */
  .editor-wrap { height: 100%; display: flex; flex-direction: column; }
  .editor-toolbar { padding: 8px 16px; background: #161822; border-bottom: 1px solid rgba(100,140,255,0.1); display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .editor-toolbar .save-btn {
    padding: 6px 18px; border-radius: 6px; border: 1px solid #4a8a4a; background: rgba(40,100,40,0.3);
    color: #a8e6cf; font-size: 13px; cursor: pointer; transition: all 0.15s;
  }
  .editor-toolbar .save-btn:hover { background: rgba(40,100,40,0.5); }
  .editor-toolbar .save-btn.saved { border-color: #8ba4ff; background: rgba(60,80,160,0.3); color: #8ba4ff; }
  .editor-toolbar .status { font-size: 12px; color: #5a6a8a; }
  textarea.editor {
    flex: 1; width: 100%; background: #0f1117; color: #c8d0e8; border: none; padding: 24px 48px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;
    line-height: 1.6; resize: none; outline: none; tab-size: 2;
  }

  /* Split mode */
  .split { display: flex; height: 100%; }
  .split .editor-side { width: 50%; border-right: 1px solid rgba(100,140,255,0.15); display: flex; flex-direction: column; }
  .split .preview-side { width: 50%; overflow-y: auto; }
  .split .preview-side .preview { padding: 24px 32px; }
  .split textarea.editor { padding: 16px 24px; }

  /* Saved flash */
  @keyframes savedFlash { 0% { opacity: 1; } 100% { opacity: 0; } }
  .save-flash { animation: savedFlash 2s ease forwards; color: #a8e6cf; font-size: 12px; }
</style>
</head>
<body>
<div id="app">
  <header>
    <h1>SANDYBOX DOCS</h1>
    <div class="mode-toggle">
      <button id="mode-read" class="active" onclick="setMode('read')">Read</button>
      <button id="mode-edit" onclick="setMode('edit')">Edit</button>
      <button id="mode-split" onclick="setMode('split')">Split</button>
    </div>
  </header>
  <div class="tabs" id="tabs"></div>
  <div class="content" id="content"></div>
</div>

<script>
let docs = [];
let currentDoc = null;
let currentContent = '';
let mode = 'read';
let dirty = false;

async function init() {
  const res = await fetch('/api/docs');
  docs = await res.json();
  renderTabs();
  if (docs.length > 0) selectDoc(docs[0]);
}

function renderTabs() {
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = docs.map(f => {
    const label = f === '../todo.md' ? 'todo.md' : f.replace(/\\.md$/, '').replace(/\\//g, ' / ');
    return '<div class="tab' + (f === currentDoc ? ' active' : '') + '" onclick="selectDoc(\\''+f.replace(/'/g,"\\\\'")+'\\')">'+label+'</div>';
  }).join('');
}

async function selectDoc(file) {
  if (dirty && !confirm('Unsaved changes. Discard?')) return;
  dirty = false;
  currentDoc = file;
  const res = await fetch('/api/doc?file=' + encodeURIComponent(file));
  currentContent = await res.text();
  renderTabs();
  renderContent();
}

function setMode(m) {
  mode = m;
  document.querySelectorAll('.mode-toggle button').forEach(b => b.classList.remove('active'));
  document.getElementById('mode-' + m).classList.add('active');
  renderContent();
}

function renderContent() {
  const el = document.getElementById('content');
  if (mode === 'read') {
    el.innerHTML = '<div class="preview">' + renderMd(currentContent) + '</div>';
  } else if (mode === 'edit') {
    el.innerHTML = '<div class="editor-wrap">' +
      '<div class="editor-toolbar"><button class="save-btn" onclick="saveDoc()">Save</button><span class="status" id="save-status"></span></div>' +
      '<textarea class="editor" id="editor-textarea" oninput="onEdit()">' + escHtml(currentContent) + '</textarea></div>';
  } else {
    el.innerHTML = '<div class="split">' +
      '<div class="editor-side"><div class="editor-toolbar"><button class="save-btn" onclick="saveDoc()">Save</button><span class="status" id="save-status"></span></div>' +
      '<textarea class="editor" id="editor-textarea" oninput="onEdit()">' + escHtml(currentContent) + '</textarea></div>' +
      '<div class="preview-side"><div class="preview" id="split-preview">' + renderMd(currentContent) + '</div></div></div>';
  }
}

function onEdit() {
  dirty = true;
  const ta = document.getElementById('editor-textarea');
  currentContent = ta.value;
  if (mode === 'split') {
    document.getElementById('split-preview').innerHTML = renderMd(currentContent);
  }
}

async function saveDoc() {
  const res = await fetch('/api/doc?file=' + encodeURIComponent(currentDoc), {
    method: 'PUT', headers: { 'Content-Type': 'text/plain' }, body: currentContent
  });
  if (res.ok) {
    dirty = false;
    const st = document.getElementById('save-status');
    st.innerHTML = '<span class="save-flash">Saved!</span>';
  }
}

// Handle Ctrl+S
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (mode !== 'read') saveDoc(); }
});

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function renderMd(md) {
  let html = md;
  // Code blocks
  html = html.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, (_, lang, code) => '<pre><code>' + escHtml(code.trim()) + '</code></pre>');
  // Inline code
  html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // HR
  html = html.replace(/^---$/gm, '<hr>');
  // Bold
  html = html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/(?<![*])\\*(?![*])(.+?)(?<![*])\\*(?![*])/g, '<em>$1</em>');
  // Links
  html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>');
  // Images (just show as links)
  html = html.replace(/!\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>');
  // Tables
  html = html.replace(/^(\\|.+\\|)\\n(\\|[-| :]+\\|)\\n((?:\\|.+\\|\\n?)*)/gm, (_, header, sep, body) => {
    const ths = header.split('|').filter(c => c.trim()).map(c => '<th>' + c.trim() + '</th>').join('');
    const rows = body.trim().split('\\n').map(row => {
      const tds = row.split('|').filter(c => c.trim()).map(c => '<td>' + c.trim() + '</td>').join('');
      return '<tr>' + tds + '</tr>';
    }).join('');
    return '<table><thead><tr>' + ths + '</tr></thead><tbody>' + rows + '</tbody></table>';
  });
  // Lists
  html = html.replace(/^- \\[x\\] (.+)$/gm, '<li style="list-style:none">&#9745; $1</li>');
  html = html.replace(/^- \\[ \\] (.+)$/gm, '<li style="list-style:none">&#9744; $1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\\d+\\. (.+)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*<\\/li>\\n?)+)/g, '<ul>$1</ul>');
  // Paragraphs (lines not already wrapped in tags)
  html = html.replace(/^(?!<[a-z])((?!\\s*$).+)$/gm, '<p>$1</p>');
  // Clean up empty paragraphs
  html = html.replace(/<p>\\s*<\\/p>/g, '');
  // Blockquotes
  html = html.replace(/<p>&gt; (.+?)<\\/p>/g, '<blockquote><p>$1</p></blockquote>');
  return html;
}

init();
</script>
</body>
</html>`;
