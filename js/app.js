import {
    initializeRouter
} from "./ui/router.js";

import {
    renderHomeView
} from "./ui/homeView.js";

import {
    renderCreationView
} from "./ui/creationView.js";

import {
    renderDashboardView
} from "./ui/dashboardView.js";

import {
    renderYearView
} from "./ui/yearView.js";


function bootstrap() {
    const root =
        document.querySelector(
            "#app"
        );

    initializeRouter({
        root,

        fallback:
            "home",

        routes: {
            home:
                renderHomeView,

            create:
                renderCreationView,

            dashboard:
                renderDashboardView,

            year:
                renderYearView
        }
    });
}


window.addEventListener(
    "error",
    event => {
        console.error(
            "Football Life Simulator:",
            event.error ??
            event.message
        );
    }
);


window.addEventListener(
    "unhandledrejection",
    event => {
        console.error(
            "Promise rejeitada:",
            event.reason
        );
    }
);


if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        bootstrap
    );
} else {
    bootstrap();
}