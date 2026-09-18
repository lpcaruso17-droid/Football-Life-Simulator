import {
    pick
} from "../core/rng.js";

import {
    getCloseFriends
} from "../systems/socialSystem.js";

import {
    getPerson
} from "../systems/personSystem.js";

import {
    modifyRelationship
} from "../systems/relationshipSystem.js";

import {
    changeSchoolPerformance,
    changeAttendance
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


function getRandomFriend(
    gameState
) {
    return pick(
        gameState.rng,
        getCloseFriends(
            gameState
        )
    );
}


function getRandomParent(
    gameState
) {
    const ids = [
        gameState.family
            ?.fatherId,

        gameState.family
            ?.motherId
    ].filter(Boolean);

    const id =
        pick(
            gameState.rng,
            ids
        );

    if (!id) {
        return null;
    }

    return getPerson(
        gameState,
        id
    );
}


function getRandomSibling(
    gameState
) {
    const id =
        pick(
            gameState.rng,
            gameState.family
                ?.siblingIds ??
            []
        );

    if (!id) {
        return null;
    }

    return getPerson(
        gameState,
        id
    );
}


export const YOUTH_SOCIAL_EVENTS = [
    gameState => {
        const friend =
            getRandomFriend(
                gameState
            );

        if (
            !friend ||
            gameState.calendar.age >
                19
        ) {
            return null;
        }

        return {
            id:
                "youth_friend_birthday",

            theme:
                "birthday",

            tags: [
                "friends",
                "birthday",
                "social"
            ],

            personIds: [
                friend.id
            ],

            relatedEntities: [
                friend.id
            ],

            category:
                "friends",

            minAge: 10,

            maxAge: 19,

            cooldownYears: 3,

            weight: 27,

            importance: 3,

            title:
                `Aniversário de ${friend.identity.fullName}`,

            description:
                `${friend.identity.fullName} chamou você para comemorar o aniversário com alguns amigos.`,

            choices: [
                {
                    id:
                        "attend_birthday",

                    label:
                        "Ir ao aniversário",

                    resultText:
                        "Você participou da comemoração e passou um tempo com os amigos.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            friend.id,
                            {
                                affection: 5,
                                trust: 2
                            },
                            "Foi ao aniversário."
                        );

                        changeHappiness(
                            state,
                            4
                        );
                    }
                },

                {
                    id:
                        "skip_birthday",

                    label:
                        "Não conseguir ir",

                    resultText:
                        "Você não participou da comemoração por causa da sua rotina.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            friend.id,
                            {
                                affection: -2
                            },
                            "Não foi ao aniversário."
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        const friend =
            getRandomFriend(
                gameState
            );

        if (
            !friend ||
            gameState.calendar.age <
                12 ||
            gameState.calendar.age >
                19
        ) {
            return null;
        }

        return {
            id:
                "youth_friend_drifting",

            theme:
                "friendship_distance",

            tags: [
                "friends",
                "distance"
            ],

            personIds: [
                friend.id
            ],

            relatedEntities: [
                friend.id
            ],

            category:
                "friends",

            cooldownYears: 4,

            weight: 26,

            importance: 4,

            title:
                `Você e ${friend.identity.fullName} estão mais distantes`,

            description:
                "A rotina mudou e vocês não têm passado tanto tempo juntos quanto antes.",

            choices: [
                {
                    id:
                        "try_reconnect",

                    label:
                        "Tentar recuperar a amizade",

                    resultText:
                        "Você tomou a iniciativa de procurar seu amigo com mais frequência.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            friend.id,
                            {
                                affection: 4,
                                trust: 3
                            },
                            "Tentou recuperar a proximidade."
                        );
                    }
                },

                {
                    id:
                        "accept_distance",

                    label:
                        "Aceitar que as coisas mudaram",

                    resultText:
                        "Você entendeu que algumas amizades mudam conforme a vida avança.",

                    apply(state) {
                        changePersonality(
                            state,
                            "adaptability",
                            2
                        );

                        modifyRelationship(
                            state,
                            state.player.id,
                            friend.id,
                            {
                                affection: -2
                            },
                            "A relação esfriou."
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        const friend =
            getRandomFriend(
                gameState
            );

        if (
            !friend ||
            gameState.calendar.age <
                13 ||
            gameState.calendar.age >
                20
        ) {
            return null;
        }

        if (
            gameState.footballContext
                .form >
            45
        ) {
            return null;
        }

        return {
            id:
                "youth_friend_support_bad_phase",

            theme:
                "friend_support",

            tags: [
                "friends",
                "bad_form",
                "support"
            ],

            personIds: [
                friend.id
            ],

            relatedEntities: [
                friend.id
            ],

            category:
                "friends",

            cooldownYears: 4,

            weight: 30,

            importance: 4,

            title:
                `${friend.identity.fullName} percebeu que você não está bem`,

            description:
                "Depois de alguns dias mais difíceis, seu amigo procurou você para saber se estava tudo certo.",

            choices: [
                {
                    id:
                        "open_up",

                    label:
                        "Falar sobre o que está acontecendo",

                    resultText:
                        "Você conversou sobre as dificuldades e se sentiu um pouco mais leve.",

                    apply(state) {
                        changeHappiness(
                            state,
                            5
                        );

                        modifyRelationship(
                            state,
                            state.player.id,
                            friend.id,
                            {
                                trust: 6,
                                affection: 3
                            },
                            "Conversaram durante uma fase difícil."
                        );
                    }
                },

                {
                    id:
                        "say_everything_is_fine",

                    label:
                        "Dizer que está tudo bem",

                    resultText:
                        "Você preferiu guardar os problemas para si.",

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
        const parent =
            getRandomParent(
                gameState
            );

        if (
            !parent ||
            gameState.calendar.age <
                13 ||
            gameState.calendar.age >
                19
        ) {
            return null;
        }

        return {
            id:
                "youth_parent_future_conversation",

            theme:
                "family_future",

            tags: [
                "family",
                "career",
                "future"
            ],

            personIds: [
                parent.id
            ],

            relatedEntities: [
                parent.id
            ],

            category:
                "family",

            cooldownYears: 4,

            weight: 31,

            importance: 5,

            title:
                `${parent.identity.fullName} quer conversar sobre seu futuro`,

            description:
                "Dentro de casa surgiu uma conversa mais séria sobre futebol, estudos e os próximos anos da sua vida.",

            choices: [
                {
                    id:
                        "listen_parent",

                    label:
                        "Ouvir o conselho",

                    resultText:
                        "Você ouviu com atenção as preocupações e conselhos da família.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            parent.id,
                            {
                                trust: 5,
                                affection: 2
                            },
                            "Conversaram sobre o futuro."
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
                        "defend_your_plan",

                    label:
                        "Defender o seu plano",

                    resultText:
                        "Você explicou que acredita no caminho que está seguindo.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
                            3
                        );

                        modifyRelationship(
                            state,
                            state.player.id,
                            parent.id,
                            {
                                trust: -1
                            },
                            "Discordaram sobre o futuro."
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        const sibling =
            getRandomSibling(
                gameState
            );

        if (
            !sibling ||
            gameState.calendar.age >
                20
        ) {
            return null;
        }

        return {
            id:
                "youth_sibling_achievement",

            theme:
                "sibling_life",

            tags: [
                "family",
                "sibling"
            ],

            personIds: [
                sibling.id
            ],

            relatedEntities: [
                sibling.id
            ],

            category:
                "family",

            cooldownYears: 4,

            weight: 23,

            importance: 3,

            title:
                `${sibling.identity.fullName} também tem novidades`,

            description:
                "Seu irmão ou irmã viveu uma conquista importante e, por alguns dias, a atenção da família deixou de estar concentrada no futebol.",

            choices: [
                {
                    id:
                        "celebrate_sibling",

                    label:
                        "Comemorar junto",

                    resultText:
                        "Você fez questão de valorizar a conquista do seu irmão ou irmã.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            sibling.id,
                            {
                                affection: 6,
                                trust: 3
                            },
                            "Comemoraram uma conquista."
                        );

                        changeHappiness(
                            state,
                            3
                        );
                    }
                },

                {
                    id:
                        "stay_focused_on_routine",

                    label:
                        "Continuar focado na sua rotina",

                    resultText:
                        "Você ficou feliz pela conquista, mas manteve sua atenção nas próprias responsabilidades.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            sibling.id,
                            {
                                affection: 1
                            },
                            "Reconheceu a conquista."
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.calendar.age >
            17
        ) {
            return null;
        }

        if (
            gameState.education
                .attendance >=
            88
        ) {
            return null;
        }

        return {
            id:
                "youth_school_attendance_warning",

            theme:
                "school_attendance",

            tags: [
                "school",
                "attendance"
            ],

            category:
                "education",

            minAge: 10,

            maxAge: 17,

            cooldownYears: 3,

            weight: 40,

            importance: 5,

            title:
                "A escola chamou atenção para suas faltas",

            description:
                "Sua rotina começou a afetar a frequência escolar e a situação virou assunto com professores e família.",

            choices: [
                {
                    id:
                        "improve_attendance",

                    label:
                        "Tentar faltar menos",

                    resultText:
                        "Você decidiu reorganizar parte da rotina para melhorar a presença na escola.",

                    apply(state) {
                        changeAttendance(
                            state,
                            7,
                            "attendance_warning"
                        );

                        changePersonality(
                            state,
                            "discipline",
                            2
                        );
                    }
                },

                {
                    id:
                        "accept_absences",

                    label:
                        "Aceitar que o futebol exige isso",

                    resultText:
                        "Você decidiu que algumas faltas são inevitáveis enquanto sua rotina esportiva estiver tão intensa.",

                    apply(state) {
                        changeAttendance(
                            state,
                            -2,
                            "football_absences"
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
            gameState.calendar.age >
            17
        ) {
            return null;
        }

        if (
            gameState.education
                .performance <
            78
        ) {
            return null;
        }

        return {
            id:
                "youth_teacher_praise",

            theme:
                "school_success",

            tags: [
                "school",
                "performance"
            ],

            category:
                "education",

            cooldownYears: 3,

            weight: 28,

            importance: 3,

            title:
                "Um professor elogiou seu desempenho",

            description:
                "Apesar da rotina de futebol, você recebeu um elogio pelo comprometimento com a escola.",

            choices: [
                {
                    id:
                        "keep_balance",

                    label:
                        "Tentar manter esse equilíbrio",

                    resultText:
                        "Você ficou satisfeito por conseguir conciliar as duas partes da sua vida.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            2,
                            "teacher_praise"
                        );

                        changeHappiness(
                            state,
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
                        "focus_more_football",

                    label:
                        "Aproveitar que a escola está bem e focar mais no futebol",

                    resultText:
                        "Você decidiu que pode dedicar um pouco mais de energia ao futebol neste período.",

                    apply(state) {
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
            gameState.calendar.age >
            17
        ) {
            return null;
        }

        return {
            id:
                "youth_group_school_project",

            theme:
                "school_group_work",

            tags: [
                "school",
                "social"
            ],

            category:
                "education",

            minAge: 11,

            maxAge: 17,

            cooldownYears: 3,

            weight: 30,

            importance: 3,

            title:
                "Trabalho em grupo começou a complicar",

            description:
                "Seus colegas estão cobrando mais participação em um trabalho da escola, mas sua agenda está apertada.",

            choices: [
                {
                    id:
                        "make_time_project",

                    label:
                        "Arrumar tempo para ajudar mais",

                    resultText:
                        "Você reorganizou alguns horários para participar melhor do trabalho.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            4,
                            "group_project"
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
                        "explain_schedule",

                    label:
                        "Explicar sua rotina aos colegas",

                    resultText:
                        "Você tentou fazer o grupo entender as limitações causadas pela rotina esportiva.",

                    apply(state) {
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
        const parent =
            getRandomParent(
                gameState
            );

        if (
            !parent ||
            gameState.calendar.age >
                17
        ) {
            return null;
        }

        return {
            id:
                "youth_family_missed_moment",

            theme:
                "family_absence",

            tags: [
                "family",
                "football",
                "absence"
            ],

            personIds: [
                parent.id
            ],

            relatedEntities: [
                parent.id
            ],

            category:
                "family",

            minAge: 11,

            maxAge: 17,

            cooldownYears: 4,

            weight: 24,

            importance: 4,

            title:
                "O futebol fez você perder um momento em família",

            description:
                "Uma atividade do clube coincidiu com um encontro importante da família.",

            choices: [
                {
                    id:
                        "talk_family_after",

                    label:
                        "Conversar com a família depois",

                    resultText:
                        "Você explicou que gostaria de ter participado, mas não tinha como abandonar o compromisso.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            parent.id,
                            {
                                trust: 3,
                                affection: 2
                            },
                            "Conversaram sobre a ausência."
                        );
                    }
                },

                {
                    id:
                        "treat_as_part_of_career",

                    label:
                        "Aceitar como parte da carreira",

                    resultText:
                        "Você tentou não pensar muito no assunto e seguiu a rotina.",

                    apply(state) {
                        changePersonality(
                            state,
                            "professionalism",
                            2
                        );

                        changeHappiness(
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
                13 ||
            gameState.calendar.age >
                18
        ) {
            return null;
        }

        return {
            id:
                "youth_school_recovery_week",

            theme:
                "school_pressure",

            tags: [
                "school",
                "performance",
                "pressure"
            ],

            category:
                "education",

            cooldownYears: 3,

            weight: 29,

            importance: 4,

            title:
                "Semana decisiva na escola",

            description:
                "Algumas avaliações importantes chegaram juntas e você precisa decidir quanto espaço dará aos estudos nesta semana.",

            choices: [
                {
                    id:
                        "study_hard",

                    label:
                        "Diminuir o ritmo fora dos treinos e estudar",

                    resultText:
                        "Você dedicou boa parte do tempo livre às avaliações.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            6,
                            "important_school_week"
                        );

                        changeHappiness(
                            state,
                            -1
                        );
                    }
                },

                {
                    id:
                        "maintain_normal_routine",

                    label:
                        "Manter a rotina normal",

                    resultText:
                        "Você preferiu não alterar sua programação por causa das provas.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            -2,
                            "normal_routine"
                        );

                        changePersonality(
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