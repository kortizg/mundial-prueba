import { useState } from "react";
import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  getDocs
} from "firebase/firestore";
import { matches } from "./data/matches";

function App() {
  const [user, setUser] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  // 🔐 LOGIN
  const login = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error(error);
    }
  };

  // 🧠 actualizar pronósticos
  const updatePrediction = (matchId, team, value) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value
      }
    }));
  };

  // 💾 guardar en Firebase
  const savePredictions = async () => {
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName,
          email: user.email,
          predictions
        },
        { merge: true }
      );

      alert("Pronósticos guardados correctamente");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // 👑 detectar admin
  const isAdmin = user?.email === "kevin.ortiz.st@gmail.com";

  // 📊 cargar todos los usuarios
  const loadAllPredictions = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));

      const users = [];

      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setAllUsers(users);

    } catch (error) {
      console.error(error);
    }
  };

  const exportBackup = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));

      const users = [];

      snapshot.forEach((doc) => {
        users.push({
          uid: doc.id,
          ...doc.data(),
        });
      });

      const blob = new Blob(
        [JSON.stringify(users, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "firebase-users-backup.json";
      a.click();

      URL.revokeObjectURL(url);

      alert("Respaldo descargado");
    } catch (error) {
      console.error(error);
      alert("Error al exportar");
    }
  };

  // 🔒 LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>⚽ Polla Mundial 2026</h1>

        <button onClick={login}>
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1000px",
        margin: "0 auto"
      }}
    >
      <h1>⚽ Polla Mundial 2026</h1>

      <h2>Bienvenido {user.displayName}</h2>
      <p>{user.email}</p>

      {/* 👑 ADMIN PANEL */}
      {isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={loadAllPredictions}
            style={{
              padding: "10px 20px",
              background: "#222",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Ver todos los pronósticos
          </button>

          <button
            onClick={exportBackup}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Descargar respaldo
          </button>

          {/* LISTA ADMIN */}
          <div style={{ marginTop: "20px" }}>
            {allUsers.map((u) => (
              <div
                key={u.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "10px"
                }}
              >
                <h3>{u.name}</h3>
                <p>{u.email}</p>

                {u.predictions &&
                  Object.entries(u.predictions).map(
                    ([matchId, p]) => (
                      <div key={matchId}>
                        Partido {matchId}: {p.home} - {p.away}
                      </div>
                    )
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      <hr />

      {/* MATCHES */}
      {matches.map((match) => (
        <div
          key={match.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "15px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px"
            }}
          >
            {/* LOCAL */}
            <div style={{ textAlign: "center", width: "220px" }}>
              <img
                src={`https://flagcdn.com/w40/${match.homeCode}.png`}
                alt={match.home}
              />
              <div style={{ fontWeight: "bold", marginTop: "5px" }}>
                {match.home}
              </div>
            </div>

            {/* RESULTADO */}
            <div>
              <input
                type="number"
                min="0"
                value={predictions[match.id]?.home ?? ""}
                onChange={(e) =>
                  updatePrediction(
                    match.id,
                    "home",
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                  )
                }
                style={{
                  width: "60px",
                  textAlign: "center",
                  fontSize: "18px"
                }}
              />

              <span style={{ margin: "0 10px" }}>-</span>

              <input
                type="number"
                min="0"
                value={predictions[match.id]?.away ?? ""}
                onChange={(e) =>
                  updatePrediction(
                    match.id,
                    "away",
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                  )
                }
                style={{
                  width: "60px",
                  textAlign: "center",
                  fontSize: "18px"
                }}
              />
            </div>

            {/* VISITANTE */}
            <div style={{ textAlign: "center", width: "220px" }}>
              <img
                src={`https://flagcdn.com/w40/${match.awayCode}.png`}
                alt={match.away}
              />
              <div style={{ fontWeight: "bold", marginTop: "5px" }}>
                {match.away}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "15px" }}>
            <div>📅 {match.date}</div>
            <div>🏟️ {match.stadium}</div>
          </div>
        </div>
      ))}

      {/* BOTÓN FIJO GUARDAR */}
      <button
        onClick={savePredictions}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "15px 25px",
          fontSize: "18px",
          background: "#1a73e8",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
        }}
      >
        💾 Guardar pronósticos
      </button>
    </div>
  );
}

export default App;