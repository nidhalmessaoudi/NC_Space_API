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

  get(id = "", queryObj = {}) {
    if (id) this.query = this.model.findById(id);
    else this.query = this.model.findOne(queryObj);

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
