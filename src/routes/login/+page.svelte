<script>
    import { goto } from "$app/navigation";
    import { login } from "$lib/stores/auth";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Card from "$lib/components/ui/Card.svelte";

    import { onMount, onDestroy } from "svelte";

    let email = $state("");
    let password = $state("");
    let isLoading = $state(false);
    let error = $state("");
    let particles = $state([]);
    let intervalId;

    onMount(() => {
        // Generate particles
        const particleCount = 100; // Increased count
        const generateParticle = () => ({
            id: Math.random(),
            x: Math.random() * 100, // %
            y: Math.random() * 100, // %
            // Previous size was ~1-4px. 300% of 1 is 3, 700% of 4 is 28.
            // Let's go for a range of roughly 4px to 20px for variety
            size: Math.random() * 16 + 4,
            duration: Math.random() * 10 + 5, // s
            delay: Math.random() * 5, // s
            opacity: Math.random() * 0.5 + 0.1,
        });

        // Initial set
        particles = Array.from({ length: particleCount }, generateParticle);

        // Continuously regenerate some particles to keep it alive (optional, CSS loop handles mostly)
        // actually CSS infinite animation is better.
        // Let's just set them once with infinite animations.
    });

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

<div class="particles-container">
    {#each particles as p (p.id)}
        <div
            class="particle"
            style="
                left: {p.x}%;
                width: {p.size}px;
                height: {p.size}px;
                animation-duration: {p.duration}s;
                animation-delay: -{p.delay}s; /* Negative delay to start mid-animation */
                --p-opacity: {p.opacity};
            "
        ></div>
    {/each}
</div>

<div class="w-full max-w-md relative z-10">
    <div class="text-center mb-8 flex flex-col items-center">
        <img
            src="/images/borra2.png"
            alt="Geminislabs Logo"
            class="w-40 h-42 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        />
        <h1
            class="text-4xl font-bold text-white tracking-widest uppercase"
            style="text-shadow: 0 0 10px rgba(16,185,129,0.5);"
        >
            Geminislabs
        </h1>
        <p class="text-emerald-400/80 mt-2 text-sm uppercase tracking-widest">
            Admin Console
        </p>
    </div>

    <!-- Modified Card for Dark/Matrix theme -->
    <div
        class="p-8 shadow-2xl rounded-xl border border-emerald-900/30 bg-slate-900/60 backdrop-blur-sm"
    >
        <form onsubmit={handleLogin} class="space-y-6">
            <div class="space-y-1">
                <label
                    for="email"
                    class="block text-sm font-medium text-emerald-100/80"
                    >Email Corporativo</label
                >
                <input
                    id="email"
                    type="email"
                    placeholder="usuario@geminislabs.com"
                    bind:value={email}
                    required
                    class="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-emerald-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                />
            </div>

            <div class="space-y-1">
                <label
                    for="password"
                    class="block text-sm font-medium text-emerald-100/80"
                    >Contraseña</label
                >
                <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    bind:value={password}
                    required
                    class="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-emerald-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                />
            </div>

            {#if error}
                <div
                    class="p-3 rounded-md bg-red-950/30 border border-red-900/50 text-red-200 text-sm"
                >
                    {error}
                </div>
            {/if}

            <Button
                type="submit"
                variant="primary"
                class="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] border-none"
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
                    Ingresar Sistema
                {/if}
            </Button>
        </form>
    </div>

    <p class="text-center text-xs text-slate-600 mt-8">
        &copy; {new Date().getFullYear()} GeminisLabs. Internal System.
    </p>
</div>

<style>
    :global(body) {
        background: linear-gradient(to bottom, #000000, #1a1a1a, #020617);
        background-attachment: fixed;
        overflow: hidden;
    }

    .particles-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
    }

    .particle {
        position: absolute;
        bottom: -20px;
        background-color: rgba(16, 185, 129, 0.6); /* Slightly more visible */
        border-radius: 50%;
        animation: rise linear infinite;
    }

    @keyframes rise {
        0% {
            transform: translateY(0) scale(1);
            opacity: 0;
        }
        10% {
            opacity: var(--p-opacity);
        }
        90% {
            opacity: var(--p-opacity);
        }
        100% {
            transform: translateY(-110vh) scale(0.5);
            opacity: 0;
        }
    }
</style>
