<script>
	import Button from '$lib/components/ui/Button.svelte';
	import { copyToClipboard, buildAccessMessage, buildMailtoLink } from '$lib/utils/clipboard';

	/**
	 * Entrega del código al vendedor. Es la única vez que se ve: el entorno de
	 * demo guarda solo su hash, así que no se puede volver a consultar.
	 *
	 * Por eso este diálogo NO se cierra por Escape ni pulsando el fondo, al revés
	 * que ConfirmDialog. Un descarte accidental aquí no se puede deshacer: habría
	 * que reemitir el código y el que ya se dictó dejaría de valer.
	 *
	 * @type {{
	 * 	isOpen?: boolean,
	 * 	company?: string,
	 * 	email?: string,
	 * 	otp: string,
	 * 	accessUrl: string,
	 * 	expiresText?: string,
	 * 	provisioning?: boolean,
	 * 	onClose?: () => void
	 * }}
	 */
	let {
		isOpen = $bindable(false),
		company = '',
		email = '',
		otp,
		accessUrl,
		expiresText = '',
		provisioning = true,
		onClose = () => {}
	} = $props();

	let acknowledged = $state(false);
	/** @type {HTMLDivElement | undefined} */
	let dialog = $state();

	// El foco arranca en el primer botón del diálogo, que es "Copiar" el código:
	// la primera acción útil. Se busca en el DOM en vez de exponer un `ref` en
	// Button, para no modificar un componente que usa toda la aplicación.
	$effect(() => {
		if (isOpen) {
			acknowledged = false;
			queueMicrotask(() => {
				const primero = dialog?.querySelector('button');
				if (primero instanceof HTMLElement) primero.focus();
			});
		}
	});

	let mensaje = $derived(buildAccessMessage({ company, url: accessUrl, otp, expiresText }));
	let mailto = $derived(
		email ? buildMailtoLink({ to: email, company, url: accessUrl, otp, expiresText }) : ''
	);

	// Los dígitos se leen "cuatrocientos ochenta y dos mil…" si no se separan, y
	// el vendedor suele estar dictándolos por teléfono.
	let otpDeletreado = $derived(String(otp).split('').join(' '));
	let otpAgrupado = $derived(`${String(otp).slice(0, 3)} ${String(otp).slice(3)}`);

	function close() {
		if (!acknowledged) return;
		isOpen = false;
		onClose();
	}

	/**
	 * Trampa de foco: sin ella se puede tabular fuera del diálogo hacia una
	 * pantalla que no se puede usar, y volver es cosa de suerte.
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		if (event.key !== 'Tab' || !dialog) return;
		const focusables = dialog.querySelectorAll(
			'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])'
		);
		if (focusables.length === 0) return;
		const primero = /** @type {HTMLElement} */ (focusables[0]);
		const ultimo = /** @type {HTMLElement} */ (focusables[focusables.length - 1]);
		if (event.shiftKey && document.activeElement === primero) {
			event.preventDefault();
			ultimo.focus();
		} else if (!event.shiftKey && document.activeElement === ultimo) {
			event.preventDefault();
			primero.focus();
		}
	}
</script>

<svelte:window onkeydown={isOpen ? handleKeydown : undefined} />

{#if isOpen}
	<!-- Sin onclick en el fondo: descartarlo sin querer perderia el codigo. -->
	<div class="gac-modal-backdrop">
		<div
			class="gac-modal"
			bind:this={dialog}
			role="dialog"
			aria-modal="true"
			aria-labelledby="reveal-title"
			aria-describedby="reveal-warning"
		>
			<div
				class="flex items-start gap-3 rounded-t-[14px] p-4"
				style="background: var(--color-warning-bg); border-bottom: 1px solid color-mix(in srgb, var(--color-warning) 35%, transparent)"
			>
				<span class="shrink-0 text-warning" aria-hidden="true">
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
						<path
							d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
						/>
						<line x1="12" y1="9" x2="12" y2="13" />
						<line x1="12" y1="17" x2="12.01" y2="17" />
					</svg>
				</span>
				<div>
					<h2 id="reveal-title" class="text-base font-semibold text-app">
						Entrega este código ahora
					</h2>
					<p id="reveal-warning" class="mt-1 text-sm text-app-secondary">
						No podrás volver a consultarlo. Si se pierde, hay que emitir uno nuevo.
					</p>
				</div>
			</div>

			<div class="space-y-4 p-6">
				<div>
					<p class="gac-label">Código de acceso</p>
					<div
						class="flex items-center justify-between gap-4 rounded-lg p-5"
						style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border-strong)"
					>
						<span
							class="select-all font-mono text-3xl font-bold tracking-[0.25em] text-app"
							aria-label={`Código de acceso: ${otpDeletreado}`}
						>
							{otpAgrupado}
						</span>
						<Button
							variant="secondary"
							size="sm"
							ariaLabel="Copiar código de acceso"
							onclick={() => copyToClipboard(otp, 'Código')}
						>
							Copiar
						</Button>
					</div>
				</div>

				<div>
					<p class="gac-label">URL de acceso</p>
					<div
						class="flex items-center justify-between gap-3 rounded-lg p-3"
						style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border)"
					>
						<span class="truncate font-mono text-sm text-app-secondary">{accessUrl}</span>
						<Button variant="ghost" size="sm" onclick={() => copyToClipboard(accessUrl, 'URL')}>
							Copiar
						</Button>
					</div>
				</div>

				<!-- El boton que de verdad se usa: el canal real es el chat que el
				     vendedor ya tiene abierto con el cliente, no el correo. -->
				<Button variant="primary" onclick={() => copyToClipboard(mensaje, 'Mensaje')}>
					Copiar mensaje completo para el cliente
				</Button>

				{#if mailto}
					<a
						href={mailto}
						class="block text-center text-sm text-accent hover:underline"
						rel="noopener"
					>
						Abrir en tu cliente de correo
					</a>
				{/if}

				<div class="space-y-1 text-sm text-app-muted">
					{#if company || email}
						<p>Para: {company}{company && email ? ' · ' : ''}{email}</p>
					{/if}
					{#if expiresText}
						<p>Caduca si no se canjea antes del {expiresText}.</p>
					{/if}
					{#if provisioning}
						<p>El entorno se está creando; tarda un par de minutos. El código ya es válido.</p>
					{:else}
						<p class="text-warning">
							El código es válido, pero el aprovisionamiento del entorno falló. Revísalo en el
							detalle antes de que el cliente entre.
						</p>
					{/if}
				</div>

				<label class="flex items-start gap-2 text-sm text-app-secondary">
					<input type="checkbox" class="mt-0.5" bind:checked={acknowledged} />
					<span>
						He copiado el código y lo he entregado{company ? ` a ${company}` : ''}
					</span>
				</label>

				<div class="flex justify-end pt-2">
					<Button variant="primary" disabled={!acknowledged} onclick={close}>Cerrar</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
