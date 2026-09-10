const screens = {
    home: document.getElementById("homeScreen"),
    creator: document.getElementById("creatorScreen"),
    dashboard: document.getElementById("dashboardScreen")
};


const cities = [
    "Rio de Janeiro - RJ",
    "São Paulo - SP",
    "Brasília - DF",
    "Belo Horizonte - MG",
    "Porto Alegre - RS",
    "Curitiba - PR",
    "Salvador - BA",
    "Recife - PE",
    "Fortaleza - CE",
    "Manaus - AM",
    "Goiânia - GO",
    "Belém - PA"
];


const financialOptions = [
    "Família de baixa renda",
    "Família de classe média baixa",
    "Família de classe média",
    "Família de classe média alta",
    "Família de alta renda"
];


const familyOptions = [
    "Mora com pai e mãe",
    "Pais separados",
    "Mora somente com a mãe",
    "Mora somente com o pai",
    "Criado pelos avós",
    "Mora com outros familiares"
];


const clubs = [
    "Escolinha local",
    "Clube pequeno da cidade",

    "Flamengo",
    "Fluminense",
    "Vasco da Gama",
    "Botafogo",

    "Palmeiras",
    "Corinthians",
    "São Paulo",
    "Santos",

    "Grêmio",
    "Internacional",

    "Cruzeiro",
    "Atlético Mineiro",

    "Bahia",
    "Athletico Paranaense",

    "Fortaleza",
    "Ceará",

    "Sport Recife",
    "Náutico"
];


const positions = [
    "Goleiro",
    "Lateral Direito",
    "Zagueiro",
    "Lateral Esquerdo",
    "Volante",
    "Meia",
    "Ponta Direita",
    "Ponta Esquerda",
    "Centroavante"
];


const feet = [
    "Direito",
    "Esquerdo",
    "Ambidestro"
];


const firstNames = [
    "Gabriel",
    "Lucas",
    "Pedro",
    "Matheus",
    "João",
    "Rafael",
    "Guilherme",
    "Bruno",
    "Arthur",
    "Miguel",
    "Caio",
    "Thiago",
    "Enzo",
    "Davi"
];


const lastNames = [
    "Almeida",
    "Silva",
    "Santos",
    "Oliveira",
    "Carvalho",
    "Martins",
    "Costa",
    "Souza",
    "Ferreira",
    "Rocha",
    "Moraes",
    "Barbosa"
];


function randomNumber(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


function randomItem(array) {
    return array[
        Math.floor(Math.random() * array.length)
    ];
}


function populateSelect(id, values) {

    const select = document.getElementById(id);

    select.innerHTML = "";

    values.forEach(value => {

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);

    });

}


function changeScreen(screenName) {

    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    screens[screenName].classList.add("active");

    window.scrollTo(0, 0);

}


function randomName() {

    return `${randomItem(firstNames)} ${randomItem(lastNames)}`;

}


function baseAttributes() {

    return {

        technical: {
            "Finalização": randomNumber(25, 45),
            "Passe": randomNumber(25, 45),
            "Drible": randomNumber(25, 45),
            "Cruzamento": randomNumber(25, 45),
            "Cabeceio": randomNumber(25, 45),
            "Marcação": randomNumber(25, 45),
            "Desarme": randomNumber(25, 45),
            "Primeiro toque": randomNumber(25, 45),
            "Chute de longe": randomNumber(25, 45),
            "Bola parada": randomNumber(20, 45)
        },

        physical: {
            "Velocidade": randomNumber(30, 50),
            "Aceleração": randomNumber(30, 50),
            "Força": randomNumber(20, 40),
            "Resistência": randomNumber(25, 45),
            "Agilidade": randomNumber(30, 50),
            "Impulsão": randomNumber(25, 45)
        },

        mental: {
            "Visão de jogo": randomNumber(25, 45),
            "Decisão": randomNumber(20, 40),
            "Concentração": randomNumber(20, 45),
            "Posicionamento": randomNumber(20, 45),
            "Frieza": randomNumber(20, 45),
            "Determinação": randomNumber(30, 55),
            "Trabalho em equipe": randomNumber(25, 50),
            "Liderança": randomNumber(20, 45)
        }

    };

}


