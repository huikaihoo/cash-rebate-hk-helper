export enum CardType {
  Credit,
  Debit,
  Wallet,
}

export enum WaiverCondition {
  Auto,
  Manual,
  Forbidden,
}

export interface Card {
  id: string
  name: string
  bankId: string
  type: CardType
  annualFee: {
    fee: number
    chargeAfter: number // no of years before annual fee is charged
    waiverCondition: WaiverCondition
  }
  charges: {
    fcc: number // Foreign Currency Conversion Fee
    cbf: number // Cross Border Fee
  }
  percentages: number[] // Rebate percentages for each level
}

export enum Period {
  Payment,
  Monthly,
  Yearly,
  Cycle,
}

export enum Channel {
  OnlineLocal, // local currency (HKD)
  OnlineOverseas, // foreign currency
  PhysicalLocal,
  PhysicalOverseas,
}

export interface Rebate {
  id: string
  cardId: string
  bankId: string

  level: number // 0 means basic, higher level means higher rebate rate
  percentage: number // Percentage of rebate (total rebate rate including basic level if any)

  // categories
  categoriesInclude?: string[] // Specific categories that qualify for rebate
  categoriesExclude?: string[] // Specific categories that do not qualify

  // Shops
  shops?: string[] // Specific shops that qualify for rebate

  // Location
  locationInclude?: string[] // Specific location that qualify for rebate
  locationExclude?: string[] // Specific location that do not qualify

  channels: Channel[]
  excludeCbf: boolean // Exclude Cross Border Fee (CBF) transactions to qualify for rebate
  startDate?: string // Start date of rebate in YYYY-MM-DD format (inclusive)
  endDate?: string // End date of rebate in YYYY-MM-DD format (inclusive)
  minAmount?: number // Minimum spending required for rebate to apply
  minPeriod?: Period //  period for minimum spending amount to be calculated; cycle means from start date to end date
  maxAmount?: number // Maximum spending that qualifies for rebate
  maxPeriod?: Period // period for maximum spending amount to be calculated; cycle means from start date to end date
}
export interface RebateWithCard extends Rebate {
  card: Card
}
