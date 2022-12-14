const mongoose = require('mongoose')
const PostMessage = require('../model/postMessage')
const UserModel = require('../model/user')
const { StatusCodes } = require('http-status-codes')

const getPosts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 6;
        const INDEX = (page - 1) * limit;
        const total = await PostMessage.countDocuments({})

        const posts = await PostMessage.find()
            .sort({ _id: -1 })
            .limit(limit)
            .skip(INDEX)

        res.status(200).json({ data: posts, currentpage: page, numberOfPages: Math.ceil(total / limit) })
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query

    try {
        const title = new RegExp(searchQuery, 'i')
        const posts = await PostMessage.find({
            $or: [
                { title },
                { tags: { $in: tags.split(',') } }
            ]
        })

        res.json({ data: posts })
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

const getPost = async (req, res) => {
    try {
        const { id } = req.params
        console.log('Asking for a post with id: ' + id)
        const post = await PostMessage.findById(id)
            .populate({ path: 'creator', select: 'name imageUrl' })

        console.log('Post found: ' + post)
        res.status(StatusCodes.OK).json({ post })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({
            message: error.message
        })
    }
}

const createPost = async (req, res) => {
    const post = req.body;

    try {
        console.log(req.userId)
        const newPost = await PostMessage.create({
            ...post,
            creator: String(req.userId)
        })

        console.log(newPost)

        res.status(201).json(newPost);
    } catch (error) {
        console.log(error)
        res.status(409).json({
            message: error.message
        })
    }
}

const updatePost = async (req, res) => {
    const { id: _id } = req.params
    const post = req.body

    try {
        if (!mongoose.Types.ObjectId.isValid(_id))
            return res.status(404).send('No Post With this ID exists')
    
        const updatedPost = await PostMessage.findByIdAndUpdate(_id, { ...post, _id }, { new: true })
        res.json(updatedPost)
    } catch (error) {
        res.status(409).json({
            message: error.message
        })
    }
}

const deletePost = async (req, res) => {
    const { id: _id } = req.params

    if (!mongoose.Types.ObjectId.isValid(_id))
        return res.status(404).send('No Post With this ID exists')

    await PostMessage.findByIdAndDelete(_id)
    res.json({
        message: 'Post has been deleted successfully!'
    })
}

const likePost = async (req, res) => {
    const { id } = req.params

    if (!req.userId)
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'You must be logged in to like a post' })

    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).send('No Post With this ID exists')

    const post = await PostMessage.findById(id)

    const index = post.likes.findIndex((id) => id === String(req.userId))

    if (index === - 1) {
        post.likes.push(req.userId)
    } else {
        post.likes = post.likes.filter((id) => id !== String(req.userId))
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true })

    res.json(updatedPost)
}

module.exports = {
    getPosts,
    getPost,
    getPostsBySearch,
    createPost,
    updatePost,
    deletePost,
    likePost
}
