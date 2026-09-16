import {
    randomInt,
    pick
} from "../core/rng.js";

import {
    MALE_FIRST_NAMES,
    LAST_NAMES
} from "../data/names.js";

import {
    createPerson,
    addPerson,
    getPerson
} from "./personSystem.js";

import {
    ensureRelationship,
    getRelationship,
    modifyRelationship
} from "./relationshipSystem.js";

import {
    getClub,
    calculateAcademyDevelopmentScore
} from "./academySystem.js";


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


function getTeamScope(
    gameState
) {
    if (
        gameState.player
            .football
            .hasDebutedProfessionally &&
        gameState.professional
            .status ===
            "professional_player"
    ) {
        return "professional";
    }

    return (
        gameState.player
            .football
            .currentCategory ??
        "academy"
    );
}


function generateCoachName(
    gameState
) {
    const firstName =
        pick(
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


function createCoach(
    gameState,
    clubId,
    teamScope
) {
    const club =
        getClub(
            gameState,
            clubId
        );

    if (!club) {
        throw new Error(
            "Clube do treinador não encontrado."
        );
    }

    const coach =
        createPerson({
            fullName:
                generateCoachName(
                    gameState
                ),

            birthYear:
                gameState.calendar.year -
                randomInt(
                    gameState.rng,
                    32,
                    62
                ),

            gender:
                "male",

            roles: [
                "coach"
            ],

            profession:
                "Treinador de futebol",

            personality: {
                ambition:
                    randomInt(
                        gameState.rng,
                        35,
                        95
                    ),

                loyalty:
                    randomInt(
                        gameState.rng,
                        25,
                        90
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
                    ),

                pressure:
                    randomInt(
                        gameState.rng,
                        35,
                        95
                    )
            },

            metadata: {
                clubId,

                teamScope,

                youthTrust:
                    randomInt(
                        gameState.rng,
                        30,
                        95
                    ),

                tacticalAbility:
                    randomInt(
                        gameState.rng,
                        40,
                        92
                    ),

                playerDevelopment:
                    randomInt(
                        gameState.rng,
                        40,
                        95
                    ),

                discipline:
                    randomInt(
                        gameState.rng,
                        35,
                        95
                    ),

                preferredStyle:
                    pick(
                        gameState.rng,
                        [
                            "possession",
                            "direct",
                            "balanced",
                            "pressing",
                            "counter_attack"
                        ]
                    )
            }
        });

    coach.football.currentClubId =
        clubId;

    coach.football.reputation =
        randomInt(
            gameState.rng,
            25,
            80
        );

    addPerson(
        gameState,
        coach
    );

    return coach;
}


export function ensureCurrentCoach(
    gameState
) {
    const clubId =
        gameState.player
            .football
            .currentClubId;

    if (!clubId) {
        return null;
    }

    const teamScope =
        getTeamScope(
            gameState
        );

    const clubState =
        gameState.world
            .clubState[
                clubId
            ] ??
        {};

    if (
        !clubState.coachesByCategory
    ) {
        clubState.coachesByCategory =
            {};
    }

    gameState.world
        .clubState[
            clubId
        ] =
        clubState;

    const existingCoachId =
        clubState
            .coachesByCategory[
                teamScope
            ];

    if (existingCoachId) {
        const existingCoach =
            getPerson(
                gameState,
                existingCoachId
            );

        if (existingCoach) {
            gameState.footballContext
                .currentCoachId =
                existingCoach.id;

            ensureRelationship(
                gameState,
                gameState.player.id,
                existingCoach.id,
                {
                    type: "coach",

                    affection: 45,
                    trust: 45,
                    respect: 50,
                    conflict: 0,
                    loyalty: 35
                }
            );

            return existingCoach;
        }
    }

    const coach =
        createCoach(
            gameState,
            clubId,
            teamScope
        );

    clubState.coachesByCategory[
        teamScope
    ] =
        coach.id;

    gameState.footballContext
        .currentCoachId =
        coach.id;

    ensureRelationship(
        gameState,
        gameState.player.id,
        coach.id,
        {
            type:
                "coach",

            affection:
                randomInt(
                    gameState.rng,
                    35,
                    60
                ),

            trust:
                randomInt(
                    gameState.rng,
                    35,
                    60
                ),

            respect:
                randomInt(
                    gameState.rng,
                    40,
                    65
                ),

            conflict:
                randomInt(
                    gameState.rng,
                    0,
                    15
                ),

            loyalty:
                randomInt(
                    gameState.rng,
                    25,
                    55
                )
        }
    );

    return coach;
}


export function calculateCoachTrust(
    gameState
) {
    const coach =
        ensureCurrentCoach(
            gameState
        );

    if (!coach) {
        gameState.footballContext
            .coachTrust =
            0;

        return 0;
    }

    const relationship =
        getRelationship(
            gameState,
            gameState.player.id,
            coach.id
        );

    const development =
        calculateAcademyDevelopmentScore(
            gameState
        );

    const club =
        getClub(
            gameState,
            gameState.player
                .football
                .currentClubId
        );

    const competition =
        Number(
            club?.competition
        ) || 50;

    const youthTrust =
        Number(
            coach.metadata
                ?.youthTrust
        ) || 50;

    const trust =
        clamp(
            Math.round(
                relationship.trust *
                    0.30 +
                relationship.respect *
                    0.20 +
                development *
                    0.28 +
                youthTrust *
                    0.17 -
                competition *
                    0.08 +
                9
            )
        );

    gameState.footballContext
        .coachTrust =
        trust;

    return trust;
}


export function updateCoachTrustAfterSeason(
    gameState,
    season
) {
    const coach =
        ensureCurrentCoach(
            gameState
        );

    if (!coach) {
        return 0;
    }

    const averageRating =
        Number(
            season.stats
                ?.averageRating
        ) || 0;

    const appearances =
        Number(
            season.stats
                ?.appearances
        ) || 0;

    let trustChange = 0;

    if (averageRating >= 7.4) {
        trustChange += 8;
    } else if (
        averageRating >= 6.9
    ) {
        trustChange += 4;
    } else if (
        averageRating < 6.0 &&
        appearances >= 5
    ) {
        trustChange -= 5;
    }

    if (
        season.teamMatches > 0 &&
        appearances /
            season.teamMatches >=
            0.70
    ) {
        trustChange += 3;
    }

    modifyRelationship(
        gameState,
        gameState.player.id,
        coach.id,
        {
            trust:
                trustChange,

            respect:
                Math.round(
                    trustChange * 0.6
                ),

            conflict:
                trustChange < 0
                    ? Math.abs(
                        trustChange
                    )
                    : -1
        },
        "Desempenho ao longo da temporada."
    );

    return calculateCoachTrust(
        gameState
    );
}