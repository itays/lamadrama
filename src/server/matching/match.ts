import { z } from "zod"
import type { LoanApplication } from "./application"
import { ConstraintSchema, satisfies } from "./constraints"
import { type Facts, toFacts } from "./facts"

export const LenderSchema = z.object({
  name: z.string().trim().min(1),
  constraints: z.array(ConstraintSchema),
})

export type Lender = z.infer<typeof LenderSchema>

const accepts = (lender: Lender, facts: Facts) =>
  lender.constraints.every((c) => satisfies(facts, c))

const byPriority = (a: Lender, b: Lender) =>
  b.constraints.length - a.constraints.length

export function matchLenders(
  app: LoanApplication,
  lenders: readonly Lender[],
  { limit = 2 } = {}
): Lender[] {
  const facts = toFacts(app)
  return lenders
    .filter((lender) => accepts(lender, facts))
    .sort(byPriority)
    .slice(0, limit)
}
