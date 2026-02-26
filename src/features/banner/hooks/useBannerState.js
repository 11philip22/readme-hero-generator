import { useMemo, useState } from "react";
import { createPatternSeed } from "../canvas/drawBanner";
import { ACCENTS } from "../config";

function makeUiPalette(isDark) {
  return {
    pageBg: isDark ? "#070705" : "#e8e7e0",
    panelBg: isDark ? "#070705" : "#ededE6",
    panelBorder: isDark ? "#161612" : "#c8c6be",
    text: isDark ? "#c8c6bc" : "#2a2a22",
    label: isDark ? "#484840" : "#888880",
    inputBg: isDark ? "#090907" : "#f2f1ea",
    inputBorder: isDark ? "#1e1e18" : "#c0beb6",
    inputText: isDark ? "#c8c6bc" : "#1a1a14",
    h1: isDark ? "#e8e6dc" : "#111110",
    meta: isDark ? "#2e2e28" : "#aaa89e",
  };
}

export function useBannerState() {
  const [name, setName] = useState("Project Title");
  const [subtitle, setSubtitle] = useState("Short project tagline");
  const [description, setDescription] = useState("A brief description of your project and what it does.");
  const [tagsInput, setTagsInput] = useState("TAG1, TAG2, TAG3");
  const [accentIdx, setAccentIdx] = useState(0);
  const [accentColor, setAccentColor] = useState(ACCENTS[0].color);
  const [bgStyle, setBgStyle] = useState("WAVE");
  const [colorMode, setColorMode] = useState("dark");
  const [patternSeed, setPatternSeed] = useState(() => createPatternSeed());

  const tags = useMemo(() => tagsInput.split(",").map((t) => t.trim()).filter(Boolean), [tagsInput]);
  const accent = useMemo(
    () => ({
      name: accentIdx >= 0 ? ACCENTS[accentIdx].name : "CUSTOM",
      color: accentColor,
    }),
    [accentIdx, accentColor],
  );
  const isDark = colorMode === "dark";
  const ui = useMemo(() => makeUiPalette(isDark), [isDark]);

  const handleBackgroundChange = (nextBg) => {
    setBgStyle(nextBg);
    if (nextBg === "WAVE" || nextBg === "VOID" || nextBg === "ZEBRA") {
      setPatternSeed(createPatternSeed());
    }
  };

  const selectAccent = (i, color) => {
    setAccentIdx(i);
    setAccentColor(color);
  };

  const selectCustomAccent = (color) => {
    setAccentIdx(-1);
    setAccentColor(color);
  };

  return {
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
    ui,
    handleBackgroundChange,
    selectAccent,
    selectCustomAccent,
  };
}
