/**
 * REST Content API vs Document Service use opposite defaults for Draft & Publish:
 * - REST defaults to **published** — see https://docs.strapi.io/cms/api/rest/status
 * - Document Service defaults to **draft** (omit `status`, or pass `status: 'draft'` equivalently) —
 *   see https://docs.strapi.io/cms/api/document-service/status
 *
 * Custom controllers use the Document Service directly: only merge `{ status: 'published' }` when
 * the Service Manual is **not** in draft preview; otherwise use `{ status: 'draft' }`.
 *
 * Draft preview is driven by the Service Manual sending `?status=draft` on API URLs and/or
 * `X-Cms-Draft-Preview: 1` — no Strapi-specific middleware required.
 */

export type DocumentQueryStatus = 'draft' | 'published';

export type StrapiDraftPreviewCtx = {
  query?: Record<string, unknown>;
  request?: { url?: string; headers?: Record<string, string | string[] | undefined> };
};

/** Service Manual sends `X-Cms-Draft-Preview` when draft preview is enabled. */
function rawStatusFromHeaders(ctx: StrapiDraftPreviewCtx): string | undefined {
  const c = ctx as StrapiDraftPreviewCtx & {
    get?: (name: string) => string | undefined;
    request?: { headers?: Record<string, string | string[] | undefined> };
  };

  const tryVal = (v: string | undefined) =>
    v?.trim() === '1' || /^true$/i.test(v?.trim() ?? '') ? 'draft' : undefined;

  if (typeof c.get === 'function') {
    const fromGet = tryVal(c.get('x-cms-draft-preview'));
    if (fromGet) return fromGet;
  }

  const headers = c.request?.headers;
  if (headers) {
    const raw = headers['x-cms-draft-preview'] ?? headers['X-Cms-Draft-Preview'];
    const v = Array.isArray(raw) ? raw[0] : raw;
    if (typeof v === 'string') {
      const fromHeader = tryVal(v);
      if (fromHeader) return fromHeader;
    }
  }

  return undefined;
}

function rawStatusParam(ctx: StrapiDraftPreviewCtx): string | undefined {
  const q = ctx.query;
  if (q && typeof q === 'object') {
    const raw = (q as Record<string, unknown>).status ?? (q as Record<string, unknown>).Status;
    const s = Array.isArray(raw) ? raw[0] : raw;
    if (typeof s === 'string' && s.length > 0) return s;
  }

  const url = ctx.request?.url;
  if (typeof url === 'string') {
    const qMark = url.indexOf('?');
    if (qMark >= 0) {
      try {
        const parsed = new URLSearchParams(url.slice(qMark + 1));
        const v = parsed.get('status');
        if (v) return v;
      } catch {
        /* ignore */
      }
    }
  }

  return undefined;
}

/** Prefer header from Service Manual, then `?status=draft` on the request URL / parsed query. */
export function getDocumentQueryStatus(ctx: StrapiDraftPreviewCtx): DocumentQueryStatus {
  const fromHeader = rawStatusFromHeaders(ctx);
  if (fromHeader === 'draft') return 'draft';
  const s = rawStatusParam(ctx);
  return s === 'draft' ? 'draft' : 'published';
}

/**
 * Spread onto `strapi.documents(...).findMany/findFirst/findOne(...)` options.
 * Preview: `{ status: 'draft' }`. Live site: `{ status: 'published' }`.
 *
 * @see https://docs.strapi.io/cms/api/document-service/status
 */
export function documentServicePublishedSlice(
  ctx: StrapiDraftPreviewCtx,
): { status: 'published' } | { status: 'draft' } {
  return getDocumentQueryStatus(ctx) === 'published' ? { status: 'published' } : { status: 'draft' };
}
