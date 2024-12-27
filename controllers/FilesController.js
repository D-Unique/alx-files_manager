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
        .insertOne({
          userId: ObjectId(userStrId), name, type, isPublic: isPublic || false, parentId,
        });
      return res.status(201).json({ id: newFileobj.insertedId, ...folderData });
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

    const fileId = uuidv4();
    const filepath = path.join(folderPath, fileId);
    await fs.promises.mkdir(folderPath, { recursive: true });

    const strdata = Buffer.from(data, 'base64').toString('utf-8');

    await fs.promises.appendFile(filepath, strdata);
    const newFileobj = await dbclient.dbClient.collection('files').insertOne({
      localPath: filepath, ...folderData,
    });
    folderData.parentId = parentId === '0' ? 0 : ObjectId(parentId);
    return res.status(201).json({ id: newFileobj.insertedId, ...folderData });
  }

  static async getShow(req, res) {
    const fileId = req.params.id;
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userStrId = await redisClient.get(`auth_${token}`);
    if (!userStrId) return res.status(401).json({ error: 'Unauthorized' });
    const fileDoc = await dbclient.dbClient.collection('files').findOne({ _id: ObjectId(fileId) });
    if (!fileDoc && fileDoc.userId === ObjectId(userStrId)) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(fileDoc);
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userStrId = await redisClient.get(`auth_${token}`);
    if (!userStrId) return res.status(401).json({ error: 'Unauthorized' });
    let { parentId, page } = req.query;
    parentId = parentId || '0';
    page = page || 0;
    const query = { userId: ObjectId(userStrId), parentId: parentId === '0' ? '0' : ObjectId(parentId) };
    const cursor = await dbclient.dbClient.collection('files').find(query).limit(20).skip(page * 20);
    const files = await cursor.toArray();
    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ errror: 'Unauthorized' });
    const userStrId = await redisClient.get(`auth_${token}`);
    if (!userStrId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const filedoc = await dbclient.dbClient.collection('files').findOne({ _Id: ObjectId(id), userId: ObjectId(userStrId) });
    if (!filedoc) return res.status(404).json({ error: 'Not found' });
    filedoc.isPublic = true;
    return res.status(200).json({ filedoc });
  }

  static async putUnpublish(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userStrId = await redisClient.get(`auth_${token}`);
    if (!userStrId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const filedoc = await dbclient.dbClient.collection('files').findOne({ _Id: ObjectId(id), userId: ObjectId(userStrId) });
    if (!filedoc) return res.status(404).json({ error: 'Not found' });
    filedoc.isPublic = false;
    return res.status(200).json({ filedoc });
  }
}

export default FilesController;
