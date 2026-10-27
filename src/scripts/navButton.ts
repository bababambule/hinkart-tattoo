import { gsap } from "./gsap";

const ease = "elastic.out(1,0.3)";

// overwrite: true kills any running hover tween on the same element,
// so enter/leave/reset never fight each other
function hoverIn(btn: HTMLElement) {
  gsap.to(btn.querySelector(".label"), { y: -10, duration: 0.5, ease, overwrite: true });
  gsap.to(btn.querySelector(".bar"), { opacity: 1, scaleY: 1, duration: 0.8, ease, overwrite: true });
}

function hoverOut(btn: HTMLElement, instant = false) {
  gsap.to(btn.querySelector(".label"), { y: 0, duration: instant ? 0 : 0.5, ease, overwrite: true });
  gsap.to(btn.querySelector(".bar"), { opacity: 0, scaleY: 0, duration: instant ? 0 : 0.8, ease, overwrite: true });
}

document.querySelectorAll<HTMLElement>(".nav-btn").forEach((btn) => {
  btn.addEventListener("mouseenter", () => hoverIn(btn));
  btn.addEventListener("mouseleave", () => hoverOut(btn));
});

// The header is persisted across view transitions, so the server-rendered
// active state goes stale. Re-sync it on every navigation instead.
const activeTimelines = new Map<HTMLElement, ReturnType<typeof gsap.timeline>>();

document.querySelectorAll<HTMLElement>(".nav-btn--active").forEach((btn) => {
  const label = btn.querySelector<HTMLElement>(".label");
  const kanji = btn.querySelector<HTMLElement>(".kanji");
  const barLeft = btn.querySelector<HTMLElement>(".bar-left");
  const barRight = btn.querySelector<HTMLElement>(".bar-right");

  let tl = gsap.timeline({ paused: true });

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

  activeTimelines.set(btn, tl);
});

function isActivePath(url: string) {
  const path = window.location.pathname;
  return path === url || path.startsWith(`${url}/`);
}

function updateActiveNav() {
  document.querySelectorAll<HTMLElement>(".nav-btn").forEach((link) => {
    const active = isActivePath(link.dataset.navUrl ?? "");
    link.classList.toggle("hidden", active);
    link.classList.toggle("block", !active);

    // mouseleave doesn't fire while the view transition overlay covers the page,
    // so reset every link the cursor isn't actually over anymore
    if (active) hoverOut(link, true);
    else if (!link.matches(":hover")) hoverOut(link);
  });

  activeTimelines.forEach((tl, btn) => {
    const active = isActivePath(btn.dataset.navUrl ?? "");
    const wasVisible = !btn.classList.contains("hidden");
    btn.classList.toggle("hidden", !active);
    btn.classList.toggle("block", active);

    if (active && (!wasVisible || tl.progress() === 0)) tl.restart();
  });
}

// Fires on the initial load and after every client-side navigation
document.addEventListener("astro:page-load", updateActiveNav);
