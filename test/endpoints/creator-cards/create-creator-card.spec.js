const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');

const mockedServer = createMockServer(['endpoints/creator-cards']);

const baseBody = {
  title: 'George Cooks',
  creator_reference: 'crt_8f2k1m9x4p7w3q5z',
  status: 'published',
};

describe('POST /creator-cards', () => {
  it('creates a card and returns HTTP 200 with the serialized card', async () => {
    const response = await mockedServer.post('/creator-cards', { body: baseBody });

    expect(response.statusCode).to.equal(200);
    expect(response.data.status).to.equal('success');
    expect(response.data.message).to.equal('Creator Card Created Successfully.');
    expect(response.data.data).to.have.property('id');
    expect(response.data.data).to.not.have.property('_id');
    expect(response.data.data.access_type).to.equal('public');
  });

  it('rejects a private card with no access_code using AC01, with the code field present', async () => {
    const response = await mockedServer.post('/creator-cards', {
      body: { ...baseBody, access_type: 'private' },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.data.code).to.equal('AC01');
  });

  it('rejects a public card that sets access_code using AC05', async () => {
    const response = await mockedServer.post('/creator-cards', {
      body: { ...baseBody, access_code: 'A1B2C3' },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.data.code).to.equal('AC05');
  });

  it('rejects an already-taken slug using SL02', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { slug: 'george-cooks' },
    });

    const response = await mockedServer.post('/creator-cards', {
      body: { ...baseBody, slug: 'george-cooks' },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.data.code).to.equal('SL02');
    revert();
  });

  it('fails VSL validation with HTTP 400 when status is not draft/published', async () => {
    const response = await mockedServer.post('/creator-cards', {
      body: { ...baseBody, status: 'archived' },
    });

    expect(response.statusCode).to.equal(400);
  });
});
