const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');

const mockedServer = createMockServer(['endpoints/creator-cards']);

describe('Creator Card acceptance suite (16 brief test cases)', () => {
  let currentRevert;

  function stubFindOne(stubConfig) {
    const { revert } = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      ...stubConfig,
    });
    currentRevert = revert;
  }

  afterEach(() => {
    if (currentRevert) {
      currentRevert();
      currentRevert = null;
    }
  });

  it('Test Case 1 - full creation', async () => {
    stubFindOne({ mockNull: true });

    const response = await mockedServer.post('/creator-cards', {
      body: {
        title: 'George Cooks',
        description: 'Weekly cooking podcast',
        slug: 'george-cooks',
        creator_reference: 'crt_8f2k1m9x4p7w3q5z',
        links: [{ title: 'YouTube', url: 'https://youtube.com/@georgecooks' }],
        service_rates: {
          currency: 'NGN',
          rates: [{ name: 'IG Story Post', description: 'One story mention', amount: 5000000 }],
        },
        status: 'published',
      },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.data).to.have.property('id');
    expect(response.data.data).to.not.have.property('_id');
    expect(response.data.data.access_type).to.equal('public');
  });

  it('Test Case 2 - slug auto-generation', async () => {
    stubFindOne({ mockNull: true });

    const response = await mockedServer.post('/creator-cards', {
      body: {
        title: 'Ada Designs Things',
        creator_reference: 'crt_a1b2c3d4e5f6g7h8',
        status: 'published',
      },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.data.slug).to.equal('ada-designs-things');
  });

  it('Test Case 3 - private card creation', async () => {
    stubFindOne({ mockNull: true });

    const response = await mockedServer.post('/creator-cards', {
      body: {
        title: 'VIP Rate Card',
        creator_reference: 'crt_x9y8z7w6v5u4t3s2',
        status: 'published',
        access_type: 'private',
        access_code: 'A1B2C3',
      },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.data.access_code).to.equal('A1B2C3');
  });

  it('Test Case 4 - retrieving a public published card', async () => {
    stubFindOne({
      docConfig: { slug: 'george-cooks', status: 'published', access_type: 'public' },
    });

    const response = await mockedServer.get('/creator-cards/george-cooks');

    expect(response.statusCode).to.equal(200);
    expect(response.data.data).to.have.property('id');
    expect(response.data.data).to.not.have.property('access_code');
  });

  it('Test Case 5 - retrieving a private card with correct pin', async () => {
    stubFindOne({
      docConfig: {
        slug: 'vip-rate-card',
        status: 'published',
        access_type: 'private',
        access_code: 'A1B2C3',
      },
    });

    const response = await mockedServer.get('/creator-cards/vip-rate-card', {
      query: { access_code: 'A1B2C3' },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.data).to.not.have.property('access_code');
  });

  it('Test Case 6 - deleting a card', async () => {
    stubFindOne({ docConfig: { slug: 'ada-designs-things' } });

    const response = await mockedServer.delete('/creator-cards/ada-designs-things', {
      body: { creator_reference: 'crt_a1b2c3d4e5f6g7h8' },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.data.slug).to.equal('ada-designs-things');
    expect(response.data.data.deleted).to.be.a('number');
  });

  it('Test Case 7 - duplicate slug', async () => {
    stubFindOne({ docConfig: { slug: 'george-cooks' } });

    const response = await mockedServer.post('/creator-cards', {
      body: {
        title: 'Another George',
        slug: 'george-cooks',
        creator_reference: 'crt_m1n2b3v4c5x6z7l8',
        status: 'published',
      },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.data.code).to.equal('SL02');
  });

  it('Test Case 8 - missing access_code on private card', async () => {
    const response = await mockedServer.post('/creator-cards', {
      body: {
        title: 'Secret Card',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'published',
        access_type: 'private',
      },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.data.code).to.equal('AC01');
  });

  it('Test Case 9 - access_code on a public card', async () => {
    const response = await mockedServer.post('/creator-cards', {
      body: {
        title: 'Public Card',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'published',
        access_type: 'public',
        access_code: 'A1B2C3',
      },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.data.code).to.equal('AC05');
  });

  it('Test Case 10 - framework validation failure', async () => {
    const response = await mockedServer.post('/creator-cards', {
      body: {
        title: 'Bad Status Card',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'archived',
      },
    });

    expect(response.statusCode).to.equal(400);
  });

  it('Test Case 11 - retrieving a non-existent card', async () => {
    stubFindOne({ mockNull: true });

    const response = await mockedServer.get('/creator-cards/does-not-exist-123');

    expect(response.statusCode).to.equal(404);
    expect(response.data.code).to.equal('NF01');
  });

  it('Test Case 12 - retrieving a draft card', async () => {
    stubFindOne({ docConfig: { slug: 'my-draft-card', status: 'draft' } });

    const response = await mockedServer.get('/creator-cards/my-draft-card');

    expect(response.statusCode).to.equal(404);
    expect(response.data.code).to.equal('NF02');
  });

  it('Test Case 13 - retrieving a private card without a pin', async () => {
    stubFindOne({
      docConfig: {
        slug: 'vip-rate-card',
        status: 'published',
        access_type: 'private',
        access_code: 'A1B2C3',
      },
    });

    const response = await mockedServer.get('/creator-cards/vip-rate-card');

    expect(response.statusCode).to.equal(403);
    expect(response.data.code).to.equal('AC03');
  });

  it('Test Case 14 - retrieving a private card with a wrong pin', async () => {
    stubFindOne({
      docConfig: {
        slug: 'vip-rate-card',
        status: 'published',
        access_type: 'private',
        access_code: 'A1B2C3',
      },
    });

    const response = await mockedServer.get('/creator-cards/vip-rate-card', {
      query: { access_code: 'WRONG1' },
    });

    expect(response.statusCode).to.equal(403);
    expect(response.data.code).to.equal('AC04');
  });

  it('Test Case 15 - deleting a non-existent card', async () => {
    stubFindOne({ mockNull: true });

    const response = await mockedServer.delete('/creator-cards/does-not-exist-123', {
      body: { creator_reference: 'crt_q1w2e3r4t5y6u7i8' },
    });

    expect(response.statusCode).to.equal(404);
    expect(response.data.code).to.equal('NF01');
  });

  it('Test Case 16 - retrieving a deleted card', async () => {
    stubFindOne({ mockNull: true });

    const response = await mockedServer.get('/creator-cards/ada-designs-things');

    expect(response.statusCode).to.equal(404);
    expect(response.data.code).to.equal('NF01');
  });
});
