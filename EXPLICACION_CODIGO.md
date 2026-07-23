# 🌌 EXPLICACIÓN DEL CÓDIGO Y ARQUITECTURA TÉCNICA
## Quantum Battleship: Operation Collapse

> **Proyecto desarrollado para la Hackathon de Quantum Hub Perú**  
> **Backend Target:** Python 3.10.8 | **Librería Cuántica:** Qiskit 2.5.0  
> **Frontend Target:** React.js + Vite + Tailwind CSS + Lucide Icons  

---

## 📌 1. Visión General del Proyecto

**Quantum Battleship: Operation Collapse** es un puzzle táctico interactivo que traduce los principios fundamentales de la **Mecánica Cuántica** y la **Computación Cuántica** en una experiencia de juego visual e intuitiva.

A diferencia del Battleship tradicional donde la posición de cada barco es estática y binaria (o hay agua o hay barco), en este juego cada casilla del tablero se comporta como un **Qubit**, existiendo en un estado de **Superposición**, **Fase** y **Entrelazamiento Parcial**.

### ¿Qué busca el proyecto y en qué te ayudará?
1. **Desmitificar la física cuántica:** Permite comprender la superposición $\alpha|0\rangle + \beta|1\rangle$ y el colapso mediante la regla de Born sin necesidad de resolver manualmente matrices ni álgebra compleja.
2. **Aprender compuertas cuánticas en la práctica:** Experimentar en tiempo real cómo las compuertas **Hadamard ($H$)**, **Pauli-X ($X$)** y **Pauli-Z ($Z$)** alteran las amplitudes de probabilidad y fase.
3. **Entender el Entrelazamiento Parcial ($\alpha|00\rangle + \beta|11\rangle$):** En lugar de usar únicamente entrelazamiento máximo (100%), se modela entrelazamiento parcial para reflejar el comportamiento de qubits en hardware real expuestos a decoherencia y ruido ambiental, exigiendo una gestión táctica del riesgo.
4. **Garantizar rigor técnico:** Todas las probabilidades y transformaciones son calculadas en el backend por el motor **Qiskit 2.5.0** ejecutado en **Python 3.10.8**.

---

## 🏗️ 2. Arquitectura del Sistema

El sistema utiliza un diseño desacoplado **Cliente-Servidor (REST API)**:

```
┌────────────────────────────────────────────────────────┐
│             FRONTEND (React + Vite + Tailwind)         │
│  - Landing Page explicativa con Laboratorio Interactivo│
│  - HUD Táctico idéntico al diseño del Concept Image    │
│  - Visualizador SVG de arcos de Entrelazamiento        │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST / GET
                           ▼
┌────────────────────────────────────────────────────────┐
│             BACKEND REST API (FastAPI)                 │
│  - Endpoints: /api/game/new, /apply_gate, /measure     │
└──────────────────────────┬─────────────────────────────┘
                           │ Circuit Operations
                           ▼
┌────────────────────────────────────────────────────────┐
│             MOTOR CUÁNTICO (Qiskit 2.5.0)              │
│  - QuantumCircuit(n) & Statevector                     │
│  - Rotaciones RY(θ) + CNOT (CX) para Entrelazamiento   │
│  - Matriz de Amplitudes α y β & Regla de Born          │
└────────────────────────────────────────────────────────┘
```

---

## ⚛️ 3. Explicación Detallada del Motor Cuántico (`backend/quantum_engine.py`)

### A. Representación de Qubits y Vectores de Estado
Cada celda del tablero $(r, c)$ se inicializa con un vector de estado de 1 qubit o sub-circuito en Qiskit:

$$|\psi\rangle = \alpha |0\rangle + \beta |1\rangle$$

donde:
* $|0\rangle$ representa **Agua Confirmada** ($P(|0\rangle) = |\alpha|^2$).
* $|1\rangle$ representa **Nave Confirmada** ($P(|1\rangle) = |\beta|^2$).
* Cumpliéndose la condición de normalización: $|\alpha|^2 + |\beta|^2 = 1$.

#### Código Qiskit para Inicialización:
```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Crear circuito cuántico de 1 Qubit
qc = QuantumCircuit(1)

# Aplicar rotación parametrizada RY(theta)
# theta controla la amplitud inicial según si es casilla objetivo o no
theta = 0.7 * np.pi  
qc.ry(theta, 0)

# Calcular Vector de Estado de Qiskit
sv = Statevector.from_instruction(qc)
amp_0 = sv.data[0] # Amplitud α (|0⟩ Agua)
amp_1 = sv.data[1] # Amplitud β (|1⟩ Nave)

prob_water = float(abs(amp_0)**2)
prob_ship = float(abs(amp_1)**2)
```

---

### B. Entrelazamiento Parcial ($\alpha|00\rangle + \beta|11\rangle$)
Para vincular dos celdas (ej. `E-02` y `E-05`), se construye un circuito Qiskit de 2 qubits aplicando una rotación $RY(\theta)$ seguida de una compuerta $CX$ (Controlled-NOT / CNOT):

```python
# Circuito de 2 Qubits para Entrelazamiento Parcial
qc_entangled = QuantumCircuit(2)

# Rotación para controlar la correlación parcial (ej. ~78% / 22%)
theta_entangle = np.pi / 3  
qc_entangled.ry(theta_entangle, 0)

# Aplicar CNOT (vincular Qubit 0 como control y Qubit 1 como objetivo)
qc_entangled.cx(0, 1)

# Vector de Estado conjunto de 2 Qubits
sv_joint = Statevector.from_instruction(qc_entangled)
```

---

### C. Aplicación de Compuertas Lógicas Cuánticas

