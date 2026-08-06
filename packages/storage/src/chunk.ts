export async function processInChunks<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  chunkSize: number,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map((item, j) => fn(item, i + j)),
    );
    results.push(...chunkResults);
  }
  return results;
}
