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
                unique: true,
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
            readTime: Number,
            coverImage: {
                type: String,
                required: [true, "An article must have a cover image"],
                trim: true
            },
            paragraphs: {
                type: Number,
                required: [true, "An article must have a paragraph number"]
            },
            paragraph1: {
                header: {
                    type: String,
                    trim: true
                },
                body: {
                    type: String,
                    required: [true, "An article must have a paragraph1 body"]
                },
                image: String
            },
            paragraph2: {
                header: {
                    type: String,
                    trim: true
                },
                body: String,
                image: String
            },
            paragraph3: {
                header: {
                    type: String,
                    trim: true
                },
                body: String,
                image: String
            },
            paragraph4: {
                header: {
                    type: String,
                    trim: true
                },
                body: String,
                image: String
            },
            paragraph5: {
                header: {
                    type: String,
                    trim: true
                },
                body: String,
                image: String
            },
            paragraph6: {
                header: {
                    type: String,
                    trim: true
                },
                body: String,
                image: String
            },
            embeddedContent1: String,
            embeddedContent2: String,
            embeddedContent3: String,
            embeddedContent4: String,
            embeddedContent5: String,
            embeddedContent6: String,
            tags: {
                type: String,
                default: "NC_Space tech"
            },
            likes: Number,
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
            this.filterArticles(this.#articleModel, queryObj);
            this.sortArticles(queryObj);
            this.limitFields(queryObj);
            const skip = this.paginateArticles(queryObj);

            if (queryObj.page) {
                    const numArticles = await this.#articleModel.countDocuments();
                
                    if (skip >= numArticles) throw new Error("This page does NOT exists");
            }

            return this.query;
            
        } catch (err) {
            throw err;
        } 
    }

    async getArticleByID (id) {
        try {
            return this.#articleModel.findById(id);
        } catch (err) {
            throw err;
        }
    }

    async updateArticle (id, newContent) {
        return await this.#articleModel.findByIdAndUpdate(id, newContent, {
            new: true,
            runValidators: true
        });
    }

    async deleteArticle (id) {
        await this.#articleModel.findByIdAndDelete(id);
    }

};

module.exports = new Article();