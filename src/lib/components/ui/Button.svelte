<script>
	/**
	 * @typedef {'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'} Variant
	 * @typedef {'sm' | 'md' | 'lg'} Size
	 */

	/** @type {{
	 * 	variant?: Variant,
	 * 	size?: Size,
	 * 	type?: 'button' | 'submit' | 'reset',
	 * 	disabled?: boolean,
	 * 	class?: string,
	 * 	children?: import('svelte').Snippet,
	 * 	onclick?: (event: MouseEvent) => void
	 * }} */
	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		class: className = '',
		children,
		onclick
	} = $props();

	const baseStyles =
		'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white';

	const variants = {
		primary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900',
		secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500',
		danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
		ghost: 'hover:bg-slate-100 hover:text-slate-900',
		outline: 'border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900'
	};

	const sizes = {
		sm: 'h-9 px-3 text-xs',
		md: 'h-10 px-4 py-2 text-sm',
		lg: 'h-11 px-8 text-base'
	};
</script>

<button
	{type}
	class="{baseStyles} {variants[variant]} {sizes[size]} {className}"
	{disabled}
	{onclick}
>
	{@render children?.()}
</button>
