// Bem-vindo ao
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// ESTE É O ARQUIVO QUE VOCÊ VAI EDITAR. Todo o resto do projeto existe
// só para levar o estado do jogo até as quatro funções abaixo.
//
// Para começar, já deixamos pronta a lógica que impede a sua cobra de andar
// para trás (ela morreria na hora). Os TODOs marcam os próximos passos.
// Documentação: https://docs.battlesnake.com

// ---------------------------------------------------------------------------
// Tipos da API do Battlesnake (https://docs.battlesnake.com/api)
//
// Vale a pena ler: é o mapa completo de tudo que a sua cobra enxerga a cada
// turno. Com eles, o editor te avisa se você digitar `you.hed` por engano.
// ---------------------------------------------------------------------------

/** Uma posição no tabuleiro. A origem (0, 0) fica no canto inferior esquerdo. */
export interface Coord {
  x: number;
  y: number;
}

/** Uma cobra em jogo — pode ser a sua (`GameState.you`) ou uma adversária. */
export interface Battlesnake {
  id: string;
  name: string;
  /** Vai de 0 a 100. Chegou a 0, a cobra morre de fome. */
  health: number;
  /** Corpo inteiro, da cabeça (índice 0) até a cauda (último índice). */
  body: Coord[];
  head: Coord;
  length: number;
  latency?: string;
  shout?: string;
  customizations?: Customizations;
}

export interface Customizations {
  color: string;
  head: string;
  tail: string;
}

/** O tabuleiro no turno atual. */
export interface Board {
  height: number;
  width: number;
  /** Comidas disponíveis. Comer devolve a vida para 100 e aumenta o corpo em 1. */
  food: Coord[];
  /** Casas perigosas (só aparecem em alguns modos de jogo). */
  hazards: Coord[];
  /** Todas as cobras vivas, incluindo a sua. */
  snakes: Battlesnake[];
}

export interface RulesetSettings {
  foodSpawnChance: number;
  minimumFood: number;
  hazardDamagePerTurn: number;
}

export interface Ruleset {
  name: string;
  version: string;
  settings?: RulesetSettings;
}

/** Metadados da partida. */
export interface Game {
  id: string;
  ruleset: Ruleset;
  map?: string;
  source?: string;
  /** Tempo máximo, em milissegundos, para responder o /move. */
  timeout: number;
}

/** O pacote completo que chega em /start, /move e /end. */
export interface GameState {
  game: Game;
  turn: number;
  board: Board;
  you: Battlesnake;
}

export interface InfoResponse {
  apiversion: string;
  author?: string;
  color?: string;
  head?: string;
  tail?: string;
  version?: string;
}

export type Direction = "up" | "down" | "left" | "right";

export interface MoveResponse {
  move: Direction;
  shout?: string;
}

// ---------------------------------------------------------------------------
// As quatro funções da sua cobra
// ---------------------------------------------------------------------------

/**
 * GET / — chamado quando você cadastra a cobra no site e a cada partida.
 * Controla a aparência dela. Opções de cabeça, cauda e cor:
 * https://docs.battlesnake.com/guides/customizations
 */
export function info(): InfoResponse {
  console.log("INFO");

  return {
    apiversion: "1",
    author: "", // TODO: coloque aqui o SEU usuário do Battlesnake
    color: "#8B0000", // TODO: escolha a cor da sua cobra
    head: "tiger-king", // TODO: escolha a cabeça
    tail: "hook", // TODO: escolha a cauda
    version: "1.0.0",
  };
}

/** POST /start — chamado uma vez, quando a partida começa. */
export function start(gameState: GameState): void {
  console.log(`JOGO COMEÇOU (partida ${gameState.game.id})`);
}

/** POST /end — chamado uma vez, quando a partida termina. */
export function end(gameState: GameState): void {
  console.log(`FIM DE JOGO após ${gameState.turn} turnos`);
}

/**
 * POST /move — chamado a cada turno. Aqui mora a inteligência da sua cobra.
 * Exemplo do JSON recebido: https://docs.battlesnake.com/api/example-move
 */
export function move(gameState: GameState): MoveResponse {
  const isMoveSafe: Record<Direction, boolean> = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  // --- Impedir que a cobra ande para trás (já implementado) ---
  // O pescoço é a parte do corpo logo atrás da cabeça. Voltar por cima dele
  // é morte certa, então marcamos aquela direção como insegura.
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  if (myNeck.x < myHead.x) {
    // pescoço à esquerda da cabeça -> não vá para a esquerda
    isMoveSafe.left = false;
  } else if (myNeck.x > myHead.x) {
    // pescoço à direita da cabeça -> não vá para a direita
    isMoveSafe.right = false;
  } else if (myNeck.y < myHead.y) {
    // pescoço abaixo da cabeça -> não desça
    isMoveSafe.down = false;
  } else if (myNeck.y > myHead.y) {
    // pescoço acima da cabeça -> não suba
    isMoveSafe.up = false;
  }

  // TODO: Passo 1 — impedir que a cobra saia do tabuleiro
  // const boardWidth = gameState.board.width;
  // const boardHeight = gameState.board.height;

  // TODO: Passo 2 — impedir que a cobra bata no próprio corpo
  // const myBody = gameState.you.body;

  // TODO: Passo 3 — impedir que a cobra bata nas adversárias
  // const opponents = gameState.board.snakes;

  // Sobrou alguma direção segura?
  const safeMoves = (Object.keys(isMoveSafe) as Direction[]).filter(
    (direction) => isMoveSafe[direction]
  );

  if (safeMoves.length === 0) {
    console.log(`MOVE ${gameState.turn}: sem saída! descendo`);
    return { move: "down" };
  }

  // Escolhe uma direção segura ao acaso.
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

  // TODO: Passo 4 — ir atrás da comida em vez de sortear, para não morrer de fome
  // const food = gameState.board.food;

  console.log(`MOVE ${gameState.turn}: ${nextMove}`);
  return { move: nextMove };
}
