import {
    randomInt,
    pick
} from "../core/rng.js";

import {
    getCityById
} from "../data/cities.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


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


export function getEducationLevelForAge(
    age
) {
    if (age <= 14) {
        return "fundamental";
    }

    if (age <= 17) {
        return "high_school";
    }

    return "high_school";
}


function generateSchoolName(
    gameState,
    cityId
) {
    const city =
        getCityById(
            cityId
        );

    const cityName =
        city?.name ??
        "Cidade";

    const prefixes = [
        "Escola Municipal",
        "Colégio Estadual",
        "Instituto Educacional",
        "Colégio Comunitário"
    ];

    return `${pick(
        gameState.rng,
        prefixes
    )} de ${cityName}`;
}


export function initializeEducation(
    gameState
) {
    const cityId =
        gameState.player
            .identity
            .currentCityId;

    const level =
        getEducationLevelForAge(
            gameState.calendar.age
        );

    gameState.education = {
        currentLevel:
            level,

        institutionName:
            generateSchoolName(
                gameState,
                cityId
            ),

        cityId,

        performance:
            randomInt(
                gameState.rng,
                55,
                92
            ),

        attendance:
            randomInt(
                gameState.rng,
                88,
                100
            ),

        clubMonitoring:
            Boolean(
                gameState.academy
                    .currentClubId
            ),

        completedHighSchool:
            false,

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

                action:
                    "education_started",

                level,

                cityId
            }
        ]
    };

    addTimelineEntry(
        gameState,
        {
            type:
                "education",

            title:
                "Vida escolar",

            description:
                `${gameState.player.identity.fullName} estuda em ${gameState.education.institutionName}.`,

            importance: 2,

            metadata: {
                level,

                cityId
            }
        }
    );

    return gameState.education;
}


export function relocateEducationToCity(
    gameState,
    cityId,
    {
        reason =
            "relocation"
    } = {}
) {
    const previousSchool =
        gameState.education
            .institutionName;

    gameState.education.cityId =
        cityId;

    gameState.education
        .institutionName =
        generateSchoolName(
            gameState,
            cityId
        );

    gameState.education
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
                "school_change",

            previousSchool,

            newSchool:
                gameState.education
                    .institutionName,

            cityId,

            reason
        });

    addTimelineEntry(
        gameState,
        {
            type:
                "school_change",

            title:
                "Mudança de escola",

            description:
                `${gameState.player.identity.fullName} mudou de escola após uma mudança na rotina de vida.`,

            importance: 4,

            metadata: {
                previousSchool,

                newSchool:
                    gameState.education
                        .institutionName,

                cityId,

                reason
            }
        }
    );

    return gameState.education;
}


export function changeSchoolPerformance(
    gameState,
    amount,
    reason = null
) {
    gameState.education
        .performance =
        clamp(
            gameState.education
                .performance +
            Number(amount)
        );

    if (reason) {
        gameState.education
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
                    "performance_change",

                amount,

                reason
            });
    }

    return gameState.education
        .performance;
}


export function changeAttendance(
    gameState,
    amount,
    reason = null
) {
    gameState.education
        .attendance =
        clamp(
            gameState.education
                .attendance +
            Number(amount)
        );

    if (reason) {
        gameState.education
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
                    "attendance_change",

                amount,

                reason
            });
    }

    return gameState.education
        .attendance;
}


export function getEducationStatus(
    gameState
) {
    const performance =
        gameState.education
            .performance;

    if (performance >= 85) {
        return "Excelente";
    }

    if (performance >= 70) {
        return "Boa";
    }

    if (performance >= 55) {
        return "Regular";
    }

    if (performance >= 40) {
        return "Preocupante";
    }

    return "Crítica";
}