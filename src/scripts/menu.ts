import { gsap } from './gsap';

const toggle = document.getElementById('menuBtn');
const nav = document.getElementById('site-nav');
const backdrop = document.querySelector<HTMLElement>('[data-ui="navBackground"]');

if (toggle && nav && backdrop) {
	const label = toggle.querySelector<HTMLElement>('[data-ui="buttonLabel"]');
	const labelKanji = toggle.querySelector<HTMLElement>('[data-ui="buttonKanji"]');
	const items = nav.querySelectorAll<HTMLElement>('[data-ui="navItem"]');
	const stickers = nav.querySelectorAll<HTMLElement>('[data-ui="navKanji"]');
	const socials = nav.querySelector<HTMLElement>('[data-ui="navSocials"]');
	const watermark = backdrop.querySelector<HTMLElement>('[data-ui="navBackgroundKanji"]');
	const animated = [backdrop, nav, ...items, ...stickers, socials, watermark].filter(Boolean);

	// Tailwind's max-lg breakpoint
	const mobile = window.matchMedia('(width < 64rem)');
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	let isOpen = false;
	let labelTl: ReturnType<typeof gsap.timeline> | null = null;

	// The toggle renders as <a href="">, so give it button semantics
	toggle.setAttribute('role', 'button');
	toggle.setAttribute('aria-controls', nav.id);
	toggle.setAttribute('aria-expanded', 'false');

	function setClosedState() {
		gsap.killTweensOf(animated);
		gsap.set(backdrop, { y: 0, yPercent: -90, skewY: 0 });
		gsap.set(nav, { autoAlpha: 0 });
		gsap.set(items, { x: 48, rotation: -4, autoAlpha: 0 });
		gsap.set(stickers, { scale: 0.4, rotation: -30, autoAlpha: 0 });
		gsap.set(socials, { y: 12, autoAlpha: 0 });
		gsap.set(watermark, { yPercent: -12, autoAlpha: 0 });
	}

	function setLabel(text: string, kanji: string, animate = true) {
		if (!label || !labelKanji) return;
		labelTl?.kill();

		if (!animate) {
			label.textContent = text;
			labelKanji.textContent = kanji;
			gsap.set([label, labelKanji], { clearProps: 'opacity,filter' });
			return;
		}

		// Blur bridges the two words so the swap reads as one morph
		labelTl = gsap
			.timeline()
			.to([label, labelKanji], { opacity: 0, filter: 'blur(4px)', duration: 0.1, ease: 'power1.in' })
			.add(() => {
				label.textContent = text;
				labelKanji.textContent = kanji;
			})
			.to([label, labelKanji], { opacity: 1, filter: 'blur(0px)', duration: 0.2, ease: 'power2.out', clearProps: 'filter' });
	}

	function syncState(animateLabel = true) {
		toggle!.setAttribute('aria-expanded', String(isOpen));
		document.documentElement.style.overflow = isOpen ? 'hidden' : '';
		document.querySelectorAll<HTMLElement>('body > :not(header)').forEach((el) => (el.inert = isOpen));
		setLabel(isOpen ? 'Close' : 'Menu', isOpen ? 'とじる' : 'メニュー', animateLabel);
	}

	function open() {
		isOpen = true;
		syncState();

		if (reducedMotion.matches) {
			gsap.set(backdrop, { yPercent: 0, skewY: 0 });
			gsap.set(items, { x: 0, rotation: 0 });
			gsap.set(stickers, { scale: 1, rotation: 0 });
			gsap.set(socials, { y: 0 });
			gsap.set(watermark, { yPercent: 0 });
			gsap.to([nav, ...items, ...stickers, socials, watermark], { autoAlpha: 1, duration: 0.2, overwrite: true });
			return;
		}

		// Re-deal the slabs from the right only when the sheet was fully up,
		// so reopening mid-close continues from wherever things are
		const fromClosed = Number(gsap.getProperty(backdrop, 'yPercent')) <= -89;
		if (fromClosed) {
			gsap.set(items, { x: 48, rotation: -4 });
			gsap.set(stickers, { scale: 0.4, rotation: -30 });
			gsap.set(socials, { y: 12 });
			gsap.set(watermark, { yPercent: -12 });
		}

		gsap.set(nav, { autoAlpha: 1 });
		// overwrite: true also kills a close tween still waiting out its delay
		gsap.to(backdrop, { yPercent: 0, skewY: 0, duration: 0.55, ease: 'expo.out', overwrite: true });
		if (fromClosed) gsap.fromTo(backdrop, { skewY: -4 }, { skewY: 0, duration: 0.9, ease: 'elastic.out(1,0.45)' });
		gsap.to(watermark, { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', delay: 0.1, overwrite: true });
		gsap.to(items, { x: 0, rotation: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.05, delay: 0.12, overwrite: true });
		gsap.to(stickers, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.5)', stagger: 0.05, delay: 0.32, overwrite: true });
		gsap.to(socials, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'expo.out', delay: 0.45, overwrite: true });
	}

	function close() {
		isOpen = false;
		syncState();

		if (reducedMotion.matches) {
			gsap.to(nav, { autoAlpha: 0, duration: 0.15, overwrite: true, onComplete: setClosedState });
			return;
		}

		// Exit is quicker than the entrance: the visitor already decided
		gsap.to(socials, { y: 8, autoAlpha: 0, duration: 0.12, ease: 'power2.in', overwrite: true });
		gsap.to(stickers, { scale: 0.6, autoAlpha: 0, duration: 0.1, overwrite: true });
		gsap.to(items, { x: -32, autoAlpha: 0, duration: 0.18, ease: 'power2.in', stagger: { each: 0.025, from: 'end' }, overwrite: true });
		gsap.to(watermark, { autoAlpha: 0, duration: 0.15, overwrite: true });
		gsap.to(backdrop, { yPercent: -90, skewY: 0, duration: 0.4, ease: 'expo.inOut', delay: 0.1, overwrite: true, onComplete: setClosedState });
	}

	toggle.addEventListener('click', (e) => {
		e.preventDefault();
		if (!mobile.matches) return;
		isOpen ? close() : open();
	});

	toggle.addEventListener('keydown', (e) => {
		if (e.key !== ' ') return;
		e.preventDefault();
		toggle.click();
	});

	document.addEventListener('keydown', (e) => {
		if (e.key !== 'Escape' || !isOpen) return;
		close();
		toggle.focus();
	});

	nav.addEventListener('click', (e) => {
		if (isOpen && (e.target as HTMLElement).closest('a')) close();
	});

	document.getElementById('headerLogoLink')?.addEventListener('click', () => {
		if (isOpen) close();
	});

	// Covers back/forward navigation while the menu is open
	document.addEventListener('astro:after-swap', () => {
		if (isOpen) close();
	});

	mobile.addEventListener('change', () => {
		if (mobile.matches) {
			setClosedState();
			return;
		}
		// Hand the nav back to the desktop sidebar styles
		isOpen = false;
		syncState(false);
		gsap.killTweensOf(animated);
		gsap.set(animated, { clearProps: 'all' });
	});

	if (mobile.matches) setClosedState();
}
