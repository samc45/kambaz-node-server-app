const assignment = {
  id: 1,
  title: "NodeJS Assignment",
  description: "Create a NodeJS server with ExpressJS",
  due: "2021-10-10",
  completed: false,
  score: 0,
};

const module = {
  id: 1,
  name: "NodeJS Module",
  description: "Learn the basics of NodeJS and ExpressJS",
  course: "CS4550 Web Development",
  completed: false,
  score: 0,
}

const getModule = (req, res) => {
  res.json(module);
};

const getModuleName = (req, res) => {
  res.json(module.name);
};

const getAssignment = (req, res) => {
  res.json(assignment);
};
const getAssignmentTitle = (req, res) => {
  res.json(assignment.title);
};
const setAssignmentTitle = (req, res) => {
  const { newTitle } = req.params;
  assignment.title = newTitle;
  res.json(assignment);
};

const setModuleName = (req, res) => {
  const { newName } = req.params;
  module.name = newName;
  res.json(module);
}

const setModuleScore = (req, res) => {
  const { newScore } = req.params;
  module.score = parseInt(newScore);
  res.json(module);
}

const setModuleCompleted = (req, res) => {
  const { newCompleted } = req.params;
  module.completed = newCompleted === 'true';
  res.json(module);
}

export default function WorkingWithObjects(app) {
  app.get("/lab5/assignment/title", getAssignmentTitle);
  app.get("/lab5/assignment", getAssignment);
  app.get("/lab5/assignment/title/:newTitle", setAssignmentTitle);

  app.get("/lab5/module", getModule);
  app.get("/lab5/module/name", getModuleName);
  app.get("/lab5/module/name/:newName", setModuleName);
  app.get("/lab5/module/score/:newScore", setModuleScore);
  app.get("/lab5/module/completed/:newCompleted", setModuleCompleted);
}
