import EnrollmentsDao from "./dao.js";

export default function EnrollmentsRoutes(app, db) {
  const dao = EnrollmentsDao(db);

  const resolveUserId = (req) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return null;
      }
      userId = currentUser._id;
    }
    return userId;
  };

  const findEnrollmentsForUser = async (req, res) => {
    const userId = resolveUserId(req);
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    const enrollments = await dao.findCoursesForUser(userId);
    res.json(enrollments);
  };

  const findEnrollmentsForCourse = async (req, res) => {
    const { courseId } = req.params;
    const enrollments = await dao.findUsersForCourse(courseId);
    res.json(enrollments);
  };

  const enrollUserInCourse = async (req, res) => {
    const userId = resolveUserId(req);
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    const { courseId } = req.params;
    const enrollment = await dao.enrollUserInCourse(userId, courseId);
    res.json(enrollment);
  };

  const unenrollUserFromCourse = async (req, res) => {
    const userId = resolveUserId(req);
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    const { courseId } = req.params;
    const enrollment = await dao.unenrollUserFromCourse(userId, courseId);
    if (!enrollment) {
      res.sendStatus(404);
      return;
    }
    res.json(enrollment);
  };

  app.get("/api/users/:userId/enrollments", findEnrollmentsForUser);
  app.get("/api/courses/:courseId/enrollments", findEnrollmentsForCourse);
  app.post("/api/users/:userId/courses/:courseId/enrollment", enrollUserInCourse);
  app.delete("/api/users/:userId/courses/:courseId/enrollment", unenrollUserFromCourse);
}