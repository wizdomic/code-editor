export const config = {
  port: Number(process.env.PORT) || 3001,
  cors: {
    origin: [
      process.env.CLIENT_URL,
      process.env.CLIENT_URL_LOCAL,
    ].filter(Boolean),
    methods: ["GET", "POST"],
  },
};
