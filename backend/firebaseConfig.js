const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Archivo de credenciales de Firebase

// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Obtener una referencia a Firestore
const db = admin.firestore();

module.exports = db;