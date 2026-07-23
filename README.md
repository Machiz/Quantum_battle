# ⚓ Quantum Battleship: Operation Collapse

> **Democratizando la Computación Cuántica a través de un Puzzle de Estrategia Single-Player.**  
> Proyecto desarrollado para la Hackathon de **Quantum Hub Perú**.

---

## 📌 1. Visión General del Proyecto

**Quantum Battleship: Operation Collapse** es un juego de rompecabezas táctico single-player que reinterpreta el clásico juego de "Hundir la Flota" (*Battleship*) bajo los principios fundamentales de la **Mecánica Cuántica** utilizando **Qiskit (Python)**.

A diferencia del Battleship tradicional donde las ubicaciones son estáticas, aquí las flotas enemigas existen en estados de **Superposición Ubicacional y Entrelazamiento Cuántico (CNOT)**. El jugador asume el rol de un Operador de Radar Cuántico cuyo objetivo es medir el espacio de probabilidades, colapsar las funciones de onda y desencadenar reacciones en cadena para alcanzar el puntaje de victoria.

---

## ⚛️ 2. Mapeo de Conceptos Cuánticos a Mecánicas de Juego

Cada concepto de física cuántica está directamente integrado en una mecánica táctica de juego:

| Concepto Cuántico | Representación Matemática | Mecánica en el Juego |
| :--- | :--- | :--- |
| **Qubit de la Flota** | $|0\rangle$ (Agua) / $|1\rangle$ (Impacto) | Cada barco enemigo está representado por un qubit cuyo estado determina su posición. |
| **Superposición Ubicacional** | $|\psi\rangle = R_y\left(\frac{\pi}{2}\right)\|0\rangle = \frac{\|0\rangle + \|1\rangle}{\sqrt{2}}$ | Cada turno, el radar escanea y presenta **2 casillas candidatas** ($50\%$ prob. cada una) unidas por la línea cian neón. |
| **Entrelazamiento CNOT** | $|\Phi^+\rangle = \frac{\|00\rangle + \|11\rangle}{\sqrt{2}}$ *(Desde Nivel 2)* | Al destruir una flota enlazada, la compuerta CNOT desencadena una **Cascada de Colapso que destruye también a su pareja parejada** de inmediato. |
| **Medición & Colapso de Onda** | Medición de 1-Shot ($P(\vert{}1\rangle) = \vert{}\alpha\vert{}^2$) | Al disparar a una casilla, fuerzas al qubit a decidirse por $|1\rangle$ (Impacto Directo) o $|0\rangle$ (Agua). |
| **Revelación por Conservación** | $P(\text{Casilla A}) + P(\text{Casilla B}) = 1.0$ | Si disparas a la casilla A y resulta en Agua ($|0\rangle$), la función de onda colapsa y **muestra la flota en la casilla B con 100% de certeza (🚢 BARCO)**. |

---

## 🕹️ 3. Reglas de Juego & Bucle de Gameplay

El juego se desarrolla turno por turno a través de una dinámica fluida de escaneo e interacción:

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│   1. ESCANEO POR TURNO  │ ──> │ 2. DISPARO / MEDICIÓN   │ ──> │ 3. COLAPSO Y CASCADA    │
│ Radar presenta 2        │     │ Medir 1 de las 2        │     │ • Acierto: +Pts & CNOT  │
│ casillas en 50% prob.   │     │ casillas sugeridas.     │     │ • Fallo: Barco Revelado │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

1. **Escaneo de 2 Casillas por Turno**:
   - En cada turno, el radar muestra en pantalla **2 casillas candidatas en superposición** (ej. `B-02` y `E-04`).
2. **Resultado de Acierto (Impacto $|1\rangle$)**:
   - La flota colapsa a destruida (💥).
   - El jugador suma sus puntos de acierto.
   - **Cascada CNOT (Nivel 2 y 3)**: Si la flota está enlazada por CNOT a otra, **su pareja es destruida instantáneamente**, otorgando puntos dobles de bonus y revelando la línea dorada CNOT `#f59e0b`.
   - El radar avanza al siguiente turno presentando **2 nuevas casillas candidatas**.
3. **Resultado de Fallo (Agua $|0\rangle$)**:
   - La casilla disparada se vuelve Agua (🌊 Agua).
   - **Colapso de Onda**: La flota se **muestra/revela automáticamente en la casilla alternativa (🚢 BARCO)** con 100% de certeza.
   - La casilla del barco revelado queda **deshabilitada/inacatable**.
   - Ocurre un **Contraataque Enemigo** (drenando puntos y coherencia).
   - El radar avanza al siguiente turno presentando **2 nuevas casillas candidatas**.

---

## 🏆 4. Niveles de Dificultad & Requisitos de Puntaje

El juego cuenta con 3 niveles de progresión acumulativa:

| Nivel | Dimensión del Tablero | Flotas Enemigas | Pares Entrelazados CNOT | Puntaje Acierto | Daño por Fallo | Puntaje Objetivo Requerido |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Nivel 1 (Novato)** | $6 \times 6$ | 5 Flotas | **0 Pares** *(Superposición Pura)* | $+200$ Pts | $-50$ Pts | **225 Puntos** |
| **Nivel 2 (Táctico)** | $8 \times 8$ | 7 Flotas | **2 Pares CNOT** | $+150$ Pts | $-60$ Pts | **450 Puntos** |
| **Nivel 3 (Comandante)** | $12 \times 12$ | 9 Flotas | **4 Pares CNOT** | $+100$ Pts | $-75$ Pts | **700 Puntos** |

> [!NOTE]
> Para avanzar al siguiente nivel, el jugador debe alcanzar o superar el Puntaje Objetivo antes de agotar la Coherencia Cuántica del radar.

---

## 🛠️ 5. Arquitectura Técnica

El proyecto utiliza un enfoque desacoplado fullstack con fallback local automático:

```
[ Frontend: React + Vite + Tailwind CSS ]
                  │
                  ▼ REST API (HTTP JSON)
[ Backend: Python FastAPI + Qiskit v2.5.0 ] ──► (Simulador Local JS en Fallback)
```

- **Frontend**: React 18, Vite, Vanilla CSS con Tailwind CSS, Lucide React Icons, Canvas Confetti.
- **Backend API**: Python 3.10, FastAPI, Uvicorn, NumPy.
- **Motor Cuántico**: **Qiskit** (Circuitos cuánticos con rotaciones $R_y(\theta)$ y compuertas entrelazantes $CX$ / CNOT).

---

## 🚀 6. Instalación & Ejecución Local

### Prerrequisitos
- Node.js (v18+)
- Python (v3.10+)

### Pasos para Ejecutar

1. **Clonar el Repositorio**:
   ```bash
   git clone https://github.com/Machiz/Quantum_battle.git
   cd Quantum_battle
   ```

2. **Instalar Dependencias del Frontend**:
   ```bash
   npm install
   ```

3. **Iniciar el Frontend (Vite Dev Server)**:
   ```bash
   npm run dev
   ```

4. **(Opcional) Iniciar el Backend Python FastAPI con Qiskit**:
   ```bash
   pip install -r backend/requirements.txt
   python -m uvicorn backend.server:app --reload --port 8000
   ```

*Nota: Si el backend Python no se inicia, la aplicación web funcionará perfectamente mediante el **Simulador Cuántico Local en JavaScript** integrando el mismo modelo de Qiskit.*

---

## 📜 7. Licencia & Créditos

Desarrollado con ⚛️ para la Hackathon **Quantum Hub Perú**.