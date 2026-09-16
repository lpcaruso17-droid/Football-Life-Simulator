import {
    buildNewGame
} from "./newGameBuilder.js";

import {
    calculateAcademyRecognition
} from "../systems/academyCareerSystem.js";

import {
    createFirstProfessionalContractOffer,
    acceptFirstProfessionalContractOffer,
    getActiveContract
} from "../systems/contractSystem.js";

import {
    calculateProfessionalReadiness,
    grantFirstTeamTraining,
    grantFirstTeamCallUp,
    recordFirstProfessionalBench,
    recordProfessionalDebut,
    recordFirstProfessionalStart,
    recordFirstProfessionalGoal
} from "../systems/professionalPathSystem.js";

import {
    saveGame
} from "./saveManager.js";


export function runProfessionalPathTest() {
    const game =
        buildNewGame({
            saveName:
                "Teste caminho profissional",

            fullName:
                "Arthur Rocha",

            age: 16,

            startYear: 2032,

            cityId:
                "belo_horizonte_mg",

            positionId:
                "st",

            clubId:
                "cruzeiro",

            seed:
                314159265
        });


    game.calendar.phase =
        "late_season";


    game.player.hidden
        .potential =
        95;


    game.player.hidden
        .personality
        .professionalism =
        90;


    game.player.hidden
        .personality
        .discipline =
        88;


    game.player.hidden
        .personality
        .resilience =
        86;


    calculateAcademyRecognition(
        game
    );


    game.academy.recognition =
        Math.max(
            82,
            game.academy
                .recognition
        );


    console.group(
        "Football Life Simulator — Professional Path Test"
    );


    console.log(
        "Prontidão inicial:",
        calculateProfessionalReadiness(
            game
        )
    );


    const professionalOffer =
        createFirstProfessionalContractOffer(
            game
        );


    console.log(
        "Proposta profissional:",
        professionalOffer
    );


    if (professionalOffer) {
        const contract =
            acceptFirstProfessionalContractOffer(
                game,
                professionalOffer.id,
                {
                    guardianApproval:
                        true
                }
            );


        console.log(
            "Primeiro contrato profissional:",
            contract
        );
    }


    console.log(
        "Contrato ativo:",
        getActiveContract(
            game
        )
    );


    grantFirstTeamTraining(
        game
    );


    grantFirstTeamCallUp(
        game,
        {
            competition:
                "Liga Nacional",

            opponent:
                "Clube Azul"
        }
    );


    recordFirstProfessionalBench(
        game,
        {
            competition:
                "Liga Nacional",

            opponent:
                "Clube Azul"
        }
    );


    recordProfessionalDebut(
        game,
        {
            competition:
                "Liga Nacional",

            opponent:
                "Clube Azul",

            minutes: 22,

            starter: false,

            result:
                "2-1"
        }
    );


    recordFirstProfessionalStart(
        game,
        {
            competition:
                "Copa Nacional",

            opponent:
                "Clube Vermelho",

            result:
                "1-1"
        }
    );


    recordFirstProfessionalGoal(
        game,
        {
            competition:
                "Liga Nacional",

            opponent:
                "Clube Verde",

            minute: 71
        }
    );


    console.log(
        "Estado profissional:",
        game.professional
    );


    console.log(
        "Marcos:",
        game.career
            .milestones
    );


    console.log(
        "Salário:",
        game.finances
            .monthlyIncome
    );


    console.log(
        "Dinheiro disponível:",
        game.finances
            .cash
    );


    console.log(
        "Timeline:",
        game.timeline
    );


    saveGame(
        game,
        {
            reason:
                "professional_path_test"
        }
    );


    console.groupEnd();


    return game;
}