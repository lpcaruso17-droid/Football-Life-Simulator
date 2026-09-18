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
    MALE_FIRST_NAMES,
    LAST_NAMES
} from "../data/names.js";

import {
    buildNewGame
} from "../core/newGameBuilder.js";

import {
    saveGame
} from "../core/saveManager.js";

import {
    navigateTo
} from "./router.js";


const SECOND_NATIONALITIES = [
    {
        id: "PT",
        label: "Portugal"
    },
    {
        id: "IT",
        label: "Itália"
    },
    {
        id: "ES",
        label: "Espanha"
    },
    {
        id: "AR",
        label: "Argentina"
    },
    {
        id: "UY",
        label: "Uruguai"
    },
    {
        id: "DE",
        label: "Alemanha"
    },
    {
        id: "FR",
        label: "França"
    },
    {
        id: "GB",
        label: "Inglaterra"
    },
    {
        id: "US",
        label: "Estados Unidos"
    }
];


const DOMINANT_FEET = [
    {
        id: "right",
        label: "Direito"
    },
    {
        id: "left",
        label: "Esquerdo"
    },
    {
        id: "both",
        label: "Ambidestro"
    }
];


function randomItem(
    array
) {
    if (
        !Array.isArray(array) ||
        !array.length
    ) {
        return null;
    }

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];
}


function randomInteger(
    min,
    max
) {
    return Math.floor(
        Math.random() *
        (
            max -
            min +
            1
        )
    ) + min;
}


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


function generateRandomName() {
    const firstName =
        randomItem(
            MALE_FIRST_NAMES
        ) ??
        "Lucas";

    const firstLastName =
        randomItem(
            LAST_NAMES
        ) ??
        "Silva";

    let secondLastName =
        randomItem(
            LAST_NAMES
        ) ??
        "Santos";

    let attempts = 0;

    while (
        secondLastName ===
            firstLastName &&
        attempts < 10
    ) {
        secondLastName =
            randomItem(
                LAST_NAMES
            ) ??
            "Santos";

        attempts += 1;
    }

    return [
        firstName,
        firstLastName,
        secondLastName
    ].join(" ");
}


function generateSaveName(
    fullName
) {
    const firstName =
        String(
            fullName ??
            ""
        )
            .trim()
            .split(/\s+/)[0] ||
        "Jogador";

    return `Carreira de ${firstName}`;
}


function resolveRandomSecondNationality() {
    const hasSecondNationality =
        Math.random() <
        0.30;

    if (
        !hasSecondNationality
    ) {
        return "";
    }

    return (
        randomItem(
            SECOND_NATIONALITIES
        )?.id ??
        ""
    );
}


function getClubById(
    clubId
) {
    return CLUBS.find(
        club =>
            club.id ===
            clubId
    ) ?? null;
}


function getSelectedText(
    element
) {
    if (!element) {
        return "—";
    }

    if (
        element.tagName ===
        "SELECT"
    ) {
        return (
            element.options[
                element.selectedIndex
            ]?.text ??
            "—"
        );
    }

    return (
        element.value?.trim() ||
        "—"
    );
}


function resolveFormRandomValues(
    values
) {
    const resolved = {
        ...values
    };


    if (
        resolved.age ===
        "random"
    ) {
        resolved.age =
            String(
                randomInteger(
                    10,
                    18
                )
            );
    }


    if (
        resolved.cityId ===
        "random"
    ) {
        resolved.cityId =
            randomItem(
                BRAZILIAN_CITIES
            )?.id ??
            BRAZILIAN_CITIES[0]
                ?.id;
    }


    if (
        resolved.positionId ===
        "random"
    ) {
        resolved.positionId =
            randomItem(
                FOOTBALL_POSITIONS
            )?.id ??
            FOOTBALL_POSITIONS[0]
                ?.id;
    }


    if (
        resolved.dominantFoot ===
        "random"
    ) {
        resolved.dominantFoot =
            randomItem(
                DOMINANT_FEET
            )?.id ??
            "right";
    }


    if (
        resolved.secondNationality ===
        "random"
    ) {
        resolved.secondNationality =
            resolveRandomSecondNationality();
    }


    if (
        resolved.favoriteClubId ===
        "random"
    ) {
        resolved.favoriteClubId =
            randomItem(
                CLUBS
            )?.id ??
            CLUBS[0]
                ?.id;
    }


    return resolved;
}


