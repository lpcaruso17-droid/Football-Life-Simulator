import {
    buildNewGame
} from "./newGameBuilder.js";

import {
    saveGame
} from "./saveManager.js";

import {
    getCurrentAcademySituation
} from "../systems/academySystem.js";

import {
    getAcademyCategoryById
} from "../data/clubs.js";

import {
    getCityById
} from "../data/cities.js";


export function runAcademyTest() {
    const game =
        buildNewGame({
            saveName:
                "Teste academia",

            fullName:
                "Arthur Rocha",

            age: 10,

            startYear: 2026,

            cityId:
                "goiania_go",

            positionId:
                "lb"
        });

    saveGame(
        game,
        {
            reason:
                "academy_test"
        }
    );

    const academy =
        getCurrentAcademySituation(
            game
        );

    const category =
        getAcademyCategoryById(
            academy.categoryId
        );

    const birthCity =
        getCityById(
            game
                .player
                .identity
                .birthCityId
        );

    console.group(
        "Football Life Simulator — Academy Test"
    );

    console.log(
        "Jogador:",
        game.player
            .identity
            .fullName
    );

    console.log(
        "Idade:",
        game.calendar.age
    );

    console.log(
        "Cidade:",
        birthCity
            ?.name
    );

    console.log(
        "Clube:",
        academy.club
            ?.name
    );

    console.log(
        "Nível do clube:",
        academy.club
            ?.level
    );

    console.log(
        "Categoria:",
        category
            ?.label
    );

    console.log(
        "Qualidade da base:",
        academy.club
            ?.academyQuality
    );

    console.log(
        "Concorrência:",
        academy.club
            ?.competition
    );

    console.log(
        "Desenvolvimento interno:",
        academy
            .developmentScore
    );

    console.log(
        "Mudança necessária:",
        academy
            .relocationRequired
    );

    console.log(
        "Moradia:",
        academy
            .housingMode
    );

    console.log(
        "Histórico de clubes:",
        game
            .career
            .clubHistory
    );

    console.log(
        "Histórico de categorias:",
        game
            .career
            .categoryHistory
    );

    console.log(
        "Timeline:",
        game.timeline
    );

    console.groupEnd();

    return game;
}