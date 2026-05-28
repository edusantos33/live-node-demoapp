# GHSCD Live Node Demo App

Aplicação simples em Node.js + Express + EJS para demonstração de DevSecOps/AppSec em live.

## O que a aplicação tem

- Express com EJS.
- Páginas: Home, Info, Monitor e Tools.
- APIs: `/api/health`, `/api/version`, `/api/metrics` e `/ready`.
- Helmet, rate limiting e compressão.
- Echo escapado para demonstrar proteção básica contra XSS refletido.
- Workflow de segurança com:
  - Bearer como SAST.
  - OWASP Dependency-Check como SCA.
  - Gitleaks como secret scan.
- Workflow opcional para deploy na Vercel somente depois dos checks de segurança.

## Rodar localmente

```bash
npm install
npm start
```

Depois acesse:

```text
http://localhost:3000
```

Teste rápido:

```bash
npm test
```

## Deploy rápido na Vercel pela interface

1. Crie um repositório no GitHub.
2. Faça push desta aplicação.
3. Na Vercel, escolha **Add New > Project**.
4. Importe o repositório.
5. Framework preset: **Other** ou detecção automática.
6. Build command: deixe vazio ou use `npm install` se a interface pedir.
7. Output directory: deixe vazio.
8. Clique em **Deploy**.

A Vercel consegue executar uma aplicação Express exportada pelo arquivo `src/index.js`.

## Deploy pela GitHub Action após a segurança

O arquivo `.github/workflows/vercel-deploy.yml` está pronto, mas você precisa criar estes secrets no GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Como obter:

```bash
npm i -g vercel
vercel login
vercel link
cat .vercel/project.json
```

O arquivo `.vercel/project.json` mostrará o `orgId` e o `projectId`. Não comite a pasta `.vercel`.

## Segurança no PR

O workflow `.github/workflows/security.yml` roda em push e Pull Request para `main` ou `master`.

Regras de bloqueio já configuradas:

- Bearer: reporta e falha em achados `critical` e `high`.
- Dependency-Check: falha com `--failOnCVSS 7`, cobrindo alta e crítica.
- Gitleaks: falha quando encontra segredo no repositório.

## Roteiro sugerido para a live

1. Mostre a aplicação local:

```bash
npm install
npm start
```

2. Mostre as rotas:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/version
curl http://localhost:3000/api/metrics
```

3. Faça push para o GitHub.

4. Abra um PR simples alterando um texto da home.

5. Mostre a pipeline passando.

6. Mostre que o deploy da Vercel só deve acontecer depois dos checks.

7. Para demonstrar bloqueio, crie uma branch descartável e introduza uma mudança insegura apenas para fins didáticos. Não faça merge dessa branch.

## Observação importante

Esta aplicação é propositalmente pequena para reduzir risco de falha durante a live. Ela é boa para demonstrar o fluxo:

```text
Developer -> Pull Request -> Security Checks -> Deploy Preview/Production
```
