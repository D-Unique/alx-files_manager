import sha1 from 'sha1';
import dbclient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const eCursor = await dbclient.dbClient
      .collection('users')
      .findOne({ email });
    if (eCursor) {
      return res.status(400).json({ error: 'Already exist' });
    }
    const hashPassword = sha1(password);
    const obj = await dbclient.dbClient
      .collection('users')
      .insertOne({ email, password: hashPassword });
    return res.status(201).json({ id: obj.insertedId, email });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userStrId = await redisClient.get(`auth_${token}`);
    if (!userStrId) return res.status(401).json({ error: 'Unauthorized' });
    const userObjId = new ObjectId(userStrId);
    const user = await dbclient.dbClient
      .collection('users')
      .findOne({ _id: userObjId });
    console.log(user);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ email: user.email, id: user._id });
  }
}

export default UsersController;
