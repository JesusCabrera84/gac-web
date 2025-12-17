<script>
	/** @type {{
	 * 	title?: string,
	 * 	backUrl?: string,
	 * 	children?: import('svelte').Snippet
	 * }} */
	let { title = 'Dashboard', backUrl, children } = $props();
</script>

<header
	class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40"
>
	<div class="flex items-center gap-4">
		{#if backUrl}
			<a
				href={backUrl}
				aria-label="Volver"
				class="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
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
					stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
				>
			</a>
		{/if}
		<h2 class="text-lg font-semibold text-slate-800">{title}</h2>
	</div>
	<div class="flex items-center space-x-4">
		{@render children?.()}
	</div>
</header>
