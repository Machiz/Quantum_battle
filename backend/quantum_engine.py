import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import random
import datetime

class QiskitBattleEngine:
    """
    Motor Cuántico para Batalla Naval Cuántica (v_final.md)
    - Cada Flota es representada por un Qubit.
    - Superposición Ubicacional: Flota existe simultáneamente entre 2 casillas (P(hit)=50%).
    - Disparo = Medición de 1 shot en Qiskit.
      * Si es Agua (|0⟩): La función de onda colapsa y revela la flota en la casilla alternativa (100% certeza).
      * Si es Impacto (|1⟩): La flota colapsa a Derribada/Hundida.
    - Entrelazamiento (CNOT + Ry): Al destruir la Flota A, la Flota B sufre una rotación Ry(theta),
      pasando a estado Herida/Rotada (P(hit) sube a 75-80%) manteniendo sus casillas ocultas.
    """

    FLEET_NAMES = [
        "Fragata Cuántica Alpha",
        "Crucero Estelar Beta",
        "Destructor Qubit Gamma",
        "Submarino Hadamard Delta",
        "Nave Insignia Epsilon",
        "Acorazado Entrelazado Zeta"
    ]

    def __init__(self, level=2):
        self.reset_game(level)

    def reset_game(self, level=2):

        if isinstance(level, str):
            if '1' in level or 'easy' in level.lower() or 'novato' in level.lower():
                self.level_num = 1
            elif '3' in level or 'hard' in level.lower() or 'comandante' in level.lower():
                self.level_num = 3
            else:
                self.level_num = 2
        else:
            self.level_num = int(level)

        if self.level_num == 1:
            self.level_name = "Nivel 1: Novato (3 Flotas - Grid 6x6)"
            self.rows = 6
            self.cols = 6
            self.num_ships = 3
            self.energy = 1500
            self.coherence = 100.0
            self.entangled_pairs_count = 1
        elif self.level_num == 3:
            self.level_name = "Nivel 3: Comandante (5 Flotas - Grid 8x8)"
            self.rows = 8
            self.cols = 8
            self.num_ships = 5
            self.energy = 950
            self.coherence = 80.0
            self.entangled_pairs_count = 2
        else:
            self.level_num = 2
            self.level_name = "Nivel 2: Táctico (4 Flotas - Grid 8x8)"
            self.rows = 8
            self.cols = 8
            self.num_ships = 4
            self.energy = 1240
            self.coherence = 90.0
            self.entangled_pairs_count = 2

        self.turns = 0
        self.score = 0
        self.ships_destroyed = 0
        self.enemy_attacks_count = 0
        self.event_log = []
        self.fleets = {}
        self.cells = {}

        # Inicializar cuadrícula vacía
        for r in range(self.rows):
            row_label = chr(65 + r)
            for c in range(self.cols):
                cell_id = f"{row_label}-{c:02d}"
                self.cells[cell_id] = {
                    'id': cell_id,
                    'row': r,
                    'col': c,
                    'status': 'empty', # 'empty', 'water', 'hit'
                    'candidate_fleets': []
                }

        # Generar flotas en superposición (pares de casillas candidatas)
        self._generate_fleets()
        self._setup_entanglements()

        self.add_event(f"🎮 Nueva Partida - {self.level_name}. {self.num_ships} Flotas detectadas en Superposición.")
        return self.get_full_state()

    def _generate_fleets(self):
        used_tiles = set()
        fleet_ids = []

        for i in range(self.num_ships):
            fleet_id = f"fleet_{i+1}"
            fleet_name = self.FLEET_NAMES[i % len(self.FLEET_NAMES)]

            # Seleccionar 2 casillas candidatas no solapadas
            candidates = []
            attempts = 0
            while len(candidates) < 2 and attempts < 200:
                attempts += 1
                r = random.randint(0, self.rows - 1)
                c = random.randint(0, self.cols - 1)
                t_id = f"{chr(65 + r)}-{c:02d}"
                if t_id not in used_tiles and t_id not in candidates:
                    candidates.append(t_id)

            if len(candidates) < 2:
                # Fallback si el tablero está muy lleno
                all_possible = list(self.cells.keys())
                candidates = random.sample(all_possible, 2)

            for t_id in candidates:
                used_tiles.add(t_id)
                self.cells[t_id]['candidate_fleets'].append(fleet_id)

            # Una de las 2 casillas es la ubicación real colapsable
            secret_real_tile = random.choice(candidates)

            # Crear circuito Qiskit inicial en superposición (theta = pi/2 -> 50% / 50%)
            theta = np.pi / 2
            qc = QuantumCircuit(1)
            qc.ry(theta, 0)
            sv = Statevector.from_instruction(qc)
            prob_hit = float(abs(sv.data[1])**2) # 0.50

            self.fleets[fleet_id] = {
                'id': fleet_id,
                'name': fleet_name,
                'status': 'superposition', # 'superposition', 'revealed', 'wounded', 'destroyed'
                'candidate_tiles': candidates, # [tileA, tileB]
                'secret_real_tile': secret_real_tile,
                'prob_hit': round(prob_hit, 2), # 0.50
                'circuit_theta': theta,
                'entangled_with': None
            }
            fleet_ids.append(fleet_id)

    def _setup_entanglements(self):
        fleet_ids = list(self.fleets.keys())
        random.shuffle(fleet_ids)

        self.entangled_pairs = []
        pairs_made = 0

        for i in range(0, len(fleet_ids) - 1, 2):
            if pairs_made >= self.entangled_pairs_count:
                break
            f1_id = fleet_ids[i]
            f2_id = fleet_ids[i+1]

            self.fleets[f1_id]['entangled_with'] = f2_id
            self.fleets[f2_id]['entangled_with'] = f1_id

            self.entangled_pairs.append({
                'fleet_a': f1_id,
                'fleet_b': f2_id,
                'fleet_a_name': self.fleets[f1_id]['name'],
                'fleet_b_name': self.fleets[f2_id]['name']
            })
            pairs_made += 1

    def measure_cell(self, cell_id):
        """
        El jugador dispara a cell_id (Medición de 1 shot).
        """
        if cell_id not in self.cells:
            return {'success': False, 'message': 'Celda no válida'}

        cell = self.cells[cell_id]
        if cell['status'] in ['water', 'hit']:
            return {'success': False, 'message': 'Esta celda ya ha sido medida/atacada'}

        # Buscar si alguna flota activa incluye esta celda entre sus casillas candidatas
        target_fleet = None
        for fleet in self.fleets.values():
            if fleet['status'] != 'destroyed' and cell_id in fleet['candidate_tiles']:
                target_fleet = fleet
                break

        self.turns += 1

        # Si ninguna flota activa ocupa esta celda -> Disparo al agua pura (fuera de radar)
        if not target_fleet:
            cell['status'] = 'water'
            self.score = max(0, self.score - 20)
            self.coherence = max(5.0, round(self.coherence - 1.5, 1))
            self.add_event(f"🌊 Disparo en {cell_id}: AGUA (Casilla vacía sin presencia de flotas). [-20 pts]")
            return {
                'success': True,
                'is_hit': False,
                'result_type': 'water_empty',
                'state': self.get_full_state()
            }

        # Ejecutar Medición usando Circuito Qiskit de 1 Qubit
        theta = target_fleet['circuit_theta']
        qc = QuantumCircuit(1)
        qc.ry(theta, 0)

        # Regla de Medición proyectiva Qiskit: 1-shot
        # Si la celda atacada es la ubicación real secreta, prob de medir 1 depende de prob_hit
        is_real_location = (cell_id == target_fleet['secret_real_tile'])
        prob_hit = target_fleet['prob_hit']

        roll = random.random()
        # Si la celda es la secreta real -> probabilidad prob_hit de dar Impacto (|1⟩)
        # Si no es la secreta real -> colapsa a Agua (|0⟩)
        measured_state_1 = is_real_location and (roll <= prob_hit)

        if measured_state_1:
            # === CASO 2: ACIERTO DIRECTO (IMPACTO |1⟩) ===
            target_fleet['status'] = 'destroyed'
            target_fleet['prob_hit'] = 1.0
            cell['status'] = 'hit'
            self.ships_destroyed += 1
            pts_gained = 250 if target_fleet['status'] == 'wounded' else 200
            self.score += pts_gained
            self.add_event(f"💥 ¡IMPACTO DIRECTO en {cell_id}! La {target_fleet['name']} colapsó a Derribada |1⟩. [+{pts_gained} pts]")

            # === FASE 4: PROPAGACIÓN POR ENTLEZAMIENTO (CNOT + Ry) ===
            partner_id = target_fleet['entangled_with']
            if partner_id and self.fleets[partner_id]['status'] != 'destroyed':
                partner = self.fleets[partner_id]

                # Aplicar rotación condicional Ry(theta) en el qubit de la flota entrelazada
                # Aumenta su probabilidad de ser destruida en futuros turnos al 78% (Estado Herida)
                new_theta = 0.72 * np.pi # P(|1⟩) = sin^2(0.72*pi/2) ≈ 0.80
                qc_partner = QuantumCircuit(1)
                qc_partner.ry(new_theta, 0)
                sv_p = Statevector.from_instruction(qc_partner)
                new_p_hit = float(abs(sv_p.data[1])**2)

                partner['status'] = 'wounded'
                partner['prob_hit'] = round(new_p_hit, 2) # ~0.80
                partner['circuit_theta'] = new_theta

                self.add_event(f"⚡ ENTLEZAMIENTO CNOT: El colapso de {target_fleet['name']} provocó una rotación Ry(θ) en {partner['name']}. ¡Flota entrelazada ahora está HERIDA (P={int(new_p_hit*100)}%)!")

            return {
                'success': True,
                'is_hit': True,
                'result_type': 'hit',
                'destroyed_fleet': target_fleet['name'],
                'state': self.get_full_state()
            }

        else:
            # === CASO 1: FALLO (AGUA |0⟩) Y COLAPSO AUTOMÁTICO DE SUPERPOSICIÓN ===
            cell['status'] = 'water'
            self.score = max(0, self.score - 40)
            self.coherence = max(5.0, round(self.coherence - 3.0, 1))

            # Colapso de superposición: al fallar en esta casilla, la flota se revela automáticamente en la casilla alternativa con 100% de certeza!
            alt_tile = [t for t in target_fleet['candidate_tiles'] if t != cell_id]

            if alt_tile:
                confirmed_tile = alt_tile[0]
                target_fleet['status'] = 'revealed'
                target_fleet['candidate_tiles'] = [confirmed_tile]
                target_fleet['secret_real_tile'] = confirmed_tile
                target_fleet['prob_hit'] = 1.0
                target_fleet['circuit_theta'] = np.pi # 100% certeza |1⟩ en confirmed_tile cuando se mida

                self.add_event(f"🌊 AGUA en {cell_id} (Medición |0⟩). 🔮 ¡COLAPSO DE SUPERPOSICIÓN! {target_fleet['name']} revelada con 100% de certeza en {confirmed_tile}. [-40 pts]")
            else:
                self.add_event(f"🌊 AGUA en {cell_id}. La medición dio |0⟩. [-40 pts]")

            return {
                'success': True,
                'is_hit': False,
                'result_type': 'miss_collapsed',
                'revealed_tile': alt_tile[0] if alt_tile else None,
                'fleet_name': target_fleet['name'],
                'state': self.get_full_state()
            }

    def simulate_enemy_attack(self):
        """
        Simulación de contraataque enemigo / pulso de interferencia cuántica
        """
        self.enemy_attacks_count += 1
        self.turns += 1

        active_fleets = [f for f in self.fleets.values() if f['status'] in ['superposition', 'wounded']]
        if not active_fleets:
            return {'success': False, 'message': 'No hay flotas activas para contraataque'}

        target_fleet = random.choice(active_fleets)
        target_tile = random.choice(target_fleet['candidate_tiles'])

        coherence_loss = round(random.uniform(4.0, 8.0), 1)
        self.coherence = max(5.0, round(self.coherence - coherence_loss, 1))
        self.energy = max(0, self.energy - 35)

        self.add_event(f"⚠️ CONTRAATAQUE ENEMIGO: Pulso EMP en {target_tile}. [-{coherence_loss}% Coherencia, -35 GW]")

        return {
            'success': True,
            'attacked_tile': target_tile,
            'coherence_loss': coherence_loss,
            'state': self.get_full_state()
        }

    def add_event(self, text):
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
            'score': self.score,
            'ships_destroyed': self.ships_destroyed,
            'total_ships': self.num_ships,
            'is_victory': self.ships_destroyed >= self.num_ships,
            'enemy_attacks_count': self.enemy_attacks_count,
            'rows': self.rows,
            'cols': self.cols,
            'cells': list(self.cells.values()),
            'fleets': list(self.fleets.values()),
            'entangled_pairs': self.entangled_pairs,
            'event_log': self.event_log
        }
