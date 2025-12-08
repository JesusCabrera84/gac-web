<script>
	import favicon from "$lib/assets/favicon.png";
	import "../app.css";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { auth } from "$lib/stores/auth";
	import Sidebar from "$lib/components/layout/Sidebar.svelte";

	let { children } = $props();

	let isLoginPage = $derived($page.url.pathname === "/login");

	onMount(() => {
		const unsubscribe = auth.subscribe((state) => {
			if (!state.isAuthenticated && !isLoginPage) {
				goto("/login");
			} else if (state.isAuthenticated && isLoginPage) {
				goto("/products");
			}
		});

		return unsubscribe;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="min-h-screen font-sans {isLoginPage
		? 'bg-transparent text-white'
		: 'bg-slate-50 text-slate-900'}"
>
	{#if !isLoginPage}
		<Sidebar />
		<main class="pl-64 transition-all duration-300 min-h-screen">
			{@render children()}
		</main>
	{:else}
		<main
			class="min-h-screen flex flex-col items-center justify-center p-4"
		>
			{@render children()}
		</main>
	{/if}
</div>
