import { gsap } from 'gsap';
import MotionPathPlugin from 'gsap/MotionPathPlugin';
import { DrawSVGPlugin } from 'gsap/all';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

let radios = document.querySelectorAll('input[type="radio"]');

radios.forEach((radio) => {
	let inputName = radio.getAttribute('name');
	let allMarkers = document.querySelectorAll(`.${inputName}svg`);
	let marker = radio.nextElementSibling?.firstChild;

	gsap.set(marker, { drawSVG: '0%' });

	radio.addEventListener('change', (event) => {
		gsap.set(allMarkers, { drawSVG: '0%' });
		gsap.to(marker, {
			duration: 0.25,
			drawSVG: '100%',
			ease: 'power1.inOut',
		});
	});
});
