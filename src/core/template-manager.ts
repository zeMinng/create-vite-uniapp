import { createContext, type Language } from './context'
import { generate } from './generator'

export type CreateFromTemplateOptions = {
  projectName: string
  targetDir: string
  isTypeScript: boolean
  needsEslint: boolean
  needsStylelint: boolean
}

export async function createFromTemplates(options: CreateFromTemplateOptions): Promise<void> {
  const { projectName, targetDir, isTypeScript, needsEslint, needsStylelint } = options

  const language: Language = isTypeScript ? 'ts' : 'js'
  const featureMap: Record<string, boolean> = {
    eslint: needsEslint,
    styleLint: needsStylelint,
  }
  const features = Object.entries(featureMap)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature)

  const ctx = createContext({
    projectName,
    targetDir,
    language,
    features,
  })

  await generate(ctx)
}
