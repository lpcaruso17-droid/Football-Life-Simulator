import {
    pick
} from "../core/rng.js";

import {
    getTeammates
} from "../systems/socialSystem.js";

import {
    modifyRelationship
} from "../systems/relationshipSystem.js";

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


function isAcademyPlayer(
    gameState
) {
    return Boolean(
        gameState.player
            .football
            .currentClubId
    ) &&
    !gameState.player
        .football
        .isProfessional &&
    !gameState.player
        .football
        .hasDebutedProfessionally;
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


function getRandomTeammate(
    gameState
) {
    const teammates =
        getTeammates(
            gameState
        );

    return pick(
        gameState.rng,
        teammates
    );
}


export const ACADEMY_EXTRA_EVENTS = [
    gameState => {
        if (
            !isAcademyPlayer(
                gameState
            )
        ) {
            return null;
        }

        const teammate =
            getRandomTeammate(
                gameState
            );

        if (!teammate) {
            return null;
        }

        return {
            id:
                "academy_teammate_promoted_first",

            theme:
                "teammate_progress",

            tags: [
                "academy",
                "competition",
                "teammate"
            ],

            personIds: [
                teammate.id
            ],

            relatedEntities: [
                teammate.id
            ],

            category:
                "academy",

            minAge: 13,

            maxAge: 20,

            cooldownYears: 4,

            weight: 26,

            importance: 5,

            title:
                `${teammate.identity.fullName} ganhou uma oportunidade antes de você`,

            description:
                "Um companheiro próximo recebeu uma oportunidade em uma categoria acima enquanto você permaneceu onde estava.",

            choices: [
                {
                    id:
                        "use_as_motivation",

                    label:
                        "Usar isso como motivação",

                    resultText:
                        "Você decidiu transformar a comparação em combustível para trabalhar mais.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
                            3
                        );

                        changePersonality(
                            state,
                            "resilience",
                            2
                        );
                    }
                },

                {
                    id:
                        "feel_overlooked",

                    label:
                        "Ficar incomodado",

                    resultText:
                        "Você sentiu que também merecia ter recebido aquela chance.",

                    apply(state) {
                        changeHappiness(
                            state,
                            -4
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
            !isAcademyPlayer(
                gameState
            )
        ) {
            return null;
        }

        const teammate =
            getRandomTeammate(
                gameState
            );

        if (!teammate) {
            return null;
        }

        return {
            id:
                "academy_teammate_released",

            theme:
                "release",

            tags: [
                "academy",
                "teammate",
                "release"
            ],

            personIds: [
                teammate.id
            ],

            relatedEntities: [
                teammate.id
            ],

            category:
                "academy",

            minAge: 12,

            maxAge: 20,

            cooldownYears: 4,

            weight: 27,

            importance: 6,

            title:
                `${teammate.identity.fullName} foi dispensado`,

            description:
                "Um companheiro que fazia parte da sua rotina deixou o clube depois de uma avaliação negativa.",

            choices: [
                {
                    id:
                        "support_teammate",

                    label:
                        "Procurar o companheiro",

                    resultText:
                        "Você conversou com ele e tentou dar apoio em um momento difícil.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            teammate.id,
                            {
                                affection: 4,
                                trust: 5,
                                loyalty: 4
                            },
                            "Apoiou o companheiro após a dispensa."
                        );

                        changePersonality(
                            state,
                            "resilience",
                            1
                        );
                    }
                },

                {
                    id:
                        "focus_on_your_future",

                    label:
                        "Pensar na sua própria situação",

                    resultText:
                        "A dispensa serviu como lembrete de como a carreira na base pode ser instável.",

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
            !isAcademyPlayer(
                gameState
            )
        ) {
            return null;
        }

        return {
            id:
                "academy_play_out_of_position",

            theme:
                "position_change",

            tags: [
                "academy",
                "position",
                "coach"
            ],

            category:
                "academy",

            minAge: 12,

            maxAge: 20,

            cooldownYears: 3,

            weight: 35,

            importance: 5,

            title:
                "O treinador quer testar você em outra função",

            description:
                "Durante os treinamentos, a comissão sugeriu utilizar você em uma função diferente da habitual.",

            choices: [
                {
                    id:
                        "accept_experiment",

                    label:
                        "Aceitar o teste",

                    resultText:
                        "Você se mostrou disponível para aprender uma função diferente.",

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
                    }
                },

                {
                    id:
                        "prefer_current_position",

                    label:
                        "Dizer que prefere sua posição",

                    resultText:
                        "Você deixou claro que acredita render melhor na sua função atual.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
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
            !isAcademyPlayer(
                gameState
            )
        ) {
            return null;
        }

        return {
            id:
                "academy_scout_in_stands",

            theme:
                "scouting",

            tags: [
                "academy",
                "scout",
                "pressure"
            ],

            category:
                "academy",

            minAge: 13,

            maxAge: 20,

            cooldownYears: 3,

            weight: 32,

            importance: 6,

            title:
                "Há observadores na arquibancada",

            description:
                "Antes da partida você ficou sabendo que profissionais de outros clubes estão acompanhando alguns atletas.",

            choices: [
                {
                    id:
                        "play_normally",

                    label:
                        "Tentar esquecer quem está assistindo",

                    resultText:
                        "Você procurou tratar a partida como qualquer outra.",

                    apply(state) {
                        changePersonality(
                            state,
                            "resilience",
                            2
                        );

                        changeForm(
                            state,
                            1
                        );
                    }
                },

                {
                    id:
                        "try_to_impress",

                    label:
                        "Tentar chamar atenção",

                    resultText:
                        "Você entrou em campo disposto a mostrar mais do seu jogo.",

                    apply(state) {
                        changeRecognition(
                            state,
                            3
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
            !isAcademyPlayer(
                gameState
            )
        ) {
            return null;
        }

        return {
            id:
                "academy_tournament_trip",

            theme:
                "tournament_trip",

            tags: [
                "academy",
                "travel",
                "competition"
            ],

            category:
                "academy",

            minAge: 11,

            maxAge: 20,

            cooldownYears: 3,

            weight: 30,

            importance: 4,

            title:
                "Viagem para disputar um torneio",

            description:
                "Sua equipe vai passar alguns dias fora para disputar uma competição importante da categoria.",

            choices: [
                {
                    id:
                        "focus_on_competition",

                    label:
                        "Entrar completamente no clima da competição",

                    resultText:
                        "Você tratou a viagem como uma oportunidade importante para crescer dentro do clube.",

                    apply(state) {
                        changePersonality(
                            state,
                            "professionalism",
                            2
                        );

                        changeCoachTrust(
                            state,
                            1
                        );
                    }
                },

                {
                    id:
                        "enjoy_experience",

                    label:
                        "Também aproveitar a experiência",

                    resultText:
                        "Além dos jogos, você aproveitou bastante a convivência com o grupo.",

                    apply(state) {
                        changeHappiness(
                            state,
                            5
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            !isAcademyPlayer(
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
                "fringe",
                "under_review",
                "rotation"
            ].includes(
                status
            )
        ) {
            return null;
        }

        return {
            id:
                "academy_left_out_big_game",

            theme:
                "selection_disappointment",

            tags: [
                "academy",
                "reserve",
                "competition"
            ],

            category:
                "academy",

            minAge: 13,

            maxAge: 20,

            cooldownYears: 3,

            weight: 38,

            importance: 6,

            title:
                "Você ficou fora de um jogo importante",

            description:
                "A comissão divulgou a lista para uma partida muito aguardada, e seu nome não estava entre os relacionados.",

            choices: [
                {
                    id:
                        "react_professionally",

                    label:
                        "Aceitar e continuar trabalhando",

                    resultText:
                        "Você controlou a frustração e voltou aos treinos determinado a recuperar espaço.",

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
                        "question_decision",

                    label:
                        "Questionar a decisão",

                    resultText:
                        "Você procurou explicações e deixou claro que não ficou satisfeito.",

                    apply(state) {
                        changeCoachTrust(
                            state,
                            -2
                        );

                        changePersonality(
                            state,
                            "ego",
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
            !isAcademyPlayer(
                gameState
            )
        ) {
            return null;
        }

        return {
            id:
                "academy_new_coach",

            theme:
                "coach_change",

            tags: [
                "academy",
                "coach",
                "change"
            ],

            category:
                "academy",

            minAge: 12,

            maxAge: 20,

            cooldownYears: 4,

            weight: 29,

            importance: 5,

            title:
                "Mudança na comissão técnica",

            description:
                "O clube trocou o treinador da sua categoria e todos precisarão conquistar espaço novamente.",

            choices: [
                {
                    id:
                        "embrace_restart",

                    label:
                        "Encarar como uma nova oportunidade",

                    resultText:
                        "Você decidiu mostrar desde o início que pode ser importante para o novo treinador.",

                    apply(state) {
                        changeCoachTrust(
                            state,
                            3
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
                        "feel_uncertain",

                    label:
                        "Ficar preocupado com a mudança",

                    resultText:
                        "A troca trouxe alguma insegurança sobre seu espaço no elenco.",

                    apply(state) {
                        changeHappiness(
                            state,
                            -3
                        );

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
            !isAcademyPlayer(
                gameState
            )
        ) {
            return null;
        }

        if (
            gameState.footballContext
                .coachTrust <
            65
        ) {
            return null;
        }

        return {
            id:
                "academy_leadership_role",

            theme:
                "leadership",

            tags: [
                "academy",
                "leadership",
                "team"
            ],

            category:
                "academy",

            minAge: 14,

            maxAge: 20,

            cooldownYears: 4,

            weight: 25,

            importance: 6,

            title:
                "A comissão espera mais liderança de você",

            description:
                "Seu espaço dentro do grupo cresceu, e o treinador começou a cobrar que você ajude também os companheiros.",

            choices: [
                {
                    id:
                        "embrace_leadership",

                    label:
                        "Assumir essa responsabilidade",

                    resultText:
                        "Você passou a tentar influenciar mais positivamente o grupo.",

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

                        changeRecognition(
                            state,
                            2
                        );
                    }
                },

                {
                    id:
                        "focus_on_yourself",

                    label:
                        "Preferir focar no próprio jogo",

                    resultText:
                        "Você decidiu que ainda prefere concentrar sua energia no próprio desempenho.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
                            1
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            !isAcademyPlayer(
                gameState
            )
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
                "academy_important_mistake",

            theme:
                "mistake",

            tags: [
                "academy",
                "bad_form",
                "pressure"
            ],

            category:
                "academy",

            minAge: 13,

            maxAge: 20,

            cooldownYears: 3,

            weight: 34,

            importance: 6,

            title:
                "Um erro que ficou na cabeça",

            description:
                "Um erro seu em uma partida importante acabou tendo bastante peso no resultado.",

            choices: [
                {
                    id:
                        "learn_from_mistake",

                    label:
                        "Analisar e aprender",

                    resultText:
                        "Você decidiu estudar o lance e transformar o erro em aprendizado.",

                    apply(state) {
                        changePersonality(
                            state,
                            "resilience",
                            3
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
                        "try_to_forget",

                    label:
                        "Tentar esquecer rapidamente",

                    resultText:
                        "Você preferiu não ficar revivendo o lance.",

                    apply(state) {
                        changeHappiness(
                            state,
                            2
                        );

                        changeForm(
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
            !isAcademyPlayer(
                gameState
            )
        ) {
            return null;
        }

        if (
            gameState.footballContext
                .form <
            67
        ) {
            return null;
        }

        return {
            id:
                "academy_decisive_performance",

            theme:
                "decisive_performance",

            tags: [
                "academy",
                "good_form",
                "recognition"
            ],

            category:
                "academy",

            minAge: 13,

            maxAge: 20,

            cooldownYears: 3,

            weight: 35,

            importance: 6,

            title:
                "Você decidiu um jogo importante",

            description:
                "Sua atuação teve peso direto em uma vitória importante da equipe e repercutiu dentro do clube.",

            choices: [
                {
                    id:
                        "stay_grounded",

                    label:
                        "Tratar como apenas mais um passo",

                    resultText:
                        "Você recebeu os elogios, mas manteve o discurso de evolução.",

                    apply(state) {
                        changeRecognition(
                            state,
                            4
                        );

                        changeCoachTrust(
                            state,
                            3
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
                        "enjoy_moment",

                    label:
                        "Aproveitar o reconhecimento",

                    resultText:
                        "Você aproveitou bastante a repercussão da atuação.",

                    apply(state) {
                        changeRecognition(
                            state,
                            5
                        );

                        changeHappiness(
                            state,
                            5
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
            !isAcademyPlayer(
                gameState
            ) ||
            gameState.calendar.age <
                14
        ) {
            return null;
        }

        return {
            id:
                "academy_training_older_category",

            theme:
                "category_opportunity",

            tags: [
                "academy",
                "promotion",
                "older_category"
            ],

            category:
                "academy",

            minAge: 14,

            maxAge: 19,

            cooldownYears: 3,

            weight: 34,

            importance: 6,

            title:
                "Treino com uma categoria acima",

            description:
                "Você recebeu a oportunidade de participar de algumas atividades com jogadores mais velhos.",

            choices: [
                {
                    id:
                        "play_bold",

                    label:
                        "Tentar mostrar personalidade",

                    resultText:
                        "Você decidiu aproveitar a chance sem se esconder.",

                    apply(state) {
                        changeRecognition(
                            state,
                            3
                        );

                        changePersonality(
                            state,
                            "ambition",
                            2
                        );
                    }
                },

                {
                    id:
                        "keep_simple",

                    label:
                        "Jogar de forma simples",

                    resultText:
                        "Você priorizou segurança e adaptação ao ritmo mais forte.",

                    apply(state) {
                        changeCoachTrust(
                            state,
                            2
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
            !isAcademyPlayer(
                gameState
            ) ||
            gameState.calendar.age >
                17
        ) {
            return null;
        }

        if (
            gameState.education
                .performance >=
            65
        ) {
            return null;
        }

        return {
            id:
                "academy_school_requirement",

            theme:
                "club_school_pressure",

            tags: [
                "academy",
                "school",
                "club"
            ],

            category:
                "academy",

            minAge: 12,

            maxAge: 17,

            cooldownYears: 3,

            weight: 37,

            importance: 5,

            title:
                "O clube chamou atenção para suas notas",

            description:
                "Seu desempenho escolar começou a preocupar quem acompanha sua rotina dentro do clube.",

            choices: [
                {
                    id:
                        "improve_school",

                    label:
                        "Levar a cobrança a sério",

                    resultText:
                        "Você decidiu reorganizar parte da rotina para melhorar na escola.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            6,
                            "club_school_requirement"
                        );

                        changeCoachTrust(
                            state,
                            1
                        );
                    }
                },

                {
                    id:
                        "maintain_football_priority",

                    label:
                        "Manter o futebol como prioridade",

                    resultText:
                        "Você ouviu a cobrança, mas continuou concentrando mais energia no futebol.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
                            2
                        );

                        changeSchoolPerformance(
                            state,
                            -2,
                            "football_priority"
                        );
                    }
                }
            ]
        };
    }
];