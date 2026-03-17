export const buildUserKey = (userSub, fileName) => `${userSub}/${fileName}`;

export const extractDisplayName = (key) => key.split('/').slice(1).join('/');
