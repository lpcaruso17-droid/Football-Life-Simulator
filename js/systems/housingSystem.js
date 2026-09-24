import {
    getClub,
    releasePlayerFromClub
} from "./academySystem.js";

import {
    relocateEducationToCity
} from "./educationSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


function getRelocationClub(
    gameState
) {
    const clubId =
        gameState.housing
            ?.clubId ??
        gameState.academy
            ?.currentClubId ??
        gameState.player
            ?.football
            ?.currentClubId ??
        null;

    return clubId
        ? getClub(
            gameState,
            clubId
        )
        : null;
}


export function initializeHousing(
    gameState
) {
    const originCityId =
        gameState.player
            .identity
            .currentCityId;

    gameState.housing = {
        type: "family_home",

        cityId:
            originCityId,

        familyCityId:
            originCityId,

        clubId:
            gameState.academy
                .currentClubId,

        quality: 65,

        familyMoved: false,

        pendingRelocation:
            Boolean(
                gameState.academy
                    .relocationRequired
            ),

        sinceYear:
            gameState.calendar.year,

        history: [
            {
                year:
                    gameState
                        .calendar
                        .year,

                age:
                    gameState
                        .calendar
                        .age,

                type:
                    "family_home",

                cityId:
                    originCityId,

                action:
                    "housing_initialized"
            }
        ]
    };

    return gameState.housing;
}


export function getRelocationOptions(
    gameState
) {
    if (
        !gameState.housing
            .pendingRelocation
    ) {
        return [];
    }

    const options = [
        "family_moves",
        "decline_opportunity"
    ];

    if (
        gameState.calendar.age >= 14
    ) {
        options.splice(
            1,
            0,
            "club_housing"
        );
    }

    return options;
}


export function resolveRelocationDecision(
    gameState,
    decision
) {
    if (
        !gameState.housing
            .pendingRelocation
    ) {
        throw new Error(
            "Não existe mudança pendente."
        );
    }

    const club =
        getRelocationClub(
            gameState
        );

    if (!club) {
        throw new Error(
            "Clube atual não encontrado."
        );
    }

    const allowedOptions =
        getRelocationOptions(
            gameState
        );

    if (
        !allowedOptions.includes(
            decision
        )
    ) {
        throw new Error(
            `Decisão de moradia inválida: ${decision}`
        );
    }

    if (
        decision ===
        "family_moves"
    ) {
        gameState.player
            .identity
            .currentCityId =
            club.cityId;

        gameState.housing.type =
            "family_home";

        gameState.housing.cityId =
            club.cityId;

        gameState.housing.familyCityId =
            club.cityId;

        gameState.housing.clubId =
            club.id;

        gameState.housing
            .familyMoved =
            true;

        gameState.housing
            .pendingRelocation =
            false;

        gameState.academy
            .relocationRequired =
            false;

        gameState.academy
            .housingMode =
            "family_relocated";

        relocateEducationToCity(
            gameState,
            club.cityId,
            {
                reason:
                    "family_relocation"
            }
        );

        gameState.housing
            .history
            .push({
                year:
                    gameState
                        .calendar
                        .year,

                age:
                    gameState
                        .calendar
                        .age,

                action:
                    "family_moved",

                cityId:
                    club.cityId,

                clubId:
                    club.id
            });

        addTimelineEntry(
            gameState,
            {
                type:
                    "family_relocation",

                title:
                    "A família mudou de cidade",

                description:
                    `A família decidiu se mudar para acompanhar a oportunidade no ${club.name}.`,

                importance: 7,

                relatedEntities: [
                    club.id
                ]
            }
        );

        return {
            decision,

            status:
                "resolved"
        };
    }

    if (
        decision ===
        "club_housing"
    ) {
        if (
            gameState.calendar.age <
            14
        ) {
            throw new Error(
                "Alojamento só está disponível a partir dos 14 anos neste sistema."
            );
        }

        gameState.player
            .identity
            .currentCityId =
            club.cityId;

        gameState.housing.type =
            "club_housing";

        gameState.housing.cityId =
            club.cityId;

        gameState.housing.clubId =
            club.id;

        gameState.housing.quality =
            club.housing ?? 60;

        gameState.housing
            .familyMoved =
            false;

        gameState.housing
            .pendingRelocation =
            false;

        gameState.academy
            .relocationRequired =
            false;

        gameState.academy
            .housingMode =
            "club_housing";

        relocateEducationToCity(
            gameState,
            club.cityId,
            {
                reason:
                    "club_housing"
            }
        );

        gameState.housing
            .history
            .push({
                year:
                    gameState
                        .calendar
                        .year,

                age:
                    gameState
                        .calendar
                        .age,

                action:
                    "moved_to_club_housing",

                cityId:
                    club.cityId,

                clubId:
                    club.id,

                quality:
                    gameState.housing
                        .quality
            });

        addTimelineEntry(
            gameState,
            {
                type:
                    "club_housing",

                title:
                    "Mudança para o alojamento",

                description:
                    `${gameState.player.identity.fullName} deixou a casa da família para morar no alojamento do ${club.name}.`,

                importance: 8,

                relatedEntities: [
                    club.id
                ]
            }
        );

        return {
            decision,

            status:
                "resolved"
        };
    }

    if (
        decision ===
        "decline_opportunity"
    ) {
        const clubName =
            club.name;

        releasePlayerFromClub(
            gameState,
            {
                reason:
                    "family_declined_relocation"
            }
        );

        gameState.housing
            .pendingRelocation =
            false;

        gameState.academy
            .relocationRequired =
            false;

        gameState.housing
            .history
            .push({
                year:
                    gameState
                        .calendar
                        .year,

                age:
                    gameState
                        .calendar
                        .age,

                action:
                    "relocation_declined",

                clubId:
                    club.id
            });

        addTimelineEntry(
            gameState,
            {
                type:
                    "opportunity_declined",

                title:
                    "A mudança não aconteceu",

                description:
                    `A família decidiu não seguir com a oportunidade no ${clubName}.`,

                importance: 7,

                relatedEntities: [
                    club.id
                ]
            }
        );

        return {
            decision,

            status:
                "club_left"
        };
    }

    throw new Error(
        "Decisão não tratada."
    );
}


