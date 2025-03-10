import _ from 'lodash'

import { CreditCardType, WaiverCondition, Period, Channel } from '@/logic/credit-card/model'
import type { CreditCard, Rebate, RebateWithCard } from '@/logic/credit-card/model'
import type { RawCreditCard, RawRebate } from '@/logic/credit-card/raw'
import { toEnum } from '@/logic/enum'

/**
 * Transform a raw rebate object into a structured Rebate
 */
export function transformRebate(cardId: string, bankId: string, index: number, rawRebate: RawRebate): Rebate {
  return {
    id: `${cardId}-${index}`,
    cardId,
    bankId,
    level: rawRebate.level,
    percentage: rawRebate.percentage,
    categoriesInclude: rawRebate.categories?.include,
    categoriesExclude: rawRebate.categories?.exclude,
    shops: rawRebate.shops,
    locationInclude: rawRebate.location?.include,
    locationExclude: rawRebate.location?.exclude,
    channels: [
      ...(rawRebate.channel.online && rawRebate.channel.local ? [Channel.OnlineLocal] : []),
      ...(rawRebate.channel.online && rawRebate.channel.overseas ? [Channel.OnlineOverseas] : []),
      ...(rawRebate.channel.physical && rawRebate.channel.local ? [Channel.PhysicalLocal] : []),
      ...(rawRebate.channel.physical && rawRebate.channel.overseas ? [Channel.PhysicalOverseas] : []),
    ],
    excludeCbf: rawRebate.excludeCbf ?? false,
    startDate: rawRebate.startDate,
    endDate: rawRebate.endDate,
    minAmount: rawRebate.minAmount,
    minPeriod: toEnum(Period, rawRebate.minPeriod),
    maxAmount: rawRebate.maxAmount,
    maxPeriod: toEnum(Period, rawRebate.maxPeriod),
  }
}

/**
 * Transform a raw credit card into a structured CreditCard
 * @param rawCard The raw credit card data
 * @param filename The source filename (used to generate ID)
 */
export function transformCreditCard(id: string, rawCard: RawCreditCard): CreditCard {
  // extract the percentages in descending order
  const percentages = _(rawCard.rebateList)
    .map((rebate) => rebate.percentage)
    .uniq()
    .orderBy([(percentage) => percentage], ['desc'])
    .value()

  return {
    id,
    name: rawCard.name,
    bankId: rawCard.bank,
    type: toEnum(CreditCardType, rawCard.type),
    annualFee: {
      fee: rawCard.annualFee.fee,
      chargeAfter: rawCard.annualFee.chargeAfter,
      waiverCondition: toEnum(WaiverCondition, rawCard.annualFee.waiverCondition),
    },
    charges: {
      fcc: rawCard.charges.fcc,
      cbf: rawCard.charges.cbf,
    },
    percentages,
  }
}

/**
 * Transform an array of raw credit cards into structured CreditCards
 */
export function transformCreditCards(rawCards: Record<string, RawCreditCard>): {
  creditCards: CreditCard[]
  rebates: Rebate[]
} {
  const creditCards: CreditCard[] = []
  const rebates: RebateWithCard[] = []

  for (const [id, rawCard] of Object.entries(rawCards)) {
    const creditCard = transformCreditCard(id, rawCard)
    creditCards.push(creditCard)

    rawCard.rebateList.forEach((rawRebate, index) => {
      const rebateWithCard = transformRebate(id, rawCard.bank, index, rawRebate)
      rebates.push({ ...rebateWithCard, card: creditCard })
    })
  }

  return {
    creditCards,
    rebates: rebates.map(({ card: _, ...rebate }) => rebate),
  }
}
