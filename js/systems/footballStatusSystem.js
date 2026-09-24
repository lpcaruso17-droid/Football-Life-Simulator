import {
    ACADEMY_CATEGORIES
} from "../data/clubs.js";

import {
    getClub,
    getDefaultCategoryForAge,
    findSupportedCategory
} from "./academySystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


const SENIOR_CATEGORY =
    "professional";


function ensureCareerState(
    gameState
) {
    if (
        !gameState.career ||
        typeof gameState.career !==
            "object"
    ) {
        gameState.career = {};
    }

    gameState.career.clubHistory =
        Array.isArray(
            gameState.career
                .clubHistory
        )
            ? gameState.career
                .clubHistory
            : [];

    gameState.career.categoryHistory =
        Array.isArray(
            gameState.career
                .categoryHistory
        )
            ? gameState.career
                .categoryHistory
            : [];

    gameState.career.freeAgentSpells =
        Array.isArray(
            gameState.career
                .freeAgentSpells
        )
            ? gameState.career
                .freeAgentSpells
            : [];

    if (
        gameState.career
            .currentFreeAgentSinceYear ===
        undefined
    ) {
        gameState.career
            .currentFreeAgentSinceYear =
            null;
    }
}


function ensureFootballState(
    gameState
) {
    if (
        !gameState.player
            ?.football
    ) {
        return false;
    }

    gameState.academy =
        gameState.academy ??
        {};

    gameState.professional =
        gameState.professional ??
        {};

    gameState.footballContext =
        gameState.footballContext ??
        {};

    ensureCareerState(
        gameState
    );

    return true;
}


function closeOpenClubHistory(
    gameState,
    reason
) {
    const openEntry =
        [...gameState.career
            .clubHistory]
            .reverse()
            .find(
                entry =>
                    entry.leftYear ===
                        null ||
                    entry.leftYear ===
                        undefined
            );

    if (!openEntry) {
        return false;
    }

    openEntry.leftYear =
        gameState.calendar.year;

    openEntry.leftAge =
        gameState.calendar.age;

    openEntry.reasonLeft =
        reason;

    return true;
}


function getOpenFreeAgentSpell(
    gameState
) {
    return [
        ...gameState.career
            .freeAgentSpells
    ]
        .reverse()
        .find(
            spell =>
                spell.endedYear ===
                    null ||
                spell.endedYear ===
                    undefined
        ) ??
        null;
}


function openFreeAgentSpell(
    gameState,
    {
        previousClubId = null,
        reason =
            "free_agent"
    } = {}
) {
    const existing =
        getOpenFreeAgentSpell(
            gameState
        );

    if (existing) {
        gameState.career
            .currentFreeAgentSinceYear =
            existing.startedYear ??
            gameState.calendar.year;

        return false;
    }

    const inferredStartYear =
        gameState.academy
            ?.freeAgentSinceYear ??
        gameState.calendar.year;

    const inferredStartAge =
        Math.max(
            0,
            gameState.calendar.age -
            (
                gameState.calendar.year -
                inferredStartYear
            )
        );

    gameState.career
        .freeAgentSpells
        .push({
            startedYear:
                inferredStartYear,

            startedAge:
                inferredStartAge,

            endedYear: null,

            endedAge: null,

            previousClubId,

            reason
        });

    gameState.career
        .currentFreeAgentSinceYear =
        inferredStartYear;

    return true;
}


function closeFreeAgentSpell(
    gameState
) {
    const spell =
        getOpenFreeAgentSpell(
            gameState
        );

    if (!spell) {
        gameState.career
            .currentFreeAgentSinceYear =
            null;

        return false;
    }

    spell.endedYear =
        gameState.calendar.year;

    spell.endedAge =
        gameState.calendar.age;

    gameState.career
        .currentFreeAgentSinceYear =
        null;

    return true;
}


