import {
    SCHEMA_VERSION
} from "./gameState.js";

import {
    synchronizeFootballState
} from "../systems/footballStatusSystem.js";


function ensureObject(
    value,
    fallback = {}
) {
    return (
        value &&
        typeof value ===
            "object" &&
        !Array.isArray(value)
    )
        ? value
        : fallback;
}


function ensureArray(
    value
) {
    return Array.isArray(value)
        ? value
        : [];
}


export function migrateGameState(
    gameState
) {
    if (
        !gameState ||
        typeof gameState !==
            "object"
    ) {
        return {
            gameState,
            changed: false
        };
    }

    let changed = false;


    gameState.meta =
        ensureObject(
            gameState.meta
        );


    if (
        gameState.meta
            .schemaVersion !==
        SCHEMA_VERSION
    ) {
        gameState.meta
            .schemaVersion =
            SCHEMA_VERSION;

        changed = true;
    }


    gameState.career =
        ensureObject(
            gameState.career
        );


    const careerArrays = [
        "clubHistory",
        "categoryHistory",
        "freeAgentSpells",
        "positionHistory",
        "milestones"
    ];


    careerArrays.forEach(
        key => {
            if (
                !Array.isArray(
                    gameState.career[
                        key
                    ]
                )
            ) {
                gameState.career[
                    key
                ] = [];

                changed = true;
            }
        }
    );


    if (
        gameState.career
            .currentFreeAgentSinceYear ===
        undefined
    ) {
        gameState.career
            .currentFreeAgentSinceYear =
            null;

        changed = true;
    }


    gameState.academy =
        ensureObject(
            gameState.academy
        );


    gameState.professional =
        ensureObject(
            gameState.professional
        );


    gameState.footballContext =
        ensureObject(
            gameState.footballContext
        );


    gameState.contracts =
        ensureObject(
            gameState.contracts
        );


    gameState.contracts.byId =
        ensureObject(
            gameState.contracts
                .byId
        );


    gameState.contracts.allIds =
        ensureArray(
            gameState.contracts
                .allIds
        );


    const sync =
        synchronizeFootballState(
            gameState,
            {
                reason:
                    "save_migration",

                addTimeline:
                    false
            }
        );


    if (sync.changed) {
        changed = true;
    }


    return {
        gameState,
        changed
    };
}