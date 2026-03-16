export interface PollOptions {
  timeout: number;
  interval: number;
}

export async function poll<T>(
  fn: () => Promise<T>,
  predicate: (value: T) => boolean,
  options: PollOptions,
): Promise<T> {
  const deadline = Date.now() + options.timeout;

  while (true) {
    const value = await fn();

    if (predicate(value)) {
      return value;
    }

    if (Date.now() >= deadline) {
      throw new Error(`Polling timed out after ${options.timeout}ms`);
    }

    await new Promise((resolve) => setTimeout(resolve, options.interval));
  }
}
