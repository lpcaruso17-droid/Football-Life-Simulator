import {
    addTimelineEntry
} from "../systems/timelineSystem.js";


export const YEAR_PHASES = [
    "preseason",
    "early_season",
    "mid_season",
    "late_season",
    "offseason"
];


export function getCurrentPhase(
    gameState
) {
    return (
        gameState
            .calendar
            ?.phase ??
        "preseason"
    );
}


export function setYearPhase(
    gameState,
    phase
) {
    if (
        !YEAR_PHASES.includes(
            phase
        )
    ) {
        throw new Error(
            `Fase do ano inválida: ${phase}`
        );
    }

    gameState.calendar.phase =
        phase;

    return phase;
}


export function beginYear(
    gameState
) {
    gameState
        .calendar
        .seasonStarted = true;

    gameState
        .calendar
        .seasonCompleted = false;

    setYearPhase(
        gameState,
        "preseason"
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "year_started",

            title:
                `Início dos ${gameState.calendar.age} anos`,

            description:
                `Começou o ano de ${gameState.calendar.year}.`,

            importance: 2
        }
    );

    return gameState;
}


export function advancePhase(
    gameState
) {
    const currentPhase =
        getCurrentPhase(
            gameState
        );

    const currentIndex =
        YEAR_PHASES.indexOf(
            currentPhase
        );

    if (
        currentIndex ===
        -1
    ) {
        setYearPhase(
            gameState,
            YEAR_PHASES[0]
        );

        return YEAR_PHASES[0];
    }

    if (
        currentIndex ===
        YEAR_PHASES.length - 1
    ) {
        return null;
    }

    const nextPhase =
        YEAR_PHASES[
            currentIndex + 1
        ];

    setYearPhase(
        gameState,
        nextPhase
    );

    return nextPhase;
}


export function completeYear(
    gameState
) {
    gameState
        .calendar
        .seasonCompleted = true;

    setYearPhase(
        gameState,
        "offseason"
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "year_completed",

            title:
                `Fim dos ${gameState.calendar.age} anos`,

            description:
                `O ano de ${gameState.calendar.year} chegou ao fim.`,

            importance: 3
        }
    );

    return gameState;
}


export function advanceToNextYear(
    gameState
) {
    if (
        !gameState
            .calendar
            .seasonCompleted
    ) {
        throw new Error(
            "O ano atual precisa ser concluído antes de avançar."
        );
    }

    gameState.calendar.year += 1;
    gameState.calendar.age += 1;

    gameState
        .calendar
        .seasonStarted = false;

    gameState
        .calendar
        .seasonCompleted = false;

    setYearPhase(
        gameState,
        "preseason"
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "birthday",

            title:
                `${gameState.calendar.age} anos`,

            description:
                `O personagem completou ${gameState.calendar.age} anos.`,

            importance: 3
        }
    );

    return gameState;
}


export function calculateAge(
    birthYear,
    currentYear
) {
    return Math.max(
        0,
        Number(currentYear) -
        Number(birthYear)
    );
}


export function synchronizePlayerAge(
    gameState
) {
    const birthYear =
        gameState
            .player
            ?.identity
            ?.birthYear;

    if (
        !Number.isFinite(
            Number(birthYear)
        )
    ) {
        return (
            gameState
                .calendar
                .age
        );
    }

    gameState.calendar.age =
        calculateAge(
            birthYear,
            gameState.calendar.year
        );

    return (
        gameState
            .calendar
            .age
    );
}