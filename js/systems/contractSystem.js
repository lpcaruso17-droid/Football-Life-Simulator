import { randomInt } from "../core/rng.js";
import { getClub } from "./academySystem.js";
import { getAgentNegotiationModifier } from "./agentSystem.js";
import { addTimelineEntry } from "./timelineSystem.js";
import { synchronizeFootballState } from "./footballStatusSystem.js";
import { relocateEducationToCity } from "./educationSystem.js";

function createId(prefix) {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return `${prefix}_${crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
}

function roundMoney(value) {
    return (
        Math.round(
            Number(value) / 50
        ) * 50
    );
}

function getNegotiatedBy(gameState) {
    if (
        gameState.representation
            ?.currentAgentPersonId
    ) {
        return "agent";
    }

    if (
        gameState.calendar.age <
        18
    ) {
        return "family";
    }

    return "player";
}

function ensureCareerState(
    gameState
) {
    gameState.career =
        gameState.career ??
        {};

    gameState.career.clubHistory =
        Array.isArray(
            gameState.career
                .clubHistory
        )
            ? gameState.career
                .clubHistory
            : [];

    gameState.career.milestones =
        Array.isArray(
            gameState.career
                .milestones
        )
            ? gameState.career
                .milestones
            : [];
}

function closeOpenClubHistory(
    gameState,
    reason
) {
    ensureCareerState(
        gameState
    );

    const openEntry =
        [
            ...gameState.career
                .clubHistory
        ]
            .reverse()
            .find(
                entry =>
                    entry.leftYear ===
                        null ||
                    entry.leftYear ===
                        undefined
            );

    if (!openEntry) {
        return null;
    }

    openEntry.leftYear =
        gameState.calendar.year;

    openEntry.leftAge =
        gameState.calendar.age;

    openEntry.reasonLeft =
        reason;

    return openEntry;
}

function openClubHistory(
    gameState,
    club,
    reason
) {
    ensureCareerState(
        gameState
    );

    const alreadyOpen =
        [
            ...gameState.career
                .clubHistory
        ]
            .reverse()
            .find(
                entry =>
                    entry.clubId ===
                        club.id &&
                    (
                        entry.leftYear ===
                            null ||
                        entry.leftYear ===
                            undefined
                    )
            );

    if (alreadyOpen) {
        return alreadyOpen;
    }

    const entry = {
        clubId:
            club.id,

        clubName:
            club.name,

        joinedYear:
            gameState.calendar.year,

        joinedAge:
            gameState.calendar.age,

        leftYear: null,

        leftAge: null,

        reasonJoined:
            reason,

        reasonLeft:
            null
    };

    gameState.career
        .clubHistory
        .push(
            entry
        );

    return entry;
}

function resetClubContext(
    gameState
) {
    gameState.footballContext =
        gameState.footballContext ??
        {};

    gameState.footballContext
        .currentCoachId =
        null;

    gameState.footballContext
        .coachTrust =
        45;

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

function relocateProfessionalPlayer(
    gameState,
    club,
    previousClubId
) {
    if (
        previousClubId ===
            club.id ||
        !club.cityId
    ) {
        return null;
    }

    const previousCityId =
        gameState.player
            ?.identity
            ?.currentCityId ??
        null;

    if (
        previousCityId ===
        club.cityId
    ) {
        if (
            gameState.housing
        ) {
            gameState.housing
                .clubId =
                club.id;

            gameState.housing
                .pendingRelocation =
                false;
        }

        return {
            changedCity: false,

            previousCityId,

            newCityId:
                club.cityId
        };
    }

    gameState.player
        .identity
        .currentCityId =
        club.cityId;

    if (
        gameState.housing
    ) {
        gameState.housing.history =
            Array.isArray(
                gameState.housing
                    .history
            )
                ? gameState.housing
                    .history
                : [];

        gameState.housing
            .cityId =
            club.cityId;

        gameState.housing
            .clubId =
            club.id;

        gameState.housing
            .pendingRelocation =
            false;

        gameState.housing
            .familyMoved =
            false;

        gameState.housing
            .type =
            "club_housing";

        gameState.housing
            .sinceYear =
            gameState.calendar.year;

        gameState.housing
            .history
            .push({
                year:
                    gameState
                        .calendar
                        .year,

                age:
                    gameState
                        .calendar
                        .age,

                action:
                    "professional_club_relocation",

                previousCityId,

                cityId:
                    club.cityId,

                clubId:
                    club.id,

                familyMoved:
                    false
            });
    }

    if (
        gameState.calendar.age <=
            17 &&
        gameState.education &&
        gameState.education
            .cityId !==
            club.cityId
    ) {
        relocateEducationToCity(
            gameState,
            club.cityId,
            {
                reason:
                    "professional_transfer"
            }
        );
    }

    return {
        changedCity: true,

        previousCityId,

        newCityId:
            club.cityId
    };
}

function movePlayerToProfessionalClub(
    gameState,
    offer
) {
    const club =
        getClub(
            gameState,
            offer.clubId
        );

    if (!club) {
        throw new Error(
            "Clube da proposta profissional não encontrado."
        );
    }

    const previousClubId =
        gameState.player
            .football
            .currentClubId ??
        null;

    const changedClub =
        previousClubId !==
        club.id;

    if (changedClub) {
        if (
            previousClubId
        ) {
            closeOpenClubHistory(
                gameState,
                offer.moveType ===
                    "transfer"
                    ? "professional_transfer"
                    : "professional_move"
            );
        }

        openClubHistory(
            gameState,
            club,
            offer.moveType ===
                "free_agent"
                ? "signed_as_free_agent"
                : "professional_transfer"
        );

        resetClubContext(
            gameState
        );
    }

    gameState.player
        .football
        .currentClubId =
        club.id;

    gameState.player
        .football
        .currentClubName =
        club.name;

    gameState.player
        .football
        .currentCategory =
        "professional";

    gameState.player
        .football
        .squadStatus =
        "evaluation";

    gameState.academy =
        gameState.academy ??
        {};

    gameState.academy
        .currentClubId =
        null;

    gameState.academy
        .currentCategory =
        null;

    gameState.academy
        .marketStatus =
        "not_available";

    gameState.academy
        .freeAgentSinceYear =
        null;

    const relocation =
        relocateProfessionalPlayer(
            gameState,
            club,
            previousClubId
        );

    synchronizeFootballState(
        gameState,
        {
            reason:
                offer.moveType ===
                    "free_agent"
                    ? "professional_free_agent_signing"
                    : "professional_transfer",

            addTimeline:
                false
        }
    );

    return {
        club,

        previousClubId,

        changedClub,

        relocation
    };
}

function closeOtherProfessionalOffers(
    gameState,
    acceptedOfferId
) {
    gameState.contracts
        .offers
        .forEach(
            offer => {
                if (
                    offer.id !==
                        acceptedOfferId &&
                    offer.type ===
                        "professional" &&
                    offer.status ===
                        "pending"
                ) {
                    offer.status =
                        "superseded";
                }
            }
        );
}

function hasFirstProfessionalMilestone(
    gameState
) {
    ensureCareerState(
        gameState
    );

    return gameState.career
        .milestones
        .some(
            milestone =>
                milestone.type ===
                "first_professional_contract"
        );
}

export function canSignFormationContract(
    gameState
) {
    const age =
        gameState.calendar.age;

    return (
        age > 14 &&
        age < 20 &&
        Boolean(
            gameState.academy
                .currentClubId
        ) &&
        !gameState.player
            .football
            .isProfessional
    );
}

export function canSignFirstProfessionalContract(
    gameState
) {
    return (
        gameState.calendar.age >=
            16 &&
        Boolean(
            gameState.player
                .football
                .currentClubId
        ) &&
        !gameState.player
            .football
            .isProfessional
    );
}

function calculateFormationStipend(
    gameState,
    club
) {
    const financialPower =
        Number(
            club.financialPower
        ) || 50;

    const recognition =
        Number(
            gameState.academy
                .recognition
        ) || 0;

    const development =
        Number(
            gameState.academy
                .developmentScore
        ) || 45;

    const base =
        350 +
        financialPower * 8 +
        recognition * 7 +
        development * 6;

    const variation =
        randomInt(
            gameState.rng,
            -250,
            450
        );

    const agentModifier =
        getAgentNegotiationModifier(
            gameState
        );

    return Math.max(
        300,
        roundMoney(
            (
                base +
                variation
            ) *
            agentModifier
        )
    );
}

function calculateProfessionalSalary(
    gameState,
    club
) {
    const financialPower =
        Number(
            club.financialPower
        ) || 50;

    const recognition =
        Number(
            gameState.academy
                .recognition
        ) || 0;

    const development =
        Number(
            gameState.academy
                .developmentScore
        ) || 45;

    const base =
        1200 +
        financialPower * 42 +
        recognition * 48 +
        development * 30;

    const variation =
        randomInt(
            gameState.rng,
            -1200,
            2500
        );

    const agentModifier =
        getAgentNegotiationModifier(
            gameState
        );

    return Math.max(
        1500,
        roundMoney(
            (
                base +
                variation
            ) *
            agentModifier
        )
    );
}

export function createFormationContractOffer(
    gameState
) {
    if (
        !canSignFormationContract(
            gameState
        )
    ) {
        return null;
    }

    const active =
        getActiveContract(
            gameState
        );

    if (
        active?.type ===
        "formation"
    ) {
        return null;
    }

    const pending =
        gameState.contracts
            .offers
            .find(
                offer =>
                    offer.type ===
                        "formation" &&
                    offer.status ===
                        "pending"
            );

    if (pending) {
        return pending;
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

    const maxPossibleYears =
        Math.max(
            1,
            Math.min(
                2,
                20 -
                gameState.calendar.age
            )
        );

    const durationYears =
        randomInt(
            gameState.rng,
            1,
            maxPossibleYears
        );

    const offer = {
        id:
            createId(
                "formation_contract_offer"
            ),

        type:
            "formation",

        clubId:
            club.id,

        clubName:
            club.name,

        createdYear:
            gameState.calendar.year,

        createdAge:
            gameState.calendar.age,

        durationYears,

        monthlyStipend:
            calculateFormationStipend(
                gameState,
                club
            ),

        guardianApprovalRequired:
            gameState.calendar.age <
            18,

        negotiatedBy:
            getNegotiatedBy(
                gameState
            ),

        status:
            "pending"
    };

    gameState.contracts
        .offers
        .push(
            offer
        );

    addTimelineEntry(
        gameState,
        {
            type:
                "formation_contract_offer",

            title:
                "Proposta de contrato de formação",

            description:
                `${club.name} apresentou uma proposta formal de formação para ${gameState.player.identity.fullName}.`,

            importance: 7,

            relatedEntities: [
                club.id
            ],

            metadata: {
                offerId:
                    offer.id,

                monthlyStipend:
                    offer.monthlyStipend,

                durationYears:
                    offer.durationYears
            }
        }
    );

    return offer;
}

export function createFirstProfessionalContractOffer(
    gameState
) {
    if (
        !canSignFirstProfessionalContract(
            gameState
        )
    ) {
        return null;
    }

    const pending =
        gameState.contracts
            .offers
            .find(
                offer =>
                    offer.type ===
                        "professional" &&
                    offer.status ===
                        "pending"
            );

    if (pending) {
        return pending;
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

    const salary =
        calculateProfessionalSalary(
            gameState,
            club
        );

    const durationYears =
        randomInt(
            gameState.rng,
            1,
            3
        );

    const signingBonus =
        roundMoney(
            salary *
            randomInt(
                gameState.rng,
                1,
                4
            )
        );

    const appearanceBonus =
        roundMoney(
            Math.max(
                150,
                salary * 0.08
            )
        );

    const goalBonus =
        roundMoney(
            Math.max(
                200,
                salary * 0.10
            )
        );

    let promisedRole =
        "development_player";

    if (
        gameState.academy
            .recognition >=
        65
    ) {
        promisedRole =
            "first_team_candidate";
    }

    if (
        gameState.academy
            .recognition >=
        80
    ) {
        promisedRole =
            "rotation_candidate";
    }

    const offer = {
        id:
            createId(
                "professional_contract_offer"
            ),

        type:
            "professional",

        firstProfessionalContract:
            true,

        clubId:
            club.id,

        clubName:
            club.name,

        createdYear:
            gameState.calendar.year,

        createdAge:
            gameState.calendar.age,

        durationYears,

        salary,

        signingBonus,

        appearanceBonus,

        goalBonus,

        promisedRole,

        guardianApprovalRequired:
            gameState.calendar.age <
            18,

        negotiatedBy:
            getNegotiatedBy(
                gameState
            ),

        status:
            "pending"
    };

    gameState.contracts
        .offers
        .push(
            offer
        );

    addTimelineEntry(
        gameState,
        {
            type:
                "first_professional_contract_offer",

            title:
                "Primeiro contrato profissional na mesa",

            description:
                `${club.name} apresentou uma proposta para transformar ${gameState.player.identity.fullName} em atleta profissional.`,

            importance: 9,

            relatedEntities: [
                club.id
            ],

            metadata: {
                offerId:
                    offer.id,

                salary,

                durationYears,

                promisedRole
            }
        }
    );

    return offer;
}

function replaceCurrentContract(
    gameState,
    reason =
        "new_contract"
) {
    const previous =
        getActiveContract(
            gameState
        );

    if (!previous) {
        return null;
    }

    previous.status =
        "replaced";

    previous.actualEndYear =
        gameState.calendar.year;

    previous.replacementReason =
        reason;

    return previous;
}

export function acceptFormationContractOffer(
    gameState,
    offerId,
    {
        guardianApproval = false
    } = {}
) {
    const offer =
        gameState.contracts
            .offers
            .find(
                current =>
                    current.id ===
                    offerId
            );

    if (!offer) {
        throw new Error(
            "Proposta de contrato não encontrada."
        );
    }

    if (
        offer.type !==
        "formation"
    ) {
        throw new Error(
            "A proposta não é de formação."
        );
    }

    if (
        offer.status !==
        "pending"
    ) {
        throw new Error(
            "Esta proposta não está mais disponível."
        );
    }

    if (
        offer.guardianApprovalRequired &&
        !guardianApproval
    ) {
        throw new Error(
            "O responsável legal precisa aprovar o contrato."
        );
    }

    replaceCurrentContract(
        gameState
    );

    const contract = {
        id:
            createId(
                "contract"
            ),

        type:
            "formation",

        clubId:
            offer.clubId,

        clubName:
            offer.clubName,

        startYear:
            gameState.calendar.year,

        startAge:
            gameState.calendar.age,

        durationYears:
            offer.durationYears,

        endYear:
            gameState.calendar.year +
            offer.durationYears,

        monthlyStipend:
            offer.monthlyStipend,

        salary: 0,

        guardianApproved:
            offer
                .guardianApprovalRequired
                ? guardianApproval
                : null,

        negotiatedBy:
            offer.negotiatedBy,

        status:
            "active"
    };

    offer.status =
        "accepted";

    gameState.contracts
        .byId[
            contract.id
        ] =
        contract;

    gameState.contracts
        .allIds
        .push(
            contract.id
        );

    gameState.contracts
        .activeContractId =
        contract.id;

    gameState.contracts
        .history
        .push({
            action:
                "contract_signed",

            contractId:
                contract.id,

            type:
                contract.type,

            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age,

            clubId:
                contract.clubId
        });

    gameState.finances
        .monthlyIncome =
        contract.monthlyStipend;

    addTimelineEntry(
        gameState,
        {
            type:
                "formation_contract_signed",

            title:
                "Contrato de formação assinado",

            description:
                `${gameState.player.identity.fullName} assinou contrato de formação com o ${contract.clubName}.`,

            importance: 8,

            relatedEntities: [
                contract.clubId
            ],

            metadata: {
                contractId:
                    contract.id,

                monthlyStipend:
                    contract.monthlyStipend,

                endYear:
                    contract.endYear
            }
        }
    );

    return contract;
}

export function acceptFirstProfessionalContractOffer(
    gameState,
    offerId,
    {
        guardianApproval = false
    } = {}
) {
    const offer =
        gameState.contracts
            .offers
            .find(
                current =>
                    current.id ===
                    offerId
            );

    if (!offer) {
        throw new Error(
            "Proposta profissional não encontrada."
        );
    }

    if (
        offer.type !==
        "professional"
    ) {
        throw new Error(
            "Esta não é uma proposta profissional."
        );
    }

    if (
        offer.status !==
        "pending"
    ) {
        throw new Error(
            "Esta proposta não está mais disponível."
        );
    }

    if (
        offer.guardianApprovalRequired &&
        !guardianApproval
    ) {
        throw new Error(
            "O responsável legal precisa aprovar o contrato."
        );
    }

    const previousClubId =
        gameState.player
            .football
            .currentClubId ??
        null;

    const previousClubName =
        gameState.player
            .football
            .currentClubName ??
        null;

    const isMarketMove =
        offer.source ===
            "professional_market" ||
        offer.moveType ===
            "transfer" ||
        offer.moveType ===
            "free_agent";

    const wasAlreadyProfessional =
        Boolean(
            gameState.player
                .football
                .isProfessional ||
            hasFirstProfessionalMilestone(
                gameState
            )
        );

    const isFirstProfessionalContract =
        offer
            .firstProfessionalContract ===
            true ||
        !wasAlreadyProfessional;

    const replacementReason =
        isMarketMove
            ? offer.moveType ===
                "transfer"
                ? "professional_transfer"
                : "free_agent_signing"
            : "new_professional_contract";

    replaceCurrentContract(
        gameState,
        replacementReason
    );

    const maximumDuration =
        isFirstProfessionalContract
            ? 3
            : 5;

    const durationYears =
        Math.max(
            1,
            Math.min(
                maximumDuration,
                Number(
                    offer.durationYears
                ) || 1
            )
        );

    const contract = {
        id:
            createId(
                "contract"
            ),

        type:
            "professional",

        firstProfessionalContract:
            isFirstProfessionalContract,

        source:
            offer.source ??
            (
                isFirstProfessionalContract
                    ? "academy_first_contract"
                    : "club_contract"
            ),

        moveType:
            offer.moveType ??
            (
                previousClubId ===
                    offer.clubId
                    ? "renewal"
                    : previousClubId
                        ? "transfer"
                        : "free_agent"
            ),

        previousClubId,

        clubId:
            offer.clubId,

        clubName:
            offer.clubName,

        startYear:
            gameState.calendar.year,

        startAge:
            gameState.calendar.age,

        durationYears,

        endYear:
            gameState.calendar.year +
            durationYears,

        salary:
            Number(
                offer.salary
            ) || 0,

        monthlyStipend: 0,

        signingBonus:
            Number(
                offer.signingBonus
            ) || 0,

        appearanceBonus:
            Number(
                offer.appearanceBonus
            ) || 0,

        goalBonus:
            Number(
                offer.goalBonus
            ) || 0,

        promisedRole:
            offer.promisedRole ??
            "squad_player",

        guardianApproved:
            offer
                .guardianApprovalRequired
                ? guardianApproval
                : null,

        negotiatedBy:
            offer.negotiatedBy ??
            getNegotiatedBy(
                gameState
            ),

        status:
            "active"
    };

    offer.status =
        "accepted";

    closeOtherProfessionalOffers(
        gameState,
        offer.id
    );

    gameState.contracts
        .byId[
            contract.id
        ] =
        contract;

    gameState.contracts
        .allIds
        .push(
            contract.id
        );

    gameState.contracts
        .activeContractId =
        contract.id;

    gameState.player
        .football
        .isProfessional =
        true;

    let moveResult =
        null;

    if (
        isMarketMove
    ) {
        moveResult =
            movePlayerToProfessionalClub(
                gameState,
                offer
            );
    }

    gameState.professional =
        gameState.professional ??
        {};

    if (
        gameState.professional
            .contractSignedYear ===
            null ||
        gameState.professional
            .contractSignedYear ===
            undefined
    ) {
        gameState.professional
            .contractSignedYear =
            gameState.calendar.year;
    }

    if (
        isMarketMove
    ) {
        gameState.professional
            .status =
            gameState.player
                .football
                .hasDebutedProfessionally
                ? "professional_player"
                : "senior_squad";
    } else {
        gameState.professional
            .status =
            "contracted";
    }

    gameState.finances
        .monthlyIncome =
        contract.salary;

    gameState.finances.cash +=
        contract.signingBonus;

    let historyAction =
        "professional_contract_signed";

    if (
        isFirstProfessionalContract
    ) {
        historyAction =
            "first_professional_contract_signed";
    } else if (
        contract.moveType ===
        "transfer"
    ) {
        historyAction =
            "professional_transfer_signed";
    } else if (
        contract.moveType ===
        "free_agent"
    ) {
        historyAction =
            "free_agent_contract_signed";
    }

    gameState.contracts
        .history
        .push({
            action:
                historyAction,

            contractId:
                contract.id,

            type:
                "professional",

            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age,

            previousClubId,

            clubId:
                contract.clubId,

            moveType:
                contract.moveType,

            previousCityId:
                moveResult
                    ?.relocation
                    ?.previousCityId ??
                null,

            newCityId:
                moveResult
                    ?.relocation
                    ?.newCityId ??
                null
        });

    if (
        isFirstProfessionalContract &&
        !hasFirstProfessionalMilestone(
            gameState
        )
    ) {
        gameState.career
            .milestones
            .push({
                type:
                    "first_professional_contract",

                year:
                    gameState.calendar.year,

                age:
                    gameState.calendar.age,

                clubId:
                    contract.clubId
            });
    }

    let timelineType =
        "professional_contract_signed";

    let timelineTitle =
        "Novo contrato profissional";

    let timelineDescription =
        `${gameState.player.identity.fullName} assinou contrato profissional com o ${contract.clubName}.`;

    if (
        isFirstProfessionalContract
    ) {
        timelineType =
            "first_professional_contract_signed";

        timelineTitle =
            "Primeiro contrato profissional";

        timelineDescription =
            `${gameState.player.identity.fullName} assinou seu primeiro contrato profissional com o ${contract.clubName}.`;
    } else if (
        contract.moveType ===
        "transfer"
    ) {
        timelineType =
            "professional_transfer";

        timelineTitle =
            `Transferência para o ${contract.clubName}`;

        timelineDescription =
            `${gameState.player.identity.fullName} deixou o ${previousClubName ?? "clube anterior"} e assinou com o ${contract.clubName}.`;
    } else if (
        contract.moveType ===
        "free_agent"
    ) {
        timelineType =
            "free_agent_signing";

        timelineTitle =
            `Novo clube: ${contract.clubName}`;

        timelineDescription =
            `${gameState.player.identity.fullName} encerrou seu período como agente livre e assinou com o ${contract.clubName}.`;
    }

    addTimelineEntry(
        gameState,
        {
            type:
                timelineType,

            title:
                timelineTitle,

            description:
                timelineDescription,

            importance:
                isFirstProfessionalContract
                    ? 10
                    : 9,

            relatedEntities: [
                previousClubId,
                contract.clubId
            ].filter(Boolean),

            metadata: {
                contractId:
                    contract.id,

                salary:
                    contract.salary,

                signingBonus:
                    contract.signingBonus,

                durationYears:
                    contract.durationYears,

                endYear:
                    contract.endYear,

                promisedRole:
                    contract.promisedRole,

                moveType:
                    contract.moveType,

                previousCityId:
                    moveResult
                        ?.relocation
                        ?.previousCityId ??
                    null,

                newCityId:
                    moveResult
                        ?.relocation
                        ?.newCityId ??
                    null
            }
        }
    );

    return contract;
}

export function declineFormationContractOffer(
    gameState,
    offerId
) {
    return declineContractOffer(
        gameState,
        offerId
    );
}

export function declineProfessionalContractOffer(
    gameState,
    offerId
) {
    return declineContractOffer(
        gameState,
        offerId
    );
}

export function declineContractOffer(
    gameState,
    offerId
) {
    const offer =
        gameState.contracts
            .offers
            .find(
                current =>
                    current.id ===
                    offerId
            );

    if (!offer) {
        throw new Error(
            "Proposta não encontrada."
        );
    }

    offer.status =
        "declined";

    return offer;
}

export function getActiveContract(
    gameState
) {
    const contractId =
        gameState.contracts
            .activeContractId;

    if (!contractId) {
        return null;
    }

    const contract =
        gameState.contracts
            .byId[
                contractId
            ];

    if (
        !contract ||
        contract.status !==
            "active"
    ) {
        return null;
    }

    return contract;
}

export function getContractYearsRemaining(
    gameState,
    contract =
        getActiveContract(
            gameState
        )
) {
    if (!contract) {
        return null;
    }

    return Math.max(
        0,
        contract.endYear -
        gameState.calendar.year
    );
}

export function updateContractStatus(
    gameState
) {
    const contract =
        getActiveContract(
            gameState
        );

    if (!contract) {
        return null;
    }

    const yearsRemaining =
        getContractYearsRemaining(
            gameState,
            contract
        );

    if (
        yearsRemaining <=
        1
    ) {
        const alertExists =
            gameState.contracts
                .alerts
                .some(
                    alert =>
                        alert.contractId ===
                            contract.id &&
                        alert.year ===
                            gameState
                                .calendar
                                .year
                );

        if (
            !alertExists
        ) {
            gameState.contracts
                .alerts
                .push({
                    id:
                        createId(
                            "contract_alert"
                        ),

                    contractId:
                        contract.id,

                    year:
                        gameState.calendar.year,

                    type:
                        yearsRemaining ===
                            0
                            ? "expires_this_year"
                            : "one_year_remaining",

                    read:
                        false
                });
        }
    }

    if (
        gameState.calendar.year >=
        contract.endYear
    ) {
        contract.status =
            "expired";

        gameState.contracts
            .activeContractId =
            null;

        gameState.finances
            .monthlyIncome =
            0;

        gameState.contracts
            .history
            .push({
                action:
                    "contract_expired",

                contractId:
                    contract.id,

                year:
                    gameState.calendar.year,

                age:
                    gameState.calendar.age
            });

        addTimelineEntry(
            gameState,
            {
                type:
                    "contract_expired",

                title:
                    "Fim do contrato",

                description:
                    `O vínculo com o ${contract.clubName} chegou ao fim.`,

                importance: 7,

                relatedEntities: [
                    contract.clubId
                ],

                metadata: {
                    contractId:
                        contract.id
                }
            }
        );
    }

    return contract;
}