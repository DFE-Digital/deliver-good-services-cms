/**
 * Custom route: GET /job-specifications/by-slug/:slug
 * Returns one job specification by slug with profession and sibling job specs (same profession) in grade order.
 */

/** @type {import('@strapi/strapi').Core.RouterConfig} */
const config = {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/job-specifications/by-slug/:slug',
      handler: 'job-specification.findBySlug',
      config: { auth: false },
    },
  ],
};

export default config;
