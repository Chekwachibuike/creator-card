const { createHandler } = require('@app-core/server');
const deleteCreatorCard = require('@app/services/creator-cards/delete-creator-card');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async handler(rc, helpers) {
    const response = await deleteCreatorCard(rc.params.slug);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: response.message,
      data: response.data,
    };
  },
});
