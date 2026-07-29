import { createHmac, timingSafeEqual } from "node:crypto";
import { Agent, fetch, interceptors } from "undici";

type SafepayEnvironment = "sandbox" | "production";

type SafepayApiEnvelope<T> = {
  data?: T;
  status?: {
    errors?: unknown[];
    message?: string;
  };
};

type TrackerResponse = {
  tracker?: {
    token?: string;
    state?: string;
  };
};

// Safepay's API is behind a dual-stack edge. Pinning this *server-only*
// dispatcher to IPv4 avoids intermittent Node DNS/connection failures seen on
// some local and container networks; it does not change application-wide DNS.
const safepayDispatcher = new Agent().compose(
  interceptors.dns({
    affinity: 4,
    dualStack: false,
    maxTTL: 60_000,
  }),
);

export class SafepayRequestError extends Error {
  constructor(
    message: string,
    readonly receivedResponse: boolean,
    readonly status?: number,
  ) {
    super(message);
    this.name = "SafepayRequestError";
  }
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function getEnvironment(): SafepayEnvironment {
  const value = process.env.SAFEPAY_ENV?.trim().toLowerCase();
  if (value === "sandbox" || value === "production") {
    return value;
  }
  throw new Error("SAFEPAY_ENV must be either sandbox or production.");
}

function getApiBaseUrl(environment: SafepayEnvironment): string {
  return environment === "production"
    ? "https://api.getsafepay.com"
    : "https://sandbox.api.getsafepay.com";
}

function getCheckoutBaseUrl(environment: SafepayEnvironment): string {
  return environment === "production"
    ? "https://getsafepay.com"
    : "https://sandbox.api.getsafepay.com";
}

function getTimeoutMs(): number {
  const configured = Number(process.env.SAFEPAY_TIMEOUT_MS ?? "15000");
  return Number.isSafeInteger(configured) && configured >= 1_000 && configured <= 60_000
    ? configured
    : 15_000;
}

async function safepayRequest<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const environment = getEnvironment();
  const merchantSecret = getRequiredEnv("SAFEPAY_MERCHANT_SECRET");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const response = await fetch(`${getApiBaseUrl(environment)}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-SFPY-MERCHANT-SECRET": merchantSecret,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      dispatcher: safepayDispatcher,
    });

    const payload = (await response.json().catch(() => null)) as SafepayApiEnvelope<T> | null;
    if (!response.ok || !payload?.data) {
      const message = payload?.status?.message ?? "Safepay rejected the payment request.";
      throw new SafepayRequestError(message, true, response.status);
    }

    return payload.data;
  } catch (error) {
    if (error instanceof SafepayRequestError) {
      throw error;
    }
    console.error("[safepay] Transport request failed", {
      path,
      name: error instanceof Error ? error.name : "UnknownError",
      cause: error instanceof Error && error.cause ? String(error.cause) : null,
    });
    throw new SafepayRequestError(
      "Unable to reach Safepay. The payment session needs reconciliation before another attempt.",
      false,
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function createSafepayCheckout(input: {
  amountMinor: number;
  orderId: string;
  redirectUrl: string;
  cancelUrl: string;
}): Promise<{ tracker: string; checkoutUrl: string }> {
  const merchantApiKey = getRequiredEnv("SAFEPAY_API_KEY");

  const session = await safepayRequest<TrackerResponse>("/order/payments/v3/", {
    merchant_api_key: merchantApiKey,
    intent: "CYBERSOURCE",
    mode: "payment",
    entry_mode: "raw",
    currency: "PKR",
    amount: input.amountMinor,
    metadata: {
      source: "nextshop",
      order_id: input.orderId,
    },
    include_fees: false,
  });

  const tracker = session.tracker?.token;
  if (!tracker) {
    throw new SafepayRequestError("Safepay did not return a payment tracker.", true);
  }

  const checkoutUrl = await createSafepayHostedUrl({
    tracker,
    redirectUrl: input.redirectUrl,
    cancelUrl: input.cancelUrl,
  });

  return { tracker, checkoutUrl };
}

export async function createSafepayHostedUrl(input: {
  tracker: string;
  redirectUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const environment = getEnvironment();
  const passportToken = await safepayRequest<string>("/client/passport/v1/token", {});

  if (!passportToken) {
    throw new SafepayRequestError("Safepay did not return a checkout token.", true);
  }

  const url = new URL("/embedded/", getCheckoutBaseUrl(environment));
  url.searchParams.set("environment", environment);
  url.searchParams.set("tbt", passportToken);
  url.searchParams.set("tracker", input.tracker);
  url.searchParams.set("source", "hosted");
  url.searchParams.set("redirect_url", input.redirectUrl);
  url.searchParams.set("cancel_url", input.cancelUrl);
  return url.toString();
}

function signaturesMatch(signature: string, expected: string): boolean {
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

/**
 * Safepay signs the exact raw request body with HMAC-SHA512. Never parse and
 * stringify before this function is called.
 */
export function verifySafepayWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !/^[a-fA-F0-9]{128}$/.test(signature)) {
    return false;
  }

  const secrets = [
    process.env.SAFEPAY_WEBHOOK_SECRET,
    process.env.SAFEPAY_WEBHOOK_PREVIOUS_SECRET,
  ].filter((value): value is string => Boolean(value?.trim()));

  return secrets.some((secret) => {
    const expected = createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");
    return signaturesMatch(signature, expected);
  });
}

export function validateSafepayWebhookMerchantKey(value: unknown): boolean {
  return typeof value === "string" && value === process.env.SAFEPAY_API_KEY;
}
