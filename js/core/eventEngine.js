import {
    weightedPick
} from "./rng.js";

import {
    addTimelineEntry
} from "../systems/timelineSystem.js";


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


export function getEligibleEvents(
    gameState,
    eventDefinitions
) {
    return (
        eventDefinitions ?? []
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
                    !event.phases.includes(
                        gameState.calendar
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

                return true;
            }
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
                event.importance ?? 4,

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