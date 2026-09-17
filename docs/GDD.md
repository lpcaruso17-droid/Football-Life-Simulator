# FOOTBALL LIFE SIMULATOR

## Game Design Document

**Status:** Pré-Alpha  
**Versão em desenvolvimento:** V0.5  
**Plataforma inicial:** Navegador  
**Tecnologia atual:** HTML, CSS e JavaScript Vanilla  
**Persistência atual:** LocalStorage  
**Repositório:** GitHub  
**Distribuição atual:** GitHub Pages

---

# 1. VISÃO DO JOGO

Football Life Simulator é um simulador de vida ambientado no universo do futebol.

O objetivo não é apenas simular uma carreira esportiva.

O jogo acompanha a vida completa de uma pessoa desde a infância, passando por formação esportiva, relações familiares, amizades, escola, carreira, dinheiro, mídia, redes sociais, relacionamentos, patrimônio, aposentadoria e vida pós-carreira.

O futebol é o principal eixo narrativo, mas não é a única parte da experiência.

O personagem pode:

- se tornar um grande jogador;
- construir uma carreira comum;
- atuar apenas em divisões inferiores;
- nunca chegar ao futebol profissional;
- abandonar o esporte ainda jovem;
- retornar ao futebol anos depois;
- seguir outra profissão;
- construir uma carreira pós-jogador;
- envelhecer e viver até a morte.

Não existe uma única condição de vitória.

A experiência é a história construída durante o save.

---

# 2. PRINCÍPIOS FUNDAMENTAIS

## 2.1 O protagonista não é protegido

O jogo nunca deve criar acontecimentos apenas para beneficiar o personagem controlado pelo jogador.

Propostas, títulos, convocações, contratos, oportunidades e sucesso devem resultar da combinação entre:

- atributos;
- desempenho;
- reputação;
- relações;
- contexto;
- mercado;
- decisões;
- estado do mundo;
- sorte.

O personagem pode falhar.

Essa possibilidade é fundamental.

---

## 2.2 A vida continua mesmo quando o futebol dá errado

Ser dispensado não encerra o save.

Não virar profissional não encerra o save.

Uma lesão grave não encerra necessariamente o save.

A aposentadoria não encerra o save.

O personagem continua vivendo.

---

## 2.3 O mundo não existe apenas ao redor do protagonista

Clubes, jogadores NPC, treinadores, dirigentes, empresários, jornalistas e outras pessoas possuem suas próprias trajetórias.

O mundo continua acontecendo mesmo quando o protagonista não está envolvido.

Exemplos:

- clubes conquistam títulos;
- clubes são rebaixados;
- clubes conseguem acessos;
- treinadores são demitidos;
- jogadores NPC mudam de clube;
- jovens NPC viram profissionais;
- jogadores se aposentam;
- treinadores mudam de carreira;
- potências entram em crise;
- clubes menores crescem.

---

## 2.4 O save deve criar memória

A história do mundo deve permanecer registrada.

O jogo deve lembrar:

- clubes defendidos;
- categorias;
- transferências;
- empréstimos;
- contratos;
- títulos;
- acessos;
- rebaixamentos;
- lesões;
- relacionamentos;
- amizades;
- conflitos;
- empresários;
- treinadores;
- companheiros;
- rivais;
- patrimônio;
- acontecimentos importantes;
- partidas históricas;
- convocações;
- títulos de seleção;
- decisões marcantes.

Pessoas importantes podem reaparecer décadas depois.

---

# 3. INSPIRAÇÕES

Football Life Simulator possui inspirações conceituais em jogos de carreira e simuladores de futebol como:

- The Fenômeno;
- Copero;
- El Ídolo;
- Football Manager;
- simuladores de vida narrativa.

Essas referências servem como inspiração de conceitos.

Football Life Simulator deve possuir identidade visual, sistemas e experiência próprios.

Sua principal diferença é integrar:

**simulação de carreira + simulação de vida + mundo persistente.**

---

# 4. INÍCIO DA VIDA

## 4.1 Criação

O jogador poderá escolher manualmente ou sortear:

- nome;
- idade inicial;
- cidade;
- posição;
- pé dominante;
- clube inicial;
- segunda nacionalidade;
- clube do coração.

Também existirá:

**SORTear TUDO**

