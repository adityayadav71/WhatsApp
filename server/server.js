process.env.NODE_ENV = process.env.NODE_ENV || "development";
require("dotenv").config({ path: ".env" });

const app = require("./app");

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});