function boost(attributeGroup, attributeName, amount) {

    attributeGroup[attributeName] =
        Math.min(
            99,
            attributeGroup[attributeName] + amount
        );

}


function createAttributes(position) {

    const attributes = baseAttributes();

    const tech = attributes.technical;
    const phys = attributes.physical;
    const mental = attributes.mental;


    switch (position) {

        case "Centroavante":

            boost(tech, "Finalização", 12);
            boost(tech, "Cabeceio", 8);
            boost(mental, "Frieza", 8);

            break;


        case "Ponta Direita":
        case "Ponta Esquerda":

            boost(tech, "Drible", 10);
            boost(phys, "Velocidade", 10);
            boost(phys, "Aceleração", 10);

            break;


        case "Meia":

            boost(tech, "Passe", 10);
            boost(tech, "Primeiro toque", 8);
            boost(mental, "Visão de jogo", 12);

            break;


        case "Volante":

            boost(tech, "Passe", 6);
            boost(tech, "Desarme", 10);
            boost(mental, "Posicionamento", 10);

            break;


        case "Zagueiro":

            boost(tech, "Marcação", 12);
            boost(tech, "Desarme", 10);
            boost(phys, "Força", 10);
            boost(mental, "Concentração", 8);

            break;


        case "Lateral Direito":
        case "Lateral Esquerdo":

            boost(tech, "Cruzamento", 8);
            boost(phys, "Velocidade", 8);
            boost(phys, "Resistência", 10);

            break;


        case "Goleiro":

            /*
            Na próxima versão criaremos
            atributos exclusivos de goleiro.
            */

            boost(mental, "Concentração", 12);
            boost(mental, "Decisão", 10);
            boost(phys, "Impulsão", 10);

            break;

    }


    return attributes;

}


function randomizeCharacter() {

    document.getElementById("playerName").value =
        randomName();

    document.getElementById("city").value =
        randomItem(cities);

    document.getElementById("financial").value =
        randomItem(financialOptions);

    document.getElementById("family").value =
        randomItem(familyOptions);

    document.getElementById("club").value =
        randomItem(clubs);

    document.getElementById("position").value =
        randomItem(positions);

    document.getElementById("foot").value =
        randomItem(feet);

}


function createLife() {

    const position =
        document.getElementById("position").value;


    const character = {

        name:
            document.getElementById("playerName").value.trim(),

        age: 10,

        year: new Date().getFullYear(),

        city:
            document.getElementById("city").value,

        financial:
            document.getElementById("financial").value,

        family:
            document.getElementById("family").value,

        club:
            document.getElementById("club").value,

        position,

        foot:
            document.getElementById("foot").value,


        /* POTENCIAL NÃO É MOSTRADO AO JOGADOR */

        hiddenPotential:
            randomNumber(60, 96),


        personality: {

            discipline:
                randomNumber(35, 90),

            ambition:
                randomNumber(35, 95),

            resilience:
                randomNumber(30, 95),

            professionalism:
                randomNumber(25, 90),

            sociability:
                randomNumber(30, 90)

        },


        life: {

            health:
                randomNumber(82, 100),

            happiness:
                randomNumber(65, 95),

            school:
                randomNumber(55, 95),

            familyRelationship:
                randomNumber(55, 95),

            reputation: 1,

            money: 0

        },


        attributes:
            createAttributes(position),


        history: [
            {
                age: 10,
                year: new Date().getFullYear(),
                title: "O começo",
                description:
                    "Sua jornada no futebol começou."
            }
        ]

    };


    localStorage.setItem(
        "footballLifeSave",
        JSON.stringify(character)
    );


    return character;

}


function renderAttributeSection(title, attributes) {

    let html = `
        <div class="attribute-section">
            <h4>${title}</h4>
            <div class="attribute-grid">
    `;


    Object.entries(attributes).forEach(
        ([name, value]) => {

            html += `
                <div class="attribute">
                    <span>${name}</span>
                    <strong>${value}</strong>
                </div>
            `;

        }
    );


    html += `
            </div>
        </div>
    `;


    return html;

}