O botão Sortear Tudo deve gerar toda a identidade inicial automaticamente.

Os sorteios individuais continuam disponíveis.

---

## 4.2 Idade inicial

A experiência padrão começa aos:

**10 anos.**

Também será permitido iniciar em idades posteriores.

No futuro, começar mais velho deverá gerar automaticamente um histórico coerente desde aproximadamente os 10 anos.

---

## 4.3 Nacionalidade

Versão inicial:

- nacionalidade principal brasileira;
- possibilidade de dupla nacionalidade.

A segunda nacionalidade pode ser:

- escolhida;
- sorteada;
- inexistente.

O sorteio não deve obrigatoriamente gerar dupla nacionalidade.

---

## 4.4 Clube do coração

O personagem possuirá um clube de infância.

Ele pode ser:

- escolhido;
- sorteado.

Isso poderá gerar acontecimentos futuros.

Exemplos:

- enfrentar o clube do coração;
- receber proposta dele;
- jogar por um rival;
- marcar contra ele;
- tornar-se ídolo;
- retornar no fim da carreira.

---

# 5. IDENTIDADE DO PERSONAGEM

O personagem possui dados visíveis e dados ocultos.

## Visíveis

- nome;
- idade;
- nacionalidade;
- cidade;
- altura;
- peso;
- posição;
- pé dominante;
- clube;
- categoria;
- atributos técnicos;
- atributos físicos;
- OVR;
- histórico;
- estatísticas;
- reputação pública quando aplicável.

## Ocultos ou parcialmente ocultos

- potencial;
- consistência;
- profissionalismo;
- ambição;
- disciplina;
- ego;
- resiliência;
- adaptabilidade;
- lealdade;
- personalidade;
- tolerância à pressão;
- desenvolvimento futuro.

O próprio jogo poderá revelar pistas desses atributos por meio de:

- treinadores;
- scouts;
- empresários;
- imprensa;
- acontecimentos.

---

# 6. ATRIBUTOS

Os atributos esportivos serão apresentados numericamente.

Escala planejada:

**1 a 99.**

Exemplos:

- velocidade;
- aceleração;
- força;
- resistência;
- passe;
- visão;
- finalização;
- drible;
- marcação;
- posicionamento;
- cabeceio;
- tomada de decisão.

Goleiros possuirão conjunto próprio.

---

# 7. OVERALL

O jogador terá um OVR visível.

O OVR não será uma média simples.

Ele será calculado de acordo com a posição.

Exemplo:

um volante 77 OVR e um atacante 77 OVR podem possuir perfis completamente diferentes.

O OVR representa capacidade atual.

Potencial continuará oculto.

---

# 8. POSIÇÕES

Estrutura inicial:

- goleiro;
- lateral-direito;
- zagueiro;
- lateral-esquerdo;
- volante;
- meio-campista;
- ponta-direita;
- ponta-esquerda;
- centroavante.

Mudanças de posição serão possíveis ao longo da vida.

Uma mudança significativa deve permanecer registrada no histórico.

---

# 9. TEMPO

A principal ação continuará sendo:

**VIVER O ANO**

O jogo não será estruturado rodada por rodada.

Cada ano possuirá fases internas:

1. pré-temporada;
2. início da temporada;
3. meio da temporada;
4. reta final;
5. férias / offseason.

Eventos importantes interrompem o avanço.

Partidas comuns são simuladas automaticamente.

---

# 10. EVENTOS

Os eventos são um dos principais motores narrativos.

Eles devem ser contextuais.

Um evento pode considerar:

- idade;
- clube;
- categoria;
- posição;
- situação financeira;
- relacionamento;
- forma;
- status no elenco;
- escola;
- empresário;
- contrato;
- lesão;
- família;
- reputação;
- popularidade;
- torcida;
- cidade;
- país;
- competição;
- momento da carreira.

---

# 11. REGRAS DOS EVENTOS

Eventos devem possuir memória.

O sistema deve evitar repetição excessiva considerando:

- ID do evento;
- tema;
- pessoas envolvidas;
- período recente;
- situação atual.

Uma pessoa não deve ser escolhida repetidamente quando existem outras alternativas adequadas.

---

## 11.1 Decisões

Eventos de decisão devem possuir pelo menos:

**duas opções relevantes.**

