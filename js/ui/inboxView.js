import {
    loadActiveGame,
    saveGame
} from "../core/saveManager.js";

import {
    refreshInboxOpportunities,
    getInboxMessages,
    markInboxMessageRead,
    resolveInboxAction
} from "../systems/inboxSystem.js";

import {
    navigateTo
} from "./router.js";


function escapeHtml(
    value
) {
    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function getTypeLabel(
    message
) {
    const labels = {
        academy:
            "CLUBE",

        representation:
            "EMPRESÁRIO",

        formation_contract:
            "CONTRATO DE FORMAÇÃO",

        professional_contract:
            "CONTRATO PROFISSIONAL"
    };

    return (
        labels[
            message.offerType
        ] ??
        "MENSAGEM"
    );
}


function getResolutionLabel(
    resolution
) {
    const labels = {
        accepted:
            "Aceita",

        declined:
            "Recusada",

        expired:
            "Expirada",

        withdrawn:
            "Retirada pelo clube"
    };

    return (
        labels[resolution] ??
        resolution ??
        "Resolvida"
    );
}


function renderMessage(
    game,
    message
) {
    const resolved =
        message.status ===
        "resolved";

    const minor =
        game.calendar.age <
        18;

    const canNegotiate =
        message.offerType ===
            "formation_contract" ||
        message.offerType ===
            "professional_contract";

    return `
        <article
            class="
                inbox-card
                ${
                    message.status ===
                    "unread"
                        ? "unread"
                        : ""
                }
                ${
                    resolved
                        ? "resolved"
                        : ""
                }
            "
            data-message-id="${escapeHtml(
                message.id
            )}"
        >
            <div class="inbox-card-top">
                <div>
                    <div class="inbox-type">
                        ${escapeHtml(
                            getTypeLabel(
                                message
                            )
                        )}
                    </div>

                    <h2>
                        ${escapeHtml(
                            message.title
                        )}
                    </h2>
                </div>

                <div class="inbox-date">
                    ${escapeHtml(
                        message.createdYear
                    )}

                    ·

                    ${escapeHtml(
                        message.createdAge
                    )}
                    anos
                </div>
            </div>

            <p class="inbox-body">
                ${escapeHtml(
                    message.body
                )}
            </p>

            ${
                resolved
                    ? `
                        <div class="inbox-resolution">
                            ${escapeHtml(
                                getResolutionLabel(
                                    message.resolution
                                )
                            )}
                        </div>
                    `
                    : `
                        <div class="inbox-actions">
                            ${
                                minor
                                    ? `
                                        <button
                                            type="button"
                                            class="btn"
                                            data-action="family"
                                        >
                                            Conversar com a família
                                        </button>
                                    `
                                    : ""
                            }

                            ${
                                canNegotiate
                                    ? `
                                        <button
                                            type="button"
                                            class="btn"
                                            data-action="negotiate"
                                        >
                                            Negociar
                                        </button>
                                    `
                                    : ""
                            }

                            <button
                                type="button"
                                class="btn btn-primary"
                                data-action="accept"
                            >
                                Aceitar
                            </button>

                            <button
                                type="button"
                                class="btn btn-danger"
                                data-action="decline"
                            >
                                Recusar
                            </button>
                        </div>
                    `
            }
        </article>
    `;
}


export function renderInboxView(
    root
) {
    const game =
        loadActiveGame();

    if (!game) {
        navigateTo(
            "home"
        );

        return;
    }

    const refresh =
        refreshInboxOpportunities(
            game
        );

    if (
        refresh.createdMessages >
        0
    ) {
        saveGame(
            game,
            {
                reason:
                    "inbox_opportunities_generated"
            }
        );
    }

    const messages =
        getInboxMessages(
            game
        );

    root.innerHTML = `
        <main class="app-shell page">
            <div class="inbox-header">
                <div>
                    <div class="eyebrow">
                        Decisões
                    </div>

                    <h1 class="page-title">
                        Caixa de entrada
                    </h1>

                    <p class="page-subtitle">
                        Clubes, empresários e contratos
                        importantes aparecem aqui.
                        Algumas decisões podem mudar
                        completamente sua trajetória.
                    </p>
                </div>

                <button
                    id="back-dashboard"
                    type="button"
                    class="btn"
                >
                    Voltar
                </button>
            </div>

            <section class="inbox-list">
                ${
                    messages.length
                        ? messages
                            .map(
                                message =>
                                    renderMessage(
                                        game,
                                        message
                                    )
                            )
                            .join("")
                        : `
                            <div class="card empty-state">
                                Sua caixa de entrada está vazia.

                                <br><br>

                                Continue vivendo os anos da carreira.
                                Novas oportunidades podem aparecer
                                conforme sua reputação e desempenho crescem.
                            </div>
                        `
                }
            </section>
        </main>
    `;

    root
        .querySelector(
            "#back-dashboard"
        )
        ?.addEventListener(
            "click",
            () => {
                saveGame(
                    game,
                    {
                        reason:
                            "leave_inbox"
                    }
                );

                navigateTo(
                    "dashboard"
                );
            }
        );

    root
        .querySelectorAll(
            "[data-message-id]"
        )
        .forEach(
            card => {
                const messageId =
                    card.dataset
                        .messageId;

                markInboxMessageRead(
                    game,
                    messageId
                );

                card
                    .querySelectorAll(
                        "[data-action]"
                    )
                    .forEach(
                        button => {
                            button
                                .addEventListener(
                                    "click",
                                    () => {
                                        const action =
                                            button
                                                .dataset
                                                .action;

                                        try {
                                            const result =
                                                resolveInboxAction(
                                                    game,
                                                    messageId,
                                                    action
                                                );

                                            saveGame(
                                                game,
                                                {
                                                    reason:
                                                        `inbox_${action}`
                                                }
                                            );

                                            if (
                                                action ===
                                                "family"
                                            ) {
                                                window.alert(
                                                    "Você conversou com sua família. Agora pode decidir como seguir."
                                                );
                                            }

                                            if (
                                                action ===
                                                "negotiate"
                                            ) {
                                                if (
                                                    result.status ===
                                                    "improved"
                                                ) {
                                                    window.alert(
                                                        "A negociação funcionou. O clube melhorou a proposta."
                                                    );
                                                }

                                                if (
                                                    result.status ===
                                                    "unchanged"
                                                ) {
                                                    window.alert(
                                                        "O clube manteve os valores originais."
                                                    );
                                                }

                                                if (
                                                    result.status ===
                                                    "withdrawn"
                                                ) {
                                                    window.alert(
                                                        "O clube não aceitou a negociação e retirou a proposta."
                                                    );
                                                }
                                            }

                                            renderInboxView(
                                                root
                                            );
                                        } catch (
                                            error
                                        ) {
                                            console.error(
                                                error
                                            );

                                            window.alert(
                                                error
                                                    ?.message ??
                                                "Não foi possível realizar esta ação."
                                            );
                                        }
                                    }
                                );
                        }
                    );
            }
        );

    saveGame(
        game,
        {
            reason:
                "inbox_read"
        }
    );
}