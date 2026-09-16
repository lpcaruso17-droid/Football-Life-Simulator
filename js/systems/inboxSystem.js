import {
    chance,
    randomInt
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
    addTimelineEntry
} from "./timelineSystem.js";


function roundMoney(
    value
) {
    return (
        Math.round(
            Number(value) / 50
        ) * 50
    );
}


function ensureInbox(
    gameState
) {
    if (
        !Array.isArray(
            gameState.inbox
        )
    ) {
        gameState.inbox = [];
    }

    return gameState.inbox;
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
        type,
        offerType,
        offerId,
        title,
        body
    }
) {
    ensureInbox(
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

        type,

        offerType,

        offerId,

        title,

        body,

        createdYear:
            gameState.calendar.year,

        createdAge:
            gameState.calendar.age,

        status:
            "unread",

        resolution: null
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

                            type:
                                "offer",

                            offerType:
                                "academy",

                            offerId:
                                offer.id,

                            title:
                                `${offer.clubName} quer você`,

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

                            type:
                                "representation",

                            offerType:
                                "representation",

                            offerId:
                                offer.id,

                            title:
                                `${offer.agencyName} quer representar sua carreira`,

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
                        : `O ${offer.clubName} ofereceu seu primeiro contrato profissional por ${offer.durationYears} ano(s), com salário de R$ ${Number(
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

                            type:
                                "contract",

                            offerType:
                                formation
                                    ? "formation_contract"
                                    : "professional_contract",

                            offerId:
                                offer.id,

                            title:
                                formation
                                    ? "Contrato de formação"
                                    : "Primeiro contrato profissional",

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


export function refreshInboxOpportunities(
    gameState
) {
    ensureInbox(
        gameState
    );

    const beforeCount =
        gameState.inbox.length;

    generatePossibleAcademyInterest(
        gameState
    );

    generatePossibleRepresentationInterest(
        gameState
    );

    generatePossibleContractOffer(
        gameState
    );

    syncAcademyOffers(
        gameState
    );

    syncRepresentationOffers(
        gameState
    );

    syncContractOffers(
        gameState
    );

    synchronizeResolvedMessages(
        gameState
    );

    return {
        createdMessages:
            gameState.inbox.length -
            beforeCount,

        pending:
            getPendingInboxCount(
                gameState
            )
    };
}


export function getInboxMessages(
    gameState
) {
    ensureInbox(
        gameState
    );

    synchronizeResolvedMessages(
        gameState
    );

    return [
        ...gameState.inbox
    ].sort(
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


export function getPendingInboxCount(
    gameState
) {
    ensureInbox(
        gameState
    );

    synchronizeResolvedMessages(
        gameState
    );

    return gameState.inbox
        .filter(
            message =>
                message.status !==
                "resolved"
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
            "read";
    }

    return message;
}


function requireFamilyDiscussion(
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
        offer.familyDiscussed
    ) {
        return;
    }

    throw new Error(
        "Como você ainda é menor de idade, converse com a família antes de aceitar esta proposta."
    );
}


function discussOfferWithFamily(
    gameState,
    message,
    offer
) {
    offer.familyDiscussed =
        true;

    markInboxMessageRead(
        gameState,
        message.id
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "family_offer_discussion",

            title:
                "Conversa importante em família",

            description:
                "Você conversou com sua família sobre uma decisão importante para sua carreira.",

            importance: 4,

            metadata: {
                offerType:
                    message.offerType,

                offerId:
                    offer.id
            }
        }
    );

    return {
        status:
            "family_discussed",

        offer
    };
}


function negotiateContractOffer(
    gameState,
    offer
) {
    if (
        offer.status !==
        "pending"
    ) {
        throw new Error(
            "Esta proposta não pode mais ser negociada."
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
        throw new Error(
            "Esta proposta já passou por uma rodada de negociação."
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
        throw new Error(
            "Mensagem não encontrada."
        );
    }

    const offer =
        getOfferByMessage(
            gameState,
            message
        );

    if (!offer) {
        throw new Error(
            "A proposta relacionada não foi encontrada."
        );
    }

    if (
        action ===
        "family"
    ) {
        return discussOfferWithFamily(
            gameState,
            message,
            offer
        );
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
            throw new Error(
                "Esta proposta não possui negociação financeira."
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
        requireFamilyDiscussion(
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

    throw new Error(
        `Ação inválida: ${action}`
    );
}