Uma tela com apenas uma opção não é considerada decisão.

Quando existir somente uma consequência possível, ela deverá ser apresentada como:

- notícia;
- mensagem;
- notificação;
- marco.

---

## 11.2 Quantidade

A quantidade de acontecimentos aumenta com a complexidade da vida.

Infância:

aproximadamente 2 a 3 acontecimentos relevantes por ano.

Início da adolescência:

aproximadamente 3 a 4.

Adolescência avançada:

aproximadamente 4 a 6.

Vida adulta:

quantidade variável baseada no contexto.

Um ano pode ser tranquilo.

Mas não deve ser vazio apenas porque o catálogo não possui eventos suficientes.

---

# 12. FAMÍLIA

A família é persistente.

Podem existir:

- pai;
- mãe;
- irmãos;
- posteriormente parceiros;
- filhos;
- outros familiares relevantes.

Familiares possuem:

- idade;
- profissão;
- personalidade;
- relacionamento;
- situação financeira;
- trajetória própria.

---

## 12.1 Vida própria

Familiares podem passar por acontecimentos independentes.

Exemplos:

- emprego;
- desemprego;
- faculdade;
- mudança de cidade;
- dificuldades financeiras;
- conflitos;
- separação;
- novos relacionamentos;
- pedidos de ajuda;
- problemas pessoais;
- conquistas.

---

# 13. AMIZADES

Amigos são NPCs persistentes.

Relacionamentos possuem intensidade e história.

Amigos podem:

- se afastar;
- se aproximar;
- mudar de cidade;
- apoiar;
- gerar conflitos;
- entrar no futebol;
- reaparecer posteriormente.

---

# 14. RELACIONAMENTOS AMOROSOS

Possíveis aproximadamente a partir dos 14 anos.

O sistema poderá evoluir para:

- interesse;
- namoro;
- conflitos;
- término;
- reconciliação;
- casamento;
- filhos;
- vida familiar.

Não existe obrigação de desenvolver relacionamento amoroso.

---

# 15. ESCOLA E EDUCAÇÃO

A escola acompanha a infância e adolescência.

O desempenho escolar pode ser afetado por:

- viagens;
- treinamentos;
- mudança de cidade;
- pressão;
- rotina;
- decisões;
- personalidade.

Educação poderá influenciar possibilidades de vida fora do futebol.

---

# 16. FUTEBOL DE BASE

Categorias principais:

- Sub-11;
- Sub-13;
- Sub-15;
- Sub-17;
- Sub-20;
- Profissional.

Jogadores excepcionais podem avançar mais rapidamente.

Jogadores podem:

- subir de categoria;
- permanecer;
- ser observados;
- perder espaço;
- mudar de posição;
- ser emprestados;
- ser dispensados;
- receber propostas.

---

# 17. COMPETIÇÕES DE BASE

O mundo deverá simular competições de base.

Exemplos brasileiros:

- Copinha;
- Brasileiro Sub-17;
- Brasileiro Sub-20;
- competições estaduais;
- torneios relevantes.

Competições geram:

- campeões;
- estatísticas;
- reputação;
- exposição;
- prêmios;
- scouting.

---

# 18. JOGADOR SEM CLUBE

Ficar sem clube é um estado legítimo da carreira.

Podem ocorrer:

- treinos individuais;
- avaliações;
- testes;
- contatos;
- propostas;
- rejeições;
- períodos longos sem oportunidade;
- perda de condição;
- queda de reputação;
- abandono da carreira.

O jogo não deve entregar automaticamente um novo clube.

---

# 19. MERCADO

Clubes avaliam jogadores com base em:

- capacidade;
- idade;
- potencial percebido;
- desempenho;
- competição;
- reputação;
- empresário;
- exposição;
- necessidade do elenco;
- orçamento;
- scouting;
- oportunidade de mercado.

---

# 20. TRANSFERÊNCIAS

O sistema futuramente permitirá:

- transferência definitiva;
- empréstimo;
- empréstimo com opção;
- retorno de empréstimo;
- jogador livre;
- fim de contrato;
- pré-contrato;
- rescisão;
- troca;
- transferência internacional.

---

# 21. TRANSFERÊNCIAS INTERNACIONAIS DE MENORES

Transferências internacionais precoces devem possuir barreiras e contexto compatíveis com realismo esportivo.

