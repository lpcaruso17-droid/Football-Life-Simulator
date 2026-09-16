import {
    weightedPick
} from "./rng.js";

import {
    addTimelineEntry
} from "../systems/timelineSystem.js";


const RECENT_EVENT_LIMIT = 5;


function ensureEventMemory(
    gameState
) {
    if (
        !gameState.eventState
    ) {
        gameState.eventState = {
            completed: [],
            cooldowns: {},
            activeChains: {},
            completedChains: [],
            flags: {}
        };
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
}


function isOnCooldown(
    gameState,
    event
) {
    const lastYear =
        gameState.eventState
            ?.cooldowns
            ?.[event.id];

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


function filterRecentEvents(
    gameState,
    events
) {
    const recent =
        gameState.eventState
            .recentEvents ??
        [];

    const freshEvents =
        events.filter(
            event =>
                !recent.includes(
                    event.id
                )
        );

    /*
     * Só bloqueamos eventos recentes
     * quando existe alternativa.
     *
     * Assim evitamos repetição,
     * mas também evitamos ficar
     * sem nenhum evento possível.
     */
    return freshEvents.length
        ? freshEvents
        : events;
}


function rememberEvent(
    gameState,
    eventId
) {
    ensureEventMemory(
        gameState
    );

    const recent =
        gameState.eventState
            .recentEvents;

    const existingIndex =
        recent.indexOf(
            eventId
        );

    if (existingIndex >= 0) {
        recent.splice(
            existingIndex,
            1
        );
    }

    recent.push(
        eventId
    );

    while (
        recent.length >
        RECENT_EVENT_LIMIT
    ) {
        recent.shift();
    }
}


export function getEligibleEvents(
    gameState,
    eventDefinitions
) {
    ensureEventMemory(
        gameState
    );

    const eligible =
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
                        !event.choices
                            .length
                    ) {
                        return false;
                    }

                    return true;
                }
            );

    return filterRecentEvents(
        gameState,
        eligible
    );
}


export function drawEvent(
    gameState,
    eventDefinitions
) {
    const eligible =
        getEligibleEvents(
            gameState,
            eventDefinitions
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

    /*
     * O efeito da decisão acontece
     * antes de marcarmos o evento
     * como concluído.
     *
     * Se o efeito falhar, o jogo
     * não grava uma decisão inválida.
     */
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
        event.id
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