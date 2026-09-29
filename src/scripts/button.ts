import { gsap } from 'gsap';

let buttons = document.querySelectorAll('.button');

buttons.forEach((button) => {
	let polygon = button.querySelector('polygon');

	let tl = gsap.timeline();
	tl.paused(true);

	tl.to(
		polygon,
		{
			duration: 0.3,
			ease: 'bounce.out',
			fill: 'var(--color-tree-poppy-600)',
			stroke: 'var(--color-winter-sky-600)',
			strokeWidth: 4,
		},
		0,
	);

	tl.to(
		'#displacementShadow feDropShadow',
		{
			attr: { 'flood-opacity': 0 },
			duration: 0.1,
		},
		0,
	);

	button?.addEventListener('mouseenter', () => {
		tl.play();
	});
	button?.addEventListener('mouseleave', () => {
		tl.reverse();
	});
});
