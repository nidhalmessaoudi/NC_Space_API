const mongoose = require("mongoose");
const Features = require("./Features");

class Article extends Features {

    #articleModel;

    constructor () {

        super();

        const articleSchema = new mongoose.Schema({
            title: {
                type: String,
                required: [true, "An article must have a title"],
                unique: true,
                trim: true
            },
            category: {
                type: String,
                required: [true, "An article must have a category"],
                trim: true
            },
            summary: {
                type: String,
                trim: true
            },
            author: {
                type: String,
                required: [true, "An article must have an author"],
                trim: true
            },
            readingTime: {
                type: Number,
                default: 5
            },
            coverImage: {
                type: String,
                required: [true, "An article must have a cover image"],
                trim: true
            },
            paragraphs: {
                type: Number,
                required: [true, "An article must have a paragraph number"]
            },
            contentMarkup: {
                type: String,
                required: [true, "An article must have a content markup"]
            },
            tags: {
                type: String,
                default: "NC_Space tech"
            },
            likes: {
                type: Number,
                default: 0
            },
            numberOfComments: {
                type: Number,
                default: 0
            },
            comments: [String]
        }, { timestamps: true } );

        this.#articleModel = mongoose.model("Article", articleSchema);

    }

    async createArticle (article) {
        return await this.#articleModel.create(article);
    }

    async getAllArticles (queryObj = {}) {
        try {
            this.filter(this.#articleModel, queryObj);
            this.sort(queryObj);
            this.limitFields(this.query, queryObj);
            const skip = this.paginate(queryObj);

            if (queryObj.page) {
                    const numArticles = await this.#articleModel.countDocuments();
                
                    if (skip >= numArticles) throw new Error("This page does NOT exists");
            }

            return this.query;
            
        } catch (err) {
            throw err;
        } 
    }

    async getArticleByID (id, queryObj = {}) {
        try {

            this.limitFields(this.#articleModel.findById(id), queryObj);

            return this.query;

        } catch (err) {
            throw err;
        }
    }

    async updateArticle (id, newContent) {
        return this.#articleModel.findByIdAndUpdate(id, newContent, {
            new: true,
            runValidators: true
        });
    }

    async deleteArticle (id) {
        await this.#articleModel.findByIdAndDelete(id);
    }

    // async aggregateStats (queryObj = {}) {
    //     try {
            
    //         const queryObject = this.copyObject(queryObj);

    //         return this.#articleModel.aggregate([
    //             {
    //                 $match: { paragraphs: { $gte: 2 } }
    //             },
    //             {
    //                 $group: {
    //                     _id: "$category",
    //                     totalArticles: { $sum: 1 },
    //                     totalLikes: { $sum: "$likes" },
    //                     totalComments: { $sum: "$numberOfComments" },
    //                     avgParagraphs: { $avg: "$paragraphs" },
    //                     avgReadingTime: { $avg: "$readingTime" }
    //                 }
    //             }
    //         ]);

    //     } catch (err) {
    //         throw err;
    //     }

    // }

};

module.exports = new Article();