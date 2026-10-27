# Rodar o projeto em outro computador (Mac ou Windows)

O código vive no GitHub. Qualquer computador com Git e Node consegue baixar, rodar e enviar alterações.
Os únicos itens que **não** estão no repositório são as chaves (arquivo `.env.local`), de propósito.

## 1. Instalar as ferramentas (uma vez por computador)

**Mac**

```bash
xcode-select --install          # instala o git
```

- Node 20 LTS: baixe em https://nodejs.org (instalador .pkg)
- VS Code: https://code.visualstudio.com
- Opcional: GitHub CLI (`brew install gh`) facilita o login no GitHub

**Windows:** Git em https://git-scm.com e Node em https://nodejs.org.

Conferir:

```bash
git --version
node --version   # v20 ou maior
```

## 2. Baixar o projeto

```bash
mkdir -p ~/Projetos && cd ~/Projetos
git clone https://github.com/Lucascarvalho20/amavsturismo.git
cd amavsturismo/amavs-next
npm install
```

Se o repositório estiver privado, o Git pede login. Use `gh auth login` ou um *Personal Access Token* do GitHub como senha.

## 3. Criar o `.env.local`

Copie o modelo e preencha os valores:

```bash
cp .env.example .env.local
```

De onde tirar os valores (escolha um):

- **Vercel:** projeto → Settings → Environment Variables (os mesmos de produção), ou pela CLI:
  `npx vercel login && npx vercel link && npx vercel env pull .env.local`
- **Supabase:** Project Settings → API (URL, anon key e service_role key)

Nunca envie esse arquivo por e-mail ou WhatsApp em texto aberto, e nunca faça commit dele (o `.gitignore` já bloqueia).

## 4. Rodar

```bash
npm test         # deve passar tudo
npm run dev      # http://localhost:3000
```

## 5. Rotina do dia a dia

```bash
git pull                     # SEMPRE antes de começar: traz o que foi feito no outro computador
# ... trabalha ...
git add -A
git commit -m "feat: o que mudou"
git push                     # SEMPRE ao terminar: o outro computador e a Vercel recebem
```

- Push na `main` publica o site automaticamente na Vercel. Para algo arriscado, crie uma branch (`git switch -c minha-mudanca`), dê push e abra um Pull Request: a Vercel gera um link de prévia sem afetar o site no ar.
- Esqueceu o `git pull` e deu conflito? Rode `git pull`, abra os arquivos marcados no VS Code, escolha o que fica, depois `git add -A && git commit`.

## 6. Usando o Claude Code

Abra a pasta `amavsturismo` no Claude Code. O arquivo `CLAUDE.md` na raiz já explica o projeto, as regras e as pendências, então não precisa reexplicar tudo.

## 7. Outro projeto que só está no Mac (ex.: Gabarito AI)

No Mac, dentro da pasta do projeto:

```bash
git init                       # se ainda não for um repositório
git add -A && git commit -m "versão inicial"
gh repo create gabarito-ai --private --source=. --push
```

Antes do primeiro commit, confira se existe `.gitignore` com `node_modules`, `.env` e `.env*.local`.
Depois é só fazer `git clone` no PC, como no passo 2.
