import BlogPost from '../models/BlogPost.js';
import Comment from '../models/Comment.js';
import { ApiError } from '../middleware/errors.js';
async function getPost(id) {
  const post = await BlogPost.findById(id);
  if (!post) throw new ApiError(404, 'This article could not be found.');
  return post;
}
function owns(req, post) {
  if (String(post.author) !== String(req.user._id)) throw new ApiError(403, 'Only the original author can change this article.');
}
export async function list(req, res) { res.json({ posts: await BlogPost.find().sort({ createdAt: -1 }).populate('author', 'username').lean() }); }
export async function detail(req, res) {
  const post = await getPost(req.params.id);
  await post.populate('author', 'username');
  const comments = await Comment.find({ post: post._id }).sort({ createdAt: 1 }).populate('author', 'username');
  res.json({ post: { ...post.toObject(), comments } });
}
export async function create(req, res) { res.status(201).json({ post: await BlogPost.create({ ...req.input, author: req.user._id }) }); }
export async function update(req, res) {
  const post = await getPost(req.params.id); owns(req, post);
  Object.assign(post, req.input); await post.save(); res.json({ post });
}
export async function remove(req, res) {
  const post = await getPost(req.params.id); owns(req, post);
  await Comment.deleteMany({ post: post._id }); await post.deleteOne(); res.status(204).end();
}
export async function comments(req, res) {
  await getPost(req.params.postId);
  res.json({ comments: await Comment.find({ post: req.params.postId }).sort({ createdAt: 1 }).populate('author', 'username') });
}
export async function comment(req, res) {
  await getPost(req.params.postId);
  const comment = await Comment.create({ body: req.input.body, post: req.params.postId, author: req.user._id });
  await comment.populate('author', 'username'); res.status(201).json({ comment });
}
