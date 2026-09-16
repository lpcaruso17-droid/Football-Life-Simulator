import {
    buildNewGame
} from "./newGameBuilder.js";

import {
    saveGame
} from "./saveManager.js";

import {
    getPeople
} from "../systems/personSystem.js";

import {
    getRelationshipsForPerson,
    describeRelationship
} from "../systems/relationshipSystem.js";


export function runNewGameTest() {
    const game =
        buildNewGame({
            saveName:
                "Teste nova vida",

            fullName:
                "Arthur Rocha",

            age: 10,

            startYear: 2026
        });

    saveGame(
        game,
        {
            reason:
                "new_game_test"
        }
    );

    console.group(
        "Football Life Simulator — New Game Test"
    );

    console.log(
        "Personagem:",
        game.player
    );

    console.log(
        "Família:",
        game.family
    );

    console.log(
        "Pessoas:",
        getPeople(game)
    );

    const relationships =
        getRelationshipsForPerson(
            game,
            game.player.id
        );

    console.table(
        relationships.map(
            relationship => ({
                tipo:
                    relationship.type,

                descricao:
                    describeRelationship(
                        relationship
                    ),

                afeto:
                    relationship.affection,

                confianca:
                    relationship.trust,

                respeito:
                    relationship.respect,

                conflito:
                    relationship.conflict,

                lealdade:
                    relationship.loyalty
            })
        )
    );

    console.log(
        "Timeline:",
        game.timeline
    );

    console.log(
        "Potencial oculto:",
        game.player
            .hidden
            .potential
    );

    console.log(
        "Personalidade oculta:",
        game.player
            .hidden
            .personality
    );

    console.groupEnd();

    return game;
}