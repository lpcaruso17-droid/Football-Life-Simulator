import {
    loadActiveGame,
    saveGame
} from "../core/saveManager.js";

import {
    refreshInboxOpportunities,
    getInboxMessages,
    getInboxChannelCounts,
    markInboxMessageRead,
    resolveInboxAction
} from "../systems/inboxSystem.js";

import {
    getPerson
} from "../systems/personSystem.js";

import {
    getAgencyById
} from "../data/agencies.js";

import {
    isConversationMessage,
    prepareConversationMessage,
    getConversationReplyOptions,
    getConversationThreadEntries,
    resolveConversationReply
} from "../systems/conversationSystem.js";

import {
    showFeedback
} from "./feedback.js";

import {
    navigateTo
} from "./router.js";


let activeInboxChannel =
    "all";


const CHANNEL_LABELS = {
    all:
        "Todas",

    family:
        "Família",

    club:
        "Clube",

    agent:
        "Empresário",

    contracts:
        "Contratos",

    social:
        "Social"
};


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


function formatMoney(
    value
) {
    return new Intl
        .NumberFormat(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL",

                maximumFractionDigits:
                    0
            }
        )
        .format(
            Number(value) ||
            0
        );
}


function getTypeLabel(
    message
) {
    const labels = {
        academy:
            "PROPOSTA DE CLUBE",

        representation:
            "EMPRESÁRIO",

        formation_contract:
            "CONTRATO DE FORMAÇÃO",

        professional_contract:
            "CONTRATO PROFISSIONAL",

        family_message:
            "CONVERSA COM A FAMÍLIA",

        family_decision:
            "RESPOSTA DA FAMÍLIA",

        social_message:
            "CONVERSA PESSOAL"
    };

    return (
        labels[
            message.offerType ??
            message.type
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
            "Retirada pelo clube",

        superseded:
            "Encerrada após outra assinatura",

        read:
            "Lida",

        conversation_replied:
            "Respondida"
    };

    return (
        labels[
            resolution
        ] ??
        resolution ??
        "Resolvida"
    );
}


function getFamilyStatusLabel(
    status
) {
    const labels = {
        approved:
            "Família: apoia a decisão",

        concerned:
            "Família: aceita, mas está preocupada",

        needs_info:
            "Família: quer entender melhor",

        opposed:
            "Família: é contra a decisão"
    };

    return (
        labels[
            status
        ] ??
        null
    );
}


function getMessageOffer(
    game,
    message
) {
    if (
        !message ||
        (
            message.offerType !==
                "formation_contract" &&
            message.offerType !==
                "professional_contract"
        )
    ) {
        return null;
    }

    return (
        game.contracts
            ?.offers
            ?.find(
                offer =>
                    offer.id ===
                    message.offerId
            ) ??
        null
    );
}


function getRepresentationContext(
    game,
    message = null
) {
    const offer =
        message
            ? getMessageOffer(
                game,
                message
            )
            : null;

    const agreement =
        game.representation
            ?.activeAgreement ??
        null;

    const messageMetadata =
        message
            ?.metadata ??
        {};

    const representative =
        offer
            ?.representative ??
        {};

    const agentPersonId =
        messageMetadata
            .agentPersonId ??
        representative
            .agentPersonId ??
        game.representation
            ?.currentAgentPersonId ??
        agreement
            ?.agentPersonId ??
        null;

    const agencyId =
        messageMetadata
            .agencyId ??
        representative
            .agencyId ??
        game.representation
            ?.currentAgencyId ??
        agreement
            ?.agencyId ??
        null;

    const agent =
        agentPersonId
            ? getPerson(
                game,
                agentPersonId
            )
            : null;

    const agency =
        agencyId
            ? getAgencyById(
                agencyId
            )
            : null;

    const agentName =
        messageMetadata
            .agentName ??
        representative
            .agentName ??
        agent
            ?.identity
            ?.fullName ??
        null;

    const agencyName =
        messageMetadata
            .agencyName ??
        representative
            .agencyName ??
        agency
            ?.name ??
        agreement
            ?.agencyName ??
        null;

    if (
        !agentName &&
        !agencyName
    ) {
        return null;
    }

    return {
        agentPersonId,

        agencyId,

        agentName:
            agentName ??
            "Seu empresário",

        agencyName
    };
}


function getRepresentationSentence(
    context
) {
    if (!context) {
        return null;
    }

    if (
        context.agentName &&
        context.agencyName
    ) {
        return `${context.agentName}, da ${context.agencyName}`;
    }

    if (
        context.agencyName
    ) {
        return `a ${context.agencyName}`;
    }

    return (
        context.agentName ??
        "seu empresário"
    );
}


function captureOfferTerms(
    offer
) {
    if (!offer) {
        return null;
    }

    return {
        salary:
            Number(
                offer.salary
            ) || 0,

        signingBonus:
            Number(
                offer.signingBonus
            ) || 0,

        monthlyStipend:
            Number(
                offer.monthlyStipend
            ) || 0
    };
}


function buildNegotiationDetails(
    beforeTerms,
    offer
) {
    if (
        !offer ||
        !beforeTerms
    ) {
        return null;
    }

    if (
        offer.type ===
        "formation"
    ) {
        return `Bolsa mensal: ${formatMoney(
            beforeTerms
                .monthlyStipend
        )} → ${formatMoney(
            offer.monthlyStipend
        )}`;
    }

    return `Salário: ${formatMoney(
        beforeTerms.salary
    )} → ${formatMoney(
        offer.salary
    )} · Luvas: ${formatMoney(
        beforeTerms.signingBonus
    )} → ${formatMoney(
        offer.signingBonus
    )}`;
}


function renderRepresentationNote(
    game,
    message
) {
    const isContract =
        message.offerType ===
            "formation_contract" ||
        message.offerType ===
            "professional_contract";

    if (!isContract) {
        return "";
    }

    const context =
        getRepresentationContext(
            game,
            message
        );

    if (!context) {
        return "";
    }

    const sentence =
        getRepresentationSentence(
            context
        );

    return `
        <div
            style="
                margin-top: 14px;
                padding: 12px 14px;
                border: 1px solid rgba(255,255,255,0.10);
                border-radius: 12px;
                background: rgba(255,255,255,0.035);
                font-size: 0.92rem;
                line-height: 1.5;
            "
        >
            <strong>
                Representação:
            </strong>

            ${escapeHtml(
                sentence
            )}
            acompanha esta negociação em seu nome.
        </div>
    `;
}


function renderConversationThread(
    game,
    message
) {
    const entries =
        getConversationThreadEntries(
            game,
            message
        );

    if (!entries.length) {
        return `
            <p class="inbox-body">
                ${escapeHtml(
                    message.body
                )}
            </p>
        `;
    }

    return `
        <div
            style="
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 16px;
            "
        >
            ${entries
                .map(
                    entry => {
                        const player =
                            entry.speaker ===
                            "player";

                        return `
                            <div
                                style="
                                    align-self: ${player ? "flex-end" : "flex-start"};
                                    width: min(88%, 620px);
                                    padding: 12px 14px;
                                    border-radius: 14px;
                                    border: 1px solid rgba(255,255,255,0.09);
                                    background: ${player ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.035)"};
                                "
                            >
                                <div
                                    style="
                                        font-size: 0.76rem;
                                        text-transform: uppercase;
                                        letter-spacing: 0.08em;
                                        opacity: 0.65;
                                        margin-bottom: 6px;
                                    "
                                >
                                    ${escapeHtml(
                                        player
                                            ? "Você"
                                            : entry.speakerName
                                    )}
                                </div>

                                <div
                                    style="
                                        line-height: 1.55;
                                    "
                                >
                                    ${escapeHtml(
                                        entry.text
                                    )}
                                </div>
                            </div>
                        `;
                    }
                )
                .join("")}
        </div>
    `;
}


function renderConversationReplies(
    game,
    message
) {
    const options =
        getConversationReplyOptions(
            game,
            message
        );

    if (!options.length) {
        return "";
    }

    return `
        <div
            style="
                margin-top: 18px;
                padding-top: 16px;
                border-top: 1px solid rgba(255,255,255,0.08);
            "
        >
            <div
                style="
                    margin-bottom: 10px;
                    font-size: 0.8rem;
                    opacity: 0.65;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                "
            >
                Como você quer responder?
            </div>

            <div
                style="
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                "
            >
                ${options
                    .map(
                        option => `
                            <button
                                type="button"
                                class="btn"
                                data-conversation-reply="${escapeHtml(
                                    option.id
                                )}"
                            >
                                ${escapeHtml(
                                    option.label
                                )}
                            </button>
                        `
                    )
                    .join("")}
            </div>
        </div>
    `;
}


