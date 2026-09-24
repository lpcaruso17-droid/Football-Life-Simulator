import {
    chance,
    randomFloat,
    randomInt,
    weightedPick
} from "../core/rng.js";

import {
    getClub
} from "./academySystem.js";

import {
    getActiveContract
} from "./contractSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";

import {
    getPerson
} from "./personSystem.js";

import {
    getAgencyById
} from "../data/agencies.js";


const LEVEL_TARGETS = {
    elite: 82,
    large: 68,
    medium: 55,
    regional: 42
};


const ROLE_LABELS = {
    development_player:
        "Jogador em desenvolvimento",

    squad_player:
        "Opção para o elenco",

    rotation_candidate:
        "Candidato à rotação",

    starter_candidate:
        "Candidato a titular",

    key_player:
        "Peça importante"
};


function createId(prefix) {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID ===
            "function"
    ) {
        return `${prefix}_${crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
}


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


function roundMoney(value) {
    return (
        Math.round(
            Number(value) / 50
        ) * 50
    );
}


function ensureMarketState(
    gameState
) {
    gameState.contracts =
        gameState.contracts ??
        {};

    gameState.contracts.offers =
        Array.isArray(
            gameState.contracts.offers
        )
            ? gameState.contracts.offers
            : [];

    if (
        !gameState.contracts
            .marketState ||
        typeof gameState.contracts
            .marketState !==
            "object"
    ) {
        gameState.contracts
            .marketState = {
                lastProcessedYear:
                    null,

                consecutiveNoOfferYears:
                    0,

                lastOfferYear:
                    null,

                history: []
            };
    }

    gameState.contracts
        .marketState.history =
        Array.isArray(
            gameState.contracts
                .marketState
                .history
        )
            ? gameState.contracts
                .marketState
                .history
            : [];

    gameState.inbox =
        Array.isArray(
            gameState.inbox
        )
            ? gameState.inbox
            : [];

    gameState.career =
        gameState.career ??
        {};

    gameState.career
        .freeAgentSpells =
        Array.isArray(
            gameState.career
                .freeAgentSpells
        )
            ? gameState.career
                .freeAgentSpells
            : [];
}


function getRepresentationContext(
    gameState
) {
    const agreement =
        gameState.representation
            ?.activeAgreement ??
        null;

    const agentPersonId =
        gameState.representation
            ?.currentAgentPersonId ??
        agreement
            ?.agentPersonId ??
        null;

    const agencyId =
        gameState.representation
            ?.currentAgencyId ??
        agreement
            ?.agencyId ??
        null;

    if (
        !agentPersonId &&
        !agencyId
    ) {
        return null;
    }

    const agent =
        agentPersonId
            ? getPerson(
                gameState,
                agentPersonId
            )
            : null;

    const agency =
        agencyId
            ? getAgencyById(
                agencyId
            )
            : null;

    return {
        agentPersonId,

        agentName:
            agent
                ?.identity
                ?.fullName ??
            null,

        agencyId,

        agencyName:
            agency
                ?.name ??
            agreement
                ?.agencyName ??
            null
    };
}


function hasProfessionalHistory(
    gameState
) {
    if (
        gameState.player
            ?.football
            ?.isProfessional ||
        gameState.player
            ?.football
            ?.hasDebutedProfessionally ||
        gameState.player
            ?.football
            ?.currentCategory ===
            "professional"
    ) {
        return true;
    }

    return Object
        .values(
            gameState.contracts
                ?.byId ??
            {}
        )
        .some(
            contract =>
                contract?.type ===
                "professional"
        );
}


function getFreeAgentSinceYear(
    gameState
) {
    const direct =
        gameState.career
            ?.currentFreeAgentSinceYear ??
        gameState.academy
            ?.freeAgentSinceYear ??
        null;

    if (
        direct !== null
    ) {
        return Number(
            direct
        );
    }

    const openSpell =
        [...(
            gameState.career
                ?.freeAgentSpells ??
            []
        )]
            .reverse()
            .find(
                spell =>
                    spell
                        ?.endedYear ===
                        null ||
                    spell
                        ?.endedYear ===
                        undefined
            );

    return (
        openSpell
            ?.startedYear ??
        null
    );
}


function getFreeAgentYears(
    gameState
) {
    if (
        gameState.player
            ?.football
            ?.currentClubId
    ) {
        return 0;
    }

    const sinceYear =
        getFreeAgentSinceYear(
            gameState
        );

    if (
        sinceYear === null ||
        sinceYear === undefined
    ) {
        return 0;
    }

    return Math.max(
        0,
        gameState.calendar.year -
        Number(
            sinceYear
        )
    );
}


function getLastSeason(
    gameState
) {
    return (
        gameState.footballContext
            ?.lastSeasonSummary ??
        null
    );
}


function getSquadStatusModifier(
    status
) {
    const modifiers = {
        key_player: 10,
        starter: 7,
        rotation: 3,
        reserve: -2,
        fringe: -7,
        evaluation: -3,
        free_agent: -5,
        unattached: -5
    };

    return (
        modifiers[
            status
        ] ??
        0
    );
}


function getAgeModifier(
    age
) {
    const numericAge =
        Number(age) ||
        18;

    if (
        numericAge <= 20
    ) {
        return 8;
    }

    if (
        numericAge <= 23
    ) {
        return 10;
    }

    if (
        numericAge <= 27
    ) {
        return 8;
    }

    if (
        numericAge <= 30
    ) {
        return 4;
    }

    if (
        numericAge <= 32
    ) {
        return 0;
    }

    if (
        numericAge <= 34
    ) {
        return -7;
    }

    return -14;
}


function getCurrentClubLevelBonus(
    gameState
) {
    const clubId =
        gameState.player
            ?.football
            ?.currentClubId;

    if (!clubId) {
        return 0;
    }

    const club =
        getClub(
            gameState,
            clubId
        );

    const bonus = {
        elite: 9,
        large: 6,
        medium: 3,
        regional: 0
    };

    return (
        bonus[
            club?.level
        ] ??
        0
    );
}


export function calculateProfessionalMarketScore(
    gameState
) {
    ensureMarketState(
        gameState
    );

    const reputation =
        Number(
            gameState.reputation
                ?.overall
        ) || 0;

    const fame =
        Number(
            gameState.reputation
                ?.fame
        ) || 0;

    const recognition =
        Number(
            gameState.academy
                ?.recognition
        ) || 0;

    const lastSeason =
        getLastSeason(
            gameState
        );

    const rating =
        Number(
            lastSeason
                ?.averageRating
        ) || 0;

    const appearances =
        Number(
            lastSeason
                ?.appearances
        ) || 0;

    const ratingScore =
        rating > 0
            ? clamp(
                (
                    rating -
                    5
                ) * 24,
                0,
                100
            )
            : 35;

    const appearanceScore =
        clamp(
            appearances *
            4,
            0,
            100
        );

    const statusModifier =
        getSquadStatusModifier(
            gameState.player
                ?.football
                ?.squadStatus
        );

    const ageModifier =
        getAgeModifier(
            gameState.calendar.age
        );

    const clubBonus =
        getCurrentClubLevelBonus(
            gameState
        );

    const freeAgentPenalty =
        Math.min(
            18,
            getFreeAgentYears(
                gameState
            ) * 6
        );

    const score =
        reputation * 0.27 +
        fame * 0.08 +
        recognition * 0.18 +
        ratingScore * 0.25 +
        appearanceScore * 0.12 +
        statusModifier +
        ageModifier +
        clubBonus -
        freeAgentPenalty;

    return Math.round(
        clamp(
            score,
            12,
            96
        )
    );
}


function getClubTargetScore(
    club
) {
    return (
        LEVEL_TARGETS[
            club?.level
        ] ??
        52
    );
}


function getClubOfferWeight(
    gameState,
    club,
    marketScore
) {
    const target =
        getClubTargetScore(
            club
        );

    const difference =
        Math.abs(
            marketScore -
            target
        );

    let weight =
        Math.max(
            4,
            105 -
            difference *
            2.7
        );

    const freeAgentYears =
        getFreeAgentYears(
            gameState
        );

    if (
        freeAgentYears >= 1 &&
        [
            "medium",
            "regional"
        ].includes(
            club.level
        )
    ) {
        weight *=
            1.2 +
            Math.min(
                0.45,
                freeAgentYears *
                0.12
            );
    }

    if (
        marketScore < 58 &&
        club.level ===
            "elite"
    ) {
        weight *=
            0.12;
    }

    if (
        marketScore < 46 &&
        club.level ===
            "large"
    ) {
        weight *=
            0.28;
    }

    if (
        marketScore >= 76 &&
        club.level ===
            "elite"
    ) {
        weight *=
            1.35;
    }

    return Math.max(
        0.5,
        weight
    );
}


function getCandidateClubs(
    gameState,
    marketScore
) {
    const currentClubId =
        gameState.player
            ?.football
            ?.currentClubId ??
        null;

    return (
        gameState.clubs
            ?.allIds ??
        []
    )
        .filter(
            clubId =>
                clubId !==
                currentClubId
        )
        .map(
            clubId =>
                getClub(
                    gameState,
                    clubId
                )
        )
        .filter(Boolean)
        .filter(
            club => {
                const target =
                    getClubTargetScore(
                        club
                    );

                return (
                    marketScore >=
                    target -
                    31
                );
            }
        );
}


function calculateInterestProbability(
    gameState,
    marketScore
) {
    const hasClub =
        Boolean(
            gameState.player
                ?.football
                ?.currentClubId
        );

    const season =
        getLastSeason(
            gameState
        );

    const rating =
        Number(
            season
                ?.averageRating
        ) || 0;

    if (!hasClub) {
        const yearsWithoutClub =
            getFreeAgentYears(
                gameState
            );

        return Math.min(
            0.92,
            0.34 +
            marketScore /
            230 +
            yearsWithoutClub *
            0.08
        );
    }

    let probability =
        0.10 +
        marketScore /
        265;

    if (
        rating >= 7.2
    ) {
        probability +=
            0.14;
    } else if (
        rating >= 6.8
    ) {
        probability +=
            0.07;
    }

    const activeContract =
        getActiveContract(
            gameState
        );

    if (activeContract) {
        const yearsRemaining =
            Math.max(
                0,
                activeContract.endYear -
                gameState.calendar.year
            );

        if (
            yearsRemaining >= 3
        ) {
            probability -=
                0.08;
        }
    }

    return Math.max(
        0.12,
        Math.min(
            0.72,
            probability
        )
    );
}


function determinePromisedRole(
    marketScore,
    club
) {
    const difference =
        marketScore -
        getClubTargetScore(
            club
        );

    if (
        difference >= 16
    ) {
        return "key_player";
    }

    if (
        difference >= 7
    ) {
        return "starter_candidate";
    }

    if (
        difference >= -4
    ) {
        return "rotation_candidate";
    }

    if (
        difference >= -13
    ) {
        return "squad_player";
    }

    return "development_player";
}


function calculateSalary(
    gameState,
    club,
    marketScore
) {
    const financialPower =
        Number(
            club.financialPower
        ) || 50;

    let base =
        1100 +
        financialPower * 47 +
        marketScore * 52;

    const currentContract =
        getActiveContract(
            gameState
        );

    const currentSalary =
        Number(
            currentContract
                ?.salary
        ) || 0;

    if (
        currentSalary > 0
    ) {
        base =
            Math.max(
                base,
                currentSalary *
                randomFloat(
                    gameState.rng,
                    0.92,
                    1.24
                )
            );
    }

    const freeAgentYears =
        getFreeAgentYears(
            gameState
        );

    if (
        freeAgentYears >= 1
    ) {
        base *=
            Math.max(
                0.72,
                1 -
                freeAgentYears *
                0.08
            );
    }

    return Math.max(
        1500,
        roundMoney(
            base *
            randomFloat(
                gameState.rng,
                0.88,
                1.15
            )
        )
    );
}


function getNegotiatedBy(
    gameState
) {
    const representation =
        getRepresentationContext(
            gameState
        );

    if (representation) {
        return "agent";
    }

    if (
        gameState.calendar.age <
        18
    ) {
        return "family";
    }

    return "player";
}


function createMarketOffer(
    gameState,
    club,
    marketScore
) {
    const hasCurrentClub =
        Boolean(
            gameState.player
                ?.football
                ?.currentClubId
        );

    const representation =
        getRepresentationContext(
            gameState
        );

    const salary =
        calculateSalary(
            gameState,
            club,
            marketScore
        );

    const durationYears =
        randomInt(
            gameState.rng,
            1,
            gameState.calendar.age <=
                30
                ? 4
                : 3
        );

    const signingBonus =
        roundMoney(
            salary *
            randomInt(
                gameState.rng,
                1,
                4
            )
        );

    const appearanceBonus =
        roundMoney(
            Math.max(
                200,
                salary *
                randomFloat(
                    gameState.rng,
                    0.07,
                    0.14
                )
            )
        );

    const goalBonus =
        roundMoney(
            Math.max(
                250,
                salary *
                randomFloat(
                    gameState.rng,
                    0.09,
                    0.18
                )
            )
        );

    const promisedRole =
        determinePromisedRole(
            marketScore,
            club
        );

    const offer = {
        id:
            createId(
                "professional_market_offer"
            ),

        type:
            "professional",

        source:
            "professional_market",

        moveType:
            hasCurrentClub
                ? "transfer"
                : "free_agent",

        firstProfessionalContract:
            false,

        clubId:
            club.id,

        clubName:
            club.name,

        previousClubId:
            gameState.player
                ?.football
                ?.currentClubId ??
            null,

        createdYear:
            gameState.calendar.year,

        createdAge:
            gameState.calendar.age,

        expiresYear:
            gameState.calendar.year +
            1,

        durationYears,

        salary,

        signingBonus,

        appearanceBonus,

        goalBonus,

        promisedRole,

        guardianApprovalRequired:
            gameState.calendar.age <
            18,

        negotiatedBy:
            getNegotiatedBy(
                gameState
            ),

        representative:
            representation
                ? {
                    agentPersonId:
                        representation
                            .agentPersonId,

                    agentName:
                        representation
                            .agentName,

                    agencyId:
                        representation
                            .agencyId,

                    agencyName:
                        representation
                            .agencyName
                }
                : null,

        negotiationAttempts:
            0,

        negotiationResult:
            null,

        marketScore,

        status:
            "pending"
    };

    gameState.contracts
        .offers
        .push(
            offer
        );

    return offer;
}


function expireOldMarketOffers(
    gameState
) {
    gameState.contracts
        .offers
        .forEach(
            offer => {
                if (
                    offer.source ===
                        "professional_market" &&
                    offer.status ===
                        "pending" &&
                    Number(
                        offer.createdYear
                    ) <
                    gameState.calendar.year
                ) {
                    offer.status =
                        "expired";
                }
            }
        );
}


function inboxMessageExists(
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


function createMarketInboxMessage(
    gameState,
    offer
) {
    const id =
        `inbox_contract_${offer.id}`;

    if (
        inboxMessageExists(
            gameState,
            id
        )
    ) {
        return null;
    }

    const roleLabel =
        ROLE_LABELS[
            offer.promisedRole
        ] ??
        "Projeto esportivo";

    const hasClub =
        Boolean(
            offer.previousClubId
        );

    const representative =
        offer.representative ??
        getRepresentationContext(
            gameState
        );

    let representationText =
        "";

    if (
        representative
            ?.agentName &&
        representative
            ?.agencyName
    ) {
        representationText =
            ` A negociação está sendo acompanhada por ${representative.agentName}, da ${representative.agencyName}.`;
    } else if (
        representative
            ?.agencyName
    ) {
        representationText =
            ` A negociação está sendo acompanhada pela ${representative.agencyName}.`;
    }

    const message = {
        id,

        channel:
            "contracts",

        type:
            "contract",

        offerType:
            "professional_contract",

        offerId:
            offer.id,

        senderPersonId:
            representative
                ?.agentPersonId ??
            null,

        title:
            hasClub
                ? `${offer.clubName} quer contratar você`
                : `${offer.clubName} apresentou uma proposta`,

        body:
            `O ${offer.clubName} ofereceu contrato profissional por ${offer.durationYears} ano(s), salário de R$ ${Number(
                offer.salary
            ).toLocaleString(
                "pt-BR"
            )} por mês, R$ ${Number(
                offer.signingBonus
            ).toLocaleString(
                "pt-BR"
            )} em luvas e papel de ${roleLabel.toLowerCase()}.${representationText}`,

        actionable:
            true,

        metadata: {
            source:
                "professional_market",

            moveType:
                offer.moveType,

            clubId:
                offer.clubId,

            promisedRole:
                offer.promisedRole,

            agentPersonId:
                representative
                    ?.agentPersonId ??
                null,

            agentName:
                representative
                    ?.agentName ??
                null,

            agencyId:
                representative
                    ?.agencyId ??
                null,

            agencyName:
                representative
                    ?.agencyName ??
                null
        },

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
                        "contracts",

                    title:
                        newest.title,

                    body:
                        newest.body
                }
            }
        )
    );
}


function getDesiredOfferCount(
    gameState,
    marketScore
) {
    const freeAgent =
        !gameState.player
            ?.football
            ?.currentClubId;

    let count =
        1;

    if (
        marketScore >= 66 &&
        chance(
            gameState.rng,
            0.42
        )
    ) {
        count++;
    }

    if (
        freeAgent &&
        marketScore >= 48 &&
        chance(
            gameState.rng,
            0.30
        )
    ) {
        count++;
    }

    return Math.min(
        3,
        count
    );
}


function selectOfferClubs(
    gameState,
    marketScore,
    count
) {
    const available =
        getCandidateClubs(
            gameState,
            marketScore
        );

    const selected =
        [];

    while (
        selected.length <
            count &&
        available.length
    ) {
        const club =
            weightedPick(
                gameState.rng,
                available,
                candidate =>
                    getClubOfferWeight(
                        gameState,
                        candidate,
                        marketScore
                    )
            );

        if (!club) {
            break;
        }

        selected.push(
            club
        );

        const index =
            available.findIndex(
                candidate =>
                    candidate.id ===
                    club.id
            );

        if (
            index >= 0
        ) {
            available.splice(
                index,
                1
            );
        }
    }

    return selected;
}


export function refreshProfessionalMarket(
    gameState
) {
    ensureMarketState(
        gameState
    );

    expireOldMarketOffers(
        gameState
    );

    const marketState =
        gameState.contracts
            .marketState;

    if (
        marketState
            .lastProcessedYear ===
        gameState.calendar.year
    ) {
        return {
            processed:
                false,

            createdOffers:
                0,

            createdMessages:
                0,

            offers: [],

            messages: []
        };
    }

    marketState
        .lastProcessedYear =
        gameState.calendar.year;

    if (
        gameState.calendar.age <
            16 ||
        !hasProfessionalHistory(
            gameState
        )
    ) {
        return {
            processed: true,
            createdOffers: 0,
            createdMessages: 0,
            offers: [],
            messages: []
        };
    }

    const pendingMarketOffers =
        gameState.contracts
            .offers
            .filter(
                offer =>
                    offer.source ===
                        "professional_market" &&
                    offer.status ===
                        "pending"
            );

    if (
        pendingMarketOffers.length
    ) {
        const messages =
            pendingMarketOffers
                .map(
                    offer => {
                        if (
                            !offer
                                .representative
                        ) {
                            offer.representative =
                                getRepresentationContext(
                                    gameState
                                );
                        }

                        return createMarketInboxMessage(
                            gameState,
                            offer
                        );
                    }
                )
                .filter(
                    Boolean
                );

        emitNewMessageEvent(
            messages
        );

        return {
            processed: true,

            createdOffers: 0,

            createdMessages:
                messages.length,

            offers: [],

            messages
        };
    }

    const marketScore =
        calculateProfessionalMarketScore(
            gameState
        );

    const freeAgent =
        !gameState.player
            ?.football
            ?.currentClubId;

    const freeAgentYears =
        getFreeAgentYears(
            gameState
        );

    const probability =
        calculateInterestProbability(
            gameState,
            marketScore
        );

    const guaranteedOpportunity =
        freeAgent &&
        (
            freeAgentYears >= 2 ||
            marketState
                .consecutiveNoOfferYears >=
                2
        );

    const interest =
        guaranteedOpportunity ||
        chance(
            gameState.rng,
            probability
        );

    if (!interest) {
        if (
            freeAgent
        ) {
            marketState
                .consecutiveNoOfferYears +=
                1;
        }

        marketState
            .history
            .push({
                year:
                    gameState.calendar.year,

                age:
                    gameState.calendar.age,

                action:
                    "market_window_without_offer",

                marketScore,

                freeAgent,

                probability
            });

        return {
            processed: true,

            createdOffers: 0,

            createdMessages: 0,

            offers: [],

            messages: [],

            marketScore
        };
    }

    const count =
        getDesiredOfferCount(
            gameState,
            marketScore
        );

    const clubs =
        selectOfferClubs(
            gameState,
            marketScore,
            count
        );

    const offers =
        clubs.map(
            club =>
                createMarketOffer(
                    gameState,
                    club,
                    marketScore
                )
        );

    const messages =
        offers
            .map(
                offer =>
                    createMarketInboxMessage(
                        gameState,
                        offer
                    )
            )
            .filter(
                Boolean
            );

    if (
        offers.length
    ) {
        marketState
            .consecutiveNoOfferYears =
            0;

        marketState
            .lastOfferYear =
            gameState.calendar.year;

        marketState
            .history
            .push({
                year:
                    gameState.calendar.year,

                age:
                    gameState.calendar.age,

                action:
                    "professional_interest_generated",

                marketScore,

                freeAgent,

                offerIds:
                    offers.map(
                        offer =>
                            offer.id
                    ),

                clubIds:
                    offers.map(
                        offer =>
                            offer.clubId
                    )
            });

        addTimelineEntry(
            gameState,
            {
                type:
                    "professional_market_interest",

                title:
                    offers.length ===
                    1
                        ? "Um clube entrou em contato"
                        : `${offers.length} clubes demonstraram interesse`,

                description:
                    freeAgent
                        ? "O mercado profissional voltou a se movimentar e uma nova oportunidade apareceu."
                        : "Seu momento no futebol chamou a atenção de outros clubes.",

                importance:
                    6,

                relatedEntities:
                    offers.map(
                        offer =>
                            offer.clubId
                    ),

                metadata: {
                    marketScore,

                    offerIds:
                        offers.map(
                            offer =>
                                offer.id
                        )
                }
            }
        );
    } else if (
        freeAgent
    ) {
        marketState
            .consecutiveNoOfferYears +=
            1;
    }

    emitNewMessageEvent(
        messages
    );

    return {
        processed: true,

        createdOffers:
            offers.length,

        createdMessages:
            messages.length,

        offers,

        messages,

        marketScore
    };
}