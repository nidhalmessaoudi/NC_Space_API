class Features {

    copyObject (object) {
        const copy = { ...object };
        
        return copy;
    }
    
    filter (model, queryObj) {

        if (!queryObj) {
            this.query = model.find();

            return;
        }
        const queryObject = this.copyObject(queryObj);

        const excludedFields = ["page", "sort", "limit", "fields"];
    
        excludedFields.forEach(field => {
                delete queryObject[field];
        });
    
        const queryStr = JSON.stringify(queryObject)
                .replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = model.find(JSON.parse(queryStr));

    }

    sort (queryObj) {

        if (!queryObj || !queryObj.sort) {
            this.query = this.query.sort("-createdAt");

            return;
        }

        const queryObject = this.copyObject(queryObj);

        const sortBy = queryObject.sort.split(",").join(" ");

        this.query = this.query.sort(sortBy);
        
    }

    limitFields (firstQuery, queryObj) {

        if (!queryObj || !queryObj.fields) {
            this.query = firstQuery.select("-__v");

            return; 
        } 

        const queryObject = this.copyObject(queryObj);

        const fields = queryObject.fields.split(",").join(" ");

        this.query = firstQuery.select(fields);

    }

    paginate (queryObj) {

        const page = +queryObj.page || 1;

        const limit = +queryObj.limit || 100;

        const skip  = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

    }
}

export default Features;