# Fish Freshness Backend (Node.js + Express + MongoDB)

Implements the API described in the TNova Solutions project guide, using
Node.js/Express/MongoDB instead of the guide's FastAPI/PostgreSQL stack.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your local MongoDB or a MongoDB Atlas connection string
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The server starts on `http://localhost:5000` by default and creates a default
admin account on first boot (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`).
**Change that password after your first admin login.**

## Endpoints

| Method | Endpoint              | Auth  | Purpose                                   |
|--------|------------------------|-------|--------------------------------------------|
| POST   | /auth/signup           | None  | Register a user, returns JWT               |
| POST   | /auth/login            | None  | Log in, returns JWT                        |
| POST   | /predict               | JWT   | Upload a fish photo, get freshness result  |
| GET    | /history               | JWT   | Get the logged-in user's past predictions  |
| POST   | /admin/images          | Admin | Upload a labelled training photo           |
| GET    | /admin/images          | Admin | Browse dataset (filter by species/class)   |
| PATCH  | /admin/images/:id      | Admin | Approve/reject a dataset image             |
| GET    | /admin/stats           | Admin | Dashboard counts                           |
| GET    | /admin/users           | Admin | List users + their prediction counts       |
| PATCH  | /admin/users/:id       | Admin | Flag/unflag a user                         |

Uploaded images are saved to `backend/uploads/` and served at
`/uploads/<filename>`. Swap this for Cloudinary/S3 later if you want
cloud storage, per the guide's Phase 2 plan.

## About the ML prediction

`utils/mlPredict.js` currently runs a **transparent heuristic placeholder**
based on image colour/contrast (not the trained CNN described in the guide,
since that model only exists after Phases 1–3 of data collection and
training are complete). The file has detailed comments on exactly how to
swap in the real TensorFlow Lite model once it's trained — either via a
small Python inference microservice, or natively in Node with
`onnxruntime-node` / `@tensorflow/tfjs-node`.
