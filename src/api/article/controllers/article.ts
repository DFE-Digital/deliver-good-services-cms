/**
 * article controller
 */

import { factories } from '@strapi/strapi';
import { documentServicePublishedSlice } from '../../../utils/document-query-status';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  /**
   * GET /articles/by-slug/:slug
   * Returns one article by slug (`status=published` by default, `status=draft` for preview).
   */
  async findBySlug(ctx) {
    const { slug } = ctx.params as { slug: string };
    if (!slug) {
      return ctx.badRequest('Missing slug');
    }

    const doc = await strapi.documents('api::article.article').findFirst({
      ...documentServicePublishedSlice(ctx),
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
