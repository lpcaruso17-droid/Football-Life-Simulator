import {
    getClub,
    calculateAcademyDevelopmentScore
} from "./academySystem.js";

import {
    calculateAcademyRecognition
} from "./academyCareerSystem.js";

import {
    addTimelineEntry
} from "./timelineSystem.js";


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


function average(values) {
    const valid =
        values.filter(
            value =>
                Number.isFinite(
                    Number(value)
                )
        );

    if (!valid.length) {
        return 0;
    }

    return (
        valid.reduce(
            (
                total,
                value
            ) =>
                total +
                Number(value),
            0
        ) /
        valid.length
    );
}


function addCareerMilestone(
    gameState,
    milestone
) {
    gameState.career
        .milestones
        .push({
            ...milestone,

            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age,

            clubId:
                gameState.player
                    .football
                    .currentClubId
        });
}


export function calculateProfessionalReadiness(
    gameState
) {
    const development =
        calculateAcademyDevelopmentScore(
            gameState
        );

    const recognition =
        calculateAcademyRecognition(
            gameState
        );

    const potential =
        Number(
            gameState.player
                .hidden
                .potential
        ) || 60;

    const personality =
        gameState.player
            .hidden
            .personality;

    const mentality =
        average([
            personality
                ?.professionalism,

            personality
                ?.discipline,

            personality
                ?.resilience,

            personality
                ?.adaptability,

            personality
                ?.ambition
        ]);

    const club =
        getClub(
            gameState,
            gameState.player
                .football
                .currentClubId
        );

    const competition =
        Number(
            club?.competition
        ) || 50;

    const age =
        gameState.calendar.age;

    const ageBonus =
        clamp(
            (age - 14) * 5,
            0,
            20
        );

    let categoryBonus = 0;

    const category =
        gameState.player
            .football
            .currentCategory;

    if (category === "u17") {
        categoryBonus = 3;
    }

    if (category === "u20") {
        categoryBonus = 8;
    }

    const score =
        clamp(
            Math.round(
                development * 0.38 +
                recognition * 0.23 +
                potential * 0.14 +
                mentality * 0.12 +
                ageBonus +
                categoryBonus -
                competition * 0.09 +
                7
            )
        );

    gameState.professional
        .readiness =
        score;

    return score;
}


export function canTrainWithFirstTeam(
    gameState
) {
    if (
        !gameState.player
            .football
            .currentClubId
    ) {
        return false;
    }

    if (
        gameState.calendar.age <
        15
    ) {
        return false;
    }

    const readiness =
        calculateProfessionalReadiness(
            gameState
        );

    return (
        readiness >=
        48
    );
}


export function grantFirstTeamTraining(
    gameState
) {
    const clubId =
        gameState.player
            .football
            .currentClubId;

    if (!clubId) {
        throw new Error(
            "Não existe clube atual para realizar treinamento com o elenco profissional."
        );
    }

    if (
        gameState.professional
            .firstTeamTrainingYear !==
            null
    ) {
        gameState.professional
            .firstTeamTrainingCount +=
            1;

        return gameState.professional;
    }

    const club =
        getClub(
            gameState,
            clubId
        );

    if (!club) {
        throw new Error(
            "Clube atual não encontrado."
        );
    }

    gameState.professional
        .trainingWithFirstTeam =
        true;

    gameState.professional
        .firstTeamTrainingCount =
        1;

    gameState.professional
        .firstTeamTrainingYear =
        gameState.calendar.year;

    gameState.professional
        .status =
        "training_with_first_team";

    gameState.professional
        .firstTeamTrust =
        Math.max(
            10,
            gameState.professional
                .firstTeamTrust
        );

    gameState.professional
        .history
        .push({
            type:
                "first_team_training",

            year:
                gameState.calendar.year,

            age:
                gameState.calendar.age,

            clubId:
                club.id
        });

    addCareerMilestone(
        gameState,
        {
            type:
                "first_team_training"
        }
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "first_team_training",

            title:
                "Primeiro treino com o profissional",

            description:
                `${gameState.player.identity.fullName} foi chamado para treinar com o elenco profissional do ${club.name}.`,

            importance: 9,

            relatedEntities: [
                club.id
            ]
        }
    );

    return gameState.professional;
}