function getActiveContract(
    gameState
) {
    const id =
        gameState.contracts
            ?.activeContractId;

    if (!id) {
        return null;
    }

    const contract =
        gameState.contracts
            ?.byId
            ?.[id] ??
        null;

    if (
        !contract ||
        contract.status !==
            "active"
    ) {
        return null;
    }

    return contract;
}


function getLatestExpiredProfessionalContract(
    gameState,
    clubId
) {
    const contracts =
        Object.values(
            gameState.contracts
                ?.byId ??
            {}
        );

    return contracts
        .filter(
            contract =>
                contract?.type ===
                    "professional" &&
                contract.status ===
                    "expired" &&
                (
                    !clubId ||
                    contract.clubId ===
                        clubId
                )
        )
        .sort(
            (a, b) =>
                Number(
                    b.endYear ?? 0
                ) -
                Number(
                    a.endYear ?? 0
                )
        )[0] ??
        null;
}


function hasProfessionalCareer(
    gameState
) {
    return Boolean(
        gameState.player
            .football
            .isProfessional ||
        gameState.player
            .football
            .hasDebutedProfessionally ||
        gameState.professional
            ?.contractSignedYear !==
            null &&
        gameState.professional
            ?.contractSignedYear !==
            undefined
    );
}


function resetClubContext(
    gameState
) {
    gameState.footballContext
        .currentCoachId =
        null;

    gameState.footballContext
        .coachTrust =
        0;

    gameState.footballContext
        .form =
        50;

    gameState.footballContext
        .positionCompetition =
        0;

    gameState.footballContext
        .currentSeasonId =
        null;
}


function setAcademyInactive(
    gameState,
    reason
) {
    gameState.academy
        .currentClubId =
        null;

    gameState.academy
        .currentCategory =
        null;

    gameState.academy
        .relocationRequired =
        false;

    gameState.academy
        .marketStatus =
        gameState.calendar.age <=
            20 &&
        !hasProfessionalCareer(
            gameState
        )
            ? "seeking_club"
            : "not_available";

    if (
        gameState.calendar.age >
        20
    ) {
        gameState.academy
            .evaluationStatus =
            "aged_out";
    } else if (
        reason ===
        "academy_age_limit"
    ) {
        gameState.academy
            .evaluationStatus =
            "released";
    }
}


function hasCategoryHistoryEntry(
    gameState,
    clubId,
    categoryId
) {
    return gameState.career
        .categoryHistory
        .some(
            entry =>
                entry.clubId ===
                    clubId &&
                entry.categoryId ===
                    categoryId &&
                entry.year ===
                    gameState.calendar.year
        );
}


function recordCategoryChange(
    gameState,
    clubId,
    categoryId,
    reason
) {
    if (
        hasCategoryHistoryEntry(
            gameState,
            clubId,
            categoryId
        )
    ) {
        return false;
    }

    gameState.career
        .categoryHistory
        .push({
            clubId,
            categoryId,
            year:
                gameState.calendar.year,
            age:
                gameState.calendar.age,
            reason
        });

    return true;
}


function moveToSeniorSquad(
    gameState,
    {
        reason =
            "senior_transition",
        addTimeline = true
    } = {}
) {
    const clubId =
        gameState.player
            .football
            .currentClubId;

    if (!clubId) {
        return false;
    }

    const previousCategory =
        gameState.player
            .football
            .currentCategory;

    let changed = false;

    if (
        previousCategory !==
        SENIOR_CATEGORY
    ) {
        gameState.player
            .football
            .currentCategory =
            SENIOR_CATEGORY;

        changed = true;
    }

    if (
        gameState.academy
            .currentClubId !==
            null ||
        gameState.academy
            .currentCategory !==
            null
    ) {
        setAcademyInactive(
            gameState,
            reason
        );

        changed = true;
    }

    if (
        gameState.professional
            .status ===
            "academy" ||
        gameState.professional
            .status ===
            "contracted" ||
        gameState.professional
            .status ===
            "training_with_first_team"
    ) {
        gameState.professional
            .status =
            gameState.player
                .football
                .hasDebutedProfessionally
                ? "professional_player"
                : "senior_squad";

        changed = true;
    }

    if (
        recordCategoryChange(
            gameState,
            clubId,
            SENIOR_CATEGORY,
            reason
        )
    ) {
        changed = true;

        if (addTimeline) {
            const club =
                getClub(
                    gameState,
                    clubId
                );

            addTimelineEntry(
                gameState,
                {
                    type:
                        "senior_squad_transition",

                    title:
                        "Integração ao elenco profissional",

                    description:
                        `${gameState.player.identity.fullName} deixou definitivamente as categorias de base${club?.name ? ` do ${club.name}` : ""} e passou a fazer parte do elenco profissional.`,

                    importance: 8,

                    relatedEntities: [
                        clubId
                    ],

                    metadata: {
                        previousCategory,
                        reason
                    }
                }
            );
        }
    }

    return changed;
}


