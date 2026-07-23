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
    description="Backend en Python 3.10 con Qiskit para simular computación cuántica en Quantum Battleship: Operation Collapse",
    version="1.0.0"
)

# Habilitar CORS para peticiones desde el Frontend Vite/React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instancia global del motor cuántico
game_engine = QiskitBattleEngine(level=2)

class GateRequest(BaseModel):
    cell_id: str
    gate_type: str  # 'H', 'X', 'Z'

class MeasureRequest(BaseModel):
    cell_id: str

class NewGameRequest(BaseModel):
    level: str = "medium"

@app.get("/")
def read_root():
    return {
        "status": "online",
        "game": "Quantum Battleship: Operation Collapse",
        "python_version": sys.version,
        "qiskit_version": qiskit.__version__,
        "backend": "Qiskit Statevector & Partial Entanglement Engine"
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

@app.post("/api/game/apply_gate")
def apply_gate(req: GateRequest):
    res = game_engine.apply_gate(req.cell_id, req.gate_type)
    if not res.get('success'):
        raise HTTPException(status_code=400, detail=res.get('message'))
    return res

@app.post("/api/game/measure")
def measure(req: MeasureRequest):
    res = game_engine.measure_cell(req.cell_id)
    if not res.get('success'):
        raise HTTPException(status_code=400, detail=res.get('message'))
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
