import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const split = new SplitText("#kanjiTitle", { type: "chars" });

let tl = gsap.timeline();

tl.from(split.chars, {
  opacity: 0,
  translateY: 50,
  duration: 0.5,
  ease: "elastic.inOut(1,0.3)",
  stagger: {
    each: 0.025,
    from: "random",
  },
});

tl.to(split.chars, {
  rotation: () => gsap.utils.random(-15, 15),
  translateX: () => gsap.utils.random(-4, 4),
  translateY: () => gsap.utils.random(-4, 4),
  scale: () => gsap.utils.random(0.8, 1.2),
  duration: () => gsap.utils.random(0.2, 0.6),
  repeat: -1,
  stagger: {
    each: 0.05,
    from: "random",
  },
  yoyo: true,
  ease: "elastic.inOut(1,0.3)",
});
