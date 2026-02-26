export default function BannerPreview({ ui, accentColor, canvasRef }) {
  return (
    <div
      style={{
        border: `1px solid ${ui.inputBorder}`,
        marginBottom: 18,
        boxShadow: `0 0 50px ${accentColor}10`,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
    </div>
  );
}
