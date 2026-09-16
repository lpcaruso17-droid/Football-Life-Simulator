import {
    weightedPick
} from "../core/rng.js";

import {
    CLUBS,
    CLUB_LEVELS,
    ACADEMY_CATEGORIES,
    getClubTemplateById
} from "../data/clubs.js";

import {
    getCityById
} from "../data/cities.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


function average(values) {
    const validValues =
        values.filter(
            value =>
                Number.isFinite(
                    Number(value)
                )
        );

    if (
        validValues.length === 0
    ) {
        return 0;
    }

    return (
        validValues.reduce(
            (
                total,
                value
            ) =>
                total +
                Number(value),
            0
        ) /
        validValues.length
    );
}


function cloneClub(club) {
    return JSON.parse(
        JSON.stringify(club)
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


function closeCurrentClubHistory(
    gameState,
    reason
) {
    const history =
        gameState
            .career
            .clubHistory;

    const openEntry =
        [...history]
            .reverse()
            .find(
                entry =>
                    entry.leftYear ===
                        null
            );

    if (!openEntry) {
        return null;
    }

    openEntry.leftYear =
        gameState.calendar.year;

    openEntry.leftAge =
        gameState.calendar.age;

    openEntry.reasonLeft =
        reason;

    return openEntry;
}


export function initializeClubWorld(
    gameState
) {
    CLUBS.forEach(
        clubTemplate => {
            if (
                gameState.clubs.byId[
                    clubTemplate.id
                ]
            ) {
                return;
            }

            const runtimeClub = {
                ...cloneClub(
                    clubTemplate
                ),

                currentFinances:
                    clubTemplate
                        .financialPower,

                academyInvestment:
                    clubTemplate
                        .academyQuality,

                boardStability: 75,

                currentForm: 50,

                generatedAt:
                    gameState
                        .calendar
                        .year
            };

            gameState.clubs.byId[
                runtimeClub.id
            ] =
                runtimeClub;

            gameState.clubs.allIds.push(
                runtimeClub.id
            );

            gameState.world.clubState[
                runtimeClub.id
            ] = {
                financialHealth:
                    runtimeClub
                        .financialPower,

                academyInvestment:
                    runtimeClub
                        .academyQuality,

                boardStability: 75,

                reputationModifier: 0
            };
        }
    );

    return gameState.clubs;
}


export function getClub(
    gameState,
    clubId
) {
    return (
        gameState.clubs
            ?.byId
            ?.[clubId] ??
        getClubTemplateById(
            clubId
        )
    );
}


export function getDefaultCategoryForAge(
    age
) {
    const numericAge =
        Number(age);

    if (numericAge <= 11) {
        return "u11";
    }

    if (numericAge <= 13) {
        return "u13";
    }

    if (numericAge <= 15) {
        return "u15";
    }

    if (numericAge <= 17) {
        return "u17";
    }

    return "u20";
}


export function getNextCategoryId(
    currentCategoryId
) {
    const index =
        getCategoryIndex(
            currentCategoryId
        );

    if (
        index < 0 ||
        index >=
            ACADEMY_CATEGORIES
                .length - 1
    ) {
        return null;
    }

    return ACADEMY_CATEGORIES[
        index + 1
    ].id;
}


export function findSupportedCategory(
    club,
    preferredCategoryId
) {
    if (!club) {
        return null;
    }

    const supported =
        club.academyCategories ??
        [];

    if (
        supported.includes(
            preferredCategoryId
        )
    ) {
        return preferredCategoryId;
    }

    const preferredIndex =
        getCategoryIndex(
            preferredCategoryId
        );

    const ordered =
        [...supported]
            .sort(
                (a, b) =>
                    Math.abs(
                        getCategoryIndex(a) -
                        preferredIndex
                    ) -
                    Math.abs(
                        getCategoryIndex(b) -
                        preferredIndex
                    )
            );

    return (
        ordered[0] ??
        null
    );
}


export function calculateAcademyDevelopmentScore(
    gameState
) {
    const player =
        gameState.player;

    const position =
        player
            .football
            .position;

    const technicalValues =
        Object.values(
            player
                .attributes
                .technical ??
            {}
        );

    const physicalValues =
        Object.values(
            player
                .attributes
                .physical ??
            {}
        );

    const mentalValues =
        Object.values(
            player
                .attributes
                .mental ??
            {}
        );

    const goalkeeperValues =
        Object.values(
            player
                .attributes
                .goalkeeper ??
            {}
        );

    const technicalAverage =
        position === "gk"
            ? average(
                goalkeeperValues
            )
            : average(
                technicalValues
            );

    const physicalAverage =
        average(
            physicalValues
        );

    const mentalAverage =
        average(
            mentalValues
        );

    const potential =
        Number(
            player
                .hidden
                .potential
        ) || 60;

    const personality =
        player
            .hidden
            .personality ??
        {};

    const mentalityBonus =
        average([
            personality
                .professionalism,

            personality
                .discipline,

            personality
                .resilience,

            personality
                .ambition
        ]);

    const rawScore =
        technicalAverage * 0.34 +
        physicalAverage * 0.20 +
        mentalAverage * 0.20 +
        potential * 0.18 +
        mentalityBonus * 0.08;

    const score =
        Math.max(
            1,
            Math.min(
                99,
                Math.round(
                    rawScore
                )
            )
        );

    gameState.academy
        .developmentScore =
        score;

    return score;
}


function calculateStartingClubWeight(
    gameState,
    club,
    developmentScore,
    desiredCategory
) {
    if (
        !club
            .academyCategories
            .includes(
                desiredCategory
            )
    ) {
        return 0;
    }

    const level =
        CLUB_LEVELS[
            club.level
        ];

    let weight =
        level
            ?.startingWeight ??
        10;

    const playerCityId =
        gameState
            .player
            .identity
            .currentCityId;

    if (
        club.cityId ===
        playerCityId
    ) {
        weight *= 4;
    }

    const playerCity =
        getCityById(
            playerCityId
        );

    const clubCity =
        getCityById(
            club.cityId
        );

    if (
        playerCity &&
        clubCity &&
        playerCity.region ===
            clubCity.region &&
        club.cityId !==
            playerCityId
    ) {
        weight *= 1.5;
    }

    if (
        club.level === "elite"
    ) {
        if (
            developmentScore >= 52
        ) {
            weight *= 1.6;
        } else if (
            developmentScore >= 46
        ) {
            weight *= 0.85;
        } else {
            weight *= 0.35;
        }
    }

    if (
        club.level === "large" &&
        developmentScore >= 44
    ) {
        weight *= 1.35;
    }

    if (
        club.level ===
        "regional"
    ) {
        weight *= 1.25;
    }

    return Math.max(
        0.1,
        weight
    );
}


export function chooseStartingClub(
    gameState
) {
    const desiredCategory =
        getDefaultCategoryForAge(
            gameState
                .calendar
                .age
        );

    const developmentScore =
        calculateAcademyDevelopmentScore(
            gameState
        );

    const candidates =
        CLUBS.filter(
            club =>
                club
                    .academyCategories
                    .includes(
                        desiredCategory
                    )
        );

    return weightedPick(
        gameState.rng,
        candidates,
        club =>
            calculateStartingClubWeight(
                gameState,
                club,
                developmentScore,
                desiredCategory
            )
    );
}


export function assignPlayerToClub(
    gameState,
    clubId,
    {
        categoryId = null,

        reason =
            "initial_assignment",

        startingPath =
            "academy"
    } = {}
) {
    const club =
        getClub(
            gameState,
            clubId
        );

    if (!club) {
        throw new Error(
            `Clube não encontrado: ${clubId}`
        );
    }

    const preferredCategory =
        categoryId ??
        getDefaultCategoryForAge(
            gameState
                .calendar
                .age
        );

    const supportedCategory =
        findSupportedCategory(
            club,
            preferredCategory
        );

    if (!supportedCategory) {
        throw new Error(
            `${club.name} não possui categoria compatível.`
        );
    }

    const previousClubId =
        gameState
            .player
            .football
            .currentClubId;

    const isClubChange =
        Boolean(
            previousClubId &&
            previousClubId !==
                club.id
        );

    if (isClubChange) {
        closeCurrentClubHistory(
            gameState,
            reason
        );
    }

    const playerCityId =
        gameState
            .player
            .identity
            .currentCityId;

    const relocationRequired =
        Boolean(
            playerCityId &&
            club.cityId &&
            playerCityId !==
                club.cityId
        );

    gameState.player
        .football
        .currentClubId =
        club.id;

    gameState.player
        .football
        .currentClubName =
        club.name;

    gameState.player
        .football
        .currentCategory =
        supportedCategory;

    gameState.player
        .football
        .squadStatus =
        "evaluation";

    gameState.academy
        .currentClubId =
        club.id;

    gameState.academy
        .currentCategory =
        supportedCategory;

    gameState.academy
        .joinedYear =
        gameState.calendar.year;

    gameState.academy
        .joinedAge =
        gameState.calendar.age;

    gameState.academy
        .startingPath =
        startingPath;

    gameState.academy
        .relocationRequired =
        relocationRequired;

    gameState.academy
        .housingMode =
        relocationRequired
            ? (
                gameState
                    .calendar
                    .age >= 14
                    ? "pending_housing"
                    : "family_move_required"
            )
            : "family_home";

    gameState.academy
        .evaluationStatus =
        "registered";

    gameState.academy
        .marketStatus =
        "not_available";

    gameState.academy
        .freeAgentSinceYear =
        null;

    gameState.academy.history.push({
        year:
            gameState
                .calendar
                .year,

        age:
            gameState
                .calendar
                .age,

        clubId:
            club.id,

        categoryId:
            supportedCategory,

        action:
            previousClubId
                ? "club_change"
                : "joined_club",

        reason,

        relocationRequired
    });

    if (
        !previousClubId ||
        isClubChange
    ) {
        gameState
            .career
            .clubHistory
            .push({
                clubId:
                    club.id,

                clubName:
                    club.name,

                joinedYear:
                    gameState
                        .calendar
                        .year,

                joinedAge:
                    gameState
                        .calendar
                        .age,

                leftYear: null,

                leftAge: null,

                reasonJoined:
                    reason,

                reasonLeft: null
            });
    }

    gameState
        .career
        .categoryHistory
        .push({
            clubId:
                club.id,

            categoryId:
                supportedCategory,

            year:
                gameState
                    .calendar
                    .year,

            age:
                gameState
                    .calendar
                    .age,

            reason
        });

    addTimelineEntry(
        gameState,
        {
            type:
                isClubChange
                    ? "club_change"
                    : "academy_joined",

            title:
                isClubChange
                    ? `Novo clube: ${club.name}`
                    : `Início no ${club.name}`,

            description:
                `${gameState.player.identity.fullName} passa a integrar o ${club.name} na categoria ${supportedCategory.toUpperCase()}.`,

            importance:
                isClubChange
                    ? 7
                    : 6,

            relatedEntities: [
                club.id
            ],

            metadata: {
                clubId:
                    club.id,

                categoryId:
                    supportedCategory,

                relocationRequired,

                reason
            }
        }
    );

    return {
        club,

        categoryId:
            supportedCategory,

        relocationRequired
    };
}


export function promotePlayerCategory(
    gameState,
    targetCategoryId,
    {
        reason =
            "academy_promotion"
    } = {}
) {
    const club =
        getClub(
            gameState,
            gameState
                .academy
                .currentClubId
        );

    if (!club) {
        throw new Error(
            "O jogador está sem clube."
        );
    }

    if (
        !club.academyCategories
            .includes(
                targetCategoryId
            )
    ) {
        throw new Error(
            `${club.name} não possui ${targetCategoryId}.`
        );
    }

    const previousCategory =
        gameState
            .academy
            .currentCategory;

    gameState.academy
        .currentCategory =
        targetCategoryId;

    gameState.player
        .football
        .currentCategory =
        targetCategoryId;

    gameState.academy.history.push({
        year:
            gameState.calendar.year,

        age:
            gameState.calendar.age,

        clubId:
            club.id,

        categoryId:
            targetCategoryId,

        previousCategory,

        action:
            "category_promotion",

        reason
    });

    gameState
        .career
        .categoryHistory
        .push({
            clubId:
                club.id,

            categoryId:
                targetCategoryId,

            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age,

            reason
        });

    addTimelineEntry(
        gameState,
        {
            type:
                "category_promotion",

            title:
                `Promoção para ${targetCategoryId.toUpperCase()}`,

            description:
                `${gameState.player.identity.fullName} foi promovido de ${previousCategory?.toUpperCase() ?? "categoria anterior"} para ${targetCategoryId.toUpperCase()} no ${club.name}.`,

            importance: 6,

            relatedEntities: [
                club.id
            ],

            metadata: {
                clubId:
                    club.id,

                previousCategory,

                targetCategoryId,

                reason
            }
        }
    );

    return targetCategoryId;
}


export function releasePlayerFromClub(
    gameState,
    {
        reason =
            "academy_release"
    } = {}
) {
    const club =
        getClub(
            gameState,
            gameState
                .academy
                .currentClubId
        );

    if (!club) {
        return null;
    }

    const formerClubId =
        club.id;

    const formerClubName =
        club.name;

    const formerCategory =
        gameState
            .academy
            .currentCategory;

    closeCurrentClubHistory(
        gameState,
        reason
    );

    gameState.player
        .football
        .currentClubId =
        null;

    gameState.player
        .football
        .currentClubName =
        null;

    gameState.player
        .football
        .currentCategory =
        null;

    gameState.player
        .football
        .squadStatus =
        "unattached";

    gameState.academy
        .currentClubId =
        null;

    gameState.academy
        .currentCategory =
        null;

    gameState.academy
        .evaluationStatus =
        "released";

    gameState.academy
        .marketStatus =
        "seeking_club";

    gameState.academy
        .freeAgentSinceYear =
        gameState.calendar.year;

    gameState.academy.history.push({
        year:
            gameState.calendar.year,

        age:
            gameState.calendar.age,

        clubId:
            formerClubId,

        categoryId:
            formerCategory,

        action:
            "released",

        reason
    });

    gameState
        .career
        .freeAgentSpells
        .push({
            startedYear:
                gameState.calendar.year,

            startedAge:
                gameState.calendar.age,

            endedYear: null,

            endedAge: null,

            previousClubId:
                formerClubId,

            reason
        });

    addTimelineEntry(
        gameState,
        {
            type:
                "academy_release",

            title:
                `Dispensado pelo ${formerClubName}`,

            description:
                `${gameState.player.identity.fullName} deixou as categorias de base do ${formerClubName}.`,

            importance: 8,

            relatedEntities: [
                formerClubId
            ],

            metadata: {
                clubId:
                    formerClubId,

                categoryId:
                    formerCategory,

                reason
            }
        }
    );

    return {
        clubId:
            formerClubId,

        clubName:
            formerClubName,

        categoryId:
            formerCategory
    };
}


export function initializeAcademyCareer(
    gameState,
    {
        preferredClubId = null
    } = {}
) {
    initializeClubWorld(
        gameState
    );

    calculateAcademyDevelopmentScore(
        gameState
    );

    let club = null;

    if (preferredClubId) {
        club =
            getClub(
                gameState,
                preferredClubId
            );

        if (!club) {
            throw new Error(
                `Clube inicial inválido: ${preferredClubId}`
            );
        }
    } else {
        club =
            chooseStartingClub(
                gameState
            );
    }

    if (!club) {
        throw new Error(
            "Não foi possível definir um clube inicial."
        );
    }

    return assignPlayerToClub(
        gameState,
        club.id,
        {
            reason:
                preferredClubId
                    ? "player_choice"
                    : "generated_start",

            startingPath:
                preferredClubId
                    ? "chosen_club"
                    : "generated_academy"
        }
    );
}


export function getCurrentAcademySituation(
    gameState
) {
    const club =
        getClub(
            gameState,
            gameState
                .academy
                .currentClubId
        );

    return {
        club,

        categoryId:
            gameState
                .academy
                .currentCategory,

        developmentScore:
            gameState
                .academy
                .developmentScore,

        recognition:
            gameState
                .academy
                .recognition,

        marketStatus:
            gameState
                .academy
                .marketStatus,

        relocationRequired:
            gameState
                .academy
                .relocationRequired,

        housingMode:
            gameState
                .academy
                .housingMode,

        evaluationStatus:
            gameState
                .academy
                .evaluationStatus
    };
}