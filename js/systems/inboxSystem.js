import {
    chance,
    randomInt,
    pick
} from "../core/rng.js";

import {
    generateAcademyOffers,
    acceptAcademyOffer,
    declineAcademyOffer
} from "./academyCareerSystem.js";

import {
    generateRepresentationOffers,
    acceptRepresentationOffer,
    getAgentNegotiationModifier
} from "./agentSystem.js";

import {
    canSignFormationContract,
    canSignFirstProfessionalContract,
    createFormationContractOffer,
    createFirstProfessionalContractOffer,
    acceptFormationContractOffer,
    acceptFirstProfessionalContractOffer,
    declineFormationContractOffer,
    declineProfessionalContractOffer,
    getActiveContract
} from "./contractSystem.js";

import {
    calculateProfessionalReadiness
} from "./professionalPathSystem.js";

import {
    getPerson
} from "./personSystem.js";

import {
    getCloseFriends
} from "./socialSystem.js";

import {
    discussOfferWithFamily,
    canFamilyApproveOffer
} from "./familyDecisionSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


const CHANNELS = [
    "family",
    "club",
    "agent",
    "contracts",
    "social"
];


function roundMoney(
    value
) {
    return (
        Math.round(
            Number(value) / 50
        ) * 50
    );
}


function ensureInboxState(
    gameState
) {
    if (
        !Array.isArray(
            gameState.inbox
        )
    ) {
        gameState.inbox = [];
    }

    if (
        !gameState.inboxState ||
        typeof gameState.inboxState !==
            "object"
    ) {
        gameState.inboxState = {
            lastFamilyMessageYear:
                null,

            lastSocialMessageYear:
                null,

            lastSocialPersonId:
                null
        };
    }
}


function messageExists(
    gameState,
    messageId
) {
    return gameState.inbox
        .some(
            message =>
                message.id ===
                messageId
        );
}


function createInboxMessage(
    gameState,
    {
        id,
        channel,
        type,
        offerType = null,
        offerId = null,
        senderPersonId = null,
        title,
        body,
        actionable = false,
        metadata = {}
    }
) {
    ensureInboxState(
        gameState
    );

    if (
        messageExists(
            gameState,
            id
        )
    ) {
        return null;
    }

    const message = {
        id,

        channel:
            CHANNELS.includes(
                channel
            )
                ? channel
                : "club",

        type,

        offerType,

        offerId,

        senderPersonId,

        title,

        body,

        actionable,

        metadata,

        createdYear:
            gameState.calendar.year,

        createdAge:
            gameState.calendar.age,

        status:
            "unread",

        resolution:
            null,

        familyDecisionStatus:
            null,

        familyConversationCount:
            0
    };

    gameState.inbox.push(
        message
    );

    return message;
}


function syncAcademyOffers(
    gameState
) {
    const created = [];

    (
        gameState.academy
            ?.offers ??
        []
    )
        .filter(
            offer =>
                offer.status ===
                "pending"
        )
        .forEach(
            offer => {
                const message =
                    createInboxMessage(
                        gameState,
                        {
                            id:
                                `inbox_academy_${offer.id}`,

                            channel:
                                "club",

                            type:
                                "offer",

                            offerType:
                                "academy",

                            offerId:
                                offer.id,

                            actionable:
                                true,

                            title:
                                `${offer.clubName} quer conversar com você`,

                            body:
                                `O ${offer.clubName} demonstrou interesse em contar com você na categoria ${String(
                                    offer.categoryId
                                ).toUpperCase()}.`
                        }
                    );

                if (message) {
                    created.push(
                        message
                    );
                }
            }
        );

    return created;
}


function syncRepresentationOffers(
    gameState
) {
    const created = [];

    (
        gameState.representation
            ?.offers ??
        []
    )
        .filter(
            offer =>
                offer.status ===
                "pending"
        )
        .forEach(
            offer => {
                const message =
                    createInboxMessage(
                        gameState,
                        {
                            id:
                                `inbox_representation_${offer.id}`,

                            channel:
                                "agent",

                            type:
                                "representation",

                            offerType:
                                "representation",

                            offerId:
                                offer.id,

                            actionable:
                                true,

                            title:
                                `${offer.agencyName} quer representar você`,

                            body:
                                `A agência ${offer.agencyName} apresentou uma proposta de representação por ${offer.durationYears} ano(s).`
                        }
                    );

                if (message) {
                    created.push(
                        message
                    );
                }
            }
        );

    return created;
}


