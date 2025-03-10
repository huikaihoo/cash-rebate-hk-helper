import type { DisplayText } from '@/logic/types'

export interface RawCreditCard {
  name: string
  bank: string
  type: 'credit' | 'debit' | 'wallet' // Type of card (although the interface is named CreditCard, it can be debit or digital wallet)
  links: {
    // url to official website, application form, etc.
    official: DisplayText
    rebate: DisplayText
    charges: DisplayText
  }
  annualFee: {
    fee: number
    chargeAfter: number // no of years before annual fee is charged
    waiverCondition: 'auto' | 'manual' | 'forbidden' // set auto also if no annual fee
    remarks?: DisplayText
  }
  charges: {
    fcc: number // Foreign Currency Conversion Fee
    cbf: number // Cross Border Fee
  }
  rebateList: RawRebate[] // sorted by level (descending)
  rebateRemarks?: DisplayText // method of receiving rebate / any deadline for rebate need to be claimed
  remarks?: DisplayText
}

export interface RawRebate {
  // cardId: string; // Unique ID of the card
  level: number // 0 means basic (smallest level), higher level means higher rebate rate, same rate should fall on same level
  percentage: number // Percentage of rebate (total rebate rate including basic level if any)
  categories?: {
    // null means all categories
    include?: string[] // Specific categories that qualify for rebate
    exclude?: string[] // Specific categories that do not qualify
  }
  shops?: string[] // Specific shops that qualify for rebate
  location?: {
    // null means all locations; only applicable for overseas physical spending
    include?: string[] // Specific location that qualify for rebate
    exclude?: string[] // Specific location that do not qualify
  }
  channel: {
    // Channel of spending that qualifies for rebate
    online: boolean
    physical: boolean
    local: boolean // when online=true, means using local currency (HKD), if online=false, means transaction location is in HK
    overseas: boolean // when online=true, means using foreign currency, if online=false, means transaction location is outside HK
  }
  excludeCbf?: boolean // Exclude Cross Border Fee (CBF) transactions to qualify for rebate
  startDate?: string // Start date of rebate in YYYY-MM-DD format (inclusive)
  endDate?: string // End date of rebate in YYYY-MM-DD format (inclusive)
  minAmount?: number // Minimum spending required for rebate to apply
  minPeriod?: 'payment' | 'monthly' | 'yearly' | 'cycle' //  period for minimum spending amount to be calculated; cycle means from start date to end date
  maxAmount?: number // Maximum spending that qualifies for rebate
  maxPeriod?: 'payment' | 'monthly' | 'yearly' | 'cycle' // period for maximum spending amount to be calculated; cycle means from start date to end date
  remarks?: DisplayText // Additional conditions / information of this level of rebate
}
