function serializeCreatorCard(card, { includeAccessCode = true } = {}) {
  const { _id, deleted, access_code: accessCode, ...rest } = card;
  const serialized = {
    id: _id,
    ...rest,
    deleted: deleted || null,
  };

  if (includeAccessCode) {
    serialized.access_code = accessCode ?? null;
  }

  return serialized;
}

module.exports = serializeCreatorCard;
