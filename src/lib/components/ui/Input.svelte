<script>
    /** @type {{
     * 	label?: string,
     * 	id?: string,
     * 	type?: string,
     * 	placeholder?: string,
     * 	value?: string,
     * 	error?: string,
     * 	required?: boolean,
     * 	class?: string,
     * 	oninput?: (event: Event) => void
     * }} */
    let {
        label,
        id,
        type = "text",
        placeholder = "",
        value = $bindable(""),
        error,
        required = false,
        class: className = "",
        oninput,
    } = $props();
</script>

<div class="w-full {className}">
    {#if label}
        <label for={id} class="block text-sm font-medium text-slate-700 mb-1">
            {label}
            {#if required}<span class="text-red-500">*</span>{/if}
        </label>
    {/if}
    <input
        {id}
        {type}
        {placeholder}
        bind:value
        {required}
        {oninput}
        class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 {error
            ? 'border-red-500 focus:ring-red-500'
            : ''}"
    />
    {#if error}
        <p class="mt-1 text-xs text-red-500">{error}</p>
    {/if}
</div>
