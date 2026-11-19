import { z } from "zod"
import { UsStateSchema } from "./us-states"

const slug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")

export const LOAN_TYPES = [
  "student",
  "equipment_financing",
  "working_capital",
  "term",
  "line_of_credit",
  "sba",
] as const

const BorrowerTypeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.enum(["consumer", "business"]))

const LoanTypeSchema = z
  .string()
  .transform((value) => slug(value).replace(/_loans?$/, ""))
  .pipe(z.enum(LOAN_TYPES))

const IndustrySchema = z.string().trim().min(1).transform(slug)

const NumberSchema = z
  .union([z.number(), z.string().trim().min(1).transform(Number)])
  .pipe(z.number())

const UsdSchema = NumberSchema.pipe(z.number().nonnegative())

export const textFields = {
  borrowerType: BorrowerTypeSchema,
  loanType: LoanTypeSchema,
  industry: IndustrySchema,
  state: UsStateSchema,
}

export const numericFields = {
  riskLevel: NumberSchema.pipe(z.number().min(1).max(100)),
  requestedAmount: UsdSchema,
  currentYearIncome: UsdSchema,
  previousYearIncome: UsdSchema,
}

const shape = {
  ...textFields,
  industry: IndustrySchema.optional(),
  ...numericFields,
}

const canonicalKey = new Map(
  Object.keys(shape).map((key) => [key.toLowerCase(), key])
)

const canonicalizeKeys = (raw: unknown) =>
  raw !== null && typeof raw === "object" && !Array.isArray(raw)
    ? Object.fromEntries(
        Object.entries(raw).map(([key, value]) => [
          canonicalKey.get(key.toLowerCase()) ?? key,
          value,
        ])
      )
    : raw

export const LoanApplicationSchema = z.preprocess(
  canonicalizeKeys,
  z.object(shape)
)

export type LoanApplication = z.infer<typeof LoanApplicationSchema>
