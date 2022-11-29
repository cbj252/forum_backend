# forum_backend

# Features

- Users can signup for an account with a username and password, as well as login with a correct username and password. Jwt tokens are used to identify users.

For logged in users:
- Users can create threads and create posts in threads, like a forum.
- Each page in a thread has a limit of 10 posts.
- Users can navigate to the surrounding pages (e.g. if a user is on page 4, they can navigate to pages 3 and 5), as well as the first and last page.
- There are users of varying permission levels. For example, a user cannot delete posts but an admin can. Owners can change users' permission levels.

# Project Structure & Reasoning
- Uses state (res.locals.currentUser) to keep track of who is making the request and thus whether to perform some actions based on the person's identity (e.g. only the person who made a post can edit it) [Example code](https://github.com/cbj252/forum_backend/blob/main/controllers/indexController.js#L76)
- Tests are made using mongodb-memory-server. After making the server, tests populate the database with fake users, admins and owners to verify data. [Example code](https://github.com/cbj252/forum_backend/blob/main/tests/helper.js#L21)
- [Example test to verify that only the person that made a post can delete it](https://github.com/cbj252/forum_backend/blob/main/tests/testIndex.test.js#L126)


# What I would do if I had more time
- Work on the [frontend](https://github.com/cbj252/forum_frontend). It's rather barebones since the frontend wasn't the focus of the project.
- Allow users to have profile pictures that are displayed when they make a post, and signatures that are put at the bottom of their posts, much like a real online forum.

# Scripts

In the main directory, run:

`npm run start`
Runs the website in a development server.
The program requires a database URL "DB_URL" in .env to function correctly.

`npm run devstart`
Uses nodemon to run the website everytime a change is detected in the file directory.
