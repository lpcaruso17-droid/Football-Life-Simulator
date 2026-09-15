const SAVE_KEY = "footballLifeSave";

const screens = {
  home: document.getElementById("homeScreen"),
  creator: document.getElementById("creatorScreen"),
  dashboard: document.getElementById("dashboardScreen"),
  event: document.getElementById("eventScreen"),
  summary: document.getElementById("summaryScreen")
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

const feet = ["Direito", "Esquerdo", "Ambidestro"];

const firstNames = [
  "Gabriel", "Lucas", "Pedro", "Matheus", "João", "Rafael", "Guilherme",
  "Bruno", "Arthur", "Miguel", "Caio", "Thiago", "Enzo", "Davi"
];

const lastNames = [
  "Almeida", "Silva", "Santos", "Oliveira", "Carvalho", "Martins",
  "Costa", "Souza", "Ferreira", "Rocha", "Moraes", "Barbosa"
];

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[screenName].classList.add("active");
  window.scrollTo(0, 0);
}

function randomName() {
  return `${randomItem(firstNames)} ${randomItem(lastNames)}`;
}

function fieldAttributes() {
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

function goalkeeperAttributes() {
  return {
    goalkeeper: {
      "Reflexos": randomNumber(32, 52),
      "Defesas": randomNumber(30, 50),
      "1 contra 1": randomNumber(28, 48),
      "Jogo aéreo": randomNumber(25, 45),
      "Saída do gol": randomNumber(24, 44),
      "Reposição": randomNumber(24, 44),
      "Jogo com os pés": randomNumber(22, 44),
      "Posicionamento": randomNumber(28, 48)
    },
    physical: {
      "Aceleração": randomNumber(25, 42),
      "Força": randomNumber(22, 42),
      "Agilidade": randomNumber(30, 50),
      "Impulsão": randomNumber(32, 52),
      "Resistência": randomNumber(24, 42)
    },
    mental: {
      "Concentração": randomNumber(28, 48),
      "Decisão": randomNumber(24, 44),
      "Frieza": randomNumber(24, 46),
      "Determinação": randomNumber(30, 55),
      "Comunicação": randomNumber(22, 45),
      "Liderança": randomNumber(20, 45)
    }
  };
}

function boost(attributeGroup, attributeName, amount) {
  if (attributeGroup && attributeGroup[attributeName] !== undefined) {
    attributeGroup[attributeName] = clamp(attributeGroup[attributeName] + amount, 1, 99);
  }
}

function createAttributes(position) {
  if (position === "Goleiro") return goalkeeperAttributes();

  const attributes = fieldAttributes();
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
  }

  return attributes;
}

function randomizeCharacter() {
  document.getElementById("playerName").value = randomName();
  document.getElementById("city").value = randomItem(cities);
  document.getElementById("financial").value = randomItem(financialOptions);
  document.getElementById("family").value = randomItem(familyOptions);
  document.getElementById("club").value = randomItem(clubs);
  document.getElementById("position").value = randomItem(positions);
  document.getElementById("foot").value = randomItem(feet);
}

function createLife() {
  const position = document.getElementById("position").value;
  const currentYear = new Date().getFullYear();
  const club = document.getElementById("club").value;

  const character = {
    version: 3,
    name: document.getElementById("playerName").value.trim(),
    age: 10,
    year: currentYear,
    city: document.getElementById("city").value,
    financial: document.getElementById("financial").value,
    family: document.getElementById("family").value,
    club,
    position,
    foot: document.getElementById("foot").value,

    hiddenPotential: randomNumber(60, 96),

    personality: {
      discipline: randomNumber(35, 90),
      ambition: randomNumber(35, 95),
      resilience: randomNumber(30, 95),
      professionalism: randomNumber(25, 90),
      sociability: randomNumber(30, 90),
      adaptability: randomNumber(30, 90)
    },

    life: {
      health: randomNumber(82, 100),
      happiness: randomNumber(65, 95),
      school: randomNumber(55, 95),
      familyRelationship: randomNumber(55, 95),
      reputation: 1,
      money: 0
    },

    relations: {
      coach: randomNumber(50, 75),
      teammates: randomNumber(50, 75)
    },

    football: {
      squadStatus: "Em avaliação",
      form: "Sem avaliação",
      positionCompetition: randomNumber(2, 4)
    },

    career: {
      clubs: [
        {
          club,
          fromAge: 10,
          fromYear: currentYear,
          toAge: null,
          toYear: null,
          reason: "Início da trajetória"
        }
      ],
      moves: []
    },

    attributes: createAttributes(position),
    seasons: [],

    history: [
      {
        age: 10,
        year: currentYear,
        category: "Vida",
        title: "O começo",
        description: `Começou sua jornada no futebol pelo ${club}.`
      }
    ],

    pendingYear: null
  };

  saveCharacter(character);
  return character;
}

function migrateSave(character) {
  if (!character) return null;

  character.version = 3;
  character.personality ||= {};
  character.life ||= {};
  character.relations ||= {};
  character.football ||= {};
  character.career ||= {};
  character.seasons ||= [];
  character.history ||= [];
  character.pendingYear ||= null;

  const personalityDefaults = {
    discipline: 55,
    ambition: 55,
    resilience: 55,
    professionalism: 50,
    sociability: 55,
    adaptability: 55
  };

  Object.entries(personalityDefaults).forEach(([key, value]) => {
    if (character.personality[key] === undefined) character.personality[key] = value;
  });

  const lifeDefaults = {
    health: 90,
    happiness: 75,
    school: 70,
    familyRelationship: 75,
    reputation: 1,
    money: 0
  };

  Object.entries(lifeDefaults).forEach(([key, value]) => {
    if (character.life[key] === undefined) character.life[key] = value;
  });

  if (character.relations.coach === undefined) character.relations.coach = 60;
  if (character.relations.teammates === undefined) character.relations.teammates = 60;

  if (!character.attributes || (character.position === "Goleiro" && !character.attributes.goalkeeper)) {
    character.attributes = createAttributes(character.position);
  }

  const latestSeason = character.seasons[character.seasons.length - 1];
  if (character.football.squadStatus === undefined) {
    character.football.squadStatus = latestSeason?.squadStatus || "Em avaliação";
  }
  if (character.football.form === undefined) {
    character.football.form = latestSeason?.form || (latestSeason?.rating ? formLabel(latestSeason.rating) : "Sem avaliação");
  }
  if (character.football.positionCompetition === undefined) {
    character.football.positionCompetition = randomNumber(2, 4);
  }

  if (!Array.isArray(character.career.clubs) || !character.career.clubs.length) {
    character.career.clubs = [
      {
        club: character.club,
        fromAge: 10,
        fromYear: Math.max(new Date().getFullYear(), character.year) - Math.max(0, character.age - 10),
        toAge: null,
        toYear: null,
        reason: "Início da trajetória"
      }
    ];
  }

  if (!Array.isArray(character.career.moves)) character.career.moves = [];

  character.seasons.forEach(season => normalizeSeason(season));
  if (character.pendingYear?.season) normalizeSeason(character.pendingYear.season);
  if (character.pendingYear && character.pendingYear.marketOutcome === undefined) {
    character.pendingYear.marketOutcome = null;
  }

  saveCharacter(character);
  return character;
}

function saveCharacter(character) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(character));
}

function loadSave() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return null;

  try {
    return migrateSave(JSON.parse(saved));
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return null;
  }
}

function renderAttributeSection(title, attributes) {
  let html = `
    <div class="attribute-section">
      <h4>${title}</h4>
      <div class="attribute-grid">
  `;

  Object.entries(attributes).forEach(([name, value]) => {
    html += `
      <div class="attribute">
        <span>${name}</span>
        <strong>${value}</strong>
      </div>
    `;
  });

  html += `</div></div>`;
  return html;
}

function attributeTitle(key) {
  const titles = {
    goalkeeper: "GOLEIRO",
    technical: "TÉCNICOS",
    physical: "FÍSICOS",
    mental: "MENTAIS"
  };

  return titles[key] || key.toUpperCase();
}

function latestHistoryItem(character) {
  return character.history[character.history.length - 1];
}

function confidenceLabel(value) {
  if (value >= 82) return "Muito alta";
  if (value >= 68) return "Boa";
  if (value >= 52) return "Regular";
  if (value >= 38) return "Instável";
  return "Baixa";
}

