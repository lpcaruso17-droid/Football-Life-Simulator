function createId(prefix = "person") {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return `${prefix}_${crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
}


export function createPerson({
    fullName,
    birthYear,
    gender = "male",

    roles = [],

    nationality = "BR",
    secondNationality = null,

    profession = null,

    alive = true,

    personality = {},

    metadata = {}
} = {}) {
    if (!fullName) {
        throw new Error(
            "Uma pessoa precisa ter nome."
        );
    }

    return {
        id: createId("person"),

        identity: {
            fullName,

            gender,

            birthYear:
                Number.isFinite(
                    Number(birthYear)
                )
                    ? Number(birthYear)
                    : null,

            nationality,

            secondNationality
        },

        roles: Array.from(
            new Set(roles)
        ),

        profession,

        alive,

        deathYear: null,

        personality: {
            ambition:
                personality.ambition ??
                null,

            loyalty:
                personality.loyalty ??
                null,

            temperament:
                personality.temperament ??
                null,

            empathy:
                personality.empathy ??
                null,

            pressure:
                personality.pressure ??
                null,

            financialResponsibility:
                personality.financialResponsibility ??
                null
        },

        football: {
            currentClubId: null,

            formerClubIds: [],

            reputation: 0
        },

        metadata: {
            ...metadata
        },

        createdAt:
            new Date().toISOString()
    };
}


export function addPerson(
    gameState,
    person
) {
    if (!person?.id) {
        throw new Error(
            "Pessoa inválida."
        );
    }

    gameState.people.byId[
        person.id
    ] = person;

    if (
        !gameState.people.allIds.includes(
            person.id
        )
    ) {
        gameState.people.allIds.push(
            person.id
        );
    }

    return person;
}


export function getPerson(
    gameState,
    personId
) {
    return (
        gameState.people
            ?.byId
            ?.[personId] ??
        null
    );
}


export function getPeople(
    gameState
) {
    return (
        gameState.people
            ?.allIds ??
        []
    )
        .map(
            personId =>
                getPerson(
                    gameState,
                    personId
                )
        )
        .filter(Boolean);
}


export function getPeopleByRole(
    gameState,
    role
) {
    return getPeople(
        gameState
    ).filter(
        person =>
            person.roles
                ?.includes(role)
    );
}


export function addRole(
    gameState,
    personId,
    role
) {
    const person =
        getPerson(
            gameState,
            personId
        );

    if (!person) {
        throw new Error(
            "Pessoa não encontrada."
        );
    }

    if (
        !person.roles.includes(role)
    ) {
        person.roles.push(role);
    }

    return person;
}


export function removeRole(
    gameState,
    personId,
    role
) {
    const person =
        getPerson(
            gameState,
            personId
        );

    if (!person) {
        return null;
    }

    person.roles =
        person.roles.filter(
            currentRole =>
                currentRole !== role
        );

    return person;
}


export function updatePerson(
    gameState,
    personId,
    updates = {}
) {
    const person =
        getPerson(
            gameState,
            personId
        );

    if (!person) {
        throw new Error(
            "Pessoa não encontrada."
        );
    }

    Object.assign(
        person,
        updates
    );

    return person;
}


export function getPersonAge(
    person,
    year
) {
    const birthYear =
        person
            ?.identity
            ?.birthYear;

    if (
        !Number.isFinite(
            birthYear
        )
    ) {
        return null;
    }

    return Math.max(
        0,
        year - birthYear
    );
}


export function markPersonDeceased(
    gameState,
    personId,
    deathYear
) {
    const person =
        getPerson(
            gameState,
            personId
        );

    if (!person) {
        throw new Error(
            "Pessoa não encontrada."
        );
    }

    person.alive = false;

    person.deathYear =
        deathYear;

    return person;
}