export function setPlayerFreeAgent(
    gameState,
    {
        reason =
            "free_agent",
        addTimeline = true,
        title = null,
        description = null
    } = {}
) {
    if (
        !ensureFootballState(
            gameState
        )
    ) {
        return {
            changed: false,
            formerClubId: null,
            formerClubName: null
        };
    }

    const football =
        gameState.player
            .football;

    const formerClubId =
        football.currentClubId ??
        gameState.academy
            .currentClubId ??
        null;

    const formerClub =
        formerClubId
            ? getClub(
                gameState,
                formerClubId
            )
            : null;

    const formerClubName =
        football.currentClubName ??
        formerClub?.name ??
        null;

    const formerCategory =
        football.currentCategory ??
        gameState.academy
            .currentCategory ??
        null;

    const wasAlreadyFree =
        !formerClubId &&
        !football.currentClubId &&
        !football.currentClubName &&
        !football.currentCategory &&
        football.squadStatus ===
            "free_agent";

    let changed = false;

    if (formerClubId) {
        if (
            closeOpenClubHistory(
                gameState,
                reason
            )
        ) {
            changed = true;
        }
    }

    if (
        football.currentClubId !==
        null
    ) {
        football.currentClubId =
            null;

        changed = true;
    }

    if (
        football.currentClubName !==
        null
    ) {
        football.currentClubName =
            null;

        changed = true;
    }

    if (
        football.currentCategory !==
        null
    ) {
        football.currentCategory =
            null;

        changed = true;
    }

    if (
        football.squadStatus !==
        "free_agent"
    ) {
        football.squadStatus =
            "free_agent";

        changed = true;
    }

    setAcademyInactive(
        gameState,
        reason
    );

    if (
        hasProfessionalCareer(
            gameState
        )
    ) {
        if (
            gameState.professional
                .status !==
            "free_agent"
        ) {
            gameState.professional
                .status =
                "free_agent";

            changed = true;
        }
    }

    resetClubContext(
        gameState
    );

    if (
        openFreeAgentSpell(
            gameState,
            {
                previousClubId:
                    formerClubId,
                reason
            }
        )
    ) {
        changed = true;
    }

    gameState.academy
        .freeAgentSinceYear =
        gameState.career
            .currentFreeAgentSinceYear;

    if (
        formerClubId &&
        addTimeline &&
        !wasAlreadyFree
    ) {
        const defaultTitle =
            reason ===
            "academy_age_limit"
                ? "Fim da trajetória na base"
                : reason ===
                    "professional_contract_expired"
                    ? "Agora você está sem clube"
                    : "Saída do clube";

        const defaultDescription =
            reason ===
            "academy_age_limit"
                ? `${gameState.player.identity.fullName} atingiu o limite das categorias de base sem consolidar uma permanência no elenco profissional${formerClubName ? ` do ${formerClubName}` : ""}.`
                : reason ===
                    "professional_contract_expired"
                    ? `O contrato com o ${formerClubName ?? "clube"} chegou ao fim e ${gameState.player.identity.fullName} entrou no mercado como agente livre.`
                    : `${gameState.player.identity.fullName} deixou o ${formerClubName ?? "clube"} e passou a buscar uma nova oportunidade.`;

        addTimelineEntry(
            gameState,
            {
                type:
                    "free_agent_started",

                title:
                    title ??
                    defaultTitle,

                description:
                    description ??
                    defaultDescription,

                importance: 8,

                relatedEntities:
                    formerClubId
                        ? [
                            formerClubId
                        ]
                        : [],

                metadata: {
                    formerClubId,
                    formerCategory,
                    reason
                }
            }
        );
    }

    return {
        changed,
        formerClubId,
        formerClubName,
        formerCategory
    };
}


