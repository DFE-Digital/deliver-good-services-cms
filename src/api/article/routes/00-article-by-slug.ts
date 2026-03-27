/**
 * Custom route: GET /articles/by-slug/:slug
 * Returns one article by slug.
 */

/** @type {import('@strapi/strapi').Core.RouterConfig} */
const config = {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/articles/by-slug/:slug',
      handler: 'article.findBySlug',
      config: { auth: false },
    },
  ],
};

export default config;
