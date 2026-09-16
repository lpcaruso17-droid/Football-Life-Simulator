import {
    buildNewGame
} from "./newGameBuilder.js";

import {
    resolveAnnualAcademyEvaluation,
    generateAcademyOffers,
    searchForAcademyOpportunities,
    resolveAcademyTrial
} from "../systems/academyCareerSystem.js";

import {
    saveGame
} from "./saveManager.js";


export function runAcademyCareerTest() {
    const game =
        buildNewGame({
            saveName:
                "Teste carreira base",

            fullName:
                "Arthur Rocha",

            age: 13,

            startYear: 2029,

            cityId:
                "goiania_go",

            positionId:
                "lb",

            seed:
                123456789
        });

    console.group(
        "Football Life Simulator — Academy Career Test"
    );

    console.log(
        "Situação inicial:",
        {
            clube:
                game.player
                    .football
                    .currentClubName,

            categoria:
                game.player
                    .football
                    .currentCategory,

            desenvolvimento:
                game.academy
                    .developmentScore
        }
    );

    const evaluation =
        resolveAnnualAcademyEvaluation(
            game
        );

    console.log(
        "Avaliação anual:",
        evaluation
    );

    if (
        game.academy
            .currentClubId
    ) {
        const offers =
            generateAcademyOffers(
                game
            );

        console.log(
            "Propostas externas:",
            offers
        );
    } else {
        const opportunity =
            searchForAcademyOpportunities(
                game
            );

        console.log(
            "Busca por clube:",
            opportunity
        );

        if (
            opportunity.type ===
                "trial" &&
            opportunity
                .trials
                .length
        ) {
            const trialResult =
                resolveAcademyTrial(
                    game,
                    opportunity
                        .trials[0]
                        .id
                );

            console.log(
                "Resultado da avaliação:",
                trialResult
            );
        }
    }

    console.log(
        "Ofertas:",
        game.academy.offers
    );

    console.log(
        "Testes:",
        game.academy.trials
    );

    console.log(
        "Histórico:",
        game.academy.history
    );

    console.log(
        "Timeline:",
        game.timeline
    );

    saveGame(
        game,
        {
            reason:
                "academy_career_test"
        }
    );

    console.groupEnd();

    return game;
}