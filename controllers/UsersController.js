import cryto from 'crypto';
import dbclient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { password } = req.body;
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
    }
    const eQuery = { email };
    const dbUserC = await dbclient.dbClient.collection('users');
    const eCursor = await dbUserC.findOne(eQuery);
    console.log(`ecursor: ${eCursor}`);
    if (eCursor !== null) {
      res.status(400).json({ error: 'Already exist' });
    }
    const hashPassword = cryto.createHash('SHA1')
      .update(password)
      .digest('hex');
    const newUser = {
      email,
      password: hashPassword,
    };
    const obj = await dbUserC.insertOne(newUser);
    res.status(201).json(`{id: ${obj.insertedId}, email: ${email}}`);
    res.end();
  }
}

export default UsersController;
