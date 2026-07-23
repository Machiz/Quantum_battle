import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import random
import datetime

class QiskitBattleEngine:
    """
    Motor Cuántico para Batalla Naval Cuántica (v_final.md):
    - Ejecuta Mediciones de 1-Shot directamente en Qiskit mediante Statevector.sample_counts(shots=1).
    - El entrelazamiento CNOT se activa A PARTIR DEL NIVEL 2.
    """

    FLEET_NAMES = [
        "Fragata Cuántica Alpha",
        "Crucero Estelar Beta",
        "Destructor Qubit Gamma",
        "Submarino Hadamard Delta",
        "Nave Insignia Epsilon",
        "Acorazado Entrelazado Zeta",
        "Portaaviones Cuántico Eta",
        "Corbeta CNOT Theta",
        "Cazador Pauli Iota",
        "Dreadnought Bloch Kappa"
    ]

    HINTS_MAP = {
        1: "Pista Táctica: En el Nivel 1 te enfocas en la Superposición Cuántica (50% prob) sin entrelazamientos. El Entrelazamiento CNOT se desbloquea en el Nivel 2.",
        2: "Pista Táctica: ¡Entrelazamiento CNOT Desbloqueado en Nivel 2! Al derribar una flota enlazada CNOT, el colapso en cascada destruirá también a su pareja parejada.",
        3: "Pista Táctica: En el Nivel 3 (Grid 12x12 con 4 pares CNOT), aprovecha la cascada CNOT para destruir ambas flotas enlazadas tras un solo acierto."
    }

    def __init__(self, level=1):
        self.reset_game(level)

    def reset_game(self, level=1):
        if isinstance(level, str):
            if '3' in level or 'hard' in level.lower() or 'comandante' in level.lower():
                self.level_num = 3
            elif '2' in level or 'medium' in level.lower() or 'tactico' in level.lower():
                self.level_num = 2
            else:
                self.level_num = 1
        else:
            self.level_num = int(level)

        if self.level_num == 1:
            self.level_name = "Nivel 1: Novato (Grid 6x6 • 5 Flotas • Superposición Pura)"
            self.rows = 6
            self.cols = 6
            self.num_ships = 5
            self.energy = 1500
            self.coherence = 100.0
            self.entangled_pairs_count = 0  # Sin entrelazamientos en Nivel 1
            self.hit_pts = 200
            self.wounded_hit_pts = 250
            self.counterattack_damage = 50
            self.coherence_loss_on_miss = 4.0
            self.target_score = 225
            self.initial_wounded_count = 0
        elif self.level_num == 2:
            self.level_name = "Nivel 2: Táctico (Grid 8x8 • 7 Flotas • Entrelazamiento CNOT)"
            self.rows = 8
            self.cols = 8
            self.num_ships = 7
            self.energy = 1240
            self.coherence = 90.0
            self.entangled_pairs_count = 2  # Entrelazamiento desde Nivel 2
            self.hit_pts = 150
            self.wounded_hit_pts = 180
            self.counterattack_damage = 60
            self.coherence_loss_on_miss = 5.5
            self.target_score = 450
            self.initial_wounded_count = 1
        else:
            self.level_num = 3
            self.level_name = "Nivel 3: Comandante (Grid 12x12 • 9 Flotas • Entrelazamiento Completo)"
            self.rows = 12
            self.cols = 12
            self.num_ships = 9
            self.energy = 950
            self.coherence = 80.0
            self.entangled_pairs_count = 4
            self.hit_pts = 100
            self.wounded_hit_pts = 120
            self.counterattack_damage = 75
            self.coherence_loss_on_miss = 7.5
            self.target_score = 700
            self.initial_wounded_count = 2

        self.turns = 0
        self.score = 0
        self.ships_destroyed = 0
        self.enemy_attacks_count = 0
        self.event_log = []
        self.fleets = {}
        self.cells = {}
        self.revealed_entanglements = []
        self.active_fleet_index = 0

        for r in range(self.rows):
            row_label = chr(65 + r)
            for c in range(self.cols):
                cell_id = f"{row_label}-{c:02d}"
                self.cells[cell_id] = {
                    'id': cell_id,
                    'row': r,
                    'col': c,
                    'status': 'empty',
                    'candidate_fleets': []
                }

        self.fleet_order = self._generate_fleets()
        self._setup_entanglements()

        current_fleet = self._get_current_turn_fleet()
        if current_fleet and len(current_fleet['candidate_tiles']) == 2:
            self.add_event(f"📡 TURNO 1: Radar escaneó 2 casillas ({current_fleet['candidate_tiles'][0]} y {current_fleet['candidate_tiles'][1]}) para {current_fleet['name']}.")

        return self.get_full_state()

    def _generate_fleets(self):
        used_tiles = set()
        fleet_ids = []

        for i in range(self.num_ships):
            fleet_id = f"fleet_{i+1}"
            fleet_name = self.FLEET_NAMES[i % len(self.FLEET_NAMES)]

            candidates = []
            attempts = 0
            while len(candidates) < 2 and attempts < 300:
                attempts += 1
                r = random.randint(0, self.rows - 1)
                c = random.randint(0, self.cols - 1)
                t_id = f"{chr(65 + r)}-{c:02d}"
                if t_id not in used_tiles and t_id not in candidates:
                    candidates.append(t_id)

            if len(candidates) < 2:
                all_possible = list(self.cells.keys())
                candidates = random.sample(all_possible, 2)

            for t_id in candidates:
                used_tiles.add(t_id)
                self.cells[t_id]['candidate_fleets'].append(fleet_id)

            secret_real_tile = random.choice(candidates)

            is_initial_wounded = (i < self.initial_wounded_count)
            if is_initial_wounded:
                theta = 0.72 * np.pi
                status = 'wounded'
                prob_hit = 0.78
            else:
                theta = np.pi / 2
                status = 'superposition'
                prob_hit = 0.50

            qc = QuantumCircuit(1)
            qc.ry(theta, 0)

            self.fleets[fleet_id] = {
                'id': fleet_id,
                'name': fleet_name,
                'status': status,
                'candidate_tiles': candidates,
                'secret_real_tile': secret_real_tile,
                'prob_hit': round(prob_hit, 2),
                'circuit_theta': theta,
                'entangled_with': None
            }
            fleet_ids.append(fleet_id)

        return fleet_ids

    def _setup_entanglements(self):
        self.entangled_pairs = []
        if self.entangled_pairs_count <= 0:
            return

        fleet_ids = list(self.fleets.keys())
        random.shuffle(fleet_ids)

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

    def _get_current_turn_fleet(self):
        active_fleets = [f for f in self.fleets.values() if f['status'] in ['superposition', 'wounded']]
        if active_fleets:
            idx = self.active_fleet_index % len(active_fleets)
            return active_fleets[idx]
        return None

    def measure_cell(self, cell_id):
        if cell_id not in self.cells:
            return {'success': False, 'message': 'Celda no válida'}

        cell = self.cells[cell_id]
        if cell['status'] in ['water', 'hit']:
            return {'success': False, 'message': 'Esta celda ya ha sido medida/atacada'}

        target_fleet = None
        for fleet in self.fleets.values():
            if fleet['status'] in ['superposition', 'wounded'] and cell_id in fleet['candidate_tiles']:
                target_fleet = fleet
                break

        self.turns += 1

        if not target_fleet:
            cell['status'] = 'water'
            damage = self.counterattack_damage
            coh_loss = self.coherence_loss_on_miss
            self.score = max(0, self.score - damage)
            self.coherence = max(0.0, round(self.coherence - coh_loss, 1))
            self.enemy_attacks_count += 1
            self.add_event(f"🌊 AGUA en {cell_id}. ⚠️ ¡CONTRAATAQUE ENEMIGO! Pulso EMP en respuesta. [-{damage} Pts]")
            
            self.active_fleet_index += 1
            next_fleet = self._get_current_turn_fleet()
            if next_fleet and len(next_fleet['candidate_tiles']) == 2:
                self.add_event(f"📡 TURNO {self.turns+1}: Radar presenta el siguiente enlace ({' y '.join(next_fleet['candidate_tiles'])}) para {next_fleet['name']}.")

            return {
                'success': True,
                'is_hit': False,
                'result_type': 'water_empty',
                'state': self.get_full_state()
            }

        # === CONSTRUCCIÓN Y MEDICIÓN DE 1 SHOT EN QISKIT ===
        theta = target_fleet['circuit_theta']
        qc = QuantumCircuit(1)
        qc.ry(theta, 0)

        # Muestreo nativo de 1 shot usando Statevector de Qiskit
        sv = Statevector.from_instruction(qc)
        sample_counts = sv.sample_counts(shots=1)  # Medición de 1 shot en Qiskit
        qiskit_measured_state_1 = ('1' in sample_counts)

        is_real_location = (cell_id == target_fleet['secret_real_tile'])
        measured_state_1 = is_real_location and qiskit_measured_state_1

        if measured_state_1:
            # === ACIERTO (IMPACTO |1⟩): COLAPSO CNOT EN CASCADA SI EXISTE ENTRELAZAMIENTO ===
            was_wounded = (target_fleet['status'] == 'wounded')
            target_fleet['status'] = 'destroyed'
            target_fleet['prob_hit'] = 1.0
            cell['status'] = 'hit'
            self.ships_destroyed += 1

            pts_gained = self.wounded_hit_pts if was_wounded else self.hit_pts
            self.score += pts_gained
            self.add_event(f"💥 ¡ACIERTO DIRECTO en {cell_id}! {target_fleet['name']} colapsó a Derribada |1⟩. [+{pts_gained} pts]")

            partner_id = target_fleet['entangled_with']
            if partner_id and self.fleets[partner_id]['status'] != 'destroyed':
                partner = self.fleets[partner_id]
                partner_was_wounded = (partner['status'] == 'wounded')
                partner['status'] = 'destroyed'
                partner['prob_hit'] = 1.0
                self.ships_destroyed += 1

                partner_pts = self.wounded_hit_pts if partner_was_wounded else self.hit_pts
                self.score += partner_pts

                partner_tile = partner['secret_real_tile']
                if partner_tile in self.cells:
                    self.cells[partner_tile]['status'] = 'hit'

                self.revealed_entanglements.append({
                    'tile_a': cell_id,
                    'tile_b': partner_tile,
                    'fleet_a_id': target_fleet['id'],
                    'fleet_b_id': partner['id'],
                    'fleet_a_name': target_fleet['name'],
                    'fleet_b_name': partner['name']
                })

                self.add_event(f"⚡ ¡COLAPSO CNOT EN CASCADA! El derribo de {target_fleet['name']} provocó la DESTRUCCIÓN INSTANTÁNEA de {partner['name']} en {partner_tile} por entrelazamiento cuántico. [+{partner_pts} Pts Bonus]")

            self.active_fleet_index += 1
            next_fleet = self._get_current_turn_fleet()
            if next_fleet and len(next_fleet['candidate_tiles']) == 2:
                self.add_event(f"📡 TURNO {self.turns+1}: Radar presenta el siguiente enlace ({' y '.join(next_fleet['candidate_tiles'])}) para {next_fleet['name']}.")

            return {
                'success': True,
                'is_hit': True,
                'result_type': 'hit',
                'destroyed_fleet': target_fleet['name'],
                'state': self.get_full_state()
            }

        else:
            cell['status'] = 'water'
            damage = self.counterattack_damage
            coh_loss = self.coherence_loss_on_miss

            self.score = max(0, self.score - damage)
            self.coherence = max(0.0, round(self.coherence - coh_loss, 1))
            self.enemy_attacks_count += 1

            alt_tile = [t for t in target_fleet['candidate_tiles'] if t != cell_id]

            if alt_tile:
                confirmed_tile = alt_tile[0]
                target_fleet['status'] = 'revealed'
                target_fleet['candidate_tiles'] = [confirmed_tile]
                target_fleet['secret_real_tile'] = confirmed_tile
                target_fleet['prob_hit'] = 1.0
                target_fleet['circuit_theta'] = np.pi

                self.add_event(f"🌊 FALLO en {cell_id}. 🔮 BARCO REVELADO EN {confirmed_tile} (Casilla deshabilitada). ⚠️ ¡CONTRAATAQUE ENEMIGO! [-{damage} Pts]")
            else:
                self.add_event(f"🌊 FALLO en {cell_id}. ⚠️ ¡CONTRAATAQUE ENEMIGO! [-{damage} Pts]")

            self.active_fleet_index += 1
            next_fleet = self._get_current_turn_fleet()
            if next_fleet and len(next_fleet['candidate_tiles']) == 2:
                self.add_event(f"📡 TURNO {self.turns+1}: Radar presenta el siguiente enlace ({' y '.join(next_fleet['candidate_tiles'])}) para {next_fleet['name']}.")

            return {
                'success': True,
                'is_hit': False,
                'result_type': 'miss_collapsed',
                'revealed_tile': alt_tile[0] if alt_tile else None,
                'fleet_name': target_fleet['name'],
                'state': self.get_full_state()
            }

    def simulate_enemy_attack(self):
        self.enemy_attacks_count += 1
        self.turns += 1

        active_fleets = [f for f in self.fleets.values() if f['status'] in ['superposition', 'wounded']]
        if not active_fleets:
            return {'success': False, 'message': 'No hay flotas activas'}

        target_fleet = random.choice(active_fleets)
        target_tile = random.choice(target_fleet['candidate_tiles'])

        coherence_loss = round(random.uniform(5.0, 9.0), 1)
        self.coherence = max(0.0, round(self.coherence - coherence_loss, 1))
        self.energy = max(0, self.energy - 40)

        self.add_event(f"⚠️ CONTRAATAQUE ENEMIGO: Pulso EMP en {target_tile}. [-{coherence_loss}% Coherencia]")

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
        all_resolved = all(f['status'] in ['destroyed', 'revealed'] for f in self.fleets.values())
        passed_score = self.score >= self.target_score
        failed_game = (all_resolved and not passed_score) or (self.coherence <= 0)
        passed_game = all_resolved and passed_score

        current_turn_fleet = self._get_current_turn_fleet()
        active_turn_tiles = current_turn_fleet['candidate_tiles'] if (current_turn_fleet and len(current_turn_fleet['candidate_tiles']) == 2) else []

        return {
            'level_num': self.level_num,
            'level_name': self.level_name,
            'energy': self.energy,
            'coherence': self.coherence,
            'turns': self.turns,
            'score': self.score,
            'ships_destroyed': self.ships_destroyed,
            'total_ships': self.num_ships,
            'target_score': self.target_score,
            'hit_pts': self.hit_pts,
            'miss_penalty': self.counterattack_damage,
            'counterattack_damage': self.counterattack_damage,
            'coherence_loss_on_miss': self.coherence_loss_on_miss,
            'all_ships_destroyed': all_resolved,
            'passed_score': passed_score,
            'passed_game': passed_game,
            'failed_game': failed_game,
            'tactical_hint': self.HINTS_MAP.get(self.level_num, ""),
            'enemy_attacks_count': self.enemy_attacks_count,
            'rows': self.rows,
            'cols': self.cols,
            'cells': list(self.cells.values()),
            'fleets': list(self.fleets.values()),
            'entangled_pairs': self.entangled_pairs,
            'revealed_entanglements': self.revealed_entanglements,
            'current_turn_fleet_id': current_turn_fleet['id'] if current_turn_fleet else None,
            'active_turn_tiles': active_turn_tiles,
            'event_log': self.event_log
        }
