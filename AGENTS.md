# AGENTS.md: Offline Tools

Guia para agentes de IA que trabalham neste repositório. Leia este arquivo antes de implementar mudanças.

## Visão geral

**Offline Tools** é uma SPA React 19 + TypeScript + Vite, 100% client-side, com ferramentas de criptografia e Bitcoin (BIP39) para uso em máquina offline / air-gapped, inclusive Tails via `file://`.

Não há backend, chamadas de rede nem estado global. O risco principal do produto é uma ferramenta produzir saída criptográfica errada sem avisar, ou vazar segredo localmente. Boa parte das regras abaixo existe para impedir isso.

## Princípios inegociáveis

- **Local-only**: proibido `fetch` para fora, analytics, telemetria ou envio de dados. A CSP (`connect-src 'self' data:`) injetada no build faz o navegador bloquear qualquer conexão com terceiros; um teste e2e prova isso.
- **Client-side**: todo processamento criptográfico roda no browser.
- **Offline-first**: hash routing em `file://`/`content://` (`src/modules/navigation/router.tsx`); build single-file via `pnpm build:single`.
- **Crypto só por ports**: `crypto.getRandomValues` e `crypto.subtle` só em `src/shared/infra/crypto/` (lint em `error`). O resto recebe `RandomPort` / `DigestPort` por injeção.
- **Correção verificável**: toda primitiva cripto tem vetores oficiais nos testes e um self-test que roda antes da ferramenta abrir.
- **Polyfills**: `Buffer` e `setimmediate` são necessários para as libs Bitcoin (`src/main.tsx`, `vite.config.ts`).

## Estrutura

Princípios do vault aplicados: Clean Architecture por módulos, lib por capability, presentation via fachadas, design system nos globais.

```
src/
├── main.tsx
├── global.css                    # Tailwind v4 + tokens (7 tons + índigo)
├── shared/
│   ├── application/use-case.ts   # base UseCase<TCommand, TResult>
│   ├── domain/                   # tools (ToolId, Sensitivity), crypto ports, qr port
│   ├── infra/                    # crypto (Web Crypto, RNG sequencial de teste), qr (qrcode)
│   ├── lib/                      # bytes, base64, entropy (mouse, quality), qr facade
│   └── presentation/
│       ├── components/ui/        # kit shadcn + Stepper, EmptyState, ErrorPanel, SecretField...
│       ├── components/           # Card, Highlight, PrivacyDisclaimer, SelfTestGate, OnlineNotice...
│       ├── hooks/ layouts/ providers/ svg/ lib/utils.ts
│       └── tools/tool-registry.ts  # fonte única das ferramentas
└── modules/
    ├── navigation/               # routes/, lib/ (page-loader, self-tests, site), presentation/
    ├── tools/  lp/               # só presentation (catálogo, landing)
    └── {ferramenta}/             # camadas abaixo
```

### Layout de módulo

```
modules/{ferramenta}/
├── domain/<capability>/          # tipos, conjuntos fechados (const + tipo derivado), ports, erros tipados
├── application/                  # <acao>.use-case.ts (classe *UseCase, deps via Pick<Port, ...>)
│                                 # <modulo>.factory.ts (composition root), run-self-test.use-case.ts
├── infra/<capability>/           # adapters de libs externas (openpgp, html5-qrcode, secp256k1...)
├── lib/<capability>/index.ts     # fachada pública + lógica pura + testes colocados
├── presentation/
│   ├── screens/<nome>.screen.tsx # dono da rota, export *Screen
│   ├── hooks/<slug>.ts           # sem prefixo use- no arquivo; export useXxx
│   └── components/<capability>/  # UI por fluxo, import deep
└── README.md
```

Regras de fronteira (lint):

1. `presentation/**` nunca importa `infra/**` nem libs de I/O (`bitcoinjs-lib`, `bip32`, `bip38`, `bip39`, `bs58`, `ecpair`, `openpgp`, `qrcode`, `html5-qrcode`, `tiny-secp256k1`, `md5`, `@noble/hashes/*`).
2. `domain/**` não importa React, libs de I/O, `infra` nem `presentation`.
3. Hooks chamam `make*UseCase()` da factory ou a fachada `lib/<capability>`; nunca `infra`.
4. Módulos não importam outros módulos. Exceções: `navigation` (composition root de rotas e self-tests) e `lp` (lê o registry e a fachada de digest para o preview).
5. Bitcoin: `BitcoinNetwork` (domínio) é cópia estrutural do `Network` do bitcoinjs; use-o em vez de importar a lib.

## Stack

| Camada          | Tecnologia                                                                       |
| --------------- | -------------------------------------------------------------------------------- |
| UI              | React 19, Tailwind CSS v4, shadcn/ui (Radix), Geist + Geist Mono (`@fontsource`) |
| Build           | Vite 7, TypeScript 5.9 (strict)                                                  |
| Roteamento      | TanStack Router v1 (manual, lazy; eager no single-file)                          |
| Testes          | Vitest 4 (`node`), fast-check, Playwright (Chrome instalado)                     |
| Package manager | pnpm                                                                             |

