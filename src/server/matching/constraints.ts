import { z } from "zod"
import { numericFields, textFields } from "./application"
import { derivedNumericFields, type Facts } from "./facts"

const numericField = z.union([
  z.keyof(z.object(numericFields)),
  derivedNumericFields,
])

const compare = <const Op extends string>(op: Op) =>
  z.object({
    op: z.literal(op),
    field: numericField,
    value: z.number(),
  })

const equals = <const Field extends keyof typeof textFields>(field: Field) =>
  z.object({
    op: z.literal("eq"),
    field: z.literal(field),
    value: textFields[field],
  })

export const ConstraintSchema = z.union([
  compare("lt"),
  compare("lte"),
  compare("gt"),
  compare("gte"),
  equals("borrowerType"),
  equals("loanType"),
  equals("industry"),
  equals("state"),
])

export type Constraint = z.infer<typeof ConstraintSchema>

export function satisfies(app: Facts, c: Constraint): boolean {
  switch (c.op) {
    case "lt":
      return app[c.field] < c.value
    case "lte":
      return app[c.field] <= c.value
    case "gt":
      return app[c.field] > c.value
    case "gte":
      return app[c.field] >= c.value
    case "eq":
      return app[c.field] === c.value
  }
}
