const setArticleAndUserIds = (req, res, next) => {
  // ALLOW NESTED ROUTES
  if (!req.body.article) req.body.article = req.params.articleId;
  if (!req.body.author) req.body.author = req.user.id;
  next();
};

export default setArticleAndUserIds;
