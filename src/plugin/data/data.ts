import type { RawCreditCard } from '@/logic/credit-card/raw'
import { transformCreditCards } from '@/logic/credit-card/transform'
import { Exporter } from '@/logic/export'
import { Importer } from '@/logic/import'
import type { RawOptions } from '@/logic/option/raw'
import { transformOptions } from '@/logic/option/transform'

export function createData() {
  const startTime = performance.now()

  // Import
  const importer = new Importer({
    basePath: 'raw',
  })

  const optionList = importer.importList<RawOptions>('options')
  const cardMap = importer.importMap<RawCreditCard>('credit-card')

  // Validate & Transform
  const { creditCards, rebates } = transformCreditCards(cardMap)
  const options = transformOptions(optionList)

  // Export
  const exporter = new Exporter({
    basePath: 'public/data',
  })

  exporter.exportObject(options, 'options')
  exporter.exportArray(creditCards, 'credit-cards')
  exporter.exportArray(rebates, 'rebates')

  const endTime = performance.now()
  console.log(`Data processed in ${Math.round(endTime - startTime)}ms`)
}
