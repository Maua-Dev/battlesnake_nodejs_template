// Testes da lógica da sua cobra. Rode com `npm test`.
//
// O `npm test` compila o TypeScript primeiro (script `pretest`) e roda os
// testes já compilados em dist/, usando o test runner que vem no próprio Node.
// Conforme você for implementando os TODOs de src/logic.ts, escreva testes
// novos aqui: eles rodam no GitHub Actions antes de cada deploy.

import test from "node:test";
import assert from "node:assert/strict";

import {
  end,
  info,
  move,
  start,
  Battlesnake,
  Coord,
  Direction,
  GameState,
} from "../src/logic";

import { handler } from "../src/index";

const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

/** Monta um estado de jogo mínimo, com a cobra deitada entre `head` e `neck`. */
function gameState(head: Coord, neck: Coord): GameState {
  const you: Battlesnake = {
    id: "minha-cobra",
    name: "MinhaCobra",
    health: 100,
    body: [head, neck, { x: neck.x, y: neck.y - 1 }],
    head,
    length: 3,
    latency: "50",
    shout: "",
  };

  return {
    game: {
      id: "partida-de-teste",
      ruleset: { name: "standard", version: "v1.2.3" },
      map: "standard",
      timeout: 500,
    },
    turn: 4,
    board: {
      height: 11,
      width: 11,
      food: [{ x: 5, y: 5 }],
      hazards: [],
      snakes: [you],
    },
    you,
  };
}

const ESTADO_PADRAO = gameState({ x: 5, y: 4 }, { x: 4, y: 4 });

// ---------------------------------------------------------------------------
// Lógica pura
// ---------------------------------------------------------------------------

test("info devolve o schema esperado", () => {
  const resposta = info();

  assert.equal(resposta.apiversion, "1");
  assert.equal(typeof resposta.author, "string");
  assert.equal(typeof resposta.color, "string");
  assert.equal(typeof resposta.head, "string");
  assert.equal(typeof resposta.tail, "string");

  // a cor precisa ser um hexadecimal, senão o site do Battlesnake recusa
  assert.match(resposta.color as string, /^#[0-9a-fA-F]{6}$/);
});

test("move devolve sempre uma direção válida", () => {
  for (let i = 0; i < 50; i++) {
    assert.ok(DIRECTIONS.includes(move(ESTADO_PADRAO).move));
  }
});

test("nunca volta por cima do pescoço, nas quatro orientações", () => {
  const casos: Array<[Coord, Direction]> = [
    [{ x: 4, y: 4 }, "left"], // pescoço à esquerda da cabeça
    [{ x: 6, y: 4 }, "right"], // pescoço à direita da cabeça
    [{ x: 5, y: 3 }, "down"], // pescoço abaixo da cabeça
    [{ x: 5, y: 5 }, "up"], // pescoço acima da cabeça
  ];

  for (const [neck, proibida] of casos) {
    const estado = gameState({ x: 5, y: 4 }, neck);

    // O movimento é sorteado, então repetimos para pegar qualquer chance de a
    // direção proibida escapar.
    for (let i = 0; i < 50; i++) {
      const direcao = move(estado).move;

      assert.ok(DIRECTIONS.includes(direcao), `direção inválida: ${direcao}`);
      assert.notEqual(
        direcao,
        proibida,
        `a cobra andou para trás (${proibida}) com o pescoço em (${neck.x},${neck.y})`
      );
    }
  }
});

test("start e end não quebram com um estado de jogo válido", () => {
  assert.doesNotThrow(() => start(ESTADO_PADRAO));
  assert.doesNotThrow(() => end(ESTADO_PADRAO));
});

// ---------------------------------------------------------------------------
// Integração: evento do API Gateway -> serverless-http -> Express -> logic.ts
//
// Protege o middleware normalizador de src/index.ts. Se o caminho chegar com o
// nome do stage na frente ("/dev/move") e o middleware sumir, a requisição cai
// no fallback e devolve os metadados da cobra em vez da jogada.
// ---------------------------------------------------------------------------

/** Monta um evento no formato que o API Gateway REST entrega para a Lambda. */
function apiGatewayEvent(method: string, path: string, body?: unknown) {
  const ehRaiz = path === "/";

  return {
    resource: ehRaiz ? "/" : "/{proxy+}",
    path,
    httpMethod: method,
    headers: { "Content-Type": "application/json" },
    multiValueHeaders: {},
    queryStringParameters: null,
    pathParameters: ehRaiz ? null : { proxy: path.replace(/^\//, "") },
    requestContext: { stage: "dev", path, httpMethod: method },
    body: body === undefined ? null : JSON.stringify(body),
    isBase64Encoded: false,
  };
}

async function chamar(method: string, path: string, body?: unknown) {
  const resposta = (await handler(
    apiGatewayEvent(method, path, body) as never,
    {} as never
  )) as { statusCode: number; body: string };

  return resposta;
}

test("POST /dev/move devolve a jogada, e não os metadados da cobra", async () => {
  const resposta = await chamar("POST", "/dev/move", ESTADO_PADRAO);
  const corpo = JSON.parse(resposta.body);

  assert.equal(resposta.statusCode, 200);
  assert.ok(DIRECTIONS.includes(corpo.move), `direção inválida: ${corpo.move}`);
  assert.equal(
    corpo.apiversion,
    undefined,
    "caiu no fallback de info em vez de responder o movimento"
  );
});

test("GET /dev e /dev/ devolvem os metadados da cobra", async () => {
  for (const rota of ["/dev", "/dev/"]) {
    const resposta = await chamar("GET", rota);

    assert.equal(resposta.statusCode, 200, `${rota} não respondeu 200`);
    assert.equal(JSON.parse(resposta.body).apiversion, "1");
  }
});

test("/dev/start e /dev/end respondem ok", async () => {
  for (const rota of ["/dev/start", "/dev/end"]) {
    const resposta = await chamar("POST", rota, ESTADO_PADRAO);

    assert.equal(resposta.statusCode, 200, `${rota} não respondeu 200`);
    assert.equal(resposta.body, "ok");
  }
});

test("as rotas sem o prefixo do stage continuam funcionando", async () => {
  // O API Gateway REST atual entrega o caminho já sem o stage. O middleware
  // não pode atrapalhar esse caso.
  const jogada = await chamar("POST", "/move", ESTADO_PADRAO);

  assert.equal(jogada.statusCode, 200);
  assert.ok(DIRECTIONS.includes(JSON.parse(jogada.body).move));

  const raiz = await chamar("GET", "/");

  assert.equal(raiz.statusCode, 200);
  assert.equal(JSON.parse(raiz.body).apiversion, "1");
});