function renderDashboard(character) {

    document.getElementById("dashboardName")
        .textContent = character.name;


    document.getElementById("dashboardInfo")
        .textContent =
        `${character.city} · ${character.club}`;


    document.getElementById("dashboardAge")
        .textContent = character.age;


    document.getElementById("healthStat")
        .textContent =
        character.life.health;


    document.getElementById("happinessStat")
        .textContent =
        character.life.happiness;


    document.getElementById("schoolStat")
        .textContent =
        character.life.school;


    document.getElementById("familyStat")
        .textContent =
        character.life.familyRelationship;


    document.getElementById("reputationStat")
        .textContent =
        character.life.reputation;


    document.getElementById("moneyStat")
        .textContent =
        character.life.money.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );


    document.getElementById("clubInfo")
        .textContent =
        character.club;


    document.getElementById("positionInfo")
        .textContent =
        character.position;


    document.getElementById("footInfo")
        .textContent =
        character.foot;


    document.getElementById("yearInfo")
        .textContent =
        character.year;


    document.getElementById("openingStory")
        .textContent =
        `${character.name} nasceu em ${character.city} e, aos 10 anos, começa sua caminhada no futebol pelo ${character.club}. Sua família vive a realidade de "${character.financial.toLowerCase()}" e seu contexto familiar inicial é: ${character.family.toLowerCase()}. A partir daqui, talento, escolhas, oportunidades e acontecimentos fora do seu controle definirão sua história.`;


    const attributesContainer =
        document.getElementById(
            "attributesContainer"
        );


    attributesContainer.innerHTML =
        renderAttributeSection(
            "TÉCNICOS",
            character.attributes.technical
        )
        +
        renderAttributeSection(
            "FÍSICOS",
            character.attributes.physical
        )
        +
        renderAttributeSection(
            "MENTAIS",
            character.attributes.mental
        );


    changeScreen("dashboard");

}


function loadSave() {

    const saved =
        localStorage.getItem(
            "footballLifeSave"
        );


    if (!saved) {
        return null;
    }


    return JSON.parse(saved);

}


populateSelect(
    "city",
    cities
);

populateSelect(
    "financial",
    financialOptions
);

populateSelect(
    "family",
    familyOptions
);

populateSelect(
    "club",
    clubs
);

populateSelect(
    "position",
    positions
);

populateSelect(
    "foot",
    feet
);


const existingSave =
    loadSave();


if (existingSave) {

    document.getElementById(
        "continueButton"
    ).classList.remove("hidden");

}


document.getElementById(
    "createCharacterButton"
).addEventListener(
    "click",
    () => {

        changeScreen("creator");

    }
);


document.getElementById(
    "randomLifeButton"
).addEventListener(
    "click",
    () => {

        randomizeCharacter();

        changeScreen("creator");

    }
);


document.getElementById(
    "randomizeButton"
).addEventListener(
    "click",
    randomizeCharacter
);


document.getElementById(
    "backButton"
).addEventListener(
    "click",
    () => {

        changeScreen("home");

    }
);


document.getElementById(
    "continueButton"
).addEventListener(
    "click",
    () => {

        const save = loadSave();

        if (save) {
            renderDashboard(save);
        }

    }
);


document.getElementById(
    "characterForm"
).addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const name =
            document.getElementById(
                "playerName"
            ).value.trim();


        if (!name) {

            alert(
                "Digite o nome do personagem."
            );

            return;

        }


        const character =
            createLife();


        renderDashboard(character);

    }
);


document.getElementById(
    "resetGameButton"
).addEventListener(
    "click",
    () => {

        const confirmed =
            confirm(
                "Tem certeza que deseja apagar esta vida?"
            );


        if (!confirmed) {
            return;
        }


        localStorage.removeItem(
            "footballLifeSave"
        );


        location.reload();

    }
);


document.getElementById(
    "nextYearButton"
).addEventListener(
    "click",
    () => {

        alert(
            "Aqui entrará o Motor de Eventos da V0.2. Antes de completar 11 anos, você terá decisões e acontecimentos que poderão mudar toda a sua trajetória."
        );

    }
);
