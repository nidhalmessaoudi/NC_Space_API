import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.delete(req.params.id);

    if (!doc) {
      return next(new AppError(`No ${Model.name()} found with that ID`, 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
