<script>
    /** @type {{
     * 	title?: string,
     * 	children?: import('svelte').Snippet
     * }} */
    let { title = "Dashboard", children } = $props();
</script>

<header
    class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40"
>
    <h2 class="text-lg font-semibold text-slate-800">{title}</h2>
    <div class="flex items-center space-x-4">
        {@render children?.()}
    </div>
</header>
