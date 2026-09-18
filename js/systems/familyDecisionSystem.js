import {
    randomInt
} from "../core/rng.js";

import {
    getPerson
} from "./personSystem.js";

import {
    getRelationship
} from "./relationshipSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


function numberOr(
    value,
    fallback = 50
) {
    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : fallback;
}


function getRelationshipValue(
    relationship,
    key,
    fallback = 50
) {
    if (!relationship) {
        return fallback;
    }

    if (
        relationship[key] !==
        undefined
    ) {
        return numberOr(
            relationship[key],
            fallback
        );
    }

    if (
        relationship.scores?.[
            key
        ] !== undefined
    ) {
        return numberOr(
            relationship.scores[
                key
            ],
            fallback
        );
    }

    return fallback;
}


function getGuardianCandidates(
    gameState
) {
    return [
        gameState.family
            ?.fatherId,

        gameState.family
            ?.motherId
    ]
        .filter(Boolean)
        .map(
            personId => {
                const person =
                    getPerson(
                        gameState,
                        personId
                    );

                const relationship =
                    getRelationship(
                        gameState,
                        gameState.player.id,
                        personId
                    );

                return {
                    person,
                    relationship,

                    trust:
                        getRelationshipValue(
                            relationship,
                            "trust"
                        ),

                    affection:
                        getRelationshipValue(
                            relationship,
                            "affection"
                        ),

                    conflict:
                        getRelationshipValue(
                            relationship,
                            "conflict",
                            0
                        )
                };
            }
        )
        .filter(
            item =>
                item.person
        );
}


function chooseGuardian(
    gameState
) {
    const candidates =
        getGuardianCandidates(
            gameState
        );

    if (!candidates.length) {
        return null;
    }

    return candidates
        .sort(
            (a, b) => {
                const scoreA =
                    a.trust +
                    a.affection -
                    a.conflict;

                const scoreB =
                    b.trust +
                    b.affection -
                    b.conflict;

                return (
                    scoreB -
                    scoreA
                );
            }
        )[0];
}


function detectRelocation(
    gameState,
    offer
) {
    if (
        offer.relocationRequired ===
        true
    ) {
        return true;
    }

    const destinationCity =
        offer.cityId ??
        offer.clubCityId ??
        offer.destinationCityId ??
        null;

    if (!destinationCity) {
        return false;
    }

    return (
        destinationCity !==
        gameState.player
            .identity
            .currentCityId
    );
}


function calculateFinancialComfort(
    offer
) {
    const salary =
        Number(
            offer.salary ??
            offer.monthlyStipend ??
            0
        );

    if (salary >= 10000) {
        return 10;
    }

    if (salary >= 5000) {
        return 7;
    }

    if (salary >= 2500) {
        return 4;
    }

    if (salary >= 1000) {
        return 2;
    }

    return 0;
}


function calculateFamilyScore(
    gameState,
    offer,
    offerType,
    guardian,
    conversationCount
) {
    const age =
        gameState.calendar.age;

    let score = 48;


    /*
     * Quanto mais velho o personagem,
     * mais autonomia a família tende
     * a conceder.
     */
    score +=
        Math.max(
            0,
            age - 10
        ) * 3;


    if (guardian) {
        score +=
            (
                guardian.trust -
                50
            ) * 0.20;

        score +=
            (
                guardian.affection -
                50
            ) * 0.08;

        score -=
            guardian.conflict *
            0.10;
    }


    if (
        detectRelocation(
            gameState,
            offer
        )
    ) {
        score -=
            age < 14
                ? 18
                : 9;
    }


    if (
        offerType ===
        "professional_contract"
    ) {
        score += 10;
    }


    if (
        offerType ===
        "formation_contract"
    ) {
        score += 5;
    }


    if (
        offerType ===
        "representation"
    ) {
        score += 3;
    }


    score +=
        calculateFinancialComfort(
            offer
        );


    /*
     * Uma segunda conversa pode
     * esclarecer parte das dúvidas.
     */
    if (
        conversationCount >=
        2
    ) {
        score += 8;
    }


    /*
     * Elemento humano:
     * mesmo uma boa oportunidade
     * pode gerar preocupação.
     */
    score +=
        randomInt(
            gameState.rng,
            -14,
            14
        );


    return Math.round(
        score
    );
}


