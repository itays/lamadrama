# Lama AI — Loan Matching Exercise

> Transcribed from photos of the printed task. A glare streak covers a few values; those are marked `[?]` with a note.

Lama's Loan exchange is a service that matches loan applications with potential lenders.

Your goal in this exercise is to write a web api which will perform the loan matching.

Given a request containing a loan application, the api will return an array with the **two** lenders who are most likely to agree to finance the loan, ordered by priority (priority is explained later).

## Loan application

Each loan application has the following properties:

- `requestedAmount` (number): the number of requested USD.
- `borrowerType` (string): can be either `"consumer"` or `"business"`
- loan type: Student loan, equipment financing loan, working capital loan, term loan, Line of Credit loan, SBA Loan
- industry (relevant only for businesses): Restaurant, Travel, Construction, ...
- state (California, New-York etc.)
- `riskLevel`: each application has a pre-calculated riskLevel, which is a number between 1 to 100 (100 is the riskiest)
- `currentYearIncome` (number): The income of the borrower for the current year (in USD)
- `previousYearIncome` (number): The income of the borrower for the previous year (in USD)

## Lenders

Each lender's "appetite" is a set of constraints which determine whether it's willing to accept an application. For example: "only accept loans for an amount lower than 20000$"

The lenders we currently work with are:

- **First Lama Bank**: only accept consumer loans with risk level < 80
- **Bank HaPoalama**: only accepts student loans in california (CA), risk level < 60 `[?]`
- **Salt and Pepper**: business loans only, requested amount > 500k, risk level < 80 `[?]`
- **Bank Otzar Halama**: only line of credit loans for the restaurants industry
- **Lama International Bank**: accepts loans < 200K

`[?]` Glare hides the second digit of both thresholds. The examples confirm Bank HaPoalama's limit is above 55 and at most 75; 60 fits the visible text best. Salt and Pepper's limit reads as 8_, most likely 80.

## Priority

When two or more banks are willing to accept a loan (according to their constraints), we will prioritize the bank with more constraints.

## Examples

### Example 1

Request:

```http
POST /applicationMatch
```

```json
{
  "borrowerType": "business",
  "loanType": "Line Of Credit",
  "state": "NY",
  "riskLevel": 90,
  "Industry": "agriculture",
  "requestedAmount": "[?]00000",
  "currentYearIncome": "[?]0000",
  "previousYearIncome": "4[?]000"
}
```

`[?]` Glare hides the leading digits of the income and amount values. The empty response means `requestedAmount` must be ≥ 200000, or Lama International Bank would match.

Response:

```json
[]
```

### Example 2

Request:

```http
POST /applicationMatch
```

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

Response:

```json
["First Lama Bank", "Lama International Bank"]
```

### Example 3

Request:

```http
POST /applicationMatch
```

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

Response:

```json
["Bank HaPoalama", "First Lama Bank"]
```

## Notes

1. We prefer working code over perfect code - make sure the requirements are met and the exercise can run
2. Having said that, the code design should be modular and extensible (for example - we may have more types of constraints in the future, the design should support that)
3. You don't need a database, you can just use in-memory data structures if you think something should be persisted
