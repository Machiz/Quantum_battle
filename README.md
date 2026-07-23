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
| **Entrelazamiento** | **Líneas de Neón / Brillo Vinculado** | Dos o más casillas comparten un vínculo. Revelar una colapsa automáticamente la otra. |
| **Medición / Colapso** | **Acción de Disparo ("Medir")** | Forzar al sistema a decidirse por un estado puro ($\vert{}0\rangle$ Agua o $\vert{}1\rangle$ Barco). |

---

## 🎮 3. Estados de las Casillas (Qubits)

Durante la partida, cada casilla del tablero (Qubit) puede encontrarse en 4 estados claramente distinguibles:

1. **$\vert{}0\rangle$ (Agua Confirmada):** Estado puro de $0\%$. Casilla azul oscura/limpia.
2. **$\vert{}1\rangle$ (Barco Confirmado):** Estado puro de $100\%$. Muestra el icono de un barco activo.
3. **$\alpha\vert{}0\rangle + \beta\vert{}1\rangle$ (Superposición):** Casilla translúcida con barra de porcentaje dinámico.
4. **$\frac{\vert{}00\rangle + \vert{}11\rangle}{\sqrt{2}}$ (Entrelazamiento activo):** Conexión visual directa con otra casilla del tablero.

---

## 🕹️ 4. Turno de Juego (Bucle de Gameplay)

En cada turno, el jugador tiene un número limitado de **Puntos de Energía** para interactuar con la cuadrícula:
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│   1. SUPERPOSICIÓN      │ ──> │   2. INTERFERENCIA      │ ──> │   3. MEDICIÓN / COLAPSO │
│ Analizar probabilidades │     │  Aplicar Compuertas     │     │ Disparar y resolver     │
│   iniciales del mapa.   │     │ (H, X, Z) para ajustar. │     │   casillas vinculadas.  │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
### Acciones Disponibles:
* **`Acción: MEDIR` (Disparo Clásico):**
  * Colapsa la casilla seleccionada.
  * Si da **Impacto ($\vert{}1\rangle$)**, ganas puntos y descubres la ubicación.
  * Si da **Agua ($\vert{}0\rangle$)**, el sistema recalcula y las probabilidades de las casillas restantes **aumentan** en tiempo real.
* **`Acción: COMPUERTA H` (Hadamard / Superposición):**
  * Redistribuye y equilibra las probabilidades en casillas con baja certeza.
* **`Acción: COMPUERTA X` (Pauli-X / Inversor NOT):**
  * Invierte el estado de probabilidad (ej. de $20\%$ de barco pasa a $80\%$).

---

## 🏗️ 5. Arquitectura Técnica Sugerida

El sistema utiliza un enfoque desacoplado donde la lógica cuántica pura se ejecuta simulada en backend Python y la experiencia visual responde en tiempo real en React.

* **Frontend:** React.js / Next.js + Tailwind CSS (UI Reactiva con gráficos en Chart.js / Canvas).
* **Backend:** Python con **FastAPI** o **Flask**.
* **Motor Cuántico:** **Qiskit** o **Cirq** ejecutado localmente mediante simulación de `Statevector` / `AerSampler`.

### Flujo de Datos (API Endpoint Example):
1. **Frontend Request:** `POST /api/apply-gate { casilla: "A1", gate: "X" }`
2. **Backend Processing (Qiskit):**
   ```python
   qc.x(0) # Aplica Pauli-X al qubit de la casilla A1
   new_statevector = Statevector.from_instruction(qc)