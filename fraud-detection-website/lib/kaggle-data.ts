// Home Credit Default Risk Dataset - Sample Data Generator
// Based on: https://www.kaggle.com/competitions/home-credit-default-risk

export interface HomeCreditApplication {
  SK_ID_CURR: number
  TARGET: number // 1 = default, 0 = no default
  NAME_CONTRACT_TYPE: string
  CODE_GENDER: string
  FLAG_OWN_CAR: string
  FLAG_OWN_REALTY: string
  CNT_CHILDREN: number
  AMT_INCOME_TOTAL: number
  AMT_CREDIT: number
  AMT_ANNUITY: number
  AMT_GOODS_PRICE: number
  NAME_INCOME_TYPE: string
  NAME_EDUCATION_TYPE: string
  NAME_FAMILY_STATUS: string
  NAME_HOUSING_TYPE: string
  DAYS_BIRTH: number
  DAYS_EMPLOYED: number
  DAYS_REGISTRATION: number
  OCCUPATION_TYPE: string
  CNT_FAM_MEMBERS: number
  EXT_SOURCE_1: number
  EXT_SOURCE_2: number
  EXT_SOURCE_3: number
  DAYS_LAST_PHONE_CHANGE: number
  // Derived fields for analysis
  AGE_YEARS: number
  EMPLOYED_YEARS: number
  CREDIT_INCOME_RATIO: number
  ANNUITY_INCOME_RATIO: number
  RISK_SCORE: number
  RISK_LEVEL: "Low" | "Medium" | "High"
}

export interface BureauRecord {
  SK_ID_CURR: number
  SK_ID_BUREAU: number
  CREDIT_ACTIVE: string
  CREDIT_CURRENCY: string
  DAYS_CREDIT: number
  CREDIT_DAY_OVERDUE: number
  AMT_CREDIT_MAX_OVERDUE: number
  CNT_CREDIT_PROLONG: number
  AMT_CREDIT_SUM: number
  AMT_CREDIT_SUM_DEBT: number
  AMT_CREDIT_SUM_LIMIT: number
  AMT_CREDIT_SUM_OVERDUE: number
  CREDIT_TYPE: string
  DAYS_CREDIT_ENDDATE: number
}

export interface PreviousApplication {
  SK_ID_CURR: number
  SK_ID_PREV: number
  NAME_CONTRACT_TYPE: string
  AMT_ANNUITY: number
  AMT_APPLICATION: number
  AMT_CREDIT: number
  AMT_DOWN_PAYMENT: number
  AMT_GOODS_PRICE: number
  NAME_CONTRACT_STATUS: string
  DAYS_DECISION: number
  NAME_PAYMENT_TYPE: string
  CODE_REJECT_REASON: string | null
  NAME_CLIENT_TYPE: string
  NAME_GOODS_CATEGORY: string
  NAME_PRODUCT_TYPE: string
  CNT_PAYMENT: number
}

const CONTRACT_TYPES = ["Cash loans", "Revolving loans"]
const INCOME_TYPES = [
  "Working",
  "Commercial associate",
  "Pensioner",
  "State servant",
  "Student",
  "Unemployed",
  "Maternity leave",
  "Businessman",
]
const EDUCATION_TYPES = [
  "Secondary / secondary special",
  "Higher education",
  "Incomplete higher",
  "Lower secondary",
  "Academic degree",
]
const FAMILY_STATUS = ["Married", "Single / not married", "Civil marriage", "Separated", "Widow"]
const HOUSING_TYPES = [
  "House / apartment",
  "With parents",
  "Municipal apartment",
  "Rented apartment",
  "Office apartment",
  "Co-op apartment",
]
const OCCUPATION_TYPES = [
  "Laborers",
  "Core staff",
  "Sales staff",
  "Managers",
  "Drivers",
  "High skill tech staff",
  "Accountants",
  "Medicine staff",
  "Security staff",
  "Cooking staff",
  "Cleaning staff",
  "Private service staff",
  "Low-skill Laborers",
  "Secretaries",
  "Waiters/barmen staff",
  "HR staff",
  "Realty agents",
  "IT staff",
]
const CREDIT_TYPES = ["Consumer credit", "Credit card", "Mortgage", "Car loan", "Microloan"]
const CONTRACT_STATUS = ["Approved", "Canceled", "Refused", "Unused offer"]
const GOODS_CATEGORIES = [
  "XNA",
  "Mobile",
  "Consumer Electronics",
  "Computers",
  "Audio/Video",
  "Furniture",
  "Construction Materials",
  "Clothing and Accessories",
  "Auto Accessories",
  "Medical Supplies",
]

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

