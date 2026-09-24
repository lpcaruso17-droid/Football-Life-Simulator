import {
    getPerson
} from "./personSystem.js";

import {
    getRelationship,
    modifyRelationship
} from "./relationshipSystem.js";


const CONVERSATION_TYPES = [
    "family_message",
    "social_message"
];


function clamp(
    value,
    min = 0,
    max = 100
) {
    return Math.max(
        min,
        Math.min(
            max,
            Number(value) || 0
        )
    );
}


function ensureConversationState(
    gameState
) {
    if (
        !gameState.conversations ||
        typeof gameState.conversations !==
            "object"
    ) {
        gameState.conversations = {
            byId: {}
        };
    }

    if (
        !gameState.conversations.byId ||
        typeof gameState.conversations.byId !==
            "object"
    ) {
        gameState.conversations.byId = {};
    }
}


function getConversationId(
    message
) {
    return `${message.channel}:${message.senderPersonId ?? "unknown"}`;
}


function getSender(
    gameState,
    message
) {
    if (!message.senderPersonId) {
        return null;
    }

    return getPerson(
        gameState,
        message.senderPersonId
    );
}


function getSenderName(
    gameState,
    message
) {
    return (
        getSender(
            gameState,
            message
        )?.identity?.fullName ??
        (
            message.channel ===
            "family"
                ? "Sua família"
                : "Seu amigo"
        )
    );
}


function getOpeningText(
    gameState,
    message
) {
    if (
        message.metadata
            ?.conversationOpeningText
    ) {
        return message.metadata
            .conversationOpeningText;
    }

    if (
        Number(
            message.createdYear
        ) !==
        Number(
            gameState.calendar.year
        )
    ) {
        return message.body;
    }

    const senderName =
        getSenderName(
            gameState,
            message
        );

    const clubName =
        gameState.player
            ?.football
            ?.currentClubName ??
        null;

    const hasClub =
        Boolean(
            gameState.player
                ?.football
                ?.currentClubId
        );

    if (
        message.type ===
        "family_message"
    ) {
        if (hasClub) {
            return `${senderName}: “Vi que sua rotina no ${clubName ?? "clube"} está puxada. Como você está de verdade? Não precisa falar só de futebol comigo.”`;
        }

        return `${senderName}: “Como você está lidando com essa fase sem clube? Se estiver pesado, pode falar comigo. Você não precisa guardar tudo sozinho.”`;
    }

    if (hasClub) {
        return `${senderName}: “Sumiu, hein? Como está a vida no ${clubName ?? "clube"}? Quando a gente vai conseguir se encontrar de novo?”`;
    }

    return `${senderName}: “Como você está com essa fase sem clube? Se quiser sair um pouco para espairecer, me chama. Faz tempo que a gente não se vê.”`;
}


function ensureThread(
    gameState,
    message
) {
    ensureConversationState(
        gameState
    );

    message.metadata =
        message.metadata ??
        {};

    const conversationId =
        message.metadata
            .conversationId ??
        getConversationId(
            message
        );

    message.metadata
        .conversationId =
        conversationId;

    if (
        !gameState.conversations
            .byId[
                conversationId
            ]
    ) {
        gameState.conversations
            .byId[
                conversationId
            ] = {
                id:
                    conversationId,

                channel:
                    message.channel,

                personId:
                    message.senderPersonId ??
                    null,

                entries: [],

                lastMessageYear:
                    null,

                lastReplyYear:
                    null
            };
    }

    const thread =
        gameState.conversations
            .byId[
                conversationId
            ];

    thread.entries =
        Array.isArray(
            thread.entries
        )
            ? thread.entries
            : [];

    const alreadyAdded =
        thread.entries.some(
            entry =>
                entry.messageId ===
                    message.id &&
                entry.kind ===
                    "incoming"
        );

    if (!alreadyAdded) {
        const openingText =
            getOpeningText(
                gameState,
                message
            );

        message.metadata
            .conversationOpeningText =
            openingText;

        message.body =
            openingText;

        thread.entries.push({
            id:
                `${message.id}:incoming`,

            messageId:
                message.id,

            kind:
                "incoming",

            speaker:
                "person",

            speakerName:
                getSenderName(
                    gameState,
                    message
                ),

            text:
                openingText,

            year:
                message.createdYear,

            age:
                message.createdAge
        });

        thread.lastMessageYear =
            message.createdYear;
    }

    return thread;
}


