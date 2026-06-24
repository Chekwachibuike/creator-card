const { throwAppError } = require('@app-core/errors');
const repository = require('@app/repository/creator-card');
const Messages = require('@app/messages/creator-card');
const serializeCreatorCard = require('./serialize-creator-card');

async function deleteCreatorCard(slug) {
  const card = await repository.findOne({ query: { slug } });

  if (!card) {
    throwAppError(Messages.CARD_NOT_FOUND, 'NF01');
  }

  const deletedAt = Date.now();

  await repository.updateOne({
    query: { _id: card._id },
    updateValues: { deleted: deletedAt },
  });

  return {
    message: 'Creator Card Deleted Successfully.',
    data: serializeCreatorCard({ ...card, deleted: deletedAt }),
  };
}

module.exports = deleteCreatorCard;
