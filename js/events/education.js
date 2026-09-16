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
            gameState.player
                .life
                .happiness +
            amount
        );
}


export const EDUCATION_EVENTS = [
    gameState => {
        if (
            !gameState.academy
                .currentClubId
        ) {
            return null;
        }

        return {
            id:
                "school_tournament_invitation",

            category:
                "education",

            minAge: 10,

            maxAge: 14,

            cooldownYears: 2,

            onceOnly: false,

            weight: 22,

            importance: 4,

            title:
                "Convite para representar a escola",

            description:
                "Sua escola quer que você dispute um torneio. Como você já treina em um clube, será preciso conciliar as duas rotinas.",

            choices: [
                {
                    id:
                        "play_school_tournament",

                    label:
                        "Jogar pela escola",

                    resultText:
                        "Você representou sua escola e viveu uma experiência diferente fora da rotina do clube.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            3,
                            "school_tournament"
                        );

                        changeHappiness(
                            state,
                            4
                        );

                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player
                                    .life
                                    .physicalCondition -
                                3
                            );
                    }
                },

                {
                    id:
                        "focus_on_club",

                    label:
                        "Priorizar o clube",

                    resultText:
                        "Você decidiu manter o foco na rotina da categoria de base.",

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

                        changeHappiness(
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
            gameState.education
                .performance >
            72
        ) {
            return null;
        }

        return {
            id:
                "school_performance_warning",

            category:
                "education",

            minAge: 10,

            maxAge: 17,

            cooldownYears: 2,

            weight: 28,

            importance: 5,

            title:
                "A escola cobra mais dedicação",

            description:
                "Seu rendimento escolar caiu e a escola entrou em contato com sua família.",

            choices: [
                {
                    id:
                        "study_more",

                    label:
                        "Dedicar mais tempo aos estudos",

                    resultText:
                        "Você reorganizou a rotina para melhorar o rendimento escolar.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            8,
                            "study_focus"
                        );

                        changeAttendance(
                            state,
                            2,
                            "study_focus"
                        );

                        state.player.life
                            .physicalCondition =
                            clamp(
                                state.player
                                    .life
                                    .physicalCondition -
                                2
                            );
                    }
                },

                {
                    id:
                        "keep_football_priority",

                    label:
                        "Manter o futebol como prioridade",

                    resultText:
                        "Você manteve a rotina esportiva mesmo com a cobrança escolar.",

                    apply(state) {
                        changeSchoolPerformance(
                            state,
                            -4,
                            "football_priority"
                        );

                        state.player.hidden
                            .personality
                            .ambition =
                            clamp(
                                state.player
                                    .hidden
                                    .personality
                                    .ambition +
                                2,
                                1,
                                99
                            );
                    }
                }
            ]
        };
    }
];