function getCurrentRelationship(
    gameState,
    message
) {
    if (
        !message.senderPersonId
    ) {
        return null;
    }

    return getRelationship(
        gameState,
        gameState.player.id,
        message.senderPersonId
    );
}


function getFamilyReplyOptions(
    gameState,
    message
) {
    const hasClub =
        Boolean(
            gameState.player
                ?.football
                ?.currentClubId
        );

    if (hasClub) {
        return [
            {
                id:
                    "open_up",

                label:
                    "Se abrir de verdade",

                text:
                    "A rotina está puxada mesmo. Tem coisa que eu não conto para ninguém, mas queria conversar com você.",

                effects: {
                    affection: 3,
                    trust: 4,
                    conflict: -2
                },

                happiness: 2
            },
            {
                id:
                    "reassure",

                label:
                    "Dizer que está tudo bem",

                text:
                    "Está tudo bem. A rotina está corrida, mas eu estou conseguindo lidar com as coisas.",

                effects: {
                    affection: 1,
                    trust: 1
                },

                happiness: 1
            },
            {
                id:
                    "close_off",

                label:
                    "Evitar o assunto",

                text:
                    "Prefiro não falar disso agora. Estou tentando focar no futebol.",

                effects: {
                    affection: -2,
                    trust: -3,
                    conflict: 4
                },

                happiness: -1
            }
        ];
    }

    return [
        {
            id:
                "open_up",

            label:
                "Falar sobre a fase difícil",

            text:
                "Está sendo mais difícil do que eu esperava. Tenho medo de ficar muito tempo sem uma oportunidade.",

            effects: {
                affection: 4,
                trust: 5,
                conflict: -2
            },

            happiness: 2
        },
        {
            id:
                "reassure",

            label:
                "Tentar tranquilizar a família",

            text:
                "Eu estou preocupado, mas ainda acredito que vai aparecer uma oportunidade. Vou continuar tentando.",

            effects: {
                affection: 2,
                trust: 2
            },

            happiness: 1
        },
        {
            id:
                "close_off",

            label:
                "Não querer conversar",

            text:
                "Eu sei que vocês estão preocupados, mas não quero falar sobre isso agora.",

            effects: {
                affection: -2,
                trust: -3,
                conflict: 4
            },

            happiness: -1
        }
    ];
}


function getSocialReplyOptions(
    gameState
) {
    const hasClub =
        Boolean(
            gameState.player
                ?.football
                ?.currentClubId
        );

    if (hasClub) {
        return [
            {
                id:
                    "make_time",

                label:
                    "Marcar de se encontrar",

                text:
                    "Também senti falta. Vamos marcar alguma coisa assim que eu tiver uma folga.",

                effects: {
                    affection: 5,
                    trust: 3,
                    conflict: -2
                },

                happiness: 2
            },
            {
                id:
                    "explain_routine",

                label:
                    "Explicar a correria",

                text:
                    "A rotina ficou muito corrida, mas não é nada com você. Estou tentando conciliar tudo.",

                effects: {
                    affection: 2,
                    trust: 2,
                    conflict: -1
                },

                happiness: 1
            },
            {
                id:
                    "distance",

                label:
                    "Priorizar a carreira",

                text:
                    "Estou muito focado na carreira agora. Talvez eu fique mais afastado por um tempo.",

                effects: {
                    affection: -4,
                    trust: -3,
                    conflict: 4
                },

                happiness: -1
            }
        ];
    }

    return [
        {
            id:
                "make_time",

            label:
                "Aceitar o convite",

            text:
                "Vamos sim. Acho que vai me fazer bem sair um pouco e pensar em outra coisa.",

            effects: {
                affection: 5,
                trust: 3,
                conflict: -2
            },

            happiness: 3
        },
        {
            id:
                "explain_routine",

            label:
                "Contar como você está",

            text:
                "Estou tentando manter a cabeça no lugar. Essa fase sem clube está ocupando muito a minha cabeça.",

            effects: {
                affection: 3,
                trust: 3
            },

            happiness: 1
        },
        {
            id:
                "distance",

            label:
                "Ficar sozinho",

            text:
                "Valeu por chamar, mas agora eu prefiro ficar mais na minha e resolver essa situação.",

            effects: {
                affection: -3,
                trust: -2,
                conflict: 2
            },

            happiness: -1
        }
    ];
}


