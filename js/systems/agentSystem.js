import {
    randomInt,
    weightedPick,
    pick
} from "../core/rng.js";

import {
    FOOTBALL_AGENCIES,
    getAgencyById
} from "../data/agencies.js";

import {
    MALE_FIRST_NAMES,
    FEMALE_FIRST_NAMES,
    LAST_NAMES
} from "../data/names.js";

import {
    createPerson,
    addPerson
} from "./personSystem.js";

import {
    ensureRelationship
} from "./relationshipSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


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


function randomAgentName(
    gameState
) {
    const isMale =
        randomInt(
            gameState.rng,
            0,
            100
        ) < 72;

    const firstName =
        isMale
            ? pick(
                gameState.rng,
                MALE_FIRST_NAMES
            )
            : pick(
                gameState.rng,
                FEMALE_FIRST_NAMES
            );

    const lastName =
        pick(
            gameState.rng,
            LAST_NAMES
        );

    return {
        fullName:
            `${firstName} ${lastName}`,

        gender:
            isMale
                ? "male"
                : "female"
    };
}


export function initializeAgencyWorld(
    gameState
) {
    FOOTBALL_AGENCIES.forEach(
        agency => {
            gameState.world
                .agencyState[
                    agency.id
                ] = {
                    reputation:
                        agency.reputation,

                    active: true,

                    generatedYear:
                        gameState
                            .calendar
                            .year
                };
        }
    );

    return gameState.world
        .agencyState;
}


export function canFormalAgentApproach(
    gameState
) {
    const age =
        gameState.calendar.age;

    const phase =
        gameState.calendar.phase;

    if (age >= 16) {
        return true;
    }

    if (
        age === 15 &&
        (
            phase === "late_season" ||
            phase === "offseason"
        )
    ) {
        return true;
    }

    return false;
}


export function requiresGuardianForRepresentation(
    gameState
) {
    return (
        gameState.calendar.age <
        18
    );
}


function calculateAgencyFit(
    gameState,
    agency
) {
    const recognition =
        Number(
            gameState.academy
                .recognition
        ) || 0;

    const development =
        Number(
            gameState.academy
                .developmentScore
        ) || 0;

    const fame =
        Number(
            gameState.reputation
                .fame
        ) || 0;

    const score =
        development * 0.40 +
        recognition * 0.32 +
        fame * 0.08 +
        agency.youthFocus * 0.20;

    return Math.round(
        score
    );
}


function agencyWouldAccept(
    gameState,
    agency
) {
    const fit =
        calculateAgencyFit(
            gameState,
            agency
        );

    return (
        fit >=
        agency.selectivity
    );
}


function createAgencyRepresentative(
    gameState,
    agency
) {
    const existing =
        gameState.people
            .allIds
            .map(
                personId =>
                    gameState.people
                        .byId[
                            personId
                        ]
            )
            .find(
                person =>
                    person
                        ?.roles
                        ?.includes(
                            "football_agent"
                        ) &&
                    person.metadata
                        ?.agencyId ===
                        agency.id
            );

    if (existing) {
        return existing;
    }

    const identity =
        randomAgentName(
            gameState
        );

    const agent =
        createPerson({
            fullName:
                identity.fullName,

            birthYear:
                gameState.calendar.year -
                randomInt(
                    gameState.rng,
                    28,
                    58
                ),

            gender:
                identity.gender,

            roles: [
                "football_agent"
            ],

            profession:
                "Agente de futebol",

            personality: {
                ambition:
                    randomInt(
                        gameState.rng,
                        50,
                        95
                    ),

                loyalty:
                    randomInt(
                        gameState.rng,
                        30,
                        90
                    ),

                temperament:
                    randomInt(
                        gameState.rng,
                        25,
                        85
                    ),

                empathy:
                    randomInt(
                        gameState.rng,
                        25,
                        90
                    )
            },

            metadata: {
                agencyId:
                    agency.id,

                licensed:
                    true,

                minorAccredited:
                    true,

                negotiation:
                    agency.negotiation,

                ethics:
                    agency.ethics
            }
        });

    addPerson(
        gameState,
        agent
    );

    return agent;
}


