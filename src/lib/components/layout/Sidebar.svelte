<script>
	import { page } from '$app/stores';
	import { auth, logout } from '$lib/stores/auth';

	let { isCollapsed = $bindable(false) } = $props();

	const menuItems = [
		{ href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
		{ href: '/products/catalog', label: 'Productos', icon: 'Package' },
		{ href: '/products/nexus', label: 'Nexus', icon: 'Smartphone' },
		{ href: '/products/plans', label: 'Planes', icon: 'Tag' },
		{
			href: '/admin/internal-users',
			label: 'Usuarios Internos',
			icon: 'Users'
		}
	];

	/** @param {string} href */
	function isActive(href) {
		// Exact match for root path, startsWith for others
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(href);
	}
</script>

<aside
	class="bg-slate-900 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 border-r border-slate-800 shadow-xl
	{isCollapsed ? 'w-20' : 'w-64'}"
	style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);"
>
	<div class="h-16 flex items-center justify-center border-b border-slate-800/50 shrink-0 relative">
		<img src="/images/logo.png" alt="Logo" class="w-8 h-8 object-contain" />
		{#if !isCollapsed}
			<h1 class="ml-3 text-lg font-bold tracking-tight text-white leading-tight truncate">
				Geminislab
			</h1>
		{/if}
	</div>

	<!-- Toggle Button (Absolute on border) -->
	<button
		class="absolute -right-3 top-20 bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded-full p-1 shadow-md z-50 transition-colors"
		onclick={() => (isCollapsed = !isCollapsed)}
		title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="transition-transform duration-300 {isCollapsed ? 'rotate-180' : ''}"
			><polyline points="15 18 9 12 15 6"></polyline></svg
		>
	</button>

	<nav class="flex-1 p-3 space-y-2 overflow-y-auto mt-2">
		{#each menuItems as item, index (item.label)}
			<a
				href={item.href}
				title={isCollapsed ? item.label : ''}
				class="flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
				{isActive(item.href)
					? 'bg-blue-600 text-white shadow-md border border-blue-500'
					: 'text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700 border border-transparent'}
				{isCollapsed ? 'justify-center' : ''}"
			>
				<span
					class="transition-colors {isActive(item.href)
						? 'text-white'
						: 'text-slate-300 group-hover:text-white'}
					{isCollapsed ? '' : 'mr-3'}"
				>
					{#if item.icon === 'Package'}
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
							><path d="m7.5 4.27 9 5.15" /><path
								d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
							/><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg
						>
					{:else if item.icon === 'LayoutDashboard'}
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
							><rect width="7" height="9" x="3" y="3" rx="1" /><rect
								width="7"
								height="5"
								x="14"
								y="3"
								rx="1"
							/><rect width="7" height="9" x="14" y="12" rx="1" /><rect
								width="7"
								height="5"
								x="3"
								y="16"
								rx="1"
							/></svg
						>
					{:else if item.icon === 'Smartphone'}
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
							><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg
						>
					{:else if item.icon === 'Tag'}
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
							><path
								d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"
							/><path d="M7 7h.01" /></svg
						>
					{:else if item.icon === 'Users'}
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
							><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle
								cx="9"
								cy="7"
								r="4"
							/><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg
						>
					{/if}
				</span>
				{#if !isCollapsed}
					<span class="truncate">{item.label}</span>
				{/if}
			</a>

			<!-- Divider after Dashboard -->
			{#if index === 0}
				<div class="my-3 border-t border-slate-700/30"></div>
			{/if}
		{/each}
	</nav>

	<div class="p-4 border-t border-slate-800/50 bg-slate-900/50">
		<div class="flex items-center mb-4 {isCollapsed ? 'justify-center' : 'px-2'}">
			<div
				class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0"
			>
				{($auth.user?.name || $auth.user?.data?.name || 'U').charAt(0).toUpperCase()}
			</div>
			{#if !isCollapsed}
				<div class="ml-3 overflow-hidden">
					<p class="text-xs font-medium text-white truncate">
						{$auth.user?.name || $auth.user?.data?.name || 'User'}
					</p>
					<p class="text-[10px] text-slate-400 truncate">
						{$auth.user?.email || $auth.user?.data?.email || 'email@example.com'}
					</p>
				</div>
			{/if}
		</div>
		<button
			onclick={logout}
			title={isCollapsed ? 'Cerrar Sesión' : ''}
			class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/30 border border-transparent rounded-md transition-all duration-200"
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
				class={isCollapsed ? '' : 'mr-2'}
				><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline
					points="16 17 21 12 16 7"
				/><line x1="21" x2="9" y1="12" y2="12" /></svg
			>
			{#if !isCollapsed}
				Cerrar Sesión
			{/if}
		</button>
	</div>
</aside>
