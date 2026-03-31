/**
 * collection controller
 */

import { factories } from '@strapi/strapi';

const FIELDS_GUIDE = ['title', 'slug', 'metaDescription'] as const;
const FIELDS_PAGE = ['title', 'slug', 'metaDescription'] as const;
const FIELDS_EXT = ['title', 'url', 'newTab', 'description', 'externalLink', 'type', 'priorityInGroup'] as const;
const FIELDS_JOB_SPEC = ['title', 'slug', 'grade'] as const;

type Section = {
  order?: number;
  title?: string;
  description?: string;
  detailed_guides?: Array<{ detailed_guide?: unknown }>;
  detailed_guide_pages?: Array<{ detailed_guide_page?: unknown }>;
  external_links?: Array<{ external_link?: unknown }>;
  job_descriptions?: Array<{ job_specifications?: unknown[] }>;
};

function getDocumentId(rel: string | object | null | undefined): string | null {
  if (rel == null) return null;
  if (typeof rel === 'string') return rel;
  if (typeof rel !== 'object') return null;
  const o = rel as Record<string, unknown>;
  if ('documentId' in o && o.documentId != null) return String(o.documentId);
  if ('id' in o && o.id != null) return String(o.id);
  if (o.data && typeof o.data === 'object' && o.data !== null && 'documentId' in (o.data as object))
    return String((o.data as { documentId: string }).documentId);
  return null;
}

