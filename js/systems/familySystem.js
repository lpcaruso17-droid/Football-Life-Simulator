import {
    randomInt,
    chance,
    pick
} from "../core/rng.js";

import {
    MALE_FIRST_NAMES,
    FEMALE_FIRST_NAMES,
    LAST_NAMES
} from "../data/names.js";

import {
    FAMILY_PROFESSIONS
} from "../data/professions.js";

import {
    createPerson,
    addPerson
} from "./personSystem.js";

import {
    ensureRelationship
} from "./relationshipSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


function randomFullName(
    rngState,
    gender,
    lastName = null
) {
    const firstName =
        gender === "female"
            ? pick(
                rngState,
                FEMALE_FIRST_NAMES
            )
            : pick(
                rngState,
                MALE_FIRST_NAMES
            );

    const selectedLastName =
        lastName ??
        pick(
            rngState,
            LAST_NAMES
        );

    return `${firstName} ${selectedLastName}`;
}


function getPlayerLastName(
    playerFullName
) {
    const parts =
        String(
            playerFullName ?? ""
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    return (
        parts[
            parts.length - 1
        ] ||
        "Silva"
    );
}


function generateParentProfession(
    gameState
) {
    const profession =
        pick(
            gameState.rng,
            FAMILY_PROFESSIONS
        );

    if (!profession) {
        return {
            id: "unemployed",
            label: "Desempregado(a)",
            incomeMin: 0,
            incomeMax: 0,
            monthlyIncome: 0
        };
    }

    const monthlyIncome =
        randomInt(
            gameState.rng,
            profession.incomeMin,
            Math.max(
                profession.incomeMin,
                profession.incomeMax
            )
        );

    return {
        ...profession,
        monthlyIncome
    };
}


function createParent(
    gameState,
    {
        role,
        gender,
        lastName,
        playerAge
    }
) {
    const parentAge =
        randomInt(
            gameState.rng,
            playerAge + 20,
            playerAge + 40
        );

    const profession =
        generateParentProfession(
            gameState
        );

    const person =
        createPerson({
            fullName:
                randomFullName(
                    gameState.rng,
                    gender,
                    lastName
                ),

            birthYear:
                gameState.calendar.year -
                parentAge,

            gender,

            roles: [
                role
            ],

            profession:
                profession.label,

            personality: {
                ambition:
                    randomInt(
                        gameState.rng,
                        25,
                        90
                    ),

                loyalty:
                    randomInt(
                        gameState.rng,
                        40,
                        98
                    ),

                temperament:
                    randomInt(
                        gameState.rng,
                        20,
                        90
                    ),

                empathy:
                    randomInt(
                        gameState.rng,
                        30,
                        95
                    ),

                pressure:
                    randomInt(
                        gameState.rng,
                        15,
                        95
                    ),

                financialResponsibility:
                    randomInt(
                        gameState.rng,
                        20,
                        95
                    )
            },

            metadata: {
                monthlyIncome:
                    profession.monthlyIncome,

                professionId:
                    profession.id
            }
        });

    addPerson(
        gameState,
        person
    );

    ensureRelationship(
        gameState,
        gameState.player.id,
        person.id,
        {
            type: role,

            affection:
                randomInt(
                    gameState.rng,
                    55,
                    95
                ),

            trust:
                randomInt(
                    gameState.rng,
                    50,
                    95
                ),

            respect:
                randomInt(
                    gameState.rng,
                    50,
                    95
                ),

            conflict:
                randomInt(
                    gameState.rng,
                    0,
                    30
                ),

            loyalty:
                randomInt(
                    gameState.rng,
                    65,
                    100
                ),

            dependency:
                randomInt(
                    gameState.rng,
                    10,
                    60
                )
        }
    );

    return person;
}


function createSibling(
    gameState,
    {
        lastName,
        playerAge
    }
) {
    const gender =
        chance(
            gameState.rng,
            0.5
        )
            ? "male"
            : "female";

    const siblingAge =
        randomInt(
            gameState.rng,
            Math.max(
                1,
                playerAge - 8
            ),
            playerAge + 8
        );

    const sibling =
        createPerson({
            fullName:
                randomFullName(
                    gameState.rng,
                    gender,
                    lastName
                ),

            birthYear:
                gameState.calendar.year -
                siblingAge,

            gender,

            roles: [
                "sibling"
            ],

            personality: {
                ambition:
                    randomInt(
                        gameState.rng,
                        20,
                        95
                    ),

                loyalty:
                    randomInt(
                        gameState.rng,
                        30,
                        98
                    ),

                temperament:
                    randomInt(
                        gameState.rng,
                        20,
                        90
                    ),

                empathy:
                    randomInt(
                        gameState.rng,
                        20,
                        95
                    )
            },

            metadata: {
                footballInterest:
                    randomInt(
                        gameState.rng,
                        0,
                        100
                    )
            }
        });

    addPerson(
        gameState,
        sibling
    );

    ensureRelationship(
        gameState,
        gameState.player.id,
        sibling.id,
        {
            type:
                "sibling",

            affection:
                randomInt(
                    gameState.rng,
                    45,
                    95
                ),

            trust:
                randomInt(
                    gameState.rng,
                    40,
                    90
                ),

            respect:
                randomInt(
                    gameState.rng,
                    35,
                    90
                ),

            conflict:
                randomInt(
                    gameState.rng,
                    0,
                    45
                ),

            loyalty:
                randomInt(
                    gameState.rng,
                    45,
                    95
                )
        }
    );

    return sibling;
}


export function calculateHouseholdIncome(
    gameState
) {
    return Object.values(
        gameState.people.byId
    )
        .filter(
            person =>
                person.roles.includes(
                    "father"
                ) ||
                person.roles.includes(
                    "mother"
                )
        )
        .reduce(
            (
                total,
                person
            ) =>
                total +
                (
                    Number(
                        person.metadata
                            ?.monthlyIncome
                    ) ||
                    0
                ),
            0
        );
}


export function classifyEconomicLevel(
    monthlyIncome
) {
    if (monthlyIncome <= 2500) {
        return "low";
    }

    if (monthlyIncome <= 6000) {
        return "lower_middle";
    }

    if (monthlyIncome <= 12000) {
        return "middle";
    }

    if (monthlyIncome <= 25000) {
        return "upper_middle";
    }

    return "high";
}


export function generateInitialFamily(
    gameState
) {
    const playerAge =
        gameState.calendar.age;

    const lastName =
        getPlayerLastName(
            gameState.player
                .identity
                .fullName
        );

    const fatherPresent =
        chance(
            gameState.rng,
            0.84
        );

    const motherPresent =
        chance(
            gameState.rng,
            0.94
        );

    const family = {
        fatherId: null,
        motherId: null,
        siblingIds: [],

        parentsTogether:
            fatherPresent &&
            motherPresent
                ? chance(
                    gameState.rng,
                    0.72
                )
                : false,

        householdIncome: 0,

        economicLevel: null
    };

    if (fatherPresent) {
        const father =
            createParent(
                gameState,
                {
                    role:
                        "father",

                    gender:
                        "male",

                    lastName,

                    playerAge
                }
            );

        family.fatherId =
            father.id;
    }

    if (motherPresent) {
        const mother =
            createParent(
                gameState,
                {
                    role:
                        "mother",

                    gender:
                        "female",

                    lastName,

                    playerAge
                }
            );

        family.motherId =
            mother.id;
    }

    const siblingCountRoll =
        randomInt(
            gameState.rng,
            0,
            100
        );

    let siblingCount = 0;

    if (siblingCountRoll >= 35) {
        siblingCount = 1;
    }

    if (siblingCountRoll >= 75) {
        siblingCount = 2;
    }

    if (siblingCountRoll >= 94) {
        siblingCount = 3;
    }

    for (
        let index = 0;
        index < siblingCount;
        index++
    ) {
        const sibling =
            createSibling(
                gameState,
                {
                    lastName,
                    playerAge
                }
            );

        family.siblingIds.push(
            sibling.id
        );
    }

    family.householdIncome =
        calculateHouseholdIncome(
            gameState
        );

    family.economicLevel =
        classifyEconomicLevel(
            family.householdIncome
        );

    gameState.family =
        family;

    addTimelineEntry(
        gameState,
        {
            type:
                "life_origin",

            title:
                "Origem familiar",

            description:
                "A estrutura familiar inicial da vida foi definida.",

            importance: 3,

            relatedEntities: [
                family.fatherId,
                family.motherId,
                ...family.siblingIds
            ].filter(Boolean),

            metadata: {
                economicLevel:
                    family.economicLevel,

                householdIncome:
                    family.householdIncome,

                parentsTogether:
                    family.parentsTogether
            }
        }
    );

    return family;
}