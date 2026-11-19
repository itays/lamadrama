import { describe, expect, it } from "vitest"
import { LoanApplicationSchema } from "./application"

const valid = {
  borrowerType: "Business",
  loanType: "Line Of Credit",
  state: "New-York",
  riskLevel: "90",
  Industry: "Restaurant",
  requestedAmount: "300000",
  currentYearIncome: 80000,
  previousYearIncome: 45000,
}

describe("LoanApplicationSchema", () => {
  it("normalizes casing, names, and numeric strings", () => {
    expect(LoanApplicationSchema.parse(valid)).toEqual({
      borrowerType: "business",
      loanType: "line_of_credit",
      state: "NY",
      riskLevel: 90,
      industry: "restaurant",
      requestedAmount: 300000,
      currentYearIncome: 80000,
      previousYearIncome: 45000,
    })
  })

  it.each([
    "Student Loan",
    "Equipment Financing Loan",
    "Working Capital Loan",
    "Term Loan",
    "Line of Credit loan",
    "SBA Loan",
  ])("accepts the loan type %s", (loanType) => {
    expect(
      LoanApplicationSchema.safeParse({ ...valid, loanType }).success
    ).toBe(true)
  })

  it.each([
    ["borrowerType", "alien"],
    ["loanType", "mortgage"],
    ["state", "Atlantis"],
    ["riskLevel", 101],
    ["riskLevel", 0],
    ["requestedAmount", "lots"],
    ["requestedAmount", -1],
    ["previousYearIncome", undefined],
  ])("rejects %s = %s", (field, value) => {
    expect(
      LoanApplicationSchema.safeParse({ ...valid, [field]: value }).success
    ).toBe(false)
  })

  it("rejects a body that is not an object", () => {
    expect(LoanApplicationSchema.safeParse(undefined).success).toBe(false)
    expect(LoanApplicationSchema.safeParse([valid]).success).toBe(false)
  })
})
