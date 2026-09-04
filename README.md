# Sonora

Estúdio de vozes realistas. Cole um texto, escolha a voz, gere o áudio e baixe o MP3.

Guia rápido em português: **COMO-RODAR.txt** (o mesmo conteúdo abaixo).

## O que você precisa

1. **Node.js 22 ou mais novo** — [https://nodejs.org](https://nodejs.org)  
   No Windows, na instalação, marque **Add to PATH**.
2. **Chave da API da xAI** — [https://console.x.ai](https://console.x.ai)  
   É ela que gera as vozes reais.

## Passo a passo

1. Extraia o ZIP para uma pasta, por exemplo `C:\Sonora` ou `~/Sonora`.
2. Abra o terminal **nessa pasta**.
   - Windows: botão direito na pasta → *Abrir no Terminal*, ou `cd C:\Sonora`
   - Mac/Linux: `cd ~/Sonora`
3. Copie o arquivo da chave:
   - Windows (PowerShell): `copy .env.example .env`
   - Mac/Linux: `cp .env.example .env`
4. Abra o `.env` e cole a chave:

   ```
   XAI_API_KEY=xai-xxxxxxxx
   ```

   Sem aspas. Sem espaço em volta do `=`.
5. Instale as dependências (só na primeira vez):

   ```
   npm install
   ```

6. Inicie o app:

   ```
   npm run dev
   ```

7. No navegador, abra [http://localhost:8080](http://localhost:8080)

Cole o texto, escolha a voz, clique em **Gerar voz**.

`Ctrl + Enter` (Windows) ou `⌘ + Enter` (Mac) também gera a voz.

Para parar o servidor: `Ctrl + C` no terminal.

## Se der erro

| Problema | O que fazer |
|---|---|
| `npm` não é reconhecido | Node.js não está no PATH. Reinstale o Node e **reabra** o terminal. |
| “A geração de voz não está disponível” | A chave `XAI_API_KEY` está vazia, errada, ou o `.env` não está na mesma pasta do `package.json`. |
| Porta 8080 ocupada | Feche o outro programa que usa 8080. |
| Gerar voz falhou / 429 | Cota da chave xAI ou internet. Tente de novo. |

As gerações recentes ficam salvas neste navegador, neste computador.

## GitHub Actions

O repositório inclui CI em `.github/workflows/ci.yml`. A cada push e pull request na `main` ele:

1. Instala o Node 22
2. Roda `npm ci`
3. Typecheck
4. Testes
5. Checagem de auth
6. Build de produção

Para disparar na mão: aba **Actions** → **CI** → **Run workflow**.

A chave `XAI_API_KEY` **não** entra no CI (é só para gerar voz em runtime). Coloque-a no `.env` local, ou em **Settings → Secrets and variables → Actions** se um dia quiser um job que chame a API.
