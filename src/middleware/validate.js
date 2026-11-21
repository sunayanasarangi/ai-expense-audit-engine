import * as z from 'zod';

export const validateSchema = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    //failed validation sets status to 400, hence next() is not called.
    return res.status(400).json({
      error: 'Validation failed',
      details: z.flattenError(result.error),
    });
  }

  /*req.body = result.data;, you guarantee that your route handler (router.post('/', ...))
   *receives 100% clean, safe, defaulted data instead of the raw user input.
   */
  req.body = result.data;
  next();
};