function createRepresentationOffer(
    gameState,
    agency
) {
    const agent =
        createAgencyRepresentative(
            gameState,
            agency
        );

    const durationYears =
        randomInt(
            gameState.rng,
            1,
            2
        );

    return {
        id:
            createId(
                "representation_offer"
            ),

        agencyId:
            agency.id,

        agencyName:
            agency.name,

        agentPersonId:
            agent.id,

        createdYear:
            gameState.calendar.year,

        createdAge:
            gameState.calendar.age,

        durationYears,

        requiresGuardianConsent:
            requiresGuardianForRepresentation(
                gameState
            ),

        status:
            "pending"
    };
}


export function generateRepresentationOffers(
    gameState,
    {
        maximumOffers = 3
    } = {}
) {
    if (
        gameState.representation
            .activeAgreement
    ) {
        return [];
    }

    if (
        !canFormalAgentApproach(
            gameState
        )
    ) {
        return [];
    }

    initializeAgencyWorld(
        gameState
    );

    const candidates =
        FOOTBALL_AGENCIES
            .filter(
                agency =>
                    agencyWouldAccept(
                        gameState,
                        agency
                    )
            );

    if (!candidates.length) {
        return [];
    }

    const pool =
        [...candidates];

    const offers = [];

    const desiredCount =
        Math.min(
            maximumOffers,
            gameState.academy
                .recognition >= 70
                ? 3
                : gameState.academy
                    .recognition >= 50
                    ? 2
                    : 1
        );

    for (
        let index = 0;
        index < desiredCount;
        index++
    ) {
        if (!pool.length) {
            break;
        }

        const agency =
            weightedPick(
                gameState.rng,
                pool,
                candidate => {
                    const fit =
                        calculateAgencyFit(
                            gameState,
                            candidate
                        );

                    return Math.max(
                        1,
                        fit -
                        candidate
                            .selectivity +
                        30
                    );
                }
            );

        if (!agency) {
            break;
        }

        const offer =
            createRepresentationOffer(
                gameState,
                agency
            );

        gameState.representation
            .offers
            .push(
                offer
            );

        offers.push(
            offer
        );

        const poolIndex =
            pool.findIndex(
                candidate =>
                    candidate.id ===
                    agency.id
            );

        if (poolIndex >= 0) {
            pool.splice(
                poolIndex,
                1
            );
        }
    }

    if (offers.length) {
        addTimelineEntry(
            gameState,
            {
                type:
                    "agent_interest",

                title:
                    "Agências demonstraram interesse",

                description:
                    "O crescimento do jogador começou a chamar atenção de profissionais do mercado.",

                importance: 6,

                relatedEntities:
                    offers.map(
                        offer =>
                            offer
                                .agentPersonId
                    ),

                metadata: {
                    offerIds:
                        offers.map(
                            offer =>
                                offer.id
                        )
                }
            }
        );
    }

    return offers;
}


export function searchForRepresentation(
    gameState
) {
    if (
        gameState.representation
            .activeAgreement
    ) {
        return {
            status:
                "already_represented",

            offers: []
        };
    }

    if (
        !canFormalAgentApproach(
            gameState
        )
    ) {
        return {
            status:
                "not_legally_available",

            offers: []
        };
    }

    const offers =
        generateRepresentationOffers(
            gameState,
            {
                maximumOffers: 3
            }
        );

    return {
        status:
            offers.length
                ? "offers_received"
                : "no_agency_accepted",

        offers
    };
}


