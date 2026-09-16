import {
    loadActiveGame,
    saveGame
} from "../core/saveManager.js";

import {
    getCityById
} from "../data/cities.js";

import {
    getAcademyCategoryById
} from "../data/clubs.js";

import {
    getActiveContract,
    getContractYearsRemaining
} from "../systems/contractSystem.js";

import {
    getAgencyById
} from "../data/agencies.js";

import {
    getPerson
} from "../systems/personSystem.js";

import {
    getRelationship,
    describeRelationship
} from "../systems/relationshipSystem.js";

import {
    getHousingDescription
} from "../systems/housingSystem.js";

import {
    getEducationStatus
} from "../systems/educationSystem.js";

import {
    navigateTo
} from "./router.js";


function escapeHtml(
    value
) {
    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function money(
    value
) {
    return new Intl
        .NumberFormat(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL",

                maximumFractionDigits:
                    0
            }
        )
        .format(
            Number(value) ||
            0
        );
}


function categoryLabel(
    categoryId
) {
    return (
        getAcademyCategoryById(
            categoryId
        )
            ?.label ??
        (
            categoryId
                ? String(
                    categoryId
                ).toUpperCase()
                : "—"
        )
    );
}


function squadStatusLabel(
    status
) {
    const labels = {
        evaluation:
            "Em avaliação",

        under_review:
            "Sob observação",

        fringe:
            "Fora dos planos",

        reserve:
            "Reserva",

        rotation:
            "Rotação",

        starter:
            "Titular",

        key_player:
            "Destaque",

        unattached:
            "Sem clube"
    };

    return (
        labels[status] ??
        status ??
        "—"
    );
}


function renderFamilyMember(
    game,
    personId,
    label
) {
    if (!personId) {
        return `
            <div class="person-row">
                <div class="person-main">
                    <div class="person-name">
                        ${label}
                    </div>

                    <div class="person-role">
                        Não presente na estrutura inicial.
                    </div>
                </div>
            </div>
        `;
    }

    const person =
        getPerson(
            game,
            personId
        );

    if (!person) {
        return "";
    }

    const relationship =
        getRelationship(
            game,
            game.player.id,
            person.id
        );

    return `
        <div class="person-row">
            <div class="person-main">
                <div class="person-name">
                    ${escapeHtml(person.identity.fullName)}
                </div>

                <div class="person-role">
                    ${escapeHtml(label)}
                    ·
                    ${escapeHtml(person.profession ?? "—")}
                </div>
            </div>

            <span class="badge">
                ${escapeHtml(
                    describeRelationship(
                        relationship
                    )
                )}
            </span>
        </div>
    `;
}


function renderTimeline(
    game
) {
    const entries =
        [...(
            game.timeline ??
            []
        )]
            .sort(
                (a, b) =>
                    (
                        b.year -
                        a.year
                    ) ||
                    (
                        new Date(
                            b.createdAt
                        ) -
                        new Date(
                            a.createdAt
                        )
                    )
            )
            .slice(
                0,
                7
            );

    if (!entries.length) {
        return `
            <div class="muted">
                Nenhum acontecimento registrado.
            </div>
        `;
    }

    return entries
        .map(
            entry => `
                <div class="timeline-row">
                    <div>
                        <strong>
                            ${escapeHtml(entry.title)}
                        </strong>

                        <div class="timeline-description">
                            ${escapeHtml(entry.description)}
                        </div>
                    </div>

                    <div class="timeline-date">
                        ${escapeHtml(entry.year)}
                        ·
                        ${escapeHtml(entry.age)} anos
                    </div>
                </div>
            `
        )
        .join("");
}


function renderContract(
    game
) {
    const contract =
        getActiveContract(
            game
        );

    if (!contract) {
        return `
            <div class="muted">
                Nenhum contrato formal ativo.
            </div>
        `;
    }

    const remaining =
        getContractYearsRemaining(
            game,
            contract
        );

    const income =
        contract.type ===
            "professional"
            ? contract.salary
            : contract.monthlyStipend;

    return `
        <div class="contract-highlight">
            <strong>
                ${
                    contract.type ===
                    "professional"
                        ? "Contrato profissional"
                        : "Contrato de formação"
                }
            </strong>

            <div
                class="muted"
                style="margin-top: 6px;"
            >
                ${escapeHtml(contract.clubName)}

                ·

                ${money(income)} / mês

                ·

                até ${escapeHtml(contract.endYear)}

                ·

                ${
                    remaining === 0
                        ? "vence neste ano"
                        : `${remaining} ano(s) restante(s)`
                }
            </div>
        </div>
    `;
}


