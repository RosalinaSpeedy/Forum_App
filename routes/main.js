// Ben Craddock - 33733570 - bcrad001@campus.goldsmiths.ac.uk

//create object to store user name and login status
let user = {
    userName: "",
    loggedin: false
};

const { render } = require("pug");

//method to render page with user object data
function renderPage(page, req, res, forumData) {
    let newData;
    newData = Object.assign({}, forumData, { loginData: req.session.loggedin, userDetails: user });
    res.render(page, newData);
}

module.exports = function (app, forumData) {
    // Handle our routes
    app.get('/', function (req, res) {
        renderPage('index.ejs', req, res, forumData);
    });
    app.get('/about', function (req, res) {
        renderPage('about.ejs', req, res, forumData);
    });
    app.get('/search', function (req, res) {
        renderPage('search.ejs', req, res, forumData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        let basicFail = false; // set boolean variable to process advanced search if necessary
        // set query for EXACT matches to key word - order by topic name to set out nicely
        let postQuery = "SELECT users.userName, topics.topicName, posts.content " +
            "FROM users " +
            "INNER JOIN postallocation ON users.id = postallocation.userId " +
            "INNER JOIN topics ON postallocation.topicId = topics.id " +
            "INNER JOIN posts ON postallocation.id = posts.allocationId " +
            "WHERE posts.content='" + req.query.keyword + "'" +
            "ORDER BY topicName";
        let newData;
        // basic search query
        db.query(postQuery, (err, result) => {
            if (err || result.length == 0) { // If the search fails, or if it finds no results
                basicFail = true; // set flag to perform advanced search
            } else {
                newData = Object.assign({}, forumData, { searchResults: result, searchQuery: req.query.keyword });
                renderPage('searchresults.ejs', req, res, newData);
            }
        })
        // Perform advanced search:
        // Set query for any matches wherein the book title contains the keyword:
        //sqlquery = "SELECT * FROM posts WHERE content LIKE '%" + req.query.keyword + "%'";
        postQuery = "SELECT users.userName, topics.topicName, posts.content " +
            "FROM users " +
            "INNER JOIN postallocation ON users.id = postallocation.userId " +
            "INNER JOIN topics ON postallocation.topicId = topics.id " +
            "INNER JOIN posts ON postallocation.id = posts.allocationId " +
            "WHERE LOWER(posts.content) LIKE LOWER('%" + req.query.keyword + "%') " +
            "ORDER BY topicName";
        db.query(postQuery, (err, result) => {
            if (err) {
                console.log("ERROR IN SEARCH");
                res.redirect('./'); // if the search fails - redirect back
            } else {
                newData = Object.assign({}, forumData, { searchResults: result, searchQuery: req.query.keyword });
                console.log(newData)
                renderPage('searchresults.ejs', req, res, newData);
            }
        });
    });
    app.get('/register', function (req, res) {
        renderPage('register.ejs', req, res, forumData);
    });
    app.get('/listtopics', function (req, res) {
        let sqlquery = "SELECT * FROM topics"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            // Merge objecs for shop data, include sql results:
            let newData = Object.assign({}, forumData, { topics: result });
            console.log(newData)
            renderPage('listtopics.ejs', req, res, newData)
            //res.render("listtopics.ejs", newData)
        });
    });
    app.get('/topic-joined', function (req, res) {
        //join a topic:
        let topicName = req.query.topic;
        //get username and topic name; check if the user is already a member
        let topicGetQuery = "SELECT users.userName, topics.topicName " +
            "FROM memberof " +
            "INNER JOIN users ON memberof.userId = users.id " +
            "INNER JOIN topics ON memberof.topicId = topics.id " +
            "WHERE users.userName = '" + user.userName + "' AND topics.topicName = '" + topicName + "'";
        db.query(topicGetQuery, (err, result) => {
            if (err) {
                console.log("failed to get topics");
                res.redirect('./');
            }
            if (result.length > 0) {
                //send confirmation message
                res.send(user.userName + ", you are already a member of this topic!");
            } else {
                //add user to topic:
                let topicAddQuery = "INSERT INTO memberof (userId, topicId) " +
                    "SELECT users.id, topics.id " +
                    "FROM users INNER JOIN topics ON topics.topicName = '" + topicName + "' " +
                    "WHERE users.userName = '" + user.userName + "';"
                db.query(topicAddQuery, (err, result) => {
                    if (err) {
                        console.log("failed to add user to topic");
                        res.redirect('./');
                    }
                    //send confirmation message:
                    res.send(user.userName + ", you have joined the topic: " + topicName);
                })
            }
        })
    });
    app.get('/listusers', function (req, res) {
        let sqlquery = "SELECT * FROM users"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            // Merge objecs for shop data, include sql results:
            let newData = Object.assign({}, forumData, { users: result });
            console.log(newData)
            //res.render("listusers.ejs", newData)
            renderPage('listusers.ejs', req, res, newData);
        });
    });
    app.get('/listposts', function (req, res) {
        let postQuery = "SELECT users.userName, topics.topicName, posts.content " +
            "FROM users " +
            "INNER JOIN postallocation ON users.id = postallocation.userId " +
            "INNER JOIN topics ON postallocation.topicId = topics.id " +
            "INNER JOIN posts ON postallocation.id = posts.allocationId " +
            "ORDER BY topicName";
        console.log(postQuery)
        let mainData;
        db.query(postQuery, (err, result) => {
            if (err) {
                console.log(err);
                res.redirect('./');
            }
            mainData = Object.assign({}, forumData, { posts: result });
            //res.render("listposts.ejs", mainData);
            renderPage('listposts.ejs', req, res, mainData);
        })
    })
    app.get('/addpost', function (req, res) {
        //add a new post:
        if (user.loggedin) {
            let getUserId = "SELECT id FROM users WHERE userName = \"" + user.userName + "\"";
            let userId = -1;
            let newData;
            //query for userId based on current username
            db.query(getUserId, (err, result) => {
                if (err) {
                    console.log("FAILED TO GET USER ID")
                    res.redirect('./');
                }
                userId = result[0].id;
                //query for topic name based on the retrieved user ID
                let getTopics = "SELECT topicName " +
                    "FROM memberof " +
                    "INNER JOIN users ON memberof.userId = users.id " +
                    "INNER JOIN topics ON memberof.topicId = topics.id " +
                    "WHERE users.id = " + userId;
                db.query(getTopics, (err, result) => {
                    if (err) {
                        console.log(err);
                        console.log("Couldn't find topics");
                        res.redirect('./');
                    }
                    let topics = [];
                    for (let i = 0; i < result.length; i++) {
                        topics.push(result[i].topicName);
                    }
                    newData = Object.assign({}, forumData, { topicList: topics });
                    console.log(newData);
                    renderPage('addpost.ejs', req, res, newData);
                })
            });
        } else {
            //if there is no user logged in - render the default page
            renderPage('addpost.ejs', req, res, forumData);
        }
    });
    app.get('/login', function (req, res) {
        renderPage('login.ejs', req, res, forumData);
    })
    app.get('/logout', function (req, res) {
        //log the user out - return them to the homepage
        user.userName = "";
        user.loggedin = false;
        res.redirect("./");
    })
    app.post('/authenticate', function (req, res) {
        //log user in:
        let loginQuery = "SELECT * FROM users WHERE userName = ? AND password = ?"
        let userRecord = [req.body.userName, req.body.password];
        db.query(loginQuery, userRecord, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            if (result.length > 0) {
                //set user data:
                req.session.loggedin = true;
                req.session.userName = req.body.userName;
                user.userName = req.body.userName;
                user.loggedin = true;
                res.redirect('./')
            } else {
                res.send("Incorrect user name or password - please try again");
            }
        })
    })
    app.post('/registered', function (req, res) {
        // display registered message:
        let userInput = "INSERT INTO users (userName, password) VALUES (?,?)";
        let userRecord = [req.body.userName, req.body.password];
        console.log(userRecord)
        db.query(userInput, userRecord, (err, result) => {
            if (err) {
                console.log(err);
                res.redirect('./');
            }
            res.send(' Welcome ' + req.body.userName + ' you are now registered!');
        })

    });
    app.post('/listtopicposts', function (req, res) {
        // saving data in database
        let getTopicId = "SELECT id FROM topics WHERE topicName=\"" + req.body.topic + "\"";
        let topicId = -1;
        db.query(getTopicId, (err, result) => {
            if (err) {
                //throw error:
                return console.error(err.message);
            }
            else {
                topicId = result[0].id;
            }
            // execute sql query
            let newrecord = [req.body.topic, req.body.content];
            //get user here
            let getPostNo = "SELECT MAX(id) AS bigId FROM postallocation";
            let postNo = -1;
            db.query(getPostNo, (err, result) => {
                if (err) {
                    return console.error(err.message);
                }
                postNo = result[0].bigId;
                console.log("Before adding allocation topicId is: " + topicId)
                let getUserId = "SELECT id FROM users WHERE userName = \"" + user.userName + "\"";
                let userId = -1;
                db.query(getUserId, (err, result) => {
                    if (err) {
                        console.log("FAILED TO GET USER ID")
                        res.redirect('./');
                    }
                    userId = result[0].id;
                    let allocationQuery = "INSERT INTO postallocation (userId, topicId) VALUES (?,?)";
                    let allocationRecord = [userId, topicId];
                    // as long as a topic and content has been entered:
                    if (req.body.topic.length > 0 && req.body.content.length > 0) {
                        // pass allocationrecord in as paramater for SQL query INSERT:
                        db.query(allocationQuery, allocationRecord, (err, result) => {
                            if (err) {
                                //throw error:
                                return console.error(err.message);
                            }
                            else {
                                // display added post message:
                                let postQuery = "INSERT INTO posts (content, allocationId) VALUES (?,?)";
                                let postRecord = [req.body.content, postNo + 1];
                                db.query(postQuery, postRecord, (err, result) => {
                                    if (err) {
                                        return console.error(err.message);
                                    } else {
                                        let listQuery = "SELECT users.userName, topics.topicName, posts.content " +
                                            "FROM users " +
                                            "INNER JOIN postallocation ON users.id = postallocation.userId " +
                                            "INNER JOIN topics ON postallocation.topicId = topics.id " +
                                            "INNER JOIN posts ON postallocation.id = posts.allocationId " +
                                            "WHERE topicName=\"" + req.body.topic + "\"";
                                        let mainData;
                                        db.query(listQuery, (err, result) => {
                                            if (err) {
                                                res.redirect('./');
                                            }
                                            mainData = Object.assign({}, forumData, { posts: result });
                                            renderPage('listtopicposts.ejs', req, res, mainData);
                                        })
                                    }
                                })
                            }
                        });
                    } else {
                        // if the input didn't have an adequate topic and content: display error message instead
                        // do not execute query if the input is invalid.
                        res.send("The input was invalid! Ensure you enter a topic and some content text.");
                    }
                })

            })
        });

    });

}   