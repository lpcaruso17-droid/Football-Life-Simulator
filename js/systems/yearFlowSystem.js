import {
    randomInt
} from "../core/rng.js";

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
    FAMILY_EVENTS
} from "../events/family.js";

import {
    CHILDHOOD_EVENTS
} from "../events/childhood.js";

import {
    ACADEMY_EVENTS
} from "../events/academy.js";

import {
    CAREER_EVENTS
} from "../events/career.js";

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


const runtimeFlows =
    new Map();


function createRuntimeKey(
    gameState
) {
    return gameState.save.id;
}


function calculateTargetEvents(
    gameState
) {
    const age =
        gameState.calendar.age;

    let minimum = 2;
    let maximum = 3;

    if (
        age >= 12 &&
        age <= 14
    ) {
        minimum = 3;
        maximum = 4;
    }

    if (
        age >= 15 &&
        age <= 17
    ) {
        minimum = 4;
        maximum = 5;
    }

    if (age >= 18) {
        minimum = 4;
        maximum = 5;
    }

    if (
        !gameState.player
            .football
            .currentClubId
    ) {
        maximum += 1;
    }

    if (
        gameState.housing
            ?.pendingRelocation
    ) {
        minimum += 1;
    }

    minimum =
        Math.min(
            minimum,
            6
        );

    maximum =
        Math.min(
            Math.max(
                minimum,
                maximum
            ),
            6
        );

    return randomInt(
        gameState.rng,
        minimum,
        maximum
    );
}


function distributeEventsAcrossPhases(
    targetEvents
) {
    const distribution = {
        preseason: 0,
        early_season: 0,
        mid_season: 0,
        late_season: 0,
        offseason: 0
    };

    const priorityOrder = [
        "preseason",
        "mid_season",
        "offseason",
        "early_season",
        "late_season"
    ];

    let remaining =
        targetEvents;

    let index = 0;

    while (
        remaining > 0
    ) {
        const phase =
            priorityOrder[
                index %
                priorityOrder.length
            ];

        distribution[
            phase
        ] += 1;

        remaining--;

        index++;
    }

    return distribution;
}


function createRuntimeFlow(
    gameState
) {
    const targetEvents =
        calculateTargetEvents(
            gameState
        );

    return {
        saveId:
            createRuntimeKey(
                gameState
            ),

        year:
            gameState.calendar.year,

        phaseIndex: 0,

        phaseEventCounts: {
            preseason: 0,
            early_season: 0,
            mid_season: 0,
            late_season: 0,
            offseason: 0
        },

        phaseEventTargets:
            distributeEventsAcrossPhases(
                targetEvents
            ),

        targetEvents,

        totalEventsResolved: 0,

        eventsSeen: [],

        currentEvent: null,

        currentEventResolved:
            false,

        completed: false,

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


function getGeneralEventPool(
    gameState
) {
    const pool = [
        ...EDUCATION_EVENTS,
        ...FRIEND_EVENTS,
        ...FAMILY_EVENTS,
        ...CAREER_EVENTS
    ];

    if (
        gameState.calendar.age <=
        13
    ) {
        pool.push(
            ...CHILDHOOD_EVENTS
        );
    }

    if (
        gameState.player
            .football
            .currentClubId
    ) {
        pool.push(
            ...ACADEMY_EVENTS
        );
    }

    return pool;
}


function findForcedHousingEvent(
    gameState,
    flow
) {
    const eligible =
        getEligibleEvents(
            gameState,
            HOUSING_EVENTS,
            {
                excludeEventIds:
                    flow.eventsSeen
            }
        );

    return (
        eligible[0] ??
        null
    );
}


function getProfessionalMilestoneEvents(
    gameState
) {
    if (
        !gameState.player
            .football
            .currentClubId
    ) {
        return [];
    }

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


function choosePhaseEvent(
    gameState,
    flow
) {
    const housingEvent =
        findForcedHousingEvent(
            gameState,
            flow
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
                professionalEvents,
                {
                    excludeEventIds:
                        flow.eventsSeen
                }
            );

        if (professionalEvent) {
            return professionalEvent;
        }
    }


    return drawEvent(
        gameState,
        getGeneralEventPool(
            gameState
        ),
        {
            excludeEventIds:
                flow.eventsSeen
        }
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

        eventsExperienced:
            gameState.eventState
                .recentEvents
                ?.length ??
            0,

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
                gameState.player
                    .football
                    .currentClubId
                    ? `${gameState.player.identity.fullName} encerrou mais um ano de sua história.`
                    : `${gameState.player.identity.fullName} encerrou o ano ainda buscando uma nova oportunidade no futebol.`,

            importance: 4,

            metadata: {
                year:
                    gameState.calendar.year,

                age:
                    gameState.calendar.age,

                eventsExperienced:
                    flow.totalEventsResolved,

                hadClub:
                    Boolean(
                        gameState.player
                            .football
                            .currentClubId
                    )
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


        const target =
            flow.phaseEventTargets[
                phase
            ] ?? 0;

        const completed =
            flow.phaseEventCounts[
                phase
            ] ?? 0;


        if (
            completed <
            target
        ) {
            const event =
                choosePhaseEvent(
                    gameState,
                    flow
                );

            if (event) {
                flow.currentEvent =
                    event;

                flow.currentEventResolved =
                    false;

                return {
                    type:
                        "event",

                    phase,

                    event
                };
            }

            /*
             * Se não houver nenhum
             * evento válido, essa vaga
             * do calendário é ignorada.
             */
            flow.phaseEventCounts[
                phase
            ] =
                target;
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


    const event =
        flow.currentEvent;

    const currentPhase =
        gameState.calendar.phase;


    const resolution =
        resolveEventChoice(
            gameState,
            event,
            choiceId
        );


    if (
        !flow.eventsSeen
            .includes(
                event.id
            )
    ) {
        flow.eventsSeen.push(
            event.id
        );
    }


    flow.totalEventsResolved +=
        1;

    flow.phaseEventCounts[
        currentPhase
    ] =
        (
            flow.phaseEventCounts[
                currentPhase
            ] ??
            0
        ) +
        1;


    flow.currentEventResolved =
        true;

    flow.currentEvent =
        null;


    const target =
        flow.phaseEventTargets[
            currentPhase
        ] ?? 0;

    const completed =
        flow.phaseEventCounts[
            currentPhase
        ] ?? 0;


    if (
        completed >=
        target
    ) {
        flow.phaseIndex +=
            1;
    }


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