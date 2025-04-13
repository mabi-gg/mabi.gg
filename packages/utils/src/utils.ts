export const isNullish = (value: unknown): value is null | undefined =>
  value === null || value === undefined
export const isNonNullish = <T>(
  value: T
): value is Exclude<T, null | undefined> =>
  value !== null && value !== undefined
export const uniqueBy = <T, K>(
  expression: (item: T) => K
): ((item: T, index: number, self: T[]) => boolean) => {
  const filter = (item: T, index: number, self: T[]) =>
    index === self.findIndex((t) => expression(t) === expression(item))
  return filter
}
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))