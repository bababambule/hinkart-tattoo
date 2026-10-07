const video = document.querySelector('video');
const play = document.getElementById('play-button');
const playIcons = play.querySelectorAll('svg');
const playArray = Array.from(playIcons);
const volume = document.getElementById('vol-button');
const volumeIcons = volume.querySelectorAll('svg');
const volumeArray = Array.from(volumeIcons);
const fullscreenButton = document.querySelector('#full-button');
const supportsFullscreen = !!video.webkitRequestFullscreen;
let fullscreenToggle = false;

let isVideoReady = false;

video.addEventListener('loadedmetadata', () => {
	isVideoReady = true;
	fullscreenButton.disabled = false; // Enable button
});

// Fallback: If metadata takes too long, use 'canplay'
video.addEventListener('canplay', () => {
	if (!isVideoReady) isVideoReady = true;
});

play.addEventListener('click', handlePlayButton);
volume.addEventListener('click', handleVolButton);
fullscreenButton.addEventListener('click', openFullscreen);

video.addEventListener('fullscreenchange', (e) => {
	if (fullscreenToggle === false) {
		fullscreenToggle = true;
		video.classList.remove('clip-path');
	} else {
		fullscreenToggle = false;
		video.classList.add('clip-path');
	}
});

function toggleButton(playing) {
	if (playing) {
		playArray[0].classList.remove('hidden');
		playArray[1].classList.add('hidden');
		play.setAttribute('aria-label', 'Pause');
	} else {
		playArray[0].classList.add('hidden');
		playArray[1].classList.remove('hidden');
		play.setAttribute('aria-label', 'Play');
	}
}

function toggleVolButton(muted) {
	if (muted) {
		volumeArray[0].classList.remove('hidden');
		volumeArray[1].classList.add('hidden');
		volume.setAttribute('aria-label', 'Unmute');
	} else {
		volumeArray[0].classList.add('hidden');
		volumeArray[1].classList.remove('hidden');
		volume.setAttribute('aria-label', 'Mute');
	}
}

function handlePlayButton() {
	if (video.paused) {
		video.play();
		toggleButton(true);
	} else {
		video.pause();
		toggleButton(false);
	}
}

function handleVolButton() {
	if (video.muted) {
		video.muted = false;
		toggleVolButton(false);
	} else {
		video.muted = true;
		toggleVolButton(true);
	}
}

function openFullscreen() {
	/* if (!supportsFullscreen) {
		alert('Fullscreen not supported on this browser.');
		return;
	} else { */
	if (video.webkitEnterFullscreen) {
		video.webkitEnterFullscreen();
	} else if (video.requestFullscreen) {
		video.requestFullscreen();
	} else if (video.webkitRequestFullscreen) {
		/* Safari */
		video.webkitRequestFullscreen();
	} else if (video.msRequestFullscreen) {
		/* IE11 */
		video.msRequestFullscreen();
	}
	/* } */
}
