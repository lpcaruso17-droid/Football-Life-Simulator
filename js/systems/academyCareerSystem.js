import {
    randomInt,
    chance,
    weightedPick
} from "../core/rng.js";

import {
    ACADEMY_CATEGORIES
} from "../data/clubs.js";

import {
    calculateAcademyDevelopmentScore,
    getClub,
    getDefaultCategoryForAge,
    getNextCategoryId,
    assignPlayerToClub,
    promotePlayerCategory,
    releasePlayerFromClub
} from "./academySystem.js";

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


function average(values) {
    const valid =
        values.filter(
            value =>
                Number.isFinite(
                    Number(value)
                )
        );

    if (!valid.length) {
        return 0;
    }

    return (
        valid.reduce(
            (
                total,
                value
            ) =>
                total +
                Number(value),
            0
        ) /
        valid.length
    );
}


function getCategoryIndex(
    categoryId
) {
    return ACADEMY_CATEGORIES
        .findIndex(
            category =>
                category.id ===
                categoryId
        );
}


function closeOpenFreeAgentSpell(
    gameState
) {
    const spell =
        [...gameState
            .career
            .freeAgentSpells]
            .reverse()
            .find(
                current =>
                    current.endedYear ===
                        null
            );

    if (!spell) {
        return;
    }

    spell.endedYear =
        gameState.calendar.year;

    spell.endedAge =
        gameState.calendar.age;
}


export function calculateAcademyRecognition(
    gameState
) {
    const development =
        calculateAcademyDevelopmentScore(
            gameState
        );

    const club =
        getClub(
            gameState,
            gameState
                .academy
                .currentClubId
        );

    const exposure =
        club
            ?.exposure ??
        35;

    const reputation =
        Number(
            gameState
                .reputation
                .overall
        ) || 0;

    const fame =
        Number(
            gameState
                .reputation
                .fame
        ) || 0;

    const score =
        clamp(
            Math.round(
                development * 0.50 +
                exposure * 0.22 +
                reputation * 0.18 +
                fame * 0.10
            )
        );

    gameState.academy
        .recognition =
        score;

    return score;
}


export function evaluateAcademyStanding(
    gameState
) {
    const club =
        getClub(
            gameState,
            gameState
                .academy
                .currentClubId
        );

    if (!club) {
        return {
            score: null,

            club: null,

            status:
                "unattached"
        };
    }

    const development =
        calculateAcademyDevelopmentScore(
            gameState
        );

    const recognition =
        calculateAcademyRecognition(
            gameState
        );

    const personality =
        gameState.player
            .hidden
            .personality;

    const personalityScore =
        average([
            personality
                ?.professionalism,

            personality
                ?.discipline,

            personality
                ?.resilience,

            personality
                ?.adaptability
        ]);

    const competitionPenalty =
        (
            Number(
                club.competition
            ) || 50
        ) * 0.13;

    const randomVariation =
        randomInt(
            gameState.rng,
            -10,
            10
        );

    const finalScore =
        clamp(
            Math.round(
                development * 0.67 +
                personalityScore *
                    0.16 +
                recognition * 0.12 +
                randomVariation -
                competitionPenalty +
                9
            )
        );

    const evaluation = {
        year:
            gameState.calendar.year,

        age:
            gameState.calendar.age,

        clubId:
            club.id,

        categoryId:
            gameState
                .academy
                .currentCategory,

        development,

        recognition,

        competition:
            club.competition,

        finalScore,

        status:
            "evaluated"
    };

    gameState.academy
        .currentEvaluation =
        evaluation;

    return evaluation;
}


function canPromoteToCategory(
    gameState,
    targetCategoryId
) {
    if (!targetCategoryId) {
        return false;
    }

    const club =
        getClub(
            gameState,
            gameState
                .academy
                .currentClubId
        );

    if (
        !club ||
        !club.academyCategories
            .includes(
                targetCategoryId
            )
    ) {
        return false;
    }

    const category =
        ACADEMY_CATEGORIES.find(
            item =>
                item.id ===
                targetCategoryId
        );

    if (!category) {
        return false;
    }

    return (
        gameState.calendar.age >=
        category.typicalMinAge - 1
    );
}