function buildPersonReaction(
    gameState,
    message,
    replyId
) {
    const senderName =
        getSenderName(
            gameState,
            message
        );

    const relationship =
        getCurrentRelationship(
            gameState,
            message
        );

    const affection =
        Number(
            relationship?.affection
        ) || 50;

    const trust =
        Number(
            relationship?.trust
        ) || 50;

    const conflict =
        Number(
            relationship?.conflict
        ) || 0;

    if (
        message.type ===
        "family_message"
    ) {
        if (
            replyId ===
            "open_up"
        ) {
            return `${senderName}: “Pode falar comigo. Futebol nenhum é mais importante do que você estar bem. Quando precisar, eu vou estar aqui.”`;
        }

        if (
            replyId ===
            "reassure"
        ) {
            return `${senderName}: “Tá bom. Eu confio em você. Só não precisa fingir que está tudo bem se algum dia não estiver.”`;
        }

        if (
            conflict >= 45 ||
            trust < 40
        ) {
            return `${senderName}: “Tudo bem. Não vou insistir agora. Só espero que você não se afaste de todo mundo por causa disso.”`;
        }

        return `${senderName}: “Eu respeito seu espaço. Quando quiser conversar, me procura.”`;
    }

    if (
        replyId ===
        "make_time"
    ) {
        return `${senderName}: “Fechado! Quando você tiver um tempo me chama. Faz tempo que a gente não faz nada junto.”`;
    }

    if (
        replyId ===
        "explain_routine"
    ) {
        return affection >= 65
            ? `${senderName}: “Relaxa, eu entendo. Só não some de vez. Tô aqui quando precisar.”`
            : `${senderName}: “Tranquilo. Eu só queria saber se estava tudo bem com você.”`;
    }

    return conflict >= 45
        ? `${senderName}: “Beleza. Espero que essa distância toda valha a pena para você.”`
        : `${senderName}: “Entendi. Só não esquece das pessoas que estavam com você antes de tudo ficar tão corrido.”`;
}


function getEffectsSummary(
    effects
) {
    const positive = [];
    const negative = [];

    Object.entries(
        effects ??
        {}
    ).forEach(
        ([key, value]) => {
            const labels = {
                affection:
                    "proximidade",

                trust:
                    "confiança",

                respect:
                    "respeito",

                conflict:
                    "conflito",

                loyalty:
                    "lealdade"
            };

            const label =
                labels[key];

            if (!label || !value) {
                return;
            }

            if (
                key ===
                "conflict"
            ) {
                if (value < 0) {
                    positive.push(
                        `${label} diminuiu`
                    );
                } else {
                    negative.push(
                        `${label} aumentou`
                    );
                }

                return;
            }

            if (value > 0) {
                positive.push(
                    `${label} aumentou`
                );
            } else {
                negative.push(
                    `${label} diminuiu`
                );
            }
        }
    );

    return [
        ...positive,
        ...negative
    ].join(" · ");
}


export function isConversationMessage(
    message
) {
    return Boolean(
        message &&
        CONVERSATION_TYPES.includes(
            message.type
        )
    );
}


export function prepareConversationMessage(
    gameState,
    message
) {
    if (
        !isConversationMessage(
            message
        )
    ) {
        return null;
    }

    const thread =
        ensureThread(
            gameState,
            message
        );

    if (
        message.status ===
            "resolved" &&
        message.resolution ===
            "read" &&
        Number(
            message.createdYear
        ) ===
        Number(
            gameState.calendar.year
        )
    ) {
        message.status =
            "read";

        message.resolution =
            null;
    }

    if (
        message.resolution !==
        "conversation_replied"
    ) {
        message.actionable =
            true;
    }

    return thread;
}


