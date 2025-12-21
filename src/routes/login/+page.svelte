<script>
	import { goto } from '$app/navigation';
	import { login } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';

	import { onMount } from 'svelte';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');

	onMount(() => {
		// Any future mounting logic
	});

	/** @param {SubmitEvent} e */
	async function handleLogin(e) {
		e.preventDefault();
		isLoading = true;
		error = '';

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		if (!email || !password) {
			error = 'Por favor ingresa tus credenciales';
			isLoading = false;
			return;
		}

		try {
			// Real login
			await login(email, password);
			await goto('/');
		} catch (err) {
			error = 'Error al iniciar sesión. Verifique sus credenciales.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
</script>

<!-- Background Effects Container -->
<div class="bg-layer">
	<!-- Cosmic Drift: The stars moving slowly -->
	<div class="bg-cosmic"></div>
	<!-- Aurora Pulse: Breathing color atmosphere -->
	<div class="bg-aurora"></div>
	<!-- Twinkling Stars (Parallax Top) -->
	<div class="stars-wrapper">
		<div class="stars-1"></div>
		<div class="stars-2"></div>
	</div>
</div>

<div class="w-full max-w-md relative z-10">
	<!-- Logo/Header Section -->
	<div class="text-center mb-8 mt-16 flex flex-col items-center">
		<!-- Added a glowing container for the logo to match the "app icon" look in the example -->
		<div class="relative group">
			<div
				class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"
			></div>
			<div
				class="relative bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/10 ring-1 ring-white/20"
			>
				<img
					src="/images/borra2.png"
					alt="Geminislabs Logo"
					class="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
				/>
			</div>
		</div>

		<h1
			class="mt-6 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-200 tracking-wider"
		>
			Welcome to Gemini
		</h1>
		<p class="text-purple-200/60 mt-2 text-sm">Admin Console Access</p>
	</div>

	<!-- Glassmorphism Card -->
	<div
		class="p-8 shadow-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden"
	>
		<!-- Shine effect on top border -->
		<div
			class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
		></div>

		<form onsubmit={handleLogin} class="space-y-5">
			<div class="space-y-1">
				<label
					for="email"
					class="block text-xs font-medium text-purple-200/70 uppercase tracking-wider ml-1"
					>Email</label
				>
				<input
					id="email"
					type="email"
					placeholder="usuario@geminislabs.com"
					bind:value={email}
					required
					class="flex h-12 w-full rounded-xl border border-white/5 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-black/40 transition-all duration-300"
				/>
			</div>

			<div class="space-y-1">
				<label
					for="password"
					class="block text-xs font-medium text-purple-200/70 uppercase tracking-wider ml-1"
					>Password</label
				>
				<input
					id="password"
					type="password"
					placeholder="••••••••"
					bind:value={password}
					required
					class="flex h-12 w-full rounded-xl border border-white/5 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-black/40 transition-all duration-300"
				/>
			</div>

			{#if error}
				<div
					class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm backdrop-blur-sm"
				>
					{error}
				</div>
			{/if}

			<Button
				type="submit"
				class="w-full h-14 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-900/20 border-none transition-all duration-300 font-bold tracking-wide mt-4 text-lg"
				disabled={isLoading}
			>
				{#if isLoading}
					<span class="mr-2 animate-spin">
						<svg
							class="h-5 w-5 text-white"
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
				{:else}
					SIGN UP
				{/if}
			</Button>
		</form>
	</div>
</div>

<style>
	:global(body) {
		background-color: #020617;
		overflow: hidden;
		font-family: 'Inter', system-ui, sans-serif;
	}

	.bg-layer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 0;
		overflow: hidden;
	}

	.bg-cosmic {
		position: absolute;
		top: -10%;
		left: -10%;
		width: 120%;
		height: 120%;
		/* Base Image Tinted */
		background:
			linear-gradient(to bottom, rgba(147, 51, 234, 0.4), rgba(236, 72, 153, 0.4)),
			url('/images/login-bg.jpg') no-repeat center center;
		background-size: cover;
		background-blend-mode: overlay;

		/* The Animation */
		animation: cosmic-drift 60s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
	}

	.bg-aurora {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.15), transparent 70%);
		mix-blend-mode: screen;
		animation: aurora-pulse 8s infinite alternate ease-in-out;
	}

	.stars-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 50%; /* Only upper half */
		mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
		pointer-events: none;
	}

	/* Use simple radial gradients for CSS stars */
	.stars-1,
	.stars-2 {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-repeat: repeat;
	}

	.stars-1 {
		/* Small stars */
		background-image:
			radial-gradient(1px 1px at 20px 30px, #fff, rgba(0, 0, 0, 0)),
			radial-gradient(1px 1px at 40px 70px, #fff, rgba(0, 0, 0, 0)),
			radial-gradient(1px 1px at 50px 160px, #fff, rgba(0, 0, 0, 0)),
			radial-gradient(1px 1px at 90px 40px, #fff, rgba(0, 0, 0, 0)),
			radial-gradient(1px 1px at 130px 80px, #fff, rgba(0, 0, 0, 0)),
			radial-gradient(1px 1px at 160px 120px, #fff, rgba(0, 0, 0, 0));
		background-size: 200px 200px;
		animation:
			stars-move 100s linear infinite,
			stars-twinkle 3s ease-in-out infinite alternate;
	}

	.stars-2 {
		/* Slightly larger stars */
		background-image:
			radial-gradient(2px 2px at 100px 50px, #fff, rgba(0, 0, 0, 0)),
			radial-gradient(2px 2px at 200px 150px, #fff, rgba(0, 0, 0, 0)),
			radial-gradient(2px 2px at 300px 100px, #fff, rgba(0, 0, 0, 0));
		background-size: 400px 400px;
		animation:
			stars-move 150s linear infinite,
			stars-twinkle 5s ease-in-out infinite alternate-reverse;
	}

	@keyframes cosmic-drift {
		0% {
			transform: scale(1) rotate(0deg);
		}
		100% {
			transform: scale(1.15) rotate(1deg);
		}
	}

	@keyframes aurora-pulse {
		0% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.1);
		}
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
	}

	@keyframes stars-move {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-100px);
		}
	}

	@keyframes stars-twinkle {
		0% {
			opacity: 0.3;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.3;
		}
	}
</style>
