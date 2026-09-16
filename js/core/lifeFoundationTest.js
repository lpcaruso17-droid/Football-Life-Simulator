import {
    buildNewGame
} from "./newGameBuilder.js";

import {
    getEligibleEvents,
    drawEvent,
    resolveEventChoice
} from "./eventEngine.js";

import {
    EDUCATION_EVENTS
} from "../events/education.js";

import {
    FRIEND_EVENTS
} from "../events/friends.js";

import {
    HOUSING_EVENTS
} from "../events/housing.js";

import {
    getCloseFriends,
    getTeammates
} from "../systems/socialSystem.js";

import {
    getHousingDescription
} from "../systems/housingSystem.js";

import {
    getEducationStatus
} from "../systems/educationSystem.js";

import {
    saveGame
} from "./saveManager.js";


export function runLifeFoundationTest() {
    const game =
        buildNewGame({
            saveName:
                "Teste Life Foundation",

            fullName:
                "Arthur Rocha",

            age: 14,

            startYear: 2030,

            cityId:
                "goiania_go",

            positionId:
                "lb",

            clubId:
                "flamengo",

            seed:
                987654321
        });


    console.group(
        "Football Life Simulator — Life Foundation Test"
    );


    console.log(
        "Clube:",
        game.player
            .football
            .currentClubName
    );


    console.log(
        "Mudança pendente:",
        game.housing
            .pendingRelocation
    );


    console.log(
        "Moradia:",
        getHousingDescription(
            game
        )
    );


    console.log(
        "Escola:",
        game.education
    );


    console.log(
        "Status escolar:",
        getEducationStatus(
            game
        )
    );


    console.log(
        "Amigos:",
        getCloseFriends(
            game
        )
    );


    console.log(
        "Companheiros:",
        getTeammates(
            game
        )
    );


    const allEvents = [
        ...HOUSING_EVENTS,
        ...EDUCATION_EVENTS,
        ...FRIEND_EVENTS
    ];


    const eligible =
        getEligibleEvents(
            game,
            allEvents
        );


    console.log(
        "Eventos elegíveis:",
        eligible.map(
            event => ({
                id:
                    event.id,

                categoria:
                    event.category,

                titulo:
                    event.title
            })
        )
    );


    const relocationEvent =
        eligible.find(
            event =>
                event.category ===
                "housing"
        );


    if (relocationEvent) {
        const clubHousingChoice =
            relocationEvent
                .choices
                .find(
                    choice =>
                        choice.id ===
                        "club_housing"
                );


        if (clubHousingChoice) {
            resolveEventChoice(
                game,
                relocationEvent,
                clubHousingChoice.id
            );
        }
    }


    const nextEvent =
        drawEvent(
            game,
            [
                ...EDUCATION_EVENTS,
                ...FRIEND_EVENTS
            ]
        );


    console.log(
        "Próximo evento sorteado:",
        nextEvent
    );


    console.log(
        "Moradia depois da decisão:",
        game.housing
    );


    console.log(
        "Escola depois da mudança:",
        game.education
    );


    console.log(
        "Timeline:",
        game.timeline
    );


    saveGame(
        game,
        {
            reason:
                "life_foundation_test"
        }
    );


    console.groupEnd();


    return game;
}