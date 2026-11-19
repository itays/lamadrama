import { createFileRoute } from "@tanstack/react-router"
import { listLenders } from "@/server/lenders/store"
import { LoanApplicationSchema } from "@/server/matching/application"
import { matchLenders } from "@/server/matching/match"

export const Route = createFileRoute("/applicationMatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => undefined)
        const parsed = LoanApplicationSchema.safeParse(body)
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid loan application", issues: parsed.error.issues },
            { status: 400 }
          )
        }
        const matches = matchLenders(parsed.data, listLenders())
        return Response.json(matches.map((lender) => lender.name))
      },
    },
  },
})
