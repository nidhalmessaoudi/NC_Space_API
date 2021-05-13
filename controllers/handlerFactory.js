import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const docName = Model.name();

    if (!req.user && req.user?.role !== "admin") {
      req.query.approved = { ne: false };
      if (docName === "bookmark")
        return next(
          new AppError("You do NOT have permission to perform this action", 403)
        );
    }

    if (docName === "comment" || docName === "like" || docName === "bookmark")
      if (req.params.articleId) req.query.article = req.params.articleId;

    const docs = await Model.getAll(req.query);

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        [`${docName}s`]: docs,
      },
    });
  });

export const getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const docName = Model.name();
    let doc = await Model.get(req.params.id);

    // EXCLUDE NOT YET APPROVED ARTICLES AND COMMENTS
    if (doc.approved && doc.approved !== true) {
      doc = null;
      return next(new AppError(`This ${docName} is not yet approved!`, 400));
    }
    if (doc?.comments) {
      doc.comments.map((el, i, arr) => {
        if (el.approved === false) {
          arr.splice(i, 1);
        }
      });
    }

    // UPDATE DOC VIEWS FOR ARTICLE
    if (doc?.views) {
      doc.views++;
      await Model.save(doc);
    }

    // REMOVE MY_ARTICLES FIELD FOR USERS WITH ROLE "USER"
    if (doc?.role === "user") delete doc.myArticles;

    if (!doc) {
      return next(new AppError(`No ${docName} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        [docName]: doc,
      },
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.user) req.body.author = req.body.user = req.user.id;
    if (req.body.approved) delete req.body.approved;
    if (req.body.role) delete req.body.role;

    const docName = Model.name();

    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        [docName]: newDoc,
      },
    });
  });

export const createOrDeleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const docName = Model.name();

    let doc;
    if (docName === "follower") {
      if (!req.body.followed || !req.body.follower)
        return next(new AppError("Missing the followed or the follower!", 400));
      doc = await Model.get(undefined, {
        followed: req.body.followed,
        follower: req.body.follower,
      });
    } else {
      // ALLOW NESTED ROUTES
      if (!req.body.article) {
        if (req.params.articleId) req.body.article = req.params.articleId;
        else return next(new AppError("Provide the article Id!", 400));
      }
      if (!req.body.user) req.body.user = req.user.id;

      // CHECK IF THE DOC ALREADY EXISTS
      doc = await Model.get(undefined, {
        article: req.body.article,
        user: req.body.user,
      });
    }

    if (doc) {
      await Model.delete(doc._id);
      res.status(204).json({
        status: "success",
        data: null,
      });
    } else {
      const newDoc = await Model.create(req.body);

      res.status(201).json({
        status: "success",
        data: {
          [docName]: newDoc,
        },
      });
    }
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const docName = Model.name();

    if (req.body.approved) delete req.body.approved;
    if (req.body.role) delete req.body.role;
    if (req.body.author) delete req.body.author;
    if (req.user.role === "admin") req.body.approved = true;

    if (docName === "article" || docName === "user" || docName === "comment") {
      const foundDoc = await Model.get(req.params.id);
      if (
        (docName === "article" || docName === "comment") &&
        foundDoc.author.id !== req.user.id
      ) {
        return next(
          new AppError("You do NOT have permission to perform this action", 403)
        );
      }
      if (docName === "user" && foundDoc._id !== req.user.id) {
        return next(
          new AppError("You do NOT have permission to perform this action", 403)
        );
      }
    }

    const updatedDoc = await Model.update(req.params.id, req.body);

    if (!updatedDoc) {
      return next(new AppError(`No ${docName} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        [docName]: updatedDoc,
      },
    });
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.delete(req.params.id);

    const docName = Model.name();

    if (!doc) {
      return next(new AppError(`No ${docName} found with that ID`, 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
