import {
    updateGameTimestamp
} from "./gameState.js";

import {
    migrateGameState
} from "./migration.js";


const REGISTRY_KEY =
    "footballLife:v05:registry";

const ACTIVE_SAVE_KEY =
    "footballLife:v05:active";


function saveKey(saveId) {
    return `footballLife:v05:save:${saveId}`;
}


function readJson(
    key,
    fallback
) {
    try {
        const raw =
            localStorage.getItem(key);

        if (!raw) {
            return fallback;
        }

        return JSON.parse(raw);
    } catch (error) {
        console.error(
            `Erro ao ler ${key}:`,
            error
        );

        return fallback;
    }
}


function writeJson(
    key,
    value
) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}


export function getSaveRegistry() {
    const registry =
        readJson(
            REGISTRY_KEY,
            []
        );

    return Array.isArray(registry)
        ? registry
        : [];
}


function createSaveSummary(
    gameState
) {
    return {
        id:
            gameState.save.id,

        saveName:
            gameState.save.name,

        playerName:
            gameState.player
                ?.identity
                ?.fullName ||
            "Personagem sem nome",

        age:
            gameState.calendar
                ?.age ?? 10,

        year:
            gameState.calendar
                ?.year ?? null,

        clubName:
            gameState.player
                ?.football
                ?.currentClubName ||
            "Sem clube",

        category:
            gameState.player
                ?.football
                ?.currentCategory ||
            null,

        createdAt:
            gameState.save
                ?.createdAt,

        updatedAt:
            gameState.save
                ?.updatedAt
    };
}


function updateRegistry(
    gameState
) {
    const registry =
        getSaveRegistry();

    const summary =
        createSaveSummary(
            gameState
        );

    const index =
        registry.findIndex(
            save =>
                save.id ===
                summary.id
        );

    if (index >= 0) {
        registry[index] =
            summary;
    } else {
        registry.push(
            summary
        );
    }

    registry.sort(
        (a, b) =>
            new Date(
                b.updatedAt ?? 0
            ) -
            new Date(
                a.updatedAt ?? 0
            )
    );

    writeJson(
        REGISTRY_KEY,
        registry
    );
}


export function saveGame(
    gameState,
    {
        reason = "manual",
        setActive = true
    } = {}
) {
    if (
        !gameState?.save?.id
    ) {
        throw new Error(
            "Game state sem ID de save."
        );
    }

    updateGameTimestamp(
        gameState,
        reason
    );

    writeJson(
        saveKey(
            gameState.save.id
        ),
        gameState
    );

    updateRegistry(
        gameState
    );

    if (setActive) {
        setActiveSaveId(
            gameState.save.id
        );
    }

    return gameState;
}


export function loadGame(
    saveId
) {
    if (!saveId) {
        return null;
    }

    const loaded =
        readJson(
            saveKey(saveId),
            null
        );

    if (!loaded) {
        return null;
    }

    const migration =
        migrateGameState(
            loaded
        );

    if (
        migration.changed &&
        migration.gameState
    ) {
        writeJson(
            saveKey(saveId),
            migration.gameState
        );

        updateRegistry(
            migration.gameState
        );
    }

    return migration.gameState;
}


export function listSaves() {
    return getSaveRegistry();
}


export function deleteSave(
    saveId
) {
    if (!saveId) {
        return;
    }

    localStorage.removeItem(
        saveKey(saveId)
    );

    const updatedRegistry =
        getSaveRegistry()
            .filter(
                save =>
                    save.id !==
                    saveId
            );

    writeJson(
        REGISTRY_KEY,
        updatedRegistry
    );

    if (
        getActiveSaveId() ===
        saveId
    ) {
        localStorage.removeItem(
            ACTIVE_SAVE_KEY
        );
    }
}


export function renameSave(
    saveId,
    newName
) {
    const cleanName =
        String(
            newName ?? ""
        ).trim();

    if (!cleanName) {
        throw new Error(
            "Nome do save inválido."
        );
    }

    const gameState =
        loadGame(saveId);

    if (!gameState) {
        throw new Error(
            "Save não encontrado."
        );
    }

    gameState.save.name =
        cleanName;

    saveGame(
        gameState,
        {
            reason: "rename",
            setActive: false
        }
    );

    return gameState;
}


export function setActiveSaveId(
    saveId
) {
    if (!saveId) {
        localStorage.removeItem(
            ACTIVE_SAVE_KEY
        );

        return;
    }

    localStorage.setItem(
        ACTIVE_SAVE_KEY,
        saveId
    );
}


export function getActiveSaveId() {
    return (
        localStorage.getItem(
            ACTIVE_SAVE_KEY
        ) || null
    );
}


export function loadActiveGame() {
    const saveId =
        getActiveSaveId();

    return saveId
        ? loadGame(saveId)
        : null;
}


export function hasLegacyV03Save() {
    return (
        localStorage.getItem(
            "footballLifeSave"
        ) !== null
    );
}