import sha1 from 'sha1';
import dbclient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const eCursor = await dbclient.dbClient.collection('users').findOne({ email });
    if (eCursor) {
      return res.status(400).json({ error: 'Already exist' });
    }
    const hashPassword = sha1(password);
    const newUser = {
      email,
      password: hashPassword,
    };
    const obj = await dbclient.dbClient.collection('users').insertOne(newUser);
    return res.status(201).json(`{id: ${obj.insertedId}, email: ${email}}`);
  }
}

export default UsersController;
