import {
    randomInt,
    shuffle
} from "../core/rng.js";

import {
    getClub
} from "./academySystem.js";


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


function getGrowthTargets(
    positionId
) {
    const map = {
        gk: [
            ["goalkeeper", "reflexes"],
            ["goalkeeper", "handling"],
            ["goalkeeper", "oneOnOne"],
            ["goalkeeper", "aerial"],
            ["goalkeeper", "distribution"],
            ["mental", "concentration"],
            ["mental", "positioning"],
            ["physical", "agility"]
        ],

        rb: [
            ["technical", "crossing"],
            ["technical", "tackling"],
            ["technical", "marking"],
            ["technical", "passing"],
            ["physical", "pace"],
            ["physical", "stamina"],
            ["mental", "positioning"],
            ["mental", "teamwork"]
        ],

        lb: [
            ["technical", "crossing"],
            ["technical", "tackling"],
            ["technical", "marking"],
            ["technical", "passing"],
            ["physical", "pace"],
            ["physical", "stamina"],
            ["mental", "positioning"],
            ["mental", "teamwork"]
        ],

        cb: [
            ["technical", "marking"],
            ["technical", "tackling"],
            ["technical", "heading"],
            ["physical", "strength"],
            ["physical", "jumping"],
            ["mental", "concentration"],
            ["mental", "positioning"],
            ["mental", "decisions"]
        ],

        dm: [
            ["technical", "passing"],
            ["technical", "tackling"],
            ["technical", "marking"],
            ["technical", "firstTouch"],
            ["physical", "stamina"],
            ["mental", "positioning"],
            ["mental", "decisions"],
            ["mental", "teamwork"]
        ],

        cm: [
            ["technical", "passing"],
            ["technical", "firstTouch"],
            ["technical", "dribbling"],
            ["technical", "longShots"],
            ["mental", "vision"],
            ["mental", "decisions"],
            ["mental", "teamwork"],
            ["physical", "stamina"]
        ],

        rw: [
            ["technical", "dribbling"],
            ["technical", "crossing"],
            ["technical", "finalization"],
            ["technical", "firstTouch"],
            ["physical", "pace"],
            ["physical", "acceleration"],
            ["mental", "decisions"],
            ["mental", "composure"]
        ],

        lw: [
            ["technical", "dribbling"],
            ["technical", "crossing"],
            ["technical", "finalization"],
            ["technical", "firstTouch"],
            ["physical", "pace"],
            ["physical", "acceleration"],
            ["mental", "decisions"],
            ["mental", "composure"]
        ],

        st: [
            ["technical", "finalization"],
            ["technical", "heading"],
            ["technical", "firstTouch"],
            ["physical", "strength"],
            ["physical", "acceleration"],
            ["mental", "composure"],
            ["mental", "positioning"],
            ["mental", "decisions"]
        ]
    };

    return (
        map[positionId] ??
        map.cm
    );
}


function getAgeGrowthFactor(
    age
) {
    if (age <= 13) {
        return 1.25;
    }

    if (age <= 16) {
        return 1.15;
    }

    if (age <= 20) {
        return 1.00;
    }

    if (age <= 24) {
        return 0.75;
    }

    return 0.45;
}


export function applySeasonDevelopment(
    gameState,
    season
) {
    const positionId =
        gameState.player
            .football
            .position;

    const age =
        gameState.calendar.age;

    const club =
        getClub(
            gameState,
            gameState.player
                .football
                .currentClubId
        );

    const potential =
        Number(
            gameState.player
                .hidden
                .potential
        ) || 60;

    const professionalism =
        Number(
            gameState.player
                .hidden
                .personality
                .professionalism
        ) || 50;

    const minutes =
        Number(
            season.stats
                ?.minutes
        ) || 0;

    const averageRating =
        Number(
            season.stats
                ?.averageRating
        ) || 6;

    const academyQuality =
        Number(
            club?.academyQuality
        ) || 50;

    const facilities =
        Number(
            club?.facilities
        ) || 50;

    const coachTrust =
        Number(
            gameState
                .footballContext
                .coachTrust
        ) || 45;

    const ageFactor =
        getAgeGrowthFactor(
            age
        );

    const playingFactor =
        Math.min(
            1.20,
            0.55 +
            minutes / 1800
        );

    const environmentFactor =
        (
            academyQuality +
            facilities
        ) / 200;

    const performanceFactor =
        Math.max(
            0.55,
            Math.min(
                1.25,
                averageRating / 7
            )
        );

    const mentalityFactor =
        0.70 +
        professionalism / 250;

    const trustFactor =
        0.75 +
        coachTrust / 250;

    const totalFactor =
        ageFactor *
        playingFactor *
        environmentFactor *
        performanceFactor *
        mentalityFactor *
        trustFactor;

    const maximumAttribute =
        Math.min(
            99,
            potential + 6
        );

    const targets =
        shuffle(
            gameState.rng,
            getGrowthTargets(
                positionId
            )
        );

    const amountOfTargets =
        Math.max(
            4,
            Math.min(
                8,
                Math.round(
                    4 +
                    totalFactor * 3
                )
            )
        );

    const selectedTargets =
        targets.slice(
            0,
            amountOfTargets
        );

    const changes = [];

    selectedTargets.forEach(
        ([
            group,
            attribute
        ]) => {
            const current =
                Number(
                    gameState.player
                        .attributes[
                            group
                        ]?.[
                            attribute
                        ]
                ) || 1;

            if (
                current >=
                maximumAttribute
            ) {
                return;
            }

            let maxGrowth =
                Math.max(
                    1,
                    Math.round(
                        totalFactor * 2.4
                    )
                );

            maxGrowth =
                Math.min(
                    4,
                    maxGrowth
                );

            const growth =
                randomInt(
                    gameState.rng,
                    0,
                    maxGrowth
                );

            if (growth <= 0) {
                return;
            }

            const newValue =
                clamp(
                    Math.min(
                        maximumAttribute,
                        current +
                        growth
                    )
                );

            gameState.player
                .attributes[
                    group
                ][
                    attribute
                ] =
                newValue;

            changes.push({
                group,
                attribute,
                before:
                    current,

                after:
                    newValue,

                growth:
                    newValue -
                    current
            });
        }
    );

    return {
        totalFactor:
            Number(
                totalFactor
                    .toFixed(2)
            ),

        changes
    };
}