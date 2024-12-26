import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import path from 'path';
import redisClient from '../utils/redis';
import dbclient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userStrId = await redisClient.get(`auth_${token}`);
    if (!userStrId) return res.status(401).json({ error: 'Unauthorized' });
    const {
      name, type, isPublic, data,
    } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });
    let parentId = req.body.parentId || '0';

    if (parentId !== '0') {
      const fDoc = await dbclient.dbClient
        .collection('files')
        .findOne({ _Id: ObjectId(parentId) });
      if (!fDoc) return res.status(400).json({ error: 'Parent not found' });
      if (fDoc.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }
    parentId = parentId === '0' ? '0' : ObjectId(parentId);
    const folderData = {
      userId: ObjectId(userStrId),
      name,
      type,
      isPublic: isPublic || false,
      parentId,
    };
    if (type === 'folder') {
      const newFileobj = await dbclient.dbClient
        .collection('files')
        .insertOne({ ...folderData });
      return res.status(201).json({ id: newFileobj.insertedId, ...folderData });
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    await fs.promises.mkdir(folderPath, { recursive: true });
    const fileId = uuidv4();
    const filepath = path.join(folderPath, fileId);

    const strdata = Buffer.from(data, 'base64').toString('utf-8');

    await fs.promises.appendFile(filepath, strdata);
    const newFileobj = await dbclient.dbClient.collection('files').insertOne({
      localPath: filepath, ...folderData,
    });
    return res.status(201).json({ id: newFileobj.insertedId, ...folderData });
  }
  // static async getShow(req, res) { }

  //   static async getIndex(req, res) { }
}

export default FilesController;