function synchronizeAcademyCategory(
    gameState,
    {
        addTimeline = true
    } = {}
) {
    const football =
        gameState.player
            .football;

    const club =
        getClub(
            gameState,
            football.currentClubId
        );

    if (!club) {
        return false;
    }

    const naturalCategory =
        getDefaultCategoryForAge(
            gameState.calendar.age
        );

    const supportedCategory =
        findSupportedCategory(
            club,
            naturalCategory
        );

    if (!supportedCategory) {
        return false;
    }

    const currentCategory =
        football.currentCategory ??
        gameState.academy
            .currentCategory;

    const currentIndex =
        ACADEMY_CATEGORIES
            .findIndex(
                category =>
                    category.id ===
                    currentCategory
            );

    const naturalIndex =
        ACADEMY_CATEGORIES
            .findIndex(
                category =>
                    category.id ===
                    supportedCategory
            );

    if (
        currentIndex >=
            naturalIndex &&
        currentCategory
    ) {
        if (
            gameState.academy
                .currentClubId !==
            football.currentClubId
        ) {
            gameState.academy
                .currentClubId =
                football.currentClubId;
        }

        if (
            gameState.academy
                .currentCategory !==
            currentCategory
        ) {
            gameState.academy
                .currentCategory =
                currentCategory;
        }

        return false;
    }

    const previousCategory =
        currentCategory;

    football.currentCategory =
        supportedCategory;

    gameState.academy
        .currentClubId =
        football.currentClubId;

    gameState.academy
        .currentCategory =
        supportedCategory;

    gameState.academy
        .evaluationStatus =
        "registered";

    recordCategoryChange(
        gameState,
        football.currentClubId,
        supportedCategory,
        "age_category_sync"
    );

    if (addTimeline) {
        addTimelineEntry(
            gameState,
            {
                type:
                    "age_category_sync",

                title:
                    `Mudança para ${supportedCategory.toUpperCase()}`,

                description:
                    `${gameState.player.identity.fullName} avançou de categoria por idade e agora integra o ${supportedCategory.toUpperCase()} do ${club.name}.`,

                importance: 5,

                relatedEntities: [
                    club.id
                ],

                metadata: {
                    previousCategory,
                    supportedCategory
                }
            }
        );
    }

    return true;
}


function shouldLeaveAfterProfessionalContractExpiry(
    gameState
) {
    const clubId =
        gameState.player
            .football
            .currentClubId;

    if (!clubId) {
        return false;
    }

    const activeContract =
        getActiveContract(
            gameState
        );

    if (
        activeContract
            ?.type ===
        "professional"
    ) {
        return false;
    }

    const expired =
        getLatestExpiredProfessionalContract(
            gameState,
            clubId
        );

    if (!expired) {
        return false;
    }

    return (
        Number(
            expired.endYear ??
            Infinity
        ) <=
        Number(
            gameState.calendar.year
        )
    );
}


export function isSeniorFootball(
    gameState
) {
    return Boolean(
        gameState.player
            ?.football
            ?.currentClubId &&
        (
            gameState.player
                .football
                .currentCategory ===
                SENIOR_CATEGORY ||
            gameState.player
                .football
                .hasDebutedProfessionally ||
            (
                gameState.calendar
                    ?.age >= 21 &&
                hasProfessionalCareer(
                    gameState
                )
            )
        )
    );
}


