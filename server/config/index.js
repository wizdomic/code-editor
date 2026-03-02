const isProd = process.env.NODE_ENV === 'production';

// Allow multiple origins: split comma-separated CLIENT_URL values
// e.g. CLIENT_URL="https://yourapp.vercel.app,http://localhost:5173"
const rawOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigin.split(',').map(o => o.trim());

export const config = {
  port: process.env.PORT || 3001,

  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods:     ['GET', 'POST'],
    credentials: true,
  },
};