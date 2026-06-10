import type {
  BurnRateHistory,
  BurnRatePoint,
  CurrentBurnRates,
} from "@/types/burnRate";

const METRICS_API_BASE = "https://metrics-api.internetcomputer.org/api/v1";
const ICP_USD_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd";
const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY;
const CYCLES_PER_XDR = 1_000_000_000_000;
const FALLBACK_USD_PER_XDR = 1.35;
const CONVERSION_CACHE_MS = 10 * 60 * 1000;

interface CycleBurnRateResponse {
  cycle_burn_rate: Array<[number, string]>;
}

interface IcpXdrConversionResponse {
  icp_xdr_conversion_rates: Array<[number, number]>;
}

interface IcpUsdResponse {
  "internet-computer"?: {
    usd?: number;
  };
}

interface ConversionRates {
  usdPerXdr: number;
  icpUsd?: number;
  xdrPerIcp?: number;
}

let conversionCache:
  | (ConversionRates & {
      expiresAt: number;
    })
  | undefined;
let conversionPromise: Promise<ConversionRates> | undefined;

async function fetchJson<T>(url: URL | string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Metrics request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function parseCyclesPerSecond(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid cycle burn rate: ${value}`);
  }
  return parsed;
}

function buildPoint(
  timestampSeconds: number,
  cyclesPerSecond: number,
  usdPerXdr?: number,
): BurnRatePoint {
  const cyclesPerHour = cyclesPerSecond * SECONDS_PER_HOUR;
  const cyclesPerDay = cyclesPerSecond * SECONDS_PER_DAY;
  const cyclesPerWeek = cyclesPerSecond * SECONDS_PER_WEEK;
  const usdPerCycle =
    usdPerXdr && usdPerXdr > 0 ? usdPerXdr / CYCLES_PER_XDR : undefined;

  return {
    timestamp: timestampSeconds * 1000,
    cyclesPerSecond,
    cyclesPerHour,
    cyclesPerDay,
    cyclesPerWeek,
    usdPerHour: usdPerCycle ? cyclesPerHour * usdPerCycle : undefined,
    usdPerDay: usdPerCycle ? cyclesPerDay * usdPerCycle : undefined,
    usdPerWeek: usdPerCycle ? cyclesPerWeek * usdPerCycle : undefined,
  };
}

async function fetchCycleBurnRatePairs(
  fromSeconds?: number,
  toSeconds?: number,
  stepSeconds?: number,
): Promise<Array<[number, string]>> {
  const url = new URL(`${METRICS_API_BASE}/cycle-burn-rate`);
  if (fromSeconds !== undefined) {
    url.searchParams.set("start", String(fromSeconds));
  }
  if (toSeconds !== undefined) {
    url.searchParams.set("end", String(toSeconds));
  }
  if (stepSeconds !== undefined) {
    url.searchParams.set("step", String(stepSeconds));
  }

  const data = await fetchJson<CycleBurnRateResponse>(url);
  if (!Array.isArray(data.cycle_burn_rate)) {
    throw new Error("Metrics response did not include cycle_burn_rate");
  }
  return data.cycle_burn_rate;
}

async function fetchConversionRates(): Promise<ConversionRates> {
  const now = Date.now();
  if (conversionCache && conversionCache.expiresAt > now) {
    return conversionCache;
  }
  if (conversionPromise) return conversionPromise;

  conversionPromise = (async () => {
    try {
      const [xdrData, usdData] = await Promise.all([
        fetchJson<IcpXdrConversionResponse>(
          `${METRICS_API_BASE}/icp-xdr-conversion-rates`,
        ),
        fetchJson<IcpUsdResponse>(ICP_USD_URL),
      ]);

      const latestXdr = xdrData.icp_xdr_conversion_rates.at(-1);
      const xdrPerIcp = latestXdr ? latestXdr[1] / 10_000 : undefined;
      const icpUsd = usdData["internet-computer"]?.usd;
      const usdPerXdr =
        xdrPerIcp && icpUsd && xdrPerIcp > 0
          ? icpUsd / xdrPerIcp
          : FALLBACK_USD_PER_XDR;

      conversionCache = {
        usdPerXdr,
        icpUsd,
        xdrPerIcp,
        expiresAt: now + CONVERSION_CACHE_MS,
      };
      return conversionCache;
    } finally {
      conversionPromise = undefined;
    }
  })();

  return conversionPromise;
}

export async function fetchCurrentNetworkBurnRates(): Promise<CurrentBurnRates> {
  const [pairs, conversion] = await Promise.all([
    fetchCycleBurnRatePairs(),
    fetchConversionRates(),
  ]);
  const latest = pairs.at(-1);
  if (!latest) throw new Error("Metrics API returned no cycle burn data");

  const point = buildPoint(
    latest[0],
    parseCyclesPerSecond(latest[1]),
    conversion.usdPerXdr,
  );
  return {
    ...point,
    snapshotAt: point.timestamp,
    usdPerXdr: conversion.usdPerXdr,
    icpUsd: conversion.icpUsd,
    xdrPerIcp: conversion.xdrPerIcp,
    source: "metrics-api",
  };
}

export async function fetchNetworkBurnRateHistory(
  fromMs: number,
  toMs: number,
  intervalMs: number,
): Promise<BurnRateHistory> {
  const fromSeconds = Math.floor(fromMs / 1000);
  const toSeconds = Math.floor(toMs / 1000);
  const stepSeconds = Math.max(60, Math.floor(intervalMs / 1000));
  const [pairs, conversion] = await Promise.all([
    fetchCycleBurnRatePairs(fromSeconds, toSeconds, stepSeconds),
    fetchConversionRates(),
  ]);

  return {
    points: pairs.map(([timestamp, value]) =>
      buildPoint(timestamp, parseCyclesPerSecond(value), conversion.usdPerXdr),
    ),
    rangeStart: fromMs,
    rangeEnd: toMs,
  };
}

export function buildFallbackPoint(timestampMs: number): BurnRatePoint {
  const cyclesPerSecond =
    42_000_000_000 +
    7_000_000_000 * Math.sin(timestampMs / 3_600_000 + 1.2) +
    2_000_000_000 * Math.sin(timestampMs / 600_000);
  return buildPoint(
    Math.floor(timestampMs / 1000),
    Math.max(1, cyclesPerSecond),
    FALLBACK_USD_PER_XDR,
  );
}

export function buildFallbackCurrent(
  timestampMs = Date.now(),
): CurrentBurnRates {
  return {
    ...buildFallbackPoint(timestampMs),
    snapshotAt: timestampMs,
    usdPerXdr: FALLBACK_USD_PER_XDR,
    source: "fallback",
  };
}