export function grantFirstTeamCallUp(
    gameState,
    {
        competition =
            "Competição profissional",

        opponent =
            "Adversário"
    } = {}
) {
    const clubId =
        gameState.player
            .football
            .currentClubId;

    if (!clubId) {
        throw new Error(
            "O jogador precisa estar vinculado a um clube."
        );
    }

    if (
        !gameState.player
            .football
            .isProfessional
    ) {
        throw new Error(
            "O jogador precisa possuir vínculo profissional."
        );
    }

    if (
        gameState.professional
            .firstCallUp
    ) {
        return gameState.professional
            .firstCallUp;
    }

    const club =
        getClub(
            gameState,
            clubId
        );

    const callUp = {
        year:
            gameState.calendar.year,

        age:
            gameState.calendar.age,

        competition,

        opponent,

        clubId
    };

    gameState.professional
        .firstCallUp =
        callUp;

    gameState.professional
        .status =
        "first_team_squad";

    gameState.professional
        .history
        .push({
            type:
                "first_call_up",

            ...callUp
        });

    addCareerMilestone(
        gameState,
        {
            type:
                "first_professional_call_up",

            competition,

            opponent
        }
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "first_professional_call_up",

            title:
                "Primeira convocação profissional",

            description:
                `${gameState.player.identity.fullName} foi relacionado pela primeira vez para uma partida profissional do ${club?.name ?? "clube"}.`,

            importance: 9,

            relatedEntities:
                club
                    ? [club.id]
                    : [],

            metadata: {
                competition,

                opponent
            }
        }
    );

    return callUp;
}


export function recordFirstProfessionalBench(
    gameState,
    {
        competition =
            "Competição profissional",

        opponent =
            "Adversário"
    } = {}
) {
    if (
        !gameState.player
            .football
            .currentClubId
    ) {
        throw new Error(
            "O jogador está sem clube."
        );
    }

    if (
        !gameState.professional
            .firstCallUp
    ) {
        throw new Error(
            "O jogador ainda não foi convocado para o profissional."
        );
    }

    if (
        gameState.professional
            .firstBench
    ) {
        return gameState.professional
            .firstBench;
    }

    const bench = {
        year:
            gameState.calendar.year,

        age:
            gameState.calendar.age,

        competition,

        opponent
    };

    gameState.professional
        .firstBench =
        bench;

    gameState.professional
        .history
        .push({
            type:
                "first_bench",

            ...bench
        });

    addCareerMilestone(
        gameState,
        {
            type:
                "first_professional_bench",

            competition,

            opponent
        }
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "first_professional_bench",

            title:
                "Primeira vez no banco do profissional",

            description:
                `${gameState.player.identity.fullName} ficou no banco de reservas pela primeira vez em uma partida profissional.`,

            importance: 8,

            metadata: {
                competition,

                opponent
            }
        }
    );

    return bench;
}


export function recordProfessionalDebut(
    gameState,
    {
        competition =
            "Competição profissional",

        opponent =
            "Adversário",

        minutes = 15,

        starter = false,

        result = null
    } = {}
) {
    if (
        !gameState.player
            .football
            .currentClubId
    ) {
        throw new Error(
            "O jogador está sem clube."
        );
    }

    if (
        !gameState.player
            .football
            .isProfessional
    ) {
        throw new Error(
            "Jogador ainda não possui contrato profissional."
        );
    }

    if (
        gameState.professional
            .debut
    ) {
        return gameState.professional
            .debut;
    }

    const debut = {
        year:
            gameState.calendar.year,

        age:
            gameState.calendar.age,

        competition,

        opponent,

        minutes,

        starter,

        result
    };

    gameState.professional
        .debut =
        debut;

    gameState.professional
        .status =
        "professional_player";

    gameState.player
        .football
        .hasDebutedProfessionally =
        true;

    gameState.professional
        .history
        .push({
            type:
                "professional_debut",

            ...debut
        });

    addCareerMilestone(
        gameState,
        {
            type:
                "professional_debut",

            competition,

            opponent,

            minutes,

            starter,

            result
        }
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "professional_debut",

            title:
                "ESTREIA PROFISSIONAL",

            description:
                `${gameState.player.identity.fullName} fez sua estreia como jogador profissional contra ${opponent}.`,

            importance: 10,

            metadata: {
                competition,

                opponent,

                minutes,

                starter,

                result
            }
        }
    );

    if (
        starter &&
        !gameState.professional
            .firstStart
    ) {
        recordFirstProfessionalStart(
            gameState,
            {
                competition,

                opponent,

                result
            }
        );
    }

    return debut;
}


