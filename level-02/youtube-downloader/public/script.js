// Basic form validation and UI feedback for YouTube Downloader
document.addEventListener('DOMContentLoaded', function () {
	const form = document.querySelector('.download-form');
	const input = form.querySelector('input[name="videoURL"]');
	const messageBox = document.querySelector('.message');

	form.addEventListener('submit', function (e) {
		const url = input.value.trim();
		// Simple YouTube URL validation
		const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
		if (!ytRegex.test(url)) {
			e.preventDefault();
			showMessage('Please enter a valid YouTube URL.', true);
		}
	});

	function showMessage(msg, isError) {
		if (messageBox) {
			messageBox.textContent = msg;
			messageBox.classList.remove('success', 'error');
			messageBox.classList.add(isError ? 'error' : 'success');
		}
	}
});
