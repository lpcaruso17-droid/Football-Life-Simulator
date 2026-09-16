import {
    pick
} from "../core/rng.js";

import {
    getCloseFriends,
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


export const FRIEND_EVENTS = [
    gameState => {
        if (
            gameState.calendar.age >
            13
        ) {
            return null;
        }

        const friends =
            getCloseFriends(
                gameState
            );

        const friend =
            pick(
                gameState.rng,
                friends
            );

        if (!friend) {
            return null;
        }

        return {
            id:
                "friend_birthday",

            category:
                "social",

            minAge: 10,

            maxAge: 13,

            cooldownYears: 2,

            weight: 24,

            importance: 3,

            title:
                `Aniversário de ${friend.identity.fullName}`,

            description:
                "Um amigo próximo marcou uma comemoração no mesmo período de uma atividade do futebol.",

            relatedEntities: [
                friend.id
            ],

            choices: [
                {
                    id:
                        "go_to_birthday",

                    label:
                        "Ir ao aniversário",

                    resultText:
                        "Você decidiu participar da comemoração e fortaleceu uma amizade importante.",

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
                                affection: 6,
                                trust: 3
                            },
                            "Compareceu ao aniversário."
                        );
                    }
                },

                {
                    id:
                        "prioritize_training",

                    label:
                        "Priorizar o futebol",

                    resultText:
                        "Você abriu mão da comemoração para cumprir a rotina no futebol.",

                    apply(state) {
                        state.player.hidden
                            .personality
                            .discipline =
                            clamp(
                                state.player
                                    .hidden
                                    .personality
                                    .discipline +
                                2,
                                1,
                                99
                            );

                        modifyRelationship(
                            state,
                            state.player.id,
                            friend.id,
                            {
                                affection: -3
                            },
                            "Não compareceu ao aniversário."
                        );
                    }
                }
            ]
        };
    },

    gameState => {
        if (
            gameState.calendar.age <
            14
        ) {
            return null;
        }

        const friends =
            getCloseFriends(
                gameState
            );

        const friend =
            pick(
                gameState.rng,
                friends
            );

        if (!friend) {
            return null;
        }

        return {
            id:
                "friend_party_invitation",

            category:
                "social",

            minAge: 14,

            maxAge: 20,

            cooldownYears: 1,

            weight: 28,

            importance: 4,

            title:
                "Convite para uma festa",

            description:
                `${friend.identity.fullName} chamou você para uma festa na véspera de um compromisso de futebol.`,

            relatedEntities: [
                friend.id
            ],

            choices: [
                {
                    id:
                        "go_to_party",

                    label:
                        "Ir à festa",

                    resultText:
                        "Você decidiu aproveitar a noite com os amigos.",

                    apply(state) {
                        changeHappiness(
                            state,
                            7
                        );

                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player
                                    .life
                                    .physicalCondition -
                                7
                            );

                        modifyRelationship(
                            state,
                            state.player.id,
                            friend.id,
                            {
                                affection: 5,
                                trust: 2
                            },
                            "Saiu para a festa."
                        );
                    }
                },

                {
                    id:
                        "stay_home",

                    label:
                        "Ficar em casa",

                    resultText:
                        "Você preferiu descansar e preservar sua preparação.",

                    apply(state) {
                        state.player.hidden
                            .personality
                            .professionalism =
                            clamp(
                                state.player
                                    .hidden
                                    .personality
                                    .professionalism +
                                2,
                                1,
                                99
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
                "teammate_training_conflict",

            category:
                "social",

            minAge: 11,

            maxAge: 20,

            cooldownYears: 2,

            weight: 20,

            importance: 4,

            title:
                "Atrito com um companheiro",

            description:
                `Durante um treino, você e ${teammate.identity.fullName} se desentenderam após uma jogada mais forte.`,

            relatedEntities: [
                teammate.id
            ],

            choices: [
                {
                    id:
                        "talk_after_training",

                    label:
                        "Conversar depois do treino",

                    resultText:
                        "A conversa diminuiu a tensão entre vocês.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            teammate.id,
                            {
                                trust: 4,
                                respect: 3,
                                conflict: -6
                            },
                            "Resolveu o conflito conversando."
                        );
                    }
                },

                {
                    id:
                        "confront_teammate",

                    label:
                        "Responder na hora",

                    resultText:
                        "O clima ficou mais pesado entre vocês.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            teammate.id,
                            {
                                respect: 2,
                                conflict: 8,
                                trust: -4
                            },
                            "O conflito aumentou durante o treino."
                        );
                    }
                }
            ]
        };
    }
];