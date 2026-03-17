import crypto from 'crypto';
import express from 'express';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, bucketName } from '../config/aws.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { buildUserKey } from '../utils/fileHelpers.js';
import { metadataStore, shareStore } from '../data/store.js';

const router = express.Router();

function matchSharedUser(share, user) {
  const allowed = (share.allowedUsers || []).map((v) => String(v).trim()).filter(Boolean);
  if (!allowed.length) return false;
  return allowed.includes(user.sub) || (user.email && allowed.includes(user.email));
}

router.get('/public-share/:shareId', async (req, res, next) => {
  try {
    const shares = await shareStore.list();
    const share = shares.find((item) => item.shareId === req.params.shareId);
    if (!share) return res.status(404).json({ message: 'Share link not found' });

    const metadata = await metadataStore.list();
    const file = metadata.find((item) => item.fileId === share.fileId);
    if (!file) return res.status(404).json({ message: 'File metadata not found' });

    res.json({
      shareId: share.shareId,
      fileName: file.fileName,
      ownerSub: file.ownerSub,
      requiresAuthentication: true,
      status: share.active ? 'active' : 'disabled',
      expiresAt: share.expiresAt || null,
    });
  } catch (error) {
    next(error);
  }
});

router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const metadata = await metadataStore.list();
    const files = metadata
      .filter((file) => file.ownerSub === req.user.sub)
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.json({ files });
  } catch (error) {
    next(error);
  }
});

router.post('/upload-url', async (req, res, next) => {
  try {
    const { fileName, contentType } = req.body;
    if (!fileName || !contentType) {
      return res.status(400).json({ message: 'fileName and contentType are required' });
    }

    const fileId = crypto.randomUUID();
    const key = buildUserKey(req.user.sub, `${fileId}-${fileName}`);
    const command = new PutObjectCommand({ Bucket: bucketName, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    res.json({ uploadUrl, key, fileId });
  } catch (error) {
    next(error);
  }
});

router.post('/finalize-upload', async (req, res, next) => {
  try {
    const { fileId, key, fileName, contentType, size } = req.body;
    if (!fileId || !key || !fileName) {
      return res.status(400).json({ message: 'fileId, key and fileName are required' });
    }
    if (!key.startsWith(`${req.user.sub}/`)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const metadata = await metadataStore.list();
    const existing = metadata.find((item) => item.fileId === fileId);
    const record = {
      fileId,
      key,
      fileName,
      contentType: contentType || 'application/octet-stream',
      size: Number(size || 0),
      ownerSub: req.user.sub,
      ownerEmail: req.user.email || '',
      uploadedAt: new Date().toISOString(),
    };
    const nextItems = existing
      ? metadata.map((item) => (item.fileId === fileId ? record : item))
      : [record, ...metadata];

    await metadataStore.saveAll(nextItems);
    res.json({ message: 'Upload finalized', file: record });
  } catch (error) {
    next(error);
  }
});

router.get('/download-url', async (req, res, next) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ message: 'key is required' });
    if (!key.startsWith(`${req.user.sub}/`)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    res.json({ downloadUrl });
  } catch (error) {
    next(error);
  }
});

router.post('/share', async (req, res, next) => {
  try {
    const { fileId, allowedUsers = [], expiresInHours = 24 } = req.body;
    if (!fileId) return res.status(400).json({ message: 'fileId is required' });

    const metadata = await metadataStore.list();
    const file = metadata.find((item) => item.fileId === fileId && item.ownerSub === req.user.sub);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const shareId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + Number(expiresInHours) * 60 * 60 * 1000).toISOString();
    const shares = await shareStore.list();
    const share = {
      shareId,
      fileId,
      ownerSub: req.user.sub,
      allowedUsers: Array.isArray(allowedUsers) ? allowedUsers : [],
      active: true,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    await shareStore.saveAll([share, ...shares]);

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareLink = `${frontendBaseUrl}/shared/${shareId}`;
    res.json({ share, shareLink });
  } catch (error) {
    next(error);
  }
});

router.get('/shared/:shareId/access', async (req, res, next) => {
  try {
    const shares = await shareStore.list();
    const share = shares.find((item) => item.shareId === req.params.shareId);
    if (!share || !share.active) {
      return res.status(404).json({ message: 'Share link not found or disabled' });
    }
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return res.status(410).json({ message: 'Share link expired' });
    }
    if (!matchSharedUser(share, req.user)) {
      return res.status(403).json({ message: 'You are not allowed to access this file' });
    }

    const metadata = await metadataStore.list();
    const file = metadata.find((item) => item.fileId === share.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const command = new GetObjectCommand({ Bucket: bucketName, Key: file.key });
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    res.json({ fileName: file.fileName, downloadUrl, ownerSub: file.ownerSub, expiresAt: share.expiresAt || null });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ message: 'key is required' });
    if (!key.startsWith(`${req.user.sub}/`)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
    await s3Client.send(command);

    const metadata = await metadataStore.list();
    const file = metadata.find((item) => item.key === key && item.ownerSub === req.user.sub);
    await metadataStore.saveAll(metadata.filter((item) => item.key !== key));
    if (file) {
      const shares = await shareStore.list();
      await shareStore.saveAll(shares.filter((item) => item.fileId !== file.fileId));
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
