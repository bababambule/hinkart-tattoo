import { gsap } from 'gsap';
import baseImage from '../assets/images/studio/studio-example.jpg';
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

/* function shapeHover(element: HTMLElement) {
	element.addEventListener('mouseover', () => {
		//tl.pause();
		shapeFill.play();
		anim.play();
	});
	element.addEventListener('mouseleave', () => {
		anim.reverse();
		shapeFill.reverse();
		setTimeout(() => {
			//tl.resume();
		}, 5000);
	});
} */

function imageHover(element: HTMLElement, target: object) {
	let shapeFill = gsap.fromTo(
		'#shapeFill',
		{
			opacity: 1,
		},
		{
			opacity: 0,
			duration: 0.2,
			paused: true,
		},
	);

	let anim = gsap.to(image, {
		attr: { href: target.src },
		duration: 0,
		opacity: 1,
		paused: true,
	});

	element.addEventListener('mouseover', () => {
		//tl.pause();
		shapeFill.play();
		anim.play();
	});
	element.addEventListener('mouseleave', () => {
		anim.reverse();
		shapeFill.reverse();
		setTimeout(() => {
			//tl.resume();
		}, 5000);
	});
}

function imageSlider(timeline, element, delayTime: number) {
	timeline.fromTo(
		image,
		{
			opacity: 0,
		},
		{
			attr: { href: element.src },
			duration: 0.5,
			delay: delayTime,
			opacity: 1,
		},
	);
}

imageHover(letterS, hoverS);
imageHover(letterT, hoverT);
imageHover(letterU, hoverU);
imageHover(letterD, hoverD);
imageHover(letterI, hoverI);
imageHover(letterO, hoverO);

/* let tl = gsap.timeline();
imageSlider(tl, baseImage, 0);
imageSlider(tl, hoverS, 5);
imageSlider(tl, hoverT, 5);
imageSlider(tl, hoverU, 5);
imageSlider(tl, hoverD, 5);
imageSlider(tl, hoverI, 5);
imageSlider(tl, hoverO, 5);
tl.pause(); */

// gsap.set(image, { opacity: 1, attr: { href: baseImage.src } });

/* tl.to(image, {
	attr: { href: hoverS.src },
	duration: 0,
	delay: 5,
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
}); */

if (agent.includes('iphone') || agent.includes('android')) {
	// console.log('smartphone');
} else {
	setTimeout(() => {
		//tl.play();
	}, 5000);
	// console.log('desktop');
	// tl.play();
	//tl.repeat(-1);
}
