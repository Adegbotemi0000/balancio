// Express doesn't forward rejected promises from async route handlers to the
// error middleware on its own -- without this, a thrown/rejected error in an
// async controller crashes the process instead of returning a 500.
function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = asyncHandler;
