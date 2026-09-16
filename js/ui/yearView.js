import {
    loadActiveGame,
    saveGame
} from "../core/saveManager.js";

import {
    startYearFlow,
    resolveCurrentYearEvent,
    clearYearFlow
} from "../systems/yearFlowSystem.js";

import {
    getPhaseLabel
} from "../core/timeEngine.js";

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


function formatDecision(
    decision
) {
    const labels = {
        promoted:
            "Promovido de categoria",

        fast_track:
            "Promoção acelerada",

        retained:
            "Permanece no clube",

        observation:
            "Segue em observação",

        released:
            "Dispensado",

        unattached:
            "Sem clube"
    };

    return (
        labels[
            decision
        ] ??
        decision ??
        "—"
    );
}


function renderProgress(
    phase
) {
    const phases = [
        "preseason",
        "early_season",
        "mid_season",
        "late_season",
        "offseason"
    ];

    const activeIndex =
        Math.max(
            0,
            phases.indexOf(
                phase
            )
        );

    return `
        <div class="year-progress">
            ${phases
                .map(
                    (
                        item,
                        index
                    ) => `
                        <div
                            class="
                                year-progress-step
                                ${
                                    index <
                                    activeIndex
                                        ? "completed"
                                        : ""
                                }
                                ${
                                    index ===
                                    activeIndex
                                        ? "active"
                                        : ""
                                }
                            "
                        >
                            <span>
                                ${index + 1}
                            </span>

                            <small>
                                ${escapeHtml(
                                    getPhaseLabel(
                                        item
                                    )
                                )}
                            </small>
                        </div>
                    `
                )
                .join("")}
        </div>
    `;
}


function renderEventStep(
    root,
    game,
    step
) {
    const event =
        step.event;

    root.innerHTML = `
        <main class="app-shell page">
            <div class="eyebrow">
                ${escapeHtml(
                    getPhaseLabel(
                        step.phase
                    )
                )}
            </div>

            <h1 class="page-title">
                ${escapeHtml(
                    event.title
                )}
            </h1>

            <p class="page-subtitle">
                ${escapeHtml(
                    event.description
                )}
            </p>

            ${renderProgress(
                step.phase
            )}

            <section class="year-event-card">
                <div class="year-event-meta">
                    ${escapeHtml(
                        game.calendar.year
                    )}

                    ·

                    ${escapeHtml(
                        game.calendar.age
                    )}
                    anos
                </div>

                <div class="year-event-choices">
                    ${(
                        event.choices ??
                        []
                    )
                        .map(
                            choice => `
                                <button
                                    class="year-choice"
                                    type="button"
                                    data-choice-id="${escapeHtml(
                                        choice.id
                                    )}"
                                >
                                    <strong>
                                        ${escapeHtml(
                                            choice.label
                                        )}
                                    </strong>

                                    <span>
                                        Escolher esta opção
                                    </span>
                                </button>
                            `
                        )
                        .join("")}
                </div>
            </section>
        </main>
    `;


    root
        .querySelectorAll(
            "[data-choice-id]"
        )
        .forEach(
            button => {
                button
                    .addEventListener(
                        "click",
                        () => {
                            const choiceId =
                                button
                                    .dataset
                                    .choiceId;

                            try {
                                const result =
                                    resolveCurrentYearEvent(
                                        game,
                                        choiceId
                                    );


                                saveGame(
                                    game,
                                    {
                                        reason:
                                            "year_event_choice"
                                    }
                                );


                                renderYearStep(
                                    root,
                                    game,
                                    result.nextStep
                                );
                            } catch (
                                error
                            ) {
                                console.error(
                                    error
                                );

                                window.alert(
                                    error
                                        ?.message ??
                                    "Não foi possível processar a decisão."
                                );
                            }
                        }
                    );
            }
        );
}


