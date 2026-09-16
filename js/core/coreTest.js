import {
    createGameState
} from "./gameState.js";

import {
    saveGame,
    loadGame
} from "./saveManager.js";

import {
    createPerson,
    addPerson
} from "../systems/personSystem.js";

import {
    ensureRelationship,
    modifyRelationship,
    describeRelationship
} from "../systems/relationshipSystem.js";

import {
    addTimelineEntry
} from "../systems/timelineSystem.js";

import {
    beginYear,
    completeYear,
    advanceToNextYear
} from "./timeEngine.js";


export function runCoreTest() {
    const game =
        createGameState({
            saveName:
                "Teste Core",

            startAge: 10,

            startYear: 2026
        });


    game.player.identity.fullName =
        "Arthur Rocha";


    const father =
        createPerson({
            fullName:
                "Carlos Rocha",

            birthYear:
                1985,

            roles: [
                "father"
            ],

            profession:
                "Motorista"
        });


    addPerson(
        game,
        father
    );


    const relationship =
        ensureRelationship(
            game,
            game.player.id,
            father.id,
            {
                type:
                    "father",

                affection: 80,
                trust: 70,
                respect: 75
            }
        );


    modifyRelationship(
        game,
        game.player.id,
        father.id,
        {
            trust: 5,
            affection: 3
        },
        "O pai apoiou uma decisão importante."
    );


    addTimelineEntry(
        game,
        {
            type:
                "family",

            title:
                "Apoio do pai",

            description:
                "Carlos apoiou Arthur em uma decisão importante.",

            importance: 5,

            relatedEntities: [
                father.id
            ]
        }
    );


    beginYear(game);

    completeYear(game);

    advanceToNextYear(game);


    saveGame(
        game,
        {
            reason:
                "core_test"
        }
    );


    const loaded =
        loadGame(
            game.save.id
        );


    console.group(
        "Football Life Simulator — Core Test"
    );

    console.log(
        "Save:",
        loaded
    );

    console.log(
        "Idade:",
        loaded.calendar.age
    );

    console.log(
        "Ano:",
        loaded.calendar.year
    );

    console.log(
        "Pai:",
        loaded.people.byId[
            father.id
        ]
    );

    console.log(
        "Relação:",
        describeRelationship(
            relationship
        )
    );

    console.log(
        "Timeline:",
        loaded.timeline
    );

    console.groupEnd();


    return loaded;
}