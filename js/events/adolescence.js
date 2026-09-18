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
            gameState.player.life
                .happiness +
            amount
        );
}


function changeCondition(
    gameState,
    amount
) {
    gameState.player.life
        .physicalCondition =
        clamp(
            gameState.player.life
                .physicalCondition +
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


export const ADOLESCENCE_EVENTS = [
    gameState => {
        if (
            gameState.calendar.age <
                14 ||
            gameState.calendar.age >
                18
        ) {
            return null;
        }

        return {
            id:
                "teen_party_invitation",

            theme:
                "teen_social_life",

            tags: [
                "adolescence",
                "social",
                "party"
            ],

            category:
                "adolescence",

            minAge: 14,

            maxAge: 18,

            cooldownYears: 3,

            weight: 36,

            importance: 4,

            title:
                "Convite para uma festa",

            description:
                "Alguns amigos convidaram você para uma festa justamente em um período de rotina intensa.",

            choices: [
                {
                    id:
                        "go_to_party",

                    label:
                        "Ir para a festa",

                    resultText:
                        "Você decidiu aproveitar a noite com os amigos.",

                    apply(state) {
                        changeHappiness(
                            state,
                            6
                        );

                        changeCondition(
                            state,
                            -3
                        );
                    }
                },

                {
                    id:
                        "skip_party",

                    label:
                        "Não ir",

                    resultText:
                        "Você preferiu descansar e manter sua rotina.",

                    apply(state) {
                        changePersonality(
                            state,
                            "discipline",
                            2
                        );

                        changeCondition(
                            state,
                            2
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.calendar.age <
                14 ||
            gameState.calendar.age >
                18
        ) {
            return null;
        }

        return {
            id:
                "teen_first_romantic_interest",

            theme:
                "romantic_interest",

            tags: [
                "adolescence",
                "romance"
            ],

            category:
                "adolescence",

            cooldownYears: 4,

            weight: 25,

            importance: 4,

            title:
                "Alguém chamou sua atenção",

            description:
                "Você começou a se interessar por alguém que faz parte da sua rotina fora do futebol.",

            choices: [
                {
                    id:
                        "try_get_closer",

                    label:
                        "Tentar se aproximar",

                    resultText:
                        "Você decidiu conhecer melhor essa pessoa.",

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
                },

                {
                    id:
                        "focus_elsewhere",

                    label:
                        "Não mexer nisso agora",

                    resultText:
                        "Você preferiu não iniciar nada neste momento.",

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
            gameState.calendar.age <
                13 ||
            gameState.calendar.age >
                18
        ) {
            return null;
        }

        return {
            id:
                "teen_phone_distraction",

            theme:
                "digital_life",

            tags: [
                "adolescence",
                "technology"
            ],

            category:
                "adolescence",

            cooldownYears: 3,

            weight: 31,

            importance: 3,

            title:
                "Tempo demais no celular",

            description:
                "Você percebeu que tem passado cada vez mais tempo no celular, inclusive antes de dormir.",

            choices: [
                {
                    id:
                        "reduce_phone_time",

                    label:
                        "Controlar melhor o uso",

                    resultText:
                        "Você decidiu reduzir um pouco o tempo de tela.",

                    apply(state) {
                        changePersonality(
                            state,
                            "discipline",
                            2
                        );

                        changeCondition(
                            state,
                            2
                        );
                    }
                },

                {
                    id:
                        "keep_using",

                    label:
                        "Continuar como está",

                    resultText:
                        "Você não mudou muito seus hábitos.",

                    apply(state) {
                        changeHappiness(
                            state,
                            2
                        );

                        changeCondition(
                            state,
                            -2
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.calendar.age <
                14 ||
            gameState.calendar.age >
                19
        ) {
            return null;
        }

        return {
            id:
                "teen_sleep_before_training",

            theme:
                "routine",

            tags: [
                "adolescence",
                "routine",
                "discipline"
            ],

            category:
                "adolescence",

            cooldownYears: 3,

            weight: 30,

            importance: 3,

            title:
                "Uma noite que ficou longa demais",

            description:
                "Você tem atividade importante no dia seguinte, mas acabou ficando acordado muito além do horário habitual.",

            choices: [
                {
                    id:
                        "go_to_sleep",

                    label:
                        "Largar tudo e dormir",

                    resultText:
                        "Você decidiu preservar o descanso.",

                    apply(state) {
                        changeCondition(
                            state,
                            4
                        );

                        changePersonality(
                            state,
                            "professionalism",
                            1
                        );
                    }
                },

                {
                    id:
                        "stay_awake",

                    label:
                        "Continuar acordado",

                    resultText:
                        "Você dormiu menos do que deveria.",

                    apply(state) {
                        changeCondition(
                            state,
                            -5
                        );

                        changeHappiness(
                            state,
                            2
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.calendar.age <
                15 ||
            gameState.calendar.age >
                18
        ) {
            return null;
        }

        return {
            id:
                "teen_future_uncertainty",

            theme:
                "future",

            tags: [
                "adolescence",
                "career",
                "education"
            ],

            category:
                "adolescence",

            cooldownYears: 3,

            weight: 35,

            importance: 5,

            title:
                "E se o futebol não der certo?",

            description:
                "Uma conversa sobre futuro fez você pensar pela primeira vez com mais seriedade no que faria se a carreira no futebol não acontecesse.",

            choices: [
                {
                    id:
                        "keep_plan_b",

                    label:
                        "Começar a pensar em um plano B",

                    resultText:
                        "Você decidiu não abandonar o sonho, mas passou a olhar com mais atenção para outras possibilidades.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            4,
                            "future_plan"
                        );

                        changePersonality(
                            state,
                            "adaptability",
                            2
                        );
                    }
                },

                {
                    id:
                        "football_only",

                    label:
                        "Pensar apenas no futebol",

                    resultText:
                        "Você decidiu colocar toda sua energia no objetivo de viver do futebol.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
                            3
                        );

                        changePersonality(
                            state,
                            "professionalism",
                            1
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.calendar.age <
                14 ||
            gameState.calendar.age >
                18
        ) {
            return null;
        }

        return {
            id:
                "teen_group_pressure",

            theme:
                "peer_pressure",

            tags: [
                "adolescence",
                "friends",
                "personality"
            ],

            category:
                "adolescence",

            cooldownYears: 4,

            weight: 24,

            importance: 5,

            title:
                "A pressão do grupo",

            description:
                "Alguns colegas começaram a provocar você por levar futebol, escola e rotina tão a sério.",

            choices: [
                {
                    id:
                        "ignore_pressure",

                    label:
                        "Não mudar por causa deles",

                    resultText:
                        "Você decidiu seguir sua própria rotina sem tentar agradar ao grupo.",

                    apply(state) {
                        changePersonality(
                            state,
                            "resilience",
                            3
                        );

                        changePersonality(
                            state,
                            "discipline",
                            1
                        );
                    }
                },

                {
                    id:
                        "loosen_up",

                    label:
                        "Tentar se enturmar mais",

                    resultText:
                        "Você decidiu flexibilizar um pouco sua rotina para participar mais da vida social.",

                    apply(state) {
                        changeHappiness(
                            state,
                            4
                        );

                        changePersonality(
                            state,
                            "adaptability",
                            2
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.calendar.age <
                16 ||
            gameState.calendar.age >
                19
        ) {
            return null;
        }

        return {
            id:
                "teen_independence",

            theme:
                "independence",

            tags: [
                "adolescence",
                "family",
                "independence"
            ],

            category:
                "adolescence",

            cooldownYears: 4,

            weight: 28,

            importance: 5,

            title:
                "Você quer mais independência",

            description:
                "Você começou a sentir que sua família ainda controla decisões que gostaria de tomar sozinho.",

            choices: [
                {
                    id:
                        "talk_with_family",

                    label:
                        "Conversar com a família",

                    resultText:
                        "Você tentou mostrar que está amadurecendo e gostaria de receber mais autonomia.",

                    apply(state) {
                        changePersonality(
                            state,
                            "adaptability",
                            2
                        );

                        changeHappiness(
                            state,
                            2
                        );
                    }
                },

                {
                    id:
                        "avoid_conflict",

                    label:
                        "Evitar discussão por enquanto",

                    resultText:
                        "Você preferiu esperar outro momento para falar sobre isso.",

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
    },


    gameState => {
        if (
            gameState.calendar.age <
                14 ||
            gameState.calendar.age >
                17
        ) {
            return null;
        }

        return {
            id:
                "teen_exam_training_conflict",

            theme:
                "school_football_conflict",

            tags: [
                "adolescence",
                "school",
                "football"
            ],

            category:
                "adolescence",

            cooldownYears: 3,

            weight: 38,

            importance: 5,

            title:
                "Prova importante e futebol no mesmo período",

            description:
                "Uma avaliação importante da escola caiu justamente em uma semana pesada no futebol.",

            choices: [
                {
                    id:
                        "study_more",

                    label:
                        "Reservar mais tempo para estudar",

                    resultText:
                        "Você reorganizou a semana para chegar mais preparado à prova.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            5,
                            "exam_training_conflict"
                        );

                        changeCondition(
                            state,
                            -1
                        );
                    }
                },

                {
                    id:
                        "football_priority",

                    label:
                        "Priorizar o futebol",

                    resultText:
                        "Você decidiu não alterar sua preparação esportiva.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            -3,
                            "football_priority"
                        );

                        changePersonality(
                            state,
                            "ambition",
                            2
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.calendar.age <
                15 ||
            gameState.calendar.age >
                19
        ) {
            return null;
        }

        return {
            id:
                "teen_weekend_trip",

            theme:
                "social_trip",

            tags: [
                "adolescence",
                "friends",
                "leisure"
            ],

            category:
                "adolescence",

            cooldownYears: 4,

            weight: 24,

            importance: 3,

            title:
                "Viagem curta com amigos",

            description:
                "Alguns amigos estão planejando passar um fim de semana fora e convidaram você.",

            choices: [
                {
                    id:
                        "go_trip",

                    label:
                        "Ir com eles",

                    resultText:
                        "Você aproveitou um fim de semana diferente e voltou de cabeça mais leve.",

                    apply(state) {
                        changeHappiness(
                            state,
                            7
                        );

                        changeCondition(
                            state,
                            -2
                        );
                    }
                },

                {
                    id:
                        "stay_home",

                    label:
                        "Ficar e manter a rotina",

                    resultText:
                        "Você recusou o convite e manteve sua programação normal.",

                    apply(state) {
                        changePersonality(
                            state,
                            "discipline",
                            2
                        );

                        changeCondition(
                            state,
                            3
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.calendar.age <
                14 ||
            gameState.calendar.age >
                18
        ) {
            return null;
        }

        return {
            id:
                "teen_identity_question",

            theme:
                "identity",

            tags: [
                "adolescence",
                "personal"
            ],

            category:
                "adolescence",

            cooldownYears: 4,

            weight: 22,

            importance: 4,

            title:
                "Nem tudo é futebol",

            description:
                "Você percebeu que muita gente já te conhece apenas como 'o garoto que joga futebol'.",

            choices: [
                {
                    id:
                        "explore_other_interests",

                    label:
                        "Descobrir outros interesses",

                    resultText:
                        "Você começou a reservar algum espaço para coisas que não têm relação direta com futebol.",

                    apply(state) {
                        changeHappiness(
                            state,
                            4
                        );

                        changePersonality(
                            state,
                            "adaptability",
                            2
                        );
                    }
                },

                {
                    id:
                        "embrace_football_identity",

                    label:
                        "Assumir que futebol é sua prioridade",

                    resultText:
                        "Você decidiu que não vê problema em colocar o futebol no centro da sua vida neste momento.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
                            2
                        );

                        changePersonality(
                            state,
                            "professionalism",
                            1
                        );
                    }
                }
            ]
        };
    }
];