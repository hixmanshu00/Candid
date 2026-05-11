import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const schemas = {
  generateQuestion: Joi.object({
    role: Joi.string().trim().min(1).max(300).required(),
    experience: Joi.string().trim().min(1).max(500).required(),
    mode: Joi.string()
      .valid("Technical", "HR", "Behavioral", "System Design", "DSA", "Leadership")
      .required(),
    questionCount: Joi.number().integer().min(5).max(20).default(5),
    timeLimitEnabled: Joi.boolean().default(true),
    difficulty: Joi.string().valid("auto", "easy", "medium", "hard").default("auto"),
    company: Joi.string().trim().max(100).allow("", null).optional(),
    jobDescription: Joi.string().trim().max(5000).allow("", null).optional(),
    topic: Joi.string().trim().max(300).allow("", null).optional(),
    resumeText: Joi.string().allow("", null).optional(),
    projects: Joi.array().items(Joi.string().max(500)).max(20).optional(),
    skills: Joi.array().items(Joi.string().max(300)).max(50).optional(),
  }),

  submitAnswer: Joi.object({
    interviewId: Joi.string().pattern(objectIdPattern).required(),
    questionIndex: Joi.number().integer().min(0).max(19).required(),
    answer: Joi.string().allow("", null).max(10000).optional(),
    timeTaken: Joi.number().min(0).max(3600).optional(),
  }),

  finishInterview: Joi.object({
    interviewId: Joi.string().pattern(objectIdPattern).required(),
  }),
};

export const validate = (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];
  if (!schema) return next();

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return res.status(422).json({
      message: "Validation failed",
      errors: error.details.map((d) => d.message),
    });
  }

  req.body = value;
  next();
};