### Aliases

| Alias | Caminho                                                                |
| ----- | ---------------------------------------------------------------------- |
| `@/`  | `src/`                                                                 |
| `$/`  | `src/shared/presentation/` (kit: `$/components/ui/...`, `$/lib/utils`) |

Ordem de imports: `react`, pacotes externos, `@/shared/...`, `@/modules/...`, `@/...`, `$/...`, relativos (`.prettierrc.json`). Rodar `pnpm prettier:fix` após editar.

## Segurança na UI

- Campo que recebe ou mostra segredo (seed, passphrase, share, entropia, senha, texto claro): `SecretInput` / `SecretTextarea` (`$/components/ui/secret-field`).
- Copiar segredo: `<CopyButton secret />` (limpa o clipboard após 30 s ou no unmount, se ainda contiver o valor).
- Segredo vive só em estado de componente/hook da rota; nada em `localStorage` (só o tema) nem em cache de módulo.
- Ferramenta com `sensitivity: 'secret'` no registry ganha o `OnlineNotice` e o `PrivacyDisclaimer`.
- Saída gerada é verificada antes de exibir (verify-after-generate): Shamir abre com M e não com M-1, paper wallet confere WIF e BIP38 contra o endereço, mnemônico tem checksum válido.
- QR impresso ou escaneado é sempre preto no branco (`DEFAULT_QR_OPTIONS`).
- Salvar segredo em arquivo: `SecretDownloadButton` (confirma antes; nome do arquivo é função, avaliada no clique). Download não secreto: `downloadText`/`downloadBlob` (`$/lib/download`).
- Segredo exibido começa mascarado (`•••`) com `RevealToggle`; copiar funciona mesmo mascarado.

## Linguagem de UI

- O layout de ferramentas renderiza título, descrição e a faixa `ToolStatus` (self-test, online/offline, runs locally) e, abaixo da tela, o `ToolGuide`. A tela não repete título, aviso de privacidade nem "como usar".
- Uma superfície por tela: um `Card`; grupos internos são `FormSection` (sem borda), separados por espaço. Valores e saídas ficam em poço `bg-surface-inset`, sem borda. Nada de Card dentro de Card.
- Opções secundárias em `AdvancedOptions`; detalhes técnicos em `Disclosure`.
- Tabs planas (contorno hairline, preenchimento tonal no ativo, pixel aceso), sem sombra.
- Tokens: `surface-inset`, `card-edge`, `shadow-card` (realce de 1px), tipos `text-title`/`text-heading`/`text-label` (registrados no `cn`).
- Texto em sentence case (botões, labels, títulos, alertas); siglas e nomes próprios mantêm a grafia.

## Roteamento

Rotas manuais em `src/modules/navigation/routes/`, registradas em `router.tsx`. As telas são carregadas por `pageComponent('/src/modules/x/presentation/screens/x.screen.tsx', 'XScreen')`, que é lazy no build normal e eager no single-file (alias no `vite.config.ts`, evita o erro de TDZ com o top-level await do WASM).

`defaultErrorComponent` (`RouteErrorFallback`) renderiza dentro do layout atual; 404 de ferramenta (`ToolNotFound`) fica dentro do shell de ferramentas; 404 geral (`PageNotFound`) traz navbar e rodapé.

O layout de ferramentas descobre a ferramenta pelo registry e envolve a tela com `SelfTestGate` (mapa em `navigation/lib/self-tests.ts`).

## Ferramentas

| Módulo               | Rotas                                                                                       | Foco                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `hash-tool`          | `/tools/hash`                                                                               | SHA-256, SHA-512, MD5 (texto, arquivo, câmera), verificação de checksum |
| `encryption-tool`    | `/tools/encryption`                                                                         | OpenPGP com senha (texto e arquivos)                                    |
| `shamir-tool`        | `/tools/shamir`                                                                             | encrypt-then-Shamir M-de-N, shares v3 (AES-256-GCM), leitura de v2      |
| `password-generator` | `/tools/password-generator`                                                                 | senhas do CSPRNG + entropia do mouse                                    |
| `bip39-tool`         | `/tools/seed-generation`, `seed-validation`, `wallet-recovery`, `paper-wallet`, `tiny-seed` | BIP39, BIP32/44/49/84, BIP38, paper wallet                              |
| `qr-code`            | `/tools/qr-code`                                                                            | gerar e ler QR (travessia do air gap)                                   |

## Testes

