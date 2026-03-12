/**
 * job-specification controller
 */

import { factories } from '@strapi/strapi';

/** Grade display order for sibling job specs (same profession). */
const GRADE_ORDER = ['EA', 'EO', 'HEO', 'SEO', 'G7', 'G6', 'G6 HoP', 'SCS1', 'SCS2', 'SCS3'] as const;

function gradeSortOrder(grade: string | null | undefined): number {
  if (grade == null) return GRADE_ORDER.length;
  const i = GRADE_ORDER.indexOf(grade as (typeof GRADE_ORDER)[number]);
  return i === -1 ? GRADE_ORDER.length : i;
}

export default factories.createCoreController(
  'api::job-specification.job-specification',
  ({ strapi }) => ({
    /**
     * GET /job-specifications/by-slug/:slug
     * Returns one job specification with profession and sibling job specs (same profession) in grade order.
     */
    async findBySlug(ctx) {
      const { slug } = ctx.params as { slug: string };
      if (!slug) {
        return ctx.badRequest('Missing slug');
      }

      const doc = await strapi.documents('api::job-specification.job-specification').findFirst({
        status: 'published',
        filters: { slug: { $eq: slug } },
        fields: ['title', 'slug', 'grade', 'roleDescription', 'skills', 'enableWordDocDownload'],
        populate: { profession: { fields: ['title', 'slug', 'plural', 'professionDescription'] } },
      });

      if (!doc) {
        return ctx.notFound();
      }

      const record = doc as Record<string, unknown>;
      const rawProfession = record.profession as Record<string, unknown> | null;
      // Strapi may return relation flat or under .attributes; read plural from either
      const profession = rawProfession
        ? {
            documentId: rawProfession.documentId,
            title: (rawProfession.title ?? (rawProfession.attributes as Record<string, unknown>)?.title) as string | undefined,
            slug: (rawProfession.slug ?? (rawProfession.attributes as Record<string, unknown>)?.slug) as string | undefined,
            plural: (rawProfession.plural ?? (rawProfession.attributes as Record<string, unknown>)?.plural) as string | undefined,
            professionDescription: (rawProfession.professionDescription ?? (rawProfession.attributes as Record<string, unknown>)?.professionDescription) as string | undefined,
          }
        : null;
      const professionId = (profession?.documentId ?? rawProfession?.documentId ?? null) as string | null;

      let siblings: Array<{ title: string; slug: string; grade: string | null }> = [];

      if (professionId) {
        const siblingDocs = await strapi
          .documents('api::job-specification.job-specification')
          .findMany({
            status: 'published',
            filters: { profession: { documentId: { $eq: professionId as string } } },
            fields: ['title', 'slug', 'grade'],
          });

        siblings = (siblingDocs as Array<Record<string, unknown>>)
          .map((d) => ({
            title: (d.title as string) ?? '',
            slug: (d.slug as string) ?? '',
            grade: (d.grade as string) ?? null,
          }))
          .sort((a, b) => gradeSortOrder(a.grade) - gradeSortOrder(b.grade));
      }

      const sanitized = await this.sanitizeOutput(doc, ctx);
      const out = Array.isArray(sanitized) ? sanitized[0] : sanitized;
      const outRecord = out as Record<string, unknown> | undefined;
      if (outRecord) {
        outRecord.profession = profession
          ? {
              title: profession.title,
              slug: profession.slug,
              plural: profession.plural ?? null,
              professionDescription: profession.professionDescription ?? null,
            }
          : null;
        outRecord.siblingJobSpecifications = siblings;
      }

      ctx.body = { data: Array.isArray(sanitized) ? sanitized : [sanitized] };
    },
  })
);
