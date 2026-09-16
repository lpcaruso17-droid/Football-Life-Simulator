import {
    canSignFirstProfessionalContract,
    createFirstProfessionalContractOffer
} from "../systems/contractSystem.js";

import {
    getNextProfessionalMilestone,
    grantFirstTeamTraining,
    grantFirstTeamCallUp,
    recordFirstProfessionalBench,
    recordProfessionalDebut,
    recordFirstProfessionalStart
} from "../systems/professionalPathSystem.js";


function buildMilestoneEvent(
    gameState,
    milestone
) {
    if (
        milestone ===
        "first_team_training"
    ) {
        return {
            id:
                "milestone_first_team_training",

            category:
                "professional",

            minAge: 15,

            onceOnly: true,

            weight: 80,

            importance: 9,

            title:
                "Convite para treinar com o profissional",

            description:
                "A comissão técnica decidiu observar você de perto junto ao elenco principal.",

            choices: [
                {
                    id:
                        "accept_first_team_training",

                    label:
                        "Aproveitar a oportunidade",

                    resultText:
                        "Você participou do primeiro treinamento com o time profissional.",

                    apply(state) {
                        return grantFirstTeamTraining(
                            state
                        );
                    }
                }
            ]
        };
    }

    if (
        milestone ===
        "first_call_up"
    ) {
        return {
            id:
                "milestone_first_professional_callup",

            category:
                "professional",

            onceOnly: true,

            weight: 90,

            importance: 9,

            title:
                "Você foi relacionado!",

            description:
                "Seu nome apareceu pela primeira vez na lista do elenco profissional para uma partida.",

            choices: [
                {
                    id:
                        "confirm_first_callup",

                    label:
                        "Seguir com o elenco",

                    resultText:
                        "Você viveu sua primeira convocação no futebol profissional.",

                    apply(state) {
                        return grantFirstTeamCallUp(
                            state
                        );
                    }
                }
            ]
        };
    }

    if (
        milestone ===
        "first_bench"
    ) {
        return {
            id:
                "milestone_first_professional_bench",

            category:
                "professional",

            onceOnly: true,

            weight: 90,

            importance: 8,

            title:
                "Primeira vez no banco",

            description:
                "Você começará uma partida profissional entre os reservas.",

            choices: [
                {
                    id:
                        "experience_first_bench",

                    label:
                        "Viver o momento",

                    resultText:
                        "Você ficou pela primeira vez no banco de uma partida profissional.",

                    apply(state) {
                        return recordFirstProfessionalBench(
                            state
                        );
                    }
                }
            ]
        };
    }

    if (
        milestone ===
        "professional_debut"
    ) {
        return {
            id:
                "milestone_professional_debut",

            category:
                "professional",

            onceOnly: true,

            weight: 100,

            importance: 10,

            title:
                "Chegou a hora",

            description:
                "O treinador chamou você. Sua estreia profissional está prestes a acontecer.",

            choices: [
                {
                    id:
                        "make_professional_debut",

                    label:
                        "Entrar em campo",

                    resultText:
                        "Você fez sua estreia no futebol profissional.",

                    apply(state) {
                        return recordProfessionalDebut(
                            state,
                            {
                                minutes: 18
                            }
                        );
                    }
                }
            ]
        };
    }

    if (
        milestone ===
        "first_start"
    ) {
        return {
            id:
                "milestone_first_professional_start",

            category:
                "professional",

            onceOnly: true,

            weight: 80,

            importance: 9,

            title:
                "Seu nome está entre os titulares",

            description:
                "Pela primeira vez, você começará uma partida no time profissional.",

            choices: [
                {
                    id:
                        "make_first_start",

                    label:
                        "Começar a partida",

                    resultText:
                        "Você fez seu primeiro jogo como titular no futebol profissional.",

                    apply(state) {
                        return recordFirstProfessionalStart(
                            state
                        );
                    }
                }
            ]
        };
    }

    return null;
}


export const PROFESSIONAL_EVENTS = [
    gameState => {
        if (
            !canSignFirstProfessionalContract(
                gameState
            )
        ) {
            return null;
        }

        const pendingOffer =
            gameState.contracts
                .offers
                .some(
                    offer =>
                        offer.type ===
                            "professional" &&
                        offer.status ===
                            "pending"
                );

        if (pendingOffer) {
            return null;
        }

        return {
            id:
                "professional_contract_meeting",

            category:
                "contract",

            minAge: 16,

            maxAge: 20,

            cooldownYears: 1,

            onceOnly: false,

            weight: 55,

            importance: 9,

            title:
                "O clube quer falar sobre seu futuro",

            description:
                "A diretoria acredita que chegou o momento de discutir a possibilidade do seu primeiro contrato profissional.",

            choices: [
                {
                    id:
                        "open_professional_negotiation",

                    label:
                        "Abrir negociação",

                    resultText:
                        "A negociação do primeiro contrato profissional começou.",

                    apply(state) {
                        return createFirstProfessionalContractOffer(
                            state
                        );
                    }
                },

                {
                    id:
                        "wait_professional_contract",

                    label:
                        "Esperar",

                    resultText:
                        "Você decidiu não avançar com a negociação neste momento.",

                    apply(state) {
                        state.contracts
                            .history
                            .push({
                                action:
                                    "professional_negotiation_postponed",

                                year:
                                    state.calendar
                                        .year,

                                age:
                                    state.calendar
                                        .age
                            });
                    }
                }
            ]
        };
    },

    gameState => {
        const milestone =
            getNextProfessionalMilestone(
                gameState
            );

        if (!milestone) {
            return null;
        }

        return buildMilestoneEvent(
            gameState,
            milestone
        );
    }
];