O jogo poderá considerar:

- idade;
- família;
- mudança internacional;
- estrutura do clube;
- nacionalidade;
- situação específica.

A experiência deve permanecer jogável, sem transformar o sistema em exposição jurídica excessiva.

---

# 22. CONTRATOS

Contratos poderão incluir:

- duração;
- salário;
- bolsa;
- luvas;
- bônus;
- bônus por jogos;
- bônus por gols;
- bônus por títulos;
- moradia;
- cláusulas;
- rescisão;
- renovação.

Negociações serão interativas.

O clube poderá:

- aceitar contraproposta;
- melhorar valores;
- manter;
- recusar;
- retirar proposta.

---

# 23. EMPRESÁRIOS E AGÊNCIAS

Empresários são NPCs persistentes.

Possuem características como:

- reputação;
- contatos;
- mercado internacional;
- poder de negociação;
- ética;
- capacidade comercial;
- especialização;
- seletividade.

O jogador poderá:

- receber abordagem;
- aceitar representação;
- recusar;
- trocar empresário;
- romper;
- renovar;
- negociar comissão.

Empresários diferentes podem influenciar a carreira de formas diferentes.

---

# 24. PROFISSIONALIZAÇÃO

Virar profissional não é garantido.

Possíveis marcos:

- treino com profissional;
- primeira convocação;
- primeiro banco;
- estreia;
- primeira titularidade;
- primeiro gol;
- primeiro contrato;
- consolidação;
- reserva;
- perda de espaço.

---

# 25. TEMPORADAS

As partidas comuns são simuladas.

Cada temporada registra:

- jogos;
- titularidades;
- minutos;
- gols;
- assistências;
- cartões;
- notas;
- lesões;
- títulos;
- colocação;
- desempenho individual.

---

# 26. PARTIDAS IMPORTANTES

Partidas relevantes poderão receber experiência especial.

Exemplos:

- estreia;
- clássico;
- final;
- jogo decisivo;
- competição continental;
- seleção;
- jogo contra antigo clube;
- confronto contra clube do coração.

A experiência deverá combinar:

- narrativa;
- decisões;
- momentos interativos;
- futuramente pequenos minigames.

Não será necessário jogar todas as partidas.

---

# 27. LESÕES

Lesões podem possuir impacto real.

Podem envolver:

- dias;
- semanas;
- meses;
- cirurgia;
- recuperação;
- recaída;
- redução temporária;
- perda de atributos;
- perda de posição;
- retorno gradual.

Lesões graves devem ser relativamente raras.

---

# 28. SELEÇÕES

O sistema incluirá:

- seleções de base;
- seleção principal.

Experiência completa:

- convocação;
- concentração;
- hierarquia;
- titularidade;
- banco;
- corte;
- partidas;
- torneios;
- capitão;
- títulos.

---

# 29. COMPETIÇÕES INTERNACIONAIS DE SELEÇÕES

Planejadas:

- Sul-Americano de base;
- Mundial Sub-17;
- Mundial Sub-20;
- Olimpíadas;
- Copa América;
- Copa do Mundo;
- eliminatórias;
- outros torneios relevantes.

---

# 30. MUNDO DOS CLUBES

Clubes reais.

Jogadores e profissionais NPCs fictícios.

A força dos clubes evolui com o tempo.

Um clube tradicional pode entrar em crise.

Um clube menor pode crescer.

O mundo não fica congelado em 2026.

---

# 31. BRASIL

Estrutura planejada:

- Série A;
- Série B;
- Série C;
- Série D;
- competições estaduais;
- Copa do Brasil;
- Supercopa;
- competições de base.

O jogo armazenará:

- campeões;
- acessos;
- rebaixamentos;
- classificações;
- vagas continentais.

---

# 32. COMPETIÇÕES CONTINENTAIS DE CLUBES

Planejadas:

- Libertadores;
- Sul-Americana;
- Champions League;
- Europa League;
- Conference League;
- competições equivalentes quando necessárias;
- Mundial de Clubes.

---

# 33. PAÍSES

Expansão gradual.

Primeiro grupo planejado:

- Brasil;
- Argentina;
- Uruguai;
- Portugal;
- Espanha;
- Inglaterra;
- Itália;
- Alemanha;
- França;
- Holanda;
- Arábia Saudita;
- Estados Unidos;
- México.

