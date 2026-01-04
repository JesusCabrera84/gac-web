import { writable } from 'svelte/store';

/**
 * @typedef {Object} Toast
 * @property {string} id
 * @property {string} message
 * @property {'success' | 'error' | 'info'} type
 * @property {number} duration
 */

/** @type {import('svelte/store').Writable<Toast[]>} */
const toastsStore = writable([]);

let toastId = 0;

/**
 * Add a toast notification
 * @param {string} message
 * @param {'success' | 'error' | 'info'} type
 * @param {number} duration
 */
function addToast(message, type, duration = 3000) {
	const id = `toast-${++toastId}`;
	const toast = { id, message, type, duration };

	toastsStore.update((toasts) => [...toasts, toast]);

	// Auto-dismiss after duration
	if (duration > 0) {
		setTimeout(() => {
			dismiss(id);
		}, duration);
	}
}

/**
 * Dismiss a toast by ID
 * @param {string} id
 */
function dismiss(id) {
	toastsStore.update((toasts) => toasts.filter((t) => t.id !== id));
}

/**
 * Show a success toast
 * @param {string} message
 * @param {number} [duration]
 */
function success(message, duration) {
	addToast(message, 'success', duration);
}

/**
 * Show an error toast
 * @param {string} message
 * @param {number} [duration]
 */
function error(message, duration) {
	addToast(message, 'error', duration);
}

/**
 * Show an info toast
 * @param {string} message
 * @param {number} [duration]
 */
function info(message, duration) {
	addToast(message, 'info', duration);
}

export const toast = {
	subscribe: toastsStore.subscribe,
	success,
	error,
	info,
	dismiss
};