function formLabel(rating) {
  if (!rating) return "Sem avaliação";
  if (rating >= 7.6) return "Excelente";
  if (rating >= 7.1) return "Boa";
  if (rating >= 6.5) return "Regular";
  return "Ruim";
}

function normalizeSeason(season) {
  if (!season) return season;
  season.matches ??= season.appearances || 0;
  season.appearances ??= season.matches || 0;
  season.starts ??= 0;
  season.minutes ??= Math.round((season.starts || 0) * 70 + Math.max(0, (season.appearances || 0) - (season.starts || 0)) * 22);
  season.rating ??= 6.5;
  season.squadStatus ??= squadStatusFromSeason(season);
  season.form ??= formLabel(season.rating);
  season.yellowCards ??= 0;
  season.redCards ??= 0;
  season.recentMatches ||= [];
  if (season.position === "Goleiro") {
    season.cleanSheets ??= 0;
    season.goalsConceded ??= 0;
    season.saves ??= Math.max(0, Math.round((season.appearances || 0) * 3.2));
  } else {
    season.goals ??= 0;
    season.assists ??= 0;
  }
  return season;
}

function squadStatusFromSeason(season) {
  const matches = Math.max(1, season.matches || 1);
  const appearances = season.appearances || 0;
  const starts = season.starts || 0;
  const rating = season.rating || 0;

  if (appearances / matches < 0.18) return "Fora dos planos";
  if (appearances / matches < 0.45) return "Reserva";
  if (starts / matches < 0.52) return "Rotação";
  if (rating >= 7.45 && starts / matches >= 0.60) return "Destaque";
  return "Titular";
}

function currentFootballSummary(character) {
  const last = character.seasons[character.seasons.length - 1];
  if (!last) {
    return `Você ainda está no início da trajetória pelo ${character.club}. O treinador observa seus treinos enquanto você disputa espaço com outros jogadores da posição.`;
  }

  const base = `Na última temporada, você fez ${last.appearances} aparições, começou ${last.starts} como titular e teve média ${Number(last.rating).toFixed(1)}.`;
  if (character.position === "Goleiro") {
    return `${base} Foram ${last.cleanSheets || 0} jogos sem sofrer gols e ${last.saves || 0} defesas registradas.`;
  }
  return `${base} Você terminou com ${last.goals || 0} gols e ${last.assists || 0} assistências.`;
}

