import { describe, expect, it } from "vitest"
import { listLenders } from "../lenders/store"
import { LoanApplicationSchema } from "./application"
import { type Lender, LenderSchema, matchLenders } from "./match"

const match = (raw: Record<string, unknown>, lenders = listLenders()) =>
  matchLenders(LoanApplicationSchema.parse(raw), lenders).map((l) => l.name)

const consumerStudentCA = {
  borrowerType: "consumer",
  loanType: "Student Loan",
  state: "CA",
  riskLevel: 55,
  requestedAmount: 30000,
  currentYearIncome: 30000,
  previousYearIncome: 45000,
}

const business = {
  borrowerType: "business",
  loanType: "Term Loan",
  state: "NY",
  riskLevel: 50,
  industry: "construction",
  requestedAmount: 600000,
  currentYearIncome: 1000000,
  previousYearIncome: 900000,
}

describe("task examples", () => {
  it("example 1: risky large agriculture line of credit matches nobody", () => {
    expect(
      match({
        borrowerType: "business",
        loanType: "Line Of Credit",
        state: "NY",
        riskLevel: 90,
        Industry: "agriculture",
        requestedAmount: "200000",
        currentYearIncome: "90000",
        previousYearIncome: "45000",
      })
    ).toEqual([])
  })

  it("example 2: risk 75 is too high for HaPoalama", () => {
    expect(
      match({
        ...consumerStudentCA,
        riskLevel: 75,
        currentYearIncome: 20000,
        previousYearIncome: 25000,
      })
    ).toEqual(["First Lama Bank", "Lama International Bank"])
  })

  it("example 3: three lenders accept, the two with most constraints win", () => {
    expect(match(consumerStudentCA)).toEqual([
      "Bank HaPoalama",
      "First Lama Bank",
    ])
  })
})

describe("lender thresholds are strict", () => {
  it.each([
    [59, ["Bank HaPoalama", "First Lama Bank"]],
    [60, ["First Lama Bank", "Lama International Bank"]],
    [79, ["First Lama Bank", "Lama International Bank"]],
    [80, ["Lama International Bank"]],
  ])("consumer student in CA at risk %i", (riskLevel, expected) => {
    expect(match({ ...consumerStudentCA, riskLevel })).toEqual(expected)
  })

  it.each([
    [199999, ["Lama International Bank"]],
    [200000, []],
    [500000, []],
    [500001, ["Salt and Pepper"]],
  ])("business asking for %i", (requestedAmount, expected) => {
    expect(match({ ...business, requestedAmount })).toEqual(expected)
  })
})

describe("Bank Otzar Halama", () => {
  const restaurantLoc = {
    ...business,
    loanType: "Line of Credit loan",
    industry: "Restaurant",
    requestedAmount: 300000,
  }

  it("accepts restaurant lines of credit", () => {
    expect(match(restaurantLoc)).toEqual(["Bank Otzar Halama"])
  })

  it("rejects other industries and applications with no industry", () => {
    expect(match({ ...restaurantLoc, industry: "travel" })).toEqual([])
    const { industry: _, ...noIndustry } = restaurantLoc
    expect(match(noIndustry)).toEqual([])
  })
})

describe("priority", () => {
  const lender = (name: string, ruleCount: number): Lender =>
    LenderSchema.parse({
      name,
      constraints: Array.from({ length: ruleCount }, () => ({
        field: "riskLevel",
        op: "lte",
        value: 100,
      })),
    })

  it("orders by constraint count and keeps list order on ties", () => {
    const lenders = [lender("A", 1), lender("B", 2), lender("C", 2)]
    expect(match(consumerStudentCA, lenders)).toEqual(["B", "C"])
  })
})

describe("lender data", () => {
  it("rejects an operator applied to the wrong field type", () => {
    expect(
      LenderSchema.safeParse({
        name: "Bad",
        constraints: [{ field: "state", op: "lt", value: 5 }],
      }).success
    ).toBe(false)
  })

  it("normalizes constraint values like application values", () => {
    const parsed = LenderSchema.parse({
      name: "Friendly",
      constraints: [
        { field: "loanType", op: "eq", value: "Line Of Credit" },
        { field: "state", op: "eq", value: "New-York" },
      ],
    })
    expect(parsed.constraints.map((c) => c.value)).toEqual([
      "line_of_credit",
      "NY",
    ])
  })
})
