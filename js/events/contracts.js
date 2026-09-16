import {
    canSignFormationContract,
    createFormationContractOffer,
    getActiveContract
} from "../systems/contractSystem.js";


export const CONTRACT_EVENTS = [
    gameState => {
        if (
            !canSignFormationContract(
                gameState
            )
        ) {
            return null;
        }

        const activeContract =
            getActiveContract(
                gameState
            );

        if (activeContract) {
            return null;
        }

        const existingPending =
            gameState.contracts
                .offers
                .some(
                    offer =>
                        offer.type ===
                            "formation" &&
                        offer.status ===
                            "pending"
                );

        if (existingPending) {
            return null;
        }

        return {
            id:
                "first_formation_contract",

            category:
                "contract",

            minAge: 15,

            maxAge: 19,

            onceOnly: true,

            weight: 45,

            importance: 8,

            title:
                "O clube quer formalizar sua formação",

            description:
                "A direção acredita que chegou o momento de discutir um contrato formal de formação e uma bolsa de aprendizagem.",

            choices: [
                {
                    id:
                        "open_formation_negotiation",

                    label:
                        "Abrir a negociação",

                    resultText:
                        "As partes começaram a discutir as condições do contrato de formação.",

                    apply(state) {
                        return createFormationContractOffer(
                            state
                        );
                    }
                },

                {
                    id:
                        "wait_formation_contract",

                    label:
                        "Esperar antes de assinar",

                    resultText:
                        "A família decidiu esperar antes de formalizar o vínculo.",

                    apply(state) {
                        state.contracts
                            .history
                            .push({
                                action:
                                    "formation_negotiation_postponed",

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
    }
];