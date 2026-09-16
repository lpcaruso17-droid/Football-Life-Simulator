import {
    pick
} from "../core/rng.js";

import {
    getCloseFriends
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


export const CHILDHOOD_EVENTS = [
    gameState => {
        if (
            gameState.calendar.age >
            12
        ) {
            return null;
        }

        return {
            id:
                "childhood_school_project",

            theme:
                "school_balance",

            category:
                "childhood",

            minAge: 10,

            maxAge: 12,

            cooldownYears: 3,

            weight: 40,

            importance: 3,

            title:
                "Trabalho importante na escola",

            description:
                "Sua turma recebeu um trabalho que exige bastante tempo justamente durante uma semana cheia de futebol.",

            choices: [
                {
                    id:
                        "focus_project",

                    label:
                        "Caprichar no trabalho",

                    resultText:
                        "Você dedicou mais tempo à escola e entregou um bom trabalho.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            5,
                            "school_project"
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
                        "do_minimum",

                    label:
                        "Fazer apenas o necessário",

                    resultText:
                        "Você fez o suficiente para entregar o trabalho e manteve sua rotina no futebol.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            -1,
                            "school_project_minimum"
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
    },


    gameState => {
        const friends =
            getCloseFriends(
                gameState
            );

        const friend =
            pick(
                gameState.rng,
                friends
            );

        if (
            !friend ||
            gameState.calendar.age >
                13
        ) {
            return null;
        }

        return {
            id:
                "childhood_friend_afternoon",

            theme:
                "friendship",

            category:
                "childhood",

            minAge: 10,

            maxAge: 13,

            cooldownYears: 3,

            weight: 35,

            importance: 3,

            title:
                `Uma tarde com ${friend.identity.fullName}`,

            description:
                "Um amigo chamou você para aproveitar uma tarde livre depois da escola.",

            relatedEntities: [
                friend.id
            ],

            choices: [
                {
                    id:
                        "spend_afternoon",

                    label:
                        "Ir encontrar o amigo",

                    resultText:
                        "Você aproveitou algumas horas longe da pressão do futebol.",

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
                                affection: 5,
                                trust: 2
                            },
                            "Passaram uma tarde juntos."
                        );
                    }
                },

                {
                    id:
                        "rest_at_home",

                    label:
                        "Ficar em casa descansando",

                    resultText:
                        "Você preferiu descansar e recuperar as energias.",

                    apply(state) {
                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player.life
                                    .physicalCondition +
                                4
                            );

                        modifyRelationship(
                            state,
                            state.player.id,
                            friend.id,
                            {
                                affection: -1
                            },
                            "Recusou o convite."
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.calendar.age >
            13
        ) {
            return null;
        }

        return {
            id:
                "childhood_teacher_feedback",

            theme:
                "school_feedback",

            category:
                "childhood",

            minAge: 10,

            maxAge: 13,

            cooldownYears: 3,

            weight: 28,

            importance: 3,

            title:
                "Uma conversa com o professor",

            description:
                "Um professor percebeu que sua rotina com o futebol é diferente da maioria dos colegas.",

            choices: [
                {
                    id:
                        "talk_about_dream",

                    label:
                        "Contar sobre seu sonho no futebol",

                    resultText:
                        "Você falou sobre seus objetivos e recebeu incentivo para manter os estudos junto com o esporte.",

                    apply(state) {
                        changePersonality(
                            state,
                            "ambition",
                            2
                        );

                        changeSchoolPerformance(
                            state,
                            2,
                            "teacher_support"
                        );
                    }
                },

                {
                    id:
                        "keep_private",

                    label:
                        "Não falar muito sobre futebol",

                    resultText:
                        "Você preferiu manter seus planos para você mesmo.",

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
            gameState.calendar.age >
            13
        ) {
            return null;
        }

        return {
            id:
                "childhood_free_weekend",

            theme:
                "free_time",

            category:
                "childhood",

            minAge: 10,

            maxAge: 13,

            cooldownYears: 2,

            weight: 32,

            importance: 2,

            title:
                "Um raro fim de semana livre",

            description:
                "Pela primeira vez em algum tempo você não tem jogo nem atividade obrigatória no fim de semana.",

            choices: [
                {
                    id:
                        "enjoy_free_time",

                    label:
                        "Aproveitar para descansar",

                    resultText:
                        "Você aproveitou o tempo livre e voltou mais leve para a rotina.",

                    apply(state) {
                        changeHappiness(
                            state,
                            5
                        );

                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player.life
                                    .physicalCondition +
                                3
                            );
                    }
                },

                {
                    id:
                        "practice_anyway",

                    label:
                        "Treinar mesmo assim",

                    resultText:
                        "Você aproveitou o tempo livre para praticar alguns fundamentos.",

                    apply(state) {
                        changePersonality(
                            state,
                            "professionalism",
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
    }
];