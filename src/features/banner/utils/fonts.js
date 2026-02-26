export async function loadFonts() {
  const faces = [
    {
      weight: "400",
      url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOV.woff2",
    },
    {
      weight: "700",
      url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD-IQ-PuZJJXxfpAO-Lf1OQk6OThxPA.woff2",
    },
  ];
  try {
    await Promise.all(
      faces.map(async ({ weight, url }) => {
        const f = new FontFace("JetBrains Mono", `url(${url}) format('woff2')`, { weight });
        const loaded = await f.load();
        document.fonts.add(loaded);
      }),
    );
    await document.fonts.ready;
  } catch (e) {
    console.warn("Font load failed", e);
  }
}
