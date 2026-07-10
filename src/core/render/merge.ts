/**
 * Merge two JSON objects recursively. (递归合并两个 JSON 对象)
 * @param target - The target JSON object. (目标 JSON 对象)
 * @param source - The source JSON object. (源 JSON 对象)
 * @return The merged JSON object. (合并后的 JSON 对象)
 * @remarks
 * - If a key exists in both objects and both values are objects, they will be merged recursively.
 * - If a key exists in both objects and at least one value is not an object, the source value will overwrite the target value.
 * - Arrays are not merged; the source array will overwrite the target array.
 * - Null values are treated as non-objects and will overwrite any existing value.
 * - This function does not modify the original objects; it returns a new merged object.
 * - This function does not handle circular references and will throw an error if a circular reference is detected.
 * - This function does not handle special object types (e.g., Date, RegExp) and will treat them as plain objects.
 */
export function mergeJson(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const output = { ...target }

  for (const key of Object.keys(source)) {
    const sv = source[key]
    const tv = output[key]

    if (
      sv !== null &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      output[key] = mergeJson(tv as Record<string, unknown>, sv as Record<string, unknown>)
    } else {
      output[key] = sv
    }
  }

  return output
}
