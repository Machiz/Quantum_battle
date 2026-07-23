import sys
import os
import qiskit
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from quantum_engine import QiskitBattleEngine

app = FastAPI(
    title="Quantum Battleship Qiskit API",
    description="Backend Python 3.10 + Qiskit 2.5.0 para Batalla Naval Cuántica (v_final.md)",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instancia global del motor cuántico (Nivel 1 por defecto)
game_engine = QiskitBattleEngine(level=1)

class MeasureRequest(BaseModel):
    cell_id: str

class NewGameRequest(BaseModel):
    level: str = "1"

@app.get("/")
def read_root():
    return {
        "status": "online",
        "game": "Batalla Naval Cuántica",
        "python_version": sys.version.split()[0],
        "qiskit_version": qiskit.__version__,
        "engine": "Qiskit Fleet-Qubit Engine (v_final.md)"
    }

@app.get("/api/status")
def get_status():
    return {
        "ok": True,
        "qiskit_version": qiskit.__version__,
        "python": sys.version.split()[0]
    }

@app.post("/api/game/new")
def new_game(req: NewGameRequest):
    global game_engine
    game_engine = QiskitBattleEngine(level=req.level)
    state = game_engine.get_full_state()
    return {"success": True, "state": state}

@app.get("/api/game/state")
def get_game_state():
    return game_engine.get_full_state()

@app.post("/api/game/measure")
def measure(req: MeasureRequest):
    res = game_engine.measure_cell(req.cell_id)
    if not res.get('success'):
        raise HTTPException(status_code=400, detail=res.get('message'))
    return res

@app.post("/api/game/enemy_attack")
def enemy_attack():
    res = game_engine.simulate_enemy_attack()
    if not res.get('success'):
        raise HTTPException(status_code=400, detail=res.get('message'))
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
