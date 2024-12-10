import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const getStatus = (req, res) => {
  if (redisClient.isAlive && dbClient.isAlive) {
    res.status(200);
    res.send('{ "redis": true, "db": true }');
  }
};

const getStats = (req, res) => {
  res.status(200);
  const numf = dbClient.nbFiles;
  const numu = dbClient.nbUsers;
  res.send(`{users: ${numu}, files: ${numf}}`);
};

export default { getStats, getStatus };