Posteriormente outros mercados serão adicionados.

---

# 34. NPCS

O mundo terá jogadores NPC persistentes.

Eles possuem:

- nome;
- idade;
- nacionalidade;
- posição;
- atributos;
- potencial;
- clube;
- carreira;
- personalidade;
- reputação;
- histórico.

Um companheiro da base poderá reaparecer décadas depois.

---

# 35. TREINADORES E DIRIGENTES

Também são NPCs persistentes.

Podem:

- trocar de clube;
- ser promovidos;
- ser demitidos;
- aposentar;
- mudar de função;
- reencontrar o protagonista.

---

# 36. JOGADORES REAIS

Não haverá dependência de um banco completo de jogadores reais.

Clubes e competições serão reais.

Jogadores do universo serão principalmente NPCs fictícios gerados pelo jogo.

Isso permite saves com muitas décadas sem o mundo ficar preso ao elenco real de 2026.

---

# 37. MUNDO DINÂMICO

O mundo continuará simulando independentemente do protagonista.

Cada temporada deverá poder registrar:

- classificações;
- campeões;
- rebaixados;
- promovidos;
- competições continentais;
- premiações;
- transferências importantes;
- mudanças de força dos clubes.

---

# 38. HISTÓRICO MUNDIAL

O jogador poderá consultar temporadas anteriores.

Exemplo:

em 2050 será possível consultar quem venceu o Campeonato Brasileiro de 2032.

---

# 39. TORCIDA

Relacionamento com cada torcida relevante será separado.

Conceito:

**idolatria.**

Pode aumentar ou diminuir por:

- desempenho;
- títulos;
- declarações;
- transferências;
- rivalidades;
- saída conturbada;
- retorno;
- identificação.

Um jogador pode ser:

- respeitado;
- querido;
- ídolo;
- histórico;
- rejeitado.

---

# 40. REPUTAÇÃO

Serão separados pelo menos três conceitos.

## Reputação esportiva

Como o mundo do futebol avalia o jogador.

## Popularidade pública

Fama perante público geral.

## Idolatria

Relação com uma torcida específica.

Esses números não precisam evoluir juntos.

---

# 41. REDES SOCIAIS

O jogo terá uma rede social fictícia própria.

Ela será uma tela interativa.

Recursos planejados:

- perfil;
- seguidores;
- posts;
- histórico;
- comentários;
- mensagens privadas;
- viralizações;
- críticas;
- fãs;
- interação com jogadores;
- patrocinadores;
- crises.

O personagem poderá:

- publicar manualmente;
- receber eventos;
- responder situações.

---

# 42. MÍDIA

Existirão:

- jornalistas;
- notícias;
- entrevistas;
- rumores;
- comentários;
- imprensa esportiva.

A mídia pode influenciar:

- popularidade;
- reputação;
- torcida;
- treinador;
- clube;
- mercado.

---

# 43. CENTRAL DE MENSAGENS

A Caixa de Entrada evoluirá para uma central.

Categorias:

- Família;
- Clube;
- Empresário;
- Contratos;
- Social.

Mensagens relevantes possuirão alerta destacado.

Uma proposta importante não deve ficar escondida em um pequeno contador.

---

# 44. DINHEIRO

Finanças fazem parte da vida.

O dinheiro não será apenas um número.

O personagem poderá utilizar seus recursos.

---

# 45. COMPRAS

Planejadas:

- celulares;
- roupas;
- relógios;
- carros;
- imóveis;
- aluguel;
- viagens;
- presentes;
- ajuda familiar.

---

# 46. SERVIÇOS PESSOAIS

Possíveis:

- personal trainer;
- nutricionista;
- fisioterapeuta;
- assessor;
- segurança;
- outros profissionais.

Esses serviços terão custos recorrentes e possíveis benefícios.

---

# 47. PATRIMÔNIO

O jogo poderá registrar:

- dinheiro;
- veículos;
- imóveis;
- investimentos;
- empresas;
- dívidas;
- patrimônio líquido.

---

# 48. DÍVIDAS

Será possível administrar mal o dinheiro.

Exemplos:

- financiamentos;
- despesas elevadas;
- manutenção;
- dívidas;
- padrão de vida incompatível;
- perda patrimonial.

