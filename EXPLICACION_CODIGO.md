# 🌌 EXPLICACIÓN DEL CÓDIGO Y ARQUITECTURA TÉCNICA (v_final.md)
## Batalla Naval Cuántica: Operation Collapse

> **Proyecto desarrollado para la Hackathon de Quantum Hub Perú**  
> **Backend Target:** Python 3.10.8 | **Librería Cuántica:** Qiskit 2.5.0  
> **Frontend Target:** React.js + Vite + Tailwind CSS + Lucide Icons  

---

## 📌 1. Visión General y Paradigma Cuántico (`v_final.md`)

**Batalla Naval Cuántica** es un juego interactivo de estrategia y divulgación científica diseñado para enseñar los principios fundamentales de la computación cuántica —**Superposición**, **Entrelazamiento** y **Colapso del Estado**— a través de mecánicas de juego sobre un tablero de $N \times N$.

### Paradigma del Juego:
1. **El Qubit representa el Estado de la Flota**, no una casilla individual.
2. **El Disparo representa una Medición**, forzando al sistema a colapsar.
3. **El Tablero es el Espacio de Probabilidades**, donde se visualizan las ubicaciones potenciales.

---

## ⚛️ 2. Estados de una Flota (Circuito Qiskit)

Cada flota $i$ se modela mediante un qubit cuya probabilidad de estar a salvo ($|0\rangle$) o destruida ($|1\rangle$) evoluciona a lo largo de la partida:

1. **Estado Oculto / Intacto ($|0\rangle$):**
   * La flota está sana y fuera de peligro.
   * Probabilidad de colapsar a Hundida al ser atacada: $0\%$.

2. **Estado en Superposición Ubicacional ($\frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle$):**
   * La flota no está en un lugar fijo; existe simultáneamente entre **dos casillas** reveladas por el radar (ej. $A_3$ y $D_5$).
   * Probabilidad de colapsar a Hundida al ser atacada: $50\%$.
   * Circuito Qiskit: `qc.ry(np.pi / 2, 0)`

3. **Estado Herida / Rotada ($R_y(\theta)$):**
   * La flota ha sufrido una degradación en su función de onda debido al **entrelazamiento (CNOT)** con otra flota destruida. Permanece oculta en el mapa, pero su probabilidad de caer sube al $75\%-80\%$.
   * Circuito Qiskit: `qc.ry(0.72 * np.pi, 0)`

4. **Estado Derribado / Hundido ($|1\rangle$):**
   * Resultado definitivo tras una medición exitosa (|1⟩). La flota colapsó y queda eliminada del juego.

---

## 🏗️ 3. Mecánicas de Juego (Game Loop)

### Fase 1: Detección y Superposición
El radar detecta una flota en superposición indicando dos casillas candidatas (ej. $A_3$ y $D_5$).

### Fase 2: Acción del Jugador (Disparo / Medición)
El jugador selecciona una casilla para atacar (ej. $A_3$). Se ejecuta un disparo que corresponde a una **medición de 1 shot** en Qiskit.

### Fase 3: Resolución del Impacto
* **Caso 1: Fallo (Agua $|0\rangle$)**
  * La medición arroja $|0\rangle$. El disparo en $A_3$ cae al agua.
  * **Efecto de Colapso:** Al fallar en $A_3$, la función de onda colapsa y la flota es **revelada automáticamente en la casilla alternativa ($D_5$)** con $100\%$ de certeza.
* **Caso 2: Acierto Directo (Impacto $|1\rangle$)**
  * La medición arroja $|1\rangle$. El disparo impacta la flota en $A_3$ y esta colapsa a estado **Derribado**.

### Fase 4: Propagación por Entrelazamiento (CNOT)
Si la flota destruida estaba entrelazada mediante una compuerta CNOT con la Flota B:
1. La Flota B **no se revela** en el mapa.
2. El colapso activa una **rotación condicional ($R_y$)** en el qubit de la Flota B.
3. La Flota B entra en estado **Herida** (probabilidad de ser destruida sube al $78\%$).

---

## 💻 4. Ejemplo de Código Qiskit (`backend/quantum_engine.py`)

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Qubit de la Flota en Superposición (50% hit prob)
qc = QuantumCircuit(1)
theta = np.pi / 2
qc.ry(theta, 0)

sv = Statevector.from_instruction(qc)
prob_hit = float(abs(sv.data[1])**2) # 0.50

# Rotación de fase por Entrelazamiento (CNOT -> Flota Herida)
qc_partner = QuantumCircuit(1)
new_theta = 0.72 * np.pi
qc_partner.ry(new_theta, 0)
sv_partner = Statevector.from_instruction(qc_partner)
prob_wounded = float(abs(sv_partner.data[1])**2) # ~0.78
```
