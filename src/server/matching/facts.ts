import { z } from "zod"
import type { LoanApplication } from "./application"

export const derivedNumericFields = z.enum(["averageYearIncome"])

type DerivedNumericField = z.infer<typeof derivedNumericFields>

export type Facts = LoanApplication & Record<DerivedNumericField, number>

export const toFacts = (app: LoanApplication): Facts => ({
  ...app,
  averageYearIncome: (app.currentYearIncome + app.previousYearIncome) / 2,
})
