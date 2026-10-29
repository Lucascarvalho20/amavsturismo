# Guia de estudo — Amav's Turismo

Este guia explica o sistema por dentro, na ordem em que vale estudar. Cada tópico aponta para o arquivo real do projeto. Abra o arquivo ao lado e leia o código junto.

Marcação de nível:

- **[Jr]** é o que se espera de uma pessoa júnior: saber explicar o que o código faz e por quê.
- **[Pl]** é o que diferencia uma pessoa pleno: trade-offs, o que quebra em escala e como você mudaria.

Este é o único guia do projeto: tudo o que serve para estudo e entrevista fica aqui. Se você está começando em JavaScript, comece pela seção 1: ela mostra cada fundamento da linguagem (variáveis, operadores, condições, laços, funções, arrays e objetos) no código real do projeto.

Não decore as respostas. Em entrevista, o que convence é você abrir o código e explicar com as suas palavras.

---

## 0. O pitch de 60 segundos

Treine falar isto em voz alta até sair natural:

> É o sistema de uma empresa de transporte de Brasília que vive de licitações públicas. Tem um painel interno onde a equipe controla as licitações que disputa (sessões, propostas, resultado), as certidões de habilitação com alerta de vencimento e o portfólio de serviços prestados. E tem o site público, que mostra esse portfólio com os atestados do Exército, do CFC e de ministérios.
>
> A stack é Next.js com TypeScript no back e no front, Postgres no Supabase e deploy na Vercel. A parte de que mais me orgulho é a segurança: encontrei que qualquer pessoa podia criar conta e virar admin, e que o formulário público baixava nome de clientes para o navegador. Corrigi com Row Level Security no banco, permissões por coluna e rotas de API que devolvem só o necessário. Tem testes com Vitest e CI no GitHub Actions.

Depois do pitch, o entrevistador vai puxar um fio. Os capítulos abaixo preparam cada fio.

---

## 1. Fundamentos de JavaScript no código do projeto [Jr → Pl]

O projeto é escrito em TypeScript, que é JavaScript com tipos. Tudo o que vale para JavaScript vale aqui; os tipos (`: string`, `: number[]`) somem quando o código é compilado. Cada tópico abaixo mostra **onde o conceito aparece de verdade no projeto**. Em entrevista, explicar um conceito com um exemplo do seu próprio código convence muito mais do que a definição decorada.

### 1.1 `var`, `let` e `const`

| | Escopo | Pode reatribuir? | Pode declarar de novo? | Antes da declaração |
|---|---|---|---|---|
| `var` | função | sim | sim | existe, vale `undefined` (*hoisting*) |
| `let` | bloco `{ }` | sim | não | erro (*TDZ*) |
| `const` | bloco `{ }` | não | não | erro (*TDZ*) |

**No projeto:**

