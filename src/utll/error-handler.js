
const asyncWrapper = fn => {
  return async function(ctx, next) {
    try {
      return await fn(ctx);
    } catch (error) {
      console.error(ctx, 'asyncWrapper error, %O', error);
      ctx.reply('Что-то пошло не так');
      return next();
    }
  };
};

module.exports = asyncWrapper;
