# ⚓ Documentación del Concepto: Batalla Naval Cuántica

## 1. Introducción y Propósito
**Batalla Naval Cuántica** es un juego interactivo de estrategia y divulgación científica diseñado para enseñar los principios fundamentales de la computación cuántica —**Superposición**, **Entrelazamiento** y **Colapso del Estado**— a través de mecánicas de juego intuitivas sobre un tablero de $N \times N$.

---

## 2. Paradigma Cuántico del Juego

Para garantizar una implementación fluida y pedagógica, la abstracción cuántica se define de la siguiente manera:

* **El Qubit representa el Estado de la Flota**, no una casilla del tablero.
* **El Disparo representa una Medición**, forzando al sistema a colapsar.
* **El Tablero es el Espacio de Probabilidades**, donde se visualizan las ubicaciones potenciales.

---

## 3. Estados de una Flota

Cada flota $i$ se modela mediante un qubit cuya probabilidad de estar a salvo ($|0\rangle$) o destruida ($|1\rangle$) evoluciona a lo largo de la partida:

1. **Estado Oculto / Intacto ($|0\rangle$):**
   * **Descripción:** La flota está completamente sana y fuera de peligro.
   * **Probabilidad de colapsar a Hundida al ser atacada:** $0\%$.

2. **Estado en Superposición Ubicacional ($\frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle$):**
   * **Descripción:** La flota no está en un lugar fijo; existe simultáneamente entre **dos casillas** reveladas por el radar (ej. Casilla A y Casilla B).
   * **Probabilidad de colapsar a Hundida al ser atacada:** $50\%$.

3. **Estado Herida / Rotada ($R_y(\theta)$):**
   * **Descripción:** La flota ha sufrido una degradación en su función de onda debido al **entrelazamiento** con otra flota que fue atacada con éxito. Permanece oculta en el mapa, pero su resistencia matemática disminuyó.
   * **Probabilidad de colapsar a Hundida al ser atacada:** Mayor al $50\%$ (ej. $75\%$ u $80\%$, dependiendo del ángulo de rotación $\theta$).

4. **Estado Derribado / Hundido ($|1\rangle$):**
   * **Descripción:** Resultado definitivo tras una medición exitosa. La flota colapsó y queda eliminada del juego.
   * **Probabilidad:** $100\%$ destruida.

---

## 4. Mecánicas de Juego (Game Loop)

### Fase 1: Detección y Superposición
1. El radar del juego detecta una flota en el tablero.
2. Al estar en **superposición**, el juego le revela al jugador **dos casillas posibles** donde podría colapsar la flota (ej. $A_3$ y $D_5$).

### Fase 2: Acción del Jugador (El Disparo / Medición)
1. El jugador selecciona una de las dos casillas para atacar (ej. elige $A_3$).
2. El sistema ejecuta el circuito cuántico equivalente haciendo **una medición de 1 shot**.

### Fase 3: Resolución del Impacto

* **Caso 1: Fallo (Agua)**
  * La medición arroja $|0\rangle$. El disparo en $A_3$ cae al agua.
  * **Efecto de Colapso:** Al fallar en $A_3$, la función de onda colapsa y la flota es **revelada automáticamente en la casilla alternativa ($D_5$)** con $100\%$ de certeza.
  * **Consecuencia:** El jugador pierde puntos (o sufre un contraataque) por haber fallado el tiro.

* **Caso 2: Acierto Directo (Impacto)**
  * La medición arroja $|1\rangle$. El disparo impacta la flota en $A_3$ y esta colapsa a estado **Derribado**.
  * **Efecto:** El jugador gana puntos/nota por el impacto efectivo.

### Fase 4: Propagación por Entrelazamiento
Si la flota destruida en el *Caso 2* estaba **entrelazada mediante una compuerta CNOT** con una segunda flota (Flota B):

1. La Flota B **NO se revela** en el mapa (sigue oculta para mantener la estrategia).
2. El impacto de la Flota A activa una **rotación condicional ($R_y$)** en el qubit de la Flota B.
3. La Flota B entra en estado **Herida**: su probabilidad de ser destruida en futuros turnos aumenta drásticamente.

---

## 5. Resumen de la Lógica Cuántica vs. Mecánica de Juego

| Concepto Cuántico | Expresión en el Juego |
| :--- | :--- |
| **Qubit** | Salud y estado de supervivencia de la Flota. |
| **Superposición ($H$)** | Radar mostrando 2 ubicaciones posibles (50/50). |
| **Medición** | El acto de disparar a una casilla. |
| **Colapso de Onda** | Si fallas en la casilla 1, la flota aparece confirmada en la casilla 2. |
| **Entrelazamiento (CNOT)** | Vínculo entre dos flotas. |
| **Rotación de Fase ($R_y$)** | La Flota B queda "Herida" automáticamente cuando la Flota A es destruida. |

---

## 6. Condiciones de Victoria y Puntuación
* **Victoria:** Hacer colapsar todas las flotas enemigas al estado $|1\rangle$ (Derribado).
* **Sistema de Puntuación:**
  * **+ Puntos:** Aciertos directos al medir/disparar.
  * **- Puntos:** Fallos que provoquen contraataques o revelaciones de colapso no aprovechadas.
  * **Bonus:** Descubrir y rematar flotas "Heridas" en el menor número de turnos.