- **Não existe nenhum `var`.** É a prática atual: `const` por padrão, `let` só quando o valor muda.
- **`const`** na maior parte das variáveis. Exemplo: `const in7 = now.getTime() + 7 * 86_400_000` em [`lib/licitacoes.ts:84`](../amavs-next/lib/licitacoes.ts#L84).
- **`let` para acumular:** em [`lib/licitacoes.ts:86`](../amavs-next/lib/licitacoes.ts#L86), `let open = 0, won = 0, lost = 0…` são contadores que sobem dentro do laço.
- **`let` para montar uma consulta em etapas:** em [`app/api/disponibilidade/route.ts:35`](../amavs-next/app/api/disponibilidade/route.ts#L35), `let blocksQ = supabase.from(…)` começa genérica e, se veio um veículo na URL, é reatribuída com mais um filtro (`blocksQ = blocksQ.eq('vehicle_id', vehicleId)`).
- **`let` no nível do módulo (*singleton*):** em [`lib/supabase-admin.ts:9`](../amavs-next/lib/supabase-admin.ts#L9), `let cached = null` guarda o cliente do banco. Na primeira chamada ele é criado; nas seguintes, reaproveitado.

**[Jr] `const` não significa imutável.** Em [`lib/availability.ts:44`](../amavs-next/lib/availability.ts#L44), `const conflicts: Conflict[] = []` e logo depois `conflicts.push(…)`. Funciona, porque `const` impede **reatribuir a variável** (`conflicts = []` daria erro), não impede **alterar o conteúdo** do array ou do objeto. Para congelar de verdade existe `Object.freeze`, e no TypeScript, `as const` (ver 1.10).

**[Pl] O problema clássico do `var` em laço:**

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))  // 3, 3, 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i))  // 0, 1, 2
```

Com `var` existe **uma** variável `i` para a função inteira; quando os `setTimeout` rodam, o laço já terminou e `i` vale 3. Com `let`, cada volta do laço cria um `i` novo, e cada função guarda o seu. Isso junta três assuntos que caem em entrevista: escopo, *closure* (1.9) e assincronia.

**[Pl] TDZ (*Temporal Dead Zone*):** usar um `let`/`const` antes da linha em que ele é declarado lança `ReferenceError`. Com `var`, o mesmo código roda e devolve `undefined`, escondendo o erro. Por isso `let`/`const` são mais seguros.

### 1.2 Operadores, prefixo e sufixo (`++i` e `i++`)

- `i++` (**sufixo**, *postfix*): soma 1 e devolve o valor **antigo**.
- `++i` (**prefixo**, *prefix*): soma 1 e devolve o valor **novo**.

```js
let a = 5
const b = a++  // b = 5, a = 6
const c = ++a  // c = 7, a = 7
```

**No projeto:** em [`lib/licitacoes.ts:90-101`](../amavs-next/lib/licitacoes.ts#L90-L101) aparecem `open++`, `won++`, `lost++` e `sessionsNext7Days++`. E nos laços do calendário, em [`components/ui/MonthCalendar.tsx:72-73`](../amavs-next/components/ui/MonthCalendar.tsx#L72-L73): `for (let i = 0; i < firstDay; i++)`.

**[Jr] Aqui tanto faz `i++` ou `++i`**, porque o valor devolvido não é usado: a linha só incrementa. A diferença só aparece quando o incremento está **dentro de outra expressão** (`const b = a++`).

**[Pl]** Muitos guias de estilo (regra `no-plusplus` do ESLint) preferem `i += 1`, porque `a++` dentro de expressões é fácil de ler errado. Saiba dizer que conhece a regra e por que ela existe.

Outros operadores do projeto: `*` e `+` em `7 * 86_400_000` (o `_` é só separador visual de milhar), `-` e `/` em `(exp - now) / 86_400_000` para contar dias em [`lib/documents.ts:55`](../amavs-next/lib/documents.ts#L55), e `+=` em `score += 1000` em [`lib/availability.ts:122`](../amavs-next/lib/availability.ts#L122).

### 1.3 Operadores lógicos: `&&` (E), `||` (OU), `!` (NÃO) e `??`

**`&&` (E):** verdadeiro só se os dois lados forem verdadeiros.

- Sobreposição de datas em [`lib/availability.ts:29`](../amavs-next/lib/availability.ts#L29): `return aS <= bE && aE >= bS`.
- Sessão nos próximos 7 dias em [`lib/licitacoes.ts:93`](../amavs-next/lib/licitacoes.ts#L93): `t >= now.getTime() && t <= in7`.
- Três condições de segurança em [`lib/validation.ts:32`](../amavs-next/lib/validation.ts#L32): o caminho começa com `/` **e** não começa com `//` **e** não tem `\`. Se qualquer uma falhar, o redirecionamento é recusado.

**`||` (OU):** verdadeiro se pelo menos um lado for verdadeiro.

- Em [`lib/supabase-admin.ts:14`](../amavs-next/lib/supabase-admin.ts#L14): `if (!url || !key) return null`. Falta a URL **ou** falta a chave → não dá para criar o cliente.

**`!` (NÃO):** inverte. `!availability.available` é "não está disponível". `!raw.startsWith('//')` é "não começa com `//`".

**Curto-circuito [Jr]:** o JavaScript para de avaliar assim que sabe o resultado. Em `a && b`, se `a` é falso, `b` nem é executado. Em `a || b`, se `a` é verdadeiro, `b` nem é executado. É por isso que `if (!url || !key)` é seguro: se não há URL, a segunda parte nem é olhada.

**`||` e `&&` devolvem um dos valores, não só `true`/`false` [Jr → Pl]:**

```ts
const end = returnDate || travelDate   // availability.ts:42 — sem volta, a viagem termina no mesmo dia
email: d.email || null                 // app/api/leads/route.ts:39 — '' vira null no banco
```

**`??` (*nullish coalescing*) [Pl]:** parecido com `||`, mas só troca o valor se ele for `null` ou `undefined`. O `||` troca qualquer valor *falsy* (inclusive `0` e `''`, ver 1.4). O projeto usa os dois de propósito:

- Em [`components/sections/StatsSection.tsx:86`](../amavs-next/components/sections/StatsSection.tsx#L86): `value: row.value_override ?? computeAuto(row.key)`. Se o admin quiser mostrar **0** num indicador, o `??` respeita o 0. Com `||`, o 0 seria ignorado e o site mostraria o valor calculado: um bug silencioso.
- Em `email: d.email || null`, o `||` é o certo, porque um e-mail vazio (`''`) também deve virar `null`.

Saber explicar **por que** cada linha usa um operador diferente é resposta de pleno.

**`?.` (*optional chaining*):** `v?.category` devolve `undefined` em vez de dar erro quando `v` é `null`. Exemplo em [`app/api/leads/route.ts`](../amavs-next/app/api/leads/route.ts): `vehicleCategory = v?.category ?? null`.

**`===` em vez de `==` [Jr]:** o projeto só usa `===` (igualdade estrita, sem conversão de tipo). Com `==`, `'0' == 0` e `null == undefined` dão `true`, o que esconde bugs.

**Precedência [Pl]:** `&&` é avaliado antes de `||`. `a || b && c` é `a || (b && c)`. Na dúvida, use parênteses. Misturar `??` com `||` sem parênteses é erro de sintaxe, justamente para evitar essa confusão.

### 1.4 Valores *truthy* e *falsy*

Em um `if`, `&&`, `||` ou `!`, qualquer valor é convertido para verdadeiro ou falso. Os **falsy** são só estes:

`false`, `0`, `-0`, `0n`, `''` (texto vazio), `null`, `undefined` e `NaN`.

**Todo o resto é truthy**, inclusive `'0'`, `'false'`, `[]` (array vazio) e `{}` (objeto vazio).

**No projeto:**

- `if (b.session_at)` em [`lib/licitacoes.ts:91`](../amavs-next/lib/licitacoes.ts#L91): só calcula se a licitação tem data de sessão (`null` é falsy).
- `if (!travelDate) return …` em [`lib/availability.ts:40`](../amavs-next/lib/availability.ts#L40): sem data, não há o que verificar.
- `if (!files?.length) return` em [`app/admin/portfolio/page.tsx`](../amavs-next/app/admin/portfolio/page.tsx): cobre dois casos de uma vez, `files` nulo (`undefined`) e lista vazia (`length` = `0`).
- `.filter(Boolean)` em [`lib/supabase-admin.ts:29-33`](../amavs-next/lib/supabase-admin.ts#L29-L33): `'a@x.com,'.split(',')` gera `['a@x.com', '']`; o `filter(Boolean)` joga fora o texto vazio.

**[Pl] O mesmo `filter(Boolean)` com bug.** Em [`lib/utils.ts:120-138`](../amavs-next/lib/utils.ts#L120-L138), a mensagem do WhatsApp é montada como um array de linhas, com `null` nas linhas opcionais e textos vazios (`''`) para criar linhas em branco entre os blocos. No fim, `lines.filter(Boolean)` remove os `null`, mas também remove os `''`, porque texto vazio é falsy. Resultado: as linhas em branco nunca aparecem e a mensagem chega toda junta. É um bug real, que está no ar. A seção 14 mostra, passo a passo, como achar e corrigir esse bug.

**[Pl] Array vazio é truthy.** `if (data)` passa mesmo quando a consulta devolveu `[]`. Por isso o projeto testa o tamanho: `if (clients.length === 0) return null` em [`components/sections/ClientsSection.tsx`](../amavs-next/components/sections/ClientsSection.tsx). No JSX, `{lista.length && <Componente />}` mostra um **"0"** na tela quando a lista está vazia. O certo é `{lista.length > 0 && …}`.

### 1.5 Condições: `if`, `else if`, `else` e ternário

**Cadeia de `if` com `return` antecipado (*guard clause*).** Em [`lib/documents.ts:51-58`](../amavs-next/lib/documents.ts#L51-L58):

```ts
if (!expiresAt) return { status: 'sem_validade', daysLeft: null }
// …calcula daysLeft…
if (daysLeft < 0) return { status: 'vencido', daysLeft }
if (daysLeft <= warnDays) return { status: 'vencendo', daysLeft }
return { status: 'valido', daysLeft }
```

- Como cada `if` termina em `return`, não precisa de `else`: se chegou na linha seguinte, a condição anterior era falsa. Isso evita `if` dentro de `if` e deixa o caminho principal sem recuo.
- **[Jr] A ordem importa.** Um documento com `daysLeft = -3` também é `<= 15`. Se o teste de "vencendo" viesse antes, um documento vencido apareceria como "vence em breve". Em licitação, isso é inabilitação.

**`if / else if` com tipos diferentes:** `statusLabel` em [`lib/utils.ts:62`](../amavs-next/lib/utils.ts#L62) escolhe a tabela de rótulos conforme `type` (`'vehicle'`, `'contract'`, `'lead'`).

**Ternário `condição ? valorSeSim : valorSeNão`:** é um `if/else` que **devolve um valor**, então cabe dentro de uma expressão.

- Em [`lib/validation.ts:32`](../amavs-next/lib/validation.ts#L32): `return caminhoSeguro ? raw : fallback`.
- Em [`lib/licitacoes.ts:109`](../amavs-next/lib/licitacoes.ts#L109): `winRate: won + lost > 0 ? won / (won + lost) : null`, para não dividir por zero.

**[Pl] Ternário encadeado.** Em [`lib/utils.ts:198`](../amavs-next/lib/utils.ts#L198), `validateFileType` usa `a ? x : b ? y : z`. Funciona, mas fica difícil de ler a partir de três opções. A alternativa é um objeto de consulta (ver 1.6): `const typeSets = { images: …, pdf: …, images_or_pdf: … }; const typeSet = typeSets[allowed]`.

### 1.6 `switch` e quando trocar por um objeto

Em [`components/sections/StatsSection.tsx:63-74`](../amavs-next/components/sections/StatsSection.tsx#L63-L74):

```ts
const computeAuto = (key: string): number => {
  switch (key) {
    case 'fleet_size': return fleetSize
    case 'total_capacity': return totalCapacity
    // …
    default: return 0
  }
}
```

- **[Jr]** O `switch` compara com `===`. Cada `case` aqui termina em `return`, então não precisa de `break`. Sem `return` nem `break`, a execução **continua no próximo `case`** (*fall-through*), o bug mais comum com `switch`.
- **[Jr]** `default` é o "nenhum dos anteriores": uma chave desconhecida devolve 0 em vez de `undefined`.

**[Pl] Objeto no lugar de `switch`.** O projeto usa muito outra forma: um objeto que mapeia chave → valor. Em [`lib/licitacoes.ts:37`](../amavs-next/lib/licitacoes.ts#L37):

```ts
export const bidStatusLabel: Record<BidStatus, string> = {
  prospeccao: 'Prospecção',
  em_analise: 'Analisando edital',
  // …
}
bidStatusLabel[bid.status]  // 'Prospecção'
```

A vantagem é do TypeScript: `Record<BidStatus, string>` **obriga** a existir um rótulo para cada status. Se alguém criar um status novo e esquecer o rótulo, o código não compila. Um `switch` com `default` aceitaria o esquecimento calado. Regra prática: para **mapear valor → valor**, prefira o objeto; para **executar lógicas diferentes** em cada caso, `switch` ou `if`.

**[Pl] `switch` exaustivo:** quando o `switch` é necessário, dá para fazer o compilador cobrar todos os casos com `default: { const _exaustivo: never = key; … }`. Se faltar um caso, `key` não é `never` e o build quebra. Ver o exercício 4 da seção 1.12.

### 1.7 Laços: `for`, `for…of`, `while`, `break` e `continue`

**`for` clássico (contador):** em [`components/ui/MonthCalendar.tsx:72-73`](../amavs-next/components/ui/MonthCalendar.tsx#L72-L73), o calendário põe células vazias até o dia da semana em que o mês começa e depois um `Date` para cada dia:

```ts
for (let i = 0; i < firstDay; i++) result.push(null)
for (let d = 1; d <= daysInMonth; d++) result.push(new Date(year, month, d))
```

**`for…of` (percorre os itens):** é o laço mais usado no projeto. Em [`lib/availability.ts:74-86`](../amavs-next/lib/availability.ts#L74-L86):

```ts
for (const r of reservations) {
  if (r.vehicle_id !== vehicle.id) continue   // outra van: pula
  if (r.status === 'cancelada') continue      // reserva cancelada não bloqueia
  if (rangesOverlap(…)) conflicts.push(…)
}
```

- **`continue`** pula para o próximo item. Funciona como *guard clause* dentro do laço.
- **`return` dentro do laço** encerra a função na hora. Em [`MonthCalendar.tsx:34`](../amavs-next/components/ui/MonthCalendar.tsx#L34), `isDateBlocked` devolve o primeiro bloqueio que encontrar, sem olhar os outros.
- **`break`** sai só do laço e continua a função. Não aparece no projeto, mas é o equivalente para quando não se quer sair da função.

**`while`:** repete enquanto a condição for verdadeira, para quando não se sabe quantas voltas serão. O projeto não usa, mas o monitor de editais do PNCP (exercício 4 da seção 12) precisaria de um: `while (temMaisPaginas) { buscar a próxima página }`. O `do…while` garante pelo menos uma volta.

**`for…in` [Jr]:** percorre as **chaves** de um objeto. Não use em array: devolve os índices como texto (`'0'`, `'1'`) e pode trazer propriedades herdadas. Para array, `for…of` ou métodos como `.map`.

**[Pl] `await` dentro de laço.** Em [`app/admin/portfolio/page.tsx:176`](../amavs-next/app/admin/portfolio/page.tsx#L176), as fotos são enviadas **uma de cada vez**:

```ts
for (const file of Array.from(files)) {
  if (file.size > 8 * 1024 * 1024) { toast.error(…); continue }
  const { error } = await supabase.storage.from('portfolio').upload(path, file)
  if (error) { toast.error(…); continue }
  added.push(…)
}
```

- **Sequencial** (como está): mais lento, mas simples. Cada erro é tratado sem derrubar as outras fotos (`continue`), e não sobrecarrega a conexão.
- **Paralelo** (`Promise.all(files.map(upload))`): mais rápido, mas um erro rejeita tudo. `Promise.allSettled` resolve isso e devolve o resultado de cada uma.
- **Armadilha:** `files.forEach(async (f) => await upload(f))` **não espera** nada. O `forEach` ignora a Promise devolvida, e a função segue antes de os envios terminarem. Para esperar, use `for…of` ou `Promise.all`.

### 1.8 Funções

**Declaração de função** (o estilo do `lib/`), em [`lib/documents.ts:46-50`](../amavs-next/lib/documents.ts#L46-L50):

```ts
export function documentStatus(
  expiresAt: string | null | undefined,
  today: Date = new Date(),
  warnDays = 15,
): { status: DocStatus; daysLeft: number | null } { … }
```

- **Parâmetros com valor padrão:** quem chama pode passar só a data (`documentStatus('2026-12-01')`); o teste passa também o "hoje" para ter resultado previsível.
- **Retorno:** a função devolve um objeto com dois campos. Sem `return`, uma função devolve `undefined`.
- **[Jr] Função pura:** mesma entrada, mesma saída, sem efeito colateral (não lê relógio, banco nem variável de fora). `documentStatus`, `bidStats` e `checkVehicleAvailability` são puras. Por isso os testes em `lib/__tests__/` não precisam de banco.

**Função que devolve função (*factory*):** em [`lib/validation.ts:7`](../amavs-next/lib/validation.ts#L7), `optionalText(120)` devolve uma regra de validação nova para cada tamanho. Funções são **valores** em JavaScript: podem ser guardadas em variável, passadas como argumento e devolvidas por outra função (*first-class functions*). Quem recebe ou devolve função é chamada de **função de ordem superior**: `.map`, `.filter` e `.sort` são exemplos.

**`async function`:** sempre devolve uma Promise. `export async function middleware(request)` em [`middleware.ts`](../amavs-next/middleware.ts) pode usar `await` lá dentro.

**[Pl] *Hoisting* de função.** Uma declaração `function allowlist()` pode ser chamada **antes** da linha em que foi escrita, porque o JavaScript a "iça" para o topo. Uma arrow guardada em `const` (`const loginUrl = () => …`) não pode: cai na TDZ (1.1).

### 1.9 Arrow functions

Sintaxe mais curta: `(parâmetros) => corpo`.

| Forma | Exemplo no projeto |
|---|---|
| Um parâmetro, retorno implícito | `.map((e) => e.trim().toLowerCase())`, em [`middleware.ts:14-19`](../amavs-next/middleware.ts#L14-L19) |
| Sem parâmetro | `const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))`, em [`MonthCalendar.tsx`](../amavs-next/components/ui/MonthCalendar.tsx) |
| Corpo com `{ }` e `return` | `const computeAuto = (key: string): number => { switch … }` |
| Comparador de ordenação | `.sort((a, b) => a.score - b.score)`, em [`lib/availability.ts:126`](../amavs-next/lib/availability.ts#L126) |
| Devolvendo um objeto | `setF((p) => ({ ...p, [k]: v }))`, em [`app/admin/portfolio/page.tsx:170`](../amavs-next/app/admin/portfolio/page.tsx#L170) |

- **[Jr] Retorno implícito:** sem `{ }`, a expressão é devolvida sozinha. Com `{ }`, precisa de `return`.
- **[Jr] Pegadinha do objeto:** para devolver um objeto direto, use parênteses: `() => ({ a: 1 })`. Sem eles, `() => { a: 1 }` é lido como um bloco de código e devolve `undefined`.

**[Jr → Pl] *Closure*.** Uma função "lembra" as variáveis do lugar onde foi criada, mesmo depois que esse lugar terminou de executar.

- Em [`middleware.ts:35`](../amavs-next/middleware.ts#L35), `loginUrl` monta `new URL('/admin/login', request.url)` usando `request`, que não é parâmetro dela: veio do escopo de fora.
- Em [`StatsSection.tsx:63`](../amavs-next/components/sections/StatsSection.tsx#L63), `computeAuto` lê `fleetSize`, `tripsYear` etc., calculados antes.
- Em [`lib/rate-limit.ts:5`](../amavs-next/lib/rate-limit.ts#L5), o `Map` `buckets` fica no escopo do módulo e é lembrado entre uma requisição e outra **na mesma instância** do servidor. É exatamente por isso que o rate limit não é global na Vercel (seção 3).

**[Pl] Arrow × `function`:**

- A arrow **não tem `this` próprio**: usa o `this` de onde foi escrita. Isso resolve o problema clássico de perder o `this` em *callbacks*. Também não tem `arguments` e não pode ser usada com `new`.
- A declaração `function` sofre *hoisting* e tem nome, o que aparece melhor no *stack trace* de um erro.
- O projeto usa `function` para as funções exportadas do `lib/` (contrato público, testável) e arrow para *callbacks* e funções internas de componentes. É uma convenção; saiba dizer qual e por quê.

### 1.10 Arrays

**Criação e tipos derivados [Jr → Pl].** Em [`lib/licitacoes.ts:25-35`](../amavs-next/lib/licitacoes.ts#L25-L35):

```ts
export const BID_STATUSES = ['prospeccao', 'em_analise', /* … */] as const
export type BidStatus = (typeof BID_STATUSES)[number]
```

`as const` deixa o array somente leitura e faz o TypeScript guardar os textos exatos. A segunda linha cria o tipo `'prospeccao' | 'em_analise' | …` a partir do array. A lista de status existe **num lugar só** no código e alimenta o tipo e os selects do painel (o `CHECK` do banco repete a mesma lista em SQL).

**Métodos que aparecem no projeto:**

| Método | O que faz | Onde |
|---|---|---|
| `includes` | o item está na lista? | `OPEN_STATUSES.includes(b.status)` em [`lib/licitacoes.ts:89`](../amavs-next/lib/licitacoes.ts#L89) |
| `push` | adiciona no fim (altera o array) | `conflicts.push(…)` em `availability.ts` |
| `map` | transforma cada item, devolve array novo | `vehicles.map((v) => ({ vehicle: v, score }))` em [`availability.ts:112`](../amavs-next/lib/availability.ts#L112) |
| `filter` | mantém os itens que passam no teste | janela do rate limit em [`lib/rate-limit.ts:9`](../amavs-next/lib/rate-limit.ts#L9) |
| `every` | todos passam no teste? | limpeza do rate limit em [`lib/rate-limit.ts:15`](../amavs-next/lib/rate-limit.ts#L15) |
| `sort` | ordena (altera o array) | ranking de veículos em [`availability.ts:126`](../amavs-next/lib/availability.ts#L126) |
| `split` / `join` | texto ↔ array | `ADMIN_EMAILS.split(',')`; `lines.join('\n')` |
| `Array.from` | converte "parecido com array" em array | `Array.from(files)`: `FileList` não tem `.map` |

**Encadeamento:** em [`middleware.ts:14-19`](../amavs-next/middleware.ts#L14-L19), `'A@x.com, b@y.com,'` vira `['a@x.com', 'b@y.com']` com `.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)`. Cada método devolve um array novo para o próximo.

**Desestruturação de array:**

- `const [y, m, d] = expiresAt.split('-').map(Number)`, em [`lib/documents.ts:52`](../amavs-next/lib/documents.ts#L52): `'2026-12-01'` vira `y = 2026`, `m = 12`, `d = 1`.
- `const [vehiclesRes, blocksRes, resRes] = await Promise.all([…])`, em [`app/api/disponibilidade/route.ts:49`](../amavs-next/app/api/disponibilidade/route.ts#L49): três consultas em paralelo, cada resultado na sua variável.

**Spread `...`:** `setPhotos((p) => [...p, ...added])`, em [`app/admin/portfolio/page.tsx:186`](../amavs-next/app/admin/portfolio/page.tsx#L186), cria um array **novo** com as fotos antigas mais as enviadas.

**[Pl] Mutação × imutabilidade.** `push` e `sort` **alteram** o array original; `map`, `filter` e o spread **criam outro**.

- No React, o estado precisa de um array novo. Com `p.push(…)`, a referência seria a mesma, e o React não perceberia a mudança nem redesenharia a tela. Por isso o spread.
- Em `rankVehicles`, o `sort` altera um array, mas um que acabou de ser criado pelo `map`, então a lista que veio de fora não é afetada. Se fosse `vehicles.sort(…)` direto, a função deixaria de ser pura. Hoje também existe `toSorted()`, que ordena sem alterar.
- O comparador `(a, b) => a.score - b.score` devolve negativo (a vem antes), zero ou positivo (b vem antes). Sem comparador, `sort` ordena como **texto**: `[10, 9, 1].sort()` dá `[1, 10, 9]`.

**[Pl] Pegadinha do `map(Number)`.** `'2026-12-01'.split('-').map(Number)` funciona. Já `.map(parseInt)` não: o `map` passa `(valor, índice)`, e o `parseInt` entende o índice como **base numérica**. `['10', '10', '10'].map(parseInt)` dá `[10, NaN, 2]`.

### 1.11 Objetos

**Objeto literal, array de objetos:** a lista de certidões sugeridas em [`lib/documents.ts:18-30`](../amavs-next/lib/documents.ts#L18-L30):

```ts
{ name: 'CND Federal (Receita/PGFN)', category: 'fiscal', issuer: 'Receita Federal' }
```

**Propriedade abreviada (*shorthand*):** em [`lib/licitacoes.ts:104-111`](../amavs-next/lib/licitacoes.ts#L104-L111), `return { open, won, lost, … }` é o mesmo que `{ open: open, won: won, … }`.

**Desestruturação de objeto:**

- `const { pathname } = request.nextUrl`, em [`middleware.ts:22`](../amavs-next/middleware.ts#L22).
- `const { error } = await supabase.storage.from('portfolio').upload(…)`: pega só o campo que interessa da resposta.
- Renomeando: `const { data: v } = await …` em [`app/api/leads/route.ts`](../amavs-next/app/api/leads/route.ts) guarda `data` na variável `v`.
- Nos parâmetros, com valor padrão: `function MonthCalendar({ blocks, showNavigation = true, … })`.

**Spread e propriedade computada:** em [`app/admin/portfolio/page.tsx:170`](../amavs-next/app/admin/portfolio/page.tsx#L170):

```ts
const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
```

`...p` copia todos os campos do formulário; `[k]: v` sobrescreve o campo cujo **nome está na variável** `k`. Uma única função atualiza qualquer campo: `set('organization', 'CFC')`.

**Objeto como dicionário:** `bidStatusLabel[status]` (seção 1.6) e `ALLOWED_EXTENSIONS[allowed]` em `validateFileType`.

**[Pl] `Map` e `Set` no lugar de objeto.**

- O rate limit usa `new Map<string, number[]>()` em [`lib/rate-limit.ts:5`](../amavs-next/lib/rate-limit.ts#L5), não `{}`. O `Map` aceita qualquer texto como chave sem colidir com nomes herdados (`'constructor'`, `'__proto__'`) e tem `.size` e `.delete`, que a limpeza usa.
- Os tipos de arquivo aceitos são um `Set`, em [`lib/utils.ts:176`](../amavs-next/lib/utils.ts#L176): `ALLOWED_IMAGE_TYPES.has(file.type)` responde se está na lista sem percorrê-la.

**[Pl] Referência × valor.** Números e textos são copiados; objetos e arrays são passados por **referência**. `const b = a` com objeto não cria uma cópia: `a` e `b` são o mesmo objeto. O spread `{ ...p }` faz uma cópia **rasa**: os campos de primeiro nível são novos, mas um array dentro dele (como `photos`) continua compartilhado. Para cópia profunda existe `structuredClone`. Isso explica por que o React exige objetos novos no estado e por que funções puras não devem alterar o que recebem.

**[Pl] JSON.** O que as rotas devolvem (`NextResponse.json({ ok: true, code })`) é um objeto convertido em texto JSON. `Date`, `Map`, `Set`, `undefined` e funções não sobrevivem a essa conversão. Por isso datas trafegam como texto `'YYYY-MM-DD'` e são convertidas com `parseDbDate` (seção 7.4).

### 1.12 Exercícios de fundamentos

1. **[Jr] Corrigir o bug do WhatsApp.** Em [`lib/utils.ts:138`](../amavs-next/lib/utils.ts#L138), o `filter(Boolean)` apaga as linhas em branco da mensagem. Tente achar e corrigir sozinho; o roteiro completo, com o teste, está na seção 14.
2. **[Jr] Reescrever `bidStats` de outros jeitos.** Uma versão com `filter(…).length` para cada contador e outra com `reduce`. Compare: qual é mais legível? Quantas vezes cada uma percorre a lista?
3. **[Jr] Trocar o `switch` por objeto.** Reescreva `computeAuto` em `StatsSection.tsx` como `const autoValues: Record<string, number> = { fleet_size: fleetSize, … }` e `autoValues[key] ?? 0`.
4. **[Pl] `switch` exaustivo.** Crie uma função `bidStatusColor(status: BidStatus)` com `switch` e `default` usando `never`. Apague um `case` e veja o `npm run typecheck` falhar.
5. **[Pl] Upload em paralelo.** Reescreva o laço de upload do portfólio com `Promise.allSettled`, mantendo a mensagem de erro por arquivo. Meça a diferença com 10 fotos e explique quando o sequencial ainda é melhor.

### 1.13 Perguntas de entrevista sobre fundamentos

**Júnior**

1. *Diferença entre `var`, `let` e `const`?* Escopo de função × bloco, reatribuição e TDZ. Exemplo: `let open = 0` em `bidStats` porque o contador muda; `const conflicts = []` porque o array é o mesmo, só recebe itens.
2. *`const` com array pode receber `push`?* Pode. `const` protege a variável, não o conteúdo.
3. *Diferença entre `i++` e `++i`?* O valor devolvido: antigo × novo. Numa linha sozinha, nenhuma.
4. *Quais valores são falsy?* `false`, `0`, `''`, `null`, `undefined`, `NaN` (e `-0`, `0n`). `[]` e `{}` são truthy.
5. *Diferença entre `==` e `===`?* `===` não converte tipo. O projeto só usa `===`.
6. *O que é arrow function e qual a diferença para `function`?* Sintaxe curta, sem `this` próprio, sem *hoisting*.
7. *Diferença entre `map`, `filter` e `forEach`?* `map` transforma e devolve array novo; `filter` seleciona; `forEach` só executa e devolve `undefined`.
8. *Quando usar `for…of` e quando `for…in`?* `for…of` para os valores de um array; `for…in` para as chaves de um objeto.

**Pleno**

1. *Por que o projeto usa `??` num lugar e `||` em outro?* `??` preserva `0` e `''` (override de indicador igual a 0); `||` troca todo falsy (e-mail vazio vira `null`).
2. *O que é closure? Exemplo no seu código?* `loginUrl` no middleware usa `request`; o `Map` do rate limit sobrevive entre requisições na mesma instância.
3. *O que acontece com `await` dentro de `forEach`?* Nada espera. Use `for…of` (sequencial) ou `Promise.all` / `allSettled` (paralelo).
4. *Por que o React exige um array novo no estado?* Ele compara referências. `push` muda o conteúdo, mas a referência continua a mesma.
5. *`sort` altera o array original?* Sim. Em `rankVehicles` não é problema porque ordena o array criado pelo `map`; para não alterar, `toSorted` ou `[...arr].sort()`.
6. *Por que `['10','10','10'].map(parseInt)` dá `[10, NaN, 2]`?* O `map` passa o índice como segundo argumento, e o `parseInt` o usa como base.
7. *`switch` ou objeto de consulta?* Objeto para mapear valor → valor, com `Record` garantindo todas as chaves; `switch` para lógicas diferentes, de preferência exaustivo com `never`.
8. *Cópia rasa × profunda?* Spread copia só o primeiro nível; `structuredClone` copia tudo.

---

## 2. O caminho de uma requisição [Jr]

Entender por onde uma requisição passa é a base de qualquer conversa de back-end. São três cenários.

### 2.1 Visitante abre `/licitacoes`

1. O navegador pede `GET /licitacoes` para a Vercel.
2. O [`middleware.ts`](../amavs-next/middleware.ts) roda primeiro. Como a rota não começa com `/admin`, ele só repassa.
3. O Next.js executa o **Server Component** [`app/(public)/licitacoes/page.tsx`](../amavs-next/app/(public)/licitacoes/page.tsx) **no servidor**.
4. Ele consulta o Postgres com a chave pública (`anon`). O banco aplica RLS e só devolve itens com `is_published = true`.
5. Em paralelo, conta as licitações ganhas com a chave `service_role` (função `wonBidsCount`). Só o **número** vai para a página, nunca as linhas.
6. O servidor devolve HTML pronto. O navegador recebe a página já com o conteúdo (bom para SEO).

**Perguntas típicas**
- *O que é SSR? Por que usar aqui?* O HTML é gerado no servidor a cada requisição. Para um site que precisa aparecer no Google para "transporte licitação Brasília", o robô recebe o conteúdo pronto.
- *Qual a diferença entre Server Component e Client Component?* O Server roda só no servidor, pode acessar segredos e banco, e não manda JavaScript para o navegador. O Client (`'use client'`) roda no navegador e é necessário para estado e interação (`useState`, `onClick`). Exemplo no projeto: `AtestadosSection.tsx` (server, busca dados) renderiza `AtestadosClient.tsx` (client, animações).

### 2.2 Visitante envia o formulário de orçamento

1. [`OrcamentoForm.tsx`](../amavs-next/app/(public)/orcamento/OrcamentoForm.tsx) faz `fetch('/api/leads', { method: 'POST', body: JSON })`.
2. O Route Handler [`app/api/leads/route.ts`](../amavs-next/app/api/leads/route.ts) executa, nesta ordem:
   - `isSameOrigin`: recusa se vier de outro site (**403**);
   - `hitRateLimit`: no máximo 5 envios por IP a cada 10 minutos (**429**);
   - `leadSchema.safeParse`: valida e normaliza com Zod (**400** se inválido);
   - insere com `service_role` e devolve **201** com o código do pedido.
3. O formulário abre o WhatsApp **sem esperar** a resposta (`keepalive: true`). Se esperasse, o navegador bloquearia o pop-up, porque `window.open` só é permitido logo após um clique.

### 2.3 Admin entra no painel

1. `POST /api/admin/check-rate-limit`: o e-mail está bloqueado por tentativas?
2. `supabase.auth.signInWithPassword`: o Supabase confere a senha e grava cookies de sessão (JWT).
3. Se o usuário tem 2FA cadastrado, a sessão está em **AAL1** e o login pede o código TOTP (`mfa.challengeAndVerify`). Depois a sessão sobe para **AAL2**.
4. Em toda rota `/admin/*`, o middleware confere: sessão válida (`getUser`), e-mail na lista `ADMIN_EMAILS` e AAL2 se houver fator cadastrado.
5. As telas do painel consultam o banco com o JWT do usuário. O banco confere `is_admin()` em cada consulta.

**Pergunta clássica:** *por que conferir no middleware **e** no banco?* Defesa em profundidade. O middleware impede que a tela abra. O banco impede que o dado saia, mesmo que alguém chame a API REST do Supabase direto, sem passar pelo site. Se uma camada falhar, a outra segura.

---

## 3. HTTP e APIs [Jr]

| Código | Onde aparece no projeto | Significado |
|---|---|---|
| 200 | `GET /api/disponibilidade` | OK |
| 201 | `POST /api/leads` | Recurso criado |
| 307 | `/admin/*` sem login | Redirecionamento temporário para `/admin/login` |
| 400 | corpo inválido no `/api/leads` | Erro do cliente: dados inválidos |
| 403 | `Origin` de outro domínio | Proibido |
| 404 | `/licitacoes/slug-que-nao-existe` | Não encontrado |
| 429 | 6º envio em 10 min | Muitas requisições |
| 503 | banco não configurado | Serviço indisponível |

- **Validação na borda:** todo dado que vem de fora é tratado como hostil. [`lib/validation.ts`](../amavs-next/lib/validation.ts) define o formato aceito: datas `YYYY-MM-DD`, telefone só com dígitos, `vehicle_id` precisa ser UUID, tamanhos máximos e campo honeypot. Um campo `vehicle_id` que não é UUID é rejeitado antes de chegar a qualquer consulta.
- **Honeypot:** campo invisível no formulário. Uma pessoa não vê e deixa vazio; robôs preenchem tudo. Se vier preenchido, a requisição é rejeitada.
- **Cache HTTP:** `/api/disponibilidade` responde com `Cache-Control: s-maxage=60, stale-while-revalidate=300`. A CDN da Vercel guarda a resposta por 60 s, então 1.000 visitantes no mesmo minuto geram 1 consulta ao banco.

**[Pl]** *O rate limit é em memória. Qual o problema?* Na Vercel cada instância serverless tem a própria memória, então o limite vale por instância, não global, e zera quando a instância é reciclada. Para o volume atual serve. Em escala, usaria um contador compartilhado: Redis com `INCR` + `EXPIRE` (janela fixa), um sorted set (janela deslizante) ou uma tabela no Postgres. Saiba explicar a diferença entre **janela fixa** (simples, mas permite rajada na virada da janela) e **janela deslizante** (mais justa, um pouco mais cara).

---

## 4. Banco de dados [Jr → Pl]

Arquivos: [`supabase/schema.sql`](../amavs-next/supabase/schema.sql) e [`supabase/migrations/`](../amavs-next/supabase/migrations).

### 4.1 Básico [Jr]

- **Chave primária** `uuid default gen_random_uuid()`. *Por que UUID e não número sequencial?* Não revela quantos registros existem e não deixa adivinhar o próximo id (`/contratos/124`). O custo é ocupar mais espaço e ter índice menos compacto.
- **Chave estrangeira** `bids.portfolio_id → portfolio_items(id) on delete set null`: se o item do portfólio for apagado, a licitação continua existindo, só perde o vínculo.
- **CHECK** `status in ('prospeccao', …)`: o banco recusa um status inválido mesmo que o front-end tenha bug. Regra importante no banco não depende do código da aplicação.
- **Índices** `bids_session_idx (session_at)`: o painel ordena e filtra por data de sessão. Sem índice, o Postgres leria a tabela inteira.

### 4.2 Row Level Security (RLS) [Jr → Pl]

Este é o conceito mais importante do projeto. O Supabase expõe o banco por uma API REST, e a chave `anon` fica no navegador **de propósito**. Quem decide o que cada um vê são as **policies** no Postgres.

```sql
-- visitante só lê portfólio publicado
create policy portfolio_public_read on public.portfolio_items
  for select using (is_published);

-- admin faz tudo, mas só se estiver na tabela admin_users
create policy bids_admin_all on public.bids
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
```

- `using` filtra as linhas que a pessoa **lê, altera ou apaga**. `with check` valida as linhas que ela **grava**.
- **O bug original:** as policies eram `using (auth.role() = 'authenticated')`. Com o cadastro aberto, qualquer pessoa criava uma conta e virava "authenticated". Autenticação (quem você é) estava sendo usada como autorização (o que você pode fazer). Essa troca é o erro de segurança mais comum que existe (OWASP A01, *Broken Access Control*).

**[Pl] A função `is_admin()`**

```sql
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()); $$;
```

- `security definer`: a função roda com a permissão de quem a criou, então consegue ler `admin_users` mesmo que o usuário comum não tenha acesso a essa tabela.
- `set search_path = public`: sem isso, um usuário mal-intencionado poderia criar um objeto com o mesmo nome em outro schema e sequestrar a função. Toda função `security definer` deve fixar o `search_path`.
- `stable`: avisa o Postgres que o resultado não muda dentro da mesma consulta, o que permite otimizar.

**[Pl] Permissão por coluna**

```sql
revoke select on public.contracts from anon;
grant select (id, code, client, modality, status, start_date, end_date, is_public, contract_type)
  on public.contracts to anon;
```

RLS filtra **linhas**; `GRANT` por coluna filtra **colunas**. Juntos, o visitante vê só contratos públicos e, deles, nunca o valor ou as observações.

**[Pl] Migration idempotente:** a migration de segurança apaga **todas** as policies das tabelas e recria do zero (`for r in select … from pg_policies loop drop policy …`). Assim o resultado é o mesmo não importa o estado anterior do banco, e dá para rodar duas vezes sem erro.

**Como testar RLS (resposta de pleno):** subir um Postgres em container no CI, rodar as migrations e executar consultas trocando o papel com `set local role anon` / `set local request.jwt.claims = '{"sub": "…"}'`, verificando que o anônimo recebe zero linhas e o admin recebe todas. Isso ainda não existe no projeto e é um bom próximo passo.

### 4.3 PostgreSQL, MongoDB e Supabase: o que é cada um [Jr → Pl]

Vagas costumam pedir "PostgreSQL", "MongoDB", "SQL e NoSQL". Os três nomes que você mais vai ver estão em **categorias diferentes**:

| Nome | O que é | Categoria |
|---|---|---|
| **PostgreSQL** | Um banco de dados (SGBD) | Relacional (SQL) |
| **MySQL** | Outro banco relacional, usado na versão PHP do projeto (`amavs-v2`) | Relacional (SQL) |
| **MongoDB** | Um banco de dados de documentos | Não relacional (NoSQL) |
| **Supabase** | Uma **plataforma** construída em cima de um PostgreSQL | Backend como serviço (BaaS) |

**O ponto mais importante: o Supabase não é um banco. O banco é o PostgreSQL.** Quando você usa o Supabase, você usa um PostgreSQL de verdade, com SQL de verdade (o `schema.sql` e as migrations deste projeto são PostgreSQL puro). O Supabase coloca em volta dele:

- uma **API REST gerada automaticamente** (PostgREST): cada tabela vira uma URL;
- **autenticação** (login, JWT, 2FA) integrada ao banco, com `auth.uid()` disponível dentro das policies;
- **storage** de arquivos (os buckets `portfolio` e `company-docs`);
- o **painel** com SQL Editor.

Na entrevista, a frase certa é: *"uso PostgreSQL, hospedado no Supabase"*. Tudo o que você sabe de tabelas, `JOIN`, índices, constraints, transações e RLS vale em qualquer PostgreSQL: no RDS da AWS, num servidor próprio ou num container. O que é **específico do Supabase** é pouco: o SDK (`supabase.from(…)`), o Auth e o Storage.

**Relacional (SQL) × documentos (NoSQL) [Jr]**

| Relacional (PostgreSQL) | Documentos (MongoDB) |
|---|---|
| Banco → **tabelas** → **linhas** → **colunas** | Banco → **coleções** → **documentos** → **campos** |
| Formato fixo: toda linha de `bids` tem as mesmas colunas | Formato flexível: cada documento pode ter campos diferentes |
| Relaciona tabelas com **chave estrangeira** e `JOIN` | Guarda os dados relacionados **dentro** do documento, ou referencia o `_id` de outro |
| Linguagem SQL | Métodos e objetos JSON (`find`, `aggregate`) |
| Chave primária que você define (aqui, `uuid`) | `_id` gerado automaticamente (`ObjectId`) |
| Regras no banco: `CHECK`, `NOT NULL`, `UNIQUE`, `FOREIGN KEY` | Validação de schema opcional; a maior parte das regras fica no código |

**A mesma consulta nos três jeitos.** "Licitações ganhas, da mais recente para a mais antiga":

```sql
-- SQL (PostgreSQL)
select organization, awarded_value
from bids
where status = 'ganha'
order by session_at desc;
```

```ts
// SDK do Supabase (como o painel faz)
await supabase
  .from('bids')
  .select('organization, awarded_value')
  .eq('status', 'ganha')
  .order('session_at', { ascending: false })
// por baixo: GET /rest/v1/bids?select=organization,awarded_value&status=eq.ganha&order=session_at.desc
// o PostgREST traduz isso para o SQL acima, e o Postgres aplica a RLS
```

```js
// MongoDB (driver oficial ou mongosh)
db.bids
  .find({ status: 'ganha' }, { organization: 1, awarded_value: 1 })
  .sort({ session_at: -1 })
```

**Como este projeto ficaria no MongoDB [Pl].** É um bom exercício para responder "você conhece NoSQL?" com profundidade:

- `portfolio_items.photos` já é um array (`text[]`). Num documento do Mongo, as fotos ficariam naturalmente dentro do item, igual.
- `bids.portfolio_id` é uma chave estrangeira com `on delete set null`. No Mongo, seria só um campo com o `_id` do portfólio, **sem garantia** do banco: se o item fosse apagado, a licitação continuaria apontando para algo que não existe, e o código teria de cuidar disso.
- O `CHECK (status in (…))` sumiria do banco e passaria para o código (Mongoose ou o Zod).
- **A RLS não existe no MongoDB.** Toda a autorização deste projeto (seção 4.2) teria de ir para a camada da aplicação. É o argumento mais forte para o PostgreSQL aqui: um sistema com dinheiro, contratos e permissões se beneficia de regras garantidas pelo próprio banco.

**Postgres também guarda documentos.** A coluna `details jsonb` do `audit_log` guarda um JSON livre, como faria um documento do Mongo, e o Postgres permite consultar e indexar campos dentro dele. Muita empresa usa Postgres com `jsonb` justamente para ter as duas coisas.

**Quando o MongoDB é a melhor escolha [Pl]:** dados com formato muito variável (catálogo de produtos com atributos diferentes por categoria), documentos que são lidos sempre inteiros, volume altíssimo de escrita que precisa ser distribuído entre vários servidores (*sharding*), eventos e logs. Quando há muitas relações, regras de integridade e transações envolvendo dinheiro, o relacional costuma ganhar.

**Termos que caem em entrevista**

- **ACID** [Jr → Pl]: Atomicidade (tudo ou nada), Consistência (as regras do banco valem sempre), Isolamento (transações simultâneas não se atrapalham), Durabilidade (gravou, não se perde). As migrations deste projeto rodam entre `begin` e `commit`: se uma linha falhar, nada é aplicado. O MongoDB tem transações com vários documentos desde a versão 4.0, mas o modelo dele incentiva a evitar precisar delas.
- **Normalização × desnormalização** [Pl]: normalizar é não repetir dados (o nome do órgão fica em uma tabela, e as outras apontam para ela). Desnormalizar é repetir de propósito para ler mais rápido. O relacional tende ao primeiro; o Mongo, ao segundo.
- **ORM e ODM** [Jr]: bibliotecas que mapeiam tabelas para objetos do código. Para SQL no Node: Prisma, Drizzle, TypeORM, Sequelize, ou o driver `pg` direto. Para Mongo: Mongoose, ou o driver `mongodb`. Este projeto não usa ORM: o SDK do Supabase gera as consultas.
- **Pool de conexões em serverless** [Pl]: cada função da Vercel que abre uma conexão direta com o Postgres consome uma das poucas conexões que ele aceita (na casa das centenas). Com muitas instâncias ao mesmo tempo, elas acabam. As soluções são um *pooler* (PgBouncer; o Supabase oferece o Supavisor) ou acessar o banco por HTTP, que é o que este projeto faz via PostgREST. Na AWS, o equivalente é o RDS Proxy.
- **Escala vertical × horizontal** [Pl]: vertical é uma máquina maior; horizontal é mais máquinas. O Postgres escala bem na vertical e com réplicas de leitura; o Mongo foi desenhado para dividir os dados entre máquinas (*sharding*).

**Perguntas**

- *[Jr] Qual a diferença entre SQL e NoSQL?* Tabelas com formato fixo e relações garantidas pelo banco × documentos flexíveis com relações tratadas no código.
- *[Jr] O Supabase é um banco de dados?* Não: é uma plataforma em cima do PostgreSQL. O banco é o Postgres.
- *[Pl] Por que Postgres e não Mongo neste projeto?* Dados relacionados (licitação ↔ portfólio, veículo ↔ reservas), regras de integridade (`CHECK`, chave estrangeira) e, principalmente, autorização no banco com RLS.
- *[Pl] Como você migraria do Supabase para o RDS?* Exportar com `pg_dump` e importar com `pg_restore`; as tabelas, policies e funções vêm junto, porque é Postgres nos dois lados. Trocar o Supabase Auth exigiria adaptar `auth.uid()` nas policies para ler o usuário do JWT do novo provedor (por exemplo, Cognito), e o Storage iria para o S3.

### 4.4 Docker [Jr]

O Docker aparece em quase toda vaga de back-end, junto com o banco.

- **Imagem:** um pacote com tudo o que um programa precisa para rodar (sistema, dependências, código). Exemplo: a imagem oficial `postgres:16`.
- **Container:** uma imagem em execução, isolada do resto da máquina.
- **Dockerfile:** a receita para montar a imagem da sua aplicação.
- **Docker Compose:** um arquivo (`compose.yaml`) que sobe vários containers juntos, por exemplo a API e o banco.

Subir um PostgreSQL local para estudar leva uma linha:

```bash
docker run --name pg-estudo -e POSTGRES_PASSWORD=estudo -p 5432:5432 -d postgres:16
```

**No projeto:** a aplicação não usa Docker, porque a Vercel faz o build e roda as funções sem você gerenciar servidor. Mas o Docker entra em dois pontos:

- a **CLI do Supabase** (`supabase start`) sobe uma cópia completa do Supabase na sua máquina usando containers;
- os **testes de integração das policies** (seção 4.2) precisariam de um Postgres em container no CI, para rodar as migrations do zero e testar o acesso de `anon` e de admin.

**[Pl] Pergunta:** *por que usar container no CI em vez de um banco de teste compartilhado?* Cada execução começa de um banco limpo e idêntico, os testes não interferem uns nos outros, e o ambiente é o mesmo na sua máquina e no GitHub Actions.

---

## 5. Autenticação e autorização [Jr → Pl]

| Conceito | No projeto |
|---|---|
| Autenticação (quem é você) | Supabase Auth, e-mail e senha |
| Sessão | JWT em cookie, gerenciado e renovado pelo `@supabase/ssr` |
| Autorização (o que pode fazer) | `ADMIN_EMAILS` no middleware + `is_admin()` no banco |
| 2º fator | TOTP (Google Authenticator), níveis AAL1/AAL2 |
| Expiração por inatividade | `SessionGuard` faz logout após 30 min |

- **Cookie de sessão** [Pl]: o `@supabase/ssr` não marca o cookie como `httpOnly`, porque o cliente do navegador também precisa ler a sessão. Consequência: um XSS conseguiria roubar o token. Por isso o CSP e o escape automático do React importam tanto aqui. Trade-off que vale saber explicar.
- **JWT** [Jr]: token assinado com três partes (header, payload, assinatura). O servidor confia no conteúdo porque confere a assinatura. *Ele é criptografado?* Não, só assinado: qualquer um lê o payload (base64), mas ninguém consegue alterá-lo sem invalidar a assinatura.
- **`getUser()` vs `getSession()`** [Pl]: `getSession` lê o cookie local e não confirma nada com o servidor; `getUser` valida o token no Supabase. O middleware usa `getUser` porque é a barreira de segurança.
- **AAL** [Pl]: *Authenticator Assurance Level*. AAL1 = provou um fator (senha). AAL2 = provou dois. O bug original: o 2FA podia ser cadastrado, mas como ninguém conferia o AAL, a senha sozinha bastava.
- **Bloqueio de força bruta** [Pl]: o bloqueio era só por e-mail, e a rota que registra falhas era pública. Um script mandando 5 falhas a cada 15 minutos deixava o dono trancado para sempre: o mecanismo de defesa virou ataque (negação de serviço). A correção conta por **e-mail + IP** (5 falhas) e tem um teto global por e-mail (20), para pegar ataque distribuído. Ver [`check-rate-limit/route.ts`](../amavs-next/app/api/admin/check-rate-limit/route.ts).
- **Log de auditoria confiável** [Pl]: a rota `log-attempt` só grava "login com sucesso" se a própria requisição trouxer uma sessão válida do mesmo e-mail. Senão, qualquer um forjaria entradas no log.

---

## 6. Segurança: os achados como histórias de entrevista [Jr → Pl]

Use o formato **Situação → Problema → Ação → Resultado**. Cada achado abaixo dá uma resposta para "conte um problema difícil que você resolveu".

| # | Situação | Ação | Categoria OWASP |
|---|---|---|---|
| 1 | Cadastro aberto + policies por `authenticated` = qualquer um vira admin | `admin_users` + `is_admin()` + `ADMIN_EMAILS` + cadastro desligado | A01 Broken Access Control |
| 2 | Formulário baixava `reservations` inteira (nome e telefone de clientes) | `/api/disponibilidade` devolve só datas; tabela fechada para `anon` | A01 / exposição de dado pessoal (LGPD) |
| 3 | Valor e observações de contratos legíveis pela API REST | `GRANT` por coluna + policy `is_public` | A01 |
| 4 | 2FA cadastrável mas não exigido | Checagem de AAL no login e no middleware | A07 Identification and Authentication Failures |
| 5 | Bloqueio de login usável como ataque | Bloqueio por e-mail + IP com teto global | A07 |
| 6 | `/auth/callback?next=//site-malicioso.com` | `safeRedirectPath` aceita só caminho interno | Open Redirect (usado em phishing) |
| 7 | Fotos com coordenadas GPS no EXIF | Metadados removidos antes de publicar | Exposição de informação |

**Outros conceitos que podem cair:**
- **XSS e CSP** [Jr]: o React escapa texto automaticamente. O CSP em [`next.config.mjs`](../amavs-next/next.config.mjs) limita de onde scripts, imagens e iframes podem vir. *Por que `unsafe-inline` ainda está lá?* O Next.js injeta scripts inline; para tirar, é preciso CSP com *nonce* gerado no middleware. É um trade-off conhecido, e um bom "o que eu faria a seguir".
- **CSRF** [Jr]: cookies `SameSite=Lax` já barram a maior parte, e as rotas que escrevem conferem o cabeçalho `Origin`.
- **Segredos** [Jr]: `SUPABASE_SERVICE_ROLE_KEY` não tem prefixo `NEXT_PUBLIC_`, então o Next.js nunca a coloca no bundle do navegador. [`lib/supabase-admin.ts`](../amavs-next/lib/supabase-admin.ts) ainda lança erro se for importado no navegador.
- **Menor privilégio** [Pl]: cada caminho usa a credencial mais fraca que resolve. Visitante usa `anon`; admin usa o próprio JWT; `service_role` só no servidor, e só para o que precisa.

---

## 7. Regras de negócio [Jr → Pl]

### 7.1 Disponibilidade da frota — [`lib/availability.ts`](../amavs-next/lib/availability.ts)

Dois intervalos `[aS, aE]` e `[bS, bE]` se sobrepõem quando:

```
aS <= bE  &&  aE >= bS
```

Desenhe numa folha os 4 casos (b antes, b depois, b dentro, b cruzando) e confira. É pergunta clássica.

O ranking dá uma pontuação: +1000 se indisponível, +500 se pequeno demais, + o número de lugares sobrando. Menor pontuação ganha. **[Pl]** *Por que essa regra roda no navegador?* Para a resposta ser instantânea enquanto a pessoa digita. Os dados que ela usa, porém, chegam já filtrados pela API (só datas, sem nomes).

### 7.2 Indicadores de licitação — [`lib/licitacoes.ts`](../amavs-next/lib/licitacoes.ts)

`bidStats` é uma **função pura**: recebe uma lista e uma data "agora" e devolve números, sem acessar banco nem relógio. Por isso é fácil de testar. Passar `now` como parâmetro em vez de usar `new Date()` lá dentro é **injeção de dependência** na forma mais simples.

### 7.3 Validade de certidões — [`lib/documents.ts`](../amavs-next/lib/documents.ts)

Compara só **datas de calendário** (`Date.UTC(ano, mês, dia)`), não horários, para "vence hoje" não virar "vencido" às 21h por causa de fuso.

### 7.4 O bug de fuso horário [Pl]

`new Date('2016-10-24')` é interpretado como meia-noite **UTC**. Exibido em Brasília (UTC-3), vira 23/10. Toda data pura do sistema aparecia um dia antes. A correção em [`lib/utils.ts`](../amavs-next/lib/utils.ts) (`parseDbDate`) trata `YYYY-MM-DD` como data local. O teste roda com `TZ=America/Sao_Paulo` fixo no [`vitest.config.mts`](../amavs-next/vitest.config.mts), porque no CI (UTC) o bug simplesmente não aparece. Esse é o tipo de detalhe que mostra maturidade: o teste precisa reproduzir o ambiente onde o bug acontece.

### 7.5 QR Code permanente

Os QR Codes colados nos ônibus apontam para `/frota/{slug}`, e não para o UUID. O slug é gerado uma vez e não muda, então o adesivo continua funcionando mesmo se o banco for migrado. **Pergunta [Pl]:** *por que não usar o id?* Porque o id é detalhe de implementação do banco, e o QR é um contrato público de longa duração com o mundo físico.

---

## 8. Testes e CI [Jr → Pl]

```bash
cd amavs-next
npm test            # 37 testes, Vitest
npm run typecheck   # tsc --noEmit
```

| Arquivo | O que cobre |
|---|---|
| `availability.test.ts` | sobreposição de datas, bloqueio indefinido, reserva cancelada, ranking |
| `licitacoes.test.ts` | indicadores, validade de certidões, slugs |
| `validation.test.ts` | Zod, redirect seguro, rate limit, data em fuso de Brasília |

- **Pirâmide de testes** [Jr]: muitos testes unitários (rápidos, lógica pura), alguns de integração (rota + banco) e poucos end-to-end (navegador). O projeto hoje tem a base unitária.
- **CI** [Jr]: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) roda `npm ci`, typecheck, testes e build a cada push e Pull Request. `npm ci` (e não `npm install`) instala exatamente o que está no `package-lock.json`.
- **[Pl] O que falta e como faria:** testes de integração das rotas `/api/*` (chamar o handler com um `Request` montado à mão) e das policies RLS (Postgres em container), e um teste E2E de login com Playwright.

---

## 9. Git e trabalho em equipe [Jr]

- **Commit pequeno e com mensagem que explica o porquê.** Veja `git log`: `security: fecha vazamentos de dados e restringe o painel a admins`.
- **Fluxo de empresa:** tarefa no Jira/Issues → `git switch -c feat/minha-tarefa` → commits → `git push` → abrir Pull Request → CI roda → colega revisa → merge na `main` → deploy automático.
- **Quem mudou o quê:** `git log -- caminho/arquivo` e `git blame arquivo`.
- **Segredos nunca no git:** `.env.local` está no `.gitignore`. Se vazar, não basta apagar o arquivo: o segredo continua no histórico e precisa ser **trocado**.

---

## 10. Ponte para vagas com AWS [Pl]

O projeto não usa AWS, e você não deve dizer que usa. Mas saber traduzir cada peça mostra que você entende os conceitos e não só a ferramenta:

| Peça no projeto | Equivalente na AWS | O que dizer |
|---|---|---|
| Vercel (Route Handlers serverless) | Lambda + API Gateway | Mesmo modelo: função sem estado, escala por requisição, cold start |
| Postgres do Supabase | RDS for PostgreSQL / Aurora | RLS é recurso do Postgres, funciona igual no RDS |
| Supabase Auth | Cognito | JWT, MFA TOTP, grupos para papéis de admin |
| Supabase Storage + URL assinada | S3 + presigned URL | O bucket privado `company-docs` com link de 60 s é o mesmo conceito |
| Variáveis da Vercel | Secrets Manager / Parameter Store | Segredo fora do código, com rotação |
| Rate limit em memória | ElastiCache (Redis) ou WAF rate-based rule | Contador compartilhado entre instâncias |
| Cron de alertas (a fazer) | EventBridge Scheduler + Lambda | Job agendado diário |
| Logs | CloudWatch | Logs estruturados + alarmes |

**Exercício que vale ouro:** implementar o monitor de editais do PNCP (seção 12) como uma Lambda agendada pelo EventBridge, gravando no mesmo Postgres. Isso dá uma experiência real de AWS para colocar no currículo.

---

## 11. Perguntas de entrevista

### Júnior

1. **O que é uma API REST?** Interface sobre HTTP em que recursos têm URLs e os verbos dizem a ação (GET lê, POST cria…). Ex.: `POST /api/leads` cria um pedido.
2. **Diferença entre 401 e 403?** 401: não sei quem você é (falta autenticação). 403: sei quem você é, mas você não pode (falta autorização).
3. **Por que validar no servidor se o formulário já valida?** Porque qualquer um pode chamar a API sem o formulário (curl, Postman). Validação no front é conforto; no servidor é segurança.
4. **O que é uma variável de ambiente e por que usar?** Configuração fora do código: segredos e valores que mudam entre local e produção.
5. **SQL injection: o projeto corre risco?** As consultas usam o SDK, que parametriza os valores, e os campos que viram filtro (como `vehicle_id`) são validados como UUID antes.
6. **O que é `async/await`?** Forma de escrever código assíncrono como se fosse sequencial. `Promise.all` roda várias consultas em paralelo, como em `licitacoes/page.tsx`.
7. **Server Component vs Client Component?** Ver seção 2.1.
8. **O que o middleware faz?** Ver seção 2.3.
9. **Por que TypeScript?** Erros de tipo aparecem antes de rodar. Ex.: o `Record<BidStatus, string>` obriga a ter rótulo para cada status; se um status novo for criado, o compilador avisa.
10. **Como você testa uma função que depende da data de hoje?** Recebendo a data como parâmetro (`bidStats(bids, now)`).

### Pleno

1. **Como você garante que um usuário não acesse dados de outro mesmo com bug no front?** Autorização no banco (RLS) e permissão por coluna; o front é só conveniência.
2. **O rate limit funciona com 10 instâncias serverless?** Não de forma global. Explique janela fixa vs deslizante e a solução com Redis.
3. **Como você faria o alerta diário de certidões vencendo?** Cron (Vercel Cron ou EventBridge) chamando uma rota protegida por segredo, que consulta `documentStatus` e envia e-mail. Idempotência: registrar o que já foi avisado para não mandar duas vezes se o job reexecutar.
4. **Como faria deploy de uma migration sem quebrar produção?** Mudanças compatíveis primeiro (adicionar coluna/tabela), deploy do código que funciona com e sem a mudança, depois a parte restritiva. Foi exatamente a ordem usada aqui: o código tem fallback quando a tabela `portfolio_items` ainda não existe.
5. **O que acontece se dois admins editarem a mesma licitação ao mesmo tempo?** Hoje, o último a salvar vence (*last write wins*). Para evitar: controle otimista com `updated_at` na cláusula `WHERE` do update; se zero linhas forem afetadas, alguém salvou antes e a tela avisa.
6. **Como você observaria esse sistema em produção?** Logs estruturados nas rotas, alertas de taxa de erro 5xx, métricas de latência do banco, e o `audit_log` para ações de admin.
7. **Por que a regra de disponibilidade roda no cliente? Riscos?** Velocidade da resposta. Risco: o cliente pode ser manipulado, mas aqui ele só **sugere** um veículo; a decisão final é humana, no painel. Se houvesse reserva automática, a checagem teria de ser repetida no servidor dentro de uma transação.
8. **Como evitar duas reservas sobrepostas para o mesmo ônibus?** Constraint de exclusão no Postgres (precisa da extensão `btree_gist` para comparar o `uuid` com `=`): `EXCLUDE USING gist (vehicle_id WITH =, daterange(start_date, end_date, '[]') WITH &&)`. O banco recusa a sobreposição mesmo com duas requisições simultâneas, coisa que uma checagem no código não garante.
9. **Como migrar para multi-empresa (SaaS)?** Coluna `company_id` em todas as tabelas, policies RLS filtrando por `company_id` do JWT, e índices compostos começando por `company_id`.
10. **O que você mudaria primeiro se tivesse uma semana?** Testes de integração das policies, CSP com nonce e o monitor de editais do PNCP.

---

## 12. Exercícios para fixar (e para contar na entrevista)

Fazer **um** destes sozinho vale mais que ler o guia inteiro duas vezes.

1. **[Jr] Endpoint de saúde.** Crie `GET /api/health` que responde `{ ok: true, db: true/false }`, testando uma consulta simples no banco.
2. **[Jr] Teste novo.** Escreva testes para `checkVehicleAvailability` com uma reserva que começa exatamente no dia em que a viagem termina. Ela deveria conflitar?
3. **[Pl] Rate limit no Postgres.** Troque `lib/rate-limit.ts` por uma tabela `rate_limits (key, window_start, count)` com `insert … on conflict do update`. Compare com a versão em memória.
4. **[Pl] Monitor de editais.** Use a API pública do PNCP (`https://pncp.gov.br/api/consulta`) para buscar contratações de transporte de passageiros no DF e criar licitações em `prospeccao`. Rode como cron. Pense em: paginação, deduplicação pelo número de controle e o que fazer se a API estiver fora.
5. **[Pl] Bloquear sobreposição no banco.** Implemente a constraint `EXCLUDE` da pergunta 8 e escreva um teste que tenta inserir duas reservas conflitantes.

---

## 13. Júnior ou pleno?

Ser pleno não depende do tamanho do projeto, e sim de tempo resolvendo problemas em produção e de autonomia. Este projeto te coloca em boa posição para vagas **júnior** e ajuda a disputar vagas **pleno** de empresas menores, desde que você:

- explique cada decisão das seções 4 a 7 sem olhar o código;
- tenha feito pelo menos um exercício [Pl] da seção 12 sozinho;
- fale com honestidade sobre como o projeto foi feito. Se usou IA como ferramenta, diga isso e mostre que entende e consegue mudar o código. Entrevistador experiente percebe em duas perguntas quando alguém não entende o próprio projeto, e honestidade com domínio técnico pesa mais que parecer ter feito tudo sozinho.

---

## 14. Como achar e corrigir um bug: o caso da mensagem do WhatsApp [Jr → Pl]

Este capítulo segue, passo a passo, um bug real que está no ar. Use o mesmo roteiro em qualquer bug, e conte a história na entrevista quando perguntarem "como você depura um problema?".

### 14.1 O sintoma

Quem pede orçamento pelo site é levado ao WhatsApp com uma mensagem pronta. A mensagem deveria ter os blocos separados por uma linha em branco (título; nome e telefone; trajeto e datas). Ela chega toda grudada:

```
*Solicitação de Orçamento - Amav's Turismo*
👤 *Nome:* Ana
📞 *Telefone:* 61999990000
🗺️ *Origem:* Brasília
…
```

**Como alguém perceberia isso:** testando o formulário de ponta a ponta e olhando a mensagem que chegou, que é o teste que mais pega bug visível. Ou lendo o código com atenção ao `filter(Boolean)` (seção 1.4).

### 14.2 O roteiro

**1. Reproduzir.** Antes de mexer em qualquer coisa, faça o bug acontecer de propósito, do jeito mais curto possível. Não precisa abrir o site: chame a função direto, num terminal dentro de `amavs-next/`:

```bash
npx tsx -e "import { buildWhatsAppMessage } from './lib/utils'; console.log(JSON.stringify(buildWhatsAppMessage({ name: 'Ana', phone: '61999990000', origin: 'Brasília', destination: 'Goiânia', travelDate: '10/11/2026', passengers: 20 })))"
```

O `JSON.stringify` mostra os `\n` de forma visível. Aparece `…Turismo*\n👤 *Nome:*…`: só **um** `\n` entre o título e o nome. Deveriam ser dois (`\n\n`).

**2. Localizar.** Procure quem monta a mensagem: na busca do VS Code (`Ctrl+Shift+F`), procure por `Solicitação de Orçamento`. O resultado leva a `buildWhatsAppMessage`, em [`lib/utils.ts:120`](../amavs-next/lib/utils.ts#L120). Leia a função inteira antes de concluir qualquer coisa:

```ts
const lines = [
  `*Solicitação de Orçamento - Amav's Turismo*`,
  ``,                                                  // ← linha em branco desejada
  `👤 *Nome:* ${params.name}`,
  …
  params.returnDate ? `📅 *Data de Volta:* …` : null,  // ← null quando não há volta
  …
]
return lines.filter(Boolean).join('\n')
```

**3. Levantar uma hipótese e testá-la isolada.** A hipótese é que o `filter(Boolean)` está removendo as linhas vazias junto com os `null`. Teste só essa parte, no console do navegador (F12) ou com `node -e`:

```js
['título', '', 'nome', null, 'fim'].filter(Boolean)
// ['título', 'nome', 'fim']  ← o '' sumiu junto com o null
```

Hipótese confirmada: `''` é falsy, então o `filter(Boolean)` o descarta. O autor queria tirar só os `null` dos campos opcionais.

**4. Escrever o teste que falha, antes de corrigir.** Crie `lib/__tests__/whatsapp.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildWhatsAppMessage } from '../utils'

describe('buildWhatsAppMessage', () => {
  const pedido = { name: 'Ana', phone: '61999990000', origin: 'Brasília', destination: 'Goiânia', travelDate: '10/11/2026', passengers: 20 }

  it('separa o título dos dados com uma linha em branco', () => {
    const linhas = buildWhatsAppMessage(pedido).split('\n')
    expect(linhas[1]).toBe('')
  })

  it('não inclui campos opcionais que não foram preenchidos', () => {
    expect(buildWhatsAppMessage(pedido)).not.toContain('Data de Volta')
  })
})
```

Rode `npm test`. O primeiro teste deve **falhar**. Se passar, o teste está errado ou a hipótese está errada. Um teste que nunca falhou não prova nada.

**5. Corrigir com a menor mudança possível.**

```ts
return lines.filter((linha) => linha !== null).join('\n')
```

Duas armadilhas que valem conhecer:

- **Tirar o filtro inteiro não funciona.** `['a', null, 'b'].join('\n')` vira `'a\n\nb'`: o `join` transforma `null` em texto vazio, e cada campo opcional não preenchido viraria uma linha em branco a mais. O segundo teste existe para pegar isso.
- **[Pl] Tipo correto.** O array é `(string | null)[]`. Com `filter((linha): linha is string => linha !== null)`, o TypeScript passa a saber que o resultado é `string[]`. Esse `linha is string` se chama *type guard* (proteção de tipo).

**6. Verificar.** Os dois testes passam, `npm run typecheck` passa, e o teste de ponta a ponta também: abra o site, peça um orçamento e confira a mensagem no WhatsApp. Teste unitário verde não substitui olhar o resultado real.

**7. Registrar.** Um commit pequeno, com mensagem que explica o porquê:

```
fix: mantém as linhas em branco da mensagem de orçamento no WhatsApp

filter(Boolean) removia as linhas vazias junto com os campos opcionais nulos.
```

### 14.3 Ferramentas de depuração que vale dominar

| Ferramenta | Quando usar |
|---|---|
| `console.log(JSON.stringify(x, null, 2))` | Ver o valor exato, inclusive `''`, `null` e espaços que o log normal esconde |
| Breakpoint no VS Code ou no navegador (F12 → Sources) | Parar o código numa linha e inspecionar as variáveis daquele momento |
| Aba Network (F12) | Ver o que o navegador mandou para `/api/leads` e o que voltou (status, corpo) |
| Logs da Vercel (projeto → Logs) | Ver erros que acontecem no servidor em produção, como o `console.error` das rotas |
| *Stack trace* | Ler o erro **de baixo para cima** até achar a primeira linha que é do seu código |
| `git log -p -- lib/utils.ts` e `git blame` | Descobrir quando e por que uma linha mudou |
| `git bisect` [Pl] | Algo funcionava e parou: o git faz uma busca binária nos commits até achar o que quebrou |

### 14.4 Como contar na entrevista

> "Testando o fluxo de orçamento de ponta a ponta, vi que a mensagem chegava sem as quebras de linha. Reproduzi chamando a função direto no terminal, achei o `filter(Boolean)` que removia os textos vazios junto com os nulos, escrevi um teste que falhava, corrigi o filtro e confirmei no WhatsApp. Também vi que só tirar o filtro criaria outro bug, porque o `join` transforma `null` em linha vazia."

Essa resposta mostra método (reproduzir → isolar → testar → corrigir → verificar) e domínio de um detalhe da linguagem. É exatamente o que o entrevistador procura.

---

## 15. Vitrine: a história do projeto, GitHub e LinkedIn

### 15.1 Da versão PHP para a atual

O repositório guarda as duas versões, e a evolução é uma boa história para contar.

| | Versão antiga (`amavs-v2/`) | Versão atual (`amavs-next/`) |
|---|---|---|
| Linguagem | PHP no servidor, HTML e JavaScript no navegador | TypeScript nos dois lados |
| Páginas | Arquivos `.html` estáticos | Next.js 14 (App Router), com páginas geradas no servidor |
| Banco | MySQL, via PDO | PostgreSQL no Supabase |
| Consultas | *Prepared statements* do PDO | SDK do Supabase (API REST do PostgREST) |
| Login | `session_start` + `password_hash` / `password_verify` | Supabase Auth (JWT) + 2FA TOTP |
| Autorização | Verificação no código PHP | Middleware + RLS no banco |
| Hospedagem | Servidor compartilhado (Hostinger) | Vercel (serverless) |

**Pergunta provável:** *por que reescrever?* Resposta honesta e boa: a versão PHP era um site com formulário; a empresa precisava de um sistema (licitações, certidões, frota, agenda) com controle de acesso. Com TypeScript dos dois lados, os tipos de `Bid` e `Vehicle` são os mesmos no banco, na API e na tela. E a autorização no banco protege os dados mesmo se o código tiver um bug. Evite dizer que a versão antiga era "ruim": diga o que ela não atendia.

### 15.2 GitHub

O repositório é público. Quem abrir vai olhar, nesta ordem: o README, a lista de commits e um ou dois arquivos. Então:

- **README com imagens do painel.** O painel é a parte mais interessante e fica atrás do login. Três ou quatro prints (licitações, certidões vencendo, agenda) ou um GIF curto resolvem.
- **Descrição e tópicos do repositório** (engrenagem ao lado de "About"): uma frase em português e os tópicos `nextjs`, `typescript`, `postgresql`, `supabase`, `row-level-security`, `vitest`.
- **Link do site no "About"**, de preferência já no domínio oficial.
- **Commits pequenos e com mensagem clara** continuam valendo mais que qualquer texto.

### 15.3 LinkedIn

Escreva só o que você consegue explicar numa entrevista técnica. Todo item do perfil vira pergunta.

**Título:**

```
Desenvolvedor Back-end | JavaScript • TypeScript • Node.js • PostgreSQL • Next.js
```

**Seção "Projetos": Amav's Turismo, sistema de gestão de licitações e frota**

```
Sistema em produção para uma empresa de transporte de passageiros de Brasília
que atua com licitações públicas.

• Painel interno: licitações disputadas (sessões, propostas, resultado),
  certidões de habilitação com alerta de vencimento, frota e agenda.
• Site público com o portfólio de serviços prestados e atestados técnicos.
• PostgreSQL (Supabase) com Row Level Security: a autorização é garantida
  pelo próprio banco, e não só pela aplicação.
• Rotas de API em Next.js com validação (Zod), limite de requisições e
  checagem de origem; 2FA (TOTP) no painel.
• Testes com Vitest e CI no GitHub Actions (typecheck, testes e build).

Stack: TypeScript, Next.js 14, PostgreSQL, Supabase, Tailwind, Vitest.
```

**Post de divulgação (curto e verificável):**

```
Coloquei no ar o novo sistema da Amav's Turismo, empresa de transporte de
Brasília que vive de licitações públicas.

A parte que mais me ensinou foi segurança: descobri que qualquer pessoa podia
criar uma conta e acessar os dados do painel. Corrigi movendo a autorização
para o banco, com Row Level Security no PostgreSQL, e expondo ao público só o
que ele precisa ver.

Código aberto no GitHub: [link]
Stack: TypeScript, Next.js, PostgreSQL (Supabase), Vitest.
```

**Evite** colocar no perfil o que o projeto não usa (por exemplo Express, Docker ou AWS) e números de desempenho que você não mediu. Se o entrevistador perguntar e você não souber responder, a impressão é pior do que não ter citado.
