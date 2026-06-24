const ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz0123456789';
const SUFFIX_LENGTH = 6;
const MIN_SLUG_LENGTH = 5;

function randomSuffix(length = SUFFIX_LENGTH) {
  let suffix = '';
  for (let i = 0; i < length; i += 1) {
    suffix += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
  }
  return suffix;
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

function appendRandomSuffix(slug) {
  return `${slug}-${randomSuffix()}`;
}

function generateSlug(title) {
  const base = slugify(title);
  return base.length < MIN_SLUG_LENGTH ? appendRandomSuffix(base) : base;
}

module.exports = { generateSlug, slugify, appendRandomSuffix };