export function recordFirstProfessionalStart(
    gameState,
    {
        competition =
            "Competição profissional",

        opponent =
            "Adversário",

        result = null
    } = {}
) {
    if (
        !gameState.player
            .football
            .currentClubId
    ) {
        throw new Error(
            "O jogador está sem clube."
        );
    }

    if (
        !gameState.professional
            .debut
    ) {
        throw new Error(
            "O jogador precisa ter estreado profissionalmente."
        );
    }

    if (
        gameState.professional
            .firstStart
    ) {
        return gameState.professional
            .firstStart;
    }

    const firstStart = {
        year:
            gameState.calendar.year,

        age:
            gameState.calendar.age,

        competition,

        opponent,

        result
    };

    gameState.professional
        .firstStart =
        firstStart;

    gameState.professional
        .history
        .push({
            type:
                "first_professional_start",

            ...firstStart
        });

    addCareerMilestone(
        gameState,
        {
            type:
                "first_professional_start",

            competition,

            opponent,

            result
        }
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "first_professional_start",

            title:
                "Primeiro jogo como titular",

            description:
                `${gameState.player.identity.fullName} iniciou pela primeira vez uma partida no time profissional.`,

            importance: 9,

            metadata: {
                competition,

                opponent,

                result
            }
        }
    );

    return firstStart;
}


export function recordFirstProfessionalGoal(
    gameState,
    {
        competition =
            "Competição profissional",

        opponent =
            "Adversário",

        minute = null
    } = {}
) {
    if (
        !gameState.player
            .football
            .currentClubId
    ) {
        throw new Error(
            "O jogador está sem clube."
        );
    }

    if (
        !gameState.professional
            .debut
    ) {
        throw new Error(
            "O jogador ainda não estreou profissionalmente."
        );
    }

    if (
        gameState.professional
            .firstGoal
    ) {
        return gameState.professional
            .firstGoal;
    }

    const goal = {
        year:
            gameState.calendar.year,

        age:
            gameState.calendar.age,

        competition,

        opponent,

        minute
    };

    gameState.professional
        .firstGoal =
        goal;

    gameState.professional
        .history
        .push({
            type:
                "first_professional_goal",

            ...goal
        });

    addCareerMilestone(
        gameState,
        {
            type:
                "first_professional_goal",

            competition,

            opponent,

            minute
        }
    );

    addTimelineEntry(
        gameState,
        {
            type:
                "first_professional_goal",

            title:
                "Primeiro gol como profissional",

            description:
                `${gameState.player.identity.fullName} marcou seu primeiro gol no futebol profissional.`,

            importance: 10,

            metadata: {
                competition,

                opponent,

                minute
            }
        }
    );

    return goal;
}


export function getNextProfessionalMilestone(
    gameState
) {
    /*
     * REGRA FUNDAMENTAL:
     *
     * Sem clube, nenhum marco de
     * primeiro time pode acontecer.
     *
     * Foi exatamente isso que causou
     * o travamento encontrado no teste.
     */
    if (
        !gameState.player
            .football
            .currentClubId
    ) {
        return null;
    }

    const readiness =
        calculateProfessionalReadiness(
            gameState
        );

    if (
        !gameState.professional
            .firstTeamTrainingYear &&
        canTrainWithFirstTeam(
            gameState
        )
    ) {
        return "first_team_training";
    }

    if (
        gameState.player
            .football
            .isProfessional &&
        gameState.professional
            .firstTeamTrainingYear &&
        !gameState.professional
            .firstCallUp &&
        readiness >= 56
    ) {
        return "first_call_up";
    }

    if (
        gameState.professional
            .firstCallUp &&
        !gameState.professional
            .firstBench &&
        readiness >= 58
    ) {
        return "first_bench";
    }

    if (
        gameState.professional
            .firstBench &&
        !gameState.professional
            .debut &&
        readiness >= 62
    ) {
        return "professional_debut";
    }

    if (
        gameState.professional
            .debut &&
        !gameState.professional
            .firstStart &&
        readiness >= 70
    ) {
        return "first_start";
    }

    return null;
}