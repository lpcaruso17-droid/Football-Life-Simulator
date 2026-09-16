import {
    createRngState,
    createSeed
} from "./rng.js";


export const GAME_VERSION =
    "0.5.0-alpha";

export const SCHEMA_VERSION = 5;


function createId(prefix) {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID ===
            "function"
    ) {
        return `${prefix}_${crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
}


function nowIso() {
    return new Date().toISOString();
}


export function createBlankPlayer({
    startAge,
    startYear
}) {
    return {
        id: createId("player"),

        identity: {
            fullName: "",
            gender: "male",

            birthYear:
                startYear -
                startAge,

            nationality: "BR",
            secondNationality: null,

            birthCityId: null,
            currentCityId: null
        },

        physical: {
            heightCm: null,
            weightKg: null,

            dominantFoot: null
        },

        football: {
            position: null,
            secondaryPositions: [],

            currentClubId: null,
            currentClubName: null,

            currentCategory: null,

            squadStatus: null,

            shirtNumber: null,

            isProfessional: false,

            hasDebutedProfessionally:
                false
        },

        attributes: {
            technical: {},
            physical: {},
            mental: {},
            goalkeeper: {}
        },

        hidden: {
            potential: null,

            personality: {
                professionalism: null,
                discipline: null,
                ambition: null,
                resilience: null,
                loyalty: null,
                sociability: null,
                ego: null,
                adaptability: null,
                intelligence: null
            }
        },

        life: {
            happiness: 75,

            generalHealth: 100,

            physicalCondition: 100,

            fame: 0
        }
    };
}


export function createGameState({
    saveName = "Nova vida",

    startAge = 10,

    startYear =
        new Date().getFullYear(),

    seed = createSeed(),

    player = null
} = {}) {
    const saveId =
        createId("save");

    const createdAt =
        nowIso();

    return {
        meta: {
            schemaVersion:
                SCHEMA_VERSION,

            gameVersion:
                GAME_VERSION
        },

        save: {
            id: saveId,

            name: saveName,

            createdAt,

            updatedAt:
                createdAt,

            lastSaveReason:
                "creation"
        },

        calendar: {
            startYear,

            year: startYear,

            age: startAge,

            phase: "preseason",

            seasonStarted: false,

            seasonCompleted: false
        },

        rng:
            createRngState(
                seed
            ),

        player:
            player ??
            createBlankPlayer({
                startAge,
                startYear
            }),

        family: null,

        academy: {
            currentClubId: null,

            currentCategory: null,

            joinedYear: null,

            joinedAge: null,

            startingPath: null,

            relocationRequired: false,

            housingMode:
                "family_home",

            evaluationStatus:
                "registered",

            currentEvaluation: null,

            lastDecision: null,

            developmentScore: null,

            recognition: 0,

            marketStatus:
                "not_available",

            freeAgentSinceYear:
                null,

            offers: [],

            trials: [],

            history: []
        },

        housing: {
            type:
                "family_home",

            cityId: null,

            familyCityId: null,

            clubId: null,

            quality: 60,

            familyMoved: false,

            pendingRelocation: false,

            sinceYear:
                startYear,

            history: []
        },

        social: {
            closeFriendIds: [],

            friendIds: [],

            teammateIds: [],

            formerTeammateIds: [],

            socialLife: 60,

            history: []
        },

        representation: {
            currentAgentPersonId: null,

            currentAgencyId: null,

            activeAgreement: null,

            guardianConsent: false,

            offers: [],

            history: []
        },

        people: {
            byId: {},

            allIds: []
        },

        relationships: {
            byId: {}
        },

        clubs: {
            byId: {},

            allIds: []
        },

        contracts: {
            byId: {},

            allIds: [],

            activeContractId: null,

            offers: [],

            alerts: [],

            history: []
        },

        seasons: {
            byId: {},

            allIds: []
        },

        education: {
            currentLevel:
                "fundamental",

            institutionName: null,

            cityId: null,

            performance: 70,

            attendance: 100,

            clubMonitoring: false,

            completedHighSchool:
                false,

            history: []
        },

        finances: {
            cash: 0,

            investmentsValue: 0,

            assetValue: 0,

            debt: 0,

            monthlyIncome: 0,

            monthlyExpenses: 0,

            transactions: []
        },

        health: {
            injuries: [],

            activeInjuryId: null,

            medicalHistory: []
        },

        reputation: {
            overall: 0,

            fame: 0,

            byGroup: {
                clubs: 0,
                players: 0,
                agents: 0,
                media: 0,
                fans: 0,
                sponsors: 0
            },

            byCountry: {}
        },

        inbox: [],

        news: [],

        timeline: [],

        career: {
            clubHistory: [],

            categoryHistory: [],

            freeAgentSpells: [],

            positionHistory: [],

            milestones: []
        },

        world: {
            generatedPeople: [],

            generatedPlayers: [],

            clubState: {},

            agencyState: {},

            currentStorylines: []
        },

        eventState: {
            completed: [],

            cooldowns: {},

            activeChains: {},

            completedChains: [],

            flags: {}
        },

        settings: {
            autosave: true,

            language: "pt-BR",

            difficulty:
                "realistic"
        }
    };
}


export function updateGameTimestamp(
    gameState,
    reason = "manual"
) {
    gameState.save.updatedAt =
        nowIso();

    gameState.save.lastSaveReason =
        reason;

    return gameState;
}