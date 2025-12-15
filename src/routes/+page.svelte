<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { onMount } from 'svelte';

	let currentDate = $state(new Date());

	onMount(() => {
		const interval = setInterval(() => {
			currentDate = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="flex flex-col min-h-screen bg-slate-50">
	<Topbar title="Dashboard" />

	<div class="p-6 max-w-7xl mx-auto w-full space-y-6">
		<!-- Welcome Section -->
		<div
			class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 shadow-lg"
		>
			<div
				class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center"
			>
				<div>
					<h1 class="text-3xl font-bold text-white mb-2">Bienvenido a Geminislabs</h1>
					<p class="text-slate-300">Panel de Control Administrativo &bull; V.1.0.0</p>
				</div>
				<div class="mt-4 md:mt-0 text-right">
					<div class="text-2xl font-mono font-semibold text-white">
						{currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</div>
					<div class="text-sm text-slate-400 capitalize">
						{currentDate.toLocaleDateString([], {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</div>
				</div>
			</div>
			<!-- Decorative background pattern -->
			<div
				class="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
			></div>
			<div
				class="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl"
			></div>
		</div>

		<!-- Quick Stats Row -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- Nexus Status -->
			<Card class="p-6 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-slate-500 mb-1">Dispositivos Nexus</p>
						<h3 class="text-2xl font-bold text-slate-800">124</h3>
						<p class="text-xs text-green-600 flex items-center mt-1">
							<span class="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
							98% En línea
						</p>
					</div>
					<div class="p-3 bg-blue-50 rounded-lg text-blue-600">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line
								x1="8"
								y1="21"
								x2="16"
								y2="21"
							></line><line x1="12" y1="17" x2="12" y2="21"></line></svg
						>
					</div>
				</div>
			</Card>

			<!-- System Health -->
			<Card class="p-6 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-slate-500 mb-1">Estado del Sistema</p>
						<h3 class="text-2xl font-bold text-slate-800">Normal</h3>
						<p class="text-xs text-slate-400 mt-1">Uptime: 14d 2h 12m</p>
					</div>
					<div class="p-3 bg-emerald-50 rounded-lg text-emerald-600">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline
								points="22 4 12 14.01 9 11.01"
							></polyline></svg
						>
					</div>
				</div>
			</Card>

			<!-- Active Users -->
			<Card class="p-6 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-slate-500 mb-1">Usuarios Internos</p>
						<h3 class="text-2xl font-bold text-slate-800">12</h3>
						<p class="text-xs text-slate-400 mt-1">3 Activos ahora</p>
					</div>
					<div class="p-3 bg-purple-50 rounded-lg text-purple-600">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle
								cx="9"
								cy="7"
								r="4"
							></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path
								d="M16 3.13a4 4 0 0 1 0 7.75"
							></path></svg
						>
					</div>
				</div>
			</Card>
		</div>

		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Quick Actions / Product Highlight -->
			<div class="lg:col-span-2 space-y-6">
				<h2 class="text-lg font-semibold text-slate-800">Accesos Directos</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Nexus Card -->
					<Card
						class="overflow-hidden group cursor-pointer hover:border-blue-300 transition-colors"
					>
						<div class="p-6">
							<div class="flex items-center mb-4">
								<div class="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">
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
										><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line
											x1="8"
											y1="21"
											x2="16"
											y2="21"
										></line><line x1="12" y1="17" x2="12" y2="21"></line></svg
									>
								</div>
								<h3 class="font-bold text-slate-800 text-lg">Nexus</h3>
							</div>
							<p class="text-slate-500 text-sm mb-6">
								Gestión controlada de dispositivos GPS, telemática avanzada y rastreo en tiempo
								real.
							</p>
							<div class="flex space-x-3">
								<a href="/products/nexus/devices" class="w-full">
									<Button
										variant="primary"
										class="w-full shadow-sm group-hover:shadow-md transition-all"
									>
										Gestionar Dispositivos
									</Button>
								</a>
							</div>
						</div>
					</Card>

					<!-- Users Card -->
					<Card
						class="overflow-hidden group cursor-pointer hover:border-purple-300 transition-colors"
					>
						<div class="p-6">
							<div class="flex items-center mb-4">
								<div class="p-2 bg-purple-100 rounded-lg text-purple-600 mr-3">
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
										><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle
											cx="9"
											cy="7"
											r="4"
										></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path
											d="M16 3.13a4 4 0 0 1 0 7.75"
										></path></svg
									>
								</div>
								<h3 class="font-bold text-slate-800 text-lg">Usuarios y Roles</h3>
							</div>
							<p class="text-slate-500 text-sm mb-6">
								Administración de cuentas internas, permisos y auditoría de seguridad.
							</p>
							<div class="flex space-x-3">
								<a href="/admin/internal-users" class="w-full">
									<Button variant="outline" class="w-full">Ver Usuarios</Button>
								</a>
							</div>
						</div>
					</Card>
				</div>
			</div>

			<!-- Recent Activity Feed (Mock) -->
			<div class="space-y-4">
				<h2 class="text-lg font-semibold text-slate-800">Actividad Reciente</h2>
				<Card class="h-full">
					<div class="p-4">
						<div class="divide-y divide-slate-100">
							<!-- Activity Item 1 -->
							<div class="py-3 flex space-x-3">
								<div class="mt-1">
									<div class="w-2 h-2 rounded-full bg-blue-500"></div>
								</div>
								<div>
									<p class="text-xs text-slate-500 mb-0.5">Hace 10 min</p>
									<p class="text-sm text-slate-700 font-medium">Nuevo dispositivo registrado</p>
									<p class="text-xs text-slate-400">ID: 86756405...</p>
								</div>
							</div>
							<!-- Activity Item 2 -->
							<div class="py-3 flex space-x-3">
								<div class="mt-1">
									<div class="w-2 h-2 rounded-full bg-green-500"></div>
								</div>
								<div>
									<p class="text-xs text-slate-500 mb-0.5">Hace 25 min</p>
									<p class="text-sm text-slate-700 font-medium">Actualización de Sistema</p>
									<p class="text-xs text-slate-400">Deploy exitoso v1.0.2</p>
								</div>
							</div>
							<!-- Activity Item 3 -->
							<div class="py-3 flex space-x-3">
								<div class="mt-1">
									<div class="w-2 h-2 rounded-full bg-orange-400"></div>
								</div>
								<div>
									<p class="text-xs text-slate-500 mb-0.5">Hace 1h 12m</p>
									<p class="text-sm text-slate-700 font-medium">Alerta de Conexión</p>
									<p class="text-xs text-slate-400">Latencia alta en región US-East</p>
								</div>
							</div>
							<!-- Activity Item 4 -->
							<div class="py-3 flex space-x-3">
								<div class="mt-1">
									<div class="w-2 h-2 rounded-full bg-slate-300"></div>
								</div>
								<div>
									<p class="text-xs text-slate-500 mb-0.5">Hace 2h</p>
									<p class="text-sm text-slate-700 font-medium">Login de Admin</p>
									<p class="text-xs text-slate-400">Usuario: admin@geminislabs.com</p>
								</div>
							</div>
						</div>
						<div class="pt-4 mt-2 border-t border-slate-50 text-center">
							<button class="text-xs text-blue-600 font-medium hover:underline"
								>Ver todo el historial</button
							>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</div>
</div>