export function acceptRepresentationOffer(
    gameState,
    offerId,
    {
        guardianConsent = false
    } = {}
) {
    if (
        gameState.representation
            .activeAgreement
    ) {
        throw new Error(
            "O jogador já possui representação ativa."
        );
    }

    const offer =
        gameState.representation
            .offers
            .find(
                current =>
                    current.id ===
                    offerId
            );

    if (!offer) {
        throw new Error(
            "Proposta de representação não encontrada."
        );
    }

    if (
        offer.status !==
        "pending"
    ) {
        throw new Error(
            "Esta proposta não está mais disponível."
        );
    }

    if (
        offer.requiresGuardianConsent &&
        !guardianConsent
    ) {
        throw new Error(
            "É necessária autorização do responsável legal."
        );
    }

    const agency =
        getAgencyById(
            offer.agencyId
        );

    if (!agency) {
        throw new Error(
            "Agência não encontrada."
        );
    }

    const agreement = {
        id:
            createId(
                "representation_agreement"
            ),

        agencyId:
            agency.id,

        agencyName:
            agency.name,

        agentPersonId:
            offer.agentPersonId,

        startYear:
            gameState.calendar.year,

        startAge:
            gameState.calendar.age,

        durationYears:
            Math.min(
                2,
                offer.durationYears
            ),

        endYear:
            gameState.calendar.year +
            Math.min(
                2,
                offer.durationYears
            ),

        guardianCoSigned:
            offer
                .requiresGuardianConsent
                ? guardianConsent
                : false,

        status:
            "active"
    };

    offer.status =
        "accepted";

    gameState.representation
        .offers
        .forEach(
            other => {
                if (
                    other.id !==
                        offer.id &&
                    other.status ===
                        "pending"
                ) {
                    other.status =
                        "expired";
                }
            }
        );

    gameState.representation
        .currentAgentPersonId =
        offer.agentPersonId;

    gameState.representation
        .currentAgencyId =
        agency.id;

    gameState.representation
        .activeAgreement =
        agreement;

    gameState.representation
        .guardianConsent =
        guardianConsent;

    gameState.representation
        .history
        .push({
            action:
                "representation_started",

            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age,

            agencyId:
                agency.id,

            agentPersonId:
                offer.agentPersonId,

            agreementId:
                agreement.id
        });

    ensureRelationship(
        gameState,
        gameState.player.id,
        offer.agentPersonId,
        {
            type:
                "agent",

            affection: 45,

            trust:
                clamp(
                    35 +
                    agency.ethics *
                    0.35
                ),

            respect:
                clamp(
                    35 +
                    agency.reputation *
                    0.35
                ),

            conflict: 0,

            loyalty:
                clamp(
                    30 +
                    agency.ethics *
                    0.30
                ),

            dependency:
                requiresGuardianForRepresentation(
                    gameState
                )
                    ? 35
                    : 20
        }
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "representation_started",

            title:
                `Representado pela ${agency.name}`,

            description:
                `${gameState.player.identity.fullName} passou a ser representado pela ${agency.name}.`,

            importance: 7,

            relatedEntities: [
                offer.agentPersonId
            ],

            metadata: {
                agencyId:
                    agency.id,

                agreementId:
                    agreement.id
            }
        }
    );

    return agreement;
}


export function terminateRepresentation(
    gameState,
    {
        reason =
            "player_decision"
    } = {}
) {
    const agreement =
        gameState.representation
            .activeAgreement;

    if (!agreement) {
        return null;
    }

    agreement.status =
        "terminated";

    agreement.terminatedYear =
        gameState.calendar.year;

    agreement.terminationReason =
        reason;

    gameState.representation
        .history
        .push({
            action:
                "representation_ended",

            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age,

            agencyId:
                agreement.agencyId,

            agentPersonId:
                agreement
                    .agentPersonId,

            reason
        });

    gameState.representation
        .currentAgentPersonId =
        null;

    gameState.representation
        .currentAgencyId =
        null;

    gameState.representation
        .activeAgreement =
        null;

    gameState.representation
        .guardianConsent =
        false;

    addTimelineEntry(
        gameState,
        {
            type:
                "representation_ended",

            title:
                "Fim da representação",

            description:
                "A relação com o empresário chegou ao fim.",

            importance: 6,

            relatedEntities: [
                agreement.agentPersonId
            ],

            metadata: {
                agencyId:
                    agreement.agencyId,

                reason
            }
        }
    );

    return agreement;
}


export function getAgentNegotiationModifier(
    gameState
) {
    const agencyId =
        gameState.representation
            .currentAgencyId;

    if (!agencyId) {
        return 1;
    }

    const agency =
        getAgencyById(
            agencyId
        );

    if (!agency) {
        return 1;
    }

    return (
        1 +
        (
            agency.negotiation -
            50
        ) /
        250
    );
}