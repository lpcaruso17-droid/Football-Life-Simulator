import {
    randomInt,
    chance,
    pick
} from "../core/rng.js";

import {
    BRAZILIAN_CITIES
} from "../data/cities.js";

import {
    FOOTBALL_POSITIONS
} from "../data/positions.js";


function clamp(
    value,
    min = 1,
    max = 99
) {
    return Math.max(
        min,
        Math.min(
            max,
            Number(value) || min
        )
    );
}


function generateHeight(
    rngState,
    age,
    positionId
) {
    const ageRanges = {
        10: [130, 155],
        11: [133, 160],
        12: [138, 166],
        13: [143, 173],
        14: [150, 180],
        15: [156, 186],
        16: [160, 190],
        17: [162, 194],
        18: [164, 198]
    };

    const range =
        ageRanges[age] ??
        [165, 190];

    let height =
        randomInt(
            rngState,
            range[0],
            range[1]
        );

    if (
        positionId === "gk" ||
        positionId === "cb"
    ) {
        height +=
            randomInt(
                rngState,
                2,
                6
            );
    }

    return height;
}


function generateWeight(
    rngState,
    height,
    age
) {
    const approximate =
        (
            height - 100
        ) *
        (
            age < 14
                ? 0.66
                : 0.78
        );

    return Math.max(
        25,
        Math.round(
            approximate +
            randomInt(
                rngState,
                -4,
                5
            )
        )
    );
}


function generatePersonality(
    rngState
) {
    return {
        professionalism:
            randomInt(
                rngState,
                20,
                90
            ),

        discipline:
            randomInt(
                rngState,
                20,
                90
            ),

        ambition:
            randomInt(
                rngState,
                25,
                95
            ),

        resilience:
            randomInt(
                rngState,
                25,
                95
            ),

        loyalty:
            randomInt(
                rngState,
                20,
                95
            ),

        sociability:
            randomInt(
                rngState,
                20,
                95
            ),

        ego:
            randomInt(
                rngState,
                10,
                90
            ),

        adaptability:
            randomInt(
                rngState,
                20,
                95
            ),

        intelligence:
            randomInt(
                rngState,
                30,
                95
            )
    };
}


function generateStartingAttributes(
    rngState,
    positionId
) {
    const base = {};

    [
        "finalization",
        "passing",
        "dribbling",
        "crossing",
        "heading",
        "marking",
        "tackling",
        "firstTouch",
        "longShots",
        "setPieces"
    ].forEach(
        attribute => {
            base[attribute] =
                randomInt(
                    rngState,
                    20,
                    45
                );
        }
    );


    const physical = {
        pace:
            randomInt(
                rngState,
                28,
                52
            ),

        acceleration:
            randomInt(
                rngState,
                28,
                52
            ),

        strength:
            randomInt(
                rngState,
                18,
                42
            ),

        stamina:
            randomInt(
                rngState,
                22,
                48
            ),

        agility:
            randomInt(
                rngState,
                28,
                52
            ),

        jumping:
            randomInt(
                rngState,
                22,
                48
            )
    };


    const mental = {
        vision:
            randomInt(
                rngState,
                22,
                48
            ),

        decisions:
            randomInt(
                rngState,
                20,
                44
            ),

        concentration:
            randomInt(
                rngState,
                20,
                48
            ),

        positioning:
            randomInt(
                rngState,
                20,
                48
            ),

        composure:
            randomInt(
                rngState,
                20,
                48
            ),

        determination:
            randomInt(
                rngState,
                28,
                58
            ),

        teamwork:
            randomInt(
                rngState,
                25,
                55
            ),

        leadership:
            randomInt(
                rngState,
                18,
                48
            )
    };


    const goalkeeper = {
        reflexes:
            randomInt(
                rngState,
                25,
                48
            ),

        handling:
            randomInt(
                rngState,
                22,
                46
            ),

        oneOnOne:
            randomInt(
                rngState,
                22,
                46
            ),

        aerial:
            randomInt(
                rngState,
                20,
                45
            ),

        rushingOut:
            randomInt(
                rngState,
                20,
                44
            ),

        distribution:
            randomInt(
                rngState,
                20,
                44
            ),

        kicking:
            randomInt(
                rngState,
                20,
                44
            )
    };


    if (positionId === "st") {
        base.finalization += 10;
        base.heading += 6;
        mental.composure += 6;
    }


    if (
        positionId === "rw" ||
        positionId === "lw"
    ) {
        base.dribbling += 8;
        physical.pace += 8;
        physical.acceleration += 8;
    }


    if (positionId === "cm") {
        base.passing += 9;
        base.firstTouch += 7;
        mental.vision += 8;
    }


    if (positionId === "dm") {
        base.passing += 5;
        base.tackling += 8;
        mental.positioning += 7;
    }


    if (positionId === "cb") {
        base.marking += 9;
        base.tackling += 9;
        physical.strength += 6;
        mental.concentration += 6;
    }


    if (
        positionId === "rb" ||
        positionId === "lb"
    ) {
        base.crossing += 7;
        physical.pace += 6;
        physical.stamina += 7;
    }


    if (positionId === "gk") {
        goalkeeper.reflexes += 10;
        goalkeeper.handling += 8;
        goalkeeper.oneOnOne += 7;
    }


    Object.keys(base).forEach(
        key => {
            base[key] =
                clamp(base[key]);
        }
    );

    Object.keys(physical).forEach(
        key => {
            physical[key] =
                clamp(
                    physical[key]
                );
        }
    );

    Object.keys(mental).forEach(
        key => {
            mental[key] =
                clamp(
                    mental[key]
                );
        }
    );

    Object.keys(goalkeeper).forEach(
        key => {
            goalkeeper[key] =
                clamp(
                    goalkeeper[key]
                );
        }
    );


    return {
        technical: base,
        physical,
        mental,
        goalkeeper
    };
}


export function initializePlayer(
    gameState,
    {
        fullName,
        age = 10,

        cityId = null,

        nationality = "BR",

        secondNationality = null,

        positionId = null,

        dominantFoot = null
    } = {}
) {
    const rng =
        gameState.rng;


    const city =
        cityId ??
        pick(
            rng,
            BRAZILIAN_CITIES
        ).id;


    const position =
        positionId ??
        pick(
            rng,
            FOOTBALL_POSITIONS
        ).id;


    const foot =
        dominantFoot ??
        (
            chance(
                rng,
                0.76
            )
                ? "right"
                : chance(
                    rng,
                    0.85
                )
                    ? "left"
                    : "both"
        );


    const height =
        generateHeight(
            rng,
            age,
            position
        );


    gameState.calendar.age =
        age;


    gameState.player.identity.fullName =
        fullName;


    gameState.player.identity.birthYear =
        gameState.calendar.year -
        age;


    gameState.player.identity.nationality =
        nationality;


    gameState.player.identity.secondNationality =
        secondNationality;


    gameState.player.identity.birthCityId =
        city;


    gameState.player.identity.currentCityId =
        city;


    gameState.player.physical.heightCm =
        height;


    gameState.player.physical.weightKg =
        generateWeight(
            rng,
            height,
            age
        );


    gameState.player.physical.dominantFoot =
        foot;


    gameState.player.football.position =
        position;


    gameState.player.hidden.potential =
        randomInt(
            rng,
            55,
            97
        );


    gameState.player.hidden.personality =
        generatePersonality(
            rng
        );


    gameState.player.attributes =
        generateStartingAttributes(
            rng,
            position
        );


    return gameState.player;
}