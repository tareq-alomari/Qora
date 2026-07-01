const { AppError } = require('./error-handler');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new AppError('Validation error', 400, 'VALIDATION_ERROR', details));
    }

    req[source] = value;
    next();
  };
};

module.exports = { validate };
