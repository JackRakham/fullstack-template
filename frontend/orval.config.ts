import { defineConfig } from 'orval';

export default defineConfig({
  identity: {
    input: {
      target: '../schema/openapi.json',
      filters: {
        tags: ['Identity', 'Roles', 'Permissions', 'Role Permissions', 'Permission Roles', 'Identity Authentication', 'User-Roles', 'Role-Users'],
      },
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/identity/endpoints.ts',
      schemas: './src/api/generated/identity/models',
      indexFiles: true,
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api-client.ts',
          name: 'customInstance',
        },
      },
    },
  },
  'identity-zod': {
    input: {
      target: '../schema/openapi.json',
      filters: {
        tags: ['Identity', 'Roles', 'Permissions', 'Role Permissions', 'Permission Roles', 'Identity Authentication'],
      },
    },
    output: {
      mode: 'tags-split',
      client: 'zod',
      target: './src/api/generated/identity/zod/index.ts',
    },
  },
  notifications: {
    input: {
      target: '../schema/openapi.json',
      filters: {
        tags: ['Notifications', 'User Notifications'],
      },
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/notifications/endpoints.ts',
      schemas: './src/api/generated/notifications/models',
      indexFiles: true,
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api-client.ts',
          name: 'customInstance',
        },
      },
    },
  },
  'notifications-zod': {
    input: {
      target: '../schema/openapi.json',
      filters: {
        tags: ['Notifications', 'User Notifications'],
      },
    },
    output: {
      mode: 'tags-split',
      client: 'zod',
      target: './src/api/generated/notifications/zod/index.ts',
    },
  },
  app: {
    input: {
      target: '../schema/openapi.json',
      filters: {
        tags: ['App'],
      },
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/app/endpoints.ts',
      schemas: './src/api/generated/app/models',
      indexFiles: true,
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api-client.ts',
          name: 'customInstance',
        },
      },
    },
  },
  storage: {
    input: {
      target: '../schema/openapi.json',
      filters: {
        tags: ['Storage'],
      },
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/storage/endpoints.ts',
      schemas: './src/api/generated/storage/models',
      indexFiles: true,
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api-client.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
