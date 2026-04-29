import type { TemplateLayer } from './resolve'
import { renderTemplate } from '../actions/template-manager'
import type { RenderContext } from '../actions/template-manager'

/**
 * Apply template layers sequentially by copying their source directories
 * into the target project root.
 */
export function applyTemplateLayers(layers: TemplateLayer[], destRoot: string, context?: RenderContext) {
  for (const layer of layers) {
    renderTemplate(layer.src, destRoot, context)
  }
}