function renderCareerHistory(character) {
  const container = document.getElementById("careerHistoryContainer");
  if (!container) return;

  if (!character.seasons.length) {
    container.innerHTML = `<div class="timeline-item">Sua primeira temporada ainda será disputada.</div>`;
    return;
  }

  container.innerHTML = [...character.seasons]
    .reverse()
    .map(season => {
      normalizeSeason(season);
      const production = season.position === "Goleiro"
        ? `${season.cleanSheets || 0} jogos sem sofrer gols · ${season.saves || 0} defesas`
        : `${season.goals || 0} gols · ${season.assists || 0} assistências`;

      return `
        <div class="career-history-item">
          <div class="career-year">${season.year}<br>${season.age} ANOS</div>
          <div>
            <strong>${season.club} · ${season.squadStatus}</strong>
            <p>${season.appearances} jogos · ${season.minutes} min · média ${Number(season.rating).toFixed(1)} · ${production}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderDashboard(character) {
  document.getElementById("dashboardName").textContent = character.name;
  document.getElementById("dashboardInfo").textContent = `${character.city} · ${character.club}`;
  document.getElementById("dashboardAge").textContent = character.age;

  document.getElementById("healthStat").textContent = character.life.health;
  document.getElementById("happinessStat").textContent = character.life.happiness;
  document.getElementById("schoolStat").textContent = character.life.school;
  document.getElementById("familyStat").textContent = character.life.familyRelationship;
  document.getElementById("reputationStat").textContent = character.life.reputation;

  document.getElementById("moneyStat").textContent =
    character.life.money.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  document.getElementById("clubInfo").textContent = character.club;
  document.getElementById("positionInfo").textContent = character.position;
  document.getElementById("footInfo").textContent = character.foot;
  document.getElementById("yearInfo").textContent = character.year;

  const latestSeason = character.seasons[character.seasons.length - 1];
  if (latestSeason) normalizeSeason(latestSeason);

  document.getElementById("footballStatus").textContent =
    character.club === "Sem clube" ? "Sem clube" : (latestSeason?.squadStatus || character.football.squadStatus || "Em avaliação");
  document.getElementById("coachConfidence").textContent = confidenceLabel(character.relations.coach);
  document.getElementById("currentForm").textContent = latestSeason?.form || character.football.form || "Sem avaliação";
  document.getElementById("competitionInfo").textContent =
    `${character.football.positionCompetition} concorrente${character.football.positionCompetition === 1 ? "" : "s"}`;
  document.getElementById("footballSummaryText").textContent = currentFootballSummary(character);

  const latest = latestHistoryItem(character);
  document.getElementById("storyTitle").textContent =
    latest ? `${latest.age} anos · ${latest.title}` : `${character.age} anos`;

  document.getElementById("openingStory").textContent =
    latest
      ? latest.description
      : `${character.name} segue construindo sua história dentro e fora do futebol.`;

  const attributesContainer = document.getElementById("attributesContainer");
  attributesContainer.innerHTML = Object.entries(character.attributes)
    .map(([key, attrs]) => renderAttributeSection(attributeTitle(key), attrs))
    .join("");

  renderCareerHistory(character);

  document.getElementById("nextYearButton").textContent =
    `VIVER O ANO DOS ${character.age} ANOS`;

  changeScreen("dashboard");
}

function getNested(object, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], object);
}

function setNested(object, path, value) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((acc, key) => acc[key], object);
  target[last] = value;
}

function applyEffects(character, effects = {}) {
  Object.entries(effects).forEach(([path, change]) => {
    const current = getNested(character, path);

    if (typeof current === "number") {
      const max = path === "life.money" ? Number.MAX_SAFE_INTEGER : 100;
      setNested(character, path, clamp(current + change, 0, max));
    }
  });
}

function improveRandomAttributes(character, groupKey, amount = 1, count = 2) {
  const group = character.attributes[groupKey];
  if (!group) return;

  const keys = Object.keys(group).sort(() => Math.random() - 0.5).slice(0, count);
  keys.forEach(key => {
    group[key] = clamp(group[key] + amount, 1, 99);
  });
}

function addHistory(character, title, description, category = "Vida") {
  character.history.push({
    age: character.age,
    year: character.year,
    category,
    title,
    description
  });
}

const eventTemplates = [
  {
    id: "training_focus",
    category: "FUTEBOL",
    title: "Hora de evoluir",
    text: c => `Seu treinador no ${c.club} acredita que você tem margem para evoluir bastante neste ano e pergunta qual área você quer trabalhar com mais atenção.`,
    condition: () => true,
    choices: [
      {
        label: "Treinar técnica depois das atividades",
        hint: "Mais bola no pé, mas menos tempo livre.",
        outcome: "Você começa a ficar depois do treino para trabalhar fundamentos.",
        effects: { "personality.discipline": 2, "life.happiness": -1 },
        action: c => improveRandomAttributes(c, c.position === "Goleiro" ? "goalkeeper" : "technical", 2, 3),
        history: "Decidiu aumentar a carga de treino técnico."
      },
      {
        label: "Focar no físico",
        hint: "Preparação para ganhar força, velocidade e resistência.",
        outcome: "Você passa a levar os trabalhos físicos mais a sério.",
        effects: { "personality.professionalism": 2 },
        action: c => improveRandomAttributes(c, "physical", 2, 3),
        history: "Passou a dar atenção especial à preparação física."
      },
      {
        label: "Equilibrar futebol e escola",
        hint: "Crescimento mais gradual, preservando os estudos.",
        outcome: "Você mantém uma rotina mais equilibrada entre clube e escola.",
        effects: { "life.school": 3, "life.familyRelationship": 2, "personality.discipline": 1 },
        action: c => improveRandomAttributes(c, "mental", 1, 2),
        history: "Escolheu equilibrar futebol e estudos."
      }
    ]
  },

  {
    id: "school_pressure",
    category: "ESCOLA",
    title: "As notas começaram a preocupar",
    text: c => `${c.name.split(" ")[0]} recebeu um aviso da escola: algumas notas caíram por causa da rotina de treinos. Sua família quer uma resposta.`,
    condition: c => c.life.school < 72,
    choices: [
      {
        label: "Estudar mais durante a semana",
        hint: "Você terá menos tempo livre.",
        outcome: "A rotina fica mais puxada, mas seus responsáveis percebem seu esforço.",
        effects: { "life.school": 8, "life.happiness": -2, "life.familyRelationship": 4, "personality.discipline": 2 },
        history: "Reorganizou a rotina para recuperar as notas."
      },
      {
        label: "Dizer que o futebol é prioridade",
        hint: "Pode criar tensão em casa.",
        outcome: "Sua família não gosta muito da resposta, mas você mantém o foco total no clube.",
        effects: { "life.school": -4, "life.familyRelationship": -5, "personality.ambition": 3 },
        action: c => improveRandomAttributes(c, c.position === "Goleiro" ? "goalkeeper" : "technical", 1, 2),
        history: "Colocou o futebol acima da recuperação escolar."
      }
    ]
  },

  {
    id: "family_support",
    category: "FAMÍLIA",
    title: "Uma conversa em casa",
    text: () => "Depois de um treino difícil, alguém da sua família percebe que você está mais quieto que o normal e pergunta se ainda está feliz jogando futebol.",
    condition: () => true,
    choices: [
      {
        label: "Contar o que está sentindo",
        hint: "Abrir o jogo pode aproximar vocês.",
        outcome: "A conversa é longa e você termina a noite se sentindo mais apoiado.",
        effects: { "life.happiness": 5, "life.familyRelationship": 5, "personality.resilience": 1 },
        history: "Teve uma conversa importante com a família sobre a pressão do futebol."
      },
      {
        label: "Dizer que está tudo bem",
        hint: "Você prefere lidar com isso sozinho.",
        outcome: "O assunto termina rápido. Você guarda a pressão para si.",
        effects: { "life.happiness": -2, "personality.resilience": 2 },
        history: "Preferiu guardar para si as dificuldades daquele momento."
      }
    ]
  },

  {
    id: "coach_praise",
    category: "FUTEBOL",
    title: "Elogio do treinador",
    text: c => `Após uma boa sequência de treinos no ${c.club}, seu treinador destaca sua dedicação na frente do grupo.`,
    condition: c => c.personality.discipline >= 55,
    choices: [
      {
        label: "Agradecer e continuar trabalhando",
        hint: "Uma reação madura.",
        outcome: "O treinador gosta da sua postura e passa a confiar um pouco mais em você.",
        effects: { "relations.coach": 6, "life.reputation": 1, "personality.professionalism": 2 },
        history: "Foi elogiado publicamente pelo treinador."
      },
      {
        label: "Brincar que já merece ser titular",
        hint: "Pode soar confiante ou convencido.",
        outcome: "Alguns companheiros riem. O treinador não leva tão a sério, mas percebe sua confiança.",
        effects: { "relations.teammates": 2, "personality.sociability": 2, "relations.coach": -1 },
        history: "Respondeu com confiança após um elogio do treinador."
      }
    ]
  },

  {
    id: "new_competitor",
    category: "VESTIÁRIO",
    title: "Chegou concorrência",
    text: c => `Um novo ${c.position.toLowerCase()} chega ao elenco e impressiona nos primeiros treinos. Pela primeira vez, você sente sua posição ameaçada.`,
    condition: () => true,
    choices: [
      {
        label: "Aumentar sua dedicação",
        hint: "Transformar a concorrência em motivação.",
        outcome: "Você passa a chegar mais cedo e prestar atenção a cada detalhe.",
        effects: { "personality.discipline": 3, "relations.coach": 2, "life.happiness": -1 },
        action: c => improveRandomAttributes(c, "mental", 2, 2),
        history: "Reagiu à concorrência aumentando a dedicação nos treinos."
      },
      {
        label: "Se aproximar do novo companheiro",
        hint: "Vocês podem aprender juntos.",
        outcome: "A disputa continua, mas a relação entre vocês começa bem.",
        effects: { "relations.teammates": 6, "personality.sociability": 2, "life.happiness": 2 },
        history: "Transformou um concorrente de posição em um novo companheiro próximo."
      },
      {
        label: "Ficar incomodado e reclamar",
        hint: "Pode desgastar a relação com a comissão.",
        outcome: "Sua insatisfação chega ao treinador, que cobra mais maturidade.",
        effects: { "relations.coach": -6, "life.happiness": -3, "personality.resilience": -1 },
        history: "Ficou incomodado com a chegada de um concorrente de posição."
      }
    ]
  },

  {
    id: "transport_cost",
    category: "VIDA REAL",
    title: "O custo de continuar",
    text: () => "Os gastos com transporte, alimentação e material esportivo começaram a pesar no orçamento da família.",
    condition: c => c.financial.includes("baixa renda") || c.financial.includes("média baixa"),
    choices: [
      {
        label: "Conversar com o clube",
        hint: "Talvez exista algum tipo de ajuda.",
        outcome: "Sua família procura o clube. A resposta não resolve tudo, mas aparece algum apoio pontual.",
        effects: { "life.familyRelationship": 3, "life.money": 150, "relations.coach": 1 },
        history: "A família buscou apoio para manter os custos da rotina no futebol."
      },
      {
        label: "A família aperta o orçamento",
        hint: "Vocês decidem fazer o possível para você continuar.",
        outcome: "Algumas despesas são cortadas em casa para manter sua rotina esportiva.",
        effects: { "life.familyRelationship": 4, "life.happiness": -2 },
        history: "A família fez sacrifícios financeiros para manter sua rotina no futebol."
      }
    ]
  },

  {
    id: "boots",
    category: "VIDA REAL",
    title: "A chuteira já não aguenta mais",
    text: () => "Sua chuteira está apertada e bastante desgastada. Um novo par faria diferença, mas nem toda família consegue trocar equipamento imediatamente.",
    condition: () => true,
    choices: [
      {
        label: "Pedir uma chuteira nova",
        hint: "A resposta dependerá da condição financeira da família.",
        outcome: "Sua família conversa sobre a compra e tenta encontrar uma solução.",
        effects: { "life.familyRelationship": 1 },
        action: c => {
          if (c.financial.includes("alta renda") || c.financial.includes("média alta")) {
            c.life.happiness = clamp(c.life.happiness + 4);
          } else {
            c.life.happiness = clamp(c.life.happiness - 1);
          }
        },
        history: "Conversou com a família sobre a necessidade de trocar a chuteira."
      },
      {
        label: "Continuar usando a atual",
        hint: "Você evita criar uma despesa agora.",
        outcome: "Você decide esperar mais um pouco antes de pedir um novo par.",
        effects: { "personality.resilience": 2, "life.happiness": -1 },
        history: "Continuou treinando com o material que já tinha."
      }
    ]
  },

  {
    id: "minor_injury",
    category: "SAÚDE",
    title: "Primeiro susto físico",
    text: () => "Durante um treino, você sente uma dor e precisa parar antes do fim. Não parece grave, mas o departamento médico pede alguns dias de cuidado.",
    condition: c => c.life.health >= 70,
    choices: [
      {
        label: "Respeitar o descanso",
        hint: "Você perde alguns treinos, mas se recupera melhor.",
        outcome: "Você segue a orientação e volta sem grandes problemas.",
        effects: { "life.health": 2, "personality.professionalism": 2, "relations.coach": 1 },
        history: "Teve uma lesão leve e respeitou o período de recuperação."
      },
      {
        label: "Tentar voltar antes",
        hint: "Você não quer perder espaço.",
        outcome: "Você força a volta e termina a semana mais dolorido.",
        effects: { "life.health": -7, "personality.ambition": 2, "relations.coach": -1 },
        history: "Tentou acelerar a volta após sentir uma lesão leve."
      }
    ]
  },

  {
    id: "position_change",
    category: "FUTEBOL",
    title: "Uma posição diferente",
    text: c => `O treinador diz que enxerga características suas que poderiam funcionar melhor em outra posição. Hoje você joga como ${c.position}.`,
    condition: c => c.position !== "Goleiro",
    choices: [
      {
        label: "Aceitar testar outra posição",
        hint: "A mudança não será definitiva ainda.",
        outcome: "Você passa algumas semanas treinando em uma nova função e amplia sua compreensão do jogo.",
        effects: { "relations.coach": 4, "personality.adaptability": 3 },
        action: c => {
          const alternatives = {
            "Lateral Direito": ["Ponta Direita", "Volante"],
            "Lateral Esquerdo": ["Ponta Esquerda", "Volante"],
            "Zagueiro": ["Volante", "Lateral Direito", "Lateral Esquerdo"],
            "Volante": ["Zagueiro", "Meia"],
            "Meia": ["Volante", "Ponta Direita", "Ponta Esquerda"],
            "Ponta Direita": ["Meia", "Lateral Direito", "Centroavante"],
            "Ponta Esquerda": ["Meia", "Lateral Esquerdo", "Centroavante"],
            "Centroavante": ["Ponta Direita", "Ponta Esquerda", "Meia"]
          };
          const nextPosition = randomItem(alternatives[c.position] || ["Meia"]);
          const oldPosition = c.position;
          c.position = nextPosition;
          improveRandomAttributes(c, "mental", 2, 3);
          addHistory(c, "Mudança de posição", `Passou de ${oldPosition} para ${nextPosition} após uma sugestão do treinador.`, "Futebol");
        },
        history: "Aceitou uma mudança de posição sugerida pelo treinador."
      },
      {
        label: "Pedir para continuar onde está",
        hint: "Você acredita mais no caminho atual.",
        outcome: "O treinador aceita, mas pede que você prove sua evolução.",
        effects: { "personality.ambition": 2, "relations.coach": -1 },
        history: "Preferiu seguir desenvolvendo sua posição original."
      }
    ]
  },

  {
    id: "goalkeeper_feet",
    category: "FUTEBOL",
    title: "Goleiro também joga com os pés",
    text: () => "O treinador de goleiros cobra uma evolução na saída curta e na reposição. O futebol está exigindo cada vez mais participação com os pés.",
    condition: c => c.position === "Goleiro",
    choices: [
      {
        label: "Ficar depois para treinar reposição",
        hint: "Trabalho específico extra.",
        outcome: "Você começa uma rotina curta de passes e reposições depois do treino.",
        effects: { "personality.discipline": 2, "relations.coach": 3 },
        action: c => {
          boost(c.attributes.goalkeeper, "Reposição", 3);
          boost(c.attributes.goalkeeper, "Jogo com os pés", 3);
        },
        history: "Passou a trabalhar especificamente o jogo com os pés."
      },
      {
        label: "Focar nas defesas",
        hint: "Você prefere priorizar o fundamento mais tradicional.",
        outcome: "Você concentra sua energia nos reflexos e nas defesas.",
        action: c => {
          boost(c.attributes.goalkeeper, "Reflexos", 2);
          boost(c.attributes.goalkeeper, "Defesas", 2);
        },
        history: "Preferiu priorizar reflexos e defesas nos treinos."
      }
    ]
  },

  {
    id: "tournament",
    category: "COMPETIÇÃO",
    title: "Chegou o torneio mais importante do ano",
    text: c => `O ${c.club} vai disputar uma competição importante da categoria. Há mais gente assistindo aos jogos e o nível de cobrança aumenta.`,
    condition: () => true,
    choices: [
      {
        label: "Entrar concentrado e seguir a rotina",
        hint: "Você tenta tratar o torneio como qualquer outro.",
        outcome: "A preparação é tranquila e sua confiança cresce aos poucos.",
        effects: { "personality.professionalism": 2, "life.happiness": 1 },
        action: c => improveRandomAttributes(c, "mental", 1, 2),
        history: "Disputou um torneio importante tentando manter a rotina normal."
      },
      {
        label: "Usar a pressão como motivação",
        hint: "Você quer aproveitar a oportunidade para aparecer.",
        outcome: "Você entra na competição com muita energia e ambição.",
        effects: { "personality.ambition": 3, "life.reputation": 1, "life.happiness": -1 },
        history: "Encarou um torneio importante como chance de ganhar espaço."
      }
    ]
  },

  {
    id: "coach_criticism",
    category: "FUTEBOL",
    title: "Uma bronca na frente de todos",
    text: () => "Durante o treino, seu treinador interrompe a atividade e critica uma decisão sua na frente de todo o grupo.",
    condition: () => true,
    choices: [
      {
        label: "Ouvir e tentar corrigir",
        hint: "Você prefere responder dentro de campo.",
        outcome: "No restante da atividade, você se concentra em fazer exatamente o que foi pedido.",
        effects: { "relations.coach": 3, "personality.resilience": 2, "personality.professionalism": 1 },
        history: "Recebeu uma bronca do treinador e respondeu com trabalho."
      },
      {
        label: "Responder que não concorda",
        hint: "Pode virar um conflito.",
        outcome: "A conversa fica tensa e o treinador encerra o assunto dizendo que vocês falarão depois.",
        effects: { "relations.coach": -8, "personality.ambition": 2, "life.happiness": -2 },
        history: "Questionou uma crítica do treinador durante o treino."
      }
    ]
  },

  {
    id: "friendship",
    category: "VIDA SOCIAL",
    title: "Um amigo fora do futebol",
    text: () => "Um amigo da escola reclama que você quase nunca consegue participar dos programas porque está sempre treinando ou jogando.",
    condition: () => true,
    choices: [
      {
        label: "Reservar mais tempo para os amigos",
        hint: "Nem tudo precisa girar em torno da bola.",
        outcome: "Você consegue recuperar parte da vida social que estava deixando de lado.",
        effects: { "life.happiness": 5, "personality.sociability": 3, "personality.discipline": -1 },
        history: "Tentou equilibrar melhor futebol e amizades."
      },
      {
        label: "Explicar que esse é seu sonho",
        hint: "Você aceita abrir mão de algumas coisas.",
        outcome: "Seu amigo entende, mesmo que vocês passem menos tempo juntos.",
        effects: { "personality.ambition": 3, "personality.resilience": 1 },
        history: "Aceitou abrir mão de parte da vida social para seguir no futebol."
      }
    ]
  },

  {
    id: "trial_offer",
    category: "OPORTUNIDADE",
    title: "Um convite inesperado",
    text: c => `Depois de um jogo, surge a possibilidade de fazer uma avaliação em outro clube. Você já está no ${c.club}, e ninguém garante que a oportunidade dará certo.`,
    condition: c => !["Flamengo", "Palmeiras", "Corinthians", "São Paulo", "Fluminense"].includes(c.club),
    choices: [
      {
        label: "Aceitar fazer a avaliação",
        hint: "Você mantém seu clube atual enquanto conhece a oportunidade.",
        outcome: "Sua família organiza a logística e você vive alguns dias de muita expectativa.",
        effects: { "personality.ambition": 3, "life.happiness": 2, "life.reputation": 1 },
        history: "Aceitou participar de uma avaliação em outro clube."
      },
      {
        label: "Continuar onde está",
        hint: "Você prefere estabilidade neste momento.",
        outcome: "Você agradece o convite e decide seguir o processo no clube atual.",
        effects: { "relations.coach": 3, "life.familyRelationship": 2 },
        history: "Recusou uma avaliação para continuar no clube em que estava."
      }
    ]
  },

  {
    id: "big_club_pressure",
    category: "PRESSÃO",
    title: "Vestir uma camisa pesada",
    text: c => `Estar na base do ${c.club} significa competir com muitos garotos talentosos. Você começa a perceber que pequenas quedas de rendimento podem custar espaço.`,
    condition: c => !["Escolinha local", "Clube pequeno da cidade"].includes(c.club),
    choices: [
      {
        label: "Usar a concorrência como combustível",
        hint: "Você aceita a exigência do ambiente.",
        outcome: "A pressão continua, mas você passa a encará-la como parte da caminhada.",
        effects: { "personality.resilience": 3, "personality.ambition": 2, "life.happiness": -1 },
        history: "Começou a lidar de forma mais madura com a pressão de um grande clube."
      },
      {
        label: "Conversar com sua família sobre a pressão",
        hint: "Buscar apoio pode ajudar.",
        outcome: "A conversa não muda o clube, mas muda como você enxerga o momento.",
        effects: { "life.familyRelationship": 4, "life.happiness": 4 },
        history: "Buscou apoio da família para lidar com a pressão da base."
      }
    ]
  },

  {
    id: "school_tournament",
    category: "ESCOLA",
    title: "Convite para jogar pela escola",
    text: () => "A escola vai disputar um torneio e seus colegas querem muito que você jogue. O problema é que o calendário bate perto de uma atividade do clube.",
    condition: () => true,
    choices: [
      {
        label: "Jogar pela escola",
        hint: "Pode fortalecer amizades, mas aumenta a carga física.",
        outcome: "Você participa e vira uma das principais atrações do torneio escolar.",
        effects: { "life.happiness": 4, "life.school": 2, "relations.teammates": 1, "life.health": -2 },
        history: "Representou a escola em um torneio de futebol."
      },
      {
        label: "Priorizar o clube",
        hint: "Você evita qualquer risco com sua rotina esportiva.",
        outcome: "Alguns colegas ficam decepcionados, mas você mantém o compromisso com o clube.",
        effects: { "personality.professionalism": 3, "personality.ambition": 2 },
        history: "Abriu mão de um torneio escolar para priorizar o clube."
      }
    ]
  },

  {
    id: "growth_spurt",
    category: "DESENVOLVIMENTO",
    title: "Seu corpo está mudando",
    text: () => "Você passa por uma fase de crescimento e começa a sentir diferença na coordenação, na força e até na forma de correr.",
    condition: () => true,
    choices: [
      {
        label: "Ter paciência com a adaptação",
        hint: "Nem todo desenvolvimento é linear.",
        outcome: "Você entende que o corpo precisa de tempo e continua treinando sem desespero.",
        effects: { "personality.resilience": 3, "life.happiness": 1 },
        action: c => improveRandomAttributes(c, "physical", 2, 3),
        history: "Passou por uma fase importante de crescimento físico."
      },
      {
        label: "Treinar ainda mais para compensar",
        hint: "Mais trabalho, mas também mais desgaste.",
        outcome: "Você aumenta a carga e sente evolução, embora termine alguns dias bastante cansado.",
        effects: { "personality.discipline": 2, "life.health": -3 },
        action: c => improveRandomAttributes(c, "physical", 3, 2),
        history: "Aumentou a carga de treino durante uma fase de crescimento."
      }
    ]
  },

  {
    id: "social_media",
    category: "REDES SOCIAIS",
    title: "Seu primeiro vídeo começou a circular",
    text: () => "Um vídeo de uma jogada sua em um torneio da base começa a ser compartilhado por colegas, familiares e páginas locais.",
    condition: c => c.age >= 11,
    choices: [
      {
        label: "Compartilhar e aproveitar o momento",
        hint: "Sua exposição aumenta um pouco.",
        outcome: "Você recebe elogios e começa a perceber que futebol também traz atenção fora do campo.",
        effects: { "life.reputation": 2, "life.happiness": 3, "personality.sociability": 2 },
        history: "Teve uma jogada compartilhada nas redes sociais pela primeira vez."
      },
      {
        label: "Não dar muita importância",
        hint: "Você prefere manter a cabeça no clube.",
        outcome: "O vídeo continua circulando, mas você segue a rotina normalmente.",
        effects: { "personality.professionalism": 2, "relations.coach": 1 },
        history: "Preferiu não se envolver muito com a repercussão de um vídeo seu."
      }
    ]
  },

  {
    id: "family_move",
    category: "FAMÍLIA",
    title: "Uma possível mudança de cidade",
    text: () => "Surge uma possibilidade de trabalho para alguém da sua família em outra cidade. A mudança poderia alterar toda a sua rotina no futebol.",
    condition: c => c.age >= 11,
    choices: [
      {
        label: "Dizer que quer continuar no clube",
        hint: "A família terá que considerar seu futebol na decisão.",
        outcome: "Pela primeira vez, sua carreira entra diretamente em uma decisão importante da família.",
        effects: { "personality.ambition": 3, "life.familyRelationship": -1 },
        history: "Pediu que a família considerasse sua carreira antes de uma possível mudança de cidade."
      },
      {
        label: "Aceitar acompanhar a família",
        hint: "Talvez seja necessário recomeçar no futebol.",
        outcome: "Você deixa claro que a família vem antes do clube.",
        effects: { "life.familyRelationship": 6, "personality.resilience": 2, "life.happiness": -2 },
        history: "Aceitou a possibilidade de recomeçar no futebol por causa da família."
      }
    ]
  }
];

function eligibleEvents(character) {
  return eventTemplates.filter(event => {
    if (character.pendingYear?.usedEventIds?.includes(event.id)) return false;
    return event.condition(character);
  });
}

function buildYearEvents(character, amount = 5) {
  const selected = [];
  const used = new Set();

  while (selected.length < amount) {
    const candidates = eventTemplates.filter(event => {
      return !used.has(event.id) && event.condition(character);
    });

    if (!candidates.length) break;

    const chosen = randomItem(candidates);
    selected.push(chosen.id);
    used.add(chosen.id);
  }

  return selected;
}

function startYear(character) {
  if (!character.pendingYear) {
    character.pendingYear = {
      age: character.age,
      year: character.year,
      eventIds: buildYearEvents(character, 5),
      currentIndex: 0,
      chosenHistory: [],
      currentResolved: false,
      currentOutcome: "",
      season: null,
      marketOutcome: null
    };

    saveCharacter(character);
  }

  renderCurrentEvent(character);
}

function getCurrentEvent(character) {
  const pending = character.pendingYear;
  if (!pending) return null;

  const id = pending.eventIds[pending.currentIndex];
  return eventTemplates.find(event => event.id === id) || null;
}

function renderCurrentEvent(character) {
  const pending = character.pendingYear;

  if (!pending) {
    renderDashboard(character);
    return;
  }

  if (pending.currentIndex >= pending.eventIds.length) {
    completeEventPhase(character);
    return;
  }

  const event = getCurrentEvent(character);

  if (!event) {
    pending.currentIndex += 1;
    saveCharacter(character);
    renderCurrentEvent(character);
    return;
  }

  document.getElementById("eventYearLabel").textContent =
    `${character.year} · ${character.age} ANOS`;

  document.getElementById("eventProgress").textContent =
    `${pending.currentIndex + 1} / ${pending.eventIds.length}`;

  document.getElementById("eventCategory").textContent = event.category;
  document.getElementById("eventTitle").textContent = event.title;
  document.getElementById("eventText").textContent = event.text(character);

  const choices = document.getElementById("eventChoices");
  const result = document.getElementById("eventResult");

  choices.innerHTML = "";

  if (pending.currentResolved) {
    choices.classList.add("hidden");
    result.classList.remove("hidden");
    document.getElementById("eventOutcome").textContent = pending.currentOutcome;
  } else {
    choices.classList.remove("hidden");
    result.classList.add("hidden");

    event.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.innerHTML = `<strong>${choice.label}</strong><span>${choice.hint || ""}</span>`;
      button.addEventListener("click", () => resolveChoice(character, event, choice, index));
      choices.appendChild(button);
    });
  }

  changeScreen("event");
}

function resolveChoice(character, event, choice) {
  applyEffects(character, choice.effects);

  if (choice.action) {
    choice.action(character);
  }

  addHistory(character, event.title, choice.history || choice.outcome, event.category);

  character.pendingYear.chosenHistory.push({
    title: event.title,
    text: choice.history || choice.outcome
  });

  character.pendingYear.currentResolved = true;
  character.pendingYear.currentOutcome = choice.outcome;

  saveCharacter(character);
  renderCurrentEvent(character);
}

function continueEvent(character) {
  character.pendingYear.currentIndex += 1;
  character.pendingYear.currentResolved = false;
  character.pendingYear.currentOutcome = "";
  saveCharacter(character);
  renderCurrentEvent(character);
}

function overallFootballLevel(character) {
  const allValues = Object.values(character.attributes)
    .flatMap(group => Object.values(group));

  return average(allValues);
}

function growPlayer(character, season = null) {
  const potentialGap = Math.max(0, character.hiddenPotential - overallFootballLevel(character));
  const disciplineFactor = character.personality.discipline / 100;
  const professionalFactor = character.personality.professionalism / 100;
  const minutesFactor = season ? clamp(season.minutes / 1400, 0, 1) : 0.4;
  const ratingFactor = season ? clamp((season.rating - 6) / 2, 0, 1) : 0.4;

  let growthPoints = 2;
  if (potentialGap > 35) growthPoints += 2;
  if (disciplineFactor > 0.65) growthPoints += 1;
  if (professionalFactor > 0.65) growthPoints += 1;
  if (minutesFactor > 0.65) growthPoints += 1;
  if (ratingFactor > 0.60) growthPoints += 1;

  const groupKeys = Object.keys(character.attributes);

  for (let i = 0; i < growthPoints; i += 1) {
    const group = randomItem(groupKeys);
    improveRandomAttributes(character, group, 1, randomNumber(1, 2));
  }
}

function positionProfile(position) {
  const profiles = {
    "Goleiro": { goal: 0, assist: 0.01, yellow: 0.02 },
    "Lateral Direito": { goal: 0.04, assist: 0.12, yellow: 0.10 },
    "Lateral Esquerdo": { goal: 0.04, assist: 0.12, yellow: 0.10 },
    "Zagueiro": { goal: 0.04, assist: 0.03, yellow: 0.14 },
    "Volante": { goal: 0.07, assist: 0.09, yellow: 0.16 },
    "Meia": { goal: 0.16, assist: 0.24, yellow: 0.07 },
    "Ponta Direita": { goal: 0.22, assist: 0.18, yellow: 0.05 },
    "Ponta Esquerda": { goal: 0.22, assist: 0.18, yellow: 0.05 },
    "Centroavante": { goal: 0.34, assist: 0.10, yellow: 0.06 }
  };
  return profiles[position] || profiles["Meia"];
}

function randomOpponent(character) {
  const available = clubs.filter(club => club !== character.club && !["Escolinha local", "Clube pequeno da cidade"].includes(club));
  return randomItem(available.length ? available : clubs.filter(club => club !== character.club));
}

function simulateScore(character, appeared) {
  const overall = overallFootballLevel(character);
  const ownEdge = appeared ? clamp((overall - 35) / 45, -0.2, 0.65) : 0;
  const ownGoals = clamp(randomNumber(0, 3) + (Math.random() < ownEdge ? 1 : 0), 0, 5);
  const opponentGoals = randomNumber(0, 3);
  return { ownGoals, opponentGoals };
}

function simulateMatch(character, startProbability, subProbability) {
  const started = Math.random() < startProbability;
  const appeared = started || Math.random() < subProbability;
  const opponent = randomOpponent(character);
  const score = simulateScore(character, appeared);

  if (!appeared) {
    return {
      opponent,
      ownGoals: score.ownGoals,
      opponentGoals: score.opponentGoals,
      appeared: false,
      started: false,
      minutes: 0,
      rating: null,
      goals: 0,
      assists: 0,
      saves: 0,
      conceded: 0,
      yellow: 0,
      red: 0
    };
  }

  const minutes = started ? randomNumber(58, 90) : randomNumber(8, 34);
  const profile = positionProfile(character.position);
  const overall = overallFootballLevel(character);
  const performanceBoost = clamp((overall - 35) / 30, -0.2, 0.8);

  let goals = 0;
  let assists = 0;
  let saves = 0;
  let conceded = 0;

  if (character.position === "Goleiro") {
    conceded = Math.max(0, Math.round(score.opponentGoals * (minutes / 90)));
    saves = randomNumber(1, 6) + (Math.random() < 0.35 + performanceBoost * 0.2 ? randomNumber(1, 3) : 0);
  } else {
    if (Math.random() < profile.goal * (0.75 + overall / 100)) goals += 1;
    if (Math.random() < profile.goal * 0.18 && minutes > 65) goals += 1;
    if (Math.random() < profile.assist * (0.75 + overall / 110)) assists += 1;
  }

  const yellow = Math.random() < profile.yellow ? 1 : 0;
  const red = yellow && Math.random() < 0.025 ? 1 : 0;

  let rating = 6.1 + randomNumber(-5, 6) / 10 + performanceBoost * 0.55;
  if (goals) rating += goals * 0.65;
  if (assists) rating += assists * 0.40;
  if (character.position === "Goleiro") {
    rating += saves * 0.06;
    rating -= conceded * 0.18;
    if (conceded === 0 && minutes >= 70) rating += 0.35;
  }
  if (score.ownGoals > score.opponentGoals) rating += 0.12;
  if (red) rating -= 0.8;

  rating = Math.round(clamp(rating, 5.1, 9.5) * 10) / 10;

  return {
    opponent,
    ownGoals: score.ownGoals,
    opponentGoals: score.opponentGoals,
    appeared,
    started,
    minutes,
    rating,
    goals,
    assists,
    saves,
    conceded,
    yellow,
    red
  };
}

function buildSeasonEvaluation(character, season) {
  const first = character.name.split(" ")[0];
  if (season.squadStatus === "Destaque") {
    return {
      title: "Você virou referência da categoria",
      text: `${first} terminou o ano como um dos nomes mais importantes do ${season.club}. A boa fase aumentou sua reputação e chamou atenção dentro do ambiente da base.`
    };
  }
  if (season.squadStatus === "Titular") {
    return {
      title: "Ano de afirmação",
      text: `${first} conquistou espaço entre os titulares e terminou a temporada com confiança do treinador. O desafio agora é transformar regularidade em evolução.`
    };
  }
  if (season.squadStatus === "Rotação") {
    return {
      title: "Você segue disputando espaço",
      text: `A temporada teve oportunidades e períodos no banco. ${first} continua dentro da rotação, mas ainda precisa convencer a comissão para se firmar como titular.`
    };
  }
  if (season.squadStatus === "Reserva") {
    return {
      title: "Pouco espaço durante o ano",
      text: `${first} participou menos do que gostaria. A concorrência está forte e a próxima temporada pode ser importante para definir sua continuidade e seu espaço no elenco.`
    };
  }
  return {
    title: "Um ano de alerta",
    text: `${first} quase não foi utilizado e terminou o ano distante dos planos principais da comissão. Isso não encerra sua história, mas aumenta a chance de mudanças no caminho.`
  };
}

function buildMarketOutcome(character, season) {
  if (character.club === "Sem clube") {
    return {
      type: "tryout",
      club: randomOpponent(character),
      resolved: false,
      decision: null,
      resultText: ""
    };
  }

  const strongSeason = season.rating >= 7.25 && season.appearances >= Math.max(7, Math.round(season.matches * 0.45));
  const scoutChance = clamp(0.08 + Math.max(0, season.rating - 7) * 0.16 + character.life.reputation * 0.01, 0.08, 0.42);

  if (character.age >= 11 && strongSeason && Math.random() < scoutChance) {
    return {
      type: character.age <= 12 ? "trial" : "interest",
      club: randomOpponent(character),
      resolved: false,
      decision: null,
      resultText: ""
    };
  }

  const releaseRisk = character.age >= 12 &&
    ["Fora dos planos", "Reserva"].includes(season.squadStatus) &&
    character.relations.coach < 46;

  if (releaseRisk && Math.random() < 0.42) {
    return {
      type: "release",
      club: randomOpponent(character),
      resolved: false,
      decision: null,
      resultText: ""
    };
  }

  return null;
}

function changeClub(character, newClub, reason) {
  if (!newClub || newClub === character.club) return;
  const oldClub = character.club;
  const currentEntry = [...character.career.clubs].reverse().find(item => item.toYear === null);
  if (currentEntry) {
    currentEntry.toAge = character.age;
    currentEntry.toYear = character.year;
  }

  character.career.moves.push({
    age: character.age,
    year: character.year,
    from: oldClub,
    to: newClub,
    reason
  });

  character.club = newClub;
  character.career.clubs.push({
    club: newClub,
    fromAge: character.age,
    fromYear: character.year,
    toAge: null,
    toYear: null,
    reason
  });

  character.relations.coach = randomNumber(48, 65);
  character.football.squadStatus = "Em avaliação";
  character.football.form = "Sem avaliação";
  character.football.positionCompetition = randomNumber(2, 5);

  addHistory(character, "Mudança de clube", `Saiu do ${oldClub} e passou a fazer parte do ${newClub}. Motivo: ${reason}.`, "Futebol");
}

function simulateSeason(character) {
  if (character.club === "Sem clube") {
    const season = {
      age: character.age,
      year: character.year,
      club: "Sem clube",
      position: character.position,
      matches: 0,
      appearances: 0,
      starts: 0,
      minutes: 0,
      rating: 0,
      squadStatus: "Sem clube",
      form: "Sem avaliação",
      yellowCards: 0,
      redCards: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      goalsConceded: 0,
      saves: 0,
      recentMatches: [],
      evaluation: {
        title: "Um ano fora de um elenco",
        text: "Sem clube, sua prioridade passa a ser manter a preparação e encontrar uma nova oportunidade para continuar no futebol organizado."
      }
    };
    character.seasons.push(season);
    character.pendingYear.season = season;
    character.pendingYear.marketOutcome = buildMarketOutcome(character, season);
    saveCharacter(character);
    return season;
  }

  const overall = overallFootballLevel(character);
  const coach = character.relations.coach;
  const discipline = character.personality.discipline;
  const professionalism = character.personality.professionalism;
  const health = character.life.health;
  const competition = character.football.positionCompetition;

  const matches = randomNumber(18, 28);
  let startProbability = 0.24 + (overall - 30) / 100 + (coach - 50) / 190 + (discipline - 50) / 360 - (competition - 2) * 0.025;
  if (health < 75) startProbability -= 0.08;
  startProbability = clamp(startProbability, 0.08, 0.82);

  let subProbability = clamp(0.34 + (professionalism - 50) / 280 + (coach - 50) / 300, 0.18, 0.62);

  const matchLog = [];
  for (let i = 0; i < matches; i += 1) {
    matchLog.push(simulateMatch(character, startProbability, subProbability));
  }

  const played = matchLog.filter(match => match.appeared);
  const starts = played.filter(match => match.started).length;
  const minutes = played.reduce((sum, match) => sum + match.minutes, 0);
  const ratings = played.filter(match => match.rating !== null).map(match => match.rating);
  const rating = ratings.length ? Math.round(average(ratings) * 10) / 10 : 5.8;

  const season = {
    age: character.age,
    year: character.year,
    club: character.club,
    position: character.position,
    matches,
    appearances: played.length,
    starts,
    minutes,
    rating,
    yellowCards: played.reduce((sum, match) => sum + match.yellow, 0),
    redCards: played.reduce((sum, match) => sum + match.red, 0),
    recentMatches: matchLog.slice(-5)
  };

  if (character.position === "Goleiro") {
    season.cleanSheets = played.filter(match => match.conceded === 0 && match.minutes >= 60).length;
    season.goalsConceded = played.reduce((sum, match) => sum + match.conceded, 0);
    season.saves = played.reduce((sum, match) => sum + match.saves, 0);
  } else {
    season.goals = played.reduce((sum, match) => sum + match.goals, 0);
    season.assists = played.reduce((sum, match) => sum + match.assists, 0);
  }

  season.squadStatus = squadStatusFromSeason(season);
  season.form = formLabel(season.rating);
  season.evaluation = buildSeasonEvaluation(character, season);

  let coachChange = 0;
  if (season.rating >= 7.4) coachChange += 6;
  else if (season.rating >= 6.9) coachChange += 3;
  else if (season.rating < 6.2) coachChange -= 5;
  if (season.squadStatus === "Fora dos planos") coachChange -= 4;
  if (character.personality.professionalism >= 70) coachChange += 2;
  character.relations.coach = clamp(character.relations.coach + coachChange);

  const reputationGain =
    season.squadStatus === "Destaque" ? 4 :
    season.rating >= 7.2 ? 2 :
    season.rating >= 6.7 ? 1 : 0;

  character.life.reputation = clamp(character.life.reputation + reputationGain);
  character.life.health = clamp(character.life.health + randomNumber(-4, 2));
  character.life.happiness = clamp(character.life.happiness + (season.squadStatus === "Destaque" ? 4 : season.squadStatus === "Fora dos planos" ? -5 : randomNumber(-2, 2)));

  growPlayer(character, season);

  character.football.squadStatus = season.squadStatus;
  character.football.form = season.form;
  character.football.positionCompetition = clamp(character.football.positionCompetition + randomNumber(-1, 1), 1, 5);

  character.seasons.push(season);
  character.pendingYear.season = season;
  character.pendingYear.marketOutcome = buildMarketOutcome(character, season);

  addHistory(
    character,
    "Fim da temporada",
    `Terminou a temporada com ${season.appearances} jogos, ${season.minutes} minutos e média ${season.rating.toFixed(1)} pelo ${character.club}. Status final: ${season.squadStatus}.`,
    "Futebol"
  );

  saveCharacter(character);
  return season;
}

function completeEventPhase(character) {
  if (!character.pendingYear.season) {
    simulateSeason(character);
  }

  renderYearSummary(character);
}

function matchExtraText(character, match) {
  if (!match.appeared) return "Não utilizado";
  if (character.position === "Goleiro") {
    return `${match.saves || 0} defesas · ${match.conceded || 0} sofrido${match.conceded === 1 ? "" : "s"}`;
  }
  const pieces = [];
  if (match.goals) pieces.push(`${match.goals} gol${match.goals > 1 ? "s" : ""}`);
  if (match.assists) pieces.push(`${match.assists} assist.`);
  return pieces.length ? pieces.join(" · ") : "Sem participação em gol";
}

function renderRecentMatches(character, season) {
  const container = document.getElementById("recentMatches");
  const matches = season.recentMatches || [];

  if (!matches.length) {
    container.innerHTML = `<div class="timeline-item">Nenhuma partida registrada nesta temporada.</div>`;
    return;
  }

  container.innerHTML = matches.map(match => `
    <div class="match-row">
      <div class="match-opponent">x ${match.opponent}</div>
      <div class="match-score">${match.ownGoals}–${match.opponentGoals}</div>
      <div class="match-meta">${match.appeared ? `${match.minutes} min` : "Banco"}</div>
      <div class="match-meta">${match.rating ? `Nota ${Number(match.rating).toFixed(1)}` : "Sem nota"}</div>
      <div class="match-extra">${matchExtraText(character, match)}</div>
    </div>
  `).join("");
}

function marketCopy(character, market) {
  if (!market) return null;
  if (market.type === "trial") {
    return {
      title: `${market.club} quer observar você de perto`,
      text: `Depois da sua temporada, surgiu um convite para participar de uma avaliação no ${market.club}. Ir significa se expor a uma nova oportunidade, mas também mexer na estabilidade que você já possui.`,
      choices: [
        ["accept", `Aceitar a avaliação no ${market.club}`, "Você topa conhecer uma nova realidade."],
        ["stay", `Continuar no ${character.club}`, "Você prefere manter o processo no clube atual."]
      ]
    };
  }
  if (market.type === "interest") {
    return {
      title: `Outro clube entrou no seu caminho`,
      text: `O ${market.club} demonstrou interesse em levar você para a sua categoria de base. A mudança pode abrir portas, mas não existe garantia de mais minutos ou de adaptação imediata.`,
      choices: [
        ["accept", `Aceitar o projeto do ${market.club}`, "Mudar de clube e recomeçar a disputa por espaço."],
        ["stay", `Permanecer no ${character.club}`, "Valorizar a continuidade no clube atual."]
      ]
    };
  }
  if (market.type === "release") {
    return {
      title: `O ${character.club} decidiu liberar você`,
      text: `A comissão informou que você não seguirá no elenco. Sua carreira como jogador não acabou: agora é preciso escolher como reagir a uma das situações mais duras da formação.`,
      choices: [
        ["tryout", `Buscar avaliação no ${market.club}`, "Tentar imediatamente uma nova oportunidade."],
        ["local", "Voltar para um clube menor e continuar jogando", "Reduzir o nível de exposição, mas manter minutos e rotina."],
        ["pause", "Ficar sem clube por enquanto", "Manter os estudos e esperar outra oportunidade."]
      ]
    };
  }
  if (market.type === "tryout") {
    return {
      title: `Uma chance de voltar ao futebol organizado`,
      text: `Depois de um período sem clube, aparece a possibilidade de fazer uma avaliação no ${market.club}.`,
      choices: [
        ["tryout", `Participar da avaliação no ${market.club}`, "Você volta a se colocar à prova."],
        ["pause", "Esperar outra oportunidade", "Você ainda não se sente pronto para essa avaliação."]
      ]
    };
  }
  return null;
}

function resolveMarketDecision(character, decision) {
  const market = character.pendingYear?.marketOutcome;
  if (!market || market.resolved) return;

  let result = "";

  if (["trial", "interest"].includes(market.type)) {
    if (decision === "accept") {
      changeClub(character, market.club, market.type === "trial" ? "Aceitou uma nova oportunidade de avaliação" : "Aceitou o projeto de outro clube");
      result = `Você decidiu mudar o rumo da carreira e agora passa a defender o ${market.club}. A confiança com a nova comissão começa praticamente do zero.`;
    } else {
      character.relations.coach = clamp(character.relations.coach + 2);
      result = `Você decidiu permanecer no ${character.club} e dar continuidade ao trabalho que já vinha construindo.`;
      addHistory(character, "Decisão de carreira", `Recusou uma oportunidade do ${market.club} e permaneceu no ${character.club}.`, "Futebol");
    }
  } else if (market.type === "release") {
    if (decision === "tryout") {
      const chance = clamp(0.48 + character.life.reputation * 0.018 + character.personality.resilience / 300, 0.48, 0.86);
      if (Math.random() < chance) {
        changeClub(character, market.club, "Aprovado em avaliação após ser liberado");
        result = `Você foi aprovado na avaliação e ganhou uma nova oportunidade no ${market.club}. A dispensa ficou para trás, mas agora começa uma nova disputa por espaço.`;
      } else {
        changeClub(character, "Sem clube", "Não foi aprovado na primeira avaliação após a dispensa");
        result = `A avaliação não terminou em aprovação. Você fica sem clube por enquanto, mas sua vida continua e novas oportunidades ainda podem aparecer.`;
      }
    } else if (decision === "local") {
      changeClub(character, "Clube pequeno da cidade", "Buscou minutos e continuidade após uma dispensa");
      result = "Você escolheu reduzir o nível competitivo por um período para continuar jogando, recuperar confiança e reconstruir o caminho.";
    } else {
      changeClub(character, "Sem clube", "Decidiu dar um tempo após uma dispensa");
      result = "Você fica sem clube por enquanto. Escola, família e preparação individual ganham ainda mais importância nessa fase.";
    }
  } else if (market.type === "tryout") {
    if (decision === "tryout") {
      const chance = clamp(0.50 + character.personality.discipline / 350 + character.life.reputation * 0.012, 0.50, 0.82);
      if (Math.random() < chance) {
        changeClub(character, market.club, "Aprovado em avaliação enquanto estava sem clube");
        result = `A avaliação deu certo. Você passa a integrar o ${market.club} e volta ao futebol organizado.`;
      } else {
        result = `Você não foi aprovado desta vez. Continua sem clube, mas acumulou experiência e ainda poderá tentar novamente em outros momentos.`;
        addHistory(character, "Avaliação sem aprovação", `Fez uma avaliação no ${market.club}, mas não foi aprovado.`, "Futebol");
      }
    } else {
      result = "Você decidiu esperar. Continua sem clube por enquanto e mantém a preparação para oportunidades futuras.";
    }
  }

  market.resolved = true;
  market.decision = decision;
  market.resultText = result;
  saveCharacter(character);
  renderYearSummary(character);
}

function renderMarketCard(character) {
  const card = document.getElementById("marketCard");
  const finishButton = document.getElementById("finishYearButton");
  const market = character.pendingYear?.marketOutcome;

  if (!market) {
    card.classList.add("hidden");
    finishButton.classList.remove("hidden");
    return;
  }

  const copy = marketCopy(character, market);
  if (!copy) {
    card.classList.add("hidden");
    finishButton.classList.remove("hidden");
    return;
  }

  card.classList.remove("hidden");
  document.getElementById("marketTitle").textContent = copy.title;
  document.getElementById("marketText").textContent = copy.text;

  const choices = document.getElementById("marketChoices");
  const result = document.getElementById("marketResult");

  if (market.resolved) {
    choices.classList.add("hidden");
    result.classList.remove("hidden");
    result.textContent = market.resultText;
    finishButton.classList.remove("hidden");
  } else {
    choices.classList.remove("hidden");
    result.classList.add("hidden");
    finishButton.classList.add("hidden");
    choices.innerHTML = "";

    copy.choices.forEach(([value, label, hint]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.innerHTML = `<strong>${label}</strong><span>${hint}</span>`;
      button.addEventListener("click", () => resolveMarketDecision(character, value));
      choices.appendChild(button);
    });
  }
}

function renderYearSummary(character) {
  const pending = character.pendingYear;
  const season = normalizeSeason(pending.season);

  document.getElementById("summaryYear").textContent = season.year;
  document.getElementById("summaryTitle").textContent = `${character.name}, ${character.age} anos`;
  document.getElementById("summarySubtitle").textContent = `${season.club} · ${season.position}`;

  const stats = [
    ["PARTIDAS", season.appearances],
    ["TITULAR", season.starts],
    ["MINUTOS", season.minutes],
    ["MÉDIA", season.rating ? Number(season.rating).toFixed(1) : "—"],
    ["STATUS", season.squadStatus]
  ];

  if (season.position === "Goleiro") {
    stats.push(["SEM SOFRER GOL", season.cleanSheets || 0]);
    stats.push(["DEFESAS", season.saves || 0]);
    stats.push(["GOLS SOFRIDOS", season.goalsConceded || 0]);
  } else {
    stats.push(["GOLS", season.goals || 0]);
    stats.push(["ASSISTÊNCIAS", season.assists || 0]);
  }

  document.getElementById("seasonStats").innerHTML = stats
    .map(([label, value]) => `
      <div class="season-stat">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `)
    .join("");

  const evaluation = season.evaluation || buildSeasonEvaluation(character, season);
  document.getElementById("seasonEvaluationTitle").textContent = evaluation.title;
  document.getElementById("seasonEvaluationText").textContent = evaluation.text;
  renderRecentMatches(character, season);

  const highlights = pending.chosenHistory.length
    ? pending.chosenHistory
    : [{ title: "Temporada", text: "Um ano de desenvolvimento e aprendizado." }];

  document.getElementById("yearHighlights").innerHTML = highlights
    .map(item => `
      <div class="timeline-item">
        <strong>${item.title}</strong><br>
        ${item.text}
      </div>
    `)
    .join("");

  document.getElementById("finishYearButton").textContent = `COMPLETAR ${character.age + 1} ANOS`;
  renderMarketCard(character);
  changeScreen("summary");
}

function finishYear(character) {
  const completedAge = character.age;
  const completedYear = character.year;

  character.age += 1;
  character.year += 1;
  character.pendingYear = null;

  addHistory(
    character,
    `${character.age} anos`,
    `Depois de viver o ano de ${completedYear} aos ${completedAge} anos, ${character.name.split(" ")[0]} inicia uma nova etapa da sua história.`,
    "Vida"
  );

  saveCharacter(character);
  renderDashboard(character);
}

/* INICIALIZAÇÃO */

populateSelect("city", cities);
populateSelect("financial", financialOptions);
populateSelect("family", familyOptions);
populateSelect("club", clubs);
populateSelect("position", positions);
populateSelect("foot", feet);

let currentCharacter = loadSave();

if (currentCharacter) {
  document.getElementById("continueButton").classList.remove("hidden");
}

document.getElementById("createCharacterButton").addEventListener("click", () => {
  changeScreen("creator");
});

document.getElementById("randomLifeButton").addEventListener("click", () => {
  randomizeCharacter();
  changeScreen("creator");
});

document.getElementById("randomizeButton").addEventListener("click", randomizeCharacter);

document.getElementById("backButton").addEventListener("click", () => {
  changeScreen("home");
});

document.getElementById("continueButton").addEventListener("click", () => {
  currentCharacter = loadSave();

  if (!currentCharacter) return;

  if (currentCharacter.pendingYear) {
    if (currentCharacter.pendingYear.season) {
      renderYearSummary(currentCharacter);
    } else {
      renderCurrentEvent(currentCharacter);
    }
  } else {
    renderDashboard(currentCharacter);
  }
});

document.getElementById("characterForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("playerName").value.trim();

  if (!name) {
    alert("Digite o nome do personagem.");
    return;
  }

  currentCharacter = createLife();
  renderDashboard(currentCharacter);
});

document.getElementById("resetGameButton").addEventListener("click", () => {
  const confirmed = confirm("Tem certeza que deseja apagar esta vida?");

  if (!confirmed) return;

  localStorage.removeItem(SAVE_KEY);
  location.reload();
});

document.getElementById("nextYearButton").addEventListener("click", () => {
  currentCharacter = loadSave();
  if (currentCharacter) startYear(currentCharacter);
});

document.getElementById("continueEventButton").addEventListener("click", () => {
  currentCharacter = loadSave();
  if (currentCharacter) continueEvent(currentCharacter);
});

document.getElementById("finishYearButton").addEventListener("click", () => {
  currentCharacter = loadSave();
  if (currentCharacter) finishYear(currentCharacter);
});
