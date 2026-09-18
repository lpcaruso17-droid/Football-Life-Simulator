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

import {
    renderInboxView
} from "./ui/inboxView.js";

import {
    showToast
} from "./ui/feedback.js";


function registerGlobalFeedback() {
    window.addEventListener(
        "fls:new-messages",
        event => {
            const detail =
                event.detail ??
                {};

            const count =
                Number(
                    detail.count
                ) || 1;


            showToast({
                type:
                    "info",

                title:
                    count > 1
                        ? `${count} novas mensagens`
                        : "Nova mensagem recebida",

                message:
                    detail.title ??
                    "Algo novo chegou à sua Central de Mensagens.",

                duration:
                    6000
            });
        }
    );
}


function bootstrap() {
    const root =
        document.querySelector(
            "#app"
        );

    registerGlobalFeedback();


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
                renderYearView,

            inbox:
                renderInboxView
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