const PALETTE = {
  dark: {
    BG: "#0e0e0c",
    BORDER: "#2e2e26",
    FG: "#e8e6dc",
    DESC: "#b8b6ac",
    TAG_BG: "#181816",
    TAG_TEXT: "#e8e6dc",
    DOT: "#2a2a26",
    PATTERN_BASE: 0.12,
    PATTERN_INV: false,
  },
  light: {
    BG: "#f2f1ea",
    BORDER: "#111111",
    FG: "#111111",
    DESC: "#4a4a40",
    TAG_BG: "#111111",
    TAG_TEXT: "#f2f1ea",
    DOT: "#b8b6ae",
    PATTERN_BASE: 0.78,
    PATTERN_INV: true,
  },
};

export function createPatternSeed() {
  return {
    topoOffsetX: Math.random() * 1800,
    topoOffsetY: Math.random() * 1800,
    topoScaleX: 0.018 + Math.random() * 0.012,
    topoScaleY: 0.03 + Math.random() * 0.015,
    topoBandwidth: 0.018 + Math.random() * 0.012,
    topoDotScale: 0.82 + Math.random() * 0.55,
    voidOffsetA: Math.random() * 1800,
    voidOffsetB: Math.random() * 1800,
    voidOffsetC: Math.random() * 1800,
    voidOffsetD: Math.random() * 1800,
    voidWarpPrimaryX: 68 + Math.random() * 40,
    voidWarpSecondaryX: 24 + Math.random() * 26,
    voidWarpPrimaryY: 70 + Math.random() * 42,
    voidWarpSecondaryY: 24 + Math.random() * 26,
    voidLevels: 14 + Math.floor(Math.random() * 6),
    voidLevelSpread: 1.3 + Math.random() * 0.45,
    voidLineBoost: 0.88 + Math.random() * 0.32,
    zebraOffsetX: Math.random() * 1500,
    zebraOffsetY: Math.random() * 1500,
    zebraStripeCount: 8.8 + Math.random() * 3.6,
    zebraWarpFreqX: 0.005 + Math.random() * 0.006,
    zebraWarpFreqY: 0.018 + Math.random() * 0.013,
    zebraWarpAmp: 1 + Math.random() * 1,
    zebraThreshold: 0.42 + Math.random() * 0.16,
    zebraAlpha: 0.72 + Math.random() * 0.16,
    zebraBrightnessShift: -0.02 + Math.random() * 0.05,
  };
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function noise(x, y) {
  return (
    Math.sin(x * 0.8 + y * 1.3) * 0.4 +
    Math.sin(x * 1.7 - y * 0.6 + 2.1) * 0.25 +
    Math.sin(x * 0.4 + y * 2.1 + 4.3) * 0.2 +
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

function drawSquareGrid(ctx, width, height, pal) {
  const spacing = 40;
  const v = pal.PATTERN_INV ? 92 : 62;
  const alpha = pal.PATTERN_INV ? 0.26 : 0.34;
  ctx.save();
  ctx.strokeStyle = `rgba(${v},${v},${v},${alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += spacing) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = 0; y <= height; y += spacing) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

function drawScan(ctx, width, height, pal) {
  const inv = pal.PATTERN_INV;
  const lineGap = 4;
  const baseV = inv ? 72 : 48;

  for (let y = 1; y < height; y += lineGap) {
    const yWave = noise(0, y * 0.07);
    const alpha = inv ? 0.12 + yWave * 0.03 : 0.18 + yWave * 0.04;
    ctx.strokeStyle = `rgba(${baseV},${baseV},${baseV},${Math.max(0.08, alpha).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();

    let drawing = true;
    let segmentStart = 0;
    for (let x = 0; x <= width; x += 8) {
      const jitter = noise(x * 0.042 + 3.8, y * 0.08 - 2.1);
      const lineY = y + jitter * 0.7;
      const dropout = noise(x * 0.08 + 14.5, y * 0.22 + 7.1);
      const shouldDraw = dropout > -0.56;

      if (shouldDraw && !drawing) {
        drawing = true;
        segmentStart = x;
      } else if (!shouldDraw && drawing) {
        drawing = false;
        ctx.moveTo(segmentStart, lineY);
        ctx.lineTo(x, lineY);
      }
    }
    if (drawing) {
      const endJitter = noise(width * 0.042 + 3.8, y * 0.08 - 2.1);
      const endY = y + endJitter * 0.7;
      ctx.moveTo(segmentStart, endY);
      ctx.lineTo(width, endY);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 3; i++) {
    const y = Math.round((i + 1) * (height / 4) + noise(i * 3.1, 4.8) * 8);
    const v = inv ? 96 : 66;
    ctx.strokeStyle = `rgba(${v},${v},${v},${inv ? "0.12" : "0.16"})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }
}

function drawTopoWave(ctx, width, height, pal, seed) {
  const stepX = 5;
  const stepY = 5;
  const levels = 14;
  const scaleX = seed.topoScaleX;
  const scaleY = seed.topoScaleY;
  const inv = pal.PATTERN_INV;

  for (let px = 0; px < width; px += stepX) {
    for (let py = 0; py < height; py += stepY) {
      const val = noise((px + seed.topoOffsetX) * scaleX, (py + seed.topoOffsetY) * scaleY);
      const n = (val + 1) / 2;
      const levelStep = 1 / levels;
      let minDist = Infinity;
      for (let i = 0; i <= levels; i++) {
        const d = Math.abs(n - i * levelStep);
        if (d < minDist) minDist = d;
      }
      const bandwidth = seed.topoBandwidth;
      if (minDist < bandwidth) {
        const proximity = 1 - minDist / bandwidth;
        const levelNorm = Math.round(n / levelStep) / levels;
        const rawBrightness = 0.12 + levelNorm * 0.18;
        const brightness = inv ? 1 - rawBrightness : rawBrightness;
        const alpha = (0.25 + proximity * 0.55) * (0.4 + levelNorm * 0.6);
        const v = Math.round(brightness * 255);
        ctx.fillStyle = `rgba(${v},${v},${v},${alpha.toFixed(2)})`;
        const dotR = (0.75 + proximity * 0.78 + levelNorm * 0.35) * seed.topoDotScale;
        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function sampleVoidField(x, y, seed) {
  const warpX =
    noise((x + seed.voidOffsetA) * 0.006 + 4.1, (y - seed.voidOffsetB) * 0.006 - 1.9) * seed.voidWarpPrimaryX +
    noise((x - seed.voidOffsetC) * 0.014 - 3.2, (y + seed.voidOffsetD) * 0.01 + 2.7) * seed.voidWarpSecondaryX;
  const warpY =
    noise((x - seed.voidOffsetD) * 0.006 - 2.6, (y + seed.voidOffsetA) * 0.006 + 3.4) * seed.voidWarpPrimaryY +
    noise((x + seed.voidOffsetB) * 0.012 + 1.8, (y - seed.voidOffsetC) * 0.012 - 4.3) * seed.voidWarpSecondaryY;
  const wx = x + warpX;
  const wy = y + warpY;

  const base =
    noise(wx * 0.013, wy * 0.028) * 0.84 +
    noise(wx * 0.039 + 7.3, wy * 0.021 + 11.6) * 0.44 +
    noise((wx + wy * 0.33) * 0.018, (wy - wx * 0.27) * 0.02) * 0.31;

  const flow =
    Math.sin(wx * 0.018 + wy * 0.01 + noise(x * 0.012, y * 0.012) * 2.1) * 0.18 +
    Math.cos(wx * 0.01 - wy * 0.019 + noise(x * 0.017 + 2.4, y * 0.015 - 1.7) * 1.7) * 0.13;

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

function drawVoid(ctx, width, height, pal, seed) {
  const inv = pal.PATTERN_INV;
  const step = 5;
  const cols = Math.ceil(width / step);
  const rows = Math.ceil(height / step);
  const field = Array.from({ length: rows + 1 }, () => new Float32Array(cols + 1));

  for (let gy = 0; gy <= rows; gy++) {
    for (let gx = 0; gx <= cols; gx++) {
      field[gy][gx] = sampleVoidField(gx * step, gy * step, seed);
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

  const levels = seed.voidLevels;
  const minLevel = -seed.voidLevelSpread;
  const maxLevel = seed.voidLevelSpread;
  for (let i = 0; i < levels; i++) {
    const t = i / Math.max(1, levels - 1);
    const level = minLevel + (maxLevel - minLevel) * t;
    const rawBrightness = 0.12 + t * 0.2;
    const brightness = inv ? 1 - rawBrightness : rawBrightness;
    const v = Math.round(brightness * 255);
    const alpha = 0.22 + (1 - Math.abs(t - 0.5) * 1.65) * 0.36;

    ctx.strokeStyle = `rgba(${v},${v},${v},${Math.max(0.08, alpha).toFixed(2)})`;
    ctx.lineWidth = (0.9 + (1 - Math.abs(t - 0.5) * 1.4) * 0.8) * seed.voidLineBoost;
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

function drawZebra(ctx, width, height, pal, seed, deviceScale = 1) {
  const stripeWidth = width / seed.zebraStripeCount;
  const inv = pal.PATTERN_INV;
  const sampleScale = Math.max(1, Math.round(deviceScale));
  const w = Math.floor(width * sampleScale);
  const h = Math.floor(height * sampleScale);
  const alpha = Math.round(Math.round(seed.zebraAlpha * 100) / 100 * 255);

  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const octx = offscreen.getContext("2d");
  const img = octx.createImageData(w, h);
  const data = img.data;

  for (let sy = 0; sy < h; sy++) {
    const py = sy / sampleScale;
    for (let sx = 0; sx < w; sx++) {
      const px = sx / sampleScale;
      const warp = noise(
        (py + seed.zebraOffsetY) * seed.zebraWarpFreqY,
        (px + seed.zebraOffsetX) * seed.zebraWarpFreqX,
      ) * stripeWidth * seed.zebraWarpAmp;
      const warpedX = px + warp;
      const bandPos = ((warpedX / stripeWidth) % 1 + 1) % 1;
      const isLight = bandPos < seed.zebraThreshold;
      if (isLight) {
        const rawBrightness = clamp01(0.1 + bandPos * 0.14 + seed.zebraBrightnessShift);
        const brightness = clamp01(inv ? 1 - rawBrightness : rawBrightness);
        const v = Math.round(brightness * 255);
        const i = (sy * w + sx) * 4;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = alpha;
      }
    }
  }

  octx.putImageData(img, 0, 0);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
}

export function drawBanner(
  canvas,
  { name, subtitle, description, tags, accent, bgStyle, colorMode, patternSeed, width, height },
) {
  const ctx = canvas.getContext("2d");
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  ctx.scale(dpr, dpr);

  const pal = PALETTE[colorMode];
  const ACC = accent.color;
  const F = "'JetBrains Mono', monospace";

  ctx.fillStyle = pal.BG;
  ctx.fillRect(0, 0, width, height);

  if (bgStyle === "DOTS") drawDotGrid(ctx, width, height, pal);
  else if (bgStyle === "GRID") drawSquareGrid(ctx, width, height, pal);
  else if (bgStyle === "SCAN") drawScan(ctx, width, height, pal);
  else if (bgStyle === "WAVE") drawTopoWave(ctx, width, height, pal, patternSeed);
  else if (bgStyle === "VOID") drawVoid(ctx, width, height, pal, patternSeed);
  else if (bgStyle === "ZEBRA") drawZebra(ctx, width, height, pal, patternSeed, dpr);

  const pad = 20;

  ctx.strokeStyle = pal.BORDER;
  ctx.lineWidth = 2;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  ctx.textAlign = "left";
  const cX = pad + 36;
  const nfs = name.length > 22 ? 42 : name.length > 16 ? 52 : name.length > 10 ? 62 : 72;
  const hasSubtitle = subtitle && subtitle.trim().length > 0;

  const descFontSize = 16;
  ctx.font = `400 ${descFontSize}px ${F}`;
  const maxW = width - cX - pad - 40;
  const words = description.split(" ");
  let line = "";
  let lines = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines = lines.slice(0, 3);

  const lineH = descFontSize + 9;
  const tagH = 28;
  const validTags = tags.filter((t) => t.trim());

  const blockH =
    Math.round(nfs * 0.9) +
    (hasSubtitle ? 30 : 0) +
    18 +
    lines.length * lineH +
    (validTags.length > 0 ? 22 + tagH : 0);

  const startY = Math.round((height - blockH) / 2);

  ctx.font = `700 ${nfs}px ${F}`;
  ctx.fillStyle = pal.FG;
  const titleY = startY + Math.round(nfs * 0.82);
  ctx.fillText(name, cX, titleY);
  let cursor = titleY;

  if (hasSubtitle) {
    cursor += 28;
    ctx.font = `700 14px ${F}`;
    ctx.fillStyle = ACC;
    ctx.fillText(subtitle.toUpperCase(), cX, cursor);
  }

  cursor += 22;
  ctx.font = `400 ${descFontSize}px ${F}`;
  ctx.fillStyle = pal.DESC;
  lines.forEach((l, i) => {
    ctx.fillText(l, cX, cursor + i * lineH);
  });

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
