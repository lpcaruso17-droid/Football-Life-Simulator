export const YEAR_PHASES = [
    "preseason",
    "early_season",
    "mid_season",
    "late_season",
    "offseason"
];


export const PHASE_LABELS = {
    preseason:
        "Pré-temporada",

    early_season:
        "Início da temporada",

    mid_season:
        "Meio da temporada",

    late_season:
        "Reta final",

    offseason:
        "Fim de temporada"
};


export function getCurrentPhase(
    gameState
) {
    return (
        gameState.calendar
            .phase ??
        YEAR_PHASES[0]
    );
}


export function getPhaseLabel(
    phase
) {
    return (
        PHASE_LABELS[phase] ??
        phase
    );
}


export function setPhase(
    gameState,
    phase
) {
    if (
        !YEAR_PHASES.includes(
            phase
        )
    ) {
        throw new Error(
            `Fase inválida: ${phase}`
        );
    }

    gameState.calendar.phase =
        phase;

    return phase;
}


export function beginYear(
    gameState
) {
    gameState.calendar.phase =
        "preseason";

    gameState.calendar
        .seasonStarted =
        true;

    gameState.calendar
        .seasonCompleted =
        false;

    return gameState.calendar;
}


export function advancePhase(
    gameState
) {
    const currentIndex =
        YEAR_PHASES.indexOf(
            gameState.calendar.phase
        );

    if (
        currentIndex < 0
    ) {
        gameState.calendar.phase =
            YEAR_PHASES[0];

        return gameState.calendar.phase;
    }

    if (
        currentIndex >=
        YEAR_PHASES.length - 1
    ) {
        return null;
    }

    gameState.calendar.phase =
        YEAR_PHASES[
            currentIndex + 1
        ];

    return gameState.calendar.phase;
}


export function completeYear(
    gameState
) {
    gameState.calendar
        .seasonCompleted =
        true;

    return gameState.calendar;
}


export function calculateAge(
    gameState,
    year =
        gameState.calendar.year
) {
    const birthYear =
        gameState.player
            .identity
            .birthYear;

    if (
        !Number.isFinite(
            Number(birthYear)
        )
    ) {
        return gameState.calendar.age;
    }

    return (
        Number(year) -
        Number(birthYear)
    );
}


export function synchronizePlayerAge(
    gameState
) {
    gameState.calendar.age =
        calculateAge(
            gameState
        );

    return gameState.calendar.age;
}


export function advanceToNextYear(
    gameState
) {
    gameState.calendar.year +=
        1;

    synchronizePlayerAge(
        gameState
    );

    gameState.calendar.phase =
        "preseason";

    gameState.calendar
        .seasonStarted =
        false;

    gameState.calendar
        .seasonCompleted =
        false;

    return gameState.calendar;
}