# 🟦 Battlesnake TypeScript Template

Template de [Battlesnake](https://play.battlesnake.com) em **TypeScript**, com
**Express** rodando em **AWS Lambda** com **API Gateway**. O deploy é
automático: você programa, dá push, e o GitHub Actions devolve a URL da sua cobra.

---

## 📦 Pré-requisitos

- **Node.js 20 ou superior** — [nodejs.org/download](https://nodejs.org/en/download)
  Confira com `node --version`.
- Noções básicas de **TypeScript**, **API** e **Lambda**
- **Disposição, competitividade e força de vontade!**

Você **não** precisa instalar Terraform nem AWS CLI: quem cuida do deploy é o CD.

---

## 🚀 Como começar

1. Vá até o repositório [**devmaua_setup**](https://github.com/Maua-Dev/devmaua_setup),
   abra uma **issue** e escolha:
   - **project_name**: `battlesnake_typescript_{seu nome}`
   - **project template**: `battlesnake_nodejs_template`
   - marque o repositório como **público**

2. Aguarde cerca de **1 minuto** e confira em
   [Repositórios da organização](https://github.com/orgs/Maua-Dev/repositories).

3. Clone e instale:
   ```bash
   git clone https://github.com/Maua-Dev/Nome_Do_Seu_Repositorio
   cd Nome_Do_Seu_Repositorio
   npm install
   ```

4. Abra [`src/logic.ts`](src/logic.ts) e comece a programar sua cobra 🐍

> Use **npm**, não yarn. O CD roda `npm ci`, que depende do `package-lock.json`.

---

## 📂 Estrutura do projeto

```
.
├── package.json                # dependências e scripts
├── tsconfig.json               # configuração do compilador
├── src
│   ├── logic.ts                # 👈 É AQUI QUE VOCÊ PROGRAMA
│   ├── index.ts                # rotas Express + handler da Lambda — não precisa mexer
│   └── local.ts                # servidor local — não precisa mexer
├── tests
│   └── logic.test.ts           # testes da sua lógica
├── terraform
│   ├── bootstrap/              # bucket de estado do Terraform
│   └── app/                    # Lambda + API Gateway
└── .github/workflows/CD.yaml   # testes + deploy automático
```

**Você só precisa de `src/logic.ts`.** Os outros arquivos existem para levar o
estado do jogo até as suas quatro funções.

O `npm run build` compila tudo para `dist/`, preservando as pastas:
`src/index.ts` vira `dist/src/index.js`, que é o handler configurado na Lambda.

---

## 🧠 As quatro funções

Todas ficam em `src/logic.ts` e recebem um `GameState` — o tipo está definido no
próprio arquivo, então o editor te avisa se você errar um nome de campo:

| Função | Rota | Quando é chamada | O que devolve |
|---|---|---|---|
| `info()` | `GET /` | ao cadastrar a cobra e no início de cada partida | aparência (cor, cabeça, cauda) |
| `start(gameState)` | `POST /start` | uma vez, no começo da partida | nada |
| `move(gameState)` | `POST /move` | **a cada turno** | `{ move: "up" \| "down" \| "left" \| "right" }` |
| `end(gameState)` | `POST /end` | uma vez, no fim da partida | nada |

A cobra já vem com a lógica que **impede ela de andar para trás**. A partir daí,
os `TODO` em `move()` marcam os próximos passos:

1. não sair do tabuleiro
2. não bater no próprio corpo
3. não bater nas cobras adversárias
4. ir atrás da comida em vez de sortear a direção

Documentação oficial da API: <https://docs.battlesnake.com/api>
Exemplo do JSON recebido: <https://docs.battlesnake.com/api/example-move>

> ⏱️ Você tem cerca de **500 ms** por jogada. Se estourar, o servidor escolhe
> uma direção qualquer por você — normalmente para a morte.

> 🧭 O tabuleiro tem a origem `(0, 0)` no **canto inferior esquerdo**: `x` cresce
> para a direita e `y` cresce para cima.

---

## 🧪 Testando

```bash
npm test
```

O `npm test` compila o TypeScript antes de rodar (script `pretest`) e usa o test
runner que já vem no Node, sem biblioteca extra. O template já vem com testes
que garantem que a sua cobra **sempre devolve uma direção válida** e **nunca
volta por cima do próprio pescoço**, além de testes de integração das rotas.

> 🚨 Os testes rodam no GitHub Actions **antes** do deploy. Se algum falhar, o
> deploy não acontece e a URL da sua cobra não é atualizada.

### Rodando localmente

```bash
npm start
```

Sobe a aplicação em `http://localhost:8000`. Em outro terminal:

```bash
curl http://localhost:8000/
```

Dá para ir além e jogar partidas inteiras contra o seu servidor local com a
[CLI do Battlesnake](https://github.com/BattlesnakeOfficial/rules#installation):

```bash
battlesnake play -W 11 -H 11 --name minha-cobra --url http://localhost:8000 -g solo --browser
```

---

## ☁️ Deploy

O deploy é disparado por push na branch **`dev`**:

```bash
git add .
git commit -m "minha cobra agora desvia das paredes"
git push origin dev
```

O que o CD faz, nessa ordem:

1. **ExecuteTests** — compila o TypeScript e roda os testes
2. **Bootstrap** — garante o bucket S3 que guarda o estado do Terraform
3. **build_node** — compila, reinstala só as dependências de produção e
   empacota `dist/` + `node_modules/` num zip
4. **deploy_app** — `terraform apply`, criando a Lambda e o API Gateway

No fim, o resumo da execução mostra a **URL da sua cobra** e um link para os
logs no CloudWatch. Você também encontra a URL no output `api_url_base` do
passo *Terraform Apply*.

---

## 🎯 Cadastrando no Battlesnake

1. Entre em [play.battlesnake.com](https://play.battlesnake.com)
2. **My Battlesnakes** → **Create Battlesnake**
3. No campo **URL**, cole a URL do deploy
   (algo como `https://abc123.execute-api.us-east-1.amazonaws.com/dev`)
4. Salve e mande ver nos jogos e desafios!

Se o site reclamar da URL, teste antes no terminal:

```bash
curl https://SUA_URL_AQUI/
```

Deve responder o JSON do `info()`.

---

## 📌 Observações

- Toda a lógica da partida vive em `move()`.
- **Evite adicionar dependências pesadas.** Elas vão inteiras para o zip da
  Lambda, que tem limite de 50 MB. O pacote atual usa menos de 1 MB.
- Se instalar algo novo, commite também o `package-lock.json` — é ele que o CD
  usa no `npm ci`.
- Os logs ficam no **CloudWatch**, com retenção de 14 dias. Tudo que você
  escrever com `console.log` aparece lá.
- A branch de deploy é **`dev`**. Push em outras branches roda só os testes.

---

## 🛠 Ferramentas úteis

- [Battlesnake Docs](https://docs.battlesnake.com/) — documentação da API
- [Battlesnake CLI](https://github.com/BattlesnakeOfficial/rules) — jogar partidas locais
- [Express](https://expressjs.com/pt-br/4x/api.html) — o framework das rotas
- [TypeScript](https://www.typescriptlang.org/docs/) — documentação da linguagem
- [Postman](https://www.postman.com/) — testar requisições sem terminal

---

## 📞 Fale com a gente

Dúvidas? Chama no [Discord](https://discord.gg/Yr2VPgAmcb) da Dev. Community Mauá.
