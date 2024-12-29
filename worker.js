import Queue from 'bull';
import fs from 'fs';
import imageThumbnail from 'image-thumbnail';
import dbclient from './utils/db';

const fileQueue = new Queue('FileQueue');

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
