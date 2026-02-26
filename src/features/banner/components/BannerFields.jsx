export default function BannerFields({
  ui,
  accentColor,
  secondaryTextColor,
  name,
  subtitle,
  description,
  tagsInput,
  onNameChange,
  onSubtitleChange,
  onDescriptionChange,
  onTagsInputChange,
}) {
  const lbl = {
    display: "block",
    fontSize: 10,
    color: secondaryTextColor,
    marginBottom: 5,
    letterSpacing: "0.15em",
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase",
  };
  const inp = {
    background: ui.inputBg,
    border: `1px solid ${ui.inputBorder}`,
    color: ui.inputText,
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 0,
    transition: "border-color 0.15s",
  };
  const focusAcc = (e) => {
    e.target.style.borderColor = accentColor;
  };
  const blurAcc = (e) => {
    e.target.style.borderColor = ui.inputBorder;
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 1,
        background: ui.panelBorder,
        border: `1px solid ${ui.panelBorder}`,
        marginBottom: 1,
      }}
    >
      <div style={{ background: ui.panelBg, padding: "14px 16px" }}>
        <label style={lbl}>Project Name</label>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          style={inp}
          placeholder="my-project"
          onFocus={focusAcc}
          onBlur={blurAcc}
        />
      </div>
      <div style={{ background: ui.panelBg, padding: "14px 16px" }}>
        <label style={lbl}>Subtitle / Tagline</label>
        <input
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          style={inp}
          placeholder="Short tagline"
          onFocus={focusAcc}
          onBlur={blurAcc}
        />
      </div>
      <div style={{ background: ui.panelBg, padding: "14px 16px", gridColumn: "1/-1" }}>
        <label style={lbl}>Description</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
          onFocus={focusAcc}
          onBlur={blurAcc}
        />
      </div>
      <div style={{ background: ui.panelBg, padding: "14px 16px", gridColumn: "1/-1" }}>
        <label style={lbl}>Tags — comma separated (last tag gets accent fill)</label>
        <input
          value={tagsInput}
          onChange={(e) => onTagsInputChange(e.target.value)}
          style={inp}
          placeholder="MCP-NATIVE, ASYNC, .EXT"
          onFocus={focusAcc}
          onBlur={blurAcc}
        />
      </div>
    </div>
  );
}
