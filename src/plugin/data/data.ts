import type { RawCard } from '@/logic/card/raw'
import { transformCards } from '@/logic/card/transform'
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
  const cardMap = importer.importMap<RawCard>('card')

  // Validate & Transform
  const { cards, rebates, rebatesLocales } = transformCards(cardMap)
  const { options, optionsLocales } = transformOptions(optionList)

  // Export
  const dataExporter = new Exporter({
    basePath: 'public/data',
  })

  dataExporter.exportObject(options, 'options')
  dataExporter.exportArray(cards, 'cards')
  dataExporter.exportArray(rebates, 'rebates')

  const localesExporter = new Exporter({
    basePath: 'public/locales',
  })

  localesExporter.exportObject(optionsLocales.zh, 'options.zh')
  localesExporter.exportObject(optionsLocales.en, 'options.en')
  localesExporter.exportObject(rebatesLocales.zh, 'rebates.zh')
  localesExporter.exportObject(rebatesLocales.en, 'rebates.en')

  const endTime = performance.now()
  console.log(`Data processed in ${Math.round(endTime - startTime)}ms`)
}
