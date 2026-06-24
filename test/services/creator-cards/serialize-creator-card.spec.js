const { expect } = require('chai');
const serializeCreatorCard = require('@app/services/creator-cards/serialize-creator-card');

describe('services/creator-cards/serialize-creator-card', () => {
  const card = {
    _id: '01JG8XYZA2B3C4D5E6F7G8H9J0',
    title: 'George Cooks',
    slug: 'george-cooks',
    status: 'published',
    access_type: 'public',
    access_code: 'A1B2C3',
    created: 1767052800000,
    updated: 1767052800000,
    deleted: 0,
    __v: 0,
  };

  it('maps _id to id and normalizes deleted: 0 to null', () => {
    const serialized = serializeCreatorCard(card);

    expect(serialized.id).to.equal(card._id);
    expect(serialized).to.not.have.property('_id');
    expect(serialized.deleted).to.equal(null);
  });

  it('keeps a real deleted timestamp as-is', () => {
    const serialized = serializeCreatorCard({ ...card, deleted: 1767139200000 });

    expect(serialized.deleted).to.equal(1767139200000);
  });

  it('includes access_code by default (create/delete responses)', () => {
    const serialized = serializeCreatorCard(card);

    expect(serialized.access_code).to.equal('A1B2C3');
  });

  it('omits access_code when includeAccessCode is false (public retrieval)', () => {
    const serialized = serializeCreatorCard(card, { includeAccessCode: false });

    expect(serialized).to.not.have.property('access_code');
  });

  it('strips the Mongoose __v version key', () => {
    const serialized = serializeCreatorCard(card);

    expect(serialized).to.not.have.property('__v');
  });
});
