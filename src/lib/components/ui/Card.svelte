<script>
    /** @type {{
     * 	class?: string,
     * 	children?: import('svelte').Snippet
     * }} */
    let { class: className = "", children } = $props();
</script>

<div
    class="rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm {className}"
>
    {@render children?.()}
</div>
