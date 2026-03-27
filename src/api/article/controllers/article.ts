/**
 * article controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  /**
   * GET /articles/by-slug/:slug
   * Returns one published article by slug.
   */
  async findBySlug(ctx) {
    const { slug } = ctx.params as { slug: string };
    if (!slug) {
      return ctx.badRequest('Missing slug');
    }

    const doc = await strapi.documents('api::article.article').findFirst({
      status: 'published',
      filters: { slug: { $eq: slug } },
      fields: ['title', 'slug', 'metaDescription', 'body', 'author', 'publishedFrom', 'publishedTo'],
      populate: { leadImage: { fields: ['url', 'alternativeText'] } },
    });

    if (!doc) {
      return ctx.notFound();
    }

    const sanitized = await this.sanitizeOutput(doc, ctx);
    ctx.body = { data: Array.isArray(sanitized) ? sanitized : [sanitized] };
  },
}));
