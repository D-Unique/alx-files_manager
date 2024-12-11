import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const redisalive = redisClient.isAlive();
    const dbalive = dbClient.isAlive();
    res.status(200).json({ redis: redisalive, db: dbalive });
  }

  static async getStats(req, res) {
    const numf = await dbClient.nbFiles();
    const numu = await dbClient.nbUsers();
    res.status(200).json({ users: numu, files: numf });
  }
}
export default AppController;
