import { describe, it, expect } from 'vitest';
import {
	getUserRoles,
	isAdmin,
	canAccessNexus,
	canManageInternalUsers,
	canAccessCommerce,
	canWriteNexus,
	isViewerOnly,
	pathRequiresNexusAccess,
	pathRequiresAdmin,
	canAccessDemos,
	canGenerateDemos,
	canDestroyDemo,
	pathRequiresDemosAccess
} from './roles.js';

describe('roles', () => {
	it('getUserRoles returns empty for missing user', () => {
		expect(getUserRoles(null)).toEqual([]);
	});

	it('getUserRoles normalizes role strings', () => {
		expect(getUserRoles({ roles: ['admin', 'viewer'] })).toEqual(['admin', 'viewer']);
	});

	it('isAdmin detects admin role', () => {
		expect(isAdmin({ roles: ['admin'] })).toBe(true);
		expect(isAdmin({ roles: ['viewer'] })).toBe(false);
	});

	it('nexus and internal users require admin', () => {
		const admin = { roles: ['admin'] };
		const viewer = { roles: ['viewer'] };
		expect(canAccessNexus(admin)).toBe(true);
		expect(canWriteNexus(admin)).toBe(true);
		expect(canManageInternalUsers(admin)).toBe(true);
		expect(canAccessNexus(viewer)).toBe(false);
	});

	it('commerce requires any authenticated user', () => {
		expect(canAccessCommerce({ roles: ['viewer'] })).toBe(true);
		expect(canAccessCommerce(null)).toBe(false);
	});

	it('isViewerOnly excludes admin and user roles', () => {
		expect(isViewerOnly({ roles: ['viewer'] })).toBe(true);
		expect(isViewerOnly({ roles: ['viewer', 'admin'] })).toBe(false);
		expect(isViewerOnly({ roles: ['viewer', 'user'] })).toBe(false);
	});

	it('pathRequiresNexusAccess matches nexus routes', () => {
		expect(pathRequiresNexusAccess('/products/nexus/clients')).toBe(true);
		expect(pathRequiresNexusAccess('/products/plans')).toBe(true);
		expect(pathRequiresNexusAccess('/admin/orders')).toBe(false);
	});

	it('pathRequiresAdmin matches internal users route', () => {
		expect(pathRequiresAdmin('/admin/internal-users')).toBe(true);
		expect(pathRequiresAdmin('/admin/orders')).toBe(false);
	});
});

describe('accesos de demo', () => {
	const vendedor = { roles: ['vendedor'], user_id: 'u-1' };
	const admin = { roles: ['admin'], user_id: 'u-2' };
	const otro = { roles: ['user'], user_id: 'u-3' };

	it('vendedor y admin entran; el resto no', () => {
		expect(canAccessDemos(vendedor)).toBe(true);
		expect(canAccessDemos(admin)).toBe(true);
		expect(canAccessDemos(otro)).toBe(false);
		expect(canAccessDemos(null)).toBe(false);
	});

	it('no depende de canAccessNexus, que exige admin', () => {
		// Es el motivo de que la pantalla viva en /sales y no en /products/nexus.
		expect(canAccessNexus(vendedor)).toBe(false);
		expect(canAccessDemos(vendedor)).toBe(true);
	});

	it('generar exige lo mismo que ver', () => {
		expect(canGenerateDemos(vendedor)).toBe(true);
		expect(canGenerateDemos(otro)).toBe(false);
	});

	it('destruir: solo el creador o un admin', () => {
		const demoDelVendedor = { created_by: 'u-1' };
		expect(canDestroyDemo(vendedor, demoDelVendedor)).toBe(true);
		expect(canDestroyDemo(admin, demoDelVendedor)).toBe(true);
		expect(canDestroyDemo({ roles: ['vendedor'], user_id: 'u-9' }, demoDelVendedor)).toBe(false);
	});

	it('destruir tolera datos incompletos sin conceder permiso', () => {
		expect(canDestroyDemo(null, { created_by: 'u-1' })).toBe(false);
		expect(canDestroyDemo(vendedor, null)).toBe(false);
		expect(canDestroyDemo({ roles: ['vendedor'] }, { created_by: undefined })).toBe(false);
	});

	it('acepta id ademas de user_id', () => {
		expect(canDestroyDemo({ roles: ['vendedor'], id: 'u-1' }, { created_by: 'u-1' })).toBe(true);
	});

	it('pathRequiresDemosAccess cubre la seccion y no otras', () => {
		expect(pathRequiresDemosAccess('/sales/demos')).toBe(true);
		expect(pathRequiresDemosAccess('/sales/demos/abc')).toBe(true);
		expect(pathRequiresDemosAccess('/products/nexus')).toBe(false);
	});
});
