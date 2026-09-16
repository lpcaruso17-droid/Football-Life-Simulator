import {
    pick
} from "../core/rng.js";

import {
    getPerson
} from "../systems/personSystem.js";

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


function getAvailableParent(
    gameState
) {
    const ids = [
        gameState.family
            ?.fatherId,

        gameState.family
            ?.motherId
    ].filter(Boolean);

    const selectedId =
        pick(
            gameState.rng,
            ids
        );

    if (!selectedId) {
        return null;
    }

    return getPerson(
        gameState,
        selectedId
    );
}


export const FAMILY_EVENTS = [
    gameState => {
        const parent =
            getAvailableParent(
                gameState
            );

        if (!parent) {
            return null;
        }

        return {
            id:
                "family_weekend_request",

            category:
                "family",

            minAge: 10,

            maxAge: 15,

            cooldownYears: 3,

            weight: 30,

            importance: 3,

            title:
                "Um fim de semana em família",

            description:
                `${parent.identity.fullName} quer aproveitar um fim de semana livre com você.`,

            relatedEntities: [
                parent.id
            ],

            choices: [
                {
                    id:
                        "spend_time_family",

                    label:
                        "Passar o dia com a família",

                    resultText:
                        "Você deixou o futebol um pouco de lado e aproveitou o tempo com sua família.",

                    apply(state) {
                        changeHappiness(
                            state,
                            5
                        );

                        modifyRelationship(
                            state,
                            state.player.id,
                            parent.id,
                            {
                                affection: 5,
                                trust: 2
                            },
                            "Passaram um dia juntos."
                        );
                    }
                },

                {
                    id:
                        "extra_individual_training",

                    label:
                        "Usar o tempo para treinar",

                    resultText:
                        "Você preferiu utilizar parte do tempo livre para continuar treinando.",

                    apply(state) {
                        changePersonality(
                            state,
                            "discipline",
                            2
                        );

                        changePersonality(
                            state,
                            "ambition",
                            1
                        );

                        modifyRelationship(
                            state,
                            state.player.id,
                            parent.id,
                            {
                                affection: -1
                            },
                            "Preferiu treinar."
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        if (
            gameState.education
                .performance >=
            68
        ) {
            return null;
        }

        const parent =
            getAvailableParent(
                gameState
            );

        if (!parent) {
            return null;
        }

        return {
            id:
                "family_school_concern",

            category:
                "family",

            minAge: 10,

            maxAge: 17,

            cooldownYears: 2,

            weight: 38,

            importance: 5,

            title:
                "A família está preocupada com a escola",

            description:
                "Seu desempenho escolar virou assunto dentro de casa. A rotina do futebol começou a preocupar sua família.",

            choices: [
                {
                    id:
                        "promise_improvement",

                    label:
                        "Prometer melhorar na escola",

                    resultText:
                        "Você prometeu reorganizar sua rotina e dar mais atenção aos estudos.",

                    apply(state) {
                        state.education
                            .performance =
                            clamp(
                                state.education
                                    .performance +
                                5
                            );

                        modifyRelationship(
                            state,
                            state.player.id,
                            parent.id,
                            {
                                trust: 4
                            },
                            "Prometeu melhorar na escola."
                        );
                    }
                },

                {
                    id:
                        "defend_football_focus",

                    label:
                        "Defender sua prioridade no futebol",

                    resultText:
                        "Você deixou claro que acredita que este momento exige dedicação ao futebol.",

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
                                conflict: 4,
                                trust: -2
                            },
                            "Discordaram sobre escola e futebol."
                        );
                    }
                }
            ]
        };
    },


    gameState => {
        const siblingIds =
            gameState.family
                ?.siblingIds ??
            [];

        if (!siblingIds.length) {
            return null;
        }

        const siblingId =
            pick(
                gameState.rng,
                siblingIds
            );

        const sibling =
            getPerson(
                gameState,
                siblingId
            );

        if (!sibling) {
            return null;
        }

        return {
            id:
                "sibling_attention",

            category:
                "family",

            minAge: 10,

            maxAge: 18,

            cooldownYears: 3,

            weight: 24,

            importance: 3,

            title:
                "Nem tudo gira em torno do futebol",

            description:
                `${sibling.identity.fullName} reclamou que ultimamente quase tudo na família parece girar em torno da sua carreira.`,

            relatedEntities: [
                sibling.id
            ],

            choices: [
                {
                    id:
                        "give_sibling_attention",

                    label:
                        "Tentar se aproximar",

                    resultText:
                        "Você separou um tempo para estar mais presente na vida do seu irmão ou irmã.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            sibling.id,
                            {
                                affection: 6,
                                trust: 3,
                                conflict: -3
                            },
                            "Tentou se aproximar."
                        );

                        changeHappiness(
                            state,
                            2
                        );
                    }
                },

                {
                    id:
                        "explain_career_pressure",

                    label:
                        "Explicar a pressão da carreira",

                    resultText:
                        "Você tentou explicar que a rotina do futebol tem exigido muito de você.",

                    apply(state) {
                        modifyRelationship(
                            state,
                            state.player.id,
                            sibling.id,
                            {
                                trust: 2,
                                conflict: 1
                            },
                            "Conversaram sobre a rotina do futebol."
                        );
                    }
                }
            ]
        };
    }
];