function syncContractOffers(
    gameState
) {
    const created = [];

    (
        gameState.contracts
            ?.offers ??
        []
    )
        .filter(
            offer =>
                offer.status ===
                "pending"
        )
        .forEach(
            offer => {
                const formation =
                    offer.type ===
                    "formation";

                const body =
                    formation
                        ? `O ${offer.clubName} ofereceu contrato de formação por ${offer.durationYears} ano(s), com bolsa mensal de R$ ${Number(
                            offer.monthlyStipend
                        ).toLocaleString(
                            "pt-BR"
                        )}.`
                        : `O ${offer.clubName} ofereceu seu primeiro contrato profissional por ${offer.durationYears} ano(s), salário de R$ ${Number(
                            offer.salary
                        ).toLocaleString(
                            "pt-BR"
                        )} por mês e R$ ${Number(
                            offer.signingBonus
                        ).toLocaleString(
                            "pt-BR"
                        )} em luvas.`;

                const message =
                    createInboxMessage(
                        gameState,
                        {
                            id:
                                `inbox_contract_${offer.id}`,

                            channel:
                                "contracts",

                            type:
                                "contract",

                            offerType:
                                formation
                                    ? "formation_contract"
                                    : "professional_contract",

                            offerId:
                                offer.id,

                            actionable:
                                true,

                            title:
                                formation
                                    ? "O clube apresentou um contrato de formação"
                                    : "Seu primeiro contrato profissional chegou",

                            body
                        }
                    );

                if (message) {
                    created.push(
                        message
                    );
                }
            }
        );

    return created;
}


function getCurrentYearOffers(
    offers,
    year
) {
    return (
        offers ??
        []
    ).filter(
        offer =>
            offer.createdYear ===
            year
    );
}


function generatePossibleAcademyInterest(
    gameState
) {
    if (
        !gameState.academy
            ?.currentClubId
    ) {
        return [];
    }

    if (
        gameState.player
            .football
            .isProfessional
    ) {
        return [];
    }

    if (
        gameState.academy
            .recognition < 55
    ) {
        return [];
    }

    const currentYearOffers =
        getCurrentYearOffers(
            gameState.academy
                .offers,
            gameState.calendar.year
        );

    if (
        currentYearOffers.length
    ) {
        return [];
    }

    return generateAcademyOffers(
        gameState,
        {
            maximumOffers: 2,

            excludeCurrentClub:
                true,

            reason:
                "market_interest"
        }
    );
}


function generatePossibleRepresentationInterest(
    gameState
) {
    if (
        gameState.representation
            ?.activeAgreement
    ) {
        return [];
    }

    const currentYearOffers =
        getCurrentYearOffers(
            gameState.representation
                ?.offers,
            gameState.calendar.year
        );

    if (
        currentYearOffers.length
    ) {
        return [];
    }

    return generateRepresentationOffers(
        gameState,
        {
            maximumOffers: 3
        }
    );
}


function generatePossibleContractOffer(
    gameState
) {
    if (
        !gameState.player
            .football
            .currentClubId
    ) {
        return null;
    }

    const currentYearOffers =
        getCurrentYearOffers(
            gameState.contracts
                ?.offers,
            gameState.calendar.year
        );

    if (
        currentYearOffers
            .some(
                offer =>
                    offer.status ===
                        "pending" ||
                    offer.status ===
                        "accepted"
            )
    ) {
        return null;
    }

    const readiness =
        calculateProfessionalReadiness(
            gameState
        );

    if (
        canSignFirstProfessionalContract(
            gameState
        ) &&
        !gameState.player
            .football
            .isProfessional &&
        (
            readiness >= 58 ||
            gameState.academy
                .recognition >= 65
        )
    ) {
        return createFirstProfessionalContractOffer(
            gameState
        );
    }

    const activeContract =
        getActiveContract(
            gameState
        );

    if (
        !activeContract &&
        canSignFormationContract(
            gameState
        ) &&
        (
            gameState.academy
                .developmentScore ??
            0
        ) >= 42
    ) {
        return createFormationContractOffer(
            gameState
        );
    }

    return null;
}


function getParentCandidates(
    gameState
) {
    return [
        gameState.family
            ?.fatherId,

        gameState.family
            ?.motherId
    ]
        .filter(Boolean)
        .map(
            id =>
                getPerson(
                    gameState,
                    id
                )
        )
        .filter(Boolean);
}


