import {
    BRAZILIAN_CITIES
} from "../data/cities.js";

import {
    FOOTBALL_POSITIONS
} from "../data/positions.js";

import {
    CLUBS
} from "../data/clubs.js";

import {
    buildNewGame
} from "../core/newGameBuilder.js";

import {
    saveGame
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


function cityOptions() {
    return BRAZILIAN_CITIES
        .map(
            city => `
                <option value="${escapeHtml(city.id)}">
                    ${escapeHtml(city.name)} - ${escapeHtml(city.state)}
                </option>
            `
        )
        .join("");
}


function positionOptions() {
    return FOOTBALL_POSITIONS
        .map(
            position => `
                <option value="${escapeHtml(position.id)}">
                    ${escapeHtml(position.label)}
                </option>
            `
        )
        .join("");
}


function clubOptions() {
    return [...CLUBS]
        .sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    "pt-BR"
                )
        )
        .map(
            club => `
                <option value="${escapeHtml(club.id)}">
                    ${escapeHtml(club.name)}
                </option>
            `
        )
        .join("");
}


export function renderCreationView(
    root
) {
    root.innerHTML = `
        <main class="app-shell page">
            <div class="eyebrow">
                Nova vida
            </div>

            <h1 class="page-title">
                Quem você vai ser?
            </h1>

            <p class="page-subtitle">
                Você pode controlar as escolhas iniciais
                ou deixar partes da história por conta
                do sorteio.
            </p>

            <div class="creation-layout">
                <section class="card creation-form-card">
                    <form id="creation-form">
                        <div class="form-grid">
                            <div class="field full">
                                <label for="full-name">
                                    Nome do personagem
                                </label>

                                <input
                                    id="full-name"
                                    class="input"
                                    name="fullName"
                                    type="text"
                                    maxlength="60"
                                    placeholder="Arthur Rocha"
                                    required
                                >
                            </div>

                            <div class="field">
                                <label for="save-name">
                                    Nome do save
                                </label>

                                <input
                                    id="save-name"
                                    class="input"
                                    name="saveName"
                                    type="text"
                                    maxlength="50"
                                    placeholder="Minha carreira"
                                >
                            </div>

                            <div class="field">
                                <label for="age">
                                    Idade inicial
                                </label>

                                <select
                                    id="age"
                                    class="select"
                                    name="age"
                                >
                                    ${Array
                                        .from(
                                            {
                                                length: 9
                                            },
                                            (
                                                _,
                                                index
                                            ) =>
                                                index +
                                                10
                                        )
                                        .map(
                                            age => `
                                                <option
                                                    value="${age}"
                                                    ${
                                                        age === 10
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    ${age} anos
                                                </option>
                                            `
                                        )
                                        .join("")}
                                </select>
                            </div>

                            <div class="field">
                                <label for="city">
                                    Cidade de origem
                                </label>

                                <select
                                    id="city"
                                    class="select"
                                    name="cityId"
                                >
                                    <option value="">
                                        Sortear
                                    </option>

                                    ${cityOptions()}
                                </select>
                            </div>

                            <div class="field">
                                <label for="position">
                                    Posição
                                </label>

                                <select
                                    id="position"
                                    class="select"
                                    name="positionId"
                                >
                                    <option value="">
                                        Sortear
                                    </option>

                                    ${positionOptions()}
                                </select>
                            </div>

                            <div class="field">
                                <label for="foot">
                                    Pé dominante
                                </label>

                                <select
                                    id="foot"
                                    class="select"
                                    name="dominantFoot"
                                >
                                    <option value="">
                                        Sortear
                                    </option>

                                    <option value="right">
                                        Direito
                                    </option>

                                    <option value="left">
                                        Esquerdo
                                    </option>

                                    <option value="both">
                                        Ambidestro
                                    </option>
                                </select>
                            </div>

                            <div class="field">
                                <label for="club">
                                    Clube inicial
                                </label>

                                <select
                                    id="club"
                                    class="select"
                                    name="clubId"
                                >
                                    <option value="">
                                        Sortear de forma realista
                                    </option>

                                    ${clubOptions()}
                                </select>
                            </div>

                            <div class="field">
                                <label for="second-nationality">
                                    Segunda nacionalidade
                                </label>

                                <select
                                    id="second-nationality"
                                    class="select"
                                    name="secondNationality"
                                >
                                    <option value="">
                                        Nenhuma
                                    </option>

                                    <option value="PT">
                                        Portuguesa
                                    </option>

                                    <option value="IT">
                                        Italiana
                                    </option>

                                    <option value="ES">
                                        Espanhola
                                    </option>

                                    <option value="AR">
                                        Argentina
                                    </option>

                                    <option value="UY">
                                        Uruguaia
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div
                            id="creation-error"
                            class="form-error"
                        ></div>

                        <div
                            class="button-row"
                            style="margin-top: 24px;"
                        >
                            <button
                                class="btn btn-primary"
                                type="submit"
                            >
                                COMEÇAR ESTA VIDA
                            </button>

                            <button
                                id="back-home"
                                class="btn"
                                type="button"
                            >
                                Voltar
                            </button>
                        </div>
                    </form>
                </section>

                <aside class="card creation-aside">
                    <div class="section-title">
                        Como funciona
                    </div>

                    <div class="creation-rule">
                        <div class="creation-rule-number">
                            1
                        </div>

                        <div>
                            <strong>
                                Talento é oculto
                            </strong>

                            <p>
                                Você não saberá o potencial real
                                do personagem.
                            </p>
                        </div>
                    </div>

                    <div class="creation-rule">
                        <div class="creation-rule-number">
                            2
                        </div>

                        <div>
                            <strong>
                                A família importa
                            </strong>

                            <p>
                                Pais, irmãos, renda e relações
                                são gerados como parte da vida.
                            </p>
                        </div>
                    </div>

                    <div class="creation-rule">
                        <div class="creation-rule-number">
                            3
                        </div>

                        <div>
                            <strong>
                                Clube grande não é garantia
                            </strong>

                            <p>
                                Estrutura melhor também significa
                                maior concorrência.
                            </p>
                        </div>
                    </div>

                    <div class="creation-rule">
                        <div class="creation-rule-number">
                            4
                        </div>

                        <div>
                            <strong>
                                As escolhas permanecem
                            </strong>

                            <p>
                                O jogo é pensado para não voltar
                                atrás depois das decisões.
                            </p>
                        </div>
                    </div>

                    <div class="dev-note">
                        O início entre 11 e 18 anos já está
                        disponível. A geração narrativa completa
                        dos anos anteriores será conectada em
                        um bloco posterior.
                    </div>
                </aside>
            </div>
        </main>
    `;


    const form =
        root.querySelector(
            "#creation-form"
        );

    const errorBox =
        root.querySelector(
            "#creation-error"
        );


    root
        .querySelector(
            "#back-home"
        )
        ?.addEventListener(
            "click",
            () => {
                navigateTo(
                    "home"
                );
            }
        );


    form?.addEventListener(
        "submit",
        event => {
            event.preventDefault();

            errorBox
                ?.classList
                .remove(
                    "visible"
                );

            if (errorBox) {
                errorBox.textContent =
                    "";
            }


            try {
                const data =
                    new FormData(
                        form
                    );

                const fullName =
                    String(
                        data.get(
                            "fullName"
                        ) ??
                        ""
                    ).trim();

                const saveNameInput =
                    String(
                        data.get(
                            "saveName"
                        ) ??
                        ""
                    ).trim();

                const age =
                    Number(
                        data.get(
                            "age"
                        )
                    );

                const cityId =
                    String(
                        data.get(
                            "cityId"
                        ) ??
                        ""
                    ) ||
                    null;

                const positionId =
                    String(
                        data.get(
                            "positionId"
                        ) ??
                        ""
                    ) ||
                    null;

                const dominantFoot =
                    String(
                        data.get(
                            "dominantFoot"
                        ) ??
                        ""
                    ) ||
                    null;

                const clubId =
                    String(
                        data.get(
                            "clubId"
                        ) ??
                        ""
                    ) ||
                    null;

                const secondNationality =
                    String(
                        data.get(
                            "secondNationality"
                        ) ??
                        ""
                    ) ||
                    null;


                const game =
                    buildNewGame({
                        saveName:
                            saveNameInput ||
                            `Vida de ${fullName}`,

                        fullName,

                        age,

                        startYear:
                            new Date()
                                .getFullYear(),

                        cityId,

                        nationality:
                            "BR",

                        secondNationality,

                        positionId,

                        dominantFoot,

                        clubId
                    });


                saveGame(
                    game,
                    {
                        reason:
                            "new_game_created",

                        setActive:
                            true
                    }
                );


                navigateTo(
                    "dashboard"
                );
            } catch (error) {
                console.error(
                    error
                );

                if (errorBox) {
                    errorBox.textContent =
                        error
                            ?.message ||
                        "Não foi possível criar a vida.";

                    errorBox
                        .classList
                        .add(
                            "visible"
                        );
                }
            }
        }
    );
}