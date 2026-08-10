/**
 * Utilidades de roles GAC (JWT /auth/me → user.roles: string[]).
 */

/** @typedef {{ roles?: string[], user_id?: string, id?: string }} GacUser */

/** @param {GacUser | null | undefined} user */
export function getUserRoles(user) {
	if (!user) return [];
	if (Array.isArray(user.roles)) return user.roles.map(String);
	return [];
}

/** @param {GacUser | null | undefined} user */
export function isAdmin(user) {
	return getUserRoles(user).includes('admin');
}

/** Nexus, catálogo y planes requieren token PASETO (solo rol admin en GAC). */
/** @param {GacUser | null | undefined} user */
export function canAccessNexus(user) {
	return isAdmin(user);
}

/** @param {GacUser | null | undefined} user */
export function canManageInternalUsers(user) {
	return isAdmin(user);
}

/** Órdenes, pagos y envíos: cualquier usuario autenticado. */
/** @param {GacUser | null | undefined} user */
export function canAccessCommerce(user) {
	return Boolean(user);
}

/** @param {GacUser | null | undefined} user */
export function canWriteNexus(user) {
	return isAdmin(user);
}

/** @param {GacUser | null | undefined} user */
export function isViewerOnly(user) {
	const roles = getUserRoles(user);
	return roles.includes('viewer') && !roles.includes('admin') && !roles.includes('user');
}

/**
 * Accesos de demo: `admin` o `vendedor`.
 *
 * No cuelga de `canAccessNexus`, que es literalmente `isAdmin`: el usuario
 * principal de esta pantalla es el vendedor, y darle admin para que pueda
 * generar demos significaria darle tambien la administracion de Nexus y la
 * emision de tokens internos.
 *
 * Espeja el `require_roles(["admin", "vendedor"])` de gac-api. La comprobacion
 * del navegador es comodidad de interfaz; la que manda es la del servidor.
 *
 * @param {GacUser | null | undefined} user
 */
export function canAccessDemos(user) {
	const roles = getUserRoles(user);
	return roles.includes('admin') || roles.includes('vendedor');
}

/**
 * Generar y extender. Mismo permiso que ver: quien entra a la pantalla puede
 * usarla. Lo que se restringe de verdad es destruir.
 *
 * @param {GacUser | null | undefined} user
 */
export function canGenerateDemos(user) {
	return canAccessDemos(user);
}

/**
 * Resetear y dar de baja: solo el vendedor que la genero, o un admin.
 * Destruyen el entorno del cliente de otra persona.
 *
 * @param {GacUser | null | undefined} user
 * @param {{ created_by?: string } | null | undefined} demo
 */
export function canDestroyDemo(user, demo) {
	if (!user || !demo) return false;
	if (isAdmin(user)) return true;
	const propio = user.user_id ?? user.id;
	return Boolean(propio) && propio === demo.created_by;
}

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function pathRequiresDemosAccess(pathname) {
	return pathname.startsWith('/sales/demos');
}

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function pathRequiresNexusAccess(pathname) {
	return (
		pathname.startsWith('/products/nexus') ||
		pathname.startsWith('/products/plans') ||
		pathname.startsWith('/products/catalog')
	);
}

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function pathRequiresAdmin(pathname) {
	return pathname.startsWith('/admin/internal-users');
}
