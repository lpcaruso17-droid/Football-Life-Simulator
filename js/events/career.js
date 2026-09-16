import {
    chance
} from "../core/rng.js";

import {
    searchForAcademyOpportunities,
    resolveAcademyTrial
} from "../systems/academyCareerSystem.js";

import {
    changeSchoolPerformance
} from "../systems/educationSystem.js";


function clamp(
    value,
    min = 0,
    max = 100
) {
    return Math.max(
        min,
        Math.min(
            max,
            Number(value) || 0
        )
    );
}


function changeHappiness(
    gameState,
    amount
) {
    gameState.player.life
        .happiness =
        clamp(
            gameState.player
                .life
                .happiness +
            amount
        );
}


function improvePersonality(
    gameState,
    attribute,
    amount
) {
    const personality =
        gameState.player
            .hidden
            .personality;

    personality[
        attribute
    ] =
        clamp(
            (
                Number(
                    personality[
                        attribute
                    ]
                ) || 50
            ) +
            amount,
            1,
            99
        );
}


function searchOpportunity(
    gameState
) {
    /*
     * Nem toda busca consegue
     * gerar teste ou proposta.
     *
     * Isso evita o efeito:
     * "fiquei sem clube e outro
     * apareceu magicamente".
     */
    if (
        chance(
            gameState.rng,
            0.24
        )
    ) {
        return {
            type:
                "no_opportunity",

            message:
                "Nenhuma oportunidade concreta apareceu desta vez."
        };
    }

    const result =
        searchForAcademyOpportunities(
            gameState
        );

    if (
        result.type ===
            "trial" &&
        result.trials
            ?.length
    ) {
        const trial =
            resolveAcademyTrial(
                gameState,
                result.trials[0]
                    .id
            );

        return {
            ...result,

            trialResult:
                trial.result,

            trial
        };
    }

    return result;
}


export const CAREER_EVENTS = [
    gameState => {
        if (
            gameState.player
                .football
                .currentClubId
        ) {
            return null;
        }

        if (
            gameState.calendar.age >
            20
        ) {
            return null;
        }

        return {
            id:
                "clubless_search_opportunity",

            category:
                "career",

            minAge: 10,

            maxAge: 20,

            cooldownYears: 1,

            weight: 90,

            importance: 7,

            title:
                "A busca por um novo clube",

            description:
                "Você está sem clube. Surgiram contatos e avaliações informais, mas nada é garantido.",

            choices: [
                {
                    id:
                        "search_for_club",

                    label:
                        "Buscar uma nova oportunidade",

                    resultText:
                        "Você movimentou contatos e procurou uma nova oportunidade no futebol.",

                    apply(state) {
                        improvePersonality(
                            state,
                            "resilience",
                            2
                        );

                        return searchOpportunity(
                            state
                        );
                    }
                },

                {
                    id:
                        "train_independently",

                    label:
                        "Treinar por conta própria",

                    resultText:
                        "Sem uma oportunidade concreta, você decidiu manter a preparação por conta própria.",

                    apply(state) {
                        improvePersonality(
                            state,
                            "professionalism",
                            2
                        );

                        improvePersonality(
                            state,
                            "discipline",
                            1
                        );

                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player.life
                                    .physicalCondition +
                                3
                            );

                        changeHappiness(
                            state,
                            -1
                        );

                        return {
                            type:
                                "individual_training"
                        };
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.player
                .football
                .currentClubId
        ) {
            return null;
        }

        if (
            gameState.calendar.age <
                12 ||
            gameState.calendar.age >
                20
        ) {
            return null;
        }

        return {
            id:
                "clubless_local_contact",

            category:
                "career",

            minAge: 12,

            maxAge: 20,

            cooldownYears: 2,

            weight: 62,

            importance: 6,

            title:
                "Um contato fala sobre uma avaliação",

            description:
                "Uma pessoa ligada ao futebol comentou sobre clubes observando jogadores da sua idade.",

            choices: [
                {
                    id:
                        "try_contact",

                    label:
                        "Tentar conseguir uma avaliação",

                    resultText:
                        "Você decidiu tentar transformar o contato em uma oportunidade real.",

                    apply(state) {
                        return searchOpportunity(
                            state
                        );
                    }
                },

                {
                    id:
                        "wait_better_opportunity",

                    label:
                        "Esperar algo mais concreto",

                    resultText:
                        "Você preferiu não se precipitar e continuou esperando por uma oportunidade mais clara.",

                    apply(state) {
                        improvePersonality(
                            state,
                            "discipline",
                            1
                        );

                        return {
                            type:
                                "waited"
                        };
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.player
                .football
                .currentClubId
        ) {
            return null;
        }

        if (
            gameState.calendar.age <
            14
        ) {
            return null;
        }

        return {
            id:
                "clubless_career_doubt",

            category:
                "career",

            minAge: 14,

            maxAge: 20,

            cooldownYears: 3,

            weight: 40,

            importance: 6,

            title:
                "Até onde insistir?",

            description:
                "O tempo sem clube começou a pesar. Futebol, escola e futuro passaram a disputar espaço na sua cabeça.",

            choices: [
                {
                    id:
                        "keep_chasing_football",

                    label:
                        "Continuar insistindo no futebol",

                    resultText:
                        "Você decidiu continuar lutando por uma nova chance no futebol.",

                    apply(state) {
                        improvePersonality(
                            state,
                            "ambition",
                            3
                        );

                        improvePersonality(
                            state,
                            "resilience",
                            3
                        );

                        changeHappiness(
                            state,
                            -2
                        );

                        return {
                            type:
                                "football_priority"
                        };
                    }
                },

                {
                    id:
                        "focus_more_on_school",

                    label:
                        "Dar mais atenção aos estudos",

                    resultText:
                        "Você decidiu equilibrar melhor o futebol com os estudos enquanto estava sem clube.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            6,
                            "clubless_school_focus"
                        );

                        changeHappiness(
                            state,
                            2
                        );

                        return {
                            type:
                                "education_priority"
                        };
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            !gameState.player
                .football
                .currentClubId
        ) {
            return null;
        }

        return {
            id:
                "coach_individual_feedback",

            category:
                "career",

            minAge: 11,

            maxAge: 20,

            cooldownYears: 3,

            weight: 34,

            importance: 4,

            title:
                "Conversa rápida após o treino",

            description:
                "Um membro da comissão técnica comentou pontos que você precisa desenvolver para ganhar espaço.",

            choices: [
                {
                    id:
                        "listen_to_feedback",

                    label:
                        "Ouvir e trabalhar nos pontos citados",

                    resultText:
                        "Você recebeu a cobrança como uma oportunidade de evolução.",

                    apply(state) {
                        improvePersonality(
                            state,
                            "professionalism",
                            2
                        );

                        improvePersonality(
                            state,
                            "discipline",
                            2
                        );
                    }
                },

                {
                    id:
                        "trust_your_own_game",

                    label:
                        "Confiar mais no seu próprio jogo",

                    resultText:
                        "Você ouviu a comissão, mas preferiu manter suas próprias convicções.",

                    apply(state) {
                        improvePersonality(
                            state,
                            "ego",
                            2
                        );

                        improvePersonality(
                            state,
                            "ambition",
                            1
                        );
                    }
                }
            ]
        };
    }
];