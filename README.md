# Lama loan matching API

This service matches a loan application with the lenders most likely to finance it. `POST /applicationMatch` takes an application as JSON and returns the names of up to two lenders whose constraints it meets. Lenders with more constraints come first.

The API runs as a [TanStack Start](https://tanstack.com/start) server route. Lenders are stored in a JSON file and loaded into memory at startup, so no database is needed.

## Run the server locally

You need [Bun](https://bun.sh) 1.x.

1. Install the dependencies.

   ```bash
   bun install
   ```

2. Start the development server.

   ```bash
   bun dev
   ```

3. Check that the server responds. This sends the task's Example 3.

   ```bash
   curl -X POST http://localhost:3000/applicationMatch \
     -H "Content-Type: application/json" \
     -d '{"borrowerType":"consumer","loanType":"Student Loan","state":"CA","riskLevel":55,"requestedAmount":30000,"currentYearIncome":30000,"previousYearIncome":45000}'
   ```

   The server returns `["Bank HaPoalama","First Lama Bank"]`.

The development server listens on `http://localhost:3000`. To test the production build instead, run `bun run build && bun run preview`. The preview server listens on `http://localhost:4173`.

## Test with Postman

The repository includes a Postman collection with every example below. Each request has a test script that checks the status code and the response body.

### Import the collection

1. Start the server with `bun dev`.
2. In Postman, click **Import** and select `postman/loan-matching.postman_collection.json`.
3. Open the **Lama Loan Matching** collection.
4. To run every request, click **Run collection**, then click **Run Lama Loan Matching**. All 10 requests and 20 tests pass.
5. To send one request, open it and click **Send**. The **Test Results** tab shows whether the response matched.

The collection variable `baseUrl` is `http://localhost:3000`. If you use the preview server, change `baseUrl` to `http://localhost:4173` on the collection's **Variables** tab.

The collection contains these requests:

| Request                                                                  | Expected response                                    |
| ------------------------------------------------------------------------ | ---------------------------------------------------- |
| Example 1: no lender matches                                             | `[]`                                                 |
| Example 2: HaPoalama rejects risk 75                                     | `["First Lama Bank", "Lama International Bank"]`     |
| Example 3: top two by constraint count                                   | `["Bank HaPoalama", "First Lama Bank"]`              |
| Risk 80 leaves only Lama International                                   | `["Lama International Bank"]`                        |
| Full state name accepted                                                 | `["Bank HaPoalama", "First Lama Bank"]`              |
| Restaurant line of credit                                                | `["Bank Otzar Halama"]`                              |
| Large business term loan                                                 | `["Salt and Pepper"]`                                |
| Invalid loan type returns 400                                            | `400 Bad Request`, with `loanType` named in `issues` |
| averageYearIncome / Average income 40,000 ranks Steady Income Bank first | `["Steady Income Bank", "Bank HaPoalama"]`           |
| averageYearIncome / Client-sent averageYearIncome is ignored             | `["Bank HaPoalama", "First Lama Bank"]`              |

### Build a request by hand

To write your own request, create a new request in Postman with these settings:

| Setting | Value                                    |
| ------- | ---------------------------------------- |
| Method  | `POST`                                   |
| URL     | `http://localhost:3000/applicationMatch` |
| Header  | `Content-Type: application/json`         |
| Body    | **raw**, type **JSON**                   |

Paste one of the bodies from [Example requests](#example-requests) and click **Send**.

## Run the automated tests

```bash
bun run test            # Vitest unit tests for parsing and matching
bun run test:e2e:smoke  # builds the app and calls the endpoint over HTTP with Playwright
```

Before the first Playwright run, install its browser with `bunx playwright install chromium`.

## Example requests

### Example 1: no lender matches

```json
{
  "borrowerType": "business",
  "loanType": "Line Of Credit",
  "state": "NY",
  "riskLevel": 90,
  "Industry": "agriculture",
  "requestedAmount": "200000",
  "currentYearIncome": "90000",
  "previousYearIncome": "45000"
}
```

Response `200 OK`:

```json
[]
```

The printed task hides some digits of the amounts. Any `requestedAmount` of 200000 or more gives this result. A smaller amount would match Lama International Bank.

### Example 2: HaPoalama rejects risk 75

```json
{
  "borrowerType": "consumer",
  "loanType": "Student Loan",
  "state": "CA",
  "riskLevel": 75,
  "requestedAmount": 30000,
  "currentYearIncome": 20000,
  "previousYearIncome": 25000
}
```

Response `200 OK`:

```json
["First Lama Bank", "Lama International Bank"]
```

### Example 3: three lenders accept, and the two with the most constraints win

```json
{
  "borrowerType": "consumer",
  "loanType": "Student Loan",
  "state": "CA",
  "riskLevel": 55,
  "requestedAmount": 30000,
  "currentYearIncome": 30000,
  "previousYearIncome": 45000
}
```

Response `200 OK`:

```json
["Bank HaPoalama", "First Lama Bank"]
```

### Invalid input

If the body is not a valid application, the API returns `400 Bad Request` with an `issues` array that names each invalid field.

```json
{
  "error": "Invalid loan application",
  "issues": [
    {
      "code": "invalid_value",
      "path": ["loanType"],
      "message": "Invalid option: expected one of \"student\"|\"equipment_financing\"|..."
    }
  ]
}
```

Bodies that return 400 include a `loanType` of `"Mortgage"`, a `riskLevel` outside 1 to 100, an unknown `state`, a missing income field, and a body that is not a JSON object.

## Request fields

| Field                                                        | Accepted values                                                                                                                                 |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `borrowerType`                                               | `consumer` or `business`, in any casing                                                                                                         |
| `loanType`                                                   | Student, Equipment Financing, Working Capital, Term, Line of Credit, or SBA. The parser ignores casing, spaces, hyphens, and a trailing "loan". |
| `industry`                                                   | Optional text, compared case-insensitively. Only business lenders use it.                                                                       |
| `state`                                                      | A two-letter US code (`CA`) or a full name (`California`, `New-York`)                                                                           |
| `riskLevel`                                                  | A number from 1 to 100                                                                                                                          |
| `requestedAmount`, `currentYearIncome`, `previousYearIncome` | A non-negative number, or a string that holds one                                                                                               |

Field names are case-insensitive, so `Industry` and `industry` both work. The parser drops fields it does not know.

## Lenders

A lender matches when the application meets every one of its constraints. The API sorts the matches by constraint count, most first, and returns the first two. Lenders with the same count keep their order in `lenders.json`.

| Lender                  | Constraints                                                  |
| ----------------------- | ------------------------------------------------------------ |
| First Lama Bank         | consumer, risk < 80                                          |
| Bank HaPoalama          | student loan, state CA, risk < 60                            |
| Salt and Pepper         | business, amount > 500000, risk < 80                         |
| Bank Otzar Halama       | line of credit, industry restaurant                          |
| Lama International Bank | amount < 200000                                              |
| Steady Income Bank      | average income ≥ 40000, consumer, risk < 90, amount < 100000 |

The first five lenders come from the task. Steady Income Bank was added for the `averageYearIncome` change request.

## How the code is organized

Lender constraints are data, not code. Each constraint in `src/server/lenders/lenders.json` names an application field, an operator, and a value:

```json
{ "field": "riskLevel", "op": "lt", "value": 60 }
```

A request moves through these steps:

1. `src/routes/applicationMatch.ts` reads the body and passes it to `LoanApplicationSchema`.
2. `src/server/matching/application.ts` validates the body and normalizes it. For example, `"Line Of Credit"` becomes `line_of_credit` and `"California"` becomes `CA`. Invalid input stops here with a 400.
3. `src/server/matching/facts.ts` adds the values the server computes, such as `averageYearIncome`.
4. `src/server/matching/match.ts` keeps the lenders whose constraints all pass, sorts them with `byPriority`, and returns the first two.
5. `src/server/matching/constraints.ts` checks each constraint in one `switch` over the operator.

Validation happens in two places only, at the HTTP request and when `src/server/lenders/store.ts` loads `lenders.json`. The matching code receives typed values and does not check them again, so the unit tests call `matchLenders` without a server.

The constraint schema ties each operator to a field type. `lt`, `lte`, `gt`, and `gte` accept number fields. `eq` accepts text fields, and it parses its value with the same parser as the request field. As a result, a constraint written as `"Line Of Credit"` in the JSON still matches. If `lenders.json` has a constraint with an unknown field, or an operator that does not fit its field, the server fails at startup and prints the error.

The design keeps each likely change in one place:

| Change                          | Where                                                                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Add or edit a lender            | `lenders.json`, then restart `bun dev`                                                                                                         |
| Add a new kind of constraint    | Add a schema entry to `ConstraintSchema` and a `case` to `satisfies` in `constraints.ts`. TypeScript reports an error until the `case` exists. |
| Add a value the server computes | Add its name to `derivedNumericFields` and its formula to `toFacts` in `facts.ts`                                                              |
| Change how matches are ranked   | `byPriority` in `match.ts`                                                                                                                     |

## The `averageYearIncome` change

The interviewer's follow-up asked for constraints on `averageYearIncome`, a number. The server computes it as `(currentYearIncome + previousYearIncome) / 2`. Clients do not send it.

The change touched three source files:

- `facts.ts` is new. It lists `averageYearIncome` as a computed number and calculates it in `toFacts`.
- `constraints.ts` lets number constraints name computed fields as well as request fields.
- `match.ts` calls `toFacts` once per request before it checks constraints.

The route, the request parser, the operators, and the ranking did not change. If a client sends its own `averageYearIncome`, the parser drops it, and the server uses the computed value. The Postman request "Client-sent averageYearIncome is ignored" tests that behavior. It sends `1000000` with incomes that average 37500, and Steady Income Bank does not match.

Steady Income Bank uses the new constraint. The task's three examples return the same responses as before, because none of them is a consumer with an average income of 40000 or more.

## Assumptions

- Comparisons in the task's lenders are strict. Risk 60 fails Bank HaPoalama's "risk < 60". Steady Income Bank's "average income ≥ 40000" includes 40000.
- An application without an `industry` never matches Bank Otzar Halama.
- Glare in the task photos hides part of two limits. This code reads them as 60 for Bank HaPoalama and 80 for Salt and Pepper. Example 3 shows that HaPoalama accepts risk 55.
- Lenders with the same constraint count keep their order in `lenders.json`.

## Project tooling

- [Biome](https://biomejs.dev) formats and lints the code. Run `bun run check`, or `bun run check --write` to apply fixes.
- `bun run typecheck` runs the TypeScript compiler.
- A Husky pre-commit hook runs Biome on staged files, then `typecheck` and `test`.
- `.github/workflows/ci.yml` runs Biome, the typecheck, the unit tests, the production build, and the Playwright smoke tests.
