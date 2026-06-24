const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');

const mockedServer = createMockServer(['endpoints/creator-cards']);

describe('GET /creator-cards/:slug', () => {
  it('returns NF01 when no card matches the slug', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      mockNull: true,
    });

    const response = await mockedServer.get('/creator-cards/missing-slug');

    expect(response.statusCode).to.equal(404);
    expect(response.data.code).to.equal('NF01');
    revert();
  });

  it('returns NF02 when the card is a draft', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { status: 'draft', access_type: 'public' },
    });

    const response = await mockedServer.get('/creator-cards/george-cooks');

    expect(response.statusCode).to.equal(404);
    expect(response.data.code).to.equal('NF02');
    revert();
  });

  it('returns AC03 for a private card with no access_code provided', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'private', access_code: 'A1B2C3' },
    });

    const response = await mockedServer.get('/creator-cards/george-cooks');

    expect(response.statusCode).to.equal(403);
    expect(response.data.code).to.equal('AC03');
    revert();
  });

  it('returns AC04 for a private card with the wrong access_code', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'private', access_code: 'A1B2C3' },
    });

    const response = await mockedServer.get('/creator-cards/george-cooks', {
      query: { access_code: 'WRONG1' },
    });

    expect(response.statusCode).to.equal(403);
    expect(response.data.code).to.equal('AC04');
    revert();
  });

  it('returns the serialized card without access_code on a successful private retrieval', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'private', access_code: 'A1B2C3' },
    });

    const response = await mockedServer.get('/creator-cards/george-cooks', {
      query: { access_code: 'A1B2C3' },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.data).to.have.property('id');
    expect(response.data.data).to.not.have.property('access_code');
    revert();
  });

  it('returns the serialized card for a public card with no access_code needed', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'public' },
    });

    const response = await mockedServer.get('/creator-cards/george-cooks');

    expect(response.statusCode).to.equal(200);
    expect(response.data.data).to.not.have.property('access_code');
    revert();
  });
});
