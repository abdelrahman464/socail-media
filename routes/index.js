const authRoute = require("./authRoute");
const userRoute = require("./userRoute");
const connectionRoute = require("./connectionRoute");
const groupRoute = require("./groupRoute");
const postRoute = require("./postRoute");
const commentRoute = require("./commentsRoute");
const reactRoute = require("./reactRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/connections", connectionRoute);
  app.use("/api/v1/groups", groupRoute);
  app.use("/api/v1/posts", postRoute);
  app.use("/api/v1/comments", commentRoute);
  app.use("/api/v1/reacts", reactRoute);
};
module.exports = mountRoutes;
