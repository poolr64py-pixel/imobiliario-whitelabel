module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: [
      'chave-secreta-1-para-sessoes',
      'chave-secreta-2-para-cookies',
      'chave-secreta-3-para-tokens',
      'chave-secreta-4-backup'
    ],
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});