import { gsap } from "gsap";

let rainbowEven = gsap.to("#rainbowEven", {
  duration: 1,
  y: 3,
  repeat: -1,
  yoyo: true,
  ease: "power1.inOut",
});

let rainbowOdd = gsap.to("#rainbowOdd", {
  duration: 1,
  y: -3,
  repeat: -1,
  yoyo: true,
  ease: "power1.inOut",
});
