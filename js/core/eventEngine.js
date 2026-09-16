import {
    weightedPick
} from "./rng.js";

import {
    addTimelineEntry
} from "../systems/timelineSystem.js";


const RECENT_EVENT_LIMIT = 8;

const RECENT_THEME_LIMIT = 4;


function ensureEventMemory(
    gameState
) {
    if (
        !gameState.eventState
    ) {
        gameState.eventState = {};
    }

    if (
        !Array.isArray(
            gameState.eventState
                .completed
        )
    ) {
        gameState.eventState
            .completed = [];
    }

    if (
        !gameState.eventState
            .cooldowns
    ) {
        gameState.eventState
            .cooldowns = {};
    }

    if (
        !Array.isArray(
            gameState.eventState
                .recentEvents
        )
    ) {
        gameState.eventState
            .recentEvents = [];
    }

    if (
        !Array.isArray(
            gameState.eventState
                .recentThemes
        )
    ) {
        gameState.eventState
            .recentThemes = [];
    }
}


function isOnCooldown(
    gameState,
    event
) {
    const lastYear =
        gameState.eventState
            .cooldowns[
                event.id
            ];

    if (
        lastYear === undefined ||
        lastYear === null
    ) {
        return false;
    }

    const cooldownYears =
        Number(
            event.cooldownYears
        ) || 0;

    return (
        gameState.calendar.year -
        lastYear <
        cooldownYears
    );
}


function isCompletedOnceOnly(
    gameState,
    event
) {
    return (
        event.onceOnly === true &&
        gameState.eventState
            .completed
            .includes(
                event.id
            )
    );
}


function buildEvent(
    gameState,
    eventDefinition
) {
    if (
        typeof eventDefinition ===
        "function"
    ) {
        return eventDefinition(
            gameState
        );
    }

    return eventDefinition;
}


function filterCurrentYearDuplicates(
    events,
    excludeEventIds
) {
    if (
        !Array.isArray(
            excludeEventIds
        ) ||
        !excludeEventIds.length
    ) {
        return events;
    }

    const alternatives =
        events.filter(
            event =>
                !excludeEventIds
                    .includes(
                        event.id
                    )
        );

    return alternatives.length
        ? alternatives
        : events;
}


function filterRecentEventIds(
    gameState,
    events
) {
    const recent =
        gameState.eventState
            .recentEvents;

    const alternatives =
        events.filter(
            event =>
                !recent.includes(
                    event.id
                )
        );

    return alternatives.length
        ? alternatives
        : events;
}


function filterRecentThemes(
    gameState,
    events
) {
    const recentThemes =
        gameState.eventState
            .recentThemes;

    const alternatives =
        events.filter(
            event => {
                if (!event.theme) {
                    return true;
                }

                return (
                    !recentThemes.includes(
                        event.theme
                    )
                );
            }
        );

    return alternatives.length
        ? alternatives
        : events;
}


function rememberValue(
    array,
    value,
    limit
) {
    if (!value) {
        return;
    }

    const existingIndex =
        array.indexOf(
            value
        );

    if (existingIndex >= 0) {
        array.splice(
            existingIndex,
            1
        );
    }

    array.push(
        value
    );

    while (
        array.length >
        limit
    ) {
        array.shift();
    }
}


function rememberEvent(
    gameState,
    event
) {
    ensureEventMemory(
        gameState
    );

    rememberValue(
        gameState.eventState
            .recentEvents,
        event.id,
        RECENT_EVENT_LIMIT
    );

    rememberValue(
        gameState.eventState
            .recentThemes,
        event.theme,
        RECENT_THEME_LIMIT
    );
}


export function getEligibleEvents(
    gameState,
    eventDefinitions,
    {
        excludeEventIds = []
    } = {}
) {
    ensureEventMemory(
        gameState
    );

    let eligible =
        (
            eventDefinitions ??
            []
        )
            .map(
                definition =>
                    buildEvent(
                        gameState,
                        definition
                    )
            )
            .filter(Boolean)
            .filter(
                event => {
                    const age =
                        gameState.calendar.age;

                    if (
                        event.minAge !==
                            undefined &&
                        age <
                            event.minAge
                    ) {
                        return false;
                    }

                    if (
                        event.maxAge !==
                            undefined &&
                        age >
                            event.maxAge
                    ) {
                        return false;
                    }

                    if (
                        Array.isArray(
                            event.phases
                        ) &&
                        !event.phases
                            .includes(
                                gameState
                                    .calendar
                                    .phase
                            )
                    ) {
                        return false;
                    }

                    if (
                        isCompletedOnceOnly(
                            gameState,
                            event
                        )
                    ) {
                        return false;
                    }

                    if (
                        isOnCooldown(
                            gameState,
                            event
                        )
                    ) {
                        return false;
                    }

                    if (
                        typeof event.canTrigger ===
                            "function" &&
                        !event.canTrigger(
                            gameState
                        )
                    ) {
                        return false;
                    }

                    if (
                        !Array.isArray(
                            event.choices
                        ) ||
                        event.choices
                            .length === 0
                    ) {
                        return false;
                    }

                    return true;
                }
            );

    eligible =
        filterCurrentYearDuplicates(
            eligible,
            excludeEventIds
        );

    eligible =
        filterRecentEventIds(
            gameState,
            eligible
        );

    eligible =
        filterRecentThemes(
            gameState,
            eligible
        );

    return eligible;
}


export function drawEvent(
    gameState,
    eventDefinitions,
    options = {}
) {
    const eligible =
        getEligibleEvents(
            gameState,
            eventDefinitions,
            options
        );

    if (!eligible.length) {
        return null;
    }

    return weightedPick(
        gameState.rng,
        eligible,
        event =>
            Number(
                event.weight
            ) || 1
    );
}


export function resolveEventChoice(
    gameState,
    event,
    choiceId
) {
    ensureEventMemory(
        gameState
    );

    if (!event) {
        throw new Error(
            "Evento inválido."
        );
    }

    const choice =
        event.choices
            ?.find(
                current =>
                    current.id ===
                    choiceId
            );

    if (!choice) {
        throw new Error(
            `Escolha inválida: ${choiceId}`
        );
    }

    let result = null;

    if (
        typeof choice.apply ===
        "function"
    ) {
        result =
            choice.apply(
                gameState,
                event
            );
    }

    gameState.eventState
        .cooldowns[
            event.id
        ] =
        gameState.calendar.year;

    if (
        event.onceOnly &&
        !gameState.eventState
            .completed
            .includes(
                event.id
            )
    ) {
        gameState.eventState
            .completed
            .push(
                event.id
            );
    }

    rememberEvent(
        gameState,
        event
    );

    addTimelineEntry(
        gameState,
        {
            type:
                `event_${event.category ?? "life"}`,

            title:
                event.title,

            description:
                choice.resultText ??
                `Decisão tomada: ${choice.label}.`,

            importance:
                event.importance ??
                4,

            relatedEntities:
                event.relatedEntities ??
                [],

            metadata: {
                eventId:
                    event.id,

                theme:
                    event.theme ??
                    null,

                choiceId:
                    choice.id
            }
        }
    );

    return {
        eventId:
            event.id,

        choiceId:
            choice.id,

        result
    };
}