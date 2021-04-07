const mongoose = require("mongoose");

class Article {

    #articleModel;

    constructor () {

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
            likes: Number,
            numberOfComments: {
                type: Number,
                default: 0
            },
            comments: [String]
        });

        this.#articleModel = mongoose.model("Article", articleSchema);

    }

    async createArticle (article) {
        return await this.#articleModel.create(article);
    }

    async getAllArticles () {
        return await this.#articleModel.find();
    }

    async getArticleByID (id) {
        return await this.#articleModel.findById(id);
    }

    async getArticlesByCategory (category) {
        return await this.#articleModel.find({category});
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