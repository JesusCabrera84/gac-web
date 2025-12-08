<script>
    import Topbar from "$lib/components/layout/Topbar.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import { onMount } from "svelte";

    import { userService } from "$lib/services/users";

    let users = $state([]);
    let isLoading = $state(true);

    async function loadUsers() {
        isLoading = true;
        try {
            users = await userService.getUsers();
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        loadUsers();
    });
</script>

<div class="flex flex-col min-h-screen">
    <Topbar title="Administración / Usuarios Internos">
        <a href="/admin/internal-users/create">
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
                    class="mr-2"
                    ><path
                        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                    /><circle cx="9" cy="7" r="4" /><line
                        x1="20"
                        x2="20"
                        y1="8"
                        y2="14"
                    /><line x1="23" x2="17" y1="11" y2="11" /></svg
                >
                Nuevo Usuario
            </Button>
        </a>
    </Topbar>

    <div class="p-8">
        <Card class="overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead
                        class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200"
                    >
                        <tr>
                            <th class="px-6 py-4">Nombre</th>
                            <th class="px-6 py-4">Email</th>
                            <th class="px-6 py-4">Rol</th>
                            <th class="px-6 py-4">Estado</th>
                            <th class="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        {#if isLoading}
                            <tr>
                                <td
                                    colspan="5"
                                    class="px-6 py-8 text-center text-slate-500"
                                >
                                    Cargando usuarios...
                                </td>
                            </tr>
                        {:else}
                            {#each users as user}
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td
                                        class="px-6 py-4 font-medium text-slate-900"
                                    >
                                        <div class="flex items-center">
                                            <div
                                                class="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-3"
                                            >
                                                {user.full_name
                                                    ? user.full_name
                                                          .charAt(0)
                                                          .toUpperCase()
                                                    : user.email
                                                          .charAt(0)
                                                          .toUpperCase()}
                                            </div>
                                            {user.full_name || user.email}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-slate-600"
                                        >{user.email}</td
                                    >
                                    <td class="px-6 py-4 text-slate-600"
                                        >{user.roles
                                            ? user.roles.join(", ")
                                            : "No roles"}</td
                                    >
                                    <td class="px-6 py-4">
                                        {#if user.is_active}
                                            <span
                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                                            >
                                                Activo
                                            </span>
                                        {:else}
                                            <span
                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500"
                                            >
                                                Inactivo
                                            </span>
                                        {/if}
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
