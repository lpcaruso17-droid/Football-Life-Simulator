import {
    YEAR_PHASES,
    beginYear,
    setPhase,
    completeYear,
    advanceToNextYear
} from "../core/timeEngine.js";

import {
    drawEvent,
    getEligibleEvents,
    resolveEventChoice
} from "../core/eventEngine.js";

import {
    HOUSING_EVENTS
} from "../events/housing.js";

import {
    EDUCATION_EVENTS
} from "../events/education.js";

import {
    FRIEND_EVENTS
} from "../events/friends.js";

import {
    PROFESSIONAL_EVENTS
} from "../events/professional.js";

import {
    simulateFootballSeason
} from "./footballSystem.js";

import {
    resolveAnnualAcademyEvaluation
} from "./academyCareerSystem.js";

import {
    updateContractStatus
} from "./contractSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


function createRuntimeKey(
    gameState
) {
    return gameState.save.id;
}


const runtimeFlows =
    new Map();


function createRuntimeFlow(
    gameState
) {
    return {
        saveId:
            createRuntimeKey(
                gameState
            ),

        year:
            gameState.calendar.year,

        phaseIndex: 0,

        currentEvent: null,

        currentEventResolved:
            false,

        completed:
            false,

        summary: null
    };
}


function getOrCreateRuntimeFlow(
    gameState
) {
    const key =
        createRuntimeKey(
            gameState
        );

    const existing =
        runtimeFlows.get(
            key
        );

    if (
        existing &&
        existing.year ===
            gameState.calendar.year &&
        !existing.completed
    ) {
        return existing;
    }

    const created =
        createRuntimeFlow(
            gameState
        );

    runtimeFlows.set(
        key,
        created
    );

    beginYear(
        gameState
    );

    return created;
}


function getGeneralEventPool() {
    return [
        ...EDUCATION_EVENTS,
        ...FRIEND_EVENTS
    ];
}


function getProfessionalMilestoneEvents(
    gameState
) {
    return PROFESSIONAL_EVENTS
        .map(
            definition =>
                typeof definition ===
                    "function"
                    ? definition(
                        gameState
                    )
                    : definition
        )
        .filter(Boolean)
        .filter(
            event =>
                event.category ===
                    "professional"
        );
}


function findForcedHousingEvent(
    gameState
) {
    const eligible =
        getEligibleEvents(
            gameState,
            HOUSING_EVENTS
        );

    return (
        eligible[0] ??
        null
    );
}


function choosePhaseEvent(
    gameState
) {
    const housingEvent =
        findForcedHousingEvent(
            gameState
        );

    if (housingEvent) {
        return housingEvent;
    }

    const professionalEvents =
        getProfessionalMilestoneEvents(
            gameState
        );

    if (
        professionalEvents.length
    ) {
        const professionalEvent =
            drawEvent(
                gameState,
                professionalEvents
            );

        if (professionalEvent) {
            return professionalEvent;
        }
    }

    return drawEvent(
        gameState,
        getGeneralEventPool()
    );
}


function shouldHaveLifeEvent(
    gameState,
    phaseIndex
) {
    const age =
        gameState.calendar.age;

    const basePattern = [
        true,
        age >= 11,
        true,
        age >= 13,
        true
    ];

    return (
        basePattern[
            phaseIndex
        ] ??
        true
    );
}


function createYearSummary(
    gameState,
    {
        season = null,
        academyDecision = null
    } = {}
) {
    return {
        completedYear:
            gameState.calendar.year,

        completedAge:
            gameState.calendar.age,

        clubName:
            gameState.player
                .football
                .currentClubName,

        category:
            gameState.player
                .football
                .currentCategory,

        season,

        academyDecision,

        happiness:
            gameState.player
                .life
                .happiness,

        health:
            gameState.player
                .life
                .generalHealth,

        education:
            gameState.education
                .performance,

        reputation:
            gameState.reputation
                .overall
    };
}


function finalizeYear(
    gameState,
    flow
) {
    let season = null;

    let academyDecision =
        null;


    if (
        gameState.player
            .football
            .currentClubId
    ) {
        season =
            simulateFootballSeason(
                gameState
            );
    }


    const isStillAcademyPlayer =
        Boolean(
            gameState.academy
                .currentClubId
        ) &&
        !gameState.player
            .football
            .hasDebutedProfessionally;


    if (isStillAcademyPlayer) {
        academyDecision =
            resolveAnnualAcademyEvaluation(
                gameState
            );
    }


    updateContractStatus(
        gameState
    );


    completeYear(
        gameState
    );


    const summary =
        createYearSummary(
            gameState,
            {
                season,

                academyDecision
            }
        );


    addTimelineEntry(
        gameState,
        {
            type:
                "year_completed",

            title:
                `Fim de ${gameState.calendar.year}`,

            description:
                `${gameState.player.identity.fullName} encerrou mais um ano de sua história.`,

            importance: 4,

            metadata: {
                year:
                    gameState.calendar.year,

                age:
                    gameState.calendar.age
            }
        }
    );


    advanceToNextYear(
        gameState
    );


    flow.completed =
        true;

    flow.summary =
        summary;

    return {
        type:
            "year_complete",

        summary
    };
}


export function startYearFlow(
    gameState
) {
    const flow =
        getOrCreateRuntimeFlow(
            gameState
        );

    return getNextYearStep(
        gameState,
        flow
    );
}


export function getNextYearStep(
    gameState,
    providedFlow = null
) {
    const flow =
        providedFlow ??
        getOrCreateRuntimeFlow(
            gameState
        );


    if (
        flow.completed
    ) {
        return {
            type:
                "year_complete",

            summary:
                flow.summary
        };
    }


    if (
        flow.currentEvent &&
        !flow
            .currentEventResolved
    ) {
        return {
            type:
                "event",

            phase:
                gameState.calendar
                    .phase,

            event:
                flow.currentEvent
        };
    }


    while (
        flow.phaseIndex <
        YEAR_PHASES.length
    ) {
        const phase =
            YEAR_PHASES[
                flow.phaseIndex
            ];

        setPhase(
            gameState,
            phase
        );


        flow.currentEvent =
            null;

        flow.currentEventResolved =
            false;


        if (
            shouldHaveLifeEvent(
                gameState,
                flow.phaseIndex
            )
        ) {
            const event =
                choosePhaseEvent(
                    gameState
                );

            if (event) {
                flow.currentEvent =
                    event;

                return {
                    type:
                        "event",

                    phase,

                    event
                };
            }
        }


        flow.phaseIndex +=
            1;
    }


    return finalizeYear(
        gameState,
        flow
    );
}


export function resolveCurrentYearEvent(
    gameState,
    choiceId
) {
    const flow =
        getOrCreateRuntimeFlow(
            gameState
        );


    if (
        !flow.currentEvent
    ) {
        throw new Error(
            "Nenhum evento aguardando decisão."
        );
    }


    const resolution =
        resolveEventChoice(
            gameState,
            flow.currentEvent,
            choiceId
        );


    flow.currentEventResolved =
        true;

    flow.currentEvent =
        null;

    flow.phaseIndex +=
        1;


    return {
        resolution,

        nextStep:
            getNextYearStep(
                gameState,
                flow
            )
    };
}


export function getActiveYearFlow(
    gameState
) {
    return (
        runtimeFlows.get(
            createRuntimeKey(
                gameState
            )
        ) ??
        null
    );
}


export function clearYearFlow(
    gameState
) {
    runtimeFlows.delete(
        createRuntimeKey(
            gameState
        )
    );
}