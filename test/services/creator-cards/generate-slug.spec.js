const { expect } = require('chai');
const {
  generateSlug,
  slugify,
  appendRandomSuffix,
} = require('@app/services/creator-cards/generate-slug');

describe('services/creator-cards/generate-slug', () => {
  describe('slugify', () => {
    it('lowercases and replaces whitespace with hyphens', () => {
      expect(slugify('George Cooks')).to.equal('george-cooks');
    });

    it('strips characters that are not letters, numbers, hyphens or underscores', () => {
      expect(slugify("George's Cooks!! 2024")).to.equal('georges-cooks-2024');
    });
  });

  describe('appendRandomSuffix', () => {
    it('appends a hyphen plus a 6-character alphanumeric suffix', () => {
      const result = appendRandomSuffix('cook');

      expect(result).to.match(/^cook-[a-z0-9]{6}$/);
    });
  });

  describe('generateSlug', () => {
    it('keeps the slugified title as-is when it is 5+ characters', () => {
      expect(generateSlug('George Cooks')).to.equal('george-cooks');
    });

    it('appends a random suffix when the slugified title is under 5 characters', () => {
      const result = generateSlug('Hi');

      expect(result).to.match(/^hi-[a-z0-9]{6}$/);
    });
  });
});
