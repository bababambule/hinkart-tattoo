import { gsap } from 'gsap';
import hoverS from '../assets/images/studio/studio-hover-s.jpg';
import hoverT from '../assets/images/studio/studio-hover-t.jpg';
import hoverU from '../assets/images/studio/studio-hover-u.jpg';
import hoverD from '../assets/images/studio/studio-hover-d.jpg';
import hoverI from '../assets/images/studio/studio-hover-i.jpg';
import hoverO from '../assets/images/studio/studio-hover-o.jpg';

let letterS = document.getElementById('letterS');
let letterT = document.getElementById('letterT');
let letterU = document.getElementById('letterU');
let letterD = document.getElementById('letterD');
let letterI = document.getElementById('letterI');
let letterO = document.getElementById('letterO');
let image = document.getElementById('svgImage');
let agent = navigator.userAgent.toLowerCase();

function imageHover(element: HTMLElement, target: object) {
	let anim = gsap.to(image, {
		attr: { href: target.src },
		duration: 0,
		paused: true,
	});

	element.addEventListener('mouseover', () => {
		tl.pause();
		anim.play();
	});
	element.addEventListener('mouseleave', () => {
		tl.resume();
		anim.reverse();
	});
}

imageHover(letterS, hoverS);
imageHover(letterT, hoverT);
imageHover(letterU, hoverU);
imageHover(letterD, hoverD);
imageHover(letterI, hoverI);
imageHover(letterO, hoverO);

let tl = gsap.timeline();
tl.pause();

tl.to(image, {
	attr: { href: hoverS.src },
	duration: 0,
	delay: 2,
});

tl.to(image, {
	attr: { href: hoverT.src },
	duration: 0,
	delay: 2,
});

tl.to(image, {
	attr: { href: hoverU.src },
	duration: 0,
	delay: 2,
});

tl.to(image, {
	attr: { href: hoverD.src },
	duration: 0,
	delay: 2,
});

tl.to(image, {
	attr: { href: hoverI.src },
	duration: 0,
	delay: 2,
});

tl.to(image, {
	attr: { href: hoverO.src },
	duration: 0,
	delay: 2,
});

if (agent.includes('iphone') || agent.includes('android')) {
	// console.log('smartphone');
} else {
	// console.log('desktop');
	tl.play();
	tl.repeat(-1);
}