export function synchronizeFootballState(
    gameState,
    {
        reason =
            "football_state_sync",
        addTimeline = true
    } = {}
) {
    if (
        !ensureFootballState(
            gameState
        )
    ) {
        return {
            changed: false,
            state: "invalid"
        };
    }

    const football =
        gameState.player
            .football;

    let changed = false;

    const hasClub =
        Boolean(
            football.currentClubId
        );

    if (!hasClub) {
        const result =
            setPlayerFreeAgent(
                gameState,
                {
                    reason,
                    addTimeline: false
                }
            );

        return {
            changed:
                result.changed,
            state:
                "free_agent"
        };
    }

    const club =
        getClub(
            gameState,
            football.currentClubId
        );

    if (
        club &&
        football.currentClubName !==
            club.name
    ) {
        football.currentClubName =
            club.name;

        changed = true;
    }

    if (
        closeFreeAgentSpell(
            gameState
        )
    ) {
        changed = true;
    }

    gameState.academy
        .freeAgentSinceYear =
        null;

    if (
        shouldLeaveAfterProfessionalContractExpiry(
            gameState
        )
    ) {
        const result =
            setPlayerFreeAgent(
                gameState,
                {
                    reason:
                        "professional_contract_expired",
                    addTimeline
                }
            );

        return {
            changed:
                changed ||
                result.changed,
            state:
                "free_agent"
        };
    }

    if (
        football
            .hasDebutedProfessionally
    ) {
        changed =
            moveToSeniorSquad(
                gameState,
                {
                    reason:
                        "professional_debut",
                    addTimeline
                }
            ) ||
            changed;

        return {
            changed,
            state:
                "professional"
        };
    }

    if (
        gameState.calendar.age >=
        21
    ) {
        const activeContract =
            getActiveContract(
                gameState
            );

        if (
            hasProfessionalCareer(
                gameState
            ) &&
            activeContract
                ?.type ===
                "professional"
        ) {
            changed =
                moveToSeniorSquad(
                    gameState,
                    {
                        reason:
                            "academy_age_limit",
                        addTimeline
                    }
                ) ||
                changed;

            return {
                changed,
                state:
                    "professional"
            };
        }

        const result =
            setPlayerFreeAgent(
                gameState,
                {
                    reason:
                        "academy_age_limit",
                    addTimeline
                }
            );

        return {
            changed:
                changed ||
                result.changed,
            state:
                "free_agent"
        };
    }

    if (
        football.currentCategory ===
        SENIOR_CATEGORY
    ) {
        changed =
            moveToSeniorSquad(
                gameState,
                {
                    reason,
                    addTimeline
                }
            ) ||
            changed;

        return {
            changed,
            state:
                "professional"
        };
    }

    if (
        synchronizeAcademyCategory(
            gameState,
            {
                addTimeline
            }
        )
    ) {
        changed = true;
    }

    return {
        changed,
        state:
            "academy"
    };
}


export function getCurrentFootballSnapshot(
    gameState
) {
    ensureFootballState(
        gameState
    );

    const football =
        gameState.player
            .football;

    const hasClub =
        Boolean(
            football.currentClubId
        );

    const freeAgentSpell =
        getOpenFreeAgentSpell(
            gameState
        );

    return {
        hasClub,

        isFreeAgent:
            !hasClub,

        isSenior:
            isSeniorFootball(
                gameState
            ),

        clubId:
            football.currentClubId,

        clubName:
            football.currentClubName,

        categoryId:
            hasClub
                ? football.currentCategory
                : null,

        squadStatus:
            hasClub
                ? football.squadStatus
                : "free_agent",

        freeAgentSinceYear:
            gameState.career
                .currentFreeAgentSinceYear ??
            freeAgentSpell
                ?.startedYear ??
            null,

        professionalCareer:
            hasProfessionalCareer(
                gameState
            )
    };
}