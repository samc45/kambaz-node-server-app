import { v4 as uuidv4 } from "uuid";
import { PazzaPostModel, PazzaFolderModel } from "./model.js";

/**
 * a helper function that recursively searches the reply tree to 
 * find the parent reply and insert the new reply as a child
 * @param {*} replies the array of replies to search through
 * @param {*} parentReplyId the id of the reply to insert under (if null, insert at top level)
 * @param {*} newReply 
 */
function insertReplyIntoTree(replies, parentReplyId, newReply) {
  // basically, a depth-first search for the parent reply id. 
  // If we find it, insert the new reply and return true.
  for (const reply of replies) {
    // if this is the parent, insert the new reply here
    if (reply._id === parentReplyId) {
      reply.replies.push(newReply);
      reply.updatedAt = new Date();
      return true;
    }

    // recursively search children, if any, for the parent reply id
    if (reply.replies?.length && insertReplyIntoTree(reply.replies, parentReplyId, newReply)) {
      return true;
    }
  }

  // parent not found in this branch, so far
  return false;
}

// helper function that recursively searches the reply tree
//  to find the reply to update and update its body
function updateReplyInTree(replies, replyId, body) {
  for (const reply of replies) {
    if (reply._id === replyId) {
      reply.body = body;
      reply.updatedAt = new Date();
      return true;
    }

    if (reply.replies?.length && updateReplyInTree(reply.replies, replyId, body)) {
      reply.updatedAt = new Date();
      return true;
    }
  }

  return false;
}

// helper function that recursively searches the reply tree
//  to find the reply to delete and remove it from the tree
function deleteReplyFromTree(replies, replyId) {
  for (let i = 0; i < replies.length; i += 1) {
    const reply = replies[i];

    if (reply._id === replyId) {
      replies.splice(i, 1);
      return true;
    }

    if (reply.replies?.length && deleteReplyFromTree(reply.replies, replyId)) {
      reply.updatedAt = new Date();
      return true;
    }
  }

  return false;
}