function generateAmbientFamilyMessage(
    gameState
) {
    ensureInboxState(
        gameState
    );

    if (
        gameState.inboxState
            .lastFamilyMessageYear ===
        gameState.calendar.year
    ) {
        return null;
    }

    if (
        !chance(
            gameState.rng,
            0.68
        )
    ) {
        gameState.inboxState
            .lastFamilyMessageYear =
            gameState.calendar.year;

        return null;
    }

    const parents =
        getParentCandidates(
            gameState
        );

    const parent =
        pick(
            gameState.rng,
            parents
        );

    if (!parent) {
        return null;
    }

    const hasClub =
        Boolean(
            gameState.player
                .football
                .currentClubId
        );

    const templates =
        hasClub
            ? [
                {
                    title:
                        `${parent.identity.fullName} quer saber como você está`,

                    body:
                        "A rotina no clube tem sido puxada e sua família percebeu que vocês quase não conversaram nos últimos dias."
                },

                {
                    title:
                        "Uma mensagem de casa",

                    body:
                        `${parent.identity.fullName} mandou uma mensagem lembrando que, independentemente do futebol, você pode contar com a família.`
                },

                {
                    title:
                        `${parent.identity.fullName} acompanhou sua fase no clube`,

                    body:
                        "Sua família percebeu que sua rotina mudou e quer entender melhor como você está lidando com pressão, escola e futebol."
                }
            ]
            : [
                {
                    title:
                        `${parent.identity.fullName} está preocupado com você`,

                    body:
                        "O período sem clube começou a preocupar sua família. A mensagem não cobra uma decisão, mas deixa claro que você não precisa enfrentar essa fase sozinho."
                },

                {
                    title:
                        "Conversa em casa sobre o futebol",

                    body:
                        `${parent.identity.fullName} quer saber como você está lidando com a busca por uma nova oportunidade.`
                }
            ];

    const template =
        pick(
            gameState.rng,
            templates
        );

    gameState.inboxState
        .lastFamilyMessageYear =
        gameState.calendar.year;

    return createInboxMessage(
        gameState,
        {
            id:
                `family_ambient_${gameState.calendar.year}`,

            channel:
                "family",

            type:
                "family_message",

            senderPersonId:
                parent.id,

            title:
                template.title,

            body:
                template.body,

            actionable:
                false
        }
    );
}


function chooseSocialFriend(
    gameState
) {
    const friends =
        getCloseFriends(
            gameState
        ) ?? [];

    if (!friends.length) {
        return null;
    }

    const alternatives =
        friends.filter(
            friend =>
                friend.id !==
                gameState.inboxState
                    .lastSocialPersonId
        );

    return pick(
        gameState.rng,
        alternatives.length
            ? alternatives
            : friends
    );
}


function generateAmbientSocialMessage(
    gameState
) {
    ensureInboxState(
        gameState
    );

    if (
        gameState.calendar.age <
        11
    ) {
        return null;
    }

    if (
        gameState.inboxState
            .lastSocialMessageYear ===
        gameState.calendar.year
    ) {
        return null;
    }

    if (
        !chance(
            gameState.rng,
            0.62
        )
    ) {
        gameState.inboxState
            .lastSocialMessageYear =
            gameState.calendar.year;

        return null;
    }

    const friend =
        chooseSocialFriend(
            gameState
        );

    if (!friend) {
        return null;
    }

    const templates = [
        {
            title:
                `${friend.identity.fullName} mandou mensagem`,

            body:
                "Seu amigo quer saber quando vocês vão conseguir se encontrar novamente fora da rotina do futebol."
        },

        {
            title:
                `Mensagem de ${friend.identity.fullName}`,

            body:
                "Seu amigo comentou que vocês têm se falado menos ultimamente e perguntou se está tudo bem."
        },

        {
            title:
                `${friend.identity.fullName} lembrou de você`,

            body:
                "Uma mensagem simples chegou para saber como estão as coisas e como anda sua rotina."
        }
    ];

    const template =
        pick(
            gameState.rng,
            templates
        );

    gameState.inboxState
        .lastSocialMessageYear =
        gameState.calendar.year;

    gameState.inboxState
        .lastSocialPersonId =
        friend.id;

    return createInboxMessage(
        gameState,
        {
            id:
                `social_ambient_${gameState.calendar.year}`,

            channel:
                "social",

            type:
                "social_message",

            senderPersonId:
                friend.id,

            title:
                template.title,

            body:
                template.body,

            actionable:
                false
        }
    );
}


