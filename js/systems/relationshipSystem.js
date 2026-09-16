function clamp(
    value,
    min = 0,
    max = 100
) {
    return Math.max(
        min,
        Math.min(
            max,
            Number(value) || 0
        )
    );
}


function createRelationshipId(
    personAId,
    personBId
) {
    return [
        personAId,
        personBId
    ]
        .sort()
        .join("__");
}


export function createRelationship({
    personAId,
    personBId,

    type = "acquaintance",

    affection = 50,
    trust = 50,
    respect = 50,
    conflict = 0,
    loyalty = 50,
    dependency = 0,

    tags = []
}) {
    if (
        !personAId ||
        !personBId
    ) {
        throw new Error(
            "Relacionamento precisa de duas pessoas."
        );
    }

    if (
        personAId ===
        personBId
    ) {
        throw new Error(
            "Uma pessoa não pode criar relacionamento consigo mesma."
        );
    }

    return {
        id:
            createRelationshipId(
                personAId,
                personBId
            ),

        personAId,
        personBId,

        type,

        affection:
            clamp(affection),

        trust:
            clamp(trust),

        respect:
            clamp(respect),

        conflict:
            clamp(conflict),

        loyalty:
            clamp(loyalty),

        dependency:
            clamp(dependency),

        tags:
            Array.from(
                new Set(tags)
            ),

        history: [],

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };
}


export function addRelationship(
    gameState,
    relationship
) {
    gameState
        .relationships
        .byId[
            relationship.id
        ] =
        relationship;

    return relationship;
}


export function getRelationship(
    gameState,
    personAId,
    personBId
) {
    const relationshipId =
        createRelationshipId(
            personAId,
            personBId
        );

    return (
        gameState
            .relationships
            ?.byId
            ?.[relationshipId] ??
        null
    );
}


export function ensureRelationship(
    gameState,
    personAId,
    personBId,
    options = {}
) {
    const existing =
        getRelationship(
            gameState,
            personAId,
            personBId
        );

    if (existing) {
        return existing;
    }

    const relationship =
        createRelationship({
            personAId,
            personBId,
            ...options
        });

    addRelationship(
        gameState,
        relationship
    );

    return relationship;
}


export function modifyRelationship(
    gameState,
    personAId,
    personBId,
    changes = {},
    context = null
) {
    const relationship =
        ensureRelationship(
            gameState,
            personAId,
            personBId
        );

    const fields = [
        "affection",
        "trust",
        "respect",
        "conflict",
        "loyalty",
        "dependency"
    ];

    fields.forEach(
        field => {
            if (
                changes[field] ===
                undefined
            ) {
                return;
            }

            relationship[field] =
                clamp(
                    relationship[field] +
                    Number(
                        changes[field]
                    )
                );
        }
    );

    relationship.updatedAt =
        new Date().toISOString();

    if (context) {
        relationship.history.push({
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

            context,

            changes: {
                ...changes
            }
        });
    }

    return relationship;
}


export function addRelationshipTag(
    gameState,
    personAId,
    personBId,
    tag
) {
    const relationship =
        ensureRelationship(
            gameState,
            personAId,
            personBId
        );

    if (
        !relationship.tags.includes(
            tag
        )
    ) {
        relationship.tags.push(
            tag
        );
    }

    return relationship;
}


export function describeRelationship(
    relationship
) {
    if (!relationship) {
        return "Sem relação";
    }

    const positiveScore =
        (
            relationship.affection +
            relationship.trust +
            relationship.respect +
            relationship.loyalty
        ) / 4;

    const adjustedScore =
        positiveScore -
        relationship.conflict * 0.4;

    if (adjustedScore >= 85) {
        return "Excelente";
    }

    if (adjustedScore >= 70) {
        return "Muito boa";
    }

    if (adjustedScore >= 55) {
        return "Boa";
    }

    if (adjustedScore >= 40) {
        return "Instável";
    }

    if (adjustedScore >= 25) {
        return "Ruim";
    }

    return "Muito ruim";
}


export function getRelationshipsForPerson(
    gameState,
    personId
) {
    return Object.values(
        gameState
            .relationships
            ?.byId ??
        {}
    ).filter(
        relationship =>
            relationship.personAId ===
                personId ||
            relationship.personBId ===
                personId
    );
}