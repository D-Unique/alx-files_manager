import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        this.dbClient = false;
        console.log(err);
      } else {
        console.log(`mongodb connected to ${url}`);
        this.dbClient = client.db(database);
      }
    });
  }

  isAlive() {
    return !!this.dbClient;
  }

  async nbUsers() {
    return this.dbClient.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.dbClient.collection('files').countDocuments();
  }
}
const dbclient = new DBClient();
export default dbclient;
