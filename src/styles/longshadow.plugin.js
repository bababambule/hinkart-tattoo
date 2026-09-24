import plugin from "tailwindcss/plugin";

const build = (steps) =>
  Array.from({ length: steps }, (_, idx) => {
    const i = idx + 1;
    const w = (((i - 1) / steps) * 100).toFixed(2);
    return `${i}px ${i}px color-mix(in srgb, var(--ls-to, transparent) ${w}%, var(--ls-from, currentColor))`;
  }).join(", ");

export default plugin(({ matchUtilities }) => {
  matchUtilities(
    {
      "long-shadow": (v) => ({ textShadow: build(Number(v)) }),
      "long-box-shadow": (v) => ({ boxShadow: build(Number(v)) }),
    },
    {
      values: { sm: "8", md: "16", lg: "32" },
    },
  );
});
