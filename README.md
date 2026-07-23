# Quantum_battle: Operation collapse

> **Democratizando la Computación Cuántica a través de un Puzzle de Estrategia Single-Player.**
> Proyecto desarrollado para la Hackathon de **Quantum Hub Perú**.

---
## 📌 1. Visión General del Proyecto

**Quantum Battleship: Operation Collapse** es un juego interactivo de rompecabezas táctico de 1 jugador que reinterpreta el clásico juego "Hundir la Flota" (*Battleship*) bajo los principios fundamentales de la mecánica cuántica.

A diferencia del Battleship tradicional donde las posiciones son estáticas y ciertas, aquí los barcos existen en estados de **probabilidad, fase y superposición**. El jugador asume el rol de un operador de radar cuántico cuyo objetivo es manipular las probabilidades del tablero mediante compuertas lógicas y realizar mediciones certeras para descubrir la flota oculta.

---

## 💡 2. Mapeo de Conceptos Cuánticos a Mecánicas de Juego

Para hacer la teoría intuitiva y visual, cada concepto cuántico se traduce directamente a una mecánica interactiva:

| Concepto Cuántico | Traducción Visual en el Juego | Mecánica de Gameplay |
| :--- | :--- | :--- |
| **Superposición** | **Barra de Probabilidad / Opacidad** | Las casillas no son "Agua" ni "Barco", sino un $\%$ (ej. $70\%$ Barco / $30\%$ Agua). |
| **Interferencia** | **Indicador de Fase (Color)** | Usar compuertas manipula la fase (Azul $+$, Rojo $-$) para sumar o cancelar probabilidades. |
| **Entrelazamiento Parcial** | **Líneas de Neón / Brillo de Vínculo** | Medir una casilla altera la probabilidad de otra en cierto porcentaje, sin resolverla al 100%. |
| **Medición / Colapso** | **Acción de Disparo ("Medir")** | Forzar al sistema a decidirse por un estado puro ($\vert{}0\rangle$ Agua o $\vert{}1\rangle$ Barco). |

---

## 🔗 3. Entrelazamiento Parcial: Profundidad Estratégica & Realismo

En lugar de usar únicamente entrelazamiento máximo (donde medir A resuelve B de inmediato al 100%), el juego implementa **Entrelazamiento Parcial** ($\alpha\vert{}00\rangle + \beta\vert{}11\rangle$ con $\vert{}\alpha\vert{} \neq \vert{}\beta\vert{}$).

### ¿Por qué aporta al juego?
1. **Gestión de Riesgo y Toma de Decisiones:** Medir una casilla entrelazada no te regala la casilla vinculada, sino que eleva su probabilidad (ej. de $30\%$ a $85\%$). El jugador debe decidir: *¿dispara con $85\%$ de proba o usa un turno en aplicar una compuerta para acercarla al $99\%$?*
2. **Curva de Dificultad Progresiva:**
   * **Fácil / Tutorial:** Entrelazamiento Máximo (100% de correlación).
   * **Medio:** Entrelazamiento Parcial Alto (80% / 20%).
   * **Difícil:** Entrelazamiento Parcial Débil + Decoherencia (requiere combinar obligatoriamente con Interferencia).
3. **Rigor Técnico:** Modela de forma más fiel el comportamiento de los qubits en hardware real expuestos a ruido ambiental.

---

## 🎮 4. Estados de las Casillas (Qubits)

Durante la partida, cada casilla del tablero (Qubit) puede encontrarse en 4 estados claramente distinguibles:

1. **$\vert{}0\rangle$ (Agua Confirmada):** Estado puro de $0\%$. Casilla azul oscura/limpia.
2. **$\vert{}1\rangle$ (Barco Confirmado):** Estado puro de $100\%$. Muestra el icono de un barco activo.
3. **$\alpha\vert{}0\rangle + \beta\vert{}1\rangle$ (Superposición):** Casilla translúcida con barra de porcentaje dinámico.
4. **$\alpha\vert{}00\rangle + \beta\vert{}11\rangle$ (Entrelazamiento Parcial):** Casillas conectadas por brillo o líneas de neón vinculadas.

---

## 🕹️ 5. Turno de Juego (Bucle de Gameplay)

En cada turno, el jugador tiene un número limitado de **Puntos de Energía** para interactuar con la cuadrícula:

┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│   1. SUPERPOSICIÓN      │ ──> │   2. INTERFERENCIA      │ ──> │ 3. MEDICIÓN / COLAPSO   │
│ Analizar probabilidades │     │  Aplicar Compuertas     │     │ Disparar y actualizar   │
│   iniciales del mapa.   │     │ (H, X, Z) para ajustar. │     │  vínculos parciales.    │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘


### Acciones Disponibles:
* **`Acción: MEDIR` (Disparo Clásico):**
  * Colapsa la casilla seleccionada.
  * Si da **Impacto ($\vert{}1\rangle$)**, descubres la ubicación. La casilla entrelazada ajusta dinámicamente su porcentaje de probabilidad.
  * Si da **Agua ($\vert{}0\rangle$)**, el sistema recalcula y las probabilidades del resto del tablero se redistribuyen.
* **`Acción: COMPUERTA H` (Hadamard / Superposición):**
  * Redistribuye y equilibra las probabilidades en casillas con baja certeza.
* **`Acción: COMPUERTA X` (Pauli-X / Inversor NOT):**
  * Invierte el estado de probabilidad (ej. de $20\%$ de barco pasa a $80\%$).

---

## 🏗️ 6. Arquitectura Técnica & Código Qiskit

El sistema utiliza un enfoque desacoplado con backend en Python simulando los circuitos cuánticos mediante Qiskit y frontend en React.

* **Frontend:** React.js / Next.js + Tailwind CSS.
* **Backend:** Python con **FastAPI** / **Flask**.
* **Motor Cuántico:** **Qiskit** (uso de rotaciones $RY(\theta)$ + $CX$ para entrelazamiento parcial).

### Implementación en Qiskit (Backend Snippet):
```python
import numpy as np
from qiskit import QuantumCircuit

# Circuito para entrelazamiento parcial entre 2 qubits (casillas)
qc = QuantumCircuit(2)

# Rotación parametrizada theta para controlar el grado de entrelazamiento
# θ = pi/4 genera un entrelazamiento parcial (ej. ~85% / 15%)
theta = np.pi / 4  
qc.ry(theta, 0)

# Aplicar CNOT para vincular el Qubit 0 y Qubit 1
qc.cx(0, 1)