import {
    buildNewGame
} from "./newGameBuilder.js";

import {
    simulateFootballSeason,
    getSeasonHistory
} from "../systems/footballSystem.js";

import {
    ensureCurrentCoach
} from "../systems/coachSystem.js";

import {
    getPerson
} from "../systems/personSystem.js";

import {
    saveGame
} from "./saveManager.js";


export function runFootballSeasonTest() {
    const game =
        buildNewGame({
            saveName:
                "Teste temporada",

            fullName:
                "Arthur Rocha",

            age: 15,

            startYear: 2031,

            cityId:
                "belo_horizonte_mg",

            positionId:
                "lb",

            clubId:
                "cruzeiro",

            seed:
                11235813
        });


    game.player.hidden
        .potential =
        88;


    game.player.hidden
        .personality
        .professionalism =
        82;


    game.player.hidden
        .personality
        .discipline =
        80;


    game.player.hidden
        .personality
        .resilience =
        78;


    const coach =
        ensureCurrentCoach(
            game
        );


    console.group(
        "Football Life Simulator — Football Season Test"
    );


    console.log(
        "Treinador:",
        coach
    );


    const season =
        simulateFootballSeason(
            game
        );


    console.log(
        "Temporada:",
        season
    );


    console.log(
        "Status antes:",
        season.squadStatusBefore
    );


    console.log(
        "Status depois:",
        season.squadStatusAfter
    );


    console.log(
        "Concorrentes:",
        season.positionCompetition
    );


    console.log(
        "Confiança do treinador:",
        game.footballContext
            .coachTrust
    );


    console.log(
        "Forma:",
        game.footballContext
            .form
    );


    console.log(
        "Estatísticas:",
        season.stats
    );


    console.log(
        "Últimos jogos:",
        season.matches.slice(
            -5
        )
    );


    console.log(
        "Evolução:",
        season.development
    );


    console.log(
        "Treinador persistente:",
        getPerson(
            game,
            game.footballContext
                .currentCoachId
        )
    );


    console.log(
        "Histórico de temporadas:",
        getSeasonHistory(
            game
        )
    );


    saveGame(
        game,
        {
            reason:
                "football_season_test"
        }
    );


    console.groupEnd();


    return game;
}