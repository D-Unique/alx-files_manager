import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbclient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const auth = req.header('Authorization');
    const encodedCreden = auth.trim().replace('Basic ', '');
    const strCreden = Buffer.from(encodedCreden, 'base64').toString('utf-8');
    const [email, password] = strCreden.split(':');
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbclient.dbClient.collection('users').findOne({ email });
    if (!user || user.password !== sha1(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    const val = user._id.toString();
    await redisClient.client.set(key, val, 'EX', 60 * 60 * 24);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const value = await redisClient.get(`auth_${token}`);
    if (!value) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${token}`);
    return res.status(204).end();
  }
}

export default AuthController;
