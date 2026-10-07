import { gsap } from 'gsap';

const nav = document.querySelector('nav');
const menuBtn = document.querySelector('#menuBtn');

console.log(menuBtn);
console.log(nav);

/* gsap.set(menu, {
	xPercent: 100,
});

let tl = gsap.timeline();
tl.pause();

tl.to(menu, {
	duration: 0.5,
	ease: 'power1.inOut',
	xPercent: 0,
});

menuBtn?.addEventListener('click', (e) => {
	if (menu?.ariaExpanded === 'true') {
		menuBtn.setAttribute('aria-expanded', 'false');

		menu?.setAttribute('aria-expanded', 'false');
		tl.reverse();
	} else {
		menuBtn.setAttribute('aria-expanded', 'true');
		menu?.setAttribute('aria-expanded', 'true');
		tl.play();
	}

	backdrop.addEventListener('click', (e) => {
		if (menu?.ariaExpanded === 'true') {
			menuBtn.setAttribute('aria-expanded', 'false');
			menu?.setAttribute('aria-expanded', 'false');
			tl.reverse();
		}
	});
}); */
