import cryto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { password } = req.body;
    const { email } = req.body;
    if (!email) {
      res.status('400').send('Missing password');
    }
    if (!password) {
      res.status('400').send('Missing email');
    }
    const eQuery = { email };
    const dbUserC = dbClient.collection('users');
    const eCursor = dbUserC.find(eQuery);
    if (!eCursor) {
      res.status(400).send('Already exist');
    }
    const hashPassword = cryto.createHash('SHA1')
      .update(password)
      .digest('hex');
    const newUser = {
      email,
      password: hashPassword,
    };
    const obj = dbUserC.insert(newUser);
    res.status(201).json({
      email,
      id: obj.id,
    });
  }
}

export default UsersController;
