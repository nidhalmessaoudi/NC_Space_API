import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const docName = Model.name();

    let docs;
    if (docName === "comment" || docName === "likes") {
      let filter = {};

      if (req.params.articleId) filter = { article: req.params.articleId };

      docs = await Model.getAll(filter);
    } else {
      docs = await Model.getAll(req.query);
    }

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

    let doc;

    if (docName === "article")
      doc = await Model.get(req.params.id, req.query, "author comments likes");

    if (docName === "user")
      doc = await Model.get(req.params.id, req.query, "myArticles");

    if (docName === "like" || docName === "comment")
      doc = await Model.get({ _id: req.params.id });

    // UPDATE DOC VIEWS FOR ARTICLE
    if (doc.views) {
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
    if (req.user) req.body.author = [req.user.id];

    const newDoc = await Model.create(req.body);

    const docName = Model.name();

    res.status(201).json({
      status: "success",
      data: {
        [docName]: newDoc,
      },
    });
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
