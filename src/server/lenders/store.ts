import { z } from "zod"
import { type Lender, LenderSchema } from "../matching/match"
import raw from "./lenders.json"

const lenders: readonly Lender[] = z.array(LenderSchema).parse(raw)

export function listLenders(): readonly Lender[] {
  return lenders
}
