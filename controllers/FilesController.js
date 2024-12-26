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
    // convert userStrId to ObjectId
    const userObjId = ObjectId(userStrId);
    const {
      name, type, parentId, isPublic, data,
    } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type === 'folder') return res.status(400).json({ error: 'Missing data' });
    if (parentId) {
      const fDoc = await dbclient.dbClient
        .collection('files')
        .findOne({ parentId });
      if (!fDoc.parentId) return res.status(400).json({ error: 'Parent not found' });
      if (fDoc.parentId && fDoc.type !== 'folder') {
        fDoc.userId = userObjId;
        return res.status(400).json({ error: 'Parent is not a folder' });
      }

      const newFileobj = await dbclient.dbClient.collection('files').insertOne({
        userId: userObjId,
        name,
        type,
        isPublic,
        parentId,
        localPath: path,
      });
      return res.status(201).json({ newFileobj });
    }
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      await fs.promises.mkdir(folderPath, { recursive: true });
      const fileId = uuidv4();
    const filepath = path.join(folderPath, fileId);
    const strdata = Buffer.from(data, 'base64').toString('utf-8');

      await fs.promises.appendFile(filepath, strdata);
    const newFileobj = await dbclient.dbClient.collection('files').insertOne({
      userId: userObjId,
      name,
      type,
      isPublic,
      parentId,
      localPath: path,
    });
    return res.status(201).json({ newFileobj });
  }
    
    
    
    static async getShow(req, res) { }
    static async getIndex(req, res) { }
}

export default FilesController;
