/*class AuthController {
    static async getConnect(req, res) {
        { email } = req.body
        req.Authorization
    }
}
GET / connect should sign -in the user by generating a new authentication token:


By using the header Authorization and the technique of the Basic auth (Base64 of the <email>:<password>), find the user associate to this email and with this password (reminder: we are storing the SHA1 of the password)
If no user has been found, return an error Unauthorized with a status code 401
Otherwise:
Generate a random string (using uuidv4) as token
Create a key: auth_<token>
Use this key for storing in Redis (by using the redisClient create previously) the user ID for 24 hours
Return this token: { "token": "155342df-2399-41da-9e8c-458b6ac52a0c" } with a status code 200
Now, we have a way to identify a user, create a token (= avoid to store the password on any front-end) and use this token for 24h to access to the API!

Every authenticated endpoints of our API will look at this token inside the header X-Token.

GET /disconnect should sign-out the user based on the token:

Retrieve the user based on the token:
If not found, return an error Unauthorized with a status code 401
Otherwise, delete the token in Redis and return nothing with a status code 204
Inside the file controllers/UsersController.js add a new endpoint:

GET /users/me should retrieve the user base on the token used:

Retrieve the user based on the token:
If not found, return an error Unauthorized with a status code 401
Otherwise, return the user object (email and id only)*/
