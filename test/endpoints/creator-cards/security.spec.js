const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');

const mockedServer = createMockServer(['endpoints/creator-cards']);

describe('Creator Card security regression checks', () => {
  let currentRevert;

  afterEach(() => {
    if (currentRevert) {
      currentRevert();
      currentRevert = null;
    }
  });

  it('rejects a NoSQL-injection-style object passed as creator_reference', async () => {
    const response = await mockedServer.post('/creator-cards', {
      body: {
        title: 'Injection Attempt',
        creator_reference: { $gt: '' },
        status: 'published',
      },
    });

    expect(response.statusCode).to.equal(400);
  });

  it('rejects a NoSQL-injection-style object passed as slug', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      mockNull: true,
    });
    currentRevert = revert;

    const response = await mockedServer.post('/creator-cards', {
      body: {
        title: 'Injection Attempt',
        slug: { $ne: null },
        creator_reference: 'crt_8f2k1m9x4p7w3q5z',
        status: 'published',
      },
    });

    expect(response.statusCode).to.equal(400);
  });

  it('ignores unknown/forbidden fields instead of persisting or reflecting them', async () => {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      mockNull: true,
    });
    currentRevert = revert;

    const response = await mockedServer.post('/creator-cards', {
      body: {
        title: 'Mass Assignment Attempt',
        creator_reference: 'crt_8f2k1m9x4p7w3q5z',
        status: 'published',
        _id: 'attacker-chosen-id',
        deleted: 0,
        isAdmin: true,
        __proto__: { polluted: true },
      },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.data).to.not.have.property('isAdmin');
    expect(response.data.data.id).to.not.equal('attacker-chosen-id');
    expect({}).to.not.have.property('polluted');
  });
});
