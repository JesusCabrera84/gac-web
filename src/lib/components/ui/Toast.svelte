<script>
	import { toast } from '$lib/stores/toast';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let toasts = $derived($toast);
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
	{#each toasts as t (t.id)}
		<div
			animate:flip={{ duration: 200 }}
			in:fly={{ x: 300, duration: 200 }}
			out:fly={{ x: 300, duration: 200 }}
			class="pointer-events-auto min-w-[320px] max-w-md rounded-lg shadow-lg border overflow-hidden
				{t.type === 'success'
				? 'bg-green-50 border-green-200'
				: t.type === 'error'
					? 'bg-red-50 border-red-200'
					: 'bg-blue-50 border-blue-200'}"
		>
			<div class="flex items-start p-4 gap-3">
				<!-- Icon -->
				<div class="flex-shrink-0">
					{#if t.type === 'success'}
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
							class="text-green-600"
						>
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
					{:else if t.type === 'error'}
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
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="15" y1="9" x2="9" y2="15"></line>
							<line x1="9" y1="9" x2="15" y2="15"></line>
						</svg>
					{:else}
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
					{/if}
				</div>

				<!-- Message -->
				<div class="flex-1 pt-0.5">
					<p
						class="text-sm font-medium
						{t.type === 'success' ? 'text-green-900' : t.type === 'error' ? 'text-red-900' : 'text-blue-900'}"
					>
						{t.message}
					</p>
				</div>

				<!-- Close Button -->
				<button
					onclick={() => toast.dismiss(t.id)}
					class="flex-shrink-0 rounded-md p-1 transition-colors
						{t.type === 'success'
						? 'text-green-500 hover:bg-green-100'
						: t.type === 'error'
							? 'text-red-500 hover:bg-red-100'
							: 'text-blue-500 hover:bg-blue-100'}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<!-- Progress Bar -->
			{#if t.duration > 0}
				<div
					class="h-1
						{t.type === 'success' ? 'bg-green-200' : t.type === 'error' ? 'bg-red-200' : 'bg-blue-200'}"
				>
					<div
						class="h-full
							{t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}"
						style="animation: shrink {t.duration}ms linear forwards;"
					></div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	@keyframes shrink {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}
</style>
