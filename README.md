# Sonora

Estúdio de vozes realistas. Cole um texto, escolha a voz, gere o áudio e baixe o MP3.

Guia rápido em português: **COMO-RODAR.txt** (o mesmo conteúdo abaixo).

Repositório: [https://github.com/PAULO4800/sonora](https://github.com/PAULO4800/sonora)

## O que você precisa

1. **Node.js 22 ou mais novo** — [https://nodejs.org](https://nodejs.org)  
   No Windows, na instalação, marque **Add to PATH**.
2. **Chave da ElevenLabs** — [https://elevenlabs.io](https://elevenlabs.io)  
   Cole a chave em **Configurações** dentro do app. Ela fica salva neste navegador.

## Passo a passo

1. Baixe o projeto:

   ```
   git clone https://github.com/PAULO4800/sonora.git
   cd sonora
   ```

   Sem Git: extraia o ZIP para uma pasta, por exemplo `C:\Sonora` ou `~/Sonora`, e abra o terminal **nessa pasta**.

2. Instale as dependências (só na primeira vez):

   ```
   npm install
   ```

3. Inicie o app:

   ```
   npm run dev
   ```

4. No navegador, abra [http://localhost:8080](http://localhost:8080)

5. Clique em **Configurações**, cole a chave da ElevenLabs (`sk_…`) e salve.

Cole o texto, escolha a voz (Krok é a voz padrão em PT-BR) e clique em **Gerar voz**.

`Ctrl + Enter` (Windows) ou `⌘ + Enter` (Mac) também gera a voz.

Para parar o servidor: `Ctrl + C` no terminal.

## Se der erro

| Problema | O que fazer |
|---|---|
| `npm` não é reconhecido | Node.js não está no PATH. Reinstale o Node e **reabra** o terminal. |
| “Configure sua chave em Configurações” | Abra Configurações, cole a chave da ElevenLabs e salve. A chave fica só neste navegador. |
| Chave inválida | Confira se copiou a chave completa em elevenlabs.io → Profile → API keys. |
| Porta 8080 ocupada | Feche o outro programa que usa 8080. |
| Gerar voz falhou / cota | Cota da ElevenLabs ou internet. Tente de novo. |

As gerações recentes ficam salvas neste navegador, neste computador.

## GitHub Actions

O repositório inclui CI em `.github/workflows/ci.yml`. A cada push e pull request na `main` ele:

1. Instala o Node 22
2. Roda `npm install`
3. Typecheck
4. Testes
5. Build de produção

Para disparar na mão: aba **Actions** → **CI** → **Run workflow**.

A chave da ElevenLabs **não** entra no CI. Cole-a em Configurações no app.
