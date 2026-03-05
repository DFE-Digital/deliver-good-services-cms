/**
 * Custom route: GET /collections/by-slug/:slug
 * Returns one collection by slug with section items fully populated (guides, external links, etc.).
 */

/** @type {import('@strapi/strapi').Core.RouterConfig} */
const config = {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/collections/by-slug/:slug',
      handler: 'collection.findBySlug',
      config: { auth: false },
    },
  ],
};

export default config;
