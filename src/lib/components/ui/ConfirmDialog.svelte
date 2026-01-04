<script>
	let {
		isOpen = $bindable(false),
		title = 'Confirmar acción',
		message = '',
		onConfirm = () => {},
		confirmLabel = 'Confirmar',
		cancelLabel = 'Cancelar',
		variant = 'danger'
	} = $props();

	function handleConfirm() {
		onConfirm();
		isOpen = false;
	}

	function handleCancel() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		onclick={handleCancel}
	>
		<div
			class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-start space-x-3">
				{#if variant === 'danger'}
					<div
						class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-red-600"
						>
							<path
								d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
							></path>
							<line x1="12" y1="9" x2="12" y2="13"></line>
							<line x1="12" y1="17" x2="12.01" y2="17"></line>
						</svg>
					</div>
				{:else}
					<div
						class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-blue-600"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="16" x2="12" y2="12"></line>
							<line x1="12" y1="8" x2="12.01" y2="8"></line>
						</svg>
					</div>
				{/if}
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-slate-900">{title}</h3>
					<p class="mt-2 text-sm text-slate-600">{message}</p>
				</div>
			</div>
			<div class="flex justify-end space-x-3 pt-2">
				<button
					onclick={handleCancel}
					class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
				>
					{cancelLabel}
				</button>
				<button
					onclick={handleConfirm}
					class="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors
						{variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
