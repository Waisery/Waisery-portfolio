export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function errorHandler(err, req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong. Please try again.';
  let fields;
  if (err.name === 'ZodError') {
    status = 400; message = 'Please check the highlighted fields.';
    fields = Object.fromEntries(err.issues.map(i => [i.path.join('.'), i.message]));
  } else if (err.code === 11000) {
    status = 409; message = `${Object.keys(err.keyPattern || {})[0] === 'username' ? 'Username' : 'Email'} is already in use.`;
  } else if (err.name === 'CastError') {
    status = 400; message = 'That identifier is not valid.';
  } else if (err.name === 'ValidationError') {
    status = 400; message = Object.values(err.errors).map(e => e.message).join(' ');
  } else if (err.type === 'entity.too.large') {
    status = 413; message = 'This submission is too large.';
  } else if (err instanceof SyntaxError && 'body' in err) {
    status = 400; message = 'The request body must be valid JSON.';
  }
  if (status >= 500) { console.error(`[${req.method} ${req.path}]`, err.message); message = 'The server could not complete this request. Please try again.'; }
  res.status(status).json({ error: { message, ...(fields ? { fields } : {}) } });
}
