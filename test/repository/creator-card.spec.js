const { expect } = require('chai');
const CreatorCardRepository = require('@app/repository/creator-card');
const { MockModelStubs } = require('@app/mock-models');

describe('repository/creator-card', () => {
  it('creates a card through the model-backed repository', async () => {
    const card = await CreatorCardRepository.create({
      title: 'George Cooks',
      slug: 'george-cooks',
      creator_reference: 'crt_8f2k1m9x4p7w3q5z01',
      status: 'published',
      access_type: 'public',
    });

    expect(card.title).to.equal('George Cooks');
    expect(card.slug).to.equal('george-cooks');
  });

  it('finds a card by slug', async () => {
    const card = await CreatorCardRepository.findOne({ query: { slug: 'george-cooks' } });

    expect(card.slug).to.equal('george-cooks');
  });

  it('returns null when configured to simulate "not found"', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      mockNull: true,
    });

    const card = await CreatorCardRepository.findOne({ query: { slug: 'missing-slug' } });

    expect(card).to.equal(null);
    revert();
  });
});
