import {
    pick
} from "../core/rng.js";

import {
    getTeammates
} from "../systems/socialSystem.js";

import {
    modifyRelationship
} from "../systems/relationshipSystem.js";


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


function changePersonality(
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


function changeCoachTrust(
    gameState,
    amount
) {
    gameState.footballContext
        .coachTrust =
        clamp(
            (
                Number(
                    gameState
                        .footballContext
                        .coachTrust
                ) || 45
            ) +
            amount
        );
}


function changeRecognition(
    gameState,
    amount
) {
    gameState.academy
        .recognition =
        clamp(
            (
                Number(
                    gameState.academy
                        .recognition
                ) || 0
            ) +
            amount
        );
}


export const ACADEMY_EVENTS = [
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
                "academy_extra_session",

            theme:
                "training",

            category:
                "academy",

            minAge: 11,

            maxAge: 20,

            cooldownYears: 2,

            weight: 40,

            importance: 4,

            title:
                "Treino extra após a atividade",

            description:
                "A comissão permitiu que alguns jogadores permanecessem mais um pouco para trabalhar fundamentos.",

            choices: [
                {
                    id:
                        "stay_training",

                    label:
                        "Ficar para o treino extra",

                    resultText:
                        "Você permaneceu após a atividade e mostrou disposição para evoluir.",

                    apply(state) {
                        changePersonality(
                            state,
                            "professionalism",
                            2
                        );

                        changeCoachTrust(
                            state,
                            2
                        );

                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player.life
                                    .physicalCondition -
                                2
                            );
                    }
                },

                {
                    id:
                        "recover_body",

                    label:
                        "Priorizar recuperação",

                    resultText:
                        "Você decidiu preservar o corpo e seguir o planejamento normal.",

                    apply(state) {
                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player.life
                                    .physicalCondition +
                                3
                            );

                        changePersonality(
                            state,
                            "intelligence",
                            1
                        );
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

        if (
            gameState.player
                .football
                .squadStatus ===
                "key_player"
        ) {
            return null;
        }

        return {
            id:
                "academy_position_competition",

            theme:
                "squad_competition",

            category:
                "academy",

            minAge: 12,

            maxAge: 20,

            cooldownYears: 2,

            weight: 42,

            importance: 5,

            title:
                "A disputa pela posição aumentou",

            description:
                "Outro jogador da sua posição começou a receber mais espaço nos treinamentos e jogos.",

            choices: [
                {
                    id:
                        "respond_on_field",

                    label:
                        "Responder dentro de campo",

                    resultText:
                        "Você decidiu transformar a concorrência em motivação.",

                    apply(state) {
                        changePersonality(
                            state,
                            "resilience",
                            2
                        );

                        changePersonality(
                            state,
                            "professionalism",
                            1
                        );

                        changeCoachTrust(
                            state,
                            2
                        );
                    }
                },

                {
                    id:
                        "feel_frustrated",

                    label:
                        "Demonstrar insatisfação",

                    resultText:
                        "A disputa pela posição mexeu com você e o clima ficou um pouco mais pesado.",

                    apply(state) {
                        state.player.life
                            .happiness =
                            clamp(
                                state.player.life
                                    .happiness -
                                4
                            );

                        changeCoachTrust(
                            state,
                            -2
                        );

                        changePersonality(
                            state,
                            "ego",
                            2
                        );
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

        if (
            gameState.footballContext
                .form < 65
        ) {
            return null;
        }

        return {
            id:
                "academy_good_form_attention",

            theme:
                "performance_attention",

            category:
                "academy",

            minAge: 12,

            maxAge: 20,

            cooldownYears: 2,

            weight: 35,

            importance: 5,

            title:
                "Seu momento chamou atenção",

            description:
                "Seu bom momento virou assunto entre membros da comissão técnica.",

            choices: [
                {
                    id:
                        "stay_grounded",

                    label:
                        "Manter os pés no chão",

                    resultText:
                        "Você recebeu os elogios sem mudar sua postura.",

                    apply(state) {
                        changePersonality(
                            state,
                            "professionalism",
                            2
                        );

                        changeRecognition(
                            state,
                            2
                        );

                        changeCoachTrust(
                            state,
                            2
                        );
                    }
                },

                {
                    id:
                        "embrace_confidence",

                    label:
                        "Jogar com mais confiança",

                    resultText:
                        "Você decidiu aproveitar o bom momento para se impor ainda mais.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
                            2
                        );

                        changeRecognition(
                            state,
                            3
                        );

                        state.player.life
                            .happiness =
                            clamp(
                                state.player.life
                                    .happiness +
                                3
                            );
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

        if (
            gameState.footballContext
                .form > 42
        ) {
            return null;
        }

        return {
            id:
                "academy_bad_form",

            theme:
                "bad_form",

            category:
                "academy",

            minAge: 12,

            maxAge: 20,

            cooldownYears: 2,

            weight: 38,

            importance: 5,

            title:
                "Uma sequência difícil",

            description:
                "Você atravessa um momento abaixo do que esperava e começa a sentir a pressão por desempenho.",

            choices: [
                {
                    id:
                        "work_through_bad_form",

                    label:
                        "Continuar trabalhando",

                    resultText:
                        "Você decidiu manter a rotina e confiar que o desempenho voltará.",

                    apply(state) {
                        changePersonality(
                            state,
                            "resilience",
                            3
                        );

                        state.player.life
                            .happiness =
                            clamp(
                                state.player.life
                                    .happiness -
                                1
                            );
                    }
                },

                {
                    id:
                        "put_pressure_on_yourself",

                    label:
                        "Cobrar mais de si mesmo",

                    resultText:
                        "Você aumentou sua própria cobrança para tentar reagir rapidamente.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
                            2
                        );

                        state.player.life
                            .happiness =
                            clamp(
                                state.player.life
                                    .happiness -
                                4
                            );

                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player.life
                                    .physicalCondition -
                                2
                            );
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

        const teammates =
            getTeammates(
                gameState
            );

        const teammate =
            pick(
                gameState.rng,
                teammates
            );

        if (!teammate) {
            return null;
        }

        return {
            id:
                "academy_teammate_support",

            theme:
                "teammate_relationship",

            category:
                "academy",

            minAge: 11,

            maxAge: 20,

            cooldownYears: 3,

            weight: 30,

            importance: 3,

            title:
                `${teammate.identity.fullName} se aproximou de você`,

            description:
                "Um companheiro de equipe passou a conversar mais com você fora das atividades do clube.",

            relatedEntities: [
                teammate.id
            ],

            choices: [
                {
                    id:
                        "build_friendship",

                    label:
                        "Se aproximar também",

                    resultText:
                        "A convivência no clube começou a virar uma amizade.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            teammate.id,
                            {
                                affection: 6,
                                trust: 5,
                                loyalty: 3
                            },
                            "Fortaleceram a amizade dentro do clube."
                        );

                        state.player.life
                            .happiness =
                            clamp(
                                state.player.life
                                    .happiness +
                                3
                            );
                    }
                },

                {
                    id:
                        "keep_professional",

                    label:
                        "Manter apenas relação profissional",

                    resultText:
                        "Você manteve uma boa convivência, mas sem criar muita proximidade.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            teammate.id,
                            {
                                respect: 3
                            },
                            "Mantiveram uma relação profissional."
                        );
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

        if (
            gameState.academy
                .joinedYear !==
            gameState.calendar.year
        ) {
            return null;
        }

        return {
            id:
                "academy_new_club_adaptation",

            theme:
                "adaptation",

            category:
                "academy",

            minAge: 10,

            maxAge: 20,

            cooldownYears: 4,

            weight: 70,

            importance: 5,

            title:
                "Os primeiros meses no novo clube",

            description:
                "A nova rotina, os treinadores e os companheiros ainda são diferentes do que você estava acostumado.",

            choices: [
                {
                    id:
                        "embrace_new_environment",

                    label:
                        "Tentar se integrar rapidamente",

                    resultText:
                        "Você fez esforço para se adaptar ao novo ambiente.",

                    apply(state) {
                        changePersonality(
                            state,
                            "adaptability",
                            3
                        );

                        changeCoachTrust(
                            state,
                            2
                        );

                        state.player.life
                            .happiness =
                            clamp(
                                state.player.life
                                    .happiness +
                                1
                            );
                    }
                },

                {
                    id:
                        "take_time_to_adapt",

                    label:
                        "Ir se adaptando aos poucos",

                    resultText:
                        "Você decidiu não forçar a adaptação e deixar as coisas acontecerem naturalmente.",

                    apply(state) {
                        changePersonality(
                            state,
                            "resilience",
                            1
                        );
                    }
                }
            ]
        };
    }
];