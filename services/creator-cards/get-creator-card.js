const { throwAppError } = require('@app-core/errors');
const repository = require('@app/repository/creator-card');
const Messages = require('@app/messages/creator-card');
const serializeCreatorCard = require('./serialize-creator-card');

async function getCreatorCard(slug, accessCode) {
  const card = await repository.findOne({ query: { slug } });

  if (!card) {
    throwAppError(Messages.CARD_NOT_FOUND, 'NF01');
  }

  if (card.status === 'draft') {
    throwAppError(Messages.CARD_NOT_FOUND, 'NF02');
  }

  if (card.access_type === 'private') {
    if (!accessCode) {
      throwAppError(Messages.ACCESS_CODE_REQUIRED_TO_VIEW, 'AC03');
    }
    if (accessCode !== card.access_code) {
      throwAppError(Messages.INVALID_ACCESS_CODE, 'AC04');
    }
  }

  return {
    message: 'Creator Card Retrieved Successfully.',
    data: serializeCreatorCard(card, { includeAccessCode: false }),
  };
}

module.exports = getCreatorCard;
