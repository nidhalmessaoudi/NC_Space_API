import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.user.role !== "admin") {
      req.query.approved = { ne: false };
    }
    const docName = Model.name();

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
    if (doc.approved !== true) doc = null;
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
    if (req.user) req.body.author = req.body.user = [req.user.id];

    const newDoc = await Model.create(req.body);

    const docName = Model.name();

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

    // ALLOW NESTED ROUTES
    if (!req.body.article) req.body.article = req.params.articleId;
    if (!req.body.user) req.body.user = req.user.id;

    // CHECK IF THE DOC ALREADY EXISTS
    const doc = await Model.get(undefined, {
      article: req.body.article,
      user: req.body.user,
    });

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
    const updatedDoc = await Model.update(req.params.id, req.body);

    const docName = Model.name();

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
