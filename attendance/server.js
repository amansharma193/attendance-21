const http = require("http");
const os = require("os");
const uri = require("url");
const fs = require("fs");
var MongoClient = require("mongodb").MongoClient;
const { Console } = require("console");
var url = "mongodb://127.0.0.1:27017/";

var user = { name: "aman sharma" };

function compare_item(a, b) {
  // a should come before b in the sorted order
  if (
    parseInt(a.createdAt.split("/")[1]) < parseInt(b.createdAt.split("/")[1])
  ) {
    return -1;
    // a should come after b in the sorted order
  } else if (
    parseInt(a.createdAt.split("/")[1]) > parseInt(b.createdAt.split("/")[1])
  ) {
    return 1;
    // and and b are the same
  } else {
    if (
      parseInt(a.createdAt.split("/")[0]) < parseInt(b.createdAt.split("/")[0])
    ) {
      return -1;
      // a should come after b in the sorted order
    } else {
      return 1;
      // and and b are the same
    }
  }
}
http
  .createServer((req, res) => {
    console.log(req.url);
    res.writeHead(200, { "Content-type": "text/html" });
    if (req.url == "/") {
      fs.readFile("./list.html", (err, data) => {
        if (err) console.error(err);
        res.write(data);
        return res.end();
      });
    } else if (req.url == "/login" && req.method == "POST") {
      req.on("data", (data) => {
        console.log(data.toString());
        data = data.toString();
        let dt = new Date();
        user = {
          name: data.split("&")[0].split("=")[1],
          password: data.split("&")[1].split("=")[1],
          attendance: [
            {
              createdAt:
                dt.getDate() + "/" + dt.getMonth() + "/" + dt.getFullYear(),
            },
          ],
        };
        // MongoClient.connect(url, (err, db) => {
        //   var dbo = db.db("Employees");
        //   dbo.collection("Employees").insertOne(user, (err, success) => {
        //     fs.readFile("./list.html", (err, data) => {
        //       if (err) console.error(err);
        //       res.write(data);
        //       return res.end();
        //     });
        //   });
        // });
        MongoClient.connect(url, function (err, db) {
          if (err) console.error(err);
          var dbo = db.db("Employees");
          try {
            console.log(user);
            let dt = new Date();
            dbo
              .collection(`Employees`)
              .findOne(
                { name: user.name, password: user.password },
                (err, success) => {
                  if (err) {
                    console.error(err);
                    fs.readFile("./list.html", (err, data) => {
                      if (err) console.error(err);
                      res.write(data);
                      return res.end();
                    });
                  }
                  console.log(success);
                  let attnd = success.attendance;
                  for (let x = 0; x < attnd.length; x++) {
                    if (
                      attnd[x].createdAt ==
                      dt.getDate() +
                        "/" +
                        dt.getMonth() +
                        "/" +
                        dt.getFullYear()
                    ) {
                      attnd[x].entry = Date.now();
                    }
                    console.log(attnd[x]);
                    if (x == attnd.length - 1) {
                      console.log("queerye", user.name, user.password, attnd);
                      dbo
                        .collection("Employees")
                        .updateOne(
                          { name: user.name, password: user.password },
                          { $set: { attendance: attnd } },
                          (err, succ) => {
                            //console.log(succ);
                            db.close();
                            fs.readFile("./todo.html", (err, data) => {
                              if (err) console.error(err);
                              res.write(data);
                              return res.end();
                            });
                          },
                        );
                    }
                  }
                },
              );
          } catch (err) {}
        });
      });
    } else if (req.url == "/user/attendance" && req.method == "POST") {
      var user = null;
      req.on("data", (data) => {
        data = data.toString();
        user = {
          name: data.split("&")[0].split("=")[1],
          password: data.split("&")[1].split("=")[1],
        };
        MongoClient.connect(url, (err, db) => {
          var dbo = db.db("Employees");
          dbo.collection("Employees").findOne(user, (err, success) => {
            success.attendance.sort(compare_item);
            res.writeHead(200, { "Content-type": "text/html" });
            var txt = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>List</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>

<script
src="http://code.jquery.com/jquery-3.3.1.min.js"
integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css">
<script src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js" ></script>
            </head>
            <body>
            <div class="container">
<h2>Your Attendance</h2><table class="table table-fluid" id="myTable" border='1'> <thead> <tr><th>S. no</th><th>Date</th><th>Entry</th><th>Exit</th></tr> </thead>
<tbody>`;
            for (var x = 0; x < success.attendance.length; x++) {
              txt +=
                "<tr><td>" +
                (x + 1) +
                "</td><td>" +
                success.attendance[x].createdAt +
                "</td><td>" +
                new Date(success.attendance[x].entry).toTimeString() +
                "</td><td>" +
                new Date(success.attendance[x].exit).toTimeString() +
                "</td></tr>";
            }
            txt += `</tbody></table></div>
            <a href="/logout">Log out</a>
            </body><script>
            $(document).ready( function () {
            $('#myTable').DataTable();
        } );
        var select=document.getElementsByTagName('select')
            console.log(JSON.parse(select))
            </script></html>`;
            res.write(txt);
            res.end();
          });
        });
      });
    } else if (req.method == "GET" && req.url == "/logout") {
      MongoClient.connect(url, function (err, db) {
        if (err) console.error(err);
        var dbo = db.db("Employees");
        try {
          console.log(user);
          let dt = new Date();
          dbo
            .collection(`Employees`)
            .findOne(
              { name: user.name, password: user.password },
              (err, success) => {
                if (err) {
                  console.error(err);
                  fs.readFile("./todo.html", (err, data) => {
                    if (err) console.error(err);
                    res.write(data);
                    return res.end();
                  });
                }
                let attnd = success.attendance;
                for (let x = 0; x < attnd.length; x++) {
                  if (
                    attnd[x].createdAt ==
                    dt.getDate() + "/" + dt.getMonth() + "/" + dt.getFullYear()
                  ) {
                    attnd[x].exit = Date.now();
                  }
                  console.log(attnd[x]);
                  if (x == attnd.length - 1) {
                    console.log("queerye", user.name, user.password, attnd);
                    dbo
                      .collection("Employees")
                      .updateOne(
                        { name: user.name, password: user.password },
                        { $set: { attendance: attnd } },
                        (err, succ) => {
                          //console.log(succ);
                          db.close();
                          fs.readFile("./list.html", (err, data) => {
                            if (err) console.error(err);
                            res.write(data);
                            return res.end();
                          });
                        },
                      );
                  }
                }
              },
            );
        } catch (err) {}
      });
    } else if (req.url == "/login.html") {
      res.writeHead(200, { "Content-type": "text/html" });
      fs.readFile("./login.html", (err, data) => {
        if (err) console.error(err);
        res.write(data);
        return res.end();
      });
    } else {
      res.writeHead(404, { "Content-type": "text/html" });
      res.write("404 Error : Not Found.");
      return res.end();
    }
  })
  .listen(5000);

// db.Employees.updateOne({name:'hitesh',password:'123456'},{$set:{attendance:[
//     {
//         createdAt:'12/5/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'16/5/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'20/5/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'24/5/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'28/5/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'31/5/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'5/6/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'10/6/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'15/6/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'20/6/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'25/6/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'30/6/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'5/7/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'10/7/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'15/7/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'20/7/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'10/11/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'5/11/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'30/10/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'25/10/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'20/10/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'15/10/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'10/10/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'5/10/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'30/9/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'25/9/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'20/9/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'15/9/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'10/9/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'5/9/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'30/8/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     },{
//         createdAt:'25/7/2021',
//         entry:1618221211983,
//         exit:1618223211983
//     }
// ]}})
