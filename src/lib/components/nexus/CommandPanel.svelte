<script>
	import { CommandsService } from '$lib/services/commands';
	import Button from '$lib/components/ui/Button.svelte';
	// Input import removed

	/** @type {{ deviceId: string | null }} */
	let { deviceId = null } = $props();

	let commands = $state([]);
	let loading = $state(false);
	let sendLoading = $state(false);
	let newCommand = $state('');
	let error = $state(null);

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
			// Refresh list after sending
			await loadCommands();
		} catch (e) {
			console.error('Error sending command:', e);
			error = 'Error al enviar el comando. Intente nuevamente.';
		} finally {
			sendLoading = false;
		}
	}

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
									<th class="px-4 py-2 border-b">ID</th>
									<th class="px-4 py-2 border-b">Estado</th>
									<th class="px-4 py-2 border-b">Comando</th>
									<th class="px-4 py-2 border-b">Fecha Envío</th>
									<th class="px-4 py-2 border-b">Actualizado</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each commands as cmd (cmd.command_id)}
									<tr class="hover:bg-slate-50">
										<td class="px-4 py-3 font-mono text-xs text-slate-500">
											{cmd.command_id.slice(0, 8)}...
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
										<td class="px-4 py-3 font-mono text-xs text-slate-700 break-all">
											{cmd.command}
										</td>
										<td class="px-4 py-3 text-slate-500 text-xs">
											{formatDate(cmd.requested_at)}
										</td>
										<td class="px-4 py-3 text-slate-500 text-xs">
											{formatDate(cmd.updated_at)}
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
{/if}
