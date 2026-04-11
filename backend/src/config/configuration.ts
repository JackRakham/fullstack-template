export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    name: process.env.DATABASE_NAME || 'trucking_db',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true',
    logging: process.env.DATABASE_LOGGING === 'true',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 600000, // 10 minutes default
    max: parseInt(process.env.CACHE_MAX_ITEMS, 10) || 100,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secretKey',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    authType: process.env.AUTH_TYPE || 'INTERNAL', // INTERNAL, FIREBASE, BOTH
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
  },
  mailer: {
    provider: process.env.MAILER_PROVIDER || 'local', // 'local' | 'smtp' | 'sendgrid' | 'ses'
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 465,
      secure: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) === 465 : true,
      user: process.env.SMTP_USER || process.env.USER_EMAIL,
      pass: process.env.SMTP_PASS || process.env.PASSWORD,
    }
  },
  integrations: {
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    gcp: {
      projectId: process.env.GCP_PROJECT_ID,
      credentials: process.env.GCP_CREDENTIALS, // JSON string or path
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
  },
  ai: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
  },
  // Add other critical configurations here
});
