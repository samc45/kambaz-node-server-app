import mongoose from "mongoose";

// A follow-up reply can be nested under either a top-level follow-up discussion
const FollowUpReplySchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    author: { type: String, ref: "UserModel" },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    replies: [],
  },
  { _id: false }
);
FollowUpReplySchema.add({ replies: { type: [FollowUpReplySchema], default: [] } });

// A follow-up discussion is nested under a Pazza post, and can have multiple top-level replies
// where each reply can have its own nested thread of replies
const FollowUpDiscussionSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    author: { type: String, ref: "UserModel" },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    replies: {
      type: [FollowUpReplySchema],
      default: []
    },
  },
  { _id: false }
);

// isInstructor=true. => the single shared instructor answer
// isInstructor=false => the single shared student answer
const AnswerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    author: { type: String, ref: "UserModel" },
    body: { type: String, required: true },
    isInstructor: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// A pazza post
const pazzaPostSchema = new mongoose.Schema(
  {
    _id: String,
    courseId: { type: String, ref: "CourseModel", required: true },
    type: { type: String, enum: ["question", "note"], required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, ref: "UserModel", required: true },
    body: { type: String, required: true },
    // Array of PazzaFolder _id strings
    folders: { type: [String], default: [] },
    // "class" = visible to all enrolled users; "individual" = private to author + instructors
    visibility: { type: String, enum: ["class", "individual"], default: "class" },
    instructorPosted: { type: Boolean, default: false },
    instructorEndorses: { type: Boolean, default: false },
    // Convenience flag kept in sync whenever the instructor answer is added/removed
    instructorAnswered: { type: Boolean, default: false },
    answers: { type: [AnswerSchema], default: [] },
    followUpDiscussions: { type: [FollowUpDiscussionSchema], default: [] },
  },
  { collection: "pazza_posts", timestamps: true }
);

// Class folders are created by instructors to organize Pazza posts
const pazzaFolderSchema = new mongoose.Schema(
  {
    _id: String,
    courseId: { type: String, ref: "CourseModel", required: true },
    name: { type: String, required: true, trim: true },
  },
  { collection: "pazza_folders", timestamps: true }
);

export { pazzaPostSchema, pazzaFolderSchema };
