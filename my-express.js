const http = require('http');
const url = require('url');
const fs = require("fs");

const LOCAL_DATABASE = "students.json";
const filename= "html.mustache";

const router = require('./router');
const response = require('./response');

function express()
{
    const server = http.createServer(function(req, res) {
        response(res);

        const path = router.match(req);

        if(path)
        {
            path(req,res);
        }

        if (req.method === "POST") {
                let body = "";
                req.on("data", chunk => {
                    body += chunk.toString();
                });

                req.on("end", () => {
                    console.log(req.headers);
                    const user = JSON.parse(body);

                    let data;
                    if (!fs.existsSync(LOCAL_DATABASE)) {
                        user.id = 1;
                        data = [user];
                    } else {
                        const json = require(`./${LOCAL_DATABASE}`);
                        user.id = json.length + 1;
                        json.push(user);
                        data = json;
                    }

                    fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(data, null, 4));
                });
        }
        const { pathname, query } = url.parse(req.url, true);

        if(req.method === "PUT") {

                let splitPathname = pathname.split('/')
                let putId = splitPathname[2]
                let matchPut = []
                let json = ""
                let data = ''
                req.on('data', chunk => {
                    data += chunk.toString()
                })
                req.on('end', () => {
                    let putD = JSON.parse(data)
                    let putNom = putD.name
                    let putSchool = putD.school
                    let isExist = false
                    matchPut = putId.match(/(^[0-9]+$)/g)
                    if (matchPut != null) {
                        putId = parseInt(matchPut[0])
                        if (fs.existsSync(LOCAL_DATABASE)) {
                            json = require(`./${LOCAL_DATABASE}`)
                            for (const k in json) {
                                if (json[k].id == putId) {
                                    isExist = true
                                }
                            }
                            if (isExist == true) {
                                for (const key in json) {
                                    if (json[key].id == putId) {
                                        if (putNom != undefined) {
                                            json[key].name = putNom
                                        }
                                        if (putSchool != undefined) {
                                            json[key].school = putSchool
                                        }
                                        fs.writeFileSync(LOCAL_DB, JSON.stringify(json, null, 4))
                                    }
                                }
                            } else {
                                return `<h1>ID ${putId} N'EXISTE PAS </h1>`
                            }
                        }
                    } else {
                        return `<h1>ID ${putId} N'EST PAS UN NOMBRE</h1>`
                    }
                })
                return (`<h1>Put OK</h1>`)
        }

        if(req.method === "DELETE") {
            
            if (fs.existsSync(LOCAL_DATABASE)) {
                fs.writeFileSync(LOCAL_DATABASE, JSON.stringify([], null, 4))
                return (`<h1>Delete OK</h1>`)
            } else {
                return (`<h1>Delete KO</h1>`)
            }
        }

        });

    const render = function(path, objName, callback) {
        let regex = /({{[\w]+}})/g;
        let content = ''
        let error = undefined
        if (!fs.existsSync(filename)) {
            error = `The file ${filename} does not exist.`;
        } else {
            content = '' + fs.readFileSync(`./${filename}`)
            if(objName !== "")
            {
                content = content.replace(regex, objName.name);
            }
       }
        callback(error, content)
    }

    //server listenning port
    const listen = function(port){
        server.listen(port);
        console.log("listening on port : " , port);
    }
    return {listen:listen, get:router.get, post:router.post, put:router.put, delete:router.del, render:render}
}
module.exports = express