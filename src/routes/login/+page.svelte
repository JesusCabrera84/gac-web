<script>
    import { goto } from "$app/navigation";
    import { login } from "$lib/stores/auth";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Card from "$lib/components/ui/Card.svelte";

    let email = $state("");
    let password = $state("");
    let isLoading = $state(false);
    let error = $state("");

    async function handleLogin(e) {
        e.preventDefault();
        isLoading = true;
        error = "";

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (!email || !password) {
            error = "Por favor ingresa tus credenciales";
            isLoading = false;
            return;
        }

        try {
            // Real login
            await login(email, password);
            goto("/products");
        } catch (err) {
            error = "Error al iniciar sesión. Verifique sus credenciales.";
            console.error(err);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="w-full max-w-md">
    <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">
            Gemini Admin
        </h1>
        <p class="text-slate-500 mt-2">Ingresa a tu cuenta para continuar</p>
    </div>

    <Card class="p-8 shadow-lg border-slate-100">
        <form onsubmit={handleLogin} class="space-y-6">
            <Input
                id="email"
                label="Email Corporativo"
                type="email"
                placeholder="usuario@geminislabs.com"
                bind:value={email}
                required
            />

            <Input
                id="password"
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                bind:value={password}
                required
            />

            {#if error}
                <div class="p-3 rounded-md bg-red-50 text-red-600 text-sm">
                    {error}
                </div>
            {/if}

            <Button
                type="submit"
                variant="primary"
                class="w-full"
                disabled={isLoading}
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
                    Iniciando...
                {:else}
                    Ingresar
                {/if}
            </Button>
        </form>
    </Card>

    <p class="text-center text-xs text-slate-400 mt-8">
        &copy; {new Date().getFullYear()} GeminisLabs. Internal System.
    </p>
</div>
