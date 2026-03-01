export default function BannerPreview({ ui, canvasRef }) {
  return (
    <div
      style={{
        border: `1px solid ${ui.inputBorder}`,
        marginBottom: 18,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
    </div>
  );
}
