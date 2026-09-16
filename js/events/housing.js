import {
    getClub
} from "../systems/academySystem.js";

import {
    getRelocationOptions,
    resolveRelocationDecision
} from "../systems/housingSystem.js";


export const HOUSING_EVENTS = [
    gameState => {
        if (
            !gameState.housing
                .pendingRelocation
        ) {
            return null;
        }

        const club =
            getClub(
                gameState,
                gameState.academy
                    .currentClubId
            );

        if (!club) {
            return null;
        }

        const availableOptions =
            getRelocationOptions(
                gameState
            );

        const choices = [];

        if (
            availableOptions.includes(
                "family_moves"
            )
        ) {
            choices.push({
                id:
                    "family_moves",

                label:
                    "A família se muda junto",

                resultText:
                    `Sua família decidiu mudar de cidade para acompanhar a oportunidade no ${club.name}.`,

                apply(state) {
                    return resolveRelocationDecision(
                        state,
                        "family_moves"
                    );
                }
            });
        }

        if (
            availableOptions.includes(
                "club_housing"
            )
        ) {
            choices.push({
                id:
                    "club_housing",

                label:
                    "Ir para o alojamento",

                resultText:
                    `Você decidiu morar no alojamento do ${club.name}.`,

                apply(state) {
                    return resolveRelocationDecision(
                        state,
                        "club_housing"
                    );
                }
            });
        }

        choices.push({
            id:
                "decline_opportunity",

            label:
                "Não realizar a mudança",

            resultText:
                `A oportunidade no ${club.name} foi recusada por causa da mudança necessária.`,

            apply(state) {
                return resolveRelocationDecision(
                    state,
                    "decline_opportunity"
                );
            }
        });

        return {
            id:
                `relocation_${club.id}_${gameState.calendar.year}`,

            category:
                "housing",

            minAge: 10,

            maxAge: 20,

            onceOnly: true,

            weight: 100,

            importance: 8,

            title:
                "Uma decisão que envolve toda a família",

            description:
                `A oportunidade no ${club.name} exige mudança de cidade. Sua família precisa decidir como seguir.`,

            relatedEntities: [
                club.id
            ],

            choices
        };
    }
];