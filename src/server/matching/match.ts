import { z } from "zod"
import type { LoanApplication } from "./application"
import { ConstraintSchema, satisfies } from "./constraints"

export const LenderSchema = z.object({
  name: z.string().trim().min(1),
  constraints: z.array(ConstraintSchema),
})

export type Lender = z.infer<typeof LenderSchema>

const accepts = (lender: Lender, app: LoanApplication) =>
  lender.constraints.every((c) => satisfies(app, c))

const byPriority = (a: Lender, b: Lender) =>
  b.constraints.length - a.constraints.length

export function matchLenders(
  app: LoanApplication,
  lenders: readonly Lender[],
  { limit = 2 } = {}
): Lender[] {
  return lenders
    .filter((lender) => accepts(lender, app))
    .sort(byPriority)
    .slice(0, limit)
}
