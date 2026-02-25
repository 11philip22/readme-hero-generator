import { useState, useRef, useEffect, useCallback } from "react";

const ACCENTS = [
  { name: "ORANGE", color: "#f97316" },
  { name: "CYAN",   color: "#22d3ee" },
  { name: "LIME",   color: "#84cc16" },
  { name: "VIOLET", color: "#a855f7" },
  { name: "RED",    color: "#ff2d2d" },
  { name: "AMBER",  color: "#f59e0b" },
  { name: "ROSE",   color: "#f43f8e" },
  { name: "ICE",    color: "#e0f2fe" },
];

const BACKGROUNDS = ["NONE", "DOTS", "WAVE", "VOID", "ZEBRA"];

const PALETTE = {
  dark: {
    BG:        "#0e0e0c",
    BORDER:    "#2e2e26",
    FG:        "#e8e6dc",
    DESC:      "#b8b6ac",
    TAG_BG:    "#181816",
    TAG_TEXT:  "#e8e6dc",
    DOT:       "#2a2a26",
    PATTERN_BASE: 0.12,   // base brightness for patterns (0=black, 1=white)
    PATTERN_INV: false,   // false = light dots on dark bg
  },
  light: {
    BG:        "#f2f1ea",
    BORDER:    "#111111",
    FG:        "#111111",
    DESC:      "#4a4a40",
    TAG_BG:    "#111111",
    TAG_TEXT:  "#f2f1ea",
    DOT:       "#b8b6ae",
    PATTERN_BASE: 0.78,   // base brightness — dark dots on light bg
    PATTERN_INV: true,    // true = dark dots on light bg
  },
};

