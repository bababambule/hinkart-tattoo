import { Dropzone } from 'dropzone';
import type { DropzoneOptions } from 'dropzone';

const options: DropzoneOptions = {
	url: 'https://automation.orange-works.de/webhook/919895cb-e450-4549-adbe-dac8de849e0b',
	maxFilesize: 5,
	uploadMultiple: true,
	createImageThumbnails: true,
	maxFiles: 4,
	acceptedFiles: 'image/*',
	addRemoveLinks: true,
};

let dropzones = document.querySelectorAll('[data-dropzone]');
let formParamName: string;

dropzones.forEach((dropzone) => {
	formParamName = dropzone.getAttribute('data-dropzone');
	options.paramName = formParamName;

	const uploadField = new Dropzone(dropzone, options);

	uploadField.on('addedfile', (file) => {
		console.log(file.name, file.upload.progress, file.previewElement);
	});
});
