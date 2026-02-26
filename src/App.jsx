import { useRef } from "react";
import {
  BannerControls,
  BannerFields,
  BannerHeader,
  BannerPreview,
} from "./features/banner/components";
import { ACCENTS, BACKGROUNDS } from "./features/banner/config";
import { useBannerRenderer, useBannerState } from "./features/banner/hooks";

export default function BannerGenerator() {
  const canvasRef = useRef(null);
  const width = 1400;
  const height = 280;

  const {
    name,
    setName,
    subtitle,
    setSubtitle,
    description,
    setDescription,
    tagsInput,
    setTagsInput,
    accentIdx,
    accentColor,
    bgStyle,
    colorMode,
    setColorMode,
    patternSeed,
    tags,
    accent,
    isDark,
    canRerollPattern,
    ui,
    handleBackgroundChange,
    rerollPattern,
    selectAccent,
    selectCustomAccent,
  } = useBannerState();

  const { fontReady, download } = useBannerRenderer({
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
  });

  const customColorInputRef = useRef(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ui.pageBg,
        color: ui.text,
        fontFamily: "'JetBrains Mono', monospace",
        padding: "28px 20px",
        boxSizing: "border-box",
        transition: "background 0.2s",
      }}
    >
      <div style={{ width: "100%" }}>
        <BannerHeader
          ui={ui}
          fontReady={fontReady}
          isDark={isDark}
          onToggleColorMode={() => setColorMode(isDark ? "light" : "dark")}
        />
        <BannerPreview ui={ui} accentColor={accent.color} canvasRef={canvasRef} />
        <BannerFields
          ui={ui}
          accentColor={accent.color}
          name={name}
          subtitle={subtitle}
          description={description}
          tagsInput={tagsInput}
          onNameChange={setName}
          onSubtitleChange={setSubtitle}
          onDescriptionChange={setDescription}
          onTagsInputChange={setTagsInput}
        />
        <BannerControls
          ui={ui}
          backgrounds={BACKGROUNDS}
          bgStyle={bgStyle}
          onBackgroundChange={handleBackgroundChange}
          canRerollPattern={canRerollPattern}
          onRerollPattern={rerollPattern}
          accents={ACCENTS}
          accent={accent}
          accentIdx={accentIdx}
          onSelectAccent={selectAccent}
          customColorInputRef={customColorInputRef}
          accentColor={accentColor}
          onSelectCustomAccent={selectCustomAccent}
          onDownload={download}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