// Generate realistic Home Credit application data
export function generateHomeCreditApplications(count = 100): HomeCreditApplication[] {
  const applications: HomeCreditApplication[] = []

  for (let i = 0; i < count; i++) {
    const income = randomInt(20000, 500000)
    const credit = randomInt(50000, 2000000)
    const annuity = Math.round(credit / randomInt(12, 60))
    const goodsPrice = Math.round(credit * randomFloat(0.8, 1.0))
    const daysBirth = -randomInt(7300, 25550) // 20-70 years old
    const daysEmployed = Math.random() > 0.1 ? -randomInt(30, Math.min(-daysBirth - 6570, 15000)) : 365243 // Unemployed marker

    // External sources (credit bureau scores normalized 0-1)
    const extSource1 = randomFloat(0, 1, 4)
    const extSource2 = randomFloat(0, 1, 4)
    const extSource3 = randomFloat(0, 1, 4)

    // Calculate risk factors
    const creditIncomeRatio = credit / income
    const annuityIncomeRatio = annuity / income
    const ageYears = Math.abs(Math.round(daysBirth / 365))
    const employedYears = daysEmployed === 365243 ? 0 : Math.abs(Math.round(daysEmployed / 365))

    // Risk score calculation (higher = more risky)
    let riskScore = 0
    riskScore += creditIncomeRatio > 5 ? 25 : creditIncomeRatio > 3 ? 15 : 5
    riskScore += annuityIncomeRatio > 0.5 ? 20 : annuityIncomeRatio > 0.3 ? 10 : 5
    riskScore += employedYears < 1 ? 20 : employedYears < 3 ? 10 : 0
    riskScore += ageYears < 25 ? 15 : ageYears > 60 ? 10 : 0
    riskScore += extSource1 < 0.3 ? 15 : extSource1 < 0.5 ? 8 : 0
    riskScore += extSource2 < 0.3 ? 15 : extSource2 < 0.5 ? 8 : 0
    riskScore += extSource3 < 0.3 ? 15 : extSource3 < 0.5 ? 8 : 0

    // Normalize to 0-100
    riskScore = Math.min(100, riskScore)

    // Determine if this is a default case (TARGET = 1)
    const target = riskScore > 60 ? (Math.random() > 0.3 ? 1 : 0) : Math.random() > 0.92 ? 1 : 0

    const riskLevel: "Low" | "Medium" | "High" = riskScore < 30 ? "Low" : riskScore < 60 ? "Medium" : "High"

    applications.push({
      SK_ID_CURR: 100000 + i,
      TARGET: target,
      NAME_CONTRACT_TYPE: randomChoice(CONTRACT_TYPES),
      CODE_GENDER: Math.random() > 0.35 ? "F" : "M",
      FLAG_OWN_CAR: Math.random() > 0.6 ? "Y" : "N",
      FLAG_OWN_REALTY: Math.random() > 0.3 ? "Y" : "N",
      CNT_CHILDREN: randomInt(0, 4),
      AMT_INCOME_TOTAL: income,
      AMT_CREDIT: credit,
      AMT_ANNUITY: annuity,
      AMT_GOODS_PRICE: goodsPrice,
      NAME_INCOME_TYPE: randomChoice(INCOME_TYPES),
      NAME_EDUCATION_TYPE: randomChoice(EDUCATION_TYPES),
      NAME_FAMILY_STATUS: randomChoice(FAMILY_STATUS),
      NAME_HOUSING_TYPE: randomChoice(HOUSING_TYPES),
      DAYS_BIRTH: daysBirth,
      DAYS_EMPLOYED: daysEmployed,
      DAYS_REGISTRATION: -randomInt(365, 10000),
      OCCUPATION_TYPE: randomChoice(OCCUPATION_TYPES),
      CNT_FAM_MEMBERS: randomInt(1, 6),
      EXT_SOURCE_1: extSource1,
      EXT_SOURCE_2: extSource2,
      EXT_SOURCE_3: extSource3,
      DAYS_LAST_PHONE_CHANGE: -randomInt(0, 3650),
      AGE_YEARS: ageYears,
      EMPLOYED_YEARS: employedYears,
      CREDIT_INCOME_RATIO: Number.parseFloat(creditIncomeRatio.toFixed(2)),
      ANNUITY_INCOME_RATIO: Number.parseFloat(annuityIncomeRatio.toFixed(4)),
      RISK_SCORE: riskScore,
      RISK_LEVEL: riskLevel,
    })
  }

  return applications
}

// Generate bureau records for an application
export function generateBureauRecords(skIdCurr: number, count = 5): BureauRecord[] {
  const records: BureauRecord[] = []

  for (let i = 0; i < count; i++) {
    const creditSum = randomInt(10000, 500000)
    const creditDebt = Math.random() > 0.3 ? randomInt(0, creditSum) : 0

    records.push({
      SK_ID_CURR: skIdCurr,
      SK_ID_BUREAU: 5000000 + skIdCurr * 10 + i,
      CREDIT_ACTIVE: Math.random() > 0.4 ? "Active" : "Closed",
      CREDIT_CURRENCY: "currency 1",
      DAYS_CREDIT: -randomInt(30, 3650),
      CREDIT_DAY_OVERDUE: Math.random() > 0.85 ? randomInt(1, 90) : 0,
      AMT_CREDIT_MAX_OVERDUE: Math.random() > 0.8 ? randomInt(1000, 50000) : 0,
      CNT_CREDIT_PROLONG: Math.random() > 0.9 ? randomInt(1, 3) : 0,
      AMT_CREDIT_SUM: creditSum,
      AMT_CREDIT_SUM_DEBT: creditDebt,
      AMT_CREDIT_SUM_LIMIT: Math.random() > 0.5 ? randomInt(50000, 200000) : 0,
      AMT_CREDIT_SUM_OVERDUE: Math.random() > 0.9 ? randomInt(1000, 20000) : 0,
      CREDIT_TYPE: randomChoice(CREDIT_TYPES),
      DAYS_CREDIT_ENDDATE: randomInt(-365, 1825),
    })
  }

  return records
}

