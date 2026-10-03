import { triggerEvent } from 'astro/virtual-modules/transitions-events.js';

let stepCounter: number = 1;
let steps = document.querySelectorAll('[data-step]');
let stepPicker = document.querySelectorAll('[data-form-step]');
let totalSteps = steps.length;
let stepAttribute: number | null;
let formContinue: boolean = false;
let stepButton = document.getElementById('formContinue');
let submitButton = document.getElementById('formSubmit');

// Step 1 Terms
const termBoxes = document.querySelectorAll('[data-form="termbox"]');
termBoxes.forEach((termbox) => {
	termbox.addEventListener('change', () => {
		termbox.setAttribute('aria-expanded', 'false');
		termbox.nextElementSibling?.setAttribute('aria-expanded', 'true');
	});
});

const processBlock = document.getElementById('termsProcessWrapper');
const processCheckbox = document.getElementById('termsProcess');
const paymentBlock = document.getElementById('termsPaymentWrapper');
const paymentCheckbox = document.getElementById('termsPayment');
const appointmentBlock = document.getElementById('termsAppointmentWrapper');
const appointmentCheckbox = document.getElementById('termsAppointment');

processCheckbox?.addEventListener('change', () => {
	if (processCheckbox.checked) {
		processBlock?.setAttribute('data-disabled', 'true');
		paymentBlock?.setAttribute('data-disabled', 'false');
	} else {
		paymentBlock?.setAttribute('data-disabled', 'true');
	}
});

paymentCheckbox?.addEventListener('change', () => {
	if (paymentCheckbox.checked) {
		paymentBlock?.setAttribute('data-disabled', 'true');
		appointmentBlock?.setAttribute('data-disabled', 'false');
	} else {
		appointmentBlock?.setAttribute('data-disabled', 'true');
	}
});

appointmentCheckbox?.addEventListener('change', () => {
	if (appointmentCheckbox.checked) {
		appointmentBlock?.setAttribute('data-disabled', 'true');
		stepButton.setAttribute('data-disabled', 'false');
	} else {
		// Deactivate Next Button
	}
});

// Step 2 Idea
let inputIdea = document.querySelector('#tattooIdea');
let inputPlacement = document.querySelector('#tattooPlacement');
let inputSize = document.querySelector('#tattooSize');

let ideaInputs = [inputIdea, inputPlacement, inputSize];

ideaInputs.forEach((el) => {
	el?.addEventListener('change', () => {
		if (inputIdea.value.length > 0 && inputPlacement.value.length > 0 && inputSize.value.length > 0) {
			stepButton?.setAttribute('data-disabled', 'false');
		}
	});
});

// upload confirm
let uploadConfirm = document.querySelector('#uploadReveal');
let uploadConfirmButton = document.querySelector('#uploadRevealButton');

uploadConfirmButton?.addEventListener('click', (e) => {
	e.preventDefault();
	uploadConfirm?.remove();
});

// Step 3 Artist
let artistSelectors = document.querySelectorAll('input[name="artistSelection" ]');
artistSelectors.forEach((artist) => {
	artist.addEventListener('change', () => {
		stepButton?.setAttribute('data-disabled', 'false');
	});
});

// Step 4 Date
let daySelector = document.querySelectorAll('input[name="daySelection"]');
daySelector.forEach((day) => {
	day.addEventListener('change', () => {
		stepButton?.setAttribute('data-disabled', 'false');
	});
});
// Step 5 Personal

// Logic to either show the step or submit button
stepButton?.addEventListener('click', (e) => {
	e.preventDefault();

	if (stepCounter === totalSteps - 1) {
		stepButton?.setAttribute('data-hidden', 'true');
		submitButton?.setAttribute('data-hidden', 'false');
	}

	if (stepCounter < totalSteps) {
		stepCounter++;
		stepButton?.setAttribute('data-disabled', 'true');
	}

	// Logic for the step picker
	stepPicker.forEach((element) => {
		let star = element.querySelector('path');
		if (stepCounter === parseInt(element.getAttribute('data-form-step'))) {
			// Previous Element
			element.previousElementSibling?.classList.remove('opacity-100');
			element.previousElementSibling?.classList.add('opacity-75');
			element.previousElementSibling.setAttribute('data-form-state', 'completed');

			// Current Element
			element.classList.remove('opacity-50');
			element.classList.add('opacity-100');

			// SVG
			star?.setAttribute('fill', 'var(--color-winter-sky-600');
			star?.setAttribute('stroke', 'transparent');
		}
	});

	// Logic to display the different steps
	steps.forEach((step) => {
		stepAttribute = parseFloat(step?.getAttribute('data-step'));

		if (stepAttribute === stepCounter - 1) {
			step.setAttribute('data-hidden', 'true');
		} else if (stepAttribute === stepCounter) {
			step.setAttribute('data-hidden', 'false');
		}
	});
});
