var mongoose = require("mongoose");
var tunnel = require("tunnel-ssh");

//===== db connection =====

var config = {
  username: "root",
  password: "Krist759955",
  host: "128.199.216.159",
  port: 22,
  dstPort: 27017
};

var server = tunnel(config, function(error: any, server: any) {
  if (error) {
    console.log("SSH connection error: " + error);
  }
  console.log("SSH ok");
  mongoose.connect("mongodb://127.0.0.1:27017/cutu73", {
    // auth: {
    //   user: "username",
    //   password: "secret"
    // }
  });

  console.log("Connect ok");

  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "DB connection error:"));
  db.once("open", function() {
    // we're connected!
    console.log("DB connection successful");
    // console.log(server);
  });
  //   .then(() => console.log('DB connection successful'))
  //   .catch((error) => console.error.bind(console, 'DB connection error:'));
});
