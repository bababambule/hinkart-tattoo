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

document.querySelectorAll<HTMLElement>(".nav-btn--active").forEach((btn) => {
  const label = btn.querySelector<HTMLElement>(".label");
  const kanji = btn.querySelector<HTMLElement>(".kanji");
  const barLeft = btn.querySelector<HTMLElement>(".bar-left");
  const barRight = btn.querySelector<HTMLElement>(".bar-right");

  let tl = gsap.timeline();

  tl.from(label, {
    y: 25,
    opacity: 0,
    autoAlpha: 0,
    duration: 1,
    ease: "elastic.out(1,0.3)",
  });
  tl.from(
    kanji,
    {
      opacity: 0,
      y: 10,
      duration: 0.5,
      ease: "elastic.out(1,0.3)",
    },
    0.25,
  );
  tl.from(
    barLeft,
    {
      scaleX: 0,
      duration: 0.75,
      ease: "elastic.out(1,0.3)",
    },
    0.25,
  );
  tl.from(
    barRight,
    {
      scaleX: 0,
      duration: 0.75,
      ease: "elastic.out(1,0.3)",
    },
    0.25,
  );
});
