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

  const character = {
    version: 2,
    name: document.getElementById("playerName").value.trim(),
    age: 10,
    year: currentYear,
    city: document.getElementById("city").value,
    financial: document.getElementById("financial").value,
    family: document.getElementById("family").value,
    club: document.getElementById("club").value,
    position,
    foot: document.getElementById("foot").value,

    hiddenPotential: randomNumber(60, 96),

    personality: {
      discipline: randomNumber(35, 90),
      ambition: randomNumber(35, 95),
      resilience: randomNumber(30, 95),
      professionalism: randomNumber(25, 90),
      sociability: randomNumber(30, 90)
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

    attributes: createAttributes(position),

    seasons: [],

    history: [
      {
        age: 10,
        year: currentYear,
        category: "Vida",
        title: "O começo",
        description: `Começou sua jornada no futebol pelo ${document.getElementById("club").value}.`
      }
    ],

    pendingYear: null
  };

  saveCharacter(character);
  return character;
}

function migrateSave(character) {
  if (!character) return null;

  character.version = 2;
  character.personality ||= {};
  character.life ||= {};
  character.relations ||= {};
  character.seasons ||= [];
  character.history ||= [];
  character.pendingYear ||= null;

  const personalityDefaults = {
    discipline: 55,
    ambition: 55,
    resilience: 55,
    professionalism: 50,
    sociability: 55
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
        action: c => improveRandomAttributes(c, "mental", 2, 3),
        history: "Aceitou experimentar uma nova posição sugerida pelo treinador."
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
      season: null
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

function growPlayer(character) {
  const potentialGap = Math.max(0, character.hiddenPotential - overallFootballLevel(character));
  const disciplineFactor = character.personality.discipline / 100;
  const professionalFactor = character.personality.professionalism / 100;

  let growthPoints = 2;

  if (potentialGap > 35) growthPoints += 2;
  if (disciplineFactor > 0.65) growthPoints += 1;
  if (professionalFactor > 0.65) growthPoints += 1;

  const groupKeys = Object.keys(character.attributes);

  for (let i = 0; i < growthPoints; i += 1) {
    const group = randomItem(groupKeys);
    improveRandomAttributes(character, group, 1, randomNumber(1, 2));
  }
}

function simulateSeason(character) {
  const overall = overallFootballLevel(character);
  const coach = character.relations.coach;
  const discipline = character.personality.discipline;
  const health = character.life.health;

  const matches = randomNumber(14, 24);

  let startChance =
    0.30 +
    (overall - 30) / 100 +
    (coach - 50) / 220 +
    (discipline - 50) / 300;

  startChance = clamp(startChance, 0.20, 0.88);

  const starts = Math.min(matches, Math.round(matches * startChance));
  const subApps = Math.max(0, randomNumber(0, Math.max(1, matches - starts)));
  const appearances = Math.min(matches, starts + subApps);

  let rating =
    5.8 +
    (overall - 30) / 25 +
    (coach - 50) / 90 +
    randomNumber(-4, 6) / 10;

  if (health < 75) rating -= 0.25;

  rating = clamp(rating, 5.5, 8.8);
  rating = Math.round(rating * 10) / 10;

  const season = {
    age: character.age,
    year: character.year,
    club: character.club,
    position: character.position,
    matches,
    appearances,
    starts,
    rating
  };

  if (character.position === "Goleiro") {
    const cleanSheetRate = clamp(0.15 + (overall - 30) / 120, 0.12, 0.55);
    season.cleanSheets = Math.min(appearances, Math.round(appearances * cleanSheetRate));
    season.goalsConceded = Math.max(0, Math.round(appearances * clamp(1.7 - overall / 70, 0.5, 1.7)));
  } else {
    const attackingPositions = ["Ponta Direita", "Ponta Esquerda", "Centroavante", "Meia"];
    const midfieldPositions = ["Volante", "Lateral Direito", "Lateral Esquerdo"];

    let goalRate = 0.04;
    let assistRate = 0.05;

    if (attackingPositions.includes(character.position)) {
      goalRate = character.position === "Centroavante" ? 0.36 : 0.22;
      assistRate = character.position === "Meia" ? 0.28 : 0.18;
    } else if (midfieldPositions.includes(character.position)) {
      goalRate = 0.08;
      assistRate = 0.14;
    }

    season.goals = Math.max(0, Math.round(appearances * goalRate * (0.75 + overall / 120)));
    season.assists = Math.max(0, Math.round(appearances * assistRate * (0.75 + overall / 120)));
  }

  const reputationGain =
    rating >= 7.5 ? 3 :
    rating >= 7.0 ? 2 :
    rating >= 6.5 ? 1 : 0;

  character.life.reputation = clamp(character.life.reputation + reputationGain);
  character.life.health = clamp(character.life.health + randomNumber(-3, 2));
  character.life.happiness = clamp(character.life.happiness + randomNumber(-2, 3));

  growPlayer(character);

  character.seasons.push(season);
  character.pendingYear.season = season;

  addHistory(
    character,
    "Fim da temporada",
    `Terminou a temporada com ${appearances} partidas e média ${rating.toFixed(1)} pelo ${character.club}.`,
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

function renderYearSummary(character) {
  const pending = character.pendingYear;
  const season = pending.season;

  document.getElementById("summaryYear").textContent = season.year;
  document.getElementById("summaryTitle").textContent =
    `${character.name}, ${character.age} anos`;

  document.getElementById("summarySubtitle").textContent =
    `${character.club} · ${character.position}`;

  const stats = [
    ["PARTIDAS", season.appearances],
    ["TITULAR", season.starts],
    ["MÉDIA", season.rating.toFixed(1)]
  ];

  if (character.position === "Goleiro") {
    stats.push(["JOGOS SEM SOFRER GOL", season.cleanSheets]);
    stats.push(["GOLS SOFRIDOS", season.goalsConceded]);
  } else {
    stats.push(["GOLS", season.goals]);
    stats.push(["ASSISTÊNCIAS", season.assists]);
  }

  document.getElementById("seasonStats").innerHTML = stats
    .map(([label, value]) => `
      <div class="season-stat">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `)
    .join("");

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

  document.getElementById("finishYearButton").textContent =
    `COMPLETAR ${character.age + 1} ANOS`;

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
