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
    FOOTBALL_POSITIONS
} from "../data/positions.js";

import {
    createPerson,
    addPerson,
    getPerson
} from "./personSystem.js";

import {
    ensureRelationship,
    getRelationshipsForPerson
} from "./relationshipSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


function randomPersonName(
    gameState,
    gender
) {
    const firstName =
        gender === "female"
            ? pick(
                gameState.rng,
                FEMALE_FIRST_NAMES
            )
            : pick(
                gameState.rng,
                MALE_FIRST_NAMES
            );

    const lastName =
        pick(
            gameState.rng,
            LAST_NAMES
        );

    return `${firstName} ${lastName}`;
}


function createSchoolFriend(
    gameState
) {
    const gender =
        chance(
            gameState.rng,
            0.72
        )
            ? "male"
            : "female";

    const age =
        Math.max(
            6,
            gameState.calendar.age +
            randomInt(
                gameState.rng,
                -1,
                1
            )
        );

    const person =
        createPerson({
            fullName:
                randomPersonName(
                    gameState,
                    gender
                ),

            birthYear:
                gameState.calendar.year -
                age,

            gender,

            roles: [
                "friend",
                "school_friend"
            ],

            personality: {
                ambition:
                    randomInt(
                        gameState.rng,
                        20,
                        90
                    ),

                loyalty:
                    randomInt(
                        gameState.rng,
                        25,
                        95
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
                        25,
                        95
                    )
            },

            metadata: {
                cityId:
                    gameState.player
                        .identity
                        .currentCityId
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
            type:
                "friend",

            affection:
                randomInt(
                    gameState.rng,
                    58,
                    92
                ),

            trust:
                randomInt(
                    gameState.rng,
                    50,
                    90
                ),

            respect:
                randomInt(
                    gameState.rng,
                    45,
                    85
                ),

            conflict:
                randomInt(
                    gameState.rng,
                    0,
                    20
                ),

            loyalty:
                randomInt(
                    gameState.rng,
                    40,
                    90
                )
        }
    );

    return person;
}


function createTeammate(
    gameState
) {
    const age =
        Math.max(
            8,
            gameState.calendar.age +
            randomInt(
                gameState.rng,
                -1,
                1
            )
        );

    const person =
        createPerson({
            fullName:
                randomPersonName(
                    gameState,
                    "male"
                ),

            birthYear:
                gameState.calendar.year -
                age,

            gender:
                "male",

            roles: [
                "teammate",
                "football_player"
            ],

            personality: {
                ambition:
                    randomInt(
                        gameState.rng,
                        30,
                        95
                    ),

                loyalty:
                    randomInt(
                        gameState.rng,
                        20,
                        95
                    ),

                temperament:
                    randomInt(
                        gameState.rng,
                        20,
                        95
                    ),

                empathy:
                    randomInt(
                        gameState.rng,
                        20,
                        90
                    )
            },

            metadata: {
                categoryId:
                    gameState.academy
                        .currentCategory,

                cityId:
                    gameState.player
                        .identity
                        .currentCityId
            }
        });

    person.football.currentClubId =
        gameState.academy
            .currentClubId;

    person.football.reputation =
        randomInt(
            gameState.rng,
            0,
            15
        );

    person.metadata.positionId =
        pick(
            gameState.rng,
            FOOTBALL_POSITIONS
        )?.id ?? "cm";

    addPerson(
        gameState,
        person
    );

    ensureRelationship(
        gameState,
        gameState.player.id,
        person.id,
        {
            type:
                "teammate",

            affection:
                randomInt(
                    gameState.rng,
                    35,
                    80
                ),

            trust:
                randomInt(
                    gameState.rng,
                    30,
                    75
                ),

            respect:
                randomInt(
                    gameState.rng,
                    35,
                    85
                ),

            conflict:
                randomInt(
                    gameState.rng,
                    0,
                    35
                ),

            loyalty:
                randomInt(
                    gameState.rng,
                    25,
                    80
                )
        }
    );

    return person;
}


export function initializeSocialCircle(
    gameState
) {
    gameState.social = {
        closeFriendIds: [],

        friendIds: [],

        teammateIds: [],

        formerTeammateIds: [],

        socialLife:
            randomInt(
                gameState.rng,
                45,
                80
            ),

        history: []
    };

    const friendCount =
        randomInt(
            gameState.rng,
            1,
            2
        );

    for (
        let index = 0;
        index < friendCount;
        index++
    ) {
        const friend =
            createSchoolFriend(
                gameState
            );

        gameState.social
            .friendIds
            .push(
                friend.id
            );

        if (
            gameState.social
                .closeFriendIds
                .length === 0
        ) {
            gameState.social
                .closeFriendIds
                .push(
                    friend.id
                );
        }
    }

    if (
        gameState.academy
            .currentClubId
    ) {
        const teammateCount =
            randomInt(
                gameState.rng,
                3,
                5
            );

        for (
            let index = 0;
            index <
                teammateCount;
            index++
        ) {
            const teammate =
                createTeammate(
                    gameState
                );

            gameState.social
                .teammateIds
                .push(
                    teammate.id
                );
        }
    }

    gameState.social
        .history
        .push({
            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age,

            action:
                "initial_social_circle"
        });

    addTimelineEntry(
        gameState,
        {
            type:
                "social",

            title:
                "Primeiros vínculos sociais",

            description:
                "Amigos e colegas de equipe passam a fazer parte da história.",

            importance: 2
        }
    );

    return gameState.social;
}


export function getCloseFriends(
    gameState
) {
    return (
        gameState.social
            ?.closeFriendIds ??
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


export function getTeammates(
    gameState
) {
    return (
        gameState.social
            ?.teammateIds ??
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


export function getPlayerSocialRelationships(
    gameState
) {
    return getRelationshipsForPerson(
        gameState,
        gameState.player.id
    );
}