export function relocateProfessionalPlayerToClub(
    gameState,
    club,
    {
        reason =
            "professional_transfer"
    } = {}
) {
    if (
        !club?.id ||
        !club?.cityId
    ) {
        throw new Error(
            "Clube inválido para mudança profissional."
        );
    }

    const previousCityId =
        gameState.player
            ?.identity
            ?.currentCityId ??
        null;

    gameState.housing =
        gameState.housing ??
        {};

    gameState.housing.history =
        Array.isArray(
            gameState.housing.history
        )
            ? gameState.housing.history
            : [];

    if (
        !gameState.housing
            .familyCityId
    ) {
        gameState.housing
            .familyCityId =
            previousCityId;
    }

    gameState.player
        .identity
        .currentCityId =
        club.cityId;

    gameState.housing.type =
        "professional_housing";

    gameState.housing.cityId =
        club.cityId;

    gameState.housing.clubId =
        club.id;

    gameState.housing.quality =
        club.housing ??
        gameState.housing
            .quality ??
        65;

    gameState.housing
        .familyMoved =
        false;

    gameState.housing
        .pendingRelocation =
        false;

    gameState.housing
        .sinceYear =
        gameState.calendar.year;

    if (
        gameState.academy
    ) {
        gameState.academy
            .relocationRequired =
            false;

        gameState.academy
            .housingMode =
            "professional_housing";
    }

    if (
        gameState.education &&
        !gameState.education
            .completedHighSchool &&
        gameState.education
            .cityId !==
            club.cityId
    ) {
        relocateEducationToCity(
            gameState,
            club.cityId,
            {
                reason
            }
        );
    }

    gameState.housing
        .history
        .push({
            year:
                gameState.calendar
                    .year,

            age:
                gameState.calendar
                    .age,

            action:
                "professional_relocation",

            type:
                "professional_housing",

            previousCityId,

            cityId:
                club.cityId,

            clubId:
                club.id,

            reason
        });

    if (
        previousCityId !==
        club.cityId
    ) {
        addTimelineEntry(
            gameState,
            {
                type:
                    "professional_relocation",

                title:
                    "Mudança de cidade",

                description:
                    `${gameState.player.identity.fullName} mudou de cidade para iniciar sua nova etapa profissional no ${club.name}.`,

                importance: 6,

                relatedEntities: [
                    club.id
                ],

                metadata: {
                    previousCityId,

                    cityId:
                        club.cityId,

                    reason
                }
            }
        );
    }

    return {
        previousCityId,

        cityId:
            club.cityId,

        clubId:
            club.id
    };
}


export function getHousingDescription(
    gameState
) {
    if (
        gameState.housing.type ===
        "professional_housing"
    ) {
        return "Moradia na cidade do clube";
    }

    if (
        gameState.housing.type ===
        "club_housing"
    ) {
        return "Alojamento do clube";
    }

    if (
        gameState.housing
            .familyMoved
    ) {
        return "Casa da família após mudança";
    }

    return "Casa da família";
}