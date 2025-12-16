<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	// import Card from '$lib/components/ui/Card.svelte';
	import CommandPanel from '$lib/components/nexus/CommandPanel.svelte';
	import { DevicesService } from '$lib/services/devices';
	import { TripsService } from '$lib/services/trips';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	// @ts-ignore
	import { GoogleMapEngine, TripReplayController } from '@jesusCabrera84/map-engine';

	let devices = $state([]);
	let isLoading = $state(true);
	let searchTerm = $state('');
	let selectedDeviceId = $state(null);
	let activeTab = $state('commands'); // 'commands' or 'communications'
	let selectedDate = $state('');
	let lastCommunicationTime = $state(null);

	// Sidebar & Resizable state
	let sidebarWidth = $state(320); // Initial width in pixels
	let isDragging = $state(false);
	let sidebarTab = $state('trips'); // 'trips' or 'communications'

	// Trips data
	let trips = $state([]);
	let isLoadingTrips = $state(false);
	// Trip Replay state
	let selectedTripId = $state(null);
	let isPlaying = $state(false);
	let isPaused = $state(false);
	/** @type {TripReplayController | null} */
	let tripReplay = $state(null);

	// Communications data
	let communications = $state([]);
	let isLoadingCommunications = $state(false);

	// Map related state
	let mapContainer = $state();
	/** @type {GoogleMapEngine | null} */
	let mapEngine = $state(null);

	let socket = $state(null);

	onMount(async () => {
		await loadDevices();
		if (typeof window !== 'undefined') {
			window.addEventListener('mousemove', handleResize);
			window.addEventListener('mouseup', stopResize);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('mousemove', handleResize);
			window.removeEventListener('mouseup', stopResize);
		}
		cleanupStream();
	});

	function startResize() {
		isDragging = true;
		// Initialize resize if needed
	}

	function handleResize(event) {
		if (!isDragging) return;
		const newWidth = event.clientX - 300; // Offset for main sidebar
		if (newWidth > 200 && newWidth < 600) {
			sidebarWidth = newWidth;
		}
	}

	function stopResize() {
		isDragging = false;
	}

	// ... (rest of lifecycle/resize unchanged)

	// ...

	// Handle device selection or tab change
	let streamDeviceId = $state(null);

	$effect(() => {
		console.log(
			'Effect triggered. activeTab:',
			activeTab,
			'selectedDeviceId:',
			selectedDeviceId,
			'mapEngine:',
			!!mapEngine
		);
		const shouldStream = activeTab === 'communications' && selectedDeviceId && mapEngine;

		if (shouldStream) {
			console.log('shouldStream is TRUE. streamDeviceId:', streamDeviceId);
			if (streamDeviceId !== selectedDeviceId) {
				console.log('Switching stream device from', streamDeviceId, 'to', selectedDeviceId);
				streamDeviceId = selectedDeviceId;
				loadDeviceDataAndConnectStream(selectedDeviceId);
				// Load data for the active internal tab
				if (selectedDate) {
					if (sidebarTab === 'trips') loadTrips();
					if (sidebarTab === 'history') loadCommunications();
				}
			}
		} else {
			console.log('shouldStream is FALSE');
			if (streamDeviceId) {
				streamDeviceId = null;
				cleanupStream();
				lastCommunicationTime = null;
				selectedDate = '';
			}
		}
	});

	// Effect to reload data when date or sidebar tab changes
	$effect(() => {
		if (activeTab === 'communications' && selectedDeviceId && selectedDate) {
			console.log('Reloading data for tab:', sidebarTab);
			if (sidebarTab === 'trips') loadTrips();
			if (sidebarTab === 'history') loadCommunications();
		}
	});

	async function initMap() {
		try {
			console.log('Initializing Map Engine...');
			mapEngine = new GoogleMapEngine({
				container: mapContainer,
				apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
				theme: 'modern',
				iconResolver: (vehicle) => ({
					url: vehicle.online ? '/icons/car-active.png' : '/icons/car-inactive.png',
					size: [40, 40],
					anchor: [20, 20]
				}),
				infoWindowRenderer: (vehicle) => `
					<div class="p-2 text-slate-800">
						<h3 class="font-bold">${vehicle.device_id || 'Unknown'}</h3>
						<p>Speed: ${vehicle.speed || 0} km/h</p>
					</div>
				`
			});

			const mapInstance = await mapEngine.mount(mapContainer);
			console.log('Map Engine Mounted');

			// Initialize Trip Replay Controller
			// v0.1.4 requires (map, google)
			// @ts-ignore
			tripReplay = new TripReplayController(mapInstance, window.google);

			// If we already have a selected device, load it
			if (selectedDeviceId && activeTab === 'communications') {
				loadDeviceDataAndConnectStream(selectedDeviceId);
			}
		} catch (e) {
			console.error('Failed to initialize map:', e);
		}
	}

	function cleanupStream() {
		if (socket) {
			socket.close();
			socket = null;
		}
		// If needed, remove marker from mapEngine?
		// mapEngine?.removeMarker(selectedDeviceId);
	}

	// Initialize Map when container is available and engine not yet created
	$effect(() => {
		if (mapContainer && !mapEngine) {
			initMap();
		}
	});

	async function loadDeviceDataAndConnectStream(deviceId) {
		// 1. Cleanup previous stream
		cleanupStream();

		try {
			// 2. Fetch latest position
			const data = await DevicesService.getLatestCommunication(deviceId);

			if (!data) {
				console.warn('No latest communication data found for device:', deviceId);
				return;
			}

			// Update UI date/time
			if (data.received_at) {
				const dateObj = new Date(data.received_at);
				// Set date input (YYYY-MM-DD)
				selectedDate = dateObj.toISOString().split('T')[0];
				// Set time for display
				lastCommunicationTime = dateObj.toLocaleTimeString('es-MX', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					hour12: true
				});
			}

			if (mapEngine) {
				// 3. Update Map
				// Normalize data for map engine if needed.
				const vehicleData = {
					...data,
					// Ensure types are correct
					latitude: Number(data.latitude),
					longitude: Number(data.longitude),
					online: true // Assume online if we just got data? Or check timestamp?
				};

				mapEngine.clearAllMarkers();
				mapEngine.addVehicleMarker(vehicleData);

				// Center map
				// @ts-ignore
				if (typeof mapEngine.setCenter === 'function') {
					mapEngine.setCenter(vehicleData.latitude, vehicleData.longitude);
				} else {
					console.warn('mapEngine.setCenter is not a function');
					// Fallback if the user was guessing, but let's trust the user first.
					// If they are correct, this works.
					// If they are incorrect, we might need to look at the engine source if possible or prototype.
				}

				// 4. Connect WebSocket ONLY if we successfully loaded data
				const streamUrl = DevicesService.getStreamUrl(deviceId);
				console.log('Connecting to stream:', streamUrl);

				socket = new WebSocket(streamUrl);

				socket.onopen = () => {
					console.log('✅ WebSocket Connected');
				};

				socket.onmessage = (event) => {
					try {
						const message = JSON.parse(event.data);
						if (message.event === 'message' && message.data && message.data.data) {
							// The user documentation says:
							// message.data = { data: { DEVICE_ID, LATITUD, LONGITUD, SPEED }, decoded: {}, metadata: {} }
							// So valid update is in message.data.data
							const rawUpdate = message.data.data;

							const update = {
								device_id: rawUpdate.DEVICE_ID || deviceId,
								latitude: Number(rawUpdate.LATITUD),
								longitude: Number(rawUpdate.LONGITUD),
								speed: Number(rawUpdate.SPEED),
								online: true
							};

							// Update marker
							if (mapEngine && !isNaN(update.latitude) && !isNaN(update.longitude)) {
								mapEngine.updateVehicleMarker(update);
							}
						} else if (message.event === 'ping') {
							// console.log('💓 Ping'); // Optional keep-alive logging
						}
					} catch (err) {
						console.error('Error parsing WebSocket message:', err);
					}
				};

				socket.onerror = (error) => {
					console.error('❌ WebSocket Error:', error);
				};

				socket.onclose = () => {
					console.log('🔌 WebSocket Disconnected');
				};
			}
		} catch (error) {
			console.error('Error loading device data:', error);
		}
	}

	async function loadDevices() {
		isLoading = true;
		try {
			devices = await DevicesService.getAll();
		} catch (error) {
			console.error('Error loading devices:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadTrips() {
		if (!selectedDeviceId || !selectedDate) return;

		isLoadingTrips = true;
		try {
			const response = await TripsService.getTrips({
				device_id: selectedDeviceId,
				day: selectedDate,
				tz: 'America/Mexico_City'
			});
			trips = response.trips || [];
		} catch (error) {
			console.error('Error loading trips:', error);
			trips = [];
		} finally {
			isLoadingTrips = false;
		}
	}

	async function loadCommunications() {
		if (!selectedDeviceId || !selectedDate) return;

		isLoadingCommunications = true;
		try {
			const response = await DevicesService.getCommunications(selectedDeviceId, selectedDate);
			communications = response || [];
		} catch (error) {
			console.error('Error loading communications:', error);
			communications = [];
		} finally {
			isLoadingCommunications = false;
		}
	}

	// Filter devices based on search term
	let filteredDevices = $derived(
		devices.filter((device) => {
			const term = searchTerm.toLowerCase();
			return (
				device.device_id.toLowerCase().includes(term) ||
				device.brand.toLowerCase().includes(term) ||
				device.model.toLowerCase().includes(term) ||
				(device.status && device.status.toLowerCase().includes(term))
			);
		})
	);

	function handleRowClick(device) {
		if (selectedDeviceId === device.device_id) {
			selectedDeviceId = null; // Deselect if already selected
		} else {
			selectedDeviceId = device.device_id;
		}
	}

	async function selectTrip(trip) {
		if (selectedTripId === trip.trip_id) return;
		selectedTripId = trip.trip_id;
		isPlaying = false;
		isPaused = false;

		// Stop any existing replay
		if (tripReplay) tripReplay.stop();

		try {
			// Fetch full trip details
			const tripDetails = await TripsService.getTripById(trip.trip_id, {
				include_alerts: true,
				include_points: true
			});

			if (tripDetails && tripDetails.points && tripReplay) {
				const replayPoints = tripDetails.points.map((p) => ({
					lat: p.lat,
					lng: p.lon, // Engine uses lng
					timestamp: new Date(p.timestamp),
					speed: p.speed,
					course: p.heading // bearing in engine usually
				}));

				// Load into engine
				// v0.1.4: load(coordinates[])
				tripReplay.load(replayPoints);
			}
		} catch (error) {
			console.error('Error loading trip details:', error);
		}
	}

	function togglePlay() {
		if (!tripReplay) return;

		if (isPlaying && !isPaused) {
			// Pause
			tripReplay.pause();
			isPaused = true;
		} else if (isPaused) {
			// Resume
			tripReplay.resume();
			isPaused = false;
			isPlaying = true;
		} else {
			// Start Play
			tripReplay.play({ duration: 10000 });
			isPlaying = true;
			isPaused = false;
		}
	}

	function stopReplay() {
		if (!tripReplay) return;
		tripReplay.stop();
		isPlaying = false;
		isPaused = false;
	}
</script>

<div class="flex flex-col h-screen overflow-hidden bg-slate-50">
	<Topbar title="Nexus / Dispositivos">
		<a href="/products/nexus/devices/create">
			<Button variant="primary" size="sm">
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
					class="mr-2"><path d="M5 12h14" /><path d="M12 5v14" /></svg
				>
				Nuevo Dispositivo
			</Button>
		</a>
	</Topbar>

	<div class="flex flex-col flex-1 overflow-hidden">
		<!-- Top Panel: Device List -->
		<div class="h-1/2 flex flex-col border-b border-slate-200 bg-white">
			<div class="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
				<div class="w-full md:w-1/2">
					<Input
						placeholder="Buscar por ID, Marca, Modelo..."
						bind:value={searchTerm}
						class="w-full"
					/>
				</div>
				<Button variant="ghost" size="sm" onclick={loadDevices} disabled={isLoading} class="ml-2">
					Actualizar
				</Button>
			</div>

			<div class="flex-1 overflow-y-auto">
				<table class="w-full text-sm text-left">
					<thead
						class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0"
					>
						<tr>
							<th class="px-6 py-4">ID Dispositivo</th>
							<th class="px-6 py-4">ICCID</th>
							<th class="px-6 py-4">Marca / Modelo</th>
							<th class="px-6 py-4">Estatus</th>
							<th class="px-6 py-4">Cliente</th>
							<th class="px-6 py-4">Última Com.</th>
							<th class="px-6 py-4 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#if isLoading}
							<tr>
								<td colspan="7" class="px-6 py-8 text-center text-slate-500">
									Cargando dispositivos...
								</td>
							</tr>
						{:else if filteredDevices.length === 0}
							<tr>
								<td colspan="7" class="px-6 py-8 text-center text-slate-500">
									No se encontraron dispositivos.
								</td>
							</tr>
						{:else}
							{#each filteredDevices as device (device.device_id)}
								<tr
									class="transition-colors cursor-pointer {selectedDeviceId === device.device_id
										? 'bg-blue-50/50'
										: 'hover:bg-slate-50'}"
									onclick={() => handleRowClick(device)}
								>
									<td class="px-6 py-4 font-medium text-slate-900">
										{device.device_id}
									</td>
									<td class="px-6 py-4 text-slate-600 font-mono text-xs">
										{device.iccid || '-'}
									</td>
									<td class="px-6 py-4 text-slate-600">
										<div class="text-slate-900">
											{device.brand}
										</div>
										<div class="text-xs text-slate-500">
											{device.model}
										</div>
									</td>
									<td class="px-6 py-4">
										<span
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
											class:bg-blue-100={device.status === 'nuevo'}
											class:text-blue-800={device.status === 'nuevo'}
											class:bg-yellow-100={device.status === 'preparado'}
											class:text-yellow-800={device.status === 'preparado'}
											class:bg-purple-100={device.status === 'enviado'}
											class:text-purple-800={device.status === 'enviado'}
											class:bg-green-100={device.status === 'entregado'}
											class:text-green-800={device.status === 'entregado'}
											class:bg-emerald-100={device.status === 'asignado'}
											class:text-emerald-800={device.status === 'asignado'}
											class:bg-orange-100={device.status === 'devuelto'}
											class:text-orange-800={device.status === 'devuelto'}
											class:bg-red-100={device.status === 'inactivo'}
											class:text-red-800={device.status === 'inactivo'}
										>
											{device.status}
										</span>
									</td>
									<td class="px-6 py-4 text-slate-600">
										{device.client_id ? 'Asignado' : '-'}
									</td>
									<td class="px-6 py-4 text-slate-600">
										{device.last_comm_at ? new Date(device.last_comm_at).toLocaleString() : '-'}
									</td>
									<td class="px-6 py-4 text-right">
										<Button
											variant="ghost"
											size="sm"
											onclick={async (e) => {
												e.stopPropagation();
												await goto(`/products/nexus/devices/${device.device_id}`);
											}}
										>
											Detalles
										</Button>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Bottom Panel: Tabs & Content -->
		<div class="h-1/2 flex flex-col bg-slate-50">
			{#if !selectedDeviceId}
				<div class="flex flex-col items-center justify-center h-full text-slate-400">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="mb-4 text-slate-300"
					>
						<rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
						<line x1="12" y1="2" x2="12" y2="22"></line>
						<line x1="2" y1="12" x2="22" y2="12"></line>
					</svg>
					<p class="text-lg font-medium">Seleccione un dispositivo</p>
					<p class="text-sm">
						Seleccione un dispositivo de la lista de arriba para ver más opciones.
					</p>
				</div>
			{:else}
				<!-- Tabs Header -->
				<div class="flex border-b border-slate-200 bg-white">
					<button
						class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors {activeTab ===
						'commands'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}"
						onclick={() => (activeTab = 'commands')}
					>
						Comandos
					</button>
					<button
						class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors {activeTab ===
						'communications'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}"
						onclick={() => (activeTab = 'communications')}
					>
						Comunicaciones
					</button>
				</div>

				<!-- Tabs Content (Persistent) -->
				<div class="flex-1 overflow-hidden relative">
					<!-- Commands -->
					<div
						class="h-full w-full absolute inset-0 {activeTab === 'commands'
							? 'z-10'
							: 'z-0 invisible'} bg-slate-50"
					>
						<div class="h-full overflow-y-auto p-4">
							<CommandPanel deviceId={selectedDeviceId} />
						</div>
					</div>

					<!-- Communications / Map -->
					<div
						class="h-full w-full absolute inset-0 {activeTab === 'communications'
							? 'z-10'
							: 'z-0 invisible'} bg-slate-100 flex overflow-hidden"
					>
						<!-- Resizable Sidebar -->
						<div
							class="bg-white border-r border-slate-200 flex flex-col z-20 shadow-md transition-none"
							style="width: {sidebarWidth}px; min-width: 20%;"
						>
							<!-- Date & Time (Top Fixed) -->
							<div class="p-4 border-b border-slate-100">
								<div class="flex flex-col space-y-2">
									<div class="flex items-center justify-between">
										<span class="text-xs font-medium text-slate-500 uppercase tracking-wider"
											>Fecha</span
										>
										{#if lastCommunicationTime}
											<div
												class="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="12"
													height="12"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2.5"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="mr-1.5"
													><circle cx="12" cy="12" r="10"></circle><polyline
														points="12 6 12 12 16 14"
													></polyline></svg
												>
												{lastCommunicationTime}
											</div>
										{/if}
									</div>
									<input
										type="date"
										class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										bind:value={selectedDate}
									/>
								</div>

								<!-- Internal Sidebar Tabs -->
								<div class="flex mt-4 border border-slate-200 rounded-lg p-1 bg-slate-50">
									<button
										class="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all {sidebarTab ===
										'trips'
											? 'bg-white text-slate-900 shadow-sm'
											: 'text-slate-500 hover:text-slate-700'}"
										onclick={() => (sidebarTab = 'trips')}
									>
										Trayectos
									</button>
									<button
										class="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all {sidebarTab ===
										'history'
											? 'bg-white text-slate-900 shadow-sm'
											: 'text-slate-500 hover:text-slate-700'}"
										onclick={() => (sidebarTab = 'history')}
									>
										Histórico
									</button>
								</div>
							</div>

							<!-- Sidebar Content (Scrollable) -->
							<div class="flex-1 overflow-y-auto p-4">
								{#if sidebarTab === 'trips'}
									{#if isLoadingTrips}
										<div class="flex items-center justify-center py-8 text-slate-400">
											<span class="loading loading-spinner loading-sm mr-2"></span> Cargando trayectos...
										</div>
									{:else if trips.length === 0}
										<div class="text-center py-8 text-slate-400 text-sm">
											No hay trayectos para esta fecha.
										</div>
									{:else}
										<!-- Trip Controls -->
										{#if selectedTripId}
											<div class="flex items-center space-x-2 mb-4 px-1">
												<Button
													variant="secondary"
													size="sm"
													class="flex-1 flex items-center justify-center"
													onclick={togglePlay}
												>
													{#if isPlaying && !isPaused}
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
															><rect x="6" y="4" width="4" height="16"></rect><rect
																x="14"
																y="4"
																width="4"
																height="16"
															></rect></svg
														>
														<span class="ml-2">Pausa</span>
													{:else}
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
															><polygon points="5 3 19 12 5 21 5 3"></polygon></svg
														>
														<span class="ml-2">{isPaused ? 'Reanudar' : 'Play'}</span>
													{/if}
												</Button>
												<Button
													variant="ghost"
													size="sm"
													class="flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50"
													onclick={stopReplay}
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
														><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg
													>
												</Button>
											</div>
										{/if}

										<div class="space-y-3">
											{#each trips as trip (trip.trip_id)}
												<div
													class="bg-white border rounded-lg p-3 cursor-pointer transition-colors shadow-sm {selectedTripId ===
													trip.trip_id
														? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20'
														: 'border-slate-200 hover:border-blue-400'}"
													onclick={() => selectTrip(trip)}
												>
													<div class="flex justify-between items-start mb-2">
														<div class="flex items-center text-xs font-semibold text-slate-700">
															<div class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
															{new Date(trip.start_timestamp).toLocaleTimeString('es-MX', {
																hour: '2-digit',
																minute: '2-digit',
																second: '2-digit',
																hour12: false
															})}
														</div>
														<div class="flex items-center text-xs font-semibold text-slate-700">
															{new Date(trip.end_timestamp).toLocaleTimeString('es-MX', {
																hour: '2-digit',
																minute: '2-digit',
																second: '2-digit',
																hour12: false
															})}
															<div class="w-1.5 h-1.5 rounded-full bg-slate-300 ml-2"></div>
														</div>
													</div>

													<div
														class="flex justify-between text-xs text-slate-500 border-t border-slate-50 pt-2 mt-2"
													>
														<span>{(trip.distance_km || 0).toFixed(1)} km</span>
														<span>{Math.round(trip.duration_minutes || 0)} min</span>
													</div>
												</div>
											{/each}
										</div>
									{/if}
								{:else if sidebarTab === 'history'}
									{#if isLoadingCommunications}
										<div class="flex items-center justify-center py-8 text-slate-400">
											<span class="loading loading-spinner loading-sm mr-2"></span> Cargando histórico...
										</div>
									{:else if communications.length === 0}
										<div class="text-center py-8 text-slate-400 text-sm">
											sin comunicaciones en la fecha {selectedDate}
										</div>
									{:else}
										<!-- Communications Table -->
										<div class="overflow-x-auto">
											<table class="w-full text-xs text-left">
												<thead
													class="text-slate-500 border-b border-slate-200 bg-slate-50 sticky top-0"
												>
													<tr>
														<th class="px-2 py-2 font-medium">Hora</th>
														<th class="px-2 py-2 font-medium">Vel (km/h)</th>
														<th class="px-2 py-2 font-medium">Odo (km)</th>
														<th class="px-2 py-2 font-medium">Evento</th>
													</tr>
												</thead>
												<tbody class="divide-y divide-slate-100">
													{#each communications as comm (comm.gps_datetime || comm.received_at)}
														<tr class="hover:bg-slate-50 transition-colors">
															<td class="px-2 py-2 whitespace-nowrap text-slate-700 font-mono">
																{new Date(comm.gps_datetime || comm.received_at).toLocaleTimeString(
																	[],
																	{ hour: '2-digit', minute: '2-digit', second: '2-digit' }
																)}
															</td>
															<td class="px-2 py-2 text-slate-600">
																{comm.speed?.toFixed(0)}
															</td>
															<td class="px-2 py-2 text-slate-600">
																{(comm.total_distance / 1000).toFixed(1)}
															</td>
															<td class="px-2 py-2 text-slate-500 text-[10px]">
																{comm.alert_type || '-'}
															</td>
														</tr>
													{/each}
												</tbody>
											</table>
										</div>
									{/if}
								{/if}
							</div>
						</div>

						<!-- Drag Handle -->
						<div
							class="w-1 bg-slate-200 hover:bg-blue-400 cursor-col-resize z-30 transition-colors flex items-center justify-center focus:outline-none focus:bg-blue-500"
							onmousedown={startResize}
							role="separator"
							tabindex="0"
							aria-valuenow={sidebarWidth}
							aria-valuemin="100"
							aria-valuemax="1000"
						>
							<div class="h-8 w-1 bg-slate-300 rounded-full"></div>
						</div>

						<!-- Map Container -->
						<div class="flex-1 relative" bind:this={mapContainer}></div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
