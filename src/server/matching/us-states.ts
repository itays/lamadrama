import { z } from "zod"

const US_STATES = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
} as const

export type UsState = keyof typeof US_STATES

const nameKey = (name: string) => name.toLowerCase().replace(/[\s_-]+/g, " ")

const codeByName = new Map(
  Object.entries(US_STATES).map(([code, name]) => [
    nameKey(name),
    code as UsState,
  ])
)

const isCode = (value: string): value is UsState => value in US_STATES

export const UsStateSchema = z
  .string()
  .trim()
  .transform((input, ctx): UsState => {
    const upper = input.toUpperCase()
    const code = isCode(upper) ? upper : codeByName.get(nameKey(input))
    if (code) return code
    ctx.addIssue({ code: "custom", message: `Unknown US state "${input}"` })
    return z.NEVER
  })
