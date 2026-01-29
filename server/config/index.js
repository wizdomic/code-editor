export const config = {
  port: process.env.PORT || 3001,
  cors: {
    origin: [
      "https://code-editor-omega-amber.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
  },
};
