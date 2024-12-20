export const config = {
  port: process.env.PORT || 3001,
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
};