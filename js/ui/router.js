let appRoot = null;

let routeMap = {};

let defaultRoute =
    "home";


function getRouteFromHash() {
    const rawHash =
        window.location.hash
            .replace(
                /^#\/?/,
                ""
            )
            .trim();

    if (!rawHash) {
        return defaultRoute;
    }

    return rawHash
        .split("?")[0]
        .split("/")[0];
}


export function navigateTo(
    route
) {
    const normalized =
        String(
            route ?? ""
        )
            .replace(
                /^#\/?/,
                ""
            )
            .trim();

    const target =
        normalized ||
        defaultRoute;

    const nextHash =
        `#/${target}`;

    if (
        window.location.hash ===
        nextHash
    ) {
        renderCurrentRoute();

        return;
    }

    window.location.hash =
        nextHash;
}


export function renderCurrentRoute() {
    if (!appRoot) {
        return;
    }

    const route =
        getRouteFromHash();

    const renderer =
        routeMap[route] ??
        routeMap[
            defaultRoute
        ];

    if (
        typeof renderer !==
        "function"
    ) {
        appRoot.innerHTML =
            `
                <main class="app-shell">
                    <p>
                        Rota não encontrada.
                    </p>
                </main>
            `;

        return;
    }

    appRoot.innerHTML = "";

    renderer(
        appRoot
    );
}


export function initializeRouter({
    root,
    routes,
    fallback = "home"
}) {
    if (!root) {
        throw new Error(
            "Elemento raiz da aplicação não encontrado."
        );
    }

    appRoot =
        root;

    routeMap =
        routes ?? {};

    defaultRoute =
        fallback;

    window.addEventListener(
        "hashchange",
        renderCurrentRoute
    );

    if (
        !window.location.hash
    ) {
        navigateTo(
            defaultRoute
        );

        return;
    }

    renderCurrentRoute();
}