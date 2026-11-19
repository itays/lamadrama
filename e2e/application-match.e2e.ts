import { expect, test } from "@playwright/test"

const studentInCA = {
  borrowerType: "consumer",
  loanType: "Student Loan",
  state: "CA",
  riskLevel: 55,
  requestedAmount: 30000,
  currentYearIncome: 30000,
  previousYearIncome: 45000,
}

test("POST /applicationMatch returns the two top lenders", {
  tag: "@smoke",
}, async ({ request }) => {
  const response = await request.post("/applicationMatch", {
    data: studentInCA,
  })
  expect(response.status()).toBe(200)
  expect(await response.json()).toEqual(["Bank HaPoalama", "First Lama Bank"])
})

test("POST /applicationMatch rejects an invalid application", {
  tag: "@smoke",
}, async ({ request }) => {
  const response = await request.post("/applicationMatch", {
    data: { ...studentInCA, riskLevel: 500 },
  })
  expect(response.status()).toBe(400)
  expect(await response.json()).toMatchObject({
    error: "Invalid loan application",
  })
})