export default function PazzaDao() {

  function findFoldersForCourse(courseId) {
    return PazzaFolderModel.find({ courseId }).sort("name");
  }

  function createFolder(courseId, folder) {
    const newFolder = { ...folder, _id: uuidv4(), courseId };
    return PazzaFolderModel.create(newFolder);
  }

  function updateFolder(courseId, folderId, updates) {
    return PazzaFolderModel.findOneAndUpdate(
      { _id: folderId, courseId },
      { name: updates.name },
      { new: true, runValidators: true }
    );
  }

  function deleteFolder(courseId, folderId) {
    return PazzaFolderModel.findOneAndDelete({ _id: folderId, courseId });
  }

  async function findPostsForCourse(courseId, folderId) {
    const filter = { courseId };
    if (folderId) filter.folders = folderId;
    await PazzaPostModel.updateMany(filter, { $inc: { views: 1 } });
    return PazzaPostModel.find(filter).sort({ createdAt: -1 });
  }

  function findPostById(courseId, postId) {
    return PazzaPostModel.findOneAndUpdate(
      { _id: postId, courseId },
      { $inc: { views: 1 } },
      { new: true }
    );
  }

  function createPost(courseId, post) {
    const newPost = {
      ...post,
      _id: uuidv4(),
      courseId,
      answers: [],
      followUpDiscussions: [],
      instructorAnswered: false,
      views: 0,
    };
    return PazzaPostModel.create(newPost);
  }

  function updatePost(courseId, postId, updates) {
    return PazzaPostModel.findOneAndUpdate(
      { _id: postId, courseId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  function deletePost(courseId, postId) {
    return PazzaPostModel.findOneAndDelete({ _id: postId, courseId });
  }

  async function endorsePost(courseId, postId, instructorEndorses) {
    return PazzaPostModel.findOneAndUpdate(
      { _id: postId, courseId },
      { instructorEndorses },
      { new: true }
    );
  }

  async function setAnswer(courseId, postId, body, isInstructor, authorId) {
    const post = await PazzaPostModel.findOne({ _id: postId, courseId });
    if (!post) return null;

    const now = new Date();
    const existing = post.answers.find((a) => a.isInstructor === isInstructor);
    if (existing) {
      existing.body = body;
      existing.author = authorId;
      existing.updatedAt = now;
    } else {
      post.answers.push({
        _id: uuidv4(),
        author: authorId,
        body,
        isInstructor,
        createdAt: now,
        updatedAt: now,
      });
    }
    if (isInstructor) post.instructorAnswered = true;
    return post.save();
  }

  async function deleteAnswer(courseId, postId, isInstructor) {
    const post = await PazzaPostModel.findOne({ _id: postId, courseId });
    if (!post) return null;

    post.answers = post.answers.filter((a) => a.isInstructor !== isInstructor);
    if (isInstructor) post.instructorAnswered = false;
    return post.save();
  }

  async function addFollowUpDiscussion(courseId, postId, body, authorId) {
    const post = await PazzaPostModel.findOne({ _id: postId, courseId });
    if (!post) return null;

    const now = new Date();
    post.followUpDiscussions.push({
      _id: uuidv4(),
      author: authorId,
      body,
      createdAt: now,
      updatedAt: now,
      resolved: false,
      replies: [],
    });
    return post.save();
  }

  async function updateFollowUpDiscussion(courseId, postId, discussionId, updates) {
    const post = await PazzaPostModel.findOne({ _id: postId, courseId });
    if (!post) return null;

    const discussion = post.followUpDiscussions.find((d) => d._id === discussionId);
    if (!discussion) return null;

    if (updates.body !== undefined) discussion.body = updates.body;
    if (updates.resolved !== undefined) discussion.resolved = updates.resolved;
    discussion.updatedAt = new Date();

    return post.save();
  }

  async function deleteFollowUpDiscussion(courseId, postId, discussionId) {
    const post = await PazzaPostModel.findOne({ _id: postId, courseId });
    if (!post) return null;

    // just filter out the discussion to delete it from the array of discussions
    post.followUpDiscussions = post.followUpDiscussions.filter(
      (d) => d._id !== discussionId
    );

    return post.save();
  }

  async function addReplyToDiscussion(courseId, postId, discussionId, body, parentReplyId, authorId) {
    const post = await PazzaPostModel.findOne({ _id: postId, courseId });
    if (!post) return null;

    const discussion = post.followUpDiscussions.find((d) => d._id === discussionId);
    if (!discussion) return null;

    const now = new Date();
    const newReply = {
      _id: uuidv4(),
      author: authorId,
      body,
      createdAt: now,
      updatedAt: now,
      replies: [],
    };

    // if parentReplyId is null, insert at top level of discussion replies. 
    // otherwise, find the parent in the tree-like structure and reply and insert
    // at that point instead
    if (!parentReplyId) {
      discussion.replies.push(newReply);
    } else {
      const inserted = insertReplyIntoTree(discussion.replies, parentReplyId, newReply);
      if (!inserted) return "PARENT NOT FOUND";
    }
    discussion.updatedAt = now;

    return post.save();
  }

  async function updateReplyInDiscussion(courseId, postId, discussionId, replyId, body) {
    const post = await PazzaPostModel.findOne({ _id: postId, courseId });
    if (!post) return null;

    const discussion = post.followUpDiscussions.find((d) => d._id === discussionId);
    if (!discussion) return null;

    const updated = updateReplyInTree(discussion.replies, replyId, body);
    if (!updated) return "REPLY NOT FOUND";

    discussion.updatedAt = new Date();
    return post.save();
  }

  async function deleteReplyFromDiscussion(courseId, postId, discussionId, replyId) {
    const post = await PazzaPostModel.findOne({ _id: postId, courseId });
    if (!post) return null;

    const discussion = post.followUpDiscussions.find((d) => d._id === discussionId);
    if (!discussion) return null;

    const deleted = deleteReplyFromTree(discussion.replies, replyId);
    if (!deleted) return "REPLY NOT FOUND";

    discussion.updatedAt = new Date();
    return post.save();
  }

  return {
    findFoldersForCourse,
    createFolder,
    updateFolder,
    deleteFolder,

    findPostsForCourse,
    findPostById,
    createPost,
    updatePost,
    deletePost,
    endorsePost,

    setAnswer,
    deleteAnswer,

    addFollowUpDiscussion,
    updateFollowUpDiscussion,
    deleteFollowUpDiscussion,
    addReplyToDiscussion,
    updateReplyInDiscussion,
    deleteReplyFromDiscussion,
  };
}
