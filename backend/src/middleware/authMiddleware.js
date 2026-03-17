import { CognitoJwtVerifier } from 'aws-jwt-verify';
import dotenv from 'dotenv';

dotenv.config();

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

let verifier = null;

if (userPoolId && clientId && userPoolId !== 'test' && clientId !== 'test') {
  verifier = CognitoJwtVerifier.create({
    userPoolId,
    tokenUse: 'access',
    clientId,
  });
}

export const verifyToken = async (req, res, next) => {
  try {
    if (!verifier) {
      const demoSub = req.headers['x-demo-user-sub'] || req.headers['x-user-sub'];
      const demoEmail = req.headers['x-demo-user-email'] || req.headers['x-user-email'];

      if (!demoSub) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      req.user = {
        sub: demoSub,
        username: demoSub,
        email: demoEmail || '',
        isDemo: true,
      };
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifier.verify(token);

    req.user = {
      sub: payload.sub,
      username: payload.username || payload['cognito:username'] || payload.sub,
      email: payload.email || '',
      isDemo: false,
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
