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
    showFeedback
} from "./feedback.js";

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


async function showActionResult(
    action,
    result
) {
    if (
        action ===
        "family"
    ) {
        await showFeedback({
            type:
                "info",

            eyebrow:
                "FAMÍLIA",

            title:
                "Vocês conversaram sobre a proposta",

            message:
                "Sua família ouviu os detalhes da oportunidade. Por enquanto, a conversa foi registrada e você já pode decidir como deseja seguir.",

            primaryLabel:
                "VOLTAR À PROPOSTA"
        });

        return;
    }


    if (
        action ===
        "negotiate"
    ) {
        if (
            result.status ===
            "improved"
        ) {
            await showFeedback({
                type:
                    "success",

                eyebrow:
                    "NEGOCIAÇÃO",

                title:
                    "O clube melhorou a proposta",

                message:
                    "Sua tentativa de negociação funcionou. As condições financeiras da oferta foram aumentadas.",

                primaryLabel:
                    "VER NOVA PROPOSTA"
            });

            return;
        }


        if (
            result.status ===
            "unchanged"
        ) {
            await showFeedback({
                type:
                    "warning",

                eyebrow:
                    "NEGOCIAÇÃO",

                title:
                    "O clube manteve os valores",

                message:
                    "A diretoria ouviu sua contraproposta, mas decidiu manter as condições originais. A oferta continua disponível.",

                primaryLabel:
                    "ENTENDI"
            });

            return;
        }


        if (
            result.status ===
            "withdrawn"
        ) {
            await showFeedback({
                type:
                    "error",

                eyebrow:
                    "NEGOCIAÇÃO",

                title:
                    "A proposta foi retirada",

                message:
                    "O clube não aceitou avançar nos novos termos e decidiu encerrar a negociação.",

                primaryLabel:
                    "CONTINUAR"
            });

            return;
        }
    }


    if (
        action ===
        "accept"
    ) {
        await showFeedback({
            type:
                "success",

            eyebrow:
                "DECISÃO",

            title:
                "Proposta aceita",

            message:
                "A decisão foi registrada e agora passa a fazer parte da sua trajetória.",

            primaryLabel:
                "CONTINUAR"
        });

        return;
    }


    if (
        action ===
        "decline"
    ) {
        await showFeedback({
            type:
                "important",

            eyebrow:
                "DECISÃO",

            title:
                "Proposta recusada",

            message:
                "Você decidiu não seguir com essa oportunidade. A decisão foi registrada na sua carreira.",

            primaryLabel:
                "CONTINUAR"
        });
    }
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
                                    async () => {
                                        const action =
                                            button
                                                .dataset
                                                .action;


                                        try {
                                            button.disabled =
                                                true;


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


                                            await showActionResult(
                                                action,
                                                result
                                            );


                                            renderInboxView(
                                                root
                                            );
                                        } catch (
                                            error
                                        ) {
                                            console.error(
                                                error
                                            );


                                            await showFeedback({
                                                type:
                                                    "error",

                                                eyebrow:
                                                    "AÇÃO BLOQUEADA",

                                                title:
                                                    "Ainda não é possível fazer isso",

                                                message:
                                                    error
                                                        ?.message ??
                                                    "Não foi possível realizar esta ação.",

                                                primaryLabel:
                                                    "VOLTAR"
                                            });


                                            button.disabled =
                                                false;
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