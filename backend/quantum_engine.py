import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import random

class QiskitBattleEngine:
    """
    Motor Cuántico para Quantum Battleship: Operation Collapse
    Soporta 3 Niveles de Dificultad, Entrelazamiento Parcial, Compuertas H, X, Z,
    Colapso por Medición y Simulación de Ataque/Contraataque Enemigo.
    """
    def __init__(self, level=1):
        self.reset_game(level)

    def reset_game(self, level=1):
        """
        Inicializa la partida según uno de los 3 niveles configurados:
        - Nivel 1 (Novato): 6x6, Entrelazamiento Máximo (100%), 3 Barcos, 1500 GW.
        - Nivel 2 (Táctico): 8x8, Entrelazamiento Parcial (75%), 5 Barcos, 1240 GW.
        - Nivel 3 (Comandante): 8x8, Entrelazamiento Parcial Débil (50%) + Decoherencia Alta, 6 Barcos, 950 GW.
        """
        # Normalizar nivel a int (1, 2 o 3)
        if isinstance(level, str):
            if '1' in level or 'f' in level.lower() or 'easy' in level.lower():
                self.level_num = 1
            elif '3' in level or 'd' in level.lower() or 'hard' in level.lower():
                self.level_num = 3
            else:
                self.level_num = 2
        else:
            self.level_num = int(level)

        if self.level_num == 1:
            self.level_name = "Nivel 1: Novato (Superposición & Entrelazamiento Máximo)"
            self.rows = 6
            self.cols = 6
            self.num_ships = 3
            self.energy = 1500
            self.coherence = 100.0
            self.entangle_correlation = 1.0
        elif self.level_num == 3:
            self.level_name = "Nivel 3: Comandante (Interferencia & Decoherencia Alta)"
            self.rows = 8
            self.cols = 8
            self.num_ships = 6
            self.energy = 950
            self.coherence = 80.0
            self.entangle_correlation = 0.50
        else:
            self.level_num = 2
            self.level_name = "Nivel 2: Táctico (Entrelazamiento Parcial 75%)"
            self.rows = 8
            self.cols = 8
            self.num_ships = 5
            self.energy = 1240
            self.coherence = 90.0
            self.entangle_correlation = 0.75

        self.turns = 0
        self.ships_found = 0
        self.enemy_attacks_count = 0
        self.event_log = []
        self.cells = {}
        
        # Generar posiciones ocultas
        ship_positions = self._generate_ship_positions()
        
        # Inicializar celdas con vectores de estado Qiskit
        for r in range(self.rows):
            row_label = chr(65 + r)
            for c in range(self.cols):
                cell_id = f"{row_label}-{c:02d}"
                is_ship_target = cell_id in ship_positions
                
                if is_ship_target:
                    theta = random.uniform(0.6 * np.pi, 0.8 * np.pi)
                else:
                    theta = random.uniform(0.1 * np.pi, 0.35 * np.pi)
                
                qc = QuantumCircuit(1)
                qc.ry(theta, 0)
                sv = Statevector.from_instruction(qc)
                
                amp_0 = sv.data[0]
                amp_1 = sv.data[1]
                prob_water = float(abs(amp_0)**2)
                prob_ship = float(abs(amp_1)**2)
                phase_deg = float(np.angle(amp_1, deg=True))
                
                self.cells[cell_id] = {
                    'id': cell_id,
                    'row': r,
                    'col': c,
                    'is_secret_ship': is_ship_target,
                    'status': 'superposition',
                    'prob_ship': round(prob_ship, 3),
                    'prob_water': round(prob_water, 3),
                    'amp_a': round(float(abs(amp_0)), 3),
                    'amp_b': round(float(abs(amp_1)), 3),
                    'phase': round(phase_deg, 1),
                    'entangled_with': [],
                    'circuit_theta': theta
                }

        # Generar Entrelazamientos Parciales usando Qiskit RY + CX
        self.entangled_pairs = []
        self._setup_partial_entanglements(ship_positions)
        
        self.add_event(f"🎮 Sesión Iniciada - {self.level_name}. Tablero {self.rows}x{self.cols} en Qiskit.")
        return self.get_full_state()

    def _generate_ship_positions(self):
        positions = set()
        while len(positions) < self.num_ships:
            r = random.randint(0, self.rows - 1)
            c = random.randint(0, self.cols - 1)
            positions.add(f"{chr(65 + r)}-{c:02d}")
        return list(positions)

    def _setup_partial_entanglements(self, ship_positions):
        pairs_count = 2 if self.level_num == 1 else (3 if self.level_num == 2 else 4)
        available_ship_cells = list(ship_positions)
        all_cells = list(self.cells.keys())
        
        for _ in range(pairs_count):
            if not available_ship_cells:
                break
            cell1_id = available_ship_cells.pop()
            candidates = [c for c in all_cells if c != cell1_id and not self.cells[c]['entangled_with']]
            if not candidates:
                continue
            cell2_id = random.choice(candidates)
            
            qc = QuantumCircuit(2)
            theta = np.pi / 4 if self.level_num == 1 else (np.pi / 3 if self.level_num == 2 else np.pi / 2.5)
            qc.ry(theta, 0)
            qc.cx(0, 1)
            
            self.cells[cell1_id]['entangled_with'].append(cell2_id)
            self.cells[cell2_id]['entangled_with'].append(cell1_id)
            
            self.entangled_pairs.append({
                'cell_a': cell1_id,
                'cell_b': cell2_id,
                'theta': theta,
                'correlation': self.entangle_correlation
            })

    def apply_gate(self, cell_id, gate_type):
        if cell_id not in self.cells:
            return {'success': False, 'message': 'Celda inválida'}
            
        cell = self.cells[cell_id]
        if cell['status'] != 'superposition':
            return {'success': False, 'message': 'No se puede aplicar compuerta a una celda colapsada'}
            
        cost_map = {'H': 20, 'X': 10, 'Z': 15}
        cost = cost_map.get(gate_type.upper(), 15)
        
        if self.energy < cost:
            return {'success': False, 'message': 'Energía insuficiente'}
            
        self.energy -= cost
        self.turns += 1
        
        qc = QuantumCircuit(1)
        theta_current = cell['circuit_theta']
        qc.ry(theta_current, 0)
        
        g = gate_type.upper()
        if g == 'H':
            qc.h(0)
        elif g == 'X':
            qc.x(0)
        elif g == 'Z':
            qc.z(0)

        sv = Statevector.from_instruction(qc)
        amp_0 = sv.data[0]
        amp_1 = sv.data[1]
        
        prob_water = float(abs(amp_0)**2)
        prob_ship = float(abs(amp_1)**2)
        phase_deg = float(np.angle(amp_1, deg=True))
        
        cell['prob_water'] = round(prob_water, 3)
        cell['prob_ship'] = round(prob_ship, 3)
        cell['amp_a'] = round(float(abs(amp_0)), 3)
        cell['amp_b'] = round(float(abs(amp_1)), 3)
        cell['phase'] = round(phase_deg, 1)
        cell['circuit_theta'] = 2 * np.arccos(clamp(abs(amp_0), 0, 1))

        self.add_event(f"Compuerta {g} aplicada en {cell_id}. P(Nave): {int(prob_ship * 100)}%. [-{cost} GW]")
        
        if cell['entangled_with'] and g in ['H', 'Z']:
            for partner_id in cell['entangled_with']:
                partner = self.cells[partner_id]
                if partner['status'] == 'superposition':
                    delta = (0.15 if g == 'H' else -0.10) * self.entangle_correlation
                    new_p_ship = clamp(partner['prob_ship'] + delta, 0.05, 0.95)
                    partner['prob_ship'] = round(new_p_ship, 3)
                    partner['prob_water'] = round(1.0 - new_p_ship, 3)
                    partner['amp_b'] = round(np.sqrt(new_p_ship), 3)
                    partner['amp_a'] = round(np.sqrt(1.0 - new_p_ship), 3)
                    self.add_event(f"⚡ Interferencia cuántica propagada a celda entrelazada {partner_id}.")

        return {'success': True, 'state': self.get_full_state()}

    def measure_cell(self, cell_id):
        if cell_id not in self.cells:
            return {'success': False, 'message': 'Celda no existe'}
            
        cell = self.cells[cell_id]
        if cell['status'] != 'superposition':
            return {'success': False, 'message': 'La celda ya está colapsada'}
            
        self.turns += 1
        p_ship = cell['prob_ship']
        roll = random.random()
        
        if cell['is_secret_ship']:
            is_hit = roll <= max(p_ship, 0.45)
        else:
            is_hit = roll <= (p_ship * 0.35)

        if is_hit:
            cell['status'] = 'ship'
            cell['prob_ship'] = 1.0
            cell['prob_water'] = 0.0
            cell['amp_a'] = 0.0
            cell['amp_b'] = 1.0
            self.ships_found += 1
            self.add_event(f"💥 ¡NAVE DETECTADA en {cell_id}! Colapso a |1⟩.")
        else:
            cell['status'] = 'water'
            cell['prob_ship'] = 0.0
            cell['prob_water'] = 1.0
            cell['amp_a'] = 1.0
            cell['amp_b'] = 0.0
            self.add_event(f"🌊 Agua confirmada en {cell_id}. Colapso a |0⟩.")

        # Propagación en celdas entrelazadas
        if cell['entangled_with']:
            for partner_id in cell['entangled_with']:
                partner = self.cells[partner_id]
                if partner['status'] == 'superposition':
                    factor = 0.45 if self.level_num == 1 else (0.35 if self.level_num == 2 else 0.20)
                    if is_hit:
                        new_p = clamp(partner['prob_ship'] + factor, 0.10, 0.98 if self.level_num == 1 else 0.90)
                    else:
                        new_p = clamp(partner['prob_ship'] - factor, 0.02, 0.80)
                    partner['prob_ship'] = round(new_p, 3)
                    partner['prob_water'] = round(1.0 - new_p, 3)
                    partner['amp_b'] = round(np.sqrt(new_p), 3)
                    partner['amp_a'] = round(np.sqrt(1.0 - new_p), 3)
                    self.add_event(f"⚡ Reacción por Entrelazamiento: P(Nave) en {partner_id} ajustada a {int(new_p*100)}%.")

        self.coherence = max(10.0, round(self.coherence - random.uniform(1.2, 3.5), 1))
        return {'success': True, 'is_hit': is_hit, 'state': self.get_full_state()}

    def simulate_enemy_attack(self):
        """
        SIMULAR ATAQUE / CONTRAATAQUE ENEMIGO:
        El radar cuántico enemigo dispara un pulso de interferencia contra el sector.
        - Selecciona 1 o 2 celdas en superposición al azar.
        - Aplica perturbación de fase o invierte probabilidades.
        - Reduce la Coherencia Cuántica del jugador (-5% a -8%) y drena energía (-40 GW).
        """
        self.enemy_attacks_count += 1
        self.turns += 1
        
        active_cells = [c for c in self.cells.values() if c['status'] == 'superposition']
        if not active_cells:
            return {'success': False, 'message': 'No hay celdas en superposición para atacar'}

        target_cell = random.choice(active_cells)
        target_id = target_cell['id']

        # Perturbación de estado en Qiskit: Rotación de ruido de fase pi/3
        qc = QuantumCircuit(1)
        qc.ry(target_cell['circuit_theta'], 0)
        qc.rz(np.pi / 3, 0) # Ruido de fase por ataque enemigo
        
        sv = Statevector.from_instruction(qc)
        amp_0 = sv.data[0]
        amp_1 = sv.data[1]
        
        # Inversión parcial o fluctuación de probabilidad por el ataque
        delta = random.choice([-0.20, 0.25, -0.15])
        new_p_ship = clamp(target_cell['prob_ship'] + delta, 0.05, 0.92)
        
        target_cell['prob_ship'] = round(new_p_ship, 3)
        target_cell['prob_water'] = round(1.0 - new_p_ship, 3)
        target_cell['amp_b'] = round(np.sqrt(new_p_ship), 3)
        target_cell['amp_a'] = round(np.sqrt(1.0 - new_p_ship), 3)
        target_cell['phase'] = round(float(np.angle(amp_1, deg=True)), 1)

        # Impacto en coherencia y energía
        coherence_loss = round(random.uniform(4.5, 8.0), 1)
        self.coherence = max(5.0, round(self.coherence - coherence_loss, 1))
        self.energy = max(0, self.energy - 40)

        self.add_event(f"⚠️ ATAQUE ENEMIGO: Pulso de Interferencia en sector {target_id}. Fase alterada! [-{coherence_loss}% Coherencia]")
        
        return {
            'success': True, 
            'attacked_cell_id': target_id, 
            'coherence_loss': coherence_loss, 
            'state': self.get_full_state()
        }

    def add_event(self, text):
        import datetime
        now_str = datetime.datetime.now().strftime("%H:%M:%S")
        self.event_log.insert(0, {'time': now_str, 'text': text})
        if len(self.event_log) > 30:
            self.event_log.pop()

    def get_full_state(self):
        return {
            'level_num': self.level_num,
            'level_name': self.level_name,
            'energy': self.energy,
            'coherence': self.coherence,
            'turns': self.turns,
            'ships_found': self.ships_found,
            'total_ships': self.num_ships,
            'enemy_attacks_count': self.enemy_attacks_count,
            'rows': self.rows,
            'cols': self.cols,
            'cells': list(self.cells.values()),
            'entangled_pairs': self.entangled_pairs,
            'event_log': self.event_log
        }

def clamp(val, min_v, max_v):
    return max(min_v, min(val, max_v))
