import { boilFilter } from './hinkartLogoAnimations';

type WebkitVideo = HTMLVideoElement & {
	webkitEnterFullscreen?: () => void;
	webkitRequestFullscreen?: () => void;
};

let cleanup: (() => void) | null = null;

function init() {
	cleanup?.();
	const video = document.querySelector<WebkitVideo>('#heroVideo');
	if (!video) return;

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const controller = new AbortController();
	const { signal } = controller;

	/* Outline: keep the polygon in pixel space so the boil noise isn't stretched */
	const outline = document.querySelector<SVGSVGElement>('#video-outline');
	const polygon = outline?.querySelector('polygon');
	const filter = outline?.querySelector('filter');
	const slant = Number(outline?.dataset.slant ?? 1);
	const desktop = window.matchMedia('(width >= 64rem)'); // Tailwind lg, matches the clip-path in index.astro

	let size = { w: 0, h: 0 };
	const drawOutline = () => {
		const { w, h } = size;
		const corner = desktop.matches ? `${w * slant},${h}` : `${w},${h * slant}`;
		polygon?.setAttribute('points', `0,0 ${w},0 ${corner} 0,${h}`);
	};
	const resizeObserver = new ResizeObserver(([entry]) => {
		size = { w: entry.contentRect.width, h: entry.contentRect.height };
		drawOutline();
	});
	desktop.addEventListener('change', drawOutline, { signal });
	if (outline) resizeObserver.observe(outline);

	const boil = filter ? boilFilter(filter) : null;

	/* Buttons reflect the video's state, whatever changed it */
	const play = document.getElementById('play-button');
	const volume = document.getElementById('vol-button');
	const fullscreen = document.getElementById('full-button');
	const [pauseIcon, playIcon] = Array.from(play?.querySelectorAll('svg') ?? []);
	const [mutedIcon, soundIcon] = Array.from(volume?.querySelectorAll('svg') ?? []);

	const syncPlay = () => {
		pauseIcon?.classList.toggle('hidden', video.paused);
		playIcon?.classList.toggle('hidden', !video.paused);
		play?.setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
	};
	const syncVolume = () => {
		mutedIcon?.classList.toggle('hidden', !video.muted);
		soundIcon?.classList.toggle('hidden', video.muted);
		volume?.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
	};

	video.addEventListener('play', syncPlay, { signal });
	video.addEventListener('pause', syncPlay, { signal });
	video.addEventListener('volumechange', syncVolume, { signal });

	play?.addEventListener(
		'click',
		() => {
			if (video.paused) video.play().catch(() => syncPlay());
			else video.pause();
		},
		{ signal },
	);
	volume?.addEventListener('click', () => (video.muted = !video.muted), { signal });
	fullscreen?.addEventListener(
		'click',
		() => {
			if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iOS
			else if (video.requestFullscreen) video.requestFullscreen();
			else video.webkitRequestFullscreen?.(); // older Safari
		},
		{ signal },
	);

	// The clip would cut into the fullscreen video, so drop it while fullscreen
	const syncFullscreen = () => video.classList.toggle('clip-path', document.fullscreenElement !== video);
	document.addEventListener('fullscreenchange', syncFullscreen, { signal });
	document.addEventListener('webkitfullscreenchange', syncFullscreen, { signal });

	// Save battery while the tab is hidden; only resume what we paused
	let pausedByVisibility = false;
	document.addEventListener(
		'visibilitychange',
		() => {
			if (document.hidden) {
				boil?.pause();
				if (!video.paused) {
					video.pause();
					pausedByVisibility = true;
				}
			} else {
				boil?.resume();
				if (pausedByVisibility) video.play().catch(() => {});
				pausedByVisibility = false;
			}
		},
		{ signal },
	);

	if (reducedMotion) video.pause();
	else if (video.paused) video.play().catch(() => {}); // autoplay can be blocked; buttons stay in sync either way
	syncPlay();
	syncVolume();

	cleanup = () => {
		controller.abort();
		resizeObserver.disconnect();
		boil?.kill();
		cleanup = null;
	};
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => cleanup?.());
