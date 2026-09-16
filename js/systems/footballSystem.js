import {
    randomInt,
    randomFloat,
    chance,
    pick
} from "../core/rng.js";

import {
    getClub,
    calculateAcademyDevelopmentScore
} from "./academySystem.js";

import {
    calculateAcademyRecognition
} from "./academyCareerSystem.js";

import {
    ensureCurrentCoach,
    calculateCoachTrust,
    updateCoachTrustAfterSeason
} from "./coachSystem.js";

import {
    applySeasonDevelopment
} from "./developmentSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


function createId(prefix) {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID ===
            "function"
    ) {
        return `${prefix}_${crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
}


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


function roundRating(value) {
    return Number(
        Math.max(
            4.5,
            Math.min(
                9.8,
                value
            )
        ).toFixed(1)
    );
}


function average(values) {
    const valid =
        values.filter(
            value =>
                Number.isFinite(
                    Number(value)
                )
        );

    if (!valid.length) {
        return 0;
    }

    return (
        valid.reduce(
            (
                total,
                value
            ) =>
                total +
                Number(value),
            0
        ) /
        valid.length
    );
}


function getCompetitionName(
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
        return "Liga Nacional";
    }

    const category =
        gameState.player
            .football
            .currentCategory ??
        "u20";

    const names = {
        u11:
            "Liga de Formação Sub-11",

        u13:
            "Liga de Formação Sub-13",

        u15:
            "Liga Nacional Sub-15",

        u17:
            "Liga Nacional Sub-17",

        u20:
            "Liga Nacional Sub-20"
    };

    return (
        names[category] ??
        "Competição de Base"
    );
}


function getTeamMatchRange(
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
        return [
            30,
            44
        ];
    }

    const category =
        gameState.player
            .football
            .currentCategory;

    const ranges = {
        u11: [12, 18],
        u13: [14, 20],
        u15: [16, 23],
        u17: [20, 28],
        u20: [22, 32]
    };

    return (
        ranges[category] ??
        [18, 26]
    );
}


function calculateRelevantSkill(
    gameState
) {
    const player =
        gameState.player;

    const position =
        player.football
            .position;

    const t =
        player.attributes
            .technical;

    const p =
        player.attributes
            .physical;

    const m =
        player.attributes
            .mental;

    const g =
        player.attributes
            .goalkeeper;

    const maps = {
        gk: [
            g.reflexes,
            g.handling,
            g.oneOnOne,
            g.aerial,
            m.concentration,
            m.positioning
        ],

        rb: [
            t.crossing,
            t.tackling,
            t.marking,
            p.pace,
            p.stamina,
            m.positioning
        ],

        lb: [
            t.crossing,
            t.tackling,
            t.marking,
            p.pace,
            p.stamina,
            m.positioning
        ],

        cb: [
            t.marking,
            t.tackling,
            t.heading,
            p.strength,
            p.jumping,
            m.concentration
        ],

        dm: [
            t.passing,
            t.tackling,
            t.marking,
            m.positioning,
            m.decisions,
            p.stamina
        ],

        cm: [
            t.passing,
            t.firstTouch,
            t.dribbling,
            m.vision,
            m.decisions,
            p.stamina
        ],

        rw: [
            t.dribbling,
            t.crossing,
            t.finalization,
            p.pace,
            p.acceleration,
            m.decisions
        ],

        lw: [
            t.dribbling,
            t.crossing,
            t.finalization,
            p.pace,
            p.acceleration,
            m.decisions
        ],

        st: [
            t.finalization,
            t.heading,
            t.firstTouch,
            p.strength,
            m.composure,
            m.positioning
        ]
    };

    return average(
        maps[position] ??
        maps.cm
    );
}


function determinePositionCompetition(
    gameState,
    club
) {
    const competition =
        Number(
            club?.competition
        ) || 50;

    let competitors = 1;

    if (competition >= 70) {
        competitors++;
    }

    if (competition >= 88) {
        competitors++;
    }

    if (
        chance(
            gameState.rng,
            0.35
        )
    ) {
        competitors++;
    }

    return Math.min(
        4,
        competitors
    );
}


export function determineSquadStatus(
    gameState
) {
    const coachTrust =
        calculateCoachTrust(
            gameState
        );

    const development =
        calculateAcademyDevelopmentScore(
            gameState
        );

    const recognition =
        calculateAcademyRecognition(
            gameState
        );

    const competition =
        gameState.footballContext
            .positionCompetition ||
        1;

    const score =
        coachTrust * 0.50 +
        development * 0.35 +
        recognition * 0.15 -
        competition * 2;

    let status =
        "fringe";

    if (score >= 68) {
        status =
            "key_player";
    } else if (
        score >= 58
    ) {
        status =
            "starter";
    } else if (
        score >= 46
    ) {
        status =
            "rotation";
    } else if (
        score >= 34
    ) {
        status =
            "reserve";
    }

    gameState.player
        .football
        .squadStatus =
        status;

    return status;
}


function getAppearanceProbability(
    squadStatus
) {
    const probabilities = {
        fringe: 0.24,
        reserve: 0.43,
        rotation: 0.68,
        starter: 0.88,
        key_player: 0.96
    };

    return (
        probabilities[
            squadStatus
        ] ??
        0.50
    );
}


function getStartingProbability(
    squadStatus
) {
    const probabilities = {
        fringe: 0.10,
        reserve: 0.18,
        rotation: 0.45,
        starter: 0.82,
        key_player: 0.93
    };

    return (
        probabilities[
            squadStatus
        ] ??
        0.35
    );
}


function generateMatchStats(
    gameState,
    {
        rating,
        teamGoals,
        opponentGoals
    }
) {
    const position =
        gameState.player
            .football
            .position;

    const stats = {
        goals: 0,
        assists: 0,

        tackles: 0,
        interceptions: 0,
        clearances: 0,

        keyPasses: 0,
        shotsOnTarget: 0,

        saves: 0,
        cleanSheets: 0,
        goalsConceded: 0,
        penaltiesSaved: 0,

        yellowCards: 0,
        redCards: 0
    };

    if (position === "gk") {
        stats.goalsConceded =
            opponentGoals;

        stats.cleanSheets =
            opponentGoals === 0
                ? 1
                : 0;

        stats.saves =
            randomInt(
                gameState.rng,
                1,
                Math.max(
                    2,
                    Math.round(
                        3 +
                        rating
                    )
                )
            );

        if (
            chance(
                gameState.rng,
                0.04
            )
        ) {
            stats.penaltiesSaved = 1;
        }

        return stats;
    }

    let goalChance = 0.04;
    let assistChance = 0.06;

    if (position === "st") {
        goalChance = 0.27;
        assistChance = 0.10;
    }

    if (
        position === "rw" ||
        position === "lw"
    ) {
        goalChance = 0.16;
        assistChance = 0.17;
    }

    if (position === "cm") {
        goalChance = 0.08;
        assistChance = 0.16;
    }

    if (position === "dm") {
        goalChance = 0.04;
        assistChance = 0.09;
    }

    if (
        position === "rb" ||
        position === "lb"
    ) {
        goalChance = 0.025;
        assistChance = 0.11;
    }

    if (position === "cb") {
        goalChance = 0.035;
        assistChance = 0.025;
    }

    goalChance *=
        0.65 +
        rating / 10;

    assistChance *=
        0.65 +
        rating / 10;

    if (
        teamGoals > 0 &&
        chance(
            gameState.rng,
            goalChance
        )
    ) {
        stats.goals = 1;

        if (
            teamGoals >= 3 &&
            chance(
                gameState.rng,
                0.08
            )
        ) {
            stats.goals++;
        }
    }

    if (
        teamGoals > 0 &&
        chance(
            gameState.rng,
            assistChance
        )
    ) {
        stats.assists = 1;
    }

    if (
        [
            "rb",
            "lb",
            "cb",
            "dm"
        ].includes(position)
    ) {
        stats.tackles =
            randomInt(
                gameState.rng,
                1,
                6
            );

        stats.interceptions =
            randomInt(
                gameState.rng,
                0,
                5
            );

        stats.clearances =
            randomInt(
                gameState.rng,
                0,
                position === "cb"
                    ? 7
                    : 4
            );
    }

    if (
        [
            "cm",
            "dm",
            "rw",
            "lw"
        ].includes(position)
    ) {
        stats.keyPasses =
            randomInt(
                gameState.rng,
                0,
                4
            );
    }

    if (
        [
            "st",
            "rw",
            "lw",
            "cm"
        ].includes(position)
    ) {
        stats.shotsOnTarget =
            randomInt(
                gameState.rng,
                0,
                position === "st"
                    ? 5
                    : 3
            );
    }

    if (
        chance(
            gameState.rng,
            0.08
        )
    ) {
        stats.yellowCards = 1;
    }

    if (
        chance(
            gameState.rng,
            0.008
        )
    ) {
        stats.redCards = 1;
    }

    return stats;
}


function addStats(
    target,
    source
) {
    Object.keys(
        source
    ).forEach(
        key => {
            if (
                typeof source[key] ===
                "number"
            ) {
                target[key] =
                    (
                        target[key] ??
                        0
                    ) +
                    source[key];
            }
        }
    );
}


function getOpponentPool(
    gameState,
    currentClubId
) {
    return gameState.clubs
        .allIds
        .filter(
            clubId =>
                clubId !==
                currentClubId
        )
        .map(
            clubId =>
                getClub(
                    gameState,
                    clubId
                )
        )
        .filter(Boolean);
}


export function simulateFootballSeason(
    gameState
) {
    const club =
        getClub(
            gameState,
            gameState.player
                .football
                .currentClubId
        );

    if (!club) {
        throw new Error(
            "Não é possível simular temporada sem clube."
        );
    }

    ensureCurrentCoach(
        gameState
    );

    gameState.footballContext
        .positionCompetition =
        determinePositionCompetition(
            gameState,
            club
        );

    const squadStatusBefore =
        determineSquadStatus(
            gameState
        );

    const range =
        getTeamMatchRange(
            gameState
        );

    const teamMatches =
        randomInt(
            gameState.rng,
            range[0],
            range[1]
        );

    const appearanceProbability =
        getAppearanceProbability(
            squadStatusBefore
        );

    const startProbability =
        getStartingProbability(
            squadStatusBefore
        );

    const opponentPool =
        getOpponentPool(
            gameState,
            club.id
        );

    const relevantSkill =
        calculateRelevantSkill(
            gameState
        );

    const matches = [];

    const aggregateStats = {
        appearances: 0,
        starts: 0,
        minutes: 0,

        averageRating: 0,

        goals: 0,
        assists: 0,

        tackles: 0,
        interceptions: 0,
        clearances: 0,

        keyPasses: 0,
        shotsOnTarget: 0,

        saves: 0,
        cleanSheets: 0,
        goalsConceded: 0,
        penaltiesSaved: 0,

        yellowCards: 0,
        redCards: 0
    };

    const ratings = [];

    for (
        let index = 0;
        index < teamMatches;
        index++
    ) {
        const opponent =
            pick(
                gameState.rng,
                opponentPool
            );

        const teamGoals =
            randomInt(
                gameState.rng,
                0,
                4
            );

        const opponentGoals =
            randomInt(
                gameState.rng,
                0,
                4
            );

        const played =
            chance(
                gameState.rng,
                appearanceProbability
            );

        if (!played) {
            matches.push({
                matchNumber:
                    index + 1,

                opponent:
                    opponent?.name ??
                    "Adversário",

                teamGoals,
                opponentGoals,

                played: false,

                started: false,

                minutes: 0,

                rating: null,

                stats: null
            });

            continue;
        }

        const started =
            chance(
                gameState.rng,
                startProbability
            );

        const minutes =
            started
                ? randomInt(
                    gameState.rng,
                    58,
                    90
                )
                : randomInt(
                    gameState.rng,
                    8,
                    36
                );

        const formModifier =
            (
                gameState
                    .footballContext
                    .form -
                50
            ) / 55;

        let rating =
            5.75 +
            (
                relevantSkill -
                35
            ) / 32 +
            formModifier +
            randomFloat(
                gameState.rng,
                -0.65,
                0.75
            );

        let matchStats =
            generateMatchStats(
                gameState,
                {
                    rating,
                    teamGoals,
                    opponentGoals
                }
            );

        rating +=
            matchStats.goals *
            0.45;

        rating +=
            matchStats.assists *
            0.25;

        rating +=
            matchStats.cleanSheets *
            0.18;

        if (
            matchStats.saves >= 6
        ) {
            rating += 0.20;
        }

        rating =
            roundRating(
                rating
            );

        aggregateStats
            .appearances++;

        aggregateStats
            .minutes +=
            minutes;

        if (started) {
            aggregateStats
                .starts++;
        }

        addStats(
            aggregateStats,
            matchStats
        );

        ratings.push(
            rating
        );

        matches.push({
            matchNumber:
                index + 1,

            opponent:
                opponent?.name ??
                "Adversário",

            teamGoals,
            opponentGoals,

            played: true,

            started,

            minutes,

            rating,

            stats:
                matchStats
        });
    }

    aggregateStats
        .averageRating =
        ratings.length
            ? Number(
                average(
                    ratings
                ).toFixed(2)
            )
            : 0;

    const recentRatings =
        ratings.slice(
            -5
        );

    const recentAverage =
        recentRatings.length
            ? average(
                recentRatings
            )
            : 5.8;

    gameState.footballContext
        .form =
        clamp(
            Math.round(
                (
                    recentAverage -
                    4.5
                ) /
                5 *
                100
            ),
            20,
            95
        );

    const seasonId =
        createId(
            "season"
        );

    const season = {
        id: seasonId,

        year:
            gameState.calendar.year,

        age:
            gameState.calendar.age,

        clubId:
            club.id,

        clubName:
            club.name,

        category:
            gameState.player
                .football
                .currentCategory,

        competition:
            getCompetitionName(
                gameState
            ),

        position:
            gameState.player
                .football
                .position,

        coachId:
            gameState.footballContext
                .currentCoachId,

        squadStatusBefore,

        squadStatusAfter:
            null,

        positionCompetition:
            gameState
                .footballContext
                .positionCompetition,

        teamMatches,

        matches,

        stats:
            aggregateStats,

        development: null
    };

    updateCoachTrustAfterSeason(
        gameState,
        season
    );

    season.squadStatusAfter =
        determineSquadStatus(
            gameState
        );

    season.development =
        applySeasonDevelopment(
            gameState,
            season
        );

    const recognitionGain =
        Math.max(
            0,
            Math.round(
                aggregateStats
                    .appearances *
                    0.30 +
                Math.max(
                    0,
                    aggregateStats
                        .averageRating -
                    6
                ) *
                    4
            )
        );

    gameState.academy
        .recognition =
        clamp(
            gameState.academy
                .recognition +
            recognitionGain
        );

    gameState.reputation
        .overall =
        clamp(
            gameState.reputation
                .overall +
            Math.round(
                recognitionGain *
                0.35
            )
        );

    gameState.seasons
        .byId[
            seasonId
        ] =
        season;

    gameState.seasons
        .allIds
        .push(
            seasonId
        );

    gameState.footballContext
        .currentSeasonId =
        seasonId;

    gameState.footballContext
        .lastSeasonSummary =
        {
            year:
                season.year,

            clubName:
                season.clubName,

            appearances:
                season.stats
                    .appearances,

            starts:
                season.stats
                    .starts,

            minutes:
                season.stats
                    .minutes,

            averageRating:
                season.stats
                    .averageRating,

            goals:
                season.stats
                    .goals,

            assists:
                season.stats
                    .assists,

            status:
                season
                    .squadStatusAfter
        };

    gameState.footballContext
        .history
        .push({
            year:
                season.year,

            seasonId,

            coachId:
                season.coachId,

            squadStatusBefore:
                season
                    .squadStatusBefore,

            squadStatusAfter:
                season
                    .squadStatusAfter,

            positionCompetition:
                season
                    .positionCompetition
        });

    addTimelineEntry(
        gameState,
        {
            type:
                "season_completed",

            title:
                `Temporada ${season.year} concluída`,

            description:
                `${gameState.player.identity.fullName} terminou a temporada com ${season.stats.appearances} jogos e média ${season.stats.averageRating}.`,

            importance: 5,

            relatedEntities: [
                club.id,
                season.coachId
            ].filter(Boolean),

            metadata: {
                seasonId,

                appearances:
                    season.stats
                        .appearances,

                averageRating:
                    season.stats
                        .averageRating,

                squadStatus:
                    season
                        .squadStatusAfter
            }
        }
    );

    return season;
}


export function getCurrentSeason(
    gameState
) {
    const seasonId =
        gameState.footballContext
            .currentSeasonId;

    if (!seasonId) {
        return null;
    }

    return (
        gameState.seasons
            .byId[
                seasonId
            ] ??
        null
    );
}


export function getSeasonHistory(
    gameState
) {
    return gameState.seasons
        .allIds
        .map(
            seasonId =>
                gameState.seasons
                    .byId[
                        seasonId
                    ]
        )
        .filter(Boolean)
        .sort(
            (a, b) =>
                a.year -
                b.year
        );
}