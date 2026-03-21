export enum ConfigKey {
  PORT = 'port',
  
  // Database
  DATABASE_HOST = 'database.host',
  DATABASE_PORT = 'database.port',
  DATABASE_USERNAME = 'database.username',
  DATABASE_PASSWORD = 'database.password',
  DATABASE_NAME = 'database.name',

  // Storage
  STORAGE_PROVIDER = 'storage.provider',

  // Mailer
  MAILER_PROVIDER = 'mailer.provider',

  // Redis
  REDIS_HOST = 'redis.host',
  REDIS_PORT = 'redis.port',
  REDIS_PASSWORD = 'redis.password',
  
  // Firebase (Nested under integrations)
  FIREBASE_PROJECT_ID = 'integrations.firebase.projectId',
  FIREBASE_CLIENT_EMAIL = 'integrations.firebase.clientEmail',
  FIREBASE_PRIVATE_KEY = 'integrations.firebase.privateKey',

  // JWT
  JWT_SECRET = 'jwt.secret',
  JWT_EXPIRES_IN = 'jwt.expiresIn',
}
