import { gsap } from "./gsap";

document.querySelectorAll<HTMLElement>(".nav-btn").forEach((btn) => {
  const label = btn.querySelector<HTMLElement>(".label");
  const bar = btn.querySelector<HTMLElement>(".bar");

  if (!label || !bar) return; // TS forces you to handle the null case

  btn.addEventListener("mouseenter", () => {
    gsap.to(label, { y: -10, duration: 0.5, ease: "elastic.out(1,0.3)" });
    gsap.to(bar, {
      opacity: 1,
      scaleY: 1,
      duration: 0.8,
      ease: "elastic.out(1,0.3)",
    });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(label, { y: 0, duration: 0.5, ease: "elastic.out(1,0.3)" });
    gsap.to(bar, {
      opacity: 0,
      scaleY: 0,
      duration: 0.8,
      ease: "elastic.out(1,0.3)",
    });
  });
});
