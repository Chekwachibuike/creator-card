const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const repository = require('@app/repository/creator-card');
const Messages = require('@app/messages/creator-card');
const serializeCreatorCard = require('./serialize-creator-card');
const { generateSlug, appendRandomSuffix } = require('./generate-slug');

const spec = `root {
  title string<trim|lengthBetween:3,100>
  description? string<maxLength:500>
  slug? string<lengthBetween:5,50>
  creator_reference string<length:20>
  links[]? {
    title string<lengthBetween:1,100>
    url string<maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<lengthBetween:3,100>
      description? string<maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<length:6>
}`;

const parsedSpec = validator.parse(spec);

const SLUG_CHARSET_REGEX = /^[a-zA-Z0-9_-]+$/;
const ACCESS_CODE_REGEX = /^[a-zA-Z0-9]{6}$/;
const URL_PROTOCOL_REGEX = /^https?:\/\//;

function assertValidLinks(links = []) {
  links.forEach((link) => {
    if (!URL_PROTOCOL_REGEX.test(link.url)) {
      throwAppError('link url must start with http:// or https://', ERROR_CODE.VALIDATIONERR);
    }
  });
}

function assertValidRates(serviceRates) {
  if (!serviceRates) return;

  serviceRates.rates.forEach((rate) => {
    if (!Number.isInteger(rate.amount)) {
      throwAppError('rate amount must be a positive integer', ERROR_CODE.VALIDATIONERR);
    }
  });
}

function resolveAccessType(data) {
  const accessType = data.access_type || 'public';

  if (accessType === 'private') {
    if (!data.access_code) {
      throwAppError(Messages.ACCESS_CODE_REQUIRED, 'AC01');
    }
    if (!ACCESS_CODE_REGEX.test(data.access_code)) {
      throwAppError(
        'access_code must be exactly 6 alphanumeric characters',
        ERROR_CODE.VALIDATIONERR
      );
    }
  } else if (data.access_code) {
    throwAppError(Messages.ACCESS_CODE_NOT_ALLOWED, 'AC05');
  }

  return accessType;
}

async function resolveSlug(data) {
  if (data.slug) {
    if (!SLUG_CHARSET_REGEX.test(data.slug)) {
      throwAppError(
        'slug may only contain letters, numbers, hyphens and underscores',
        ERROR_CODE.VALIDATIONERR
      );
    }

    const existing = await repository.findOne({ query: { slug: data.slug } });
    if (existing) {
      throwAppError(Messages.SLUG_ALREADY_TAKEN, 'SL02');
    }

    return data.slug;
  }

  let slug = generateSlug(data.title);
  const existing = await repository.findOne({ query: { slug } });
  if (existing) {
    slug = appendRandomSuffix(slug);
  }

  return slug;
}

async function createCreatorCard(serviceData) {
  const data = validator.validate(serviceData, parsedSpec);

  assertValidLinks(data.links);
  assertValidRates(data.service_rates);
  const accessType = resolveAccessType(data);
  const slug = await resolveSlug(data);

  const card = await repository.create({
    title: data.title,
    description: data.description,
    slug,
    creator_reference: data.creator_reference,
    links: data.links,
    service_rates: data.service_rates,
    status: data.status,
    access_type: accessType,
    access_code: data.access_code,
  });

  return {
    message: 'Creator Card Created Successfully.',
    data: serializeCreatorCard(card),
  };
}

module.exports = createCreatorCard;