// Generate previous applications for an application
export function generatePreviousApplications(skIdCurr: number, count = 3): PreviousApplication[] {
  const applications: PreviousApplication[] = []

  for (let i = 0; i < count; i++) {
    const credit = randomInt(30000, 800000)
    const status = randomChoice(CONTRACT_STATUS)

    applications.push({
      SK_ID_CURR: skIdCurr,
      SK_ID_PREV: 1000000 + skIdCurr * 10 + i,
      NAME_CONTRACT_TYPE: randomChoice(CONTRACT_TYPES),
      AMT_ANNUITY: Math.round(credit / randomInt(12, 48)),
      AMT_APPLICATION: credit,
      AMT_CREDIT: Math.round(credit * randomFloat(0.9, 1.1)),
      AMT_DOWN_PAYMENT: Math.round(credit * randomFloat(0, 0.2)),
      AMT_GOODS_PRICE: Math.round(credit * randomFloat(0.85, 1.0)),
      NAME_CONTRACT_STATUS: status,
      DAYS_DECISION: -randomInt(30, 2000),
      NAME_PAYMENT_TYPE: Math.random() > 0.5 ? "Cash through the bank" : "XNA",
      CODE_REJECT_REASON:
        status === "Refused" ? randomChoice(["XAP", "LIMIT", "SCO", "HC", "VERIF", "CLIENT", "SCOFR", "XNA"]) : null,
      NAME_CLIENT_TYPE: randomChoice(["Repeater", "New", "Refreshed"]),
      NAME_GOODS_CATEGORY: randomChoice(GOODS_CATEGORIES),
      NAME_PRODUCT_TYPE: randomChoice(["x-sell", "walk-in", "XNA"]),
      CNT_PAYMENT: randomInt(6, 60),
    })
  }

  return applications
}

// Dataset statistics based on actual Kaggle competition data
export const DATASET_STATS = {
  totalApplications: 307511,
  trainApplications: 307511,
  testApplications: 48744,
  defaultRate: 0.0807, // 8.07% default rate
  avgIncome: 168797.9,
  avgCredit: 599025.9,
  avgAnnuity: 27108.5,
  genderDistribution: { male: 0.34, female: 0.66 },
  ownCarRate: 0.34,
  ownRealtyRate: 0.69,
  avgAge: 43.9,
  avgEmploymentYears: 6.2,
  topIncomeTypes: [
    { type: "Working", percentage: 52.0 },
    { type: "Commercial associate", percentage: 23.2 },
    { type: "Pensioner", percentage: 18.0 },
    { type: "State servant", percentage: 6.3 },
  ],
  topEducationTypes: [
    { type: "Secondary / secondary special", percentage: 71.0 },
    { type: "Higher education", percentage: 24.3 },
    { type: "Incomplete higher", percentage: 3.3 },
    { type: "Lower secondary", percentage: 1.2 },
  ],
}

// Feature importance based on actual Kaggle competition winning solutions
export const FEATURE_IMPORTANCE = [
  { feature: "EXT_SOURCE_2", importance: 0.156, description: "External source score 2 (credit bureau)" },
  { feature: "EXT_SOURCE_3", importance: 0.142, description: "External source score 3 (credit bureau)" },
  { feature: "EXT_SOURCE_1", importance: 0.098, description: "External source score 1 (credit bureau)" },
  { feature: "DAYS_BIRTH", importance: 0.067, description: "Client age in days" },
  { feature: "DAYS_EMPLOYED", importance: 0.058, description: "Employment duration in days" },
  { feature: "AMT_CREDIT", importance: 0.045, description: "Credit amount of the loan" },
  { feature: "AMT_ANNUITY", importance: 0.042, description: "Loan annuity" },
  { feature: "AMT_GOODS_PRICE", importance: 0.038, description: "Price of goods for which loan is given" },
  { feature: "DAYS_REGISTRATION", importance: 0.033, description: "Days since client changed registration" },
  { feature: "DAYS_ID_PUBLISH", importance: 0.031, description: "Days since ID document was published" },
  { feature: "AMT_INCOME_TOTAL", importance: 0.029, description: "Income of the client" },
  { feature: "REGION_POPULATION_RELATIVE", importance: 0.025, description: "Normalized population of region" },
  { feature: "CREDIT_INCOME_RATIO", importance: 0.024, description: "Ratio of credit to income" },
  { feature: "ANNUITY_INCOME_RATIO", importance: 0.022, description: "Ratio of annuity to income" },
  { feature: "DAYS_LAST_PHONE_CHANGE", importance: 0.019, description: "Days since phone change" },
]