function getOfferByMessage(
    gameState,
    message
) {
    if (
        message.offerType ===
        "academy"
    ) {
        return gameState.academy
            .offers
            .find(
                offer =>
                    offer.id ===
                    message.offerId
            );
    }

    if (
        message.offerType ===
        "representation"
    ) {
        return gameState.representation
            .offers
            .find(
                offer =>
                    offer.id ===
                    message.offerId
            );
    }

    if (
        message.offerType ===
            "formation_contract" ||
        message.offerType ===
            "professional_contract"
    ) {
        return gameState.contracts
            .offers
            .find(
                offer =>
                    offer.id ===
                    message.offerId
            );
    }

    return null;
}


function synchronizeResolvedMessages(
    gameState
) {
    gameState.inbox
        .forEach(
            message => {
                if (
                    !message.actionable ||
                    message.status ===
                        "resolved"
                ) {
                    return;
                }

                const offer =
                    getOfferByMessage(
                        gameState,
                        message
                    );

                if (!offer) {
                    return;
                }

                if (
                    offer.status !==
                    "pending"
                ) {
                    message.status =
                        "resolved";

                    message.resolution =
                        offer.status;
                }
            }
        );
}


function emitNewMessageEvent(
    messages
) {
    if (
        !messages.length ||
        typeof window ===
            "undefined"
    ) {
        return;
    }

    const newest =
        messages[
            messages.length -
            1
        ];

    window.dispatchEvent(
        new CustomEvent(
            "fls:new-messages",
            {
                detail: {
                    count:
                        messages.length,

                    channel:
                        newest.channel,

                    title:
                        newest.title,

                    body:
                        newest.body
                }
            }
        )
    );
}


export function refreshInboxOpportunities(
    gameState
) {
    ensureInboxState(
        gameState
    );

    const created = [];

    generatePossibleAcademyInterest(
        gameState
    );

    generatePossibleRepresentationInterest(
        gameState
    );

    generatePossibleContractOffer(
        gameState
    );

    created.push(
        ...syncAcademyOffers(
            gameState
        )
    );

    created.push(
        ...syncRepresentationOffers(
            gameState
        )
    );

    created.push(
        ...syncContractOffers(
            gameState
        )
    );

    const familyMessage =
        generateAmbientFamilyMessage(
            gameState
        );

    if (familyMessage) {
        created.push(
            familyMessage
        );
    }

    const socialMessage =
        generateAmbientSocialMessage(
            gameState
        );

    if (socialMessage) {
        created.push(
            socialMessage
        );
    }

    synchronizeResolvedMessages(
        gameState
    );

    emitNewMessageEvent(
        created
    );

    return {
        createdMessages:
            created.length,

        messages:
            created,

        pending:
            getPendingInboxCount(
                gameState
            )
    };
}


export function getInboxMessages(
    gameState,
    channel = "all"
) {
    ensureInboxState(
        gameState
    );

    synchronizeResolvedMessages(
        gameState
    );

    return [
        ...gameState.inbox
    ]
        .filter(
            message =>
                channel ===
                    "all" ||
                message.channel ===
                    channel
        )
        .sort(
            (a, b) =>
                (
                    b.createdYear -
                    a.createdYear
                ) ||
                (
                    b.createdAge -
                    a.createdAge
                )
        );
}


export function getInboxChannelCounts(
    gameState
) {
    ensureInboxState(
        gameState
    );

    const result = {
        all: {
            total: 0,
            unread: 0
        }
    };

    CHANNELS.forEach(
        channel => {
            result[channel] = {
                total: 0,
                unread: 0
            };
        }
    );

    gameState.inbox
        .forEach(
            message => {
                const channel =
                    CHANNELS.includes(
                        message.channel
                    )
                        ? message.channel
                        : "club";

                result.all.total += 1;
                result[
                    channel
                ].total += 1;

                if (
                    message.status ===
                    "unread"
                ) {
                    result.all.unread +=
                        1;

                    result[
                        channel
                    ].unread +=
                        1;
                }
            }
        );

    return result;
}


export function getPendingInboxCount(
    gameState
) {
    ensureInboxState(
        gameState
    );

    return gameState.inbox
        .filter(
            message =>
                message.status ===
                "unread"
        )
        .length;
}


export function markInboxMessageRead(
    gameState,
    messageId
) {
    const message =
        gameState.inbox.find(
            current =>
                current.id ===
                messageId
        );

    if (
        message &&
        message.status ===
            "unread"
    ) {
        message.status =
            message.actionable
                ? "read"
                : "resolved";

        if (
            !message.actionable
        ) {
            message.resolution =
                "read";
        }
    }

    return message;
}


