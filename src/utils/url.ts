export type UrlValidationResult =
  | {
      readonly ok: true;
      readonly url: string;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

export function validateHttpUrl(value: string): UrlValidationResult {
  try {
    const parsed = new URL(value);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        ok: false,
        message: `uses unsupported protocol "${parsed.protocol}". Only http:// and https:// are supported.`
      };
    }

    return {
      ok: true,
      url: parsed.toString()
    };
  } catch {
    return {
      ok: false,
      message: 'does not contain a valid URL.'
    };
  }
}
