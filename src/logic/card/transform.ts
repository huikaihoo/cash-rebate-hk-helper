import _ from 'lodash'

import { CardType, WaiverCondition, Period, Channel } from '@/logic/card/model'
import type { Card, Rebate, RebateWithCard } from '@/logic/card/model'
import type { RawCard, RawRebate } from '@/logic/card/raw'
import { toEnum } from '@/logic/enum'
import { cleanLocales, Locales } from '@/logic/locales'

/**
 * Transform a raw rebate object into a structured Rebate
 */
export function transformRebate(
  cardId: string,
  bankId: string,
  index: number,
  rawRebate: RawRebate,
): {
  rebate: Rebate
  locales: Locales
} {
  const id = `${cardId}-${index}`

  return {
    rebate: {
      id,
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
    },
    locales: {
      en: {
        [id]: {
          remarks: rawRebate.remarks?.en ?? {},
        },
      },
      zh: {
        [id]: {
          remarks: rawRebate.remarks?.zh ?? {},
        },
      },
    } as Locales,
  }
}

/**
 * Transform a raw card object into a structured Card
 * @param id The card ID
 * @param rawCard The raw card data
 * @returns The transformed card
 */
export function transformCard(id: string, rawCard: RawCard): Card {
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
    type: toEnum(CardType, rawCard.type),
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
 * Transform raw cards into structured cards and rebates
 * @param rawCards The raw card data
 * @returns The transformed cards and rebates
 */
export function transformCards(rawCards: Record<string, RawCard>): {
  cards: Card[]
  rebates: Rebate[]
  cardsLocales: Locales
  rebatesLocales: Locales
} {
  const cards: Card[] = []
  const rebates: RebateWithCard[] = []
  const cardsLocales = { en: {}, zh: {} }
  const rebatesLocales = { en: {}, zh: {} }

  for (const [id, rawCard] of Object.entries(rawCards)) {
    const card = transformCard(id, rawCard)
    cards.push(card)

    rawCard.rebateList.forEach((rawRebate, index) => {
      const { rebate, locales } = transformRebate(id, rawCard.bank, index, rawRebate)
      rebates.push({ ...rebate, card: card })
      rebatesLocales.en = { ...rebatesLocales.en, ...locales.en }
      rebatesLocales.zh = { ...rebatesLocales.zh, ...locales.zh }
    })
  }

  return {
    cards: cards,
    rebates: rebates.map(({ card: _, ...rebate }) => rebate),
    cardsLocales: cleanLocales(cardsLocales),
    rebatesLocales: cleanLocales(rebatesLocales),
  }
}
