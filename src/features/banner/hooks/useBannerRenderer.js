import { useCallback, useEffect, useState } from "react";
import { drawBanner } from "../canvas/drawBanner";
import { loadFonts } from "../utils/fonts";

export function useBannerRenderer({
  canvasRef,
  name,
  subtitle,
  description,
  tags,
  accent,
  bgStyle,
  colorMode,
  patternSeed,
  width,
  height,
}) {
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadFonts().then(() => {
      if (active) setFontReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const render = useCallback(() => {
    if (!canvasRef.current || !fontReady) return;
    drawBanner(canvasRef.current, {
      name,
      subtitle,
      description,
      tags,
      accent,
      bgStyle,
      colorMode,
      patternSeed,
      width,
      height,
    });
  }, [canvasRef, fontReady, name, subtitle, description, tags, accent, bgStyle, colorMode, patternSeed, width, height]);

  useEffect(() => {
    render();
  }, [render]);

  const download = useCallback(() => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.download = `${name || "banner"}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  }, [canvasRef, name]);

  return { fontReady, download };
}
