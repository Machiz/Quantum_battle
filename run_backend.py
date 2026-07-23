"""
Quantum Battleship - Backend Launcher
Ejecuta el servidor FastAPI con Qiskit en Python 3.10
"""
import sys
import os

# Agregar directorio backend al PATH de Python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import uvicorn

if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    print("==========================================================")
    print(" INICIANDO SERVIDOR CUANTICO QISKIT (FASTAPI)")
    print(f" Python: {sys.version.split()[0]}")
    print(" Puerto: http://localhost:8000")
    print(" Docs API: http://localhost:8000/docs")
    print("==========================================================")
    uvicorn.run("backend.server:app", host="127.0.0.1", port=8000, reload=True)
