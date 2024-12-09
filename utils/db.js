import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 27017;
    const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${DB_HOST}:${DB_PORT}`;
    this.client = new MongoClient(url);
    this.client.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
      if (err) {
        console.error(err);
        this.dbclient = false;
      } else {
        this.dbclient = client.db(DB_DATABASE);
      }
    });
  }

  isAlive() {
    return !!this.dbclient;
  }

  async nbUsers() {
    return this.dbclient.collection('users').count;
  }

  async nbFiles() {
    return this.dbclient.collection('files').count();
  }
}

const dbClient = new DBClient();
export default dbClient;
