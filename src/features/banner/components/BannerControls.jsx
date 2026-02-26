function labelStyle(ui) {
  return {
    display: "block",
    fontSize: 10,
    color: ui.label,
    marginBottom: 5,
    letterSpacing: "0.15em",
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase",
  };
}

function backgroundLabel(bg) {
  if (bg === "NONE") return "✕ NONE";
  if (bg === "DOTS") return "⬝ DOTS";
  if (bg === "GRID") return "▦ GRID";
  if (bg === "SCAN") return "≣ SCAN";
  if (bg === "WAVE") return "≋ TOPO";
  if (bg === "VOID") return "▓ VOID";
  return "▐ ZEBRA";
}

export default function BannerControls({
  ui,
  backgrounds,
  bgStyle,
  onBackgroundChange,
  canRerollPattern,
  onRerollPattern,
  accents,
  accent,
  accentIdx,
  onSelectAccent,
  customColorInputRef,
  accentColor,
  onSelectCustomAccent,
  onDownload,
  isDark,
}) {
  const lbl = labelStyle(ui);
  const toggleBtn = (active) => ({
    padding: "5px 16px",
    border: active ? `1px solid ${accent.color}` : `1px solid ${ui.inputBorder}`,
    background: active ? `${accent.color}18` : "transparent",
    color: active ? accent.color : ui.label,
    cursor: "pointer",
    fontSize: 10,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.1em",
    borderRadius: 0,
    transition: "all 0.12s",
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto 1fr auto",
        alignItems: "center",
        gap: 24,
        background: ui.panelBg,
        border: `1px solid ${ui.panelBorder}`,
        padding: "14px 16px",
      }}
    >
      <div>
        <div style={{ ...lbl, marginBottom: 8 }}>Background</div>
        <div style={{ display: "flex", gap: 5 }}>
          {backgrounds.map((bg) => (
            <button key={bg} onClick={() => onBackgroundChange(bg)} style={toggleBtn(bgStyle === bg)}>
              {backgroundLabel(bg)}
            </button>
          ))}
        </div>
        <button
          onClick={onRerollPattern}
          disabled={!canRerollPattern}
          style={{
            marginTop: 8,
            padding: "5px 12px",
            border: `1px solid ${canRerollPattern ? accent.color : ui.inputBorder}`,
            background: canRerollPattern ? `${accent.color}14` : "transparent",
            color: canRerollPattern ? accent.color : ui.label,
            cursor: canRerollPattern ? "pointer" : "default",
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.1em",
            borderRadius: 0,
          }}
        >
          ↻ VARIANT
        </button>
      </div>

      <div>
        <div style={{ ...lbl, marginBottom: 8 }}>Accent Color</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {accents.map((a, i) => (
            <button
              key={a.name}
              onClick={() => onSelectAccent(i, a.color)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                border: i === accentIdx ? `1px solid ${a.color}` : `1px solid ${ui.inputBorder}`,
                background: i === accentIdx ? `${a.color}18` : "transparent",
                color: i === accentIdx ? a.color : ui.label,
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em",
                borderRadius: 0,
              }}
            >
              <div style={{ width: 8, height: 8, background: a.color, flexShrink: 0 }} />
              {a.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const picker = customColorInputRef.current;
              if (!picker) return;
              if (typeof picker.showPicker === "function") picker.showPicker();
              else picker.click();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 10px",
              border: accentIdx === -1 ? `1px solid ${accent.color}` : `1px solid ${ui.inputBorder}`,
              background: accentIdx === -1 ? `${accent.color}18` : "transparent",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em",
                color: accentIdx === -1 ? accent.color : ui.label,
              }}
            >
              CUSTOM
            </span>
            <div
              style={{
                width: 20,
                height: 20,
                padding: 0,
                border: `1px solid ${ui.inputBorder}`,
                background: accentColor,
                boxSizing: "border-box",
              }}
            />
          </button>
          <input
            ref={customColorInputRef}
            type="color"
            value={accentColor}
            onChange={(e) => onSelectCustomAccent(e.target.value)}
            style={{
              position: "absolute",
              opacity: 0,
              width: 0,
              height: 0,
              pointerEvents: "none",
            }}
            aria-label="Custom accent color"
          />
        </div>
      </div>

      <div />

      <button
        onClick={onDownload}
        style={{
          background: accent.color,
          border: "none",
          color: isDark ? "#070705" : "#f2f1ea",
          padding: "10px 26px",
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800,
          cursor: "pointer",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          borderRadius: 0,
          alignSelf: "flex-end",
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = "0.8";
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = "1";
        }}
      >
        ↓ EXPORT PNG
      </button>
    </div>
  );
}