export function resolveAnnualAcademyEvaluation(
    gameState
) {
    if (
        !gameState
            .academy
            .currentClubId
    ) {
        return {
            decision:
                "unattached"
        };
    }

    const evaluation =
        evaluateAcademyStanding(
            gameState
        );

    const currentCategory =
        gameState
            .academy
            .currentCategory;

    const naturalCategory =
        getDefaultCategoryForAge(
            gameState
                .calendar
                .age
        );

    const nextCategory =
        getNextCategoryId(
            currentCategory
        );

    const currentIndex =
        getCategoryIndex(
            currentCategory
        );

    const naturalIndex =
        getCategoryIndex(
            naturalCategory
        );

    let decision =
        "retained";

    if (
        evaluation.finalScore >= 78 &&
        canPromoteToCategory(
            gameState,
            nextCategory
        )
    ) {
        decision =
            "fast_track";
    } else if (
        naturalIndex >
            currentIndex &&
        evaluation.finalScore >= 54 &&
        canPromoteToCategory(
            gameState,
            nextCategory
        )
    ) {
        decision =
            "promoted";
    } else if (
        evaluation.finalScore >= 48
    ) {
        decision =
            "retained";
    } else if (
        evaluation.finalScore >= 39
    ) {
        decision =
            chance(
                gameState.rng,
                0.68
            )
                ? "observation"
                : "released";
    } else {
        decision =
            chance(
                gameState.rng,
                0.82
            )
                ? "released"
                : "observation";
    }

    const previousClubId =
        gameState
            .academy
            .currentClubId;

    if (
        decision === "promoted" ||
        decision ===
            "fast_track"
    ) {
        promotePlayerCategory(
            gameState,
            nextCategory,
            {
                reason:
                    decision
            }
        );

        gameState.academy
            .evaluationStatus =
            "promoted";

        gameState.player
            .football
            .squadStatus =
            "evaluation";
    }

    if (
        decision === "retained"
    ) {
        gameState.academy
            .evaluationStatus =
            "retained";

        gameState.player
            .football
            .squadStatus =
            "rotation";
    }

    if (
        decision ===
        "observation"
    ) {
        gameState.academy
            .evaluationStatus =
            "observation";

        gameState.player
            .football
            .squadStatus =
            "under_review";

        addTimelineEntry(
            gameState,
            {
                type:
                    "academy_observation",

                title:
                    "Futuro em avaliação",

                description:
                    "A comissão técnica decidiu acompanhar o desenvolvimento do jogador antes de definir sua permanência.",

                importance: 5,

                relatedEntities: [
                    previousClubId
                ],

                metadata: {
                    score:
                        evaluation
                            .finalScore
                }
            }
        );
    }

    if (
        decision === "released"
    ) {
        releasePlayerFromClub(
            gameState,
            {
                reason:
                    "annual_evaluation"
            }
        );
    }

    gameState.academy
        .lastDecision =
        {
            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age,

            decision,

            score:
                evaluation.finalScore,

            previousClubId
        };

    return {
        decision,

        evaluation,

        currentClubId:
            gameState
                .academy
                .currentClubId,

        currentCategory:
            gameState
                .academy
                .currentCategory
    };
}


function calculateOfferWeight(
    gameState,
    club
) {
    const recognition =
        gameState
            .academy
            .recognition;

    const development =
        gameState
            .academy
            .developmentScore;

    const playerCityId =
        gameState
            .player
            .identity
            .currentCityId;

    let weight = 10;

    if (
        club.cityId ===
        playerCityId
    ) {
        weight *= 2.2;
    }

    if (
        club.level === "elite"
    ) {
        if (
            development >= 55 &&
            recognition >= 45
        ) {
            weight *= 1.4;
        } else {
            weight *= 0.3;
        }
    }

    if (
        club.level === "large"
    ) {
        weight *=
            development >= 45
                ? 1.3
                : 0.7;
    }

    if (
        club.level === "medium"
    ) {
        weight *= 1.5;
    }

    if (
        club.level ===
        "regional"
    ) {
        weight *= 1.7;
    }

    return weight;
}


function createAcademyOffer(
    gameState,
    club,
    categoryId,
    reason
) {
    const offer = {
        id:
            createId(
                "academy_offer"
            ),

        clubId:
            club.id,

        clubName:
            club.name,

        categoryId,

        createdYear:
            gameState
                .calendar
                .year,

        createdAge:
            gameState
                .calendar
                .age,

        expiresYear:
            gameState
                .calendar
                .year,

        status:
            "pending",

        reason
    };

    gameState.academy
        .offers
        .push(
            offer
        );

    return offer;
}


