import { gsap } from 'gsap';

const logo = document.querySelector('#hinkartLogo');
const strokeElements = logo?.querySelectorAll('[stroke-width]');
const feTurbulence = logo?.querySelector('feTurbulence');
const feDisplacementMap = logo?.querySelector('feDisplacementMap');

gsap.to(feTurbulence, {
	duration: 3,
	attr: {
		baseFrequency: gsap.utils.random(0, 0.02),
		numOctaves: () => gsap.utils.random(1, 5, 1),
	},
	snap: 'numOctaves',
	repeat: -1,
	yoyo: true,
	ease: 'none',
});

gsap.to(feDisplacementMap, {
	duration: 3,
	attr: {
		scale: gsap.utils.random(1, 5, 1),
	},
	repeat: -1,
});
