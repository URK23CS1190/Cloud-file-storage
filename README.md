# Cloud-Based File Storage System with Protected Share Links

A beginner/intermediate full-stack file storage app similar to a simple Google Drive clone.

## What is new in this version
- Private file storage in **Amazon S3**
- Authentication-ready flow for **Amazon Cognito**
- **Protected share links**
- A shared user must **authenticate first**
- The backend only returns a **temporary S3 pre-signed URL** after it verifies the authenticated user is allowed

## Secure share flow
1. Owner uploads a file.
2. Owner creates a share link and enters the allowed user's **Cognito sub or email**.
3. The app creates a link like `/shared/<shareId>`.
4. When the shared user opens the link, they must authenticate first.
5. The backend checks whether that Cognito identity is in the allowed list.
6. Only then does the backend generate a short-lived S3 URL.

## Current demo mode
For local testing without real Cognito:
- login with a **demo user sub**
- optional demo email
- backend accepts demo headers when Cognito is not configured

For production:
- connect the login page to **Cognito Hosted UI** or **AWS Amplify Auth**
- keep your S3 bucket private
- keep download access only through the backend

## Project Structure
```text
cloud-file-storage-app/
├── backend/
│   ├── data/
│   │   ├── metadata.json
│   │   └── shares.json
│   └── src/
├── frontend/
└── README.md
```

## Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Important backend routes
- `POST /api/files/upload-url`
- `POST /api/files/finalize-upload`
- `GET /api/files`
- `GET /api/files/download-url`
- `POST /api/files/share`
- `GET /api/files/public-share/:shareId`
- `GET /api/files/shared/:shareId/access`

## Production recommendation
Replace the manual login screen with:
- **Cognito Hosted UI**, or
- **AWS Amplify Auth**

Then map the Cognito token claims directly to:
- file owner
- allowed shared users
- access checks in the backend

## Example protected sharing test
1. Login as `user-a`
2. Upload a file
3. In the share input, enter `user-b`
4. Click **Share`
5. Open that copied link in another browser
6. Login as `user-b`
7. The file opens only after authentication and authorization
