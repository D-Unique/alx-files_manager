import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => {
      console.error(`An error occured: ${err}`);
    });
  }

  isAlive() {
    let connect = false;
    this.client.on('ready', () => {
      connect = true;
    });
    return connect;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