export function getConversationReplyOptions(
    gameState,
    message
) {
    if (
        !isConversationMessage(
            message
        ) ||
        message.resolution ===
            "conversation_replied"
    ) {
        return [];
    }

    if (
        message.status ===
            "resolved" &&
        message.resolution ===
            "read" &&
        Number(
            message.createdYear
        ) !==
        Number(
            gameState.calendar.year
        )
    ) {
        return [];
    }

    prepareConversationMessage(
        gameState,
        message
    );

    return message.type ===
        "family_message"
        ? getFamilyReplyOptions(
            gameState,
            message
        )
        : getSocialReplyOptions(
            gameState
        );
}


export function getConversationThreadEntries(
    gameState,
    message
) {
    const thread =
        prepareConversationMessage(
            gameState,
            message
        );

    if (!thread) {
        return [];
    }

    const kindOrder = {
        incoming: 0,
        player_reply: 1,
        person_reply: 2
    };

    return [
        ...thread.entries
    ]
        .filter(
            entry =>
                Number(
                    entry.year
                ) <=
                Number(
                    message.createdYear
                )
        )
        .sort(
            (a, b) =>
                (
                    Number(a.year) -
                    Number(b.year)
                ) ||
                (
                    (
                        kindOrder[
                            a.kind
                        ] ??
                        9
                    ) -
                    (
                        kindOrder[
                            b.kind
                        ] ??
                        9
                    )
                )
        )
        .slice(-8);
}


export function resolveConversationReply(
    gameState,
    messageId,
    replyId
) {
    const message =
        gameState.inbox
            ?.find(
                item =>
                    item.id ===
                    messageId
            );

    if (
        !message ||
        !isConversationMessage(
            message
        )
    ) {
        throw new Error(
            "Conversa não encontrada."
        );
    }

    if (
        message.resolution ===
        "conversation_replied"
    ) {
        throw new Error(
            "Esta mensagem já foi respondida."
        );
    }

    const thread =
        prepareConversationMessage(
            gameState,
            message
        );

    const options =
        getConversationReplyOptions(
            gameState,
            message
        );

    const selected =
        options.find(
            option =>
                option.id ===
                replyId
        );

    if (!selected) {
        throw new Error(
            "Resposta inválida."
        );
    }

    if (
        message.senderPersonId
    ) {
        modifyRelationship(
            gameState,
            gameState.player.id,
            message.senderPersonId,
            selected.effects,
            `Resposta à mensagem de ${getSenderName(
                gameState,
                message
            )}.`
        );
    }

    gameState.player.life
        .happiness =
        clamp(
            gameState.player.life
                .happiness +
            Number(
                selected.happiness
            )
        );

    const senderReply =
        buildPersonReaction(
            gameState,
            message,
            replyId
        );

    thread.entries.push(
        {
            id:
                `${message.id}:player:${replyId}`,

            messageId:
                message.id,

            kind:
                "player_reply",

            speaker:
                "player",

            speakerName:
                gameState.player
                    .identity
                    .fullName,

            text:
                selected.text,

            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age
        },
        {
            id:
                `${message.id}:person:${replyId}`,

            messageId:
                message.id,

            kind:
                "person_reply",

            speaker:
                "person",

            speakerName:
                getSenderName(
                    gameState,
                    message
                ),

            text:
                senderReply,

            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age
        }
    );

    thread.lastReplyYear =
        gameState.calendar.year;

    message.status =
        "resolved";

    message.resolution =
        "conversation_replied";

    message.actionable =
        false;

    message.metadata =
        message.metadata ??
        {};

    message.metadata
        .conversationReplyId =
        replyId;

    message.metadata
        .conversationReplyYear =
        gameState.calendar.year;

    message.metadata
        .conversationEffects =
        {
            ...selected.effects
        };

    return {
        status:
            "replied",

        message,

        selectedReply:
            selected,

        senderReply,

        effectsSummary:
            getEffectsSummary(
                selected.effects
            ),

        relationship:
            getCurrentRelationship(
                gameState,
                message
            )
    };
}