import PazzaDao from "./dao.js";

// Pazza Routes
// unlike other setups, the function is just embedded in 
// the route instead of making each one a separate function
// since it's just getting passed in anyways
export default function PazzaRoutes(app) {
  const dao = PazzaDao();

  app.get("/api/courses/:courseId/pazza/folders", async (req, res) => {
    const { courseId } = req.params;
    try {
      const folders = await dao.findFoldersForCourse(courseId);
      res.json(folders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/courses/:courseId/pazza/folders", async (req, res) => {
    const { courseId } = req.params;
    try {
      const folder = await dao.createFolder(courseId, req.body);
      res.status(201).json(folder);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/courses/:courseId/pazza/folders/:folderId", async (req, res) => {
    const { courseId, folderId } = req.params;
    try {
      const folder = await dao.updateFolder(courseId, folderId, req.body);
      if (!folder) return res.status(404).json({ error: "Folder not found" });
      res.json(folder);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/courses/:courseId/pazza/folders/:folderId", async (req, res) => {
    const { courseId, folderId } = req.params;
    try {
      const result = await dao.deleteFolder(courseId, folderId);
      if (!result) return res.status(404).json({ error: "Folder not found" });
      res.json({ message: "Folder deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/courses/:courseId/pazza/posts", async (req, res) => {
    const { courseId } = req.params;
    const { folder } = req.query;
    try {
      const posts = await dao.findPostsForCourse(courseId, folder);
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/courses/:courseId/pazza/posts/:postId", async (req, res) => {
    const { courseId, postId } = req.params;
    try {
      const post = await dao.findPostById(courseId, postId);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/courses/:courseId/pazza/posts", async (req, res) => {
    const { courseId } = req.params;
    const currentUser = req.session?.currentUser;
    const authorName = `${currentUser?.firstName} ${currentUser?.lastName}`.trim();
    try {
      const post = await dao.createPost(courseId, { ...req.body, author: authorName });
      res.status(201).json(post);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/courses/:courseId/pazza/posts/:postId", async (req, res) => {
    const { courseId, postId } = req.params;
    const { title, body, folders, visibility } = req.body;
    try {
      const post = await dao.updatePost(courseId, postId, { title, body, folders, visibility });
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/courses/:courseId/pazza/posts/:postId", async (req, res) => {
    const { courseId, postId } = req.params;
    try {
      const result = await dao.deletePost(courseId, postId);
      if (!result) return res.status(404).json({ error: "Post not found" });
      res.json({ message: "Post deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/courses/:courseId/pazza/posts/:postId/endorse", async (req, res) => {
    const { courseId, postId } = req.params;
    const { instructorEndorses } = req.body;
    try {
      const post = await dao.endorsePost(courseId, postId, instructorEndorses);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });


  app.put("/api/courses/:courseId/pazza/posts/:postId/instructor-answer", async (req, res) => {
    const { courseId, postId } = req.params;
    const currentUser = req.session?.currentUser;
    const authorName = `${currentUser?.firstName} ${currentUser?.lastName}`.trim();
    try {
      const post = await dao.setAnswer(courseId, postId, req.body.body, true, authorName);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/courses/:courseId/pazza/posts/:postId/instructor-answer", async (req, res) => {
    const { courseId, postId } = req.params;
    try {
      const post = await dao.deleteAnswer(courseId, postId, true);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/courses/:courseId/pazza/posts/:postId/student-answer", async (req, res) => {
    const { courseId, postId } = req.params;
    const currentUser = req.session?.currentUser;
    const authorName = `${currentUser?.firstName} ${currentUser?.lastName}`.trim();
    try {
      const post = await dao.setAnswer(courseId, postId, req.body.body, false, authorName);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/courses/:courseId/pazza/posts/:postId/student-answer", async (req, res) => {
    const { courseId, postId } = req.params;
    try {
      const post = await dao.deleteAnswer(courseId, postId, false);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });



  app.post("/api/courses/:courseId/pazza/posts/:postId/followups", async (req, res) => {
    const { courseId, postId } = req.params;
    const currentUser = req.session?.currentUser;
    const authorName = `${currentUser?.firstName} ${currentUser?.lastName}`.trim();
    try {
      const post = await dao.addFollowUpDiscussion(courseId, postId, req.body.body, authorName);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.status(201).json(post);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put(
    "/api/courses/:courseId/pazza/posts/:postId/followups/:discussionId",
    async (req, res) => {
      const { courseId, postId, discussionId } = req.params;
      try {
        const post = await dao.updateFollowUpDiscussion(
          courseId, postId, discussionId, req.body
        );
        if (!post) return res.status(404).json({ error: "Post or discussion not found" });
        res.json(post);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  app.delete(
    "/api/courses/:courseId/pazza/posts/:postId/followups/:discussionId",
    async (req, res) => {
      const { courseId, postId, discussionId } = req.params;
      try {
        const post = await dao.deleteFollowUpDiscussion(courseId, postId, discussionId);
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.json(post);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
  );

  app.post(
    "/api/courses/:courseId/pazza/posts/:postId/followups/:discussionId/replies",
    async (req, res) => {
      const { courseId, postId, discussionId } = req.params;
      const { body, parentReplyId } = req.body;
      const currentUser = req.session?.currentUser;
      const authorName = `${currentUser?.firstName} ${currentUser?.lastName}`.trim();
      try {
        const result = await dao.addReplyToDiscussion(
          courseId, postId, discussionId, body, parentReplyId ?? null, authorName
        );
        if (!result) return res.status(404).json({ error: "Post or discussion not found" });
        if (result === "PARENT_NOT_FOUND") {
          return res.status(404).json({ error: "Parent reply not found" });
        }
        res.status(201).json(result);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    }
  );
  app.put(
    "/api/courses/:courseId/pazza/posts/:postId/followups/:discussionId/replies/:replyId",
    async (req, res) => {
      const { courseId, postId, discussionId, replyId } = req.params;
      const { body } = req.body;
      try {
        const result = await dao.updateReplyInDiscussion(
          courseId, postId, discussionId, replyId, body
        );
        if (!result) return res.status(404).json({ error: "Post or discussion not found" });
        if (result === "REPLY_NOT_FOUND") {
          return res.status(404).json({ error: "Reply not found" });
        }
        res.json(result);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    }
  );
  app.delete(
    "/api/courses/:courseId/pazza/posts/:postId/followups/:discussionId/replies/:replyId",
    async (req, res) => {
      const { courseId, postId, discussionId, replyId } = req.params;
      try {
        const result = await dao.deleteReplyFromDiscussion(
          courseId, postId, discussionId, replyId
        );
        if (!result) return res.status(404).json({ error: "Post or discussion not found" });
        if (result === "REPLY_NOT_FOUND") {
          return res.status(404).json({ error: "Reply not found" });
        }
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
  );
}