export function renderDashboardView(
    root
) {
    const game =
        loadActiveGame();

    if (!game) {
        navigateTo(
            "home"
        );

        return;
    }


    const player =
        game.player;

    const city =
        getCityById(
            player.identity
                .currentCityId
        );

    const category =
        categoryLabel(
            player.football
                .currentCategory
        );

    const season =
        game.footballContext
            ?.lastSeasonSummary;

    const agency =
        game.representation
            ?.currentAgencyId
            ? getAgencyById(
                game.representation
                    .currentAgencyId
            )
            : null;

    const agent =
        game.representation
            ?.currentAgentPersonId
            ? getPerson(
                game,
                game.representation
                    .currentAgentPersonId
            )
            : null;

    const fatherHtml =
        renderFamilyMember(
            game,
            game.family
                ?.fatherId,
            "Pai"
        );

    const motherHtml =
        renderFamilyMember(
            game,
            game.family
                ?.motherId,
            "Mãe"
        );

    const siblingHtml =
        (
            game.family
                ?.siblingIds ??
            []
        )
            .map(
                siblingId =>
                    renderFamilyMember(
                        game,
                        siblingId,
                        "Irmão / irmã"
                    )
            )
            .join("");


    root.innerHTML = `
        <main class="app-shell page">
            <header class="dashboard-header">
                <div>
                    <div class="eyebrow">
                        Minha vida
                    </div>

                    <h1 class="player-name">
                        ${escapeHtml(
                            player.identity
                                .fullName
                        )}
                    </h1>

                    <div class="player-subtitle">
                        ${escapeHtml(city?.name ?? "Cidade não definida")}

                        ·

                        ${escapeHtml(
                            player.football
                                .currentClubName ??
                            "Sem clube"
                        )}

                        ${
                            player.football
                                .currentCategory
                                ? ` · ${escapeHtml(category)}`
                                : ""
                        }
                    </div>
                </div>

                <div class="age-box">
                    <span class="age-box-label">
                        Idade
                    </span>

                    <span class="age-box-value">
                        ${escapeHtml(
                            game.calendar.age
                        )}
                    </span>
                </div>
            </header>

            <div class="dashboard-toolbar">
                <button
                    id="save-now"
                    class="btn btn-primary"
                    type="button"
                >
                    Salvar agora
                </button>

                <button
                    id="go-home"
                    class="btn"
                    type="button"
                >
                    Meus saves
                </button>
            </div>

            <section class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-label">
                        Saúde
                    </div>

                    <div class="stat-value">
                        ${escapeHtml(
                            player.life
                                .generalHealth
                        )}
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">
                        Felicidade
                    </div>

                    <div class="stat-value">
                        ${escapeHtml(
                            player.life
                                .happiness
                        )}
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">
                        Escola
                    </div>

                    <div class="stat-value">
                        ${escapeHtml(
                            game.education
                                .performance
                        )}
                    </div>

                    <div class="stat-detail">
                        ${escapeHtml(
                            getEducationStatus(
                                game
                            )
                        )}
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">
                        Reputação
                    </div>

                    <div class="stat-value">
                        ${escapeHtml(
                            game.reputation
                                .overall
                        )}
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">
                        Dinheiro
                    </div>

                    <div class="stat-value">
                        ${money(
                            game.finances
                                .cash
                        )}
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">
                        Renda mensal
                    </div>

                    <div class="stat-value">
                        ${money(
                            game.finances
                                .monthlyIncome
                        )}
                    </div>
                </div>
            </section>

            <div class="dashboard-grid">
                <section class="dashboard-panel dashboard-panel-wide">
                    <div class="section-title">
                        Situação atual
                    </div>

                    <div class="info-grid">
                        <div>
                            <div class="info-item-label">
                                Clube
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    player.football
                                        .currentClubName ??
                                    "Sem clube"
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Categoria
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(category)}
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Posição
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    player.football
                                        .position ??
                                    "—"
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Status no elenco
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    squadStatusLabel(
                                        player.football
                                            .squadStatus
                                    )
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Moradia
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    getHousingDescription(
                                        game
                                    )
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Ano
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    game.calendar.year
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section class="dashboard-panel">
                    <div class="section-title">
                        Momento no futebol
                    </div>

                    <div class="info-grid">
                        <div>
                            <div class="info-item-label">
                                Confiança do treinador
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    game.footballContext
                                        ?.coachTrust ??
                                    45
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Forma
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    game.footballContext
                                        ?.form ??
                                    50
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Concorrência
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    game.footballContext
                                        ?.positionCompetition ??
                                    0
                                )}
                                concorrente(s)
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Profissional
                            </div>

                            <div class="info-item-value">
                                ${
                                    player.football
                                        .isProfessional
                                        ? "Sim"
                                        : "Não"
                                }
                            </div>
                        </div>
                    </div>
                </section>

                <section class="dashboard-panel">
                    <div class="section-title">
                        Última temporada
                    </div>

                    ${
                        season
                            ? `
                                <div class="info-grid">
                                    <div>
                                        <div class="info-item-label">
                                            Jogos
                                        </div>

                                        <div class="info-item-value">
                                            ${escapeHtml(season.appearances)}
                                        </div>
                                    </div>

                                    <div>
                                        <div class="info-item-label">
                                            Titular
                                        </div>

                                        <div class="info-item-value">
                                            ${escapeHtml(season.starts)}
                                        </div>
                                    </div>

                                    <div>
                                        <div class="info-item-label">
                                            Minutos
                                        </div>

                                        <div class="info-item-value">
                                            ${escapeHtml(season.minutes)}
                                        </div>
                                    </div>

                                    <div>
                                        <div class="info-item-label">
                                            Média
                                        </div>

                                        <div class="info-item-value">
                                            ${escapeHtml(season.averageRating)}
                                        </div>
                                    </div>

                                    <div>
                                        <div class="info-item-label">
                                            Gols
                                        </div>

                                        <div class="info-item-value">
                                            ${escapeHtml(season.goals)}
                                        </div>
                                    </div>

                                    <div>
                                        <div class="info-item-label">
                                            Assistências
                                        </div>

                                        <div class="info-item-value">
                                            ${escapeHtml(season.assists)}
                                        </div>
                                    </div>
                                </div>
                            `
                            : `
                                <div class="muted">
                                    Nenhuma temporada completa ainda.
                                </div>
                            `
                    }
                </section>

                <section class="dashboard-panel">
                    <div class="section-title">
                        Família
                    </div>

                    <div class="people-list">
                        ${fatherHtml}

                        ${motherHtml}

                        ${siblingHtml}
                    </div>
                </section>

                <section class="dashboard-panel">
                    <div class="section-title">
                        Representação
                    </div>

                    ${
                        agency
                            ? `
                                <div class="info-item-label">
                                    Agência
                                </div>

                                <div class="info-item-value">
                                    ${escapeHtml(agency.name)}
                                </div>

                                <div
                                    class="info-item-label"
                                    style="margin-top: 18px;"
                                >
                                    Empresário
                                </div>

                                <div class="info-item-value">
                                    ${escapeHtml(
                                        agent
                                            ?.identity
                                            ?.fullName ??
                                        "—"
                                    )}
                                </div>
                            `
                            : `
                                <div class="muted">
                                    O jogador ainda não possui
                                    representação formal.
                                </div>
                            `
                    }
                </section>

                <section class="dashboard-panel dashboard-panel-wide">
                    <div class="section-title">
                        Contrato
                    </div>

                    ${renderContract(game)}
                </section>

                <section class="dashboard-panel dashboard-panel-wide">
                    <div class="section-title">
                        Sua história
                    </div>

                    <div class="timeline-list">
                        ${renderTimeline(game)}
                    </div>
                </section>

                <section class="dashboard-panel dashboard-panel-wide">
                    <div class="dev-note">
                        A estrutura visual da V0.5 já está
                        conectada ao novo Core.

                        No próximo bloco, o botão
                        <strong>Viver o ano</strong>
                        será ligado ao motor de temporada,
                        eventos, escolhas e progressão temporal.
                    </div>
                </section>
            </div>
        </main>
    `;


    root
        .querySelector(
            "#go-home"
        )
        ?.addEventListener(
            "click",
            () => {
                navigateTo(
                    "home"
                );
            }
        );


    root
        .querySelector(
            "#save-now"
        )
        ?.addEventListener(
            "click",
            event => {
                saveGame(
                    game,
                    {
                        reason:
                            "manual_dashboard_save"
                    }
                );

                const button =
                    event.currentTarget;

                const previous =
                    button.textContent;

                button.textContent =
                    "Salvo ✓";

                window.setTimeout(
                    () => {
                        button.textContent =
                            previous;
                    },
                    1200
                );
            }
        );
}