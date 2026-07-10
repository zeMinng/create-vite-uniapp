

export function getCombinations<T>(arr: T[]): T[][] {
  const combinations: T[][] = []

  // Binary combination generator:
  // For n elements, there are 2^n combinations
  for (let i = 0; i < (1 << arr.length); i++) {
    const combination: T[] = []
    for (let j = 0; j < arr.length; j++) {
      if (i & (1 << j)) {
        combination.push(arr[j])
      }
    }
    combinations.push(combination)
  }

  return combinations
}