function buildDecisionMessage({
    status,
    guardianName,
    relocation
}) {
    if (
        status ===
        "approved"
    ) {
        return relocation
            ? `${guardianName} acredita que a oportunidade pode valer a mudança e decidiu apoiar você.`
            : `${guardianName} gostou da oportunidade e acredita que você deve seguir em frente.`;
    }


    if (
        status ===
        "concerned"
    ) {
        return relocation
            ? `${guardianName} aceita a possibilidade, mas está preocupado com a mudança, a escola e sua adaptação.`
            : `${guardianName} não quer impedir sua decisão, mas deixou claro que ainda está preocupado com alguns detalhes.`;
    }


    if (
        status ===
        "needs_info"
    ) {
        return `${guardianName} ainda não se sente confortável para decidir e quer entender melhor a proposta antes de autorizar qualquer coisa.`;
    }


    return relocation
        ? `${guardianName} acha que essa mudança é grande demais neste momento e não concorda com a proposta.`
        : `${guardianName} não acredita que essa seja a melhor decisão para você agora e decidiu não apoiar a proposta.`;
}


function determineStatus(
    score,
    conversationCount
) {
    if (score >= 72) {
        return "approved";
    }

    if (score >= 56) {
        return "concerned";
    }

    if (
        score >= 40 &&
        conversationCount < 2
    ) {
        return "needs_info";
    }

    if (
        score >= 46
    ) {
        return "concerned";
    }

    return "opposed";
}


export function discussOfferWithFamily(
    gameState,
    offer,
    offerType
) {
    if (
        gameState.calendar.age >=
        18
    ) {
        return {
            status:
                "not_required",

            message:
                "Você já é maior de idade e pode tomar essa decisão sozinho."
        };
    }


    offer.familyConversationCount =
        (
            Number(
                offer.familyConversationCount
            ) || 0
        ) +
        1;


    const guardian =
        chooseGuardian(
            gameState
        );

    const guardianName =
        guardian
            ?.person
            ?.identity
            ?.fullName ??
        "Seu responsável";


    const relocation =
        detectRelocation(
            gameState,
            offer
        );


    const score =
        calculateFamilyScore(
            gameState,
            offer,
            offerType,
            guardian,
            offer.familyConversationCount
        );


    const status =
        determineStatus(
            score,
            offer.familyConversationCount
        );


    const decision = {
        status,

        score,

        guardianPersonId:
            guardian
                ?.person
                ?.id ??
            null,

        guardianName,

        relocation,

        conversationCount:
            offer.familyConversationCount,

        year:
            gameState.calendar.year,

        age:
            gameState.calendar.age,

        message:
            buildDecisionMessage({
                status,
                guardianName,
                relocation
            })
    };


    offer.familyDecision =
        decision;

    offer.familyDiscussed =
        true;


    addTimelineEntry(
        gameState,
        {
            type:
                "family_offer_discussion",

            title:
                `Conversa com ${guardianName}`,

            description:
                decision.message,

            importance:
                status ===
                    "opposed"
                    ? 7
                    : 5,

            relatedEntities:
                decision
                    .guardianPersonId
                    ? [
                        decision
                            .guardianPersonId
                    ]
                    : [],

            metadata: {
                offerId:
                    offer.id,

                offerType,

                familyStatus:
                    status,

                score
            }
        }
    );


    return decision;
}


export function canFamilyApproveOffer(
    gameState,
    offer
) {
    if (
        gameState.calendar.age >=
        18
    ) {
        return true;
    }

    const status =
        offer.familyDecision
            ?.status;


    return (
        status ===
            "approved" ||
        status ===
            "concerned"
    );
}


export function getFamilyDecision(
    offer
) {
    return (
        offer.familyDecision ??
        null
    );
}