- Vitest em `node`, testes colocados (`*.test.ts`) em `lib/`, `application/` e `shared/`. Não testar componentes React.
- **Vetores oficiais**: `bip39-tool/domain/vectors/official-vectors.ts` é gerado por script a partir de trezor/python-mnemonic e dos BIPs 32/38/49/84. Não editar à mão. Os mesmos vetores alimentam o self-test.
- **Propriedades** (fast-check): Shamir, mnemônico, base64, bytes, senha, OpenPGP.
- **Falhas conhecidas** ficam documentadas com `it.fails` e comentário `KNOWN BUG`; vire para `it` quando corrigir.
- **Smoke e2e** (Playwright, `e2e/`): toda rota do registry nos três builds (preview, estático tipo Vercel, single-file), self-test aprovado, 404, redirects, descarte de segredo, quiz de backup obrigatório e bloqueio de rede pela CSP.

```bash
pnpm test:run          # unit
pnpm test:e2e          # build normal + vite preview
pnpm test:e2e:single   # single-file em file://
pnpm test:e2e:static   # páginas estáticas, 404, redirects e headers
```

## CI, PRs e releases

- Mudanças entram em `main` por PR com o check `ci` verde (`.github/workflows/ci.yml`: lint, tsc, testes, build + e2e preview/static, build single + e2e single). A Vercel builda preview em todo PR, mas produção só em commit de release (`scripts/vercel-ignore-build.sh`, `ignoreCommand` no `vercel.json`).
- Reproduza o CI localmente com os mesmos comandos, na mesma ordem.
- Release: rode a action manual **Prepare release** (`patch`, `minor` ou `major`). Ela abre o PR `release/vX.Y.Z` com o bump do `package.json` (`scripts/next-version.mjs`) e o changelog desde a última tag. O merge desse PR é o único gatilho: o CI roda em `main`, o `release.yml` (via `workflow_run`) vê que a versão subiu, builda duas vezes e compara os hashes, gera a atestação de proveniência e publica a tag e a release com `SHA256SUMS`; a Vercel faz o deploy de produção. Não suba a versão à mão nem crie tags. Para repetir uma release que falhou, rode o `release.yml` manualmente.
- O build precisa continuar reproduzível: nada de data/hora de build no bundle (use a data do commit).

## Checklist: nova ferramenta

1. Adicionar o id em `TOOL_IDS` (`shared/domain/tools.ts`) e a entrada no registry (`shared/presentation/tools/tool-registry.ts`): categoria, ícone Lucide, `summary`, `description`, `sensitivity`, `related`.
2. Criar o módulo com as camadas acima: `domain` → `lib` (com testes) → `application` (use cases + factory) → `presentation`.
3. Crypto/aleatoriedade só via ports; libs externas atrás de `infra/` + fachada `lib/`.
4. Vetores oficiais nos testes e `run-self-test.use-case.ts`; registrar em `navigation/lib/self-tests.ts`.
5. Rota em `navigation/routes/` com `pageComponent(...)` e registro em `router.tsx`.
6. `SecretInput`/`SecretTextarea` e `CopyButton secret` onde houver segredo.
7. `README.md` do módulo.
8. Validar: `pnpm lint`, `pnpm test:run`, `pnpm build`, `pnpm test:e2e`, `pnpm test:e2e:single`.
9. Nunca introduzir dependência que exija rede em runtime.

## Comandos

| Comando                           | Descrição                                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                        | Servidor de desenvolvimento                                                                                                        |
| `pnpm build`                      | Type-check + build com CSP → `dist/`                                                                                               |
| `pnpm build:single`               | HTML único autocontido (USB/offline)                                                                                               |
| `pnpm release`                    | Checagens + `scripts/build-release.sh`: `offline-tools-vX.Y.Z.html`, `-site.zip` e `SHA256SUMS` em `release/` (build reproduzível) |
| `pnpm test:coverage`              | Testes com cobertura (v8)                                                                                                          |
| `pnpm lint` / `pnpm prettier:fix` | ESLint (fronteiras incluídas) / formatação                                                                                         |

## Armadilhas conhecidas

- **Shamir**: shares novos são v3 (AES-256-GCM; resultado válido só com tag verificada; checksum por share). Os vetores congelados em `shamir-tool/domain/vectors/` representam shares guardados offline: nunca regenerar. O v2 (byte mágico, ~1/256 com M-1) segue só para leitura, com `it.fails` documentando o limite.
- **Testnet/regtest** usam coin type `1'` (BIP44/SLIP-44).
- **MD5** precisa receber bytes; string é codificada como UTF-8 pelo pacote `md5`.
- **WASM (tiny-secp256k1)**: top-level await; por isso o page loader eager no single-file e `'wasm-unsafe-eval'` na CSP.
- **Hash routing**: só ativa em `file://`/`content://`; testar com `pnpm test:e2e:single`.
- **shadcn**: adicionar componentes via `components.json`; importar de `$/components/ui/...`.

## Escopo de mudanças

- Diffs focados; não refatorar código não relacionado.
- Seguir as convenções acima antes de introduzir padrões novos.
- TypeScript strict (`noUnusedLocals`, `noUnusedParameters`).
- Não criar commits, PRs ou documentação extra a menos que solicitado.
