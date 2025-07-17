function validateJoi(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });

    if (error) {
      return res.status(400).json({
        errors: error.details.map((detail) => ({
          message: detail.message,
          path: detail.path.join('.'),
        })),
      });
    }

    req[property] = value;
    next();
  };
}

module.exports = validateJoi;