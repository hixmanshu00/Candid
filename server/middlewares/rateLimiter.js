import rateLimit from "express-rate-limit";

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

// General API — 200 req / 15 min
export const generalLimiter = createLimiter(
  15 * 60 * 1000,
  200,
  "Too many requests, please try again later."
);

// AI endpoints — 8 req / min (question gen, answer submit)
export const aiLimiter = createLimiter(
  60 * 1000,
  8,
  "Too many AI requests. Please wait a moment before trying again."
);

// Auth — 15 req / 15 min
export const authLimiter = createLimiter(
  15 * 60 * 1000,
  15,
  "Too many authentication attempts. Please try again later."
);

// Resume upload — 5 req / 10 min
export const resumeLimiter = createLimiter(
  10 * 60 * 1000,
  5,
  "Too many resume uploads. Please wait before uploading again."
);
