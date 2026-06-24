const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');

const mockedServer = createMockServer(['endpoints/creator-cards']);

describe('DELETE /creator-cards/:slug', () => {
  it('returns NF01 when no card matches the slug', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      mockNull: true,
    });

    const response = await mockedServer.delete('/creator-cards/missing-slug');

    expect(response.statusCode).to.equal(404);
    expect(response.data.code).to.equal('NF01');
    revert();
  });

  it('soft-deletes the card and echoes back the original slug', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { slug: 'george-cooks' },
    });

    const response = await mockedServer.delete('/creator-cards/george-cooks');

    expect(response.statusCode).to.equal(200);
    expect(response.data.data.slug).to.equal('george-cooks');
    expect(response.data.data.deleted).to.be.a('number');
    revert();
  });
});
