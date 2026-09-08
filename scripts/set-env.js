const fs = require('fs');
const path = require('path');

const env = process.env;
const apiUrl = env.API_URL || env.NG_API_URL || 'http://localhost:8090';
const stripeKey =
  env.STRIPE_PUBLISHABLE_KEY || env.NG_STRIPE_PUBLISHABLE_KEY || 'pk_test_REPLACE_ME';

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  stripePublishableKey: '${stripeKey}',
};
`;

const target = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
fs.writeFileSync(target, content);
console.log('environment.ts generated');
