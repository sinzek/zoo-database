export function showToast(message, duration = 5000) {
	const toast = document.querySelector('#toast');
	const toastMessage = document.querySelector('#toast-message');

	if (!toast) return;

	toastMessage.textContent = message;
	toast.classList.add('show');

	setTimeout(() => {
		toast.classList.remove('show');
	}, duration);
}
