import { gsap } from 'gsap';

const containers = document.querySelectorAll('.hoverContainer');

containers.forEach((container) => {
	const element = container.querySelector('.hoverElement');

	if (!element) return;

	gsap.set(element, {
		scale: 0,
		xPercent: -50,
		yPercent: -50,
	});

	function positionCursor(e) {
		const relX = e.pageX - container.offsetLeft;
		const relY = e.pageY - container.offsetTop;

		gsap.to(element, {
			x: relX,
			y: relY,
			duration: 0.3,
		});
	}

	container.addEventListener('pointerenter', function (e) {
		gsap.to(element, {
			scale: 1,
			opacity: 1,
			duration: 0.2,
		});
		positionCursor(e);
	});

	container.addEventListener('pointerleave', function (e) {
		gsap.to(element, {
			scale: 0,
			opacity: 0,
			duration: 0.2,
		});
		positionCursor(e);
	});

	container.addEventListener('pointermove', function (e) {
		positionCursor(e);
	});
});
