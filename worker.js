import Queue from 'bull';
import fs from 'fs';
import imageThumbnail from 'image-thumbnail';
import dbclient from './utils/db';
// import Maligun from 'mailgun.js';

const fileQueue = new Queue('FileQueue');
const userQueue = new Queue('UserQueue');

fileQueue.process('file', async (job, done) => {
  try {
    const { userId, fileId } = job.data;
    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');
    const imgDoc = await dbclient.dbClient
      .collection('files')
      .findOne({ fileId, userId });
    if (!imgDoc) throw new Error('File not found');
    const path = imgDoc.localPath;
    fs.w(`${path}_500`, await imageThumbnail(path, { width: 500 }));

    fs.writeFileSync(`${path}_250`, await imageThumbnail(path, { width: 250 }));

    fs.writeFileSync(`${path}_100`, await imageThumbnail(path, { width: 100 }));
    done();
  } catch (err) {
    console.log(err);
  }
});

userQueue.process('user', async (job, done) => {
  try {
    const { userId } = job.data;
    if (!userId) throw new Error('Missing userId');
    const user = await dbclient.dbClient
      .collection('users')
      .findOne({ _id: userId });
    if (!user) throw new Error('User not found');
    console.log(`Welcome ${user.email}`);
    // const maligen = new Maligun(
    // { username: 'api', key: process.env.MAILGUN_API_KEY || 'mykey' }
    // );
    // const mg = maligen.client();
    // mg.messages.create('file-manager.com', {
    //   from: 'FileManager@gmail.com',
    //   to: user.email,
    //   subject: 'Welcome',
    //   text: `Welcome ${user.email}`,
    // })
    //   .then((msg) => console.log(msg))
    //   .catch((err) => console.error(err));

    done();
  } catch (err) {
    console.log(err);
  }
});
