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
    drawNarrativeItem,
    resolveEventChoice,
    resolveEventNotification
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
    PROFESSIONAL_LIFE_EVENTS
} from "../events/professionalLife.js";

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

    if (
        age >= 18 &&
        age <= 24
    ) {
        minimum = 4;
        maximum = 6;
    }

    if (
        age >= 25
    ) {
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
            7
        );

    return randomInt(
        gameState.rng,
        minimum,
        maximum
    );
}


function distributeEventsAcrossPhases(
    total
) {
    const result = {
        preseason: 0,
        early_season: 0,
        mid_season: 0,
        late_season: 0,
        offseason: 0
    };

    const order = [
        "preseason",
        "mid_season",
        "offseason",
        "early_season",
        "late_season"
    ];

    let remaining =
        total;

    let index = 0;

    while (
        remaining > 0
    ) {
        const phase =
            order[
                index %
                order.length
            ];

        result[
            phase
        ] += 1;

        remaining -= 1;
        index += 1;
    }

    return result;
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

        currentKind: null,

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


function isProfessional(
    gameState
) {
    return Boolean(
        gameState.player
            .football
            .isProfessional ||
        gameState.player
            .football
            .hasDebutedProfessionally
    );
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
            .currentClubId &&
        !isProfessional(
            gameState
        )
    ) {
        pool.push(
            ...ACADEMY_EVENTS
        );
    }

    if (
        isProfessional(
            gameState
        )
    ) {
        pool.push(
            ...PROFESSIONAL_LIFE_EVENTS
        );
    }

    return pool;
}


function getForcedHousingItem(
    gameState,
    flow
) {
    if (
        !gameState.housing
            ?.pendingRelocation
    ) {
        return null;
    }

    return drawNarrativeItem(
        gameState,
        HOUSING_EVENTS,
        {
            excludeEventIds:
                flow.eventsSeen
        }
    );
}


function getProfessionalMilestoneItem(
    gameState,
    flow
) {
    if (
        !gameState.player
            .football
            .currentClubId
    ) {
        return null;
    }

    return drawNarrativeItem(
        gameState,
        PROFESSIONAL_EVENTS,
        {
            excludeEventIds:
                flow.eventsSeen
        }
    );
}


function chooseNarrativeItem(
    gameState,
    flow
) {
    const housing =
        getForcedHousingItem(
            gameState,
            flow
        );

    if (housing) {
        return housing;
    }


    const milestone =
        getProfessionalMilestoneItem(
            gameState,
            flow
        );

    if (milestone) {
        return milestone;
    }


    return drawNarrativeItem(
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
    flow,
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
            flow.totalEventsResolved,

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


    const isAcademyPlayer =
        Boolean(
            gameState.academy
                .currentClubId
        ) &&
        !gameState.player
            .football
            .hasDebutedProfessionally;


    if (isAcademyPlayer) {
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
            flow,
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
                    gameState.calendar
                        .year,

                age:
                    gameState.calendar
                        .age,

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


function completeCurrentNarrativeItem(
    gameState,
    flow
) {
    const phase =
        gameState.calendar
            .phase;

    const event =
        flow.currentEvent;

    if (
        event &&
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
        phase
    ] =
        (
            flow.phaseEventCounts[
                phase
            ] ??
            0
        ) +
        1;

    flow.currentEvent =
        null;

    flow.currentKind =
        null;


    const target =
        flow.phaseEventTargets[
            phase
        ] ?? 0;

    const completed =
        flow.phaseEventCounts[
            phase
        ] ?? 0;

    if (
        completed >=
        target
    ) {
        flow.phaseIndex +=
            1;
    }
}


export function startYearFlow(
    gameState
) {
    return getNextYearStep(
        gameState,
        getOrCreateRuntimeFlow(
            gameState
        )
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
        flow.currentEvent
    ) {
        return {
            type:
                flow.currentKind ===
                    "notification"
                    ? "notification"
                    : "event",

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
            const item =
                chooseNarrativeItem(
                    gameState,
                    flow
                );

            if (item) {
                flow.currentEvent =
                    item.event;

                flow.currentKind =
                    item.kind;

                return {
                    type:
                        item.kind ===
                            "notification"
                            ? "notification"
                            : "event",

                    phase,

                    event:
                        item.event
                };
            }

            /*
             * Nenhum conteúdo válido
             * para esta fase.
             *
             * Não inventamos um evento
             * apenas para preencher espaço.
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
        !flow.currentEvent ||
        flow.currentKind !==
            "decision"
    ) {
        throw new Error(
            "Nenhuma decisão está aguardando resposta."
        );
    }

    const resolution =
        resolveEventChoice(
            gameState,
            flow.currentEvent,
            choiceId
        );

    completeCurrentNarrativeItem(
        gameState,
        flow
    );

    return {
        resolution,

        nextStep:
            getNextYearStep(
                gameState,
                flow
            )
    };
}


export function resolveCurrentYearNotification(
    gameState
) {
    const flow =
        getOrCreateRuntimeFlow(
            gameState
        );

    if (
        !flow.currentEvent ||
        flow.currentKind !==
            "notification"
    ) {
        throw new Error(
            "Nenhuma notificação está aguardando continuação."
        );
    }

    const resolution =
        resolveEventNotification(
            gameState,
            flow.currentEvent
        );

    completeCurrentNarrativeItem(
        gameState,
        flow
    );

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