function createActionError(
    message,
    code
) {
    const error =
        new Error(
            message
        );

    error.code =
        code;

    return error;
}


function requireFamilyApproval(
    gameState,
    offer
) {
    if (
        gameState.calendar.age >=
        18
    ) {
        return;
    }

    if (
        canFamilyApproveOffer(
            gameState,
            offer
        )
    ) {
        return;
    }

    const status =
        offer.familyDecision
            ?.status;

    if (
        status ===
        "opposed"
    ) {
        throw createActionError(
            offer.familyDecision
                ?.message ??
            "Sua família não aprovou essa decisão.",

            "FAMILY_OPPOSED"
        );
    }

    if (
        status ===
        "needs_info"
    ) {
        throw createActionError(
            "Sua família ainda quer entender melhor a proposta antes de autorizar a decisão.",

            "FAMILY_NEEDS_INFO"
        );
    }

    throw createActionError(
        "Como você ainda é menor de idade, converse com sua família antes de tomar essa decisão.",

        "FAMILY_NOT_DISCUSSSED"
    );
}


function createFamilyResponseMessage(
    gameState,
    message,
    decision
) {
    return createInboxMessage(
        gameState,
        {
            id:
                `family_response_${message.offerId}_${decision.conversationCount}`,

            channel:
                "family",

            type:
                "family_decision",

            senderPersonId:
                decision.guardianPersonId,

            title:
                `Resposta de ${decision.guardianName}`,

            body:
                decision.message,

            actionable:
                false,

            metadata: {
                relatedOfferId:
                    message.offerId,

                familyStatus:
                    decision.status
            }
        }
    );
}


function negotiateContractOffer(
    gameState,
    offer
) {
    if (
        offer.status !==
        "pending"
    ) {
        throw createActionError(
            "Esta proposta não pode mais ser negociada.",

            "OFFER_NOT_PENDING"
        );
    }

    offer.negotiationAttempts =
        Number(
            offer.negotiationAttempts
        ) || 0;

    if (
        offer.negotiationAttempts >=
        1
    ) {
        throw createActionError(
            "Esta proposta já passou por uma rodada de negociação.",

            "NEGOTIATION_ALREADY_USED"
        );
    }

    offer.negotiationAttempts +=
        1;

    const agentModifier =
        getAgentNegotiationModifier(
            gameState
        );

    const successProbability =
        Math.min(
            0.82,
            0.52 +
            (
                agentModifier -
                1
            ) *
            1.4
        );

    const success =
        chance(
            gameState.rng,
            successProbability
        );

    if (success) {
        if (
            offer.type ===
            "formation"
        ) {
            const increase =
                randomInt(
                    gameState.rng,
                    6,
                    16
                ) / 100;

            offer.monthlyStipend =
                roundMoney(
                    offer.monthlyStipend *
                    (
                        1 +
                        increase
                    )
                );
        } else {
            const salaryIncrease =
                randomInt(
                    gameState.rng,
                    5,
                    13
                ) / 100;

            const bonusIncrease =
                randomInt(
                    gameState.rng,
                    8,
                    20
                ) / 100;

            offer.salary =
                roundMoney(
                    offer.salary *
                    (
                        1 +
                        salaryIncrease
                    )
                );

            offer.signingBonus =
                roundMoney(
                    offer.signingBonus *
                    (
                        1 +
                        bonusIncrease
                    )
                );
        }

        offer.negotiationResult =
            "improved";

        addTimelineEntry(
            gameState,
            {
                type:
                    "contract_negotiation",

                title:
                    "Negociação avançou",

                description:
                    "A negociação melhorou as condições financeiras oferecidas pelo clube.",

                importance: 6,

                relatedEntities: [
                    offer.clubId
                ]
            }
        );

        return {
            status:
                "improved",

            offer
        };
    }

    const withdrawn =
        chance(
            gameState.rng,
            0.16
        );

    if (withdrawn) {
        offer.status =
            "withdrawn";

        offer.negotiationResult =
            "club_withdrew";

        addTimelineEntry(
            gameState,
            {
                type:
                    "contract_negotiation_failed",

                title:
                    "O clube retirou a proposta",

                description:
                    "A tentativa de melhorar as condições não avançou e o clube decidiu retirar a oferta.",

                importance: 8,

                relatedEntities: [
                    offer.clubId
                ]
            }
        );

        return {
            status:
                "withdrawn",

            offer
        };
    }

    offer.negotiationResult =
        "unchanged";

    return {
        status:
            "unchanged",

        offer
    };
}