function renderYearSummary(
    root,
    game,
    summary
) {
    const season =
        summary.season;

    const academyDecision =
        summary.academyDecision
            ?.decision ??
        null;

    root.innerHTML = `
        <main class="app-shell page">
            <div class="eyebrow">
                Ano concluído
            </div>

            <h1 class="page-title">
                ${escapeHtml(
                    summary.completedYear
                )}
                ficou para trás.
            </h1>

            <p class="page-subtitle">
                ${escapeHtml(
                    game.player
                        .identity
                        .fullName
                )}
                agora tem
                ${escapeHtml(
                    game.calendar.age
                )}
                anos.
            </p>

            <section class="year-summary-grid">
                <div class="stat-card">
                    <div class="stat-label">
                        Jogos
                    </div>

                    <div class="stat-value">
                        ${escapeHtml(
                            season
                                ?.stats
                                ?.appearances ??
                            0
                        )}
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">
                        Titular
                    </div>

                    <div class="stat-value">
                        ${escapeHtml(
                            season
                                ?.stats
                                ?.starts ??
                            0
                        )}
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">
                        Média
                    </div>

                    <div class="stat-value">
                        ${escapeHtml(
                            season
                                ?.stats
                                ?.averageRating ??
                            "—"
                        )}
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">
                        Gols
                    </div>

                    <div class="stat-value">
                        ${escapeHtml(
                            season
                                ?.stats
                                ?.goals ??
                            0
                        )}
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">
                        Assistências
                    </div>

                    <div class="stat-value">
                        ${escapeHtml(
                            season
                                ?.stats
                                ?.assists ??
                            0
                        )}
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">
                        Reputação
                    </div>

                    <div class="stat-value">
                        ${escapeHtml(
                            summary.reputation
                        )}
                    </div>
                </div>
            </section>

            <div class="dashboard-grid">
                <section class="dashboard-panel">
                    <div class="section-title">
                        Futebol
                    </div>

                    ${
                        season
                            ? `
                                <div class="info-grid">
                                    <div>
                                        <div class="info-item-label">
                                            Clube
                                        </div>

                                        <div class="info-item-value">
                                            ${escapeHtml(
                                                season.clubName
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div class="info-item-label">
                                            Competição
                                        </div>

                                        <div class="info-item-value">
                                            ${escapeHtml(
                                                season.competition
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div class="info-item-label">
                                            Minutos
                                        </div>

                                        <div class="info-item-value">
                                            ${escapeHtml(
                                                season.stats
                                                    .minutes
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div class="info-item-label">
                                            Status final
                                        </div>

                                        <div class="info-item-value">
                                            ${escapeHtml(
                                                season.squadStatusAfter
                                            )}
                                        </div>
                                    </div>
                                </div>
                            `
                            : `
                                <div class="muted">
                                    O ano terminou sem uma temporada
                                    oficial por um clube.
                                </div>
                            `
                    }
                </section>

                <section class="dashboard-panel">
                    <div class="section-title">
                        Vida
                    </div>

                    <div class="info-grid">
                        <div>
                            <div class="info-item-label">
                                Felicidade
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    summary.happiness
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Saúde
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    summary.health
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Escola
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    summary.education
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="info-item-label">
                                Avaliação do clube
                            </div>

                            <div class="info-item-value">
                                ${escapeHtml(
                                    formatDecision(
                                        academyDecision
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div
                class="button-row"
                style="margin-top: 24px;"
            >
                <button
                    id="back-dashboard"
                    class="btn btn-primary"
                    type="button"
                >
                    VOLTAR PARA MINHA VIDA
                </button>
            </div>
        </main>
    `;


    root
        .querySelector(
            "#back-dashboard"
        )
        ?.addEventListener(
            "click",
            () => {
                saveGame(
                    game,
                    {
                        reason:
                            "year_completed"
                    }
                );

                clearYearFlow(
                    game
                );

                navigateTo(
                    "dashboard"
                );
            }
        );
}


function renderYearStep(
    root,
    game,
    step
) {
    if (
        step.type ===
        "event"
    ) {
        renderEventStep(
            root,
            game,
            step
        );

        return;
    }


    if (
        step.type ===
        "year_complete"
    ) {
        renderYearSummary(
            root,
            game,
            step.summary
        );

        return;
    }


    root.innerHTML = `
        <main class="app-shell">
            <div class="card empty-state">
                Não foi possível continuar o ano.
            </div>
        </main>
    `;
}


export function renderYearView(
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


    try {
        const step =
            startYearFlow(
                game
            );

        renderYearStep(
            root,
            game,
            step
        );
    } catch (error) {
        console.error(
            error
        );

        root.innerHTML = `
            <main class="app-shell page">
                <div class="card empty-state">
                    <strong>
                        Não foi possível iniciar o ano.
                    </strong>

                    <br><br>

                    ${escapeHtml(
                        error
                            ?.message ??
                        "Erro desconhecido."
                    )}

                    <br><br>

                    <button
                        id="back-dashboard-error"
                        class="btn"
                        type="button"
                    >
                        Voltar
                    </button>
                </div>
            </main>
        `;

        root
            .querySelector(
                "#back-dashboard-error"
            )
            ?.addEventListener(
                "click",
                () => {
                    navigateTo(
                        "dashboard"
                    );
                }
            );
    }
}