Um jogador pode ter recebido altos salários e terminar a carreira em situação financeira ruim.

---

# 49. INVESTIMENTOS

Sistema progressivo.

Planejado:

- aplicações simples;
- imóveis;
- negócios;
- empresas;
- outros investimentos.

Investimentos possuem risco.

---

# 50. ESTILO DE VIDA

O padrão de vida gera consequências.

Exemplos:

- festas;
- consumo;
- família pedindo ajuda;
- viagens;
- exposição;
- mídia;
- segurança;
- pressão financeira.

---

# 51. PRÊMIOS

Além de títulos coletivos, existirão prêmios individuais.

Exemplos:

- melhor jovem;
- artilheiro;
- melhor jogador;
- seleção do campeonato;
- prêmio continental;
- prêmio mundial.

---

# 52. PÓS-CARREIRA

A aposentadoria como jogador não encerra o jogo.

Possíveis caminhos:

- treinador;
- empresário;
- scout;
- diretor;
- jornalista;
- comentarista;
- apresentador;
- investidor;
- proprietário;
- profissão fora do futebol.

Esses caminhos dependerão das escolhas feitas durante a vida.

Não serão simplesmente menus disponíveis sem contexto.

---

# 53. ENVELHECIMENTO

O personagem continua envelhecendo após deixar o futebol.

A vida pode incluir:

- família;
- patrimônio;
- novas profissões;
- relações;
- saúde;
- legado.

---

# 54. MORTE

A morte encerra definitivamente a vida daquele personagem.

Pode ocorrer por:

- idade;
- situações raras;
- acontecimentos compatíveis com o sistema futuro.

Não existe rollback após a morte.

---

# 55. LEGADO

Ao final da vida, será gerada uma página completa.

Ela poderá incluir:

- idade;
- clubes;
- temporadas;
- partidas;
- gols;
- assistências;
- títulos;
- seleções;
- prêmios;
- patrimônio;
- família;
- relações;
- recordes;
- reputação;
- idolatria;
- carreira pós-jogador;
- principais acontecimentos.

Também será gerada uma biografia automática.

---

# 56. SAVE

O jogo possui múltiplos saves locais.

Princípios:

- autosave;
- save manual;
- sem sistema oficial de rollback;
- decisões importantes persistem.

Futuramente poderá existir persistência mais avançada.

---

# 57. INTERFACE

Identidade principal atual:

- preto;
- cinza;
- branco;
- verde-limão / neon.

Direção:

- premium;
- esportiva;
- moderna;
- alta legibilidade.

A interface deverá evoluir de simples cards para um verdadeiro painel de simulador.

---

# 58. NAVEGAÇÃO PRINCIPAL FUTURA

Estrutura planejada:

- Vida;
- Carreira;
- Futebol;
- Relações;
- Finanças;
- Mundo;
- Histórico.

Também existirão:

- Central de Mensagens;
- Feed;
- Perfil Social;
- Calendário;
- Notícias.

---

# 59. FILOSOFIA DE DESENVOLVIMENTO

Sistemas devem ser construídos de forma modular.

Evitar lógica importante dentro da interface.

A UI apresenta dados.

Os sistemas processam dados.

Os dados persistem no GameState.

---

# 60. REGRA DE QUALIDADE

Antes de uma funcionalidade ser considerada concluída:

1. precisa funcionar;
2. precisa persistir;
3. precisa respeitar contexto;
4. precisa ser testada;
5. não pode contradizer sistemas existentes;
6. precisa gerar consequência real quando aplicável.

---

# 61. OBJETIVO DA V1.0

A V1.0 deverá permitir que um jogador:

- comece criança;
- desenvolva vida própria;
- jogue ou não futebol profissional;
- tenha família;
- faça amigos;
- tenha relacionamentos;
- estude;
- ganhe e gaste dinheiro;
- construa patrimônio;
- interaja com mídia;
- use rede social;
- tenha empresário;
- negocie contratos;
- mude de clubes;
- jogue em outros países;
- represente seleções;
- conquiste títulos;
- tenha lesões;
- envelheça;
- encerre carreira;
- siga nova profissão;
- viva até a morte;
- receba ao final o legado completo daquela vida.

O objetivo não é garantir uma história extraordinária.

O objetivo é permitir uma história única.