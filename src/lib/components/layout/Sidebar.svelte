<script>
    import { page } from "$app/stores";
    import { auth, logout } from "$lib/stores/auth";

    const menuItems = [
        { href: "/products", label: "Dashboard", icon: "LayoutDashboard" },
        { href: "/products/nexus", label: "Nexus", icon: "Smartphone" },
        {
            href: "/admin/internal-users",
            label: "Usuarios Internos",
            icon: "Users",
        },
    ];

    function isActive(href) {
        return $page.url.pathname.startsWith(href);
    }
</script>

<aside
    class="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300"
>
    <div class="p-6 border-b border-slate-800 flex flex-col items-center">
        <img
            src="/images/logo.png"
            alt="Geminislabs Logo"
            class="w-10 h-10 mb-3"
        />
        <h1
            class="text-lg font-bold tracking-tight text-white text-center leading-tight"
        >
            Geminislabs Admin Console
        </h1>
    </div>

    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        {#each menuItems as item}
            <a
                href={item.href}
                class="flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200
				{isActive(item.href)
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}"
            >
                <!-- Icon placeholder -->
                <span class="mr-3">
                    {#if item.icon === "LayoutDashboard"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><rect
                                width="7"
                                height="9"
                                x="3"
                                y="3"
                                rx="1"
                            /><rect
                                width="7"
                                height="5"
                                x="14"
                                y="3"
                                rx="1"
                            /><rect
                                width="7"
                                height="9"
                                x="14"
                                y="12"
                                rx="1"
                            /><rect
                                width="7"
                                height="5"
                                x="3"
                                y="16"
                                rx="1"
                            /></svg
                        >
                    {:else if item.icon === "Smartphone"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><rect
                                width="14"
                                height="20"
                                x="5"
                                y="2"
                                rx="2"
                                ry="2"
                            /><path d="M12 18h.01" /></svg
                        >
                    {:else if item.icon === "Users"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path
                                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                            /><circle cx="9" cy="7" r="4" /><path
                                d="M22 21v-2a4 4 0 0 0-3-3.87"
                            /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg
                        >
                    {/if}
                </span>
                {item.label}
            </a>
        {/each}
    </nav>

    <div class="p-4 border-t border-slate-800">
        <div class="flex items-center mb-4 px-2">
            <div
                class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white mr-3"
            >
                {$auth.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div class="overflow-hidden">
                <p class="text-sm font-medium text-white truncate">
                    {$auth.user?.name || "User"}
                </p>
                <p class="text-xs text-slate-500 truncate">
                    {$auth.user?.email || "email@example.com"}
                </p>
            </div>
        </div>
        <button
            onclick={logout}
            class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-400 bg-slate-800/50 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
        >
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
                ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline
                    points="16 17 21 12 16 7"
                /><line x1="21" x2="9" y1="12" y2="12" /></svg
            >
            Cerrar Sesión
        </button>
    </div>
</aside>