export default factories.createCoreController('api::collection.collection', ({ strapi }) => ({
  /**
   * GET /collections/by-slug/:slug
   * Returns one collection with sections (title, description, items). Each section's items are built from
   * detailed_guide, detailed_guide_page, external_links. Only slim fields (no body).
   */
  async findBySlug(ctx) {
    const { slug } = ctx.params as { slug: string };
    if (!slug) {
      return ctx.badRequest('Missing slug');
    }

    const collection = await strapi.documents('api::collection.collection').findFirst({
      status: 'published',
      filters: { slug: { $eq: slug } },
      populate: {
        sections: {
          populate: [
            'detailed_guides',
            'detailed_guides.detailed_guide',
            'detailed_guide_pages',
            'detailed_guide_pages.detailed_guide_page',
            'external_links',
            'external_links.external_link',
            'job_descriptions',
            'job_descriptions.job_specifications',
          ] as const,
        },
        relatedContent: true,
        contentOwner: {
          populate: ['informationPage'],
        },
        applicableProfessions: true,
        relatedFiles: true,
      },
    });

    if (!collection) {
      return ctx.notFound();
    }

    const rawSections = (collection as Record<string, unknown>).sections as Section[] | undefined;
    const sections: Array<{ title: string; summary?: string; order: number; items: unknown[] }> = [];

    for (const section of rawSections ?? []) {
      const items: unknown[] = [];

      for (const ref of section.detailed_guides ?? []) {
        const guideId = getDocumentId(ref.detailed_guide as string | object | null);
        if (!guideId) continue;
        try {
          const doc = await strapi.documents('api::detailed-guide.detailed-guide').findOne({
            documentId: guideId,
            status: 'published',
            fields: [...FIELDS_GUIDE],
          });
          if (doc)
            items.push({
              type: 'detailed_guide',
              title: (doc as Record<string, unknown>).title,
              slug: (doc as Record<string, unknown>).slug,
              metaDescription: (doc as Record<string, unknown>).metaDescription,
              url: `/guidance/guides/${(doc as Record<string, unknown>).slug}`,
            });
        } catch {
          /* skip */
        }
      }

      for (const ref of section.detailed_guide_pages ?? []) {
        const pageId = getDocumentId(ref.detailed_guide_page as string | object | null);
        if (!pageId) continue;
        try {
          const page = await strapi.documents('api::detailed-guide-page.detailed-guide-page').findOne({
            documentId: pageId,
            status: 'published',
            fields: [...FIELDS_PAGE],
            populate: ['detailed_guide'],
          });
          if (page) {
            const guideRel = (page as Record<string, unknown>).detailed_guide;
            let guideSlug: string | null = null;
            const gid = getDocumentId(guideRel as string | object | null);
            if (gid) {
              const guide = await strapi.documents('api::detailed-guide.detailed-guide').findOne({
                documentId: gid,
                status: 'published',
                fields: ['slug'],
              });
              if (guide) guideSlug = (guide as Record<string, unknown>).slug as string;
            }
            const pageSlug = (page as Record<string, unknown>).slug as string;
            const url =
              guideSlug != null
                ? `/guidance/guides/${guideSlug}/${pageSlug}`
                : `/guidance/guides/${pageSlug}`;
            items.push({
              type: 'detailed_guide_page',
              title: (page as Record<string, unknown>).title,
              slug: pageSlug,
              metaDescription: (page as Record<string, unknown>).metaDescription,
              url,
            });
          }
        } catch {
          /* skip */
        }
      }

      for (const ref of section.external_links ?? []) {
        const extId = getDocumentId(ref.external_link as string | object | null);
        if (!extId) continue;
        try {
          const doc = await strapi.documents('api::external-link.external-link').findOne({
            documentId: extId,
            status: 'published',
            fields: [...FIELDS_EXT],
          });
          if (doc)
            items.push({
              type: 'external_link',
              title: (doc as Record<string, unknown>).title,
              slug: null,
              metaDescription: (doc as Record<string, unknown>).description,
              url: (doc as Record<string, unknown>).url,
              newTab: (doc as Record<string, unknown>).newTab,
              externalLink: (doc as Record<string, unknown>).externalLink,
              linkType: (doc as Record<string, unknown>).type,
              priorityInGroup: Boolean((doc as Record<string, unknown>).priorityInGroup),
            });
        } catch {
          /* skip */
        }
      }

      for (const jobFamily of section.job_descriptions ?? []) {
        const specs = Array.isArray(jobFamily.job_specifications) ? jobFamily.job_specifications : [];
        for (const ref of specs) {
          const specId = getDocumentId(ref as string | object | null);
          if (!specId) continue;
          try {
            const doc = await strapi.documents('api::job-specification.job-specification').findOne({
              documentId: specId,
              status: 'published',
              fields: [...FIELDS_JOB_SPEC],
            });
            if (doc)
              items.push({
                type: 'job_specification',
                title: (doc as Record<string, unknown>).title,
                slug: (doc as Record<string, unknown>).slug,
                metaDescription: null,
                url: `/guidance/job-specifications/${(doc as Record<string, unknown>).slug}`,
                grade: (doc as Record<string, unknown>).grade ?? null,
              });
          } catch {
            /* skip */
          }
        }
      }

      const prioritizedItems = items
        .map((item, index) => ({ item, index }))
        .sort((a, b) => {
          const aPriority = Boolean((a.item as Record<string, unknown>).priorityInGroup);
          const bPriority = Boolean((b.item as Record<string, unknown>).priorityInGroup);
          if (aPriority === bPriority) return a.index - b.index;
          return bPriority ? 1 : -1;
        })
        .map(({ item }) => item);

      sections.push({
        title: section.title ?? '',
        summary: section.description ?? undefined,
        order: section.order ?? 0,
        items: prioritizedItems,
      });
    }

    sections.sort((a, b) => a.order - b.order);

    const sanitized = await this.sanitizeOutput(collection, ctx);
    const out = Array.isArray(sanitized) ? sanitized[0] : sanitized;
    const outRecord = out as Record<string, unknown> | undefined;
    const raw = collection as Record<string, unknown>;
    if (outRecord) {
      if (
        (outRecord.relatedContent == null ||
          (Array.isArray(outRecord.relatedContent) && outRecord.relatedContent.length === 0)) &&
        Array.isArray(raw.relatedContent)
      ) {
        outRecord.relatedContent = raw.relatedContent;
      }
      outRecord.collection_sections = sections;
      // Ensure contentOwner and applicableProfessions are in the response (sanitizeOutput may strip them)
      if (raw.contentOwner != null) {
        outRecord.contentOwner = raw.contentOwner;
      }
      if (raw.applicableProfessions != null) {
        outRecord.applicableProfessions = raw.applicableProfessions;
      }
      if (raw.showLastReviewedDateOnPage != null) {
        outRecord.showLastReviewedDateOnPage = raw.showLastReviewedDateOnPage;
      }
      if (raw.lastReviewedDate != null) {
        outRecord.lastReviewedDate = raw.lastReviewedDate;
      }
      if (raw.relatedFiles != null) {
        outRecord.relatedFiles = raw.relatedFiles;
      }
    }
    ctx.body = { data: Array.isArray(sanitized) ? sanitized : [sanitized] };
  },
}));
