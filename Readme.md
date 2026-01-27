node -v
npm -v


BACKEND
cd backend
npm init -y
npm install express cors
npm install --save-dev nodemon

Editar backend/package.json:

{
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}

npm run dev


FRONTEND
en la raiz del proyecto
npm create vite@latest frontend

cd frontend
npm install
npm install react-router-dom
npm run dev