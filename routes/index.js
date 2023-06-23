const authRoute = require("./authRoute");
const userRoute = require("./userRoute");
const connectionRoute = require("./connectionRoute");
const connectionRequestRoute = require("./connectionRequestRoute");
const groupRoute = require("./groupRoute");
const groupRequestRoute = require("./groupRequestRoute");
const postRoute = require("./postRoute");
const postCommentRoute = require("./postCommentRoute");
const postReactRoute = require("./postReactRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/connections", connectionRoute);
  app.use("/api/v1/connectionRequests", connectionRequestRoute);
  app.use("/api/v1/groups", groupRoute);
  app.use("/api/v1/groupRequests", groupRequestRoute);
  app.use("/api/v1/posts", postRoute);
  app.use("/api/v1/postComments", postCommentRoute);
  app.use("/api/v1/postReacts", postReactRoute);
};
module.exports = mountRoutes;
