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
            gameState.player.life
                .happiness +
            amount
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


function changeForm(
    gameState,
    amount
) {
    gameState.footballContext
        .form =
        clamp(
            (
                Number(
                    gameState
                        .footballContext
                        .form
                ) || 50
            ) +
            amount
        );
}


function changeReputation(
    gameState,
    amount
) {
    gameState.reputation
        .overall =
        clamp(
            (
                Number(
                    gameState.reputation
                        .overall
                ) || 0
            ) +
            amount
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


function isProfessional(
    gameState
) {
    return Boolean(
        gameState.player
            .football
            .isProfessional ||
        gameState.player
            .football
            .hasDebutedProfessionally
    );
}


export const PROFESSIONAL_LIFE_EVENTS = [
    gameState => {
        if (
            !isProfessional(
                gameState
            ) ||
            !gameState.player
                .football
                .currentClubId
        ) {
            return null;
        }

        return {
            id:
                "professional_extra_training",

            theme:
                "professional_training",

            category:
                "professional_life",

            minAge: 16,

            cooldownYears: 2,

            weight: 34,

            importance: 4,

            title:
                "Treino extra após a atividade",

            description:
                "A comissão abriu espaço para alguns jogadores permanecerem depois do treino e trabalharem fundamentos específicos.",

            choices: [
                {
                    id:
                        "stay_for_extra_training",

                    label:
                        "Ficar para o treino extra",

                    resultText:
                        "Você decidiu permanecer no centro de treinamento e trabalhar um pouco mais.",

                    apply(state) {
                        changeCoachTrust(
                            state,
                            2
                        );

                        changePersonality(
                            state,
                            "professionalism",
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
                        "prioritize_recovery",

                    label:
                        "Priorizar recuperação física",

                    resultText:
                        "Você preferiu respeitar o desgaste do corpo e investir na recuperação.",

                    apply(state) {
                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player.life
                                    .physicalCondition +
                                4
                            );

                        changePersonality(
                            state,
                            "discipline",
                            1
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            !isProfessional(
                gameState
            )
        ) {
            return null;
        }

        const status =
            gameState.player
                .football
                .squadStatus;

        if (
            ![
                "reserve",
                "rotation",
                "fringe",
                "under_review"
            ].includes(
                status
            )
        ) {
            return null;
        }

        return {
            id:
                "professional_lack_of_minutes",

            theme:
                "squad_status",

            category:
                "professional_life",

            minAge: 16,

            cooldownYears: 2,

            weight: 48,

            importance: 6,

            title:
                "Poucos minutos em campo",

            description:
                "Você sente que está recebendo menos oportunidades do que gostaria no time principal.",

            choices: [
                {
                    id:
                        "talk_to_coach",

                    label:
                        "Conversar com o treinador",

                    resultText:
                        "Você procurou o treinador para entender o que precisa fazer para receber mais oportunidades.",

                    apply(state) {
                        changeCoachTrust(
                            state,
                            1
                        );

                        changePersonality(
                            state,
                            "professionalism",
                            2
                        );
                    }
                },

                {
                    id:
                        "work_in_silence",

                    label:
                        "Continuar trabalhando em silêncio",

                    resultText:
                        "Você decidiu não reclamar e tentar conquistar espaço apenas pelo desempenho.",

                    apply(state) {
                        changePersonality(
                            state,
                            "resilience",
                            3
                        );

                        changeForm(
                            state,
                            1
                        );
                    }
                },

                {
                    id:
                        "show_frustration",

                    label:
                        "Demonstrar insatisfação",

                    resultText:
                        "Sua frustração ficou perceptível dentro do clube.",

                    apply(state) {
                        changeHappiness(
                            state,
                            -3
                        );

                        changeCoachTrust(
                            state,
                            -3
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
            !isProfessional(
                gameState
            )
        ) {
            return null;
        }

        const status =
            gameState.player
                .football
                .squadStatus;

        if (
            ![
                "starter",
                "key_player"
            ].includes(
                status
            )
        ) {
            return null;
        }

        return {
            id:
                "professional_expectation_pressure",

            theme:
                "pressure",

            category:
                "professional_life",

            minAge: 16,

            cooldownYears: 3,

            weight: 38,

            importance: 6,

            title:
                "A expectativa aumentou",

            description:
                "Depois de ganhar espaço, torcida e comissão passaram a esperar mais de você em todos os jogos.",

            choices: [
                {
                    id:
                        "embrace_pressure",

                    label:
                        "Aceitar a responsabilidade",

                    resultText:
                        "Você decidiu encarar a pressão como parte da evolução na carreira.",

                    apply(state) {
                        changePersonality(
                            state,
                            "resilience",
                            2
                        );

                        changePersonality(
                            state,
                            "ambition",
                            2
                        );

                        changeReputation(
                            state,
                            1
                        );
                    }
                },

                {
                    id:
                        "protect_yourself",

                    label:
                        "Tentar se proteger da pressão",

                    resultText:
                        "Você decidiu evitar expectativas externas e manter o foco na rotina.",

                    apply(state) {
                        changeHappiness(
                            state,
                            2
                        );

                        changePersonality(
                            state,
                            "discipline",
                            1
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            !isProfessional(
                gameState
            ) ||
            gameState.footballContext
                .form < 67
        ) {
            return null;
        }

        return {
            id:
                "professional_good_form_attention",

            theme:
                "media_attention",

            category:
                "professional_life",

            minAge: 16,

            cooldownYears: 2,

            weight: 42,

            importance: 6,

            title:
                "Seu bom momento chamou atenção",

            description:
                "Seu desempenho recente começou a render elogios e mais atenção fora do clube.",

            choices: [
                {
                    id:
                        "stay_low_profile",

                    label:
                        "Manter perfil discreto",

                    resultText:
                        "Você preferiu não alimentar a repercussão e continuou focado no futebol.",

                    apply(state) {
                        changePersonality(
                            state,
                            "professionalism",
                            2
                        );

                        changeReputation(
                            state,
                            1
                        );
                    }
                },

                {
                    id:
                        "enjoy_attention",

                    label:
                        "Aproveitar o momento",

                    resultText:
                        "Você aproveitou a fase positiva e se mostrou mais aberto à exposição.",

                    apply(state) {
                        changeHappiness(
                            state,
                            3
                        );

                        changeReputation(
                            state,
                            3
                        );

                        changePersonality(
                            state,
                            "ego",
                            1
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            !isProfessional(
                gameState
            ) ||
            gameState.footballContext
                .form > 42
        ) {
            return null;
        }

        return {
            id:
                "professional_bad_form_pressure",

            theme:
                "bad_form",

            category:
                "professional_life",

            minAge: 16,

            cooldownYears: 2,

            weight: 48,

            importance: 6,

            title:
                "A fase ruim começou a pesar",

            description:
                "Os últimos jogos ficaram abaixo do esperado e a cobrança aumentou dentro e fora do clube.",

            choices: [
                {
                    id:
                        "work_through_slump",

                    label:
                        "Confiar no trabalho",

                    resultText:
                        "Você decidiu manter a rotina e trabalhar para recuperar o nível.",

                    apply(state) {
                        changePersonality(
                            state,
                            "resilience",
                            3
                        );

                        changeCoachTrust(
                            state,
                            1
                        );
                    }
                },

                {
                    id:
                        "increase_training_load",

                    label:
                        "Treinar ainda mais",

                    resultText:
                        "Você aumentou sua carga individual para tentar reagir mais rápido.",

                    apply(state) {
                        changeForm(
                            state,
                            2
                        );

                        changePersonality(
                            state,
                            "ambition",
                            2
                        );

                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player.life
                                    .physicalCondition -
                                4
                            );
                    }
                },

                {
                    id:
                        "disconnect_from_football",

                    label:
                        "Tentar esfriar a cabeça",

                    resultText:
                        "Você se afastou um pouco do futebol fora dos horários do clube para aliviar a pressão.",

                    apply(state) {
                        changeHappiness(
                            state,
                            4
                        );

                        changePersonality(
                            state,
                            "adaptability",
                            1
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            !isProfessional(
                gameState
            ) ||
            !gameState.player
                .football
                .currentClubId
        ) {
            return null;
        }

        return {
            id:
                "professional_coach_feedback",

            theme:
                "coach_relationship",

            category:
                "professional_life",

            minAge: 16,

            cooldownYears: 3,

            weight: 35,

            importance: 5,

            title:
                "Conversa individual com a comissão",

            description:
                "A comissão técnica chamou você para uma conversa sobre seu momento e sua função dentro da equipe.",

            choices: [
                {
                    id:
                        "listen_openly",

                    label:
                        "Ouvir com atenção",

                    resultText:
                        "Você recebeu o feedback de forma aberta e saiu da conversa com pontos claros para trabalhar.",

                    apply(state) {
                        changeCoachTrust(
                            state,
                            3
                        );

                        changePersonality(
                            state,
                            "professionalism",
                            2
                        );

                        changePersonality(
                            state,
                            "adaptability",
                            1
                        );
                    }
                },

                {
                    id:
                        "defend_your_view",

                    label:
                        "Defender seu ponto de vista",

                    resultText:
                        "Você apresentou sua própria leitura sobre o momento e deixou claro como gostaria de ser utilizado.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
                            2
                        );

                        changePersonality(
                            state,
                            "ego",
                            1
                        );

                        changeCoachTrust(
                            state,
                            -1
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            !isProfessional(
                gameState
            ) ||
            (
                Number(
                    gameState.reputation
                        .overall
                ) || 0
            ) < 35
        ) {
            return null;
        }

        return {
            id:
                "professional_fan_recognition",

            theme:
                "public_recognition",

            category:
                "professional_life",

            minAge: 16,

            cooldownYears: 3,

            weight: 32,

            importance: 4,

            title:
                "Reconhecido fora do clube",

            description:
                "Algumas pessoas reconheceram você em um momento comum fora da rotina do futebol.",

            choices: [
                {
                    id:
                        "give_attention",

                    label:
                        "Parar para atender",

                    resultText:
                        "Você dedicou alguns minutos para fotos e conversa com quem se aproximou.",

                    apply(state) {
                        changeHappiness(
                            state,
                            2
                        );

                        changeReputation(
                            state,
                            2
                        );
                    }
                },

                {
                    id:
                        "leave_quickly",

                    label:
                        "Seguir sua rotina",

                    resultText:
                        "Você foi educado, mas preferiu não prolongar o momento.",

                    apply(state) {
                        changePersonality(
                            state,
                            "discipline",
                            1
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            !isProfessional(
                gameState
            ) ||
            gameState.calendar.age <
                18
        ) {
            return null;
        }

        return {
            id:
                "professional_day_off",

            theme:
                "lifestyle",

            category:
                "professional_life",

            minAge: 18,

            cooldownYears: 2,

            weight: 30,

            importance: 3,

            title:
                "Um dia completamente livre",

            description:
                "A comissão concedeu folga e, pela primeira vez em algum tempo, você não tem nenhuma obrigação com o clube.",

            choices: [
                {
                    id:
                        "rest",

                    label:
                        "Descansar de verdade",

                    resultText:
                        "Você usou o dia para recuperar o corpo e a cabeça.",

                    apply(state) {
                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player.life
                                    .physicalCondition +
                                5
                            );

                        changeHappiness(
                            state,
                            3
                        );
                    }
                },

                {
                    id:
                        "go_out",

                    label:
                        "Sair e aproveitar",

                    resultText:
                        "Você aproveitou a folga para viver um pouco longe do ambiente do futebol.",

                    apply(state) {
                        changeHappiness(
                            state,
                            6
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
                        "individual_work",

                    label:
                        "Fazer trabalho individual",

                    resultText:
                        "Mesmo na folga, você separou uma parte do dia para trabalhar individualmente.",

                    apply(state) {
                        changePersonality(
                            state,
                            "professionalism",
                            2
                        );

                        changePersonality(
                            state,
                            "discipline",
                            2
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            !isProfessional(
                gameState
            )
        ) {
            return null;
        }

        if (
            !gameState.professional
                ?.debut
        ) {
            return null;
        }

        return {
            id:
                "professional_realization",

            theme:
                "career_reflection",

            category:
                "professional_life",

            kind:
                "notification",

            minAge: 16,

            onceOnly: true,

            weight: 100,

            importance: 7,

            title:
                "A ficha começou a cair",

            description:
                "Depois de tantos anos entre treinos, avaliações e categorias de base, você percebe que agora realmente faz parte do futebol profissional.",

            resultText:
                "A chegada ao profissional virou um marco importante na sua história.",

            apply(state) {
                changeHappiness(
                    state,
                    4
                );
            }
        };
    }
];