async function loadFonts() {
  const faces = [
    { weight: "400", url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOV.woff2" },
    { weight: "700", url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD-IQ-PuZJJXxfpAO-Lf1OQk6OThxPA.woff2" },
  ];
  try {
    await Promise.all(faces.map(async ({ weight, url }) => {
      const f = new FontFace("JetBrains Mono", `url(${url}) format('woff2')`, { weight });
      const loaded = await f.load();
      document.fonts.add(loaded);
    }));
    await document.fonts.ready;
  } catch (e) {
    console.warn("Font load failed", e);
  }
}

function noise(x, y) {
  return (
    Math.sin(x * 0.8 + y * 1.3) * 0.40 +
    Math.sin(x * 1.7 - y * 0.6 + 2.1) * 0.25 +
    Math.sin(x * 0.4 + y * 2.1 + 4.3) * 0.20 +
    Math.cos(x * 2.3 + y * 0.9 + 1.1) * 0.15
  );
}

function drawDotGrid(ctx, width, height, pal) {
  const spacing = 20;
  for (let x = 20; x < width; x += spacing) {
    for (let y = 20; y < height; y += spacing) {
      ctx.fillStyle = pal.DOT;
      ctx.beginPath();
      ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawTopoWave(ctx, width, height, pal) {
  const stepX = 5, stepY = 5, levels = 14;
  const scaleX = 0.022, scaleY = 0.038;
  const inv = pal.PATTERN_INV;

  for (let px = 0; px < width; px += stepX) {
    for (let py = 0; py < height; py += stepY) {
      const val = noise(px * scaleX, py * scaleY);
      const n = (val + 1) / 2;
      const levelStep = 1.0 / levels;
      let minDist = Infinity;
      for (let i = 0; i <= levels; i++) {
        const d = Math.abs(n - i * levelStep);
        if (d < minDist) minDist = d;
      }
      const bandwidth = 0.022;
      if (minDist < bandwidth) {
        const proximity = 1 - (minDist / bandwidth);
        const levelNorm = Math.round(n / levelStep) / levels;
        const rawBrightness = 0.12 + levelNorm * 0.18;
        const brightness = inv ? (1 - rawBrightness) : rawBrightness;
        const alpha = (0.25 + proximity * 0.55) * (0.4 + levelNorm * 0.6);
        const v = Math.round(brightness * 255);
        ctx.fillStyle = `rgba(${v},${v},${v},${alpha.toFixed(2)})`;
        const dotR = 0.8 + proximity * 0.7 + levelNorm * 0.4;
        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function sampleVoidField(x, y, width, height) {
  const warpX =
    noise(x * 0.006 + 4.1, y * 0.006 - 1.9) * 88 +
    noise(x * 0.014 - 3.2, y * 0.010 + 2.7) * 36;
  const warpY =
    noise(x * 0.006 - 2.6, y * 0.006 + 3.4) * 92 +
    noise(x * 0.012 + 1.8, y * 0.012 - 4.3) * 34;
  const wx = x + warpX;
  const wy = y + warpY;

  const base =
    noise(wx * 0.013, wy * 0.028) * 0.84 +
    noise(wx * 0.039 + 7.3, wy * 0.021 + 11.6) * 0.44 +
    noise((wx + wy * 0.33) * 0.018, (wy - wx * 0.27) * 0.020) * 0.31;

  const flow =
    Math.sin((wx * 0.018 + wy * 0.010) + noise(x * 0.012, y * 0.012) * 2.1) * 0.18 +
    Math.cos((wx * 0.010 - wy * 0.019) + noise(x * 0.017 + 2.4, y * 0.015 - 1.7) * 1.7) * 0.13;

  return (base + flow) * 0.78;
}

function edgePoint(x, y, step, edge, v00, v10, v11, v01, level) {
  if (edge === 0) {
    const denom = v10 - v00 || 1e-6;
    const t = (level - v00) / denom;
    return [x + step * t, y];
  }
  if (edge === 1) {
    const denom = v11 - v10 || 1e-6;
    const t = (level - v10) / denom;
    return [x + step, y + step * t];
  }
  if (edge === 2) {
    const denom = v11 - v01 || 1e-6;
    const t = (level - v01) / denom;
    return [x + step * t, y + step];
  }
  const denom = v01 - v00 || 1e-6;
  const t = (level - v00) / denom;
  return [x, y + step * t];
}

function drawVoid(ctx, width, height, pal) {
  const inv = pal.PATTERN_INV;
  const step = 5;
  const cols = Math.ceil(width / step);
  const rows = Math.ceil(height / step);
  const field = Array.from({ length: rows + 1 }, () => new Float32Array(cols + 1));

  for (let gy = 0; gy <= rows; gy++) {
    for (let gx = 0; gx <= cols; gx++) {
      field[gy][gx] = sampleVoidField(gx * step, gy * step, width, height);
    }
  }

  const segmentsByCase = {
    1: [[3, 0]],
    2: [[0, 1]],
    3: [[3, 1]],
    4: [[1, 2]],
    5: [[0, 1], [3, 2]],
    6: [[0, 2]],
    7: [[3, 2]],
    8: [[2, 3]],
    9: [[0, 2]],
    10: [[0, 3], [1, 2]],
    11: [[1, 2]],
    12: [[1, 3]],
    13: [[0, 1]],
    14: [[0, 3]],
  };

  const levels = 17;
  const minLevel = -1.55;
  const maxLevel = 1.55;
  for (let i = 0; i < levels; i++) {
    const t = i / Math.max(1, levels - 1);
    const level = minLevel + (maxLevel - minLevel) * t;
    const rawBrightness = 0.12 + t * 0.20;
    const brightness = inv ? (1 - rawBrightness) : rawBrightness;
    const v = Math.round(brightness * 255);
    const alpha = 0.22 + (1 - Math.abs(t - 0.5) * 1.65) * 0.36;

    ctx.strokeStyle = `rgba(${v},${v},${v},${Math.max(0.08, alpha).toFixed(2)})`;
    ctx.lineWidth = 0.9 + (1 - Math.abs(t - 0.5) * 1.4) * 0.8;
    ctx.beginPath();

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const v00 = field[gy][gx];
        const v10 = field[gy][gx + 1];
        const v11 = field[gy + 1][gx + 1];
        const v01 = field[gy + 1][gx];

        const c0 = v00 >= level ? 1 : 0;
        const c1 = v10 >= level ? 1 : 0;
        const c2 = v11 >= level ? 1 : 0;
        const c3 = v01 >= level ? 1 : 0;
        const mask = c0 | (c1 << 1) | (c2 << 2) | (c3 << 3);
        const pairs = segmentsByCase[mask];
        if (!pairs) continue;

        const x = gx * step;
        const y = gy * step;
        for (const [ea, eb] of pairs) {
          const [ax, ay] = edgePoint(x, y, step, ea, v00, v10, v11, v01, level);
          const [bx, by] = edgePoint(x, y, step, eb, v00, v10, v11, v01, level);
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
        }
      }
    }
    ctx.stroke();
  }
}

function drawZebra(ctx, width, height, pal) {
  const stripeWidth = width / 10;
  const inv = pal.PATTERN_INV;
  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      const warp = noise(py * 0.025, px * 0.008) * stripeWidth * 1.4;
      const warpedX = px + warp;
      const bandPos = ((warpedX / stripeWidth) % 1.0 + 1.0) % 1.0;
      const isLight = bandPos < 0.5;
      if (isLight) {
        const rawBrightness = 0.10 + bandPos * 0.14;
        const brightness = inv ? (1 - rawBrightness) : rawBrightness;
        const v = Math.round(brightness * 255);
        ctx.fillStyle = `rgba(${v},${v},${v},0.85)`;
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
}

function drawBanner(canvas, { name, subtitle, description, tags, accent, bgStyle, colorMode, width, height }) {
  const ctx = canvas.getContext("2d");
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  ctx.scale(dpr, dpr);

  const pal  = PALETTE[colorMode];
  const ACC  = accent.color;
  const F    = "'JetBrains Mono', monospace";

  // Background
  ctx.fillStyle = pal.BG;
  ctx.fillRect(0, 0, width, height);

  // Pattern
  if (bgStyle === "DOTS")       drawDotGrid(ctx, width, height, pal);
  else if (bgStyle === "WAVE")  drawTopoWave(ctx, width, height, pal);
  else if (bgStyle === "VOID")  drawVoid(ctx, width, height, pal);
  else if (bgStyle === "ZEBRA") drawZebra(ctx, width, height, pal);
  // NONE — just the solid background color, no pattern

  const pad = 20;

  // Outer border
  ctx.strokeStyle = pal.BORDER; ctx.lineWidth = 2;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  // Content
  ctx.textAlign = "left";
  const cX = pad + 36;
  const nfs = name.length > 22 ? 42 : name.length > 16 ? 52 : name.length > 10 ? 62 : 72;
  const hasSubtitle = subtitle && subtitle.trim().length > 0;

  const descFontSize = 16;
  ctx.font = `400 ${descFontSize}px ${F}`;
  const maxW = width - cX - pad - 40;
  const words = description.split(" ");
  let line = "", lines = [];
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else { line = test; }
  }
  if (line) lines.push(line);
  lines = lines.slice(0, 3);

  const lineH = descFontSize + 9;
  const tagH  = 28;
  const validTags = tags.filter(t => t.trim());

  const blockH =
    Math.round(nfs * 0.9) +
    (hasSubtitle ? 30 : 0) +
    18 +
    lines.length * lineH +
    (validTags.length > 0 ? 22 + tagH : 0);

  const startY = Math.round((height - blockH) / 2);

  // Title
  ctx.font = `700 ${nfs}px ${F}`;
  ctx.fillStyle = pal.FG;
  const titleY = startY + Math.round(nfs * 0.82);
  ctx.fillText(name, cX, titleY);
  let cursor = titleY;

  // Subtitle
  if (hasSubtitle) {
    cursor += 28;
    ctx.font = `700 14px ${F}`;
    ctx.fillStyle = ACC;
    ctx.fillText(subtitle.toUpperCase(), cX, cursor);
  }

  // Description
  cursor += 22;
  ctx.font = `400 ${descFontSize}px ${F}`;
  ctx.fillStyle = pal.DESC;
  lines.forEach((l, i) => { ctx.fillText(l, cX, cursor + i * lineH); });

  // Tags
  if (validTags.length > 0) {
    cursor += lines.length * lineH + 20;
    ctx.font = `700 11px ${F}`;
    ctx.textBaseline = "middle";
    let tx = cX;
    const chipCY = cursor - tagH / 2 + 4;

    validTags.forEach((tag, i) => {
      const label = tag.trim().toUpperCase();
      const tw = ctx.measureText(label).width;
      const chipW = tw + 24;
      const chipX = tx;
      const chipY = chipCY - tagH / 2;
      const isAccent = i === validTags.length - 1;

      ctx.fillStyle = isAccent ? ACC : pal.TAG_BG;
      ctx.fillRect(chipX, chipY, chipW, tagH);
      ctx.strokeStyle = isAccent ? ACC : pal.BORDER;
      ctx.lineWidth = 1;
      ctx.strokeRect(chipX, chipY, chipW, tagH);
      ctx.fillStyle = isAccent ? pal.BG : pal.TAG_TEXT;
      ctx.fillText(label, chipX + chipW / 2 - tw / 2, chipCY);
      tx += chipW + 6;
    });
    ctx.textBaseline = "alphabetic";
  }
}

export default function BannerGenerator() {
  const [name, setName]               = useState("cyberdrop-client");
  const [subtitle, setSubtitle]       = useState("Async API Client + Typed Models");
  const [description, setDescription] = useState("A Rust API client for Cyberdrop with async support and typed models. Works with both cyberdrop.cr and bunkr.cr endpoints.");
  const [tagsInput, setTagsInput]     = useState("MCP-NATIVE, ASYNC, .CRBL");
  const [accentIdx, setAccentIdx]     = useState(0);
  const [bgStyle, setBgStyle]         = useState("WAVE");
  const [colorMode, setColorMode]     = useState("dark");
  const [fontReady, setFontReady]     = useState(false);
  const canvasRef = useRef(null);
  const W = 1400, H = 280;
  const tags   = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
  const accent = ACCENTS[accentIdx];
  const isDark = colorMode === "dark";

  // UI palette mirrors the banner mode
  const ui = {
    pageBg:    isDark ? "#070705" : "#e8e7e0",
    panelBg:   isDark ? "#070705" : "#ededE6",
    panelBorder: isDark ? "#161612" : "#c8c6be",
    text:      isDark ? "#c8c6bc" : "#2a2a22",
    label:     isDark ? "#484840" : "#888880",
    inputBg:   isDark ? "#090907" : "#f2f1ea",
    inputBorder: isDark ? "#1e1e18" : "#c0beb6",
    inputText: isDark ? "#c8c6bc" : "#1a1a14",
    h1:        isDark ? "#e8e6dc" : "#111110",
    meta:      isDark ? "#2e2e28" : "#aaa89e",
  };

  useEffect(() => {
    loadFonts().then(() => setFontReady(true));
  }, []);

  const render = useCallback(() => {
    if (!canvasRef.current || !fontReady) return;
    drawBanner(canvasRef.current, { name, subtitle, description, tags, accent, bgStyle, colorMode, width: W, height: H });
  }, [name, subtitle, description, tags, accent, bgStyle, colorMode, fontReady]);

  useEffect(() => { render(); }, [render]);

  const download = () => {
    const a = document.createElement("a");
    a.download = `${name || "banner"}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  const lbl = {
    display: "block", fontSize: 10, color: ui.label, marginBottom: 5,
    letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
  };
  const inp = {
    background: ui.inputBg, border: `1px solid ${ui.inputBorder}`, color: ui.inputText,
    padding: "8px 12px", fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
    outline: "none", width: "100%", boxSizing: "border-box", borderRadius: 0,
    transition: "border-color 0.15s",
  };
  const focusAcc = (e) => { e.target.style.borderColor = accent.color; };
  const blurAcc  = (e) => { e.target.style.borderColor = ui.inputBorder; };
  const toggleBtn = (active) => ({
    padding: "5px 16px",
    border: active ? `1px solid ${accent.color}` : `1px solid ${ui.inputBorder}`,
    background: active ? accent.color + "18" : "transparent",
    color: active ? accent.color : ui.label,
    cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.1em", borderRadius: 0, transition: "all 0.12s",
  });

  return (
    <div style={{ minHeight: "100vh", background: ui.pageBg, color: ui.text, fontFamily: "'JetBrains Mono', monospace", padding: "28px 20px", boxSizing: "border-box", transition: "background 0.2s" }}>
      <div style={{ width: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22, borderBottom: `1px solid ${ui.panelBorder}`, paddingBottom: 14 }}>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: ui.h1, letterSpacing: "0.06em", textTransform: "uppercase" }}>README Hero Generator</h1>
          <span style={{ marginLeft: "auto", fontSize: 10, color: ui.meta, letterSpacing: "0.1em" }}>
            {fontReady ? "FONT READY · 1400×280 · @2x" : "LOADING FONT…"}
          </span>
          {/* Light/Dark toggle */}
          <button onClick={() => setColorMode(isDark ? "light" : "dark")} style={{
            padding: "5px 14px", border: `1px solid ${ui.inputBorder}`,
            background: "transparent", color: ui.text,
            cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.1em", borderRadius: 0, transition: "all 0.12s", flexShrink: 0,
          }}>
            {isDark ? "☀ LIGHT" : "☾ DARK"}
          </button>
        </div>

        {/* Canvas */}
        <div style={{ border: `1px solid ${ui.inputBorder}`, marginBottom: 18, boxShadow: `0 0 50px ${accent.color}10` }}>
          <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
        </div>

        {/* Fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: ui.panelBorder, border: `1px solid ${ui.panelBorder}`, marginBottom: 1 }}>
          <div style={{ background: ui.panelBg, padding: "14px 16px" }}>
            <label style={lbl}>Project Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inp} placeholder="my-project" onFocus={focusAcc} onBlur={blurAcc} />
          </div>
          <div style={{ background: ui.panelBg, padding: "14px 16px" }}>
            <label style={lbl}>Subtitle / Tagline</label>
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} style={inp} placeholder="Short tagline" onFocus={focusAcc} onBlur={blurAcc} />
          </div>
          <div style={{ background: ui.panelBg, padding: "14px 16px", gridColumn: "1/-1" }}>
            <label style={lbl}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              style={{ ...inp, resize: "vertical", lineHeight: 1.6 }} onFocus={focusAcc} onBlur={blurAcc} />
          </div>
          <div style={{ background: ui.panelBg, padding: "14px 16px", gridColumn: "1/-1" }}>
            <label style={lbl}>Tags — comma separated (last tag gets accent fill)</label>
            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} style={inp}
              placeholder="MCP-NATIVE, ASYNC, .EXT" onFocus={focusAcc} onBlur={blurAcc} />
          </div>
        </div>

        {/* Bottom controls */}
        <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr auto", alignItems: "center", gap: 24, background: ui.panelBg, border: `1px solid ${ui.panelBorder}`, padding: "14px 16px" }}>
          <div>
            <div style={{ ...lbl, marginBottom: 8 }}>Background</div>
            <div style={{ display: "flex", gap: 5 }}>
              {BACKGROUNDS.map(bg => (
                <button key={bg} onClick={() => setBgStyle(bg)} style={toggleBtn(bgStyle === bg)}>
                  {bg === "NONE" ? "✕ NONE" : bg === "DOTS" ? "⬝ DOTS" : bg === "WAVE" ? "≋ TOPO" : bg === "VOID" ? "▓ VOID" : "▐ ZEBRA"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ ...lbl, marginBottom: 8 }}>Accent Color</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {ACCENTS.map((a, i) => (
                <button key={a.name} onClick={() => setAccentIdx(i)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                  border: i === accentIdx ? `1px solid ${a.color}` : `1px solid ${ui.inputBorder}`,
                  background: i === accentIdx ? a.color + "18" : "transparent",
                  color: i === accentIdx ? a.color : ui.label,
                  cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.1em", borderRadius: 0,
                }}>
                  <div style={{ width: 8, height: 8, background: a.color, flexShrink: 0 }} />
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          <div />

          <button onClick={download} style={{
            background: accent.color, border: "none", color: isDark ? "#070705" : "#f2f1ea",
            padding: "10px 26px", fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800, cursor: "pointer", letterSpacing: "0.15em",
            textTransform: "uppercase", borderRadius: 0, alignSelf: "flex-end",
          }}
            onMouseEnter={e => e.target.style.opacity = "0.8"}
            onMouseLeave={e => e.target.style.opacity = "1"}
          >↓ EXPORT PNG</button>
        </div>

      </div>
    </div>
  );
}
