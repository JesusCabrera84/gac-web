<script>
	import { CommandsService } from '$lib/services/commands';
	import Button from '$lib/components/ui/Button.svelte';
	// Input import removed

	/** @type {{ deviceId: string | null }} */
	let { deviceId = null } = $props();

	/** @type {any[]} */
	let commands = $state([]);
	let loading = $state(false);
	let sendLoading = $state(false);
	let newCommand = $state('');
	/** @type {string | null} */
	let error = $state(null);

	// New State
	/** @type {Record<string, boolean>} */
	let syncLoading = $state({}); // Track loading state by command_id
	let showMetadataModal = $state(false);
	/** @type {any} */
	let selectedMetadata = $state(null);
	let toast = $state({ show: false, message: '', type: 'info' });
	/** @type {any} */
	let toastTimeout;

	// Load commands when deviceId changes
	$effect(() => {
		if (deviceId) {
			loadCommands();
		} else {
			commands = [];
		}
	});

	async function loadCommands() {
		if (!deviceId) return;
		loading = true;
		error = null;
		try {
			// Fetch last 50 commands
			const response = await CommandsService.getByDevice(deviceId, { limit: 50 });
			// @ts-ignore
			commands = response.commands || [];
		} catch (e) {
			console.error('Error loading commands:', e);
			error = 'Error al cargar el historial de comandos';
		} finally {
			loading = false;
		}
	}

	async function handleSendCommand() {
		if (!deviceId || !newCommand.trim()) return;
		sendLoading = true;
		error = null;
		try {
			await CommandsService.create({
				device_id: deviceId,
				command: newCommand,
				media: 'KORE_SMS_API' // Explicitly requested media type
			});
			newCommand = '';
			showToast('Comando enviado exitosamente', 'success');
			// Refresh list after sending
			await loadCommands();
		} catch (e) {
			console.error('Error sending command:', e);
			error = 'Error al enviar el comando. Intente nuevamente.';
			showToast('Error al enviar el comando', 'error');
		} finally {
			sendLoading = false;
		}
	}

	/** @param {any} command */
	async function handleSync(command) {
		if (syncLoading[command.command_id]) return;

		syncLoading[command.command_id] = true;
		try {
			const updatedCommand = await CommandsService.sync(command.command_id);

			// Update local state
			const index = commands.findIndex((c) => c.command_id === command.command_id);
			if (index !== -1) {
				commands[index] = { ...commands[index], ...updatedCommand };
			}

			showToast('Sincronización exitosa', 'success');
		} catch (e) {
			console.error('Sync error:', e);

			// Update metadata with error if possible, or just toast
			const index = commands.findIndex((c) => c.command_id === command.command_id);
			if (index !== -1) {
				// Create a copy to trigger reactivity if needed, though $state array mutation should work
				const cmd = commands[index];
				commands[index] = {
					...cmd,
					metadata: {
						...cmd.metadata,
						sync_error: /** @type {any} */ (e).message
					}
				};
			}

			showToast('Error al sincronizar con KORE', 'error');
		} finally {
			syncLoading[command.command_id] = false;
		}
	}

	/** @param {string} text */
	function copyToClipboard(text) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				showToast('ID copiado al portapapeles', 'success');
			})
			.catch(() => {
				showToast('Error al copiar ID', 'error');
			});
	}

	/** @param {any} metadata */
	function openMetadata(metadata) {
		selectedMetadata = metadata;
		showMetadataModal = true;
	}

	function closeMetadata() {
		showMetadataModal = false;
		selectedMetadata = null;
	}

	/**
	 * @param {string} message
	 * @param {string} [type]
	 */
	function showToast(message, type = 'info') {
		if (toastTimeout) clearTimeout(toastTimeout);
		toast = { show: true, message, type };
		toastTimeout = setTimeout(() => {
			toast = { ...toast, show: false };
		}, 3000);
	}

	/** @param {string} dateString */
	function formatDate(dateString) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleString();
	}
</script>

