import { gsap } from 'gsap';
import hoverS from '../assets/images/studio/studio-hover-s.jpg';
import hoverT from '../assets/images/studio/studio-hover-t.jpg';
import hoverU from '../assets/images/studio/studio-hover-u.jpg';
import hoverD from '../assets/images/studio/studio-hover-d.jpg';
import hoverI from '../assets/images/studio/studio-hover-i.jpg';
import hoverO from '../assets/images/studio/studio-hover-o.jpg';

const letters: [string, ImageMetadata][] = [
	['letterS', hoverS],
	['letterT', hoverT],
	['letterU', hoverU],
	['letterD', hoverD],
	['letterI', hoverI],
	['letterO', hoverO],
];

const image = document.getElementById('svgImage');
const shapeFill = document.getElementById('shapeFill');

// small delay so moving across the gap between two letters doesn't flash the fill
const LEAVE_DELAY = 80;
let leaveTimer: ReturnType<typeof setTimeout> | undefined;

function showImage(src: string) {
	clearTimeout(leaveTimer);
	gsap.killTweensOf(shapeFill);
	image?.setAttribute('href', src);
	gsap.to(shapeFill, { opacity: 0, duration: 0.2 });
}

function hideImage() {
	clearTimeout(leaveTimer);
	leaveTimer = setTimeout(() => {
		gsap.killTweensOf(shapeFill);
		gsap.to(shapeFill, { opacity: 1, duration: 0.2 });
	}, LEAVE_DELAY);
}

if (image && shapeFill) {
	gsap.set(shapeFill, { opacity: 1 });
	gsap.set(image, { opacity: 1, attr: { href: hoverS.src } });

	for (const [id, hoverImage] of letters) {
		// preload so the first hover swaps instantly
		const preload = new Image();
		preload.src = hoverImage.src;
		preload.decode().catch(() => {});

		const letter = document.getElementById(id);
		if (!letter) continue;
		letter.addEventListener('pointerenter', () => showImage(hoverImage.src));
		letter.addEventListener('pointerleave', hideImage);
	}
}
