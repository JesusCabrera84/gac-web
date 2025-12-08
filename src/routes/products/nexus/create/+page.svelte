<script>
    import Topbar from "$lib/components/layout/Topbar.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import { goto } from "$app/navigation";
    import { api } from "$lib/services/api";

    let deviceId = $state("");
    let model = $state("");
    let provider = $state("");
    let batch = $state("");
    let notes = $state("");
    let isLoading = $state(false);
    let error = $state("");

    async function handleSubmit(e) {
        e.preventDefault();
        isLoading = true;
        error = "";

        try {
            // Simulate API call
            // await api('/devices', {
            // 	method: 'POST',
            // 	body: JSON.stringify({ device_id: deviceId, model, provider, batch, notes })
            // });

            // Mock delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            goto("/products/nexus");
        } catch (err) {
            console.error("Failed to create device:", err);
            error = "Error al crear el dispositivo. Intente nuevamente.";
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="flex flex-col min-h-screen">
    <Topbar title="Nexus / Nuevo Dispositivo">
        <a href="/products/nexus">
            <Button variant="secondary" size="sm">Cancelar</Button>
        </a>
    </Topbar>

    <div class="p-8 max-w-3xl mx-auto w-full">
        <Card class="p-8">
            <h2 class="text-xl font-semibold mb-6 text-slate-900">
                Registrar Nuevo Dispositivo
            </h2>

            <form onsubmit={handleSubmit} class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        id="device_id"
                        label="Device ID / IMEI"
                        placeholder="Ej: NEX-123456"
                        bind:value={deviceId}
                        required
                    />

                    <Input
                        id="model"
                        label="Modelo"
                        placeholder="Ej: Nexus X1"
                        bind:value={model}
                        required
                    />

                    <Input
                        id="provider"
                        label="Proveedor de Conectividad"
                        placeholder="Ej: Telcel"
                        bind:value={provider}
                        required
                    />

                    <Input
                        id="batch"
                        label="Lote / Batch"
                        placeholder="Ej: B-2023-01"
                        bind:value={batch}
                        required
                    />
                </div>

                <div class="w-full">
                    <label
                        for="notes"
                        class="block text-sm font-medium text-slate-700 mb-1"
                        >Notas Adicionales</label
                    >
                    <textarea
                        id="notes"
                        bind:value={notes}
                        rows="3"
                        class="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                        placeholder="Información adicional..."
                    ></textarea>
                </div>

                {#if error}
                    <div class="p-3 rounded-md bg-red-50 text-red-600 text-sm">
                        {error}
                    </div>
                {/if}

                <div class="flex justify-end pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading}
                        class="w-full md:w-auto"
                    >
                        {#if isLoading}
                            <span class="mr-2 animate-spin">
                                <svg
                                    class="h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                    ></circle>
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            </span>
                            Guardar Dispositivo
                        {:else}
                            Guardar Dispositivo
                        {/if}
                    </Button>
                </div>
            </form>
        </Card>
    </div>
</div>
