const throttleMs = 1000; // Default throttle time, configurable
const queues = new Map();
const lastFetchTimes = new Map();

function getHostname(url: string) {
  return new URL(url).hostname;
}

function processQueue(hostname: string) {
  if (!queues.has(hostname)) {
    return;
  }

  if (queues.get(hostname).length === 0) {
    queues.delete(hostname);
    return;
  }

  console.log(`Processing queue for ${hostname}, ${queues.get(hostname).length} items left`);

  const now = Date.now();
  const lastFetchTime = lastFetchTimes.get(hostname) || 0;
  const timeUntilNextFetch = Math.max(0, throttleMs - (now - lastFetchTime));

  setTimeout(() => {
    const nextInQueue = queues.get(hostname).shift();
    if (!nextInQueue) {
      return;
    }
    const { url, options, resolve, reject } = nextInQueue;
    lastFetchTimes.set(hostname, Date.now());

    fetch(url, options)
      .then(resolve)
      .catch(reject)
      .finally(() => processQueue(hostname));
  }, timeUntilNextFetch);
}

export function throttledFetch(url: string, options = {}): Promise<Response> {
  return new Promise((resolve, reject) => {
    const hostname = getHostname(url);

    if (!queues.has(hostname)) {
      queues.set(hostname, []);
    }

    queues.get(hostname).push({ url, options, resolve, reject });

    if (queues.get(hostname).length === 1) {
      processQueue(hostname);
    }
  });
}