function declineRepresentationOffer(
    gameState,
    offer
) {
    offer.status =
        "declined";

    gameState.representation
        .history
        .push({
            action:
                "representation_offer_declined",

            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age,

            agencyId:
                offer.agencyId,

            agentPersonId:
                offer.agentPersonId
        });

    return offer;
}


export function resolveInboxAction(
    gameState,
    messageId,
    action
) {
    const message =
        gameState.inbox.find(
            current =>
                current.id ===
                messageId
        );

    if (!message) {
        throw createActionError(
            "Mensagem não encontrada.",

            "MESSAGE_NOT_FOUND"
        );
    }

    if (
        action ===
        "read"
    ) {
        return {
            status:
                "read",

            message:
                markInboxMessageRead(
                    gameState,
                    messageId
                )
        };
    }

    const offer =
        getOfferByMessage(
            gameState,
            message
        );

    if (!offer) {
        throw createActionError(
            "A proposta relacionada não foi encontrada.",

            "OFFER_NOT_FOUND"
        );
    }


    if (
        action ===
        "family"
    ) {
        const decision =
            discussOfferWithFamily(
                gameState,
                offer,
                message.offerType
            );

        message.status =
            "read";

        message.familyDecisionStatus =
            decision.status;

        message.familyConversationCount =
            decision.conversationCount ??
            0;

        createFamilyResponseMessage(
            gameState,
            message,
            decision
        );

        return {
            status:
                "family_discussed",

            decision,

            offer
        };
    }


    if (
        action ===
        "negotiate"
    ) {
        if (
            message.offerType !==
                "formation_contract" &&
            message.offerType !==
                "professional_contract"
        ) {
            throw createActionError(
                "Esta proposta não possui negociação financeira.",

                "NEGOTIATION_NOT_AVAILABLE"
            );
        }

        const result =
            negotiateContractOffer(
                gameState,
                offer
            );

        if (
            offer.status !==
            "pending"
        ) {
            message.status =
                "resolved";

            message.resolution =
                offer.status;
        } else {
            message.status =
                "read";
        }

        return result;
    }


    if (
        action ===
        "accept"
    ) {
        requireFamilyApproval(
            gameState,
            offer
        );

        let result = null;

        if (
            message.offerType ===
            "academy"
        ) {
            result =
                acceptAcademyOffer(
                    gameState,
                    offer.id
                );

            if (
                result
                    ?.relocationRequired
            ) {
                gameState.housing
                    .pendingRelocation =
                    true;

                gameState.housing
                    .clubId =
                    result.club.id;
            }
        }

        if (
            message.offerType ===
            "representation"
        ) {
            result =
                acceptRepresentationOffer(
                    gameState,
                    offer.id,
                    {
                        guardianConsent:
                            gameState.calendar
                                .age <
                            18
                    }
                );
        }

        if (
            message.offerType ===
            "formation_contract"
        ) {
            result =
                acceptFormationContractOffer(
                    gameState,
                    offer.id,
                    {
                        guardianApproval:
                            gameState.calendar
                                .age <
                            18
                    }
                );
        }

        if (
            message.offerType ===
            "professional_contract"
        ) {
            result =
                acceptFirstProfessionalContractOffer(
                    gameState,
                    offer.id,
                    {
                        guardianApproval:
                            gameState.calendar
                                .age <
                            18
                    }
                );
        }

        message.status =
            "resolved";

        message.resolution =
            "accepted";

        synchronizeResolvedMessages(
            gameState
        );

        return {
            status:
                "accepted",

            result
        };
    }


    if (
        action ===
        "decline"
    ) {
        if (
            message.offerType ===
            "academy"
        ) {
            declineAcademyOffer(
                gameState,
                offer.id
            );
        }

        if (
            message.offerType ===
            "representation"
        ) {
            declineRepresentationOffer(
                gameState,
                offer
            );
        }

        if (
            message.offerType ===
            "formation_contract"
        ) {
            declineFormationContractOffer(
                gameState,
                offer.id
            );
        }

        if (
            message.offerType ===
            "professional_contract"
        ) {
            declineProfessionalContractOffer(
                gameState,
                offer.id
            );
        }

        message.status =
            "resolved";

        message.resolution =
            "declined";

        return {
            status:
                "declined",

            offer
        };
    }


    throw createActionError(
        `Ação inválida: ${action}`,

        "INVALID_ACTION"
    );
}