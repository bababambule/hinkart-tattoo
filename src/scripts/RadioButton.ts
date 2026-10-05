import { gsap } from 'gsap';
import MotionPathPlugin from 'gsap/MotionPathPlugin';
import { DrawSVGPlugin } from 'gsap/all';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

let radios = document.querySelectorAll('[data-form-element="circleSelector"]');

radios.forEach((radio) => {
	let input = radio.querySelector('input');
	let inputName = input?.getAttribute('name');
	let svg = radio.querySelector('svg');
	let svgPath = svg?.querySelector('path');

	let allMarkers = document.querySelectorAll(`.${inputName}svg`);
	//let marker = radio.nextElementSibling?.firstChild;

	gsap.set(allMarkers, { drawSVG: '0%' });

	radio.addEventListener('change', (e) => {
		if (input?.getAttribute('aria-multiselectable') === 'false') {
			gsap.set(allMarkers, { drawSVG: '0%' });
		}
		if (e.target.checked) {
			gsap.to(svgPath, {
				duration: 0.25,
				drawSVG: '100%',
				ease: 'power1.inOut',
			});
		} else {
			gsap.to(svgPath, {
				duration: 0.25,
				drawSVG: '0%',
				ease: 'power1.inOut',
			});
		}
	});
});
