export default function BannerHeader({ ui, fontReady, isDark, onToggleColorMode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 22,
        borderBottom: `1px solid ${ui.panelBorder}`,
        paddingBottom: 14,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 17,
          fontWeight: 800,
          color: ui.h1,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        README Hero Generator
      </h1>
      <span style={{ marginLeft: "auto", fontSize: 10, color: ui.meta, letterSpacing: "0.1em" }}>
        {fontReady ? "FONT READY · 1400×280 · @2x" : "LOADING FONT…"}
      </span>
      <button
        onClick={onToggleColorMode}
        style={{
          padding: "5px 14px",
          border: `1px solid ${ui.inputBorder}`,
          background: "transparent",
          color: ui.text,
          cursor: "pointer",
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.1em",
          borderRadius: 0,
          transition: "all 0.12s",
          flexShrink: 0,
        }}
      >
        {isDark ? "☀ LIGHT" : "☾ DARK"}
      </button>
    </div>
  );
}
