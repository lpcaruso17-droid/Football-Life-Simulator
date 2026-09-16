import {
    buildNewGame
} from "./newGameBuilder.js";

import {
    calculateAcademyRecognition
} from "../systems/academyCareerSystem.js";

import {
    generateRepresentationOffers,
    acceptRepresentationOffer
} from "../systems/agentSystem.js";

import {
    createFormationContractOffer,
    acceptFormationContractOffer,
    getActiveContract,
    getContractYearsRemaining
} from "../systems/contractSystem.js";

import {
    saveGame
} from "./saveManager.js";


export function runAgentContractTest() {
    const game =
        buildNewGame({
            saveName:
                "Teste empresário e contrato",

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
                246813579
        });


    game.calendar.phase =
        "late_season";


    calculateAcademyRecognition(
        game
    );


    game.academy.recognition =
        Math.max(
            70,
            game.academy
                .recognition
        );


    console.group(
        "Football Life Simulator — Agent + Contract Test"
    );


    console.log(
        "Reconhecimento:",
        game.academy
            .recognition
    );


    const representationOffers =
        generateRepresentationOffers(
            game,
            {
                maximumOffers: 3
            }
        );


    console.log(
        "Propostas de representação:",
        representationOffers
    );


    if (
        representationOffers.length
    ) {
        const agreement =
            acceptRepresentationOffer(
                game,
                representationOffers[0]
                    .id,
                {
                    guardianConsent:
                        true
                }
            );


        console.log(
            "Representação aceita:",
            agreement
        );
    }


    const formationOffer =
        createFormationContractOffer(
            game
        );


    console.log(
        "Proposta de formação:",
        formationOffer
    );


    if (formationOffer) {
        const formationContract =
            acceptFormationContractOffer(
                game,
                formationOffer.id,
                {
                    guardianApproval:
                        true
                }
            );


        console.log(
            "Contrato assinado:",
            formationContract
        );
    }


    const activeContract =
        getActiveContract(
            game
        );


    console.log(
        "Contrato ativo:",
        activeContract
    );


    console.log(
        "Anos restantes:",
        getContractYearsRemaining(
            game,
            activeContract
        )
    );


    console.log(
        "Agência:",
        game.representation
            .currentAgencyId
    );


    console.log(
        "Empresário:",
        game.representation
            .currentAgentPersonId
    );


    console.log(
        "Bolsa mensal:",
        game.finances
            .monthlyIncome
    );


    console.log(
        "Timeline:",
        game.timeline
    );


    saveGame(
        game,
        {
            reason:
                "agent_contract_test"
        }
    );


    console.groupEnd();


    return game;
}