import Features from "./Features.js";

class Parent extends Features {
  constructor() {
    super();
    this.model = undefined;
  }

  getAll(queryObj = {}) {
    this.filter(this.model, queryObj);
    this.sort(queryObj);
    this.limitFields(this.query, queryObj);
    this.paginate(queryObj);

    return this.query;
  }

  create(doc) {
    return this.model.create(doc);
  }

  get(id, queryObj = {}, populateFields = "") {
    if (populateFields) {
      if (populateFields.includes("author")) {
        const virtualFields = populateFields.split(" ");

        this.limitFields(
          this.model
            .findById(id)
            .populate({
              path: virtualFields.find((el) => el === "author"),
              select: "name photo",
            })
            .populate(virtualFields.filter((el) => el !== "author").join(" ")),
          queryObj
        );
      } else {
        this.limitFields(
          this.model.findById(id).populate(populateFields),
          queryObj
        );
      }
    } else {
      this.limitFields(this.model.findOne({ _id: id }), queryObj);
    }

    return this.query;
  }

  save(doc, options = {}) {
    return doc.save(options);
  }

  update(id, newContent) {
    return this.model.findByIdAndUpdate(id, newContent, {
      new: true,
      runValidators: true,
    });
  }

  delete(id) {
    return this.model.findByIdAndDelete(id);
  }
}

export default Parent;
