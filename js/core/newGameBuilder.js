import {
    createGameState
} from "./gameState.js";

import {
    initializePlayer
} from "../systems/playerSystem.js";

import {
    generateInitialFamily
} from "../systems/familySystem.js";

import {
    initializeAcademyCareer
} from "../systems/academySystem.js";

import {
    addTimelineEntry
} from "../systems/timelineSystem.js";


export function buildNewGame({
    saveName = "Nova vida",

    fullName,

    age = 10,

    startYear =
        new Date().getFullYear(),

    cityId = null,

    nationality = "BR",

    secondNationality = null,

    positionId = null,

    dominantFoot = null,

    clubId = null,

    seed = undefined
} = {}) {
    if (
        !fullName ||
        !String(
            fullName
        ).trim()
    ) {
        throw new Error(
            "O personagem precisa ter nome."
        );
    }

    if (
        age < 10 ||
        age > 18
    ) {
        throw new Error(
            "A idade inicial deve estar entre 10 e 18 anos."
        );
    }

    const gameState =
        createGameState({
            saveName,

            startAge: age,

            startYear,

            seed
        });

    initializePlayer(
        gameState,
        {
            fullName:
                String(
                    fullName
                ).trim(),

            age,

            cityId,

            nationality,

            secondNationality,

            positionId,

            dominantFoot
        }
    );

    generateInitialFamily(
        gameState
    );

    initializeAcademyCareer(
        gameState,
        {
            preferredClubId:
                clubId
        }
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "life_started",

            title:
                "Sua história começa",

            description:
                `${gameState.player.identity.fullName} inicia sua história aos ${age} anos.`,

            importance: 10,

            metadata: {
                startingAge:
                    age,

                startingYear:
                    startYear,

                startingClubId:
                    gameState
                        .academy
                        .currentClubId,

                startingCategory:
                    gameState
                        .academy
                        .currentCategory
            }
        }
    );

    return gameState;
}