function updatePreview(
    root
) {
    const fullName =
        root.querySelector(
            "[name='fullName']"
        );

    const saveName =
        root.querySelector(
            "[name='saveName']"
        );

    const age =
        root.querySelector(
            "[name='age']"
        );

    const city =
        root.querySelector(
            "[name='cityId']"
        );

    const position =
        root.querySelector(
            "[name='positionId']"
        );

    const foot =
        root.querySelector(
            "[name='dominantFoot']"
        );

    const favoriteClub =
        root.querySelector(
            "[name='favoriteClubId']"
        );

    const nationality =
        root.querySelector(
            "[name='secondNationality']"
        );


    const previewName =
        root.querySelector(
            "#preview-name"
        );

    const previewSave =
        root.querySelector(
            "#preview-save"
        );

    const previewAge =
        root.querySelector(
            "#preview-age"
        );

    const previewCity =
        root.querySelector(
            "#preview-city"
        );

    const previewPosition =
        root.querySelector(
            "#preview-position"
        );

    const previewFoot =
        root.querySelector(
            "#preview-foot"
        );

    const previewFavorite =
        root.querySelector(
            "#preview-favorite"
        );

    const previewNationality =
        root.querySelector(
            "#preview-nationality"
        );


    if (previewName) {
        previewName.textContent =
            fullName?.value.trim() ||
            "Seu personagem";
    }

    if (previewSave) {
        previewSave.textContent =
            saveName?.value.trim() ||
            "Nova carreira";
    }

    if (previewAge) {
        previewAge.textContent =
            getSelectedText(age);
    }

    if (previewCity) {
        previewCity.textContent =
            getSelectedText(city);
    }

    if (previewPosition) {
        previewPosition.textContent =
            getSelectedText(
                position
            );
    }

    if (previewFoot) {
        previewFoot.textContent =
            getSelectedText(foot);
    }

    if (previewFavorite) {
        previewFavorite.textContent =
            getSelectedText(
                favoriteClub
            );
    }

    if (previewNationality) {
        const text =
            getSelectedText(
                nationality
            );

        previewNationality.textContent =
            text === "Nenhuma"
                ? "Brasil"
                : text === "Sortear"
                    ? "Brasil + sorteio"
                    : `Brasil + ${text}`;
    }
}


function randomizeEntireForm(
    root
) {
    const fullName =
        generateRandomName();

    const age =
        randomInteger(
            10,
            18
        );

    const city =
        randomItem(
            BRAZILIAN_CITIES
        );

    const position =
        randomItem(
            FOOTBALL_POSITIONS
        );

    const foot =
        randomItem(
            DOMINANT_FEET
        );

    const secondNationality =
        resolveRandomSecondNationality();

    const favoriteClub =
        randomItem(
            CLUBS
        );


    const nameInput =
        root.querySelector(
            "[name='fullName']"
        );

    const saveInput =
        root.querySelector(
            "[name='saveName']"
        );

    const ageSelect =
        root.querySelector(
            "[name='age']"
        );

    const citySelect =
        root.querySelector(
            "[name='cityId']"
        );

    const positionSelect =
        root.querySelector(
            "[name='positionId']"
        );

    const footSelect =
        root.querySelector(
            "[name='dominantFoot']"
        );

    const clubSelect =
        root.querySelector(
            "[name='clubId']"
        );

    const nationalitySelect =
        root.querySelector(
            "[name='secondNationality']"
        );

    const favoriteClubSelect =
        root.querySelector(
            "[name='favoriteClubId']"
        );


    if (nameInput) {
        nameInput.value =
            fullName;
    }

    if (saveInput) {
        saveInput.value =
            generateSaveName(
                fullName
            );
    }

    if (ageSelect) {
        ageSelect.value =
            String(age);
    }

    if (
        citySelect &&
        city
    ) {
        citySelect.value =
            city.id;
    }

    if (
        positionSelect &&
        position
    ) {
        positionSelect.value =
            position.id;
    }

    if (
        footSelect &&
        foot
    ) {
        footSelect.value =
            foot.id;
    }

    if (clubSelect) {
        clubSelect.value =
            "";
    }

    if (
        nationalitySelect
    ) {
        nationalitySelect.value =
            secondNationality;
    }

    if (
        favoriteClubSelect &&
        favoriteClub
    ) {
        favoriteClubSelect.value =
            favoriteClub.id;
    }


    const feedback =
        root.querySelector(
            "#randomize-feedback"
        );

    if (feedback) {
        feedback.textContent =
            "Vida criada. O clube inicial será definido pelo sistema de formação.";
    }


    updatePreview(
        root
    );
}


