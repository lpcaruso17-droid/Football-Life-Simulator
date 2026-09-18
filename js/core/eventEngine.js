import {
    weightedPick
} from "./rng.js";

import {
    addTimelineEntry
} from "../systems/timelineSystem.js";


const RECENT_EVENT_LIMIT = 10;
const RECENT_THEME_LIMIT = 5;
const RECENT_PERSON_LIMIT = 6;
const EVENT_HISTORY_LIMIT = 50;


function ensureEventMemory(
    gameState
) {
    if (
        !gameState.eventState ||
        typeof gameState.eventState !==
            "object"
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

    if (
        !Array.isArray(
            gameState.eventState
                .recentPeople
        )
    ) {
        gameState.eventState
            .recentPeople = [];
    }

    if (
        !Array.isArray(
            gameState.eventState
                .history
        )
    ) {
        gameState.eventState
            .history = [];
    }
}


function isPersonId(
    gameState,
    id
) {
    if (!id) {
        return false;
    }

    const people =
        gameState.people;

    if (
        Array.isArray(
            people
        )
    ) {
        return people.some(
            person =>
                person?.id === id
        );
    }

    if (
        people &&
        typeof people ===
            "object"
    ) {
        if (
            people[id]
        ) {
            return true;
        }

        if (
            people.byId?.[id]
        ) {
            return true;
        }

        if (
            Array.isArray(
                people.list
            )
        ) {
            return people.list
                .some(
                    person =>
                        person?.id ===
                        id
                );
        }
    }

    return false;
}


function getEventPeople(
    gameState,
    event
) {
    const ids = new Set();

    (
        event.personIds ??
        []
    ).forEach(
        id => {
            if (id) {
                ids.add(id);
            }
        }
    );

    (
        event.relatedPeople ??
        []
    ).forEach(
        id => {
            if (id) {
                ids.add(id);
            }
        }
    );

    (
        event.relatedEntities ??
        []
    ).forEach(
        id => {
            if (
                isPersonId(
                    gameState,
                    id
                )
            ) {
                ids.add(id);
            }
        }
    );

    return [
        ...ids
    ];
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

    if (
        existingIndex >= 0
    ) {
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
    event,
    resolutionType
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

    getEventPeople(
        gameState,
        event
    ).forEach(
        personId => {
            rememberValue(
                gameState.eventState
                    .recentPeople,
                personId,
                RECENT_PERSON_LIMIT
            );
        }
    );

    gameState.eventState
        .history
        .push({
            eventId:
                event.id,

            theme:
                event.theme ??
                null,

            year:
                gameState.calendar
                    .year,

            age:
                gameState.calendar
                    .age,

            people:
                getEventPeople(
                    gameState,
                    event
                ),

            resolutionType
        });

    while (
        gameState.eventState
            .history
            .length >
        EVENT_HISTORY_LIMIT
    ) {
        gameState.eventState
            .history
            .shift();
    }
}


function buildEvent(
    gameState,
    definition
) {
    if (
        typeof definition ===
        "function"
    ) {
        return definition(
            gameState
        );
    }

    return definition;
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
        lastYear ===
            undefined ||
        lastYear === null
    ) {
        return false;
    }

    const cooldown =
        Number(
            event.cooldownYears
        ) || 0;

    return (
        gameState.calendar.year -
        lastYear <
        cooldown
    );
}


function isOnceOnlyCompleted(
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


function passesBaseRequirements(
    gameState,
    event
) {
    if (!event?.id) {
        return false;
    }

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
                gameState.calendar
                    .phase
            )
    ) {
        return false;
    }

    if (
        isOnceOnlyCompleted(
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


export function getEventKind(
    event
) {
    if (
        event?.kind ===
        "notification"
    ) {
        return "notification";
    }

    const choices =
        event?.choices ??
        [];

    /*
     * Uma única opção não é
     * uma decisão real.
     *
     * Esses casos passam a ser
     * tratados como notificação.
     */
    if (
        choices.length <= 1
    ) {
        return "notification";
    }

    return "decision";
}


function calculateDynamicWeight(
    gameState,
    event,
    excludeEventIds = []
) {
    ensureEventMemory(
        gameState
    );

    let weight =
        Math.max(
            0.01,
            Number(
                event.weight
            ) || 1
        );

    /*
     * Mesmo evento recentemente:
     * penalidade extremamente forte.
     */
    if (
        gameState.eventState
            .recentEvents
            .includes(
                event.id
            )
    ) {
        weight *= 0.12;
    }

    /*
     * Mesmo tema recentemente:
     * reduz bastante a chance,
     * sem tornar impossível.
     */
    if (
        event.theme &&
        gameState.eventState
            .recentThemes
            .includes(
                event.theme
            )
    ) {
        weight *= 0.38;
    }

    /*
     * NPC utilizado recentemente.
     *
     * Isso resolve casos como
     * Guilherme aparecer em vários
     * acontecimentos consecutivos.
     */
    const people =
        getEventPeople(
            gameState,
            event
        );

    const recentPeopleCount =
        people.filter(
            id =>
                gameState.eventState
                    .recentPeople
                    .includes(
                        id
                    )
        ).length;

    if (
        recentPeopleCount >
        0
    ) {
        weight *=
            Math.pow(
                0.32,
                recentPeopleCount
            );
    }

    /*
     * Não repetir o mesmo evento
     * dentro do mesmo ano se houver
     * outras opções.
     */
    if (
        excludeEventIds
            .includes(
                event.id
            )
    ) {
        weight *= 0.04;
    }

    if (
        typeof event.weightModifier ===
            "function"
    ) {
        const modifier =
            Number(
                event.weightModifier(
                    gameState
                )
            );

        if (
            Number.isFinite(
                modifier
            )
        ) {
            weight *=
                Math.max(
                    0,
                    modifier
                );
        }
    }

    return Math.max(
        0.001,
        weight
    );
}


export function getEligibleNarrativeItems(
    gameState,
    eventDefinitions
) {
    ensureEventMemory(
        gameState
    );

    return (
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
            event =>
                passesBaseRequirements(
                    gameState,
                    event
                )
        )
        .filter(
            event => {
                const kind =
                    getEventKind(
                        event
                    );

                if (
                    kind ===
                    "decision"
                ) {
                    return (
                        Array.isArray(
                            event.choices
                        ) &&
                        event.choices
                            .length >=
                            2
                    );
                }

                return (
                    typeof event.apply ===
                        "function" ||
                    (
                        Array.isArray(
                            event.choices
                        ) &&
                        event.choices
                            .length ===
                            1
                    )
                );
            }
        );
}


export function drawNarrativeItem(
    gameState,
    eventDefinitions,
    {
        excludeEventIds = []
    } = {}
) {
    const eligible =
        getEligibleNarrativeItems(
            gameState,
            eventDefinitions
        );

    if (
        !eligible.length
    ) {
        return null;
    }

    const event =
        weightedPick(
            gameState.rng,
            eligible,
            current =>
                calculateDynamicWeight(
                    gameState,
                    current,
                    excludeEventIds
                )
        );

    if (!event) {
        return null;
    }

    return {
        kind:
            getEventKind(
                event
            ),

        event
    };
}


export function getEligibleEvents(
    gameState,
    eventDefinitions
) {
    return getEligibleNarrativeItems(
        gameState,
        eventDefinitions
    ).filter(
        event =>
            getEventKind(
                event
            ) ===
            "decision"
    );
}


export function drawEvent(
    gameState,
    eventDefinitions,
    {
        excludeEventIds = []
    } = {}
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
            calculateDynamicWeight(
                gameState,
                event,
                excludeEventIds
            )
    );
}


function finishEventRecord(
    gameState,
    event,
    description,
    resolutionType,
    metadata = {}
) {
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
        event,
        resolutionType
    );

    addTimelineEntry(
        gameState,
        {
            type:
                `event_${event.category ?? "life"}`,

            title:
                event.title,

            description,

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

                resolutionType,

                ...metadata
            }
        }
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

    const choices =
        event.choices ??
        [];

    if (
        choices.length <
        2
    ) {
        throw new Error(
            "Este acontecimento é uma notificação, não uma decisão."
        );
    }

    const choice =
        choices.find(
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

    finishEventRecord(
        gameState,
        event,
        choice.resultText ??
            `Decisão tomada: ${choice.label}.`,
        "decision",
        {
            choiceId:
                choice.id
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


export function resolveEventNotification(
    gameState,
    event
) {
    ensureEventMemory(
        gameState
    );

    if (!event) {
        throw new Error(
            "Notificação inválida."
        );
    }

    let result = null;

    if (
        typeof event.apply ===
        "function"
    ) {
        result =
            event.apply(
                gameState,
                event
            );
    } else {
        const onlyChoice =
            event.choices?.[0];

        if (
            typeof onlyChoice
                ?.apply ===
                "function"
        ) {
            result =
                onlyChoice.apply(
                    gameState,
                    event
                );
        }
    }

    const onlyChoice =
        event.choices?.[0];

    finishEventRecord(
        gameState,
        event,
        event.resultText ??
            onlyChoice?.resultText ??
            event.description ??
            event.title,
        "notification"
    );

    return {
        eventId:
            event.id,

        result
    };
}