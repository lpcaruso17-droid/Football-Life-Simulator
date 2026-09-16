import {
    generateRepresentationOffers
} from "../systems/agentSystem.js";


export const AGENT_EVENTS = [
    gameState => {
        if (
            gameState.representation
                .activeAgreement
        ) {
            return null;
        }

        const age =
            gameState.calendar.age;

        const phase =
            gameState.calendar.phase;

        const eligible =
            age >= 16 ||
            (
                age === 15 &&
                (
                    phase ===
                        "late_season" ||
                    phase ===
                        "offseason"
                )
            );

        if (!eligible) {
            return null;
        }

        return {
            id:
                "first_formal_agent_interest",

            category:
                "agent",

            minAge: 15,

            maxAge: 19,

            onceOnly: true,

            cooldownYears: 0,

            weight: 35,

            importance: 7,

            title:
                "O mercado começa a olhar para você",

            description:
                "Sua evolução despertou interesse de profissionais que trabalham com gestão de carreira.",

            choices: [
                {
                    id:
                        "listen_to_agencies",

                    label:
                        "Ouvir as agências interessadas",

                    resultText:
                        "Sua família decidiu conhecer melhor as opções de representação.",

                    apply(state) {
                        return generateRepresentationOffers(
                            state,
                            {
                                maximumOffers: 3
                            }
                        );
                    }
                },

                {
                    id:
                        "wait_before_agent",

                    label:
                        "Esperar mais um pouco",

                    resultText:
                        "A família preferiu não iniciar uma representação neste momento.",

                    apply(state) {
                        state.representation
                            .history
                            .push({
                                action:
                                    "representation_postponed",

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