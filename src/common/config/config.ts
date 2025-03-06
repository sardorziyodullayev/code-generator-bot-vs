import 'dotenv/config';

const getOrReturnDefaultNumber = (value: string | undefined, def: number): number =>
  value && Number.isFinite(+value) ? +value : def;

export const ENV = {
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  DB: {
    MONGODB: {
      URL: process.env.MONGODB_URL || 'postgres',
      DATABASE_NAME: process.env.MONGODB_DATABASE_NAME,
    },
  },
  REDIS: {
    URL: process.env.REDIS_URL || '',
    PASSWORD: process.env.REDIS_PASSWORD || '',
  },
  BOT: {
    TOKEN: process.env.BOT_TOKEN || '',
    CHAT_ID: getOrReturnDefaultNumber(process.env.BOT_CHAT_ID, -334307783),
    BACKUP_CHANNEL_ID: getOrReturnDefaultNumber(process.env.BACKUP_CHANNEL_ID, -334307783),
  },
  BASE_URL: process.env.BASE_URL || '',
  HTTP_HOST: process.env.HTTP_HOST || '0.0.0.0',
  HTTP_PORT: getOrReturnDefaultNumber(process.env.HTTP_PORT, 4000),
  JWT_SECRET_ACCESS: process.env.JWT_SECRET || 'JWT_SECRET_ACCESS',
  JWT_SECRET_REFRESH: process.env.JWT_SECRET_REFRESH || 'JWT_SECRET_REFRESH',
  JWT_EXPIRE_ACCESS: process.env.JWT_EXPIRE_ACCESS || '15M',
  JWT_EXPIRE_REFRESH: process.env.JWT_EXPIRE_REFRESH || '1W',
};
