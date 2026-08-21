import { gsap } from "./gsap";

document.querySelectorAll<HTMLElement>(".footer-btn").forEach((btn) => {
  const label = btn.querySelector<HTMLElement>(".footer-btn__label");
  const icon = btn.querySelector<HTMLElement>(".footer-btn__icon");

  if (!label || !icon) return; // TS forces you to handle the null case

  btn.addEventListener("mouseenter", () => {
    gsap.to(label, {
      x: -4,
      duration: 0.5,
      ease: "elastic.out(1,0.3)",
    });

    gsap.to(icon, {
      x: 4,
      rotate: 6,
      duration: 0.8,
      ease: "elastic.out(1,0.3)",
    });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(label, {
      x: 0,
      duration: 0.5,
      ease: "elastic.out(1,0.3)",
    });

    gsap.to(icon, {
      x: 0,
      rotate: -3,
      duration: 0.8,
      ease: "elastic.out(1,0.3)",
    });
  });
});