{#if deviceId}
	<div
		class="mt-6 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-300"
	>
		<div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
			<h3 class="font-semibold text-slate-800">
				Comandos del Dispositivo: <span class="font-mono text-blue-600">{deviceId}</span>
			</h3>
			<Button variant="ghost" size="sm" onclick={loadCommands} disabled={loading}>Recargar</Button>
		</div>

		<div
			class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100"
		>
			<!-- Send Command Form -->
			<div class="p-4 md:col-span-1 bg-slate-50/50">
				<h4 class="text-sm font-medium text-slate-700 mb-3">Enviar Nuevo Comando</h4>
				<div class="space-y-3">
					<div>
						<label for="command-input" class="sr-only">Comando</label>
						<textarea
							id="command-input"
							bind:value={newCommand}
							class="w-full min-h-[100px] p-3 rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono"
							placeholder="Escriba el comando aquí (ej. AT+LOCATION)..."
						></textarea>
						<p class="text-xs text-slate-500 mt-1">
							Medio de envío: <span class="font-mono font-medium">KORE_SMS_API</span>
						</p>
					</div>

					{#if error}
						<div class="text-xs text-red-600 bg-red-50 p-2 rounded">
							{error}
						</div>
					{/if}

					<Button
						variant="primary"
						class="w-full"
						onclick={handleSendCommand}
						disabled={sendLoading || !newCommand.trim()}
					>
						{#if sendLoading}
							Enviando...
						{:else}
							Enviar Comando
						{/if}
					</Button>
				</div>
			</div>

			<!-- Command History List -->
			<div class="md:col-span-2 flex flex-col h-[400px]">
				<div class="p-3 border-b border-slate-100 bg-white sticky top-0 z-10">
					<h4 class="text-sm font-medium text-slate-700">Historial Reciente</h4>
				</div>
				<div class="flex-1 overflow-y-auto p-0">
					{#if loading && commands.length === 0}
						<div class="flex items-center justify-center h-full text-slate-400">
							Cargando historial...
						</div>
					{:else if commands.length === 0}
						<div
							class="flex items-center justify-center h-full text-slate-400 text-sm p-4 text-center"
						>
							No hay comandos registrados para este dispositivo.
						</div>
					{:else}
						<table class="w-full text-sm text-left">
							<thead class="bg-slate-50 text-slate-500 font-medium text-xs sticky top-0">
								<tr>
									<th class="px-4 py-2 border-b w-16">ID</th>
									<th class="px-4 py-2 border-b">Estado</th>
									<th class="px-4 py-2 border-b">Comando</th>
									<th class="px-4 py-2 border-b">Metadata</th>
									<th class="px-4 py-2 border-b">Fecha Envío</th>
									<th class="px-4 py-2 border-b">Actualizado</th>
									<th class="px-4 py-2 border-b text-right">Acciones</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each commands as cmd (cmd.command_id)}
									<tr class="hover:bg-slate-50 transition-colors">
										<td class="px-4 py-3">
											<button
												class="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100"
												onclick={() => copyToClipboard(cmd.command_id)}
												title="Copiar ID: {cmd.command_id}"
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
													<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
													<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
												</svg>
												<span class="sr-only">Copiar ID</span>
											</button>
										</td>
										<td class="px-4 py-3">
											<span
												class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
												{cmd.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
												{cmd.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
												{cmd.status === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
												{cmd.status === 'failed' ? 'bg-red-100 text-red-800' : ''}"
											>
												{cmd.status}
											</span>
										</td>
										<td class="px-4 py-3 font-mono text-xs text-slate-700 break-all max-w-[200px]">
											{cmd.command}
										</td>
										<td class="px-4 py-3">
											{#if cmd.command_metadata && Object.keys(cmd.command_metadata).length > 0}
												<button
													class="text-slate-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100"
													onclick={() => openMetadata(cmd.command_metadata)}
													title="Ver Metadata"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="18"
														height="18"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													>
														<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
														<circle cx="12" cy="12" r="3"></circle>
													</svg>
												</button>
											{:else}
												<span class="text-slate-300">-</span>
											{/if}
										</td>
										<td class="px-4 py-3 text-slate-500 text-xs">
											{formatDate(cmd.requested_at)}
										</td>
										<td class="px-4 py-3 text-slate-500 text-xs">
											{formatDate(cmd.updated_at)}
										</td>
										<td class="px-4 py-3 text-right">
											<button
												class="text-slate-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
												onclick={() => handleSync(cmd)}
												disabled={syncLoading[cmd.command_id]}
												title="Sincronizar con KORE"
											>
												{#if syncLoading[cmd.command_id]}
													<svg
														class="animate-spin"
														xmlns="http://www.w3.org/2000/svg"
														width="18"
														height="18"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													>
														<path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
													</svg>
												{:else}
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="18"
														height="18"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													>
														<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
														<path d="M3 3v5h5"></path>
														<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
														<path d="M16 21h5v-5"></path>
													</svg>
												{/if}
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Metadata Modal -->
	{#if showMetadataModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity"
			onclick={closeMetadata}
			role="presentation"
		>
			<div
				class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.key === 'Escape' && closeMetadata()}
				role="dialog"
				tabindex="-1"
				aria-modal="true"
			>
				<div class="flex items-center justify-between p-4 border-b border-slate-100">
					<h3 class="text-lg font-semibold text-slate-800">Metadata del Comando</h3>
					<button
						onclick={closeMetadata}
						class="text-slate-400 hover:text-slate-600 transition-colors"
						aria-label="Cerrar metadata"
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
							stroke-linejoin="round"
						>
							<path d="M18 6 6 18"></path>
							<path d="m6 6 12 12"></path>
						</svg>
					</button>
				</div>
				<div class="p-4 overflow-y-auto bg-slate-50 font-mono text-sm">
					<pre
						class="bg-white p-4 rounded border border-slate-200 shadow-sm overflow-x-auto text-xs leading-relaxed text-slate-700">{JSON.stringify(
							selectedMetadata,
							null,
							2
						)}</pre>
				</div>
				<div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
					<Button variant="outline" size="sm" onclick={closeMetadata}>Cerrar</Button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Toast -->
	{#if toast.show}
		<div class="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
			<div
				class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium
				{toast.type === 'success'
					? 'bg-green-50 text-green-800 border-green-200'
					: toast.type === 'error'
						? 'bg-red-50 text-red-800 border-red-200'
						: 'bg-white text-slate-700 border-slate-200'}"
			>
				{#if toast.type === 'success'}
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
						class="text-green-600"
						><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"
						></path></svg
					>
				{:else if toast.type === 'error'}
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
						class="text-red-600"
						><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"
						></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg
					>
				{/if}
				{toast.message}
			</div>
		</div>
	{/if}
{/if}