function renderMessage(
    game,
    message
) {
    const conversation =
        isConversationMessage(
            message
        );

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

    const familyStatus =
        message
            .familyDecisionStatus;

    const familyLabel =
        getFamilyStatusLabel(
            familyStatus
        );

    const familyCanTalkAgain =
        minor &&
        message.actionable &&
        (
            !familyStatus ||
            (
                [
                    "needs_info",
                    "opposed"
                ].includes(
                    familyStatus
                ) &&
                (
                    message
                        .familyConversationCount ??
                    0
                ) <
                2
            )
        );

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

                    <div class="inbox-type-row">

                        <div class="inbox-type">
                            ${escapeHtml(
                                getTypeLabel(
                                    message
                                )
                            )}
                        </div>

                        <div class="inbox-channel">
                            ${escapeHtml(
                                CHANNEL_LABELS[
                                    message.channel
                                ] ??
                                "Mensagem"
                            )}
                        </div>

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


            ${
                conversation
                    ? renderConversationThread(
                        game,
                        message
                    )
                    : `
                        <p class="inbox-body">
                            ${escapeHtml(
                                message.body
                            )}
                        </p>
                    `
            }


            ${
                conversation
                    ? ""
                    : renderRepresentationNote(
                        game,
                        message
                    )
            }


            ${
                familyLabel
                    ? `
                        <div
                            class="
                                inbox-family-status
                                ${escapeHtml(
                                    familyStatus
                                )}
                            "
                        >
                            ${escapeHtml(
                                familyLabel
                            )}
                        </div>
                    `
                    : ""
            }


            ${
                conversation
                    ? (
                        message.resolution ===
                        "conversation_replied"
                            ? `
                                <div class="inbox-resolution">
                                    Respondida
                                </div>
                            `
                            : renderConversationReplies(
                                game,
                                message
                            )
                    )
                    : (
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
                            : (
                                message.actionable
                                    ? `
                                        <div class="inbox-actions">

                                            ${
                                                familyCanTalkAgain
                                                    ? `
                                                        <button
                                                            type="button"
                                                            class="btn"
                                                            data-action="family"
                                                        >
                                                            ${
                                                                familyStatus
                                                                    ? "Conversar novamente"
                                                                    : "Conversar com a família"
                                                            }
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
                                    : `
                                        <div class="inbox-message-read">
                                            Mensagem pessoal
                                        </div>
                                    `
                            )
                    )
            }

        </article>
    `;
}


async function showFamilyDecision(
    decision
) {
    if (
        decision.status ===
        "approved"
    ) {
        await showFeedback({
            type:
                "success",

            eyebrow:
                "FAMÍLIA",

            title:
                `${decision.guardianName} apoia você`,

            message:
                decision.message,

            primaryLabel:
                "VOLTAR À PROPOSTA"
        });

        return;
    }

    if (
        decision.status ===
        "concerned"
    ) {
        await showFeedback({
            type:
                "warning",

            eyebrow:
                "FAMÍLIA",

            title:
                "Sua família aceita, mas está preocupada",

            message:
                decision.message,

            primaryLabel:
                "VOLTAR À PROPOSTA"
        });

        return;
    }

    if (
        decision.status ===
        "needs_info"
    ) {
        await showFeedback({
            type:
                "info",

            eyebrow:
                "FAMÍLIA",

            title:
                "Ainda existem dúvidas",

            message:
                decision.message,

            details:
                "Você poderá conversar novamente antes de tomar a decisão.",

            primaryLabel:
                "ENTENDI"
        });

        return;
    }

    await showFeedback({
        type:
            "error",

        eyebrow:
            "FAMÍLIA",

        title:
            "Sua família é contra essa decisão",

        message:
            decision.message,

        details:
            decision
                .conversationCount <
            2
                ? "Ainda será possível conversar novamente."
                : "Por enquanto, sua família não autorizou essa decisão.",

        primaryLabel:
            "VOLTAR"
    });
}


async function showActionResult(
    action,
    result,
    {
        representationContext =
            null,
        beforeTerms =
            null
    } = {}
) {
    if (
        action ===
        "family"
    ) {
        await showFamilyDecision(
            result.decision
        );

        return;
    }


    if (
        action ===
        "negotiate"
    ) {
        const representative =
            getRepresentationSentence(
                representationContext
            );

        const negotiationLead =
            representative
                ? `${representative} conduziu a contraproposta em seu nome.`
                : "Você apresentou uma contraproposta ao clube.";

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
                    `${negotiationLead} O clube aceitou melhorar as condições financeiras.`,

                details:
                    buildNegotiationDetails(
                        beforeTerms,
                        result.offer
                    ),

                primaryLabel:
                    "VER PROPOSTA"
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
                    `${negotiationLead} A diretoria ouviu o pedido, mas decidiu manter as condições originais.`,

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
                    `${negotiationLead} O clube não aceitou avançar nos novos termos e encerrou a negociação.`,

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
        const representative =
            getRepresentationSentence(
                representationContext
            );

        const message =
            representative
                ? `${representative} acompanhou a conclusão do acordo. A decisão agora faz parte da sua trajetória.`
                : "A decisão agora faz parte da sua trajetória.";

        await showFeedback({
            type:
                "success",

            eyebrow:
                "DECISÃO",

            title:
                "Proposta aceita",

            message,

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
                "Você decidiu seguir outro caminho.",

            primaryLabel:
                "CONTINUAR"
        });
    }
}


async function showConversationResult(
    result
) {
    await showFeedback({
        type:
            "success",

        eyebrow:
            "CONVERSA",

        title:
            "Resposta enviada",

        message:
            result.senderReply,

        details:
            result.effectsSummary ||
            "A conversa foi registrada na relação entre vocês.",

        primaryLabel:
            "CONTINUAR"
    });
}


async function showActionError(
    error
) {
    if (
        error.code ===
        "FAMILY_OPPOSED"
    ) {
        await showFeedback({
            type:
                "error",

            eyebrow:
                "FAMÍLIA",

            title:
                "Sua família não autorizou",

            message:
                error.message,

            primaryLabel:
                "VOLTAR"
        });

        return;
    }


    if (
        error.code ===
        "FAMILY_NEEDS_INFO"
    ) {
        await showFeedback({
            type:
                "warning",

            eyebrow:
                "FAMÍLIA",

            title:
                "A decisão ainda não está liberada",

            message:
                error.message,

            primaryLabel:
                "VOLTAR"
        });

        return;
    }


    if (
        error.code ===
        "FAMILY_NOT_DISCUSSSED"
    ) {
        await showFeedback({
            type:
                "info",

            eyebrow:
                "FAMÍLIA",

            title:
                "Converse com sua família primeiro",

            message:
                error.message,

            primaryLabel:
                "VOLTAR"
        });

        return;
    }


    await showFeedback({
        type:
            "error",

        eyebrow:
            "AÇÃO BLOQUEADA",

        title:
            "Não foi possível realizar a ação",

        message:
            error
                ?.message ??
            "O jogo não conseguiu concluir esta ação.",

        primaryLabel:
            "VOLTAR"
    });
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
            game,
            activeInboxChannel
        );


    messages.forEach(
        message => {
            if (
                isConversationMessage(
                    message
                )
            ) {
                prepareConversationMessage(
                    game,
                    message
                );

                markInboxMessageRead(
                    game,
                    message.id
                );
            }
        }
    );


    const counts =
        getInboxChannelCounts(
            game
        );


    root.innerHTML = `
        <main class="app-shell page">

            <div class="inbox-header">

                <div>

                    <div class="eyebrow">
                        CENTRAL DE MENSAGENS
                    </div>

                    <h1 class="page-title">
                        Sua vida também acontece aqui.
                    </h1>

                    <p class="page-subtitle">
                        Família, amigos, clubes, empresários
                        e contratos podem procurar você
                        durante a carreira.
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


            <nav class="inbox-tabs">

                ${Object
                    .keys(
                        CHANNEL_LABELS
                    )
                    .map(
                        channel => `
                            <button
                                type="button"
                                class="
                                    inbox-tab
                                    ${
                                        activeInboxChannel ===
                                        channel
                                            ? "active"
                                            : ""
                                    }
                                "
                                data-inbox-channel="${channel}"
                            >

                                ${CHANNEL_LABELS[channel]}

                                ${
                                    counts[
                                        channel
                                    ]?.unread
                                        ? `
                                            <span class="inbox-tab-count">
                                                ${counts[channel].unread}
                                            </span>
                                        `
                                        : ""
                                }

                            </button>
                        `
                    )
                    .join("")}

            </nav>


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
                                Nenhuma mensagem nesta categoria.
                            </div>
                        `
                }

            </section>

        </main>
    `;


    root
        .querySelectorAll(
            "[data-inbox-channel]"
        )
        .forEach(
            button => {
                button
                    .addEventListener(
                        "click",
                        () => {
                            activeInboxChannel =
                                button
                                    .dataset
                                    .inboxChannel;

                            renderInboxView(
                                root
                            );
                        }
                    );
            }
        );


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

                const message =
                    game.inbox
                        ?.find(
                            item =>
                                item.id ===
                                messageId
                        ) ??
                    null;


                if (
                    !isConversationMessage(
                        message
                    )
                ) {
                    markInboxMessageRead(
                        game,
                        messageId
                    );
                }


                card
                    .querySelectorAll(
                        "[data-conversation-reply]"
                    )
                    .forEach(
                        button => {
                            button
                                .addEventListener(
                                    "click",
                                    async () => {
                                        try {
                                            button.disabled =
                                                true;

                                            const result =
                                                resolveConversationReply(
                                                    game,
                                                    messageId,
                                                    button.dataset
                                                        .conversationReply
                                                );

                                            saveGame(
                                                game,
                                                {
                                                    reason:
                                                        "conversation_reply"
                                                }
                                            );

                                            await showConversationResult(
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

                                            await showActionError(
                                                error
                                            );

                                            button.disabled =
                                                false;
                                        }
                                    }
                                );
                        }
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

                                            const offerBefore =
                                                getMessageOffer(
                                                    game,
                                                    message
                                                );

                                            const beforeTerms =
                                                captureOfferTerms(
                                                    offerBefore
                                                );

                                            const representationContext =
                                                getRepresentationContext(
                                                    game,
                                                    message
                                                );

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
                                                result,
                                                {
                                                    representationContext,
                                                    beforeTerms
                                                }
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

                                            await showActionError(
                                                error
                                            );

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