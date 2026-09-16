import {
    randomInt
} from "../core/rng.js";

import {
    getClub
} from "./academySystem.js";

import {
    getAgentNegotiationModifier
} from "./agentSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


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


function roundMoney(value) {
    return (
        Math.round(
            Number(value) / 50
        ) * 50
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

    const alreadyActive =
        getActiveContract(
            gameState
        );

    if (
        alreadyActive &&
        alreadyActive.type ===
            "formation"
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
            gameState.representation
                .currentAgentPersonId
                ? "agent"
                : (
                    gameState.calendar
                        .age <
                    18
                        ? "family"
                        : "player"
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

    const previousContract =
        getActiveContract(
            gameState
        );

    if (previousContract) {
        previousContract.status =
            "replaced";

        previousContract.endYear =
            gameState.calendar.year;
    }

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
            offer.guardianApprovalRequired
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
                `${gameState.player.identity.fullName} assinou contrato de formação com o ${contract.clubName}, com bolsa mensal de R$ ${contract.monthlyStipend.toLocaleString("pt-BR")}.`,

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


export function declineFormationContractOffer(
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
        yearsRemaining <= 1
    ) {
        const alertExists =
            gameState.contracts
                .alerts
                .some(
                    alert =>
                        alert
                            .contractId ===
                            contract.id &&
                        alert.year ===
                            gameState
                                .calendar
                                .year
                );

        if (!alertExists) {
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
                        gameState
                            .calendar
                            .year,

                    type:
                        yearsRemaining ===
                            0
                            ? "expires_this_year"
                            : "one_year_remaining",

                    read: false
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
                    gameState
                        .calendar
                        .year,

                age:
                    gameState
                        .calendar
                        .age
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