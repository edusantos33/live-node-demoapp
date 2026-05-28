# Script rápido para a live

## Abertura

"Hoje eu quero mostrar que uma pipeline de desenvolvimento tradicional pode entregar software funcionando, mas ainda estar incompleta sem controles de segurança. Vamos usar uma aplicação Node.js simples e inserir SAST, SCA e secret scanning antes do deploy."

## Demonstração local

```bash
npm install
npm start
```

Acesse:

```text
http://localhost:3000
```

Mostre:

- `/info`
- `/monitor`
- `/tools`
- `/api/health`

## Mensagem principal

"O objetivo não é só encontrar vulnerabilidade. O objetivo é criar uma esteira em que o desenvolvedor recebe feedback rápido, contextualizado e antes da mudança chegar em produção."

## Demonstração dos checks

Explique os três controles:

- Bearer: procura padrões inseguros no código-fonte.
- Dependency-Check: procura bibliotecas com CVEs conhecidas.
- Gitleaks: procura segredos acidentalmente versionados.

## Encerramento

"A pipeline que só faz build e deploy entrega velocidade. A pipeline com controles de segurança entrega velocidade com responsabilidade."
