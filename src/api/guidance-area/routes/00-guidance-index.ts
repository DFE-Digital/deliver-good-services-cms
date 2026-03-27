/**
 * Custom route: GET /guidance-areas/index
 * Returns guidance areas flattened for the frontend guidance index page.
 */

/** @type {import('@strapi/strapi').Core.RouterConfig} */
const config = {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/guidance-areas/index',
      handler: 'guidance-area.findIndex',
      config: { auth: false },
    },
  ],
};

export default config;