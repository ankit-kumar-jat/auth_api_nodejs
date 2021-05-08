# RESTful api for Auth (espress-sessions)

this is a rest api using Express, Express-Sessions, MongoDB for Auth.

# configration

add an .env file at root folder of the application

```
# port for express listner
PORT=3000

# node environment
NODE_ENV=development

# mongo db url mongodb+srv://username:password@cluster-0-abcd.mongodb.net/collection
MONGO_URI=mongodb://127.0.0.1:27017/auth

# express session config
# express session name
SESS_NAME=sid
#express session secret
SESS_SECRET=secret!session
# session lifetime 1 day
SESS_LIFETIME=1000 * 60 * 60 * 24
```