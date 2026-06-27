import { AppError } from '../utils/AppError.js';

export function validateRequest(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(new AppError('Validation failed', 422, result.error.flatten().fieldErrors));
    }

    req.body = result.data;
    return next();
  };
}
