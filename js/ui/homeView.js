import {
    listSaves,
    deleteSave,
    renameSave,
    setActiveSaveId
} from "../core/saveManager.js";

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


function renderSaveCard(
    save
) {
    const category =
        save.category
            ? ` · ${escapeHtml(
                String(
                    save.category
                ).toUpperCase()
            )}`
            : "";

    return `
        <article
            class="save-card"
            data-save-id="${escapeHtml(save.id)}"
        >
            <div class="save-name">
                ${escapeHtml(save.saveName)}
            </div>

            <div class="save-player">
                ${escapeHtml(save.playerName)}
            </div>

            <div class="save-meta">
                ${escapeHtml(save.age)} anos
                ·
                ${escapeHtml(save.clubName)}
                ${category}

                <br>

                Ano ${escapeHtml(save.year)}
            </div>

            <div class="save-actions">
                <button
                    class="btn btn-primary btn-small"
                    data-action="resume"
                    type="button"
                >
                    Continuar
                </button>

                <button
                    class="btn btn-small"
                    data-action="rename"
                    type="button"
                >
                    Renomear
                </button>

                <button
                    class="btn btn-danger btn-small"
                    data-action="delete"
                    type="button"
                >
                    Excluir
                </button>
            </div>
        </article>
    `;
}


export function renderHomeView(
    root
) {
    const saves =
        listSaves();

    root.innerHTML = `
        <main class="app-shell page">
            <section class="home-hero">
                <div class="eyebrow">
                    Uma vida. Mil caminhos.
                </div>

                <h1 class="home-title">
                    FOOTBALL

                    <span>
                        LIFE SIMULATOR
                    </span>
                </h1>

                <p class="home-description">
                    Comece ainda na formação e descubra
                    até onde o futebol pode levar sua vida.
                    Talento ajuda. Decisões, relações,
                    oportunidades e sorte constroem o resto.
                </p>

                <div class="button-row">
                    <button
                        id="create-life"
                        class="btn btn-primary"
                        type="button"
                    >
                        CRIAR NOVA VIDA
                    </button>
                </div>
            </section>

            <section class="saves-section">
                <div class="section-title">
                    Meus saves
                </div>

                ${
                    saves.length
                        ? `
                            <div
                                class="saves-grid"
                                id="saves-grid"
                            >
                                ${saves
                                    .map(
                                        renderSaveCard
                                    )
                                    .join("")}
                            </div>
                        `
                        : `
                            <div class="card empty-state">
                                Nenhuma vida criada na V0.5 ainda.

                                <br><br>

                                Crie seu primeiro personagem
                                para começar.
                            </div>
                        `
                }
            </section>
        </main>
    `;


    root
        .querySelector(
            "#create-life"
        )
        ?.addEventListener(
            "click",
            () => {
                navigateTo(
                    "create"
                );
            }
        );


    root
        .querySelectorAll(
            "[data-save-id]"
        )
        .forEach(
            card => {
                const saveId =
                    card.dataset
                        .saveId;


                card
                    .querySelector(
                        '[data-action="resume"]'
                    )
                    ?.addEventListener(
                        "click",
                        () => {
                            setActiveSaveId(
                                saveId
                            );

                            navigateTo(
                                "dashboard"
                            );
                        }
                    );


                card
                    .querySelector(
                        '[data-action="rename"]'
                    )
                    ?.addEventListener(
                        "click",
                        () => {
                            const current =
                                saves.find(
                                    save =>
                                        save.id ===
                                        saveId
                                );

                            const newName =
                                window.prompt(
                                    "Novo nome do save:",
                                    current
                                        ?.saveName ??
                                        ""
                                );

                            if (
                                !newName ||
                                !newName.trim()
                            ) {
                                return;
                            }

                            renameSave(
                                saveId,
                                newName
                            );

                            renderHomeView(
                                root
                            );
                        }
                    );


                card
                    .querySelector(
                        '[data-action="delete"]'
                    )
                    ?.addEventListener(
                        "click",
                        () => {
                            const confirmed =
                                window.confirm(
                                    "Excluir este save? Essa ação não poderá ser desfeita."
                                );

                            if (
                                !confirmed
                            ) {
                                return;
                            }

                            deleteSave(
                                saveId
                            );

                            renderHomeView(
                                root
                            );
                        }
                    );
            }
        );
}