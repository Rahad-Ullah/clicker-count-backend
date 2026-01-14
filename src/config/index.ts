import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  server_name: process.env.SERVER_NAME,
  ip_address: process.env.IP_ADDRESS,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  port_dev: process.env.PORT_DEV,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  google: {
    package_name: process.env.GOOGLE_PACKAGE_NAME,
    client_id: process.env.GOOGLE_CLIENT_ID,
  },
  apple: {
    bundle_id: process.env.APPLE_BUNDLE_ID,
    shared_secret: process.env.APPLE_SHARED_SECRET,
    purchase_mode: process.env.APPLE_PURCHASE_MODE,
    client_id: process.env.APPLE_CLIENT_ID,
  },
};
