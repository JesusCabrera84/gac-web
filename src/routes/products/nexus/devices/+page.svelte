<script>
    import Topbar from "$lib/components/layout/Topbar.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import { DevicesService } from "$lib/services/devices";
    import { onMount } from "svelte";

    let devices = $state([]);
    let isLoading = $state(true);
    let searchTerm = $state("");

    onMount(async () => {
        await loadDevices();
    });

    async function loadDevices() {
        isLoading = true;
        try {
            devices = await DevicesService.getAll();
        } catch (error) {
            console.error("Error loading devices:", error);
        } finally {
            isLoading = false;
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
        }),
    );
</script>

<div class="flex flex-col min-h-screen">
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

    <div class="p-8 space-y-6">
        <Card class="overflow-hidden">
            <div
                class="p-4 border-b border-slate-100 flex justify-between items-center"
            >
                <div class="w-full md:w-96">
                    <Input
                        placeholder="Buscar por ID, Marca, Modelo..."
                        bind:value={searchTerm}
                        class="w-full"
                    />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onclick={loadDevices}
                    disabled={isLoading}
                >
                    Actualizar
                </Button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead
                        class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200"
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
                                <td
                                    colspan="7"
                                    class="px-6 py-8 text-center text-slate-500"
                                >
                                    Cargando dispositivos...
                                </td>
                            </tr>
                        {:else if filteredDevices.length === 0}
                            <tr>
                                <td
                                    colspan="7"
                                    class="px-6 py-8 text-center text-slate-500"
                                >
                                    No se encontraron dispositivos.
                                </td>
                            </tr>
                        {:else}
                            {#each filteredDevices as device}
                                <tr
                                    class="hover:bg-slate-50 transition-colors cursor-pointer"
                                    onclick={() =>
                                        (window.location.href = `/products/nexus/devices/${device.device_id}`)}
                                >
                                    <td
                                        class="px-6 py-4 font-medium text-slate-900"
                                    >
                                        {device.device_id}
                                    </td>
                                    <td
                                        class="px-6 py-4 text-slate-600 font-mono text-xs"
                                    >
                                        {device.iccid || "-"}
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
                                            class:bg-blue-100={device.status ===
                                                "nuevo"}
                                            class:text-blue-800={device.status ===
                                                "nuevo"}
                                            class:bg-yellow-100={device.status ===
                                                "preparado"}
                                            class:text-yellow-800={device.status ===
                                                "preparado"}
                                            class:bg-purple-100={device.status ===
                                                "enviado"}
                                            class:text-purple-800={device.status ===
                                                "enviado"}
                                            class:bg-green-100={device.status ===
                                                "entregado"}
                                            class:text-green-800={device.status ===
                                                "entregado"}
                                            class:bg-emerald-100={device.status ===
                                                "asignado"}
                                            class:text-emerald-800={device.status ===
                                                "asignado"}
                                            class:bg-orange-100={device.status ===
                                                "devuelto"}
                                            class:text-orange-800={device.status ===
                                                "devuelto"}
                                            class:bg-red-100={device.status ===
                                                "inactivo"}
                                            class:text-red-800={device.status ===
                                                "inactivo"}
                                        >
                                            {device.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-slate-600">
                                        {device.client_id ? "Asignado" : "-"}
                                        <!-- Ideally fetch client name or show ID -->
                                    </td>
                                    <td class="px-6 py-4 text-slate-600">
                                        {device.last_comm_at
                                            ? new Date(
                                                  device.last_comm_at,
                                              ).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm"
                                            >Editar</Button
                                        >
                                    </td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
</div>
