import EmblaCarousel from "embla-carousel";
import { gsap } from "gsap";
import classNames from "embla-carousel-class-names";

const wrapperNode = document.querySelector(".embla");
const viewportNode = wrapperNode.querySelector(".embla__viewport");
const prevButtonNode = wrapperNode.querySelector(".embla__prev");
const nextButtonNode = wrapperNode.querySelector(".embla__next");

const emblaApi = EmblaCarousel(
  viewportNode,
  {
    loop: true,
    align: "center",
    inViewThreshold: 0.5,
  },
  [
    classNames({
      active: true,
      loop: ["is-loop"],
    }),
  ],
);

let allSlides = emblaApi.slideNodes();
let slidesInView: string[];
let currentSlide: number;
let sliderSize: number;

function clearClasses() {
  allSlides.forEach((slide) => {
    slide.classList.remove("prev");
    slide.classList.remove("next");
    slide.classList.remove("active");
  });
}

function assignClasses() {
  slidesInView.forEach((slideIndex) => {
    let distanceForward =
      (slideIndex - currentSlide + (sliderSize + 1)) % (sliderSize + 1);
    let distanceBackward = sliderSize + 1 - distanceForward;

    if (distanceBackward < distanceForward) {
      allSlides[parseInt(slideIndex)].classList.add("prev");
    } else {
      allSlides[parseInt(slideIndex)].classList.add("next");
    }
  });
}

function checkActiveSlide() {
  allSlides.forEach((element) => {
    let slideIndex = element.getAttribute("data-slide-index");
    let video = element.querySelector("video");

    if (parseInt(slideIndex) == currentSlide) {
      element.classList.remove("next");
      element.classList.remove("prev");
      element.classList.add("active");
      video?.play();
    } else {
      element.classList.remove("active");
      video?.pause();
    }
  });
}

function clickToScroll() {
  allSlides.forEach((slide) => {
    let slideIndex = slide.getAttribute("data-slide-index");
    slide.addEventListener("click", () => {
      emblaApi.scrollTo(parseInt(slideIndex), false);
    });
  });
}

emblaApi.on("init", (emblaApi) => {
  currentSlide = emblaApi.selectedScrollSnap();
  sliderSize = allSlides.length - 1;
  checkActiveSlide();
});

emblaApi.on("select", (emblaApi) => {
  currentSlide = emblaApi.selectedScrollSnap();
  checkActiveSlide();
});

emblaApi.on("slidesInView", (emblaApi) => {
  slidesInView = emblaApi.slidesInView();
  currentSlide = emblaApi.selectedScrollSnap();
  clearClasses();
  assignClasses();
  checkActiveSlide();

  document.querySelectorAll(".prev").forEach((item) => {
    gsap.to(item.querySelector(".video__wrapper"), {
      clipPath: "polygon(0% 0%, 95% 0%, 100% 100%, 5% 100%",
      height: "75%",
      duration: 0.5,
      ease: "elastic.out(1,0.3)",
    });

    gsap.to(item.querySelector(".video__overlay"), {
      background: "var(--color-daintree-600)",
    });

    gsap.to(item.querySelector("video"), {
      clipPath: "polygon(0% 0%, 95% 0%, 100% 100%, 5% 100%",
    });
    gsap.to(item.querySelector(".artist__name"), {
      color: "var(--color-daintree-600)",
      scale: 1,
      zIndex: 10,
      duration: 0.5,
      ease: "elastic.out(1,0.3)",
    });
    gsap.to(item.querySelector(".artist__name--shadow"), {
      color: "var(--color-daintree-1000)",
      scale: 1,
      x: 0,
      y: 0,
      zIndex: 0,
      duration: 1,
      ease: "elastic.out(1,0.3)",
      webkitTextStrokeWidth: "0.5rem",
    });
  });

  document.querySelectorAll(".active").forEach((item) => {
    gsap.to(item.querySelector(".video__wrapper"), {
      clipPath: "polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%",
      height: "100%",
      duration: 1,
      ease: "elastic.out(1,0.3)",
    });

    gsap.to(item.querySelector(".video__overlay"), {
      background: "var(--color-winter-sky-600)",
      mixBlendMode: "overlay",
    });

    gsap.to(item.querySelector("video"), {
      clipPath: "polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%",
    });

    gsap.to(item.querySelector(".artist__name"), {
      color: "var(--color-winter-sky-600)",
      scale: 1.5,
      zIndex: 10,
      duration: 1,
      ease: "elastic.out(1,0.3)",
    });

    gsap.to(item.querySelector(".artist__name--shadow"), {
      color: "var(--color-winter-sky-100)",
      scale: 1.5,
      x: "-0.25rem",
      y: "0.25rem",
      zIndex: 8,
      duration: 1,
      ease: "elastic.out(1,0.3)",
      webkitTextStrokeWidth: "1rem",
    });
  });

  document.querySelectorAll(".next").forEach((item) => {
    gsap.to(item.querySelector(".video__wrapper"), {
      clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%",
      height: "75%",
      duration: 0.5,
      ease: "elastic.out(1,0.3)",
    });
    gsap.to(item.querySelector(".video__overlay"), {
      background: "var(--color-daintree-600)",
    });
    gsap.to(item.querySelector("video"), {
      clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%",
    });
    gsap.to(item.querySelector(".artist__name"), {
      color: "var(--color-daintree-600)",
      scale: 1,
      zIndex: 10,
      duration: 0.5,
      ease: "elastic.out(1,0.3)",
    });
    gsap.to(item.querySelector(".artist__name--shadow"), {
      color: "var(--color-daintree-1000)",
      scale: 1,
      x: 0,
      y: 0,
      zIndex: 0,
      duration: 1,
      ease: "elastic.out(1,0.3)",
      webkitTextStrokeWidth: "0.5rem",
    });
  });
});

clickToScroll();
prevButtonNode.addEventListener("click", () => emblaApi.scrollPrev(), false);
nextButtonNode.addEventListener("click", () => emblaApi.scrollNext(), false);
