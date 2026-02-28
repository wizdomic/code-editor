export const config = {
  port: Number(process.env.PORT) || 3001,
  cors: {
    origin: [
      process.env.CLIENT_URL,
      process.env.CLIENT_URL_LOCAL,
      'http://localhost:5173',   // ← fallback so local dev always works
    ].filter(Boolean),
    methods: ["GET", "POST"],
  },
};