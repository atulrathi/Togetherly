require("dotenv").config();

const http = require("http");
const app = require("./app");
const db = require('./config/dbconnection');
const { initSocket } = require("./socket/socket");
db();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
