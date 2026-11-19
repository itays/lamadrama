# Testing the Loan Matching API

The API has one endpoint. `POST /applicationMatch` takes a loan application as JSON and returns the names of up to two lenders willing to finance it, highest priority first.

## 1. Start the server

Requires [Bun](https://bun.sh) 1.x.

```bash
bun install
bun dev
```

The server listens on `http://localhost:3000`. To test the production build instead, run `bun run build && bun run preview`, which serves on `http://localhost:4173`.

## 2. Send a request from Postman

### Option A: import the collection

1. In Postman, choose **Import** and select [`postman/loan-matching.postman_collection.json`](postman/loan-matching.postman_collection.json).
2. Open the **Lama Loan Matching** collection. The `baseUrl` collection variable defaults to `http://localhost:3000`. Change it under the collection's **Variables** tab if you use another port.
3. Send any request, or run the whole collection with **Run collection**. Each request includes a test that checks the expected status and body.

### Option B: build the request by hand

| Setting | Value                                                  |
| ------- | ------------------------------------------------------ |
| Method  | `POST`                                                 |
| URL     | `http://localhost:3000/applicationMatch`               |
| Header  | `Content-Type: application/json`                       |
| Body    | **raw**, type **JSON**, with one of the payloads below |

## 3. Example requests

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

Expected `200 OK`:

```json
[]
```

The printed task hides some digits of the amounts. Any `requestedAmount` of 200000 or more gives this result.

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

Expected `200 OK`:

```json
["First Lama Bank", "Lama International Bank"]
```

### Example 3: three lenders accept, the two with the most constraints win

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

Expected `200 OK`:

```json
["Bank HaPoalama", "First Lama Bank"]
```

### More cases to try

| Change to Example 3                                                                                             | Expected response                                 |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `"riskLevel": 80`                                                                                               | `["Lama International Bank"]`                     |
| `"requestedAmount": 250000`                                                                                     | `["Bank HaPoalama", "First Lama Bank"]`           |
| `"state": "California"`                                                                                         | Same as Example 3. Full state names are accepted. |
| `"borrowerType": "business", "loanType": "Line of Credit", "industry": "Restaurant", "requestedAmount": 300000` | `["Bank Otzar Halama"]`                           |
| `"borrowerType": "business", "loanType": "Term Loan", "requestedAmount": 600000`                                | `["Salt and Pepper"]`                             |

## 4. Invalid input

The API returns `400 Bad Request` with an `issues` array naming each invalid field.

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

Payloads that produce it include a `loanType` of `"Mortgage"`, a `riskLevel` outside 1 to 100, an unknown `state`, a missing income field, and a body that is not a JSON object.

## Input rules

| Field                                                        | Accepted values                                                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `borrowerType`                                               | `consumer` or `business`, any casing                                                                                                  |
| `loanType`                                                   | Student, Equipment Financing, Working Capital, Term, Line of Credit, SBA. Casing, spaces, hyphens, and a trailing "loan" are ignored. |
| `industry`                                                   | Optional free text, matched case-insensitively. Only business lenders use it.                                                         |
| `state`                                                      | A two-letter US code (`CA`) or a full name (`California`, `New-York`)                                                                 |
| `riskLevel`                                                  | Number from 1 to 100                                                                                                                  |
| `requestedAmount`, `currentYearIncome`, `previousYearIncome` | Non-negative number, or a numeric string                                                                                              |

Field names are case-insensitive, so `Industry` and `industry` both work.

## Matching rules

A lender matches when the application satisfies every one of its constraints. Matches are ordered by constraint count, most first, and the API returns the top two. Lenders with the same count keep their order in `lenders.json`.

| Lender                  | Constraints                          |
| ----------------------- | ------------------------------------ |
| First Lama Bank         | consumer, risk < 80                  |
| Bank HaPoalama          | student loan, state CA, risk < 60    |
| Salt and Pepper         | business, amount > 500000, risk < 80 |
| Bank Otzar Halama       | line of credit, industry restaurant  |
| Lama International Bank | amount < 200000                      |

All thresholds are strict. An application without an `industry` never matches Bank Otzar Halama.

## Changing the lenders

Lenders live in [`src/server/lenders/lenders.json`](src/server/lenders/lenders.json). Each constraint names a `field`, an `op`, and a `value`.

```json
{ "field": "riskLevel", "op": "lt", "value": 60 }
```

Numeric fields support `lt`, `lte`, `gt`, and `gte`. Text fields support `eq`. The server validates the file at startup and refuses to start if a constraint uses an unknown field or an operator that does not fit the field's type. Restart `bun dev` after editing the file.

## Automated tests

```bash
bun run test            # unit tests for parsing and matching
bun run test:e2e:smoke  # builds the app and calls the endpoint over HTTP
```