export function renderCreationView(
    root
) {
    const sortedCities =
        [...BRAZILIAN_CITIES]
            .sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name,
                        "pt-BR"
                    )
            );


    const sortedClubs =
        [...CLUBS]
            .sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name,
                        "pt-BR"
                    )
            );


    root.innerHTML = `
        <main class="app-shell page creation-page">

            <header class="creation-intro">

                <div class="creation-intro-copy">

                    <div class="eyebrow">
                        NOVA VIDA
                    </div>

                    <h1 class="page-title">
                        Quem você vai ser?
                    </h1>

                    <p class="page-subtitle">
                        Crie cada detalhe da sua história
                        ou deixe o Football Life Simulator
                        construir um começo inesperado.
                    </p>

                </div>

                <div class="creation-random-box">

                    <div class="creation-random-copy">

                        <div class="creation-random-label">
                            Começo rápido
                        </div>

                        <div class="creation-random-title">
                            Deixe o jogo criar sua vida
                        </div>

                    </div>

                    <button
                        id="randomize-all"
                        class="creation-random-button"
                        type="button"
                    >
                        SORTEAR VIDA
                    </button>

                </div>

            </header>


            <div
                id="randomize-feedback"
                class="creation-feedback"
            ></div>


            <div class="creation-main-grid">

                <form
                    id="creation-form"
                    class="creation-form-shell"
                >

                    <section class="creation-section">

                        <div class="creation-section-header">

                            <div class="creation-section-number">
                                1
                            </div>

                            <div class="creation-section-heading">

                                <h2>
                                    Identidade
                                </h2>

                                <p>
                                    O início da sua história.
                                </p>

                            </div>

                        </div>


                        <div class="creation-fields">

                            <div class="creation-field creation-field-full">

                                <label for="fullName">
                                    Nome do personagem
                                </label>

                                <div class="creation-control-row">

                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value="Arthur Rocha"
                                        autocomplete="off"
                                        required
                                    >

                                    <button
                                        id="randomize-name"
                                        class="creation-mini-button"
                                        type="button"
                                    >
                                        Sortear
                                    </button>

                                </div>

                            </div>


                            <div class="creation-field">

                                <label for="age">
                                    Idade inicial
                                </label>

                                <select
                                    id="age"
                                    name="age"
                                >

                                    <option value="random">
                                        Sortear
                                    </option>

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
                                                        age ===
                                                        10
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


                            <div class="creation-field">

                                <label for="cityId">
                                    Cidade de origem
                                </label>

                                <select
                                    id="cityId"
                                    name="cityId"
                                >

                                    <option value="random">
                                        Sortear
                                    </option>

                                    ${sortedCities
                                        .map(
                                            city => `
                                                <option
                                                    value="${escapeHtml(
                                                        city.id
                                                    )}"
                                                >
                                                    ${escapeHtml(
                                                        city.name
                                                    )}
                                                    ${
                                                        city.state
                                                            ? ` - ${escapeHtml(
                                                                city.state
                                                            )}`
                                                            : (
                                                                city.uf
                                                                    ? ` - ${escapeHtml(
                                                                        city.uf
                                                                    )}`
                                                                    : ""
                                                            )
                                                    }
                                                </option>
                                            `
                                        )
                                        .join("")}

                                </select>

                            </div>


                            <div class="creation-field">

                                <label for="secondNationality">
                                    Segunda nacionalidade
                                </label>

                                <select
                                    id="secondNationality"
                                    name="secondNationality"
                                >

                                    <option value="random">
                                        Sortear
                                    </option>

                                    <option
                                        value=""
                                        selected
                                    >
                                        Nenhuma
                                    </option>

                                    ${SECOND_NATIONALITIES
                                        .map(
                                            nationality => `
                                                <option
                                                    value="${nationality.id}"
                                                >
                                                    ${nationality.label}
                                                </option>
                                            `
                                        )
                                        .join("")}

                                </select>

                                <div class="creation-help">
                                    Ao sortear, a maioria dos personagens
                                    continuará apenas com nacionalidade brasileira.
                                </div>

                            </div>


                            <div class="creation-field">

                                <label for="saveName">
                                    Nome do save
                                </label>

                                <input
                                    id="saveName"
                                    name="saveName"
                                    type="text"
                                    value="Minha carreira"
                                    autocomplete="off"
                                >

                            </div>

                        </div>

                    </section>


                    <section class="creation-section">

                        <div class="creation-section-header">

                            <div class="creation-section-number">
                                2
                            </div>

                            <div class="creation-section-heading">

                                <h2>
                                    Perfil no futebol
                                </h2>

                                <p>
                                    Onde sua trajetória esportiva começa.
                                </p>

                            </div>

                        </div>


                        <div class="creation-fields">

                            <div class="creation-field">

                                <label for="positionId">
                                    Posição
                                </label>

                                <select
                                    id="positionId"
                                    name="positionId"
                                >

                                    <option value="random">
                                        Sortear
                                    </option>

                                    ${FOOTBALL_POSITIONS
                                        .map(
                                            position => `
                                                <option
                                                    value="${escapeHtml(
                                                        position.id
                                                    )}"
                                                >
                                                    ${escapeHtml(
                                                        position.label
                                                    )}
                                                </option>
                                            `
                                        )
                                        .join("")}

                                </select>

                            </div>


                            <div class="creation-field">

                                <label for="dominantFoot">
                                    Pé dominante
                                </label>

                                <select
                                    id="dominantFoot"
                                    name="dominantFoot"
                                >

                                    <option value="random">
                                        Sortear
                                    </option>

                                    ${DOMINANT_FEET
                                        .map(
                                            foot => `
                                                <option
                                                    value="${foot.id}"
                                                >
                                                    ${foot.label}
                                                </option>
                                            `
                                        )
                                        .join("")}

                                </select>

                            </div>


                            <div class="creation-field creation-field-full">

                                <label for="clubId">
                                    Clube inicial
                                </label>

                                <select
                                    id="clubId"
                                    name="clubId"
                                >

                                    <option value="">
                                        Sortear de forma realista
                                    </option>

                                    ${sortedClubs
                                        .map(
                                            club => `
                                                <option
                                                    value="${escapeHtml(
                                                        club.id
                                                    )}"
                                                >
                                                    ${escapeHtml(
                                                        club.name
                                                    )}
                                                </option>
                                            `
                                        )
                                        .join("")}

                                </select>

                                <div class="creation-help">
                                    No sorteio realista, idade, cidade,
                                    estrutura de base e contexto influenciam
                                    seu primeiro clube.
                                </div>

                            </div>

                        </div>

                    </section>


                    <section class="creation-section">

                        <div class="creation-section-header">

                            <div class="creation-section-number">
                                3
                            </div>

                            <div class="creation-section-heading">

                                <h2>
                                    Sua história
                                </h2>

                                <p>
                                    Algumas relações começam antes mesmo da carreira.
                                </p>

                            </div>

                        </div>


                        <div class="creation-fields">

                            <div class="creation-field creation-field-full">

                                <label for="favoriteClubId">
                                    Clube do coração
                                </label>

                                <select
                                    id="favoriteClubId"
                                    name="favoriteClubId"
                                >

                                    <option value="random">
                                        Sortear
                                    </option>

                                    ${sortedClubs
                                        .map(
                                            club => `
                                                <option
                                                    value="${escapeHtml(
                                                        club.id
                                                    )}"
                                                >
                                                    ${escapeHtml(
                                                        club.name
                                                    )}
                                                </option>
                                            `
                                        )
                                        .join("")}

                                </select>

                                <div class="creation-help">
                                    Essa relação poderá gerar histórias,
                                    rivalidades e decisões especiais
                                    ao longo da carreira.
                                </div>

                            </div>

                        </div>

                    </section>


                    <div
                        id="creation-error"
                        class="creation-error"
                    ></div>


                    <div class="creation-actions">

                        <button
                            class="creation-start-button"
                            type="submit"
                        >
                            COMEÇAR MINHA HISTÓRIA →
                        </button>

                        <button
                            id="back-home"
                            class="creation-back-button"
                            type="button"
                        >
                            Voltar
                        </button>

                    </div>

                </form>


                <aside class="creation-side">

                    <section class="creation-preview">

                        <div class="creation-preview-top">

                            <div class="creation-preview-eyebrow">
                                PRÉVIA DA VIDA
                            </div>

                            <div
                                id="preview-name"
                                class="creation-preview-name"
                            >
                                Arthur Rocha
                            </div>

                            <div
                                id="preview-save"
                                class="creation-preview-save"
                            >
                                Minha carreira
                            </div>

                        </div>


                        <div class="creation-preview-body">

                            <div class="creation-preview-row">

                                <span class="creation-preview-label">
                                    Idade
                                </span>

                                <span
                                    id="preview-age"
                                    class="creation-preview-value"
                                >
                                    10 anos
                                </span>

                            </div>


                            <div class="creation-preview-row">

                                <span class="creation-preview-label">
                                    Cidade
                                </span>

                                <span
                                    id="preview-city"
                                    class="creation-preview-value"
                                >
                                    Sortear
                                </span>

                            </div>


                            <div class="creation-preview-row">

                                <span class="creation-preview-label">
                                    Posição
                                </span>

                                <span
                                    id="preview-position"
                                    class="creation-preview-value"
                                >
                                    Sortear
                                </span>

                            </div>


                            <div class="creation-preview-row">

                                <span class="creation-preview-label">
                                    Pé
                                </span>

                                <span
                                    id="preview-foot"
                                    class="creation-preview-value"
                                >
                                    Sortear
                                </span>

                            </div>


                            <div class="creation-preview-row">

                                <span class="creation-preview-label">
                                    Nacionalidade
                                </span>

                                <span
                                    id="preview-nationality"
                                    class="creation-preview-value"
                                >
                                    Brasil
                                </span>

                            </div>


                            <div class="creation-preview-row">

                                <span class="creation-preview-label">
                                    Clube do coração
                                </span>

                                <span
                                    id="preview-favorite"
                                    class="creation-preview-value"
                                >
                                    Sortear
                                </span>

                            </div>

                        </div>

                    </section>


                    <section class="creation-rules-card">

                        <div class="creation-rules-title">
                            ANTES DE COMEÇAR
                        </div>


                        <div class="creation-rule-compact">

                            <div class="creation-rule-compact-number">
                                1
                            </div>

                            <div>

                                <strong>
                                    Seu potencial é oculto
                                </strong>

                                <p>
                                    Nem você saberá até onde
                                    essa carreira pode chegar.
                                </p>

                            </div>

                        </div>


                        <div class="creation-rule-compact">

                            <div class="creation-rule-compact-number">
                                2
                            </div>

                            <div>

                                <strong>
                                    Sua família terá influência
                                </strong>

                                <p>
                                    Relações e decisões podem
                                    mudar sua trajetória.
                                </p>

                            </div>

                        </div>


                        <div class="creation-rule-compact">

                            <div class="creation-rule-compact-number">
                                3
                            </div>

                            <div>

                                <strong>
                                    Não existe carreira garantida
                                </strong>

                                <p>
                                    Você pode virar estrela,
                                    profissional comum ou nem chegar lá.
                                </p>

                            </div>

                        </div>


                        <div class="creation-rule-compact">

                            <div class="creation-rule-compact-number">
                                4
                            </div>

                            <div>

                                <strong>
                                    O mundo não protege você
                                </strong>

                                <p>
                                    As oportunidades dependem
                                    da sua história e do contexto.
                                </p>

                            </div>

                        </div>

                    </section>

                </aside>

            </div>

        </main>
    `;


    const previewFields = [
        "fullName",
        "saveName",
        "age",
        "cityId",
        "positionId",
        "dominantFoot",
        "favoriteClubId",
        "secondNationality"
    ];


    previewFields.forEach(
        name => {
            const element =
                root.querySelector(
                    `[name='${name}']`
                );

            element
                ?.addEventListener(
                    "input",
                    () =>
                        updatePreview(
                            root
                        )
                );

            element
                ?.addEventListener(
                    "change",
                    () =>
                        updatePreview(
                            root
                        )
                );
        }
    );


    root
        .querySelector(
            "#randomize-all"
        )
        ?.addEventListener(
            "click",
            () => {
                randomizeEntireForm(
                    root
                );
            }
        );


    root
        .querySelector(
            "#randomize-name"
        )
        ?.addEventListener(
            "click",
            () => {
                const name =
                    generateRandomName();

                const input =
                    root.querySelector(
                        "[name='fullName']"
                    );

                const saveInput =
                    root.querySelector(
                        "[name='saveName']"
                    );


                if (input) {
                    input.value =
                        name;
                }


                if (
                    saveInput &&
                    (
                        !saveInput.value.trim() ||
                        saveInput.value ===
                            "Minha carreira" ||
                        saveInput.value
                            .startsWith(
                                "Carreira de "
                            )
                    )
                ) {
                    saveInput.value =
                        generateSaveName(
                            name
                        );
                }


                updatePreview(
                    root
                );
            }
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


    root
        .querySelector(
            "#creation-form"
        )
        ?.addEventListener(
            "submit",
            event => {
                event.preventDefault();

                const errorBox =
                    root.querySelector(
                        "#creation-error"
                    );


                if (errorBox) {
                    errorBox.textContent =
                        "";
                }


                try {
                    const formData =
                        new FormData(
                            event.currentTarget
                        );


                    const rawValues = {
                        fullName:
                            String(
                                formData.get(
                                    "fullName"
                                ) ??
                                ""
                            ).trim(),

                        saveName:
                            String(
                                formData.get(
                                    "saveName"
                                ) ??
                                ""
                            ).trim(),

                        age:
                            String(
                                formData.get(
                                    "age"
                                ) ??
                                "10"
                            ),

                        cityId:
                            String(
                                formData.get(
                                    "cityId"
                                ) ??
                                "random"
                            ),

                        positionId:
                            String(
                                formData.get(
                                    "positionId"
                                ) ??
                                "random"
                            ),

                        dominantFoot:
                            String(
                                formData.get(
                                    "dominantFoot"
                                ) ??
                                "random"
                            ),

                        clubId:
                            String(
                                formData.get(
                                    "clubId"
                                ) ??
                                ""
                            ),

                        secondNationality:
                            String(
                                formData.get(
                                    "secondNationality"
                                ) ??
                                ""
                            ),

                        favoriteClubId:
                            String(
                                formData.get(
                                    "favoriteClubId"
                                ) ??
                                "random"
                            )
                    };


                    if (
                        !rawValues.fullName
                    ) {
                        throw new Error(
                            "Defina ou sorteie um nome para o personagem."
                        );
                    }


                    const values =
                        resolveFormRandomValues(
                            rawValues
                        );


                    const age =
                        Number(
                            values.age
                        );


                    if (
                        !Number.isFinite(age) ||
                        age < 10 ||
                        age > 18
                    ) {
                        throw new Error(
                            "A idade inicial precisa estar entre 10 e 18 anos."
                        );
                    }


                    const saveName =
                        values.saveName ||
                        generateSaveName(
                            values.fullName
                        );


                    const game =
                        buildNewGame({
                            saveName,

                            fullName:
                                values.fullName,

                            age,

                            startYear:
                                new Date()
                                    .getFullYear(),

                            cityId:
                                values.cityId,

                            nationality:
                                "BR",

                            secondNationality:
                                values.secondNationality ||
                                null,

                            positionId:
                                values.positionId,

                            dominantFoot:
                                values.dominantFoot,

                            clubId:
                                values.clubId ||
                                null
                        });


                    const favoriteClub =
                        getClubById(
                            values.favoriteClubId
                        );


                    game.player.identity
                        .favoriteClubId =
                        favoriteClub
                            ?.id ??
                        null;

                    game.player.identity
                        .favoriteClubName =
                        favoriteClub
                            ?.name ??
                        null;


                    saveGame(
                        game,
                        {
                            reason:
                                "new_game"
                        }
                    );


                    navigateTo(
                        "dashboard"
                    );
                } catch (
                    error
                ) {
                    console.error(
                        error
                    );

                    if (errorBox) {
                        errorBox.textContent =
                            error?.message ??
                            "Não foi possível criar esta vida.";
                    }
                }
            }
        );


    updatePreview(
        root
    );
}