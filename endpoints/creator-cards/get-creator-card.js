const { createHandler } = require('@app-core/server');
const getCreatorCard = require('@app/services/creator-cards/get-creator-card');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async handler(rc, helpers) {
    const response = await getCreatorCard(rc.params.slug, rc.query.access_code);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: response.message,
      data: response.data,
    };
  },
});
