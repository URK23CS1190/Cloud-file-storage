import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'filestorage',
  access: (allow) => ({
    'public/*': [
      allow.guest.to(['read', 'write']),
      allow.authenticated.to(['read', 'write']),
    ],
  }),
});