Durante el turno de juego, el operador puede aplicar compuertas cuánticas consumiendo **Puntos de Energía (GW)**:

1. **Compuerta Hadamard ($H$) [-20 GW]:**
   $$H = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$
   Equilibra y redistribuye las probabilidades de la casilla seleccionada. Si la casilla estaba en $|0\rangle$, pasa a $\frac{|0\rangle + |1\rangle}{\sqrt{2}}$ ($50\%$ probabilidad).

   ```python
   qc.h(0)
   ```

2. **Compuerta Pauli-X (NOT Inversor) [-10 GW]:**
   $$X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$$
   Invierte los estados de la celda. Por ejemplo, una probabilidad de $20\%$ de barco se invierte a $80\%$.

   ```python
   qc.x(0)
   ```

3. **Compuerta Pauli-Z (Fase) [-15 GW]:**
   $$Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$$
   Invierte la fase relativa del componente $|1\rangle$ ($\phi \to \phi + 180^\circ$), permitiendo fenómenos de **interferencia cuántica** constructiva o destructiva al combinarse con Hadamard.

   ```python
   qc.z(0)
   ```

---

### D. Medición y Colapso (Acción `MEDIR`)

Cuando el jugador presiona `MEDIR`, se realiza la proyección del estado cuántico según la **Regla de Born**:

1. Se genera un número pseudoaleatorio $r \in [0, 1)$.
2. Si $r \le P(|1\rangle) = |\beta|^2$, el qubit colapsa a estado puro $|1\rangle$ (**¡Nave Detectada / Impacto!**).
3. Si $r > P(|1\rangle)$, el qubit colapsa a estado puro $|0\rangle$ (**Agua Confirmada**).
4. **Propagación del Colapso:** Si la celda medida poseía un entrelazamiento con otra celda $B$, el colapso de $A$ altera dinámicamente el vector de estado de $B$ (ej. si $A = |1\rangle$, $P(B)$ sube de $30\%$ a $85\%$).

---

## 🎨 4. Paleta de Colores y Diseño UI (Basado en `game_interphase concept.png`)

Tanto la **Landing Page** como el **Centro de Comando (Juego)** comparten una paleta de colores coherente inspirada en monitores de radar militar cuántico y HUDs sci-fi:

* **Fondo Oscuro Obsidiana / Slate:** `#070a0f` / `#0a0e17` / `#0d121c`
* **Cyan Eléctrico (Superposición / Fase Positiva / Acciones):** `#00e5ff` / `#00b8d4` (Glow: `rgba(0, 229, 255, 0.4)`)
* **Carmesí / Coral (Impactos / Barco Confirmado |1⟩ / Danger):** `#ff3b5c` / `#ff2a4b`
* **Púrpura Neón (Entrelazamiento Parcial Ψ / Vínculos):** `#a855f7` / `#c084fc`
* **Ámbar Cuántico (Fase Z / Warnings):** `#f59e0b`
* **Tipografías:** `Share Tech Mono`, `JetBrains Mono`, `Orbitron` e `Inter`.

---

## 🚀 5. Instrucciones de Instalación y Ejecución

### Requisitos Previos
* **Python:** versión 3.10.8 o superior (3.10.x compatible).
* **Node.js:** versión 18+ / 20+ / 22+.

### 1. Iniciar el Backend Python con Qiskit
```bash
# Navegar a la carpeta del proyecto
cd C:\Users\marce\Quantum_battle

# Instalar librerías de Python requeridas
pip install qiskit fastapi uvicorn pydantic numpy

# Ejecutar el servidor backend
python run_backend.py
```
* El servidor FastAPI se iniciará en `http://localhost:8000`.
* La documentación interactiva de Swagger estará disponible en `http://localhost:8000/docs`.

### 2. Iniciar el Frontend Web
```bash
# En una segunda terminal
cd C:\Users\marce\Quantum_battle

# Instalar paquetes npm
npm install

# Iniciar servidor de desarrollo Vite
npm run dev
```
* Abre tu navegador en `http://localhost:3000`.

---

## 📁 6. Estructura de Archivos del Proyecto

```
Quantum_battle/
├── backend/
│   ├── quantum_engine.py   # Motor cuántico con Qiskit (Statevectors, RY, CX, Gates, Born rule)
│   ├── server.py           # API REST con FastAPI y endpoints CORS
│   └── requirements.txt    # Dependencias de Python (qiskit, fastapi, uvicorn)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navegador superior con indicador de estado Qiskit
│   │   ├── LandingPage.jsx     # Landing explicativa con Laboratorio Interactivo
│   │   ├── QuantumGameHud.jsx  # HUD del juego (réplica exacta de concept image)
│   │   └── CodeDocModal.jsx    # Visor de documentación en el juego
│   ├── services/
│   │   └── qiskitApi.js        # Cliente API HTTP y simulador local cliente fallback
│   ├── App.jsx                 # Contenedor principal de pestañas
│   ├── main.jsx                # Punto de entrada React
│   └── index.css               # Estilos globales HUD, bordes neon, animaciones radar
├── run_backend.py              # Script principal para lanzar el servidor backend
├── index.html                  # HTML5 con meta etiquetas SEO y Google Fonts
├── vite.config.js              # Configuración de Vite con Proxy API a localhost:8000
├── package.json                # Configuración de scripts y dependencias npm
└── EXPLICACION_CODIGO.md       # Documentación completa del proyecto
```

---

## 🏆 Créditos
Proyecto desarrollado para la **Hackathon de Quantum Hub Perú** por el equipo de desarrollo.  
Democratizando la computación cuántica a través del juego interactivo.
