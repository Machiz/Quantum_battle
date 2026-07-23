import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import random
import datetime

class QiskitBattleEngine:
    """
    Motor Cuántico para Batalla Naval Cuántica con Progresión y Niebla de Radar:
    - Niebla de Radar Inicial: Todas las casillas se ven de color neutro idéntico al inicio.
    - Revelación Dinámica: Al disparar a una casilla, se descubre la flota asociada,
      colapsando su superposición o revelando sus entrelazamientos CNOT progresivamente.
    """

    FLEET_NAMES = [
        "Fragata Cuántica Alpha",
        "Crucero Estelar Beta",
        "Destructor Qubit Gamma",
        "Submarino Hadamard Delta",
        "Nave Insignia Epsilon",
        "Acorazado Entrelazado Zeta",
        "Portaaviones Cuántico Eta",
        "Corbeta CNOT Theta"
    ]

    HINTS_MAP = {
        1: "Pista Táctica: Para alcanzar los 450 pts mínimos requeridos en el Nivel 1, evita disparar a ciegas en casillas vacías. Enfócate en las casillas en Superposición (50%) para forzar el Colapso de Onda o activar Entrelazamiento CNOT y rematar Flotas Heridas (+250 pts).",
        2: "Pista Táctica: En el tablero 8x8 con 5 flotas, explora el tablero para descubrir la flota HERIDA inicial (78% prob). Atácala para asegurar impacto y sumar bonus.",
        3: "Pista Táctica: En el tablero 12x12 con 7 flotas, identifica rápidamente las flotas HERIDAS (78% prob) marcadas con fuego 🔥 conforme descubres el espacio probabilístico."
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
            self.level_name = "Nivel 1: Novato (Grid 6x6 • 3 Flotas)"
            self.rows = 6
            self.cols = 6
            self.num_ships = 3
            self.energy = 1500
            self.coherence = 100.0
            self.entangled_pairs_count = 1
            self.hit_pts = 200
            self.wounded_hit_pts = 250
            self.miss_penalty = 40
            self.target_score = 450
            self.initial_wounded_count = 0
        elif self.level_num == 2:
            self.level_name = "Nivel 2: Táctico (Grid 8x8 • 5 Flotas)"
            self.rows = 8
            self.cols = 8
            self.num_ships = 5
            self.energy = 1240
            self.coherence = 90.0
            self.entangled_pairs_count = 2
            self.hit_pts = 150
            self.wounded_hit_pts = 180
            self.miss_penalty = 50
            self.target_score = 900
            self.initial_wounded_count = 1
        else:
            self.level_num = 3
            self.level_name = "Nivel 3: Comandante (Grid 12x12 • 7 Flotas)"
            self.rows = 12
            self.cols = 12
            self.num_ships = 7
            self.energy = 950
            self.coherence = 80.0
            self.entangled_pairs_count = 3
            self.hit_pts = 100
            self.wounded_hit_pts = 120
            self.miss_penalty = 60
            self.target_score = 1400
            self.initial_wounded_count = 2

        self.turns = 0
        self.score = 0
        self.ships_destroyed = 0
        self.enemy_attacks_count = 0
        self.event_log = []
        self.fleets = {}
        self.cells = {}
        self.discovered_fleets = set()

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

        self._generate_fleets()
        self._setup_entanglements()

        self.add_event(f"🎮 Misión Iniciada - {self.level_name}. Radar inicializado en modo sigilo.")
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
        if cell_id not in self.cells:
            return {'success': False, 'message': 'Celda no válida'}

        cell = self.cells[cell_id]
        if cell['status'] in ['water', 'hit']:
            return {'success': False, 'message': 'Esta celda ya ha sido medida/atacada'}

        target_fleet = None
        for fleet in self.fleets.values():
            if fleet['status'] != 'destroyed' and cell_id in fleet['candidate_tiles']:
                target_fleet = fleet
                break

        self.turns += 1

        if not target_fleet:
            cell['status'] = 'water'
            self.score = max(0, self.score - self.miss_penalty)
            self.coherence = max(0.0, round(self.coherence - 2.0, 1))
            self.add_event(f"🌊 Disparo en {cell_id}: AGUA (Casilla vacía). [-{self.miss_penalty} pts]")
            return {
                'success': True,
                'is_hit': False,
                'result_type': 'water_empty',
                'state': self.get_full_state()
            }

        # Marcar flota como descubierta por la acción del jugador
        self.discovered_fleets.add(target_fleet['id'])

        theta = target_fleet['circuit_theta']
        qc = QuantumCircuit(1)
        qc.ry(theta, 0)

        is_real_location = (cell_id == target_fleet['secret_real_tile'])
        prob_hit = target_fleet['prob_hit']

        roll = random.random()
        measured_state_1 = is_real_location and (roll <= prob_hit)

        if measured_state_1:
            was_wounded = (target_fleet['status'] == 'wounded')
            target_fleet['status'] = 'destroyed'
            target_fleet['prob_hit'] = 1.0
            cell['status'] = 'hit'
            self.ships_destroyed += 1

            pts_gained = self.wounded_hit_pts if was_wounded else self.hit_pts
            self.score += pts_gained
            self.add_event(f"💥 ¡IMPACTO DIRECTO en {cell_id}! {target_fleet['name']} colapsó a Derribada |1⟩. [+{pts_gained} pts]")

            # CNOT Propagation -> Desencadena entrelazamiento y descubre la flota pareja
            partner_id = target_fleet['entangled_with']
            if partner_id and self.fleets[partner_id]['status'] != 'destroyed':
                partner = self.fleets[partner_id]
                self.discovered_fleets.add(partner['id'])

                new_theta = 0.72 * np.pi
                qc_partner = QuantumCircuit(1)
                qc_partner.ry(new_theta, 0)

                partner['status'] = 'wounded'
                partner['prob_hit'] = 0.78
                partner['circuit_theta'] = new_theta

                self.add_event(f"⚡ ENTLEZAMIENTO CNOT REVELADO: El colapso de {target_fleet['name']} provocó una rotación en {partner['name']}. ¡Flota parejada descubierta e inspirada HERIDA (P=78%)!")

            return {
                'success': True,
                'is_hit': True,
                'result_type': 'hit',
                'destroyed_fleet': target_fleet['name'],
                'state': self.get_full_state()
            }

        else:
            cell['status'] = 'water'
            self.score = max(0, self.score - self.miss_penalty)
            self.coherence = max(0.0, round(self.coherence - 3.5, 1))

            alt_tile = [t for t in target_fleet['candidate_tiles'] if t != cell_id]

            if alt_tile:
                confirmed_tile = alt_tile[0]
                target_fleet['status'] = 'revealed'
                target_fleet['candidate_tiles'] = [confirmed_tile]
                target_fleet['secret_real_tile'] = confirmed_tile
                target_fleet['prob_hit'] = 1.0
                target_fleet['circuit_theta'] = np.pi

                self.add_event(f"🌊 AGUA en {cell_id}. 🔮 ¡COLAPSO DE SUPERPOSICIÓN! {target_fleet['name']} revelada con 100% de certeza en {confirmed_tile}. [-{self.miss_penalty} pts]")
            else:
                self.add_event(f"🌊 AGUA en {cell_id}. [-{self.miss_penalty} pts]")

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
        all_destroyed = self.ships_destroyed >= self.num_ships
        passed_score = self.score >= self.target_score
        failed_game = (all_destroyed and not passed_score) or (self.coherence <= 0)
        passed_game = all_destroyed and passed_score

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
            'miss_penalty': self.miss_penalty,
            'all_ships_destroyed': all_destroyed,
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
            'discovered_fleets': list(self.discovered_fleets),
            'event_log': self.event_log
        }
