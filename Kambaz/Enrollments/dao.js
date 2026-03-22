import { v4 as uuidv4 } from "uuid";
export default function EnrollmentsDao(db) {
  function findEnrollmentsForUser(userId) {
    const { enrollments } = db;
    return enrollments.filter((enrollment) => enrollment.user === userId);
  }

  function findEnrollmentsForCourse(courseId) {
    const { enrollments } = db;
    return enrollments.filter((enrollment) => enrollment.course === courseId);
  }

  function findEnrollmentForUserInCourse(userId, courseId) {
    const { enrollments } = db;
    return enrollments.find(
      (enrollment) => enrollment.user === userId && enrollment.course === courseId
    );
  }

  function enrollUserInCourse(userId, courseId) {
    const existingEnrollment = findEnrollmentForUserInCourse(userId, courseId);
    if (existingEnrollment) {
      return existingEnrollment;
    }
    const newEnrollment = { _id: uuidv4(), user: userId, course: courseId };
    db.enrollments = [...db.enrollments, newEnrollment];
    return newEnrollment;
  }

  function unenrollUserFromCourse(userId, courseId) {
    const enrollment = findEnrollmentForUserInCourse(userId, courseId);
    if (!enrollment) {
      return null;
    }
    db.enrollments = db.enrollments.filter(
      (currentEnrollment) => currentEnrollment._id !== enrollment._id
    );
    return enrollment;
  }

  return {
    findEnrollmentsForUser,
    findEnrollmentsForCourse,
    findEnrollmentForUserInCourse,
    enrollUserInCourse,
    unenrollUserFromCourse,
  };
}