export function generateAcademyOffers(
    gameState,
    {
        maximumOffers = 3,

        excludeCurrentClub =
            true,

        reason =
            "club_interest"
    } = {}
) {
    calculateAcademyRecognition(
        gameState
    );

    const currentClubId =
        gameState
            .academy
            .currentClubId;

    const desiredCategory =
        gameState
            .academy
            .currentCategory ??
        getDefaultCategoryForAge(
            gameState
                .calendar
                .age
        );

    const candidates =
        gameState.clubs
            .allIds
            .map(
                clubId =>
                    getClub(
                        gameState,
                        clubId
                    )
            )
            .filter(Boolean)
            .filter(
                club =>
                    (
                        !excludeCurrentClub ||
                        club.id !==
                            currentClubId
                    ) &&
                    club
                        .academyCategories
                        .includes(
                            desiredCategory
                        )
            );

    const available =
        [...candidates];

    const offers = [];

    const recognition =
        gameState
            .academy
            .recognition;

    let numberOfOffers = 0;

    if (recognition >= 72) {
        numberOfOffers =
            randomInt(
                gameState.rng,
                2,
                maximumOffers
            );
    } else if (
        recognition >= 55
    ) {
        numberOfOffers =
            randomInt(
                gameState.rng,
                1,
                Math.min(
                    2,
                    maximumOffers
                )
            );
    } else if (
        recognition >= 42 &&
        chance(
            gameState.rng,
            0.50
        )
    ) {
        numberOfOffers = 1;
    }

    for (
        let index = 0;
        index < numberOfOffers;
        index++
    ) {
        if (!available.length) {
            break;
        }

        const club =
            weightedPick(
                gameState.rng,
                available,
                candidate =>
                    calculateOfferWeight(
                        gameState,
                        candidate
                    )
            );

        if (!club) {
            break;
        }

        const offer =
            createAcademyOffer(
                gameState,
                club,
                desiredCategory,
                reason
            );

        offers.push(
            offer
        );

        const removeIndex =
            available.findIndex(
                candidate =>
                    candidate.id ===
                        club.id
            );

        if (removeIndex >= 0) {
            available.splice(
                removeIndex,
                1
            );
        }
    }

    if (offers.length) {
        gameState.academy
            .marketStatus =
            "offers_received";

        addTimelineEntry(
            gameState,
            {
                type:
                    "academy_interest",

                title:
                    offers.length === 1
                        ? "Um novo clube demonstrou interesse"
                        : `${offers.length} clubes demonstraram interesse`,

                description:
                    "O desempenho do jogador chamou atenção de outras categorias de base.",

                importance: 6,

                relatedEntities:
                    offers.map(
                        offer =>
                            offer.clubId
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


export function acceptAcademyOffer(
    gameState,
    offerId
) {
    const offer =
        gameState.academy
            .offers
            .find(
                current =>
                    current.id ===
                    offerId
            );

    if (!offer) {
        throw new Error(
            "Proposta não encontrada."
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

    offer.status =
        "accepted";

    gameState.academy
        .offers
        .forEach(
            otherOffer => {
                if (
                    otherOffer.id !==
                        offer.id &&
                    otherOffer.status ===
                        "pending"
                ) {
                    otherOffer.status =
                        "expired";
                }
            }
        );

    closeOpenFreeAgentSpell(
        gameState
    );

    const result =
        assignPlayerToClub(
            gameState,
            offer.clubId,
            {
                categoryId:
                    offer.categoryId,

                reason:
                    "academy_offer_accepted",

                startingPath:
                    "club_offer"
            }
        );

    gameState.academy
        .marketStatus =
        "not_available";

    addTimelineEntry(
        gameState,
        {
            type:
                "academy_offer_accepted",

            title:
                `Proposta do ${offer.clubName} aceita`,

            description:
                `A família decidiu aceitar a oportunidade oferecida pelo ${offer.clubName}.`,

            importance: 7,

            relatedEntities: [
                offer.clubId
            ],

            metadata: {
                offerId:
                    offer.id
            }
        }
    );

    return result;
}


export function declineAcademyOffer(
    gameState,
    offerId
) {
    const offer =
        gameState.academy
            .offers
            .find(
                current =>
                    current.id ===
                    offerId
            );

    if (!offer) {
        throw new Error(
            "Proposta não encontrada."
        );
    }

    offer.status =
        "declined";

    return offer;
}


export function createAcademyTrial(
    gameState,
    clubId,
    {
        reason =
            "opportunity_search"
    } = {}
) {
    const club =
        getClub(
            gameState,
            clubId
        );

    if (!club) {
        throw new Error(
            "Clube da avaliação não encontrado."
        );
    }

    const desiredCategory =
        getDefaultCategoryForAge(
            gameState
                .calendar
                .age
        );

    if (
        !club
            .academyCategories
            .includes(
                desiredCategory
            )
    ) {
        return null;
    }

    const trial = {
        id:
            createId(
                "academy_trial"
            ),

        clubId:
            club.id,

        clubName:
            club.name,

        categoryId:
            desiredCategory,

        createdYear:
            gameState.calendar.year,

        createdAge:
            gameState.calendar.age,

        reason,

        status:
            "scheduled",

        result: null
    };

    gameState.academy
        .trials
        .push(
            trial
        );

    gameState.academy
        .marketStatus =
        "trial_scheduled";

    return trial;
}


export function resolveAcademyTrial(
    gameState,
    trialId
) {
    const trial =
        gameState.academy
            .trials
            .find(
                current =>
                    current.id ===
                    trialId
            );

    if (!trial) {
        throw new Error(
            "Avaliação não encontrada."
        );
    }

    if (
        trial.status !==
        "scheduled"
    ) {
        return trial;
    }

    const club =
        getClub(
            gameState,
            trial.clubId
        );

    const development =
        calculateAcademyDevelopmentScore(
            gameState
        );

    const potential =
        Number(
            gameState.player
                .hidden
                .potential
        ) || 60;

    const adaptability =
        Number(
            gameState.player
                .hidden
                .personality
                .adaptability
        ) || 50;

    const clubDifficulty =
        (
            Number(
                club.competition
            ) || 50
        ) * 0.42;

    const trialScore =
        development * 0.48 +
        potential * 0.24 +
        adaptability * 0.13 +
        randomInt(
            gameState.rng,
            -12,
            14
        ) -
        clubDifficulty +
        23;

    const approved =
        trialScore >= 52;

    trial.status =
        "completed";

    trial.result =
        approved
            ? "approved"
            : "rejected";

    trial.score =
        Math.round(
            trialScore
        );

    if (approved) {
        const offer =
            createAcademyOffer(
                gameState,
                club,
                trial.categoryId,
                "trial_approved"
            );

        gameState.academy
            .marketStatus =
            "offers_received";

        addTimelineEntry(
            gameState,
            {
                type:
                    "trial_approved",

                title:
                    `Aprovado no ${club.name}`,

                description:
                    `Após um período de avaliação, ${gameState.player.identity.fullName} recebeu uma oportunidade no ${club.name}.`,

                importance: 7,

                relatedEntities: [
                    club.id
                ],

                metadata: {
                    trialId:
                        trial.id,

                    offerId:
                        offer.id
                }
            }
        );
    } else {
        gameState.academy
            .marketStatus =
            "seeking_club";

        addTimelineEntry(
            gameState,
            {
                type:
                    "trial_rejected",

                title:
                    `Não aprovado no ${club.name}`,

                description:
                    `A avaliação terminou sem proposta do ${club.name}.`,

                importance: 5,

                relatedEntities: [
                    club.id
                ],

                metadata: {
                    trialId:
                        trial.id
                }
            }
        );
    }

    return trial;
}


export function searchForAcademyOpportunities(
    gameState
) {
    if (
        gameState
            .academy
            .currentClubId
    ) {
        throw new Error(
            "O jogador já possui clube."
        );
    }

    calculateAcademyRecognition(
        gameState
    );

    const recognition =
        gameState
            .academy
            .recognition;

    if (recognition >= 52) {
        const offers =
            generateAcademyOffers(
                gameState,
                {
                    maximumOffers: 3,

                    excludeCurrentClub:
                        false,

                    reason:
                        "free_agent_interest"
                }
            );

        if (offers.length) {
            return {
                type:
                    "direct_offers",

                offers
            };
        }
    }

    const desiredCategory =
        getDefaultCategoryForAge(
            gameState
                .calendar
                .age
        );

    const candidates =
        gameState.clubs
            .allIds
            .map(
                clubId =>
                    getClub(
                        gameState,
                        clubId
                    )
            )
            .filter(Boolean)
            .filter(
                club =>
                    club
                        .academyCategories
                        .includes(
                            desiredCategory
                        )
            );

    const trialClub =
        weightedPick(
            gameState.rng,
            candidates,
            club =>
                calculateOfferWeight(
                    gameState,
                    club
                )
        );

    if (!trialClub) {
        return {
            type:
                "no_opportunity",

            trials: []
        };
    }

    const trial =
        createAcademyTrial(
            gameState,
            trialClub.id,
            {
                reason:
                    "free_agent_search"
            }
        );

    addTimelineEntry(
        gameState,
        {
            type:
                "academy_trial",

            title:
                `Avaliação no ${trialClub.name}`,

            description:
                `${gameState.player.identity.fullName} ganhou a oportunidade de passar por uma avaliação no ${trialClub.name}.`,

            importance: 6,

            relatedEntities: [
                trialClub.id
            ],

            metadata: {
                trialId:
                    trial?.id
            }
        }
    );

    return {
        type:
            "trial",

        trials:
            trial
                ? [trial]
                : []
    };
}