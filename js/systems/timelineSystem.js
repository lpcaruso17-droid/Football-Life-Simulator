function createId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return `timeline_${crypto.randomUUID()}`;
    }

    return `timeline_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
}


export function addTimelineEntry(
    gameState,
    {
        type = "life_event",

        title,
        description = "",

        importance = 5,

        relatedEntities = [],

        metadata = {}
    }
) {
    if (!title) {
        throw new Error(
            "Entrada da timeline precisa de título."
        );
    }

    const entry = {
        id: createId(),

        year:
            gameState
                .calendar
                ?.year ??
            null,

        age:
            gameState
                .calendar
                ?.age ??
            null,

        phase:
            gameState
                .calendar
                ?.phase ??
            null,

        type,

        title,

        description,

        importance:
            Math.max(
                1,
                Math.min(
                    10,
                    Number(
                        importance
                    ) || 5
                )
            ),

        relatedEntities:
            [...relatedEntities],

        metadata: {
            ...metadata
        },

        createdAt:
            new Date().toISOString()
    };

    gameState.timeline.push(
        entry
    );

    return entry;
}


export function getTimeline(
    gameState
) {
    return [
        ...(gameState.timeline ?? [])
    ].sort(
        (a, b) => {
            if (
                a.year !==
                b.year
            ) {
                return (
                    a.year -
                    b.year
                );
            }

            return (
                new Date(
                    a.createdAt
                ) -
                new Date(
                    b.createdAt
                )
            );
        }
    );
}


export function getTimelineByYear(
    gameState,
    year
) {
    return getTimeline(
        gameState
    ).filter(
        entry =>
            entry.year === year
    );
}


export function getImportantTimeline(
    gameState,
    minimumImportance = 7
) {
    return getTimeline(
        gameState
    ).filter(
        entry =>
            entry.importance >=
            minimumImportance
    );
}


export function hasTimelineType(
    gameState,
    type
) {
    return (
        gameState.timeline ??
        []
    ).some(
        entry =>
            entry.type === type
    );
}


export function hasTimelineMetadata(
    gameState,
    key,
    value
) {
    return (
        gameState.timeline ??
        []
    ).some(
        entry =>
            entry
                ?.metadata
                ?.[key] ===
            value
    );
}