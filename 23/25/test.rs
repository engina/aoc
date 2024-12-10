use std::collections::{HashMap, HashSet};
use std::f64;

#[derive(Debug, Clone)]
struct Vector2 {
    x: f64,
    y: f64,
}

impl Vector2 {
    fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }

    fn distance_to(&self, other: &Vector2) -> f64 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }

    fn sub(&mut self, other: &Vector2) -> &mut Self {
        self.x -= other.x;
        self.y -= other.y;
        self
    }

    fn add(&mut self, other: &Vector2) -> &mut Self {
        self.x += other.x;
        self.y += other.y;
        self
    }

    fn multiply_scalar(&mut self, scalar: f64) -> &mut Self {
        self.x *= scalar;
        self.y *= scalar;
        self
    }

    fn normalize(&mut self) -> &mut Self {
        let length = self.distance_to(&Vector2::new(0.0, 0.0));
        if length > 0.0 {
            self.x /= length;
            self.y /= length;
        }
        self
    }

    fn set(&mut self, x: f64, y: f64) {
        self.x = x;
        self.y = y;
    }
}

#[derive(Debug, Clone)]
struct Connection {
    a: usize,
    b: usize,
    cut: bool,
    key: String,
}

impl Connection {
    fn create(aid: usize, bid: usize) -> String {
        let mut ids = vec![aid, bid];
        ids.sort();
        ids.iter()
            .map(|id| id.to_string())
            .collect::<Vec<_>>()
            .join("-")
    }
}

#[derive(Debug, Clone)]
struct Node {
    id: usize,
    pos: Vector2,
    force: Vector2,
    conns: HashSet<String>,
    network: String,
}

impl Node {
    fn new(id: usize) -> Self {
        Self {
            id,
            pos: Vector2::new(0.0, 0.0),
            force: Vector2::new(0.0, 0.0),
            conns: HashSet::new(),
            network: String::new(),
        }
    }
}

#[derive(Debug)]
struct Config {
    force: f64,
    stiffness: f64,
    rest_length: f64,
}

fn step(nodes: &mut [Node], conns: &mut [Connection], config: &Config) {
    let Config {
        force,
        stiffness,
        rest_length,
    } = config;

    for i in 0..nodes.len() {
        for j in i + 1..nodes.len() {
            let (a, b) = nodes.split_at_mut(j);
            let node_a = &mut a[i];
            let node_b = &mut b[0];

            let distance = node_a.pos.distance_to(&node_b.pos);
            let repulsive_force = force / distance.powi(2);
            let mut force_v = Vector2::new(node_a.pos.x, node_a.pos.y);

            force_v
                .sub(&node_b.pos)
                .normalize()
                .multiply_scalar(repulsive_force);

            node_a.force.add(&force_v);
            node_b.force.sub(&force_v);
        }
    }

    for conn in conns {
        let (a, b) = nodes.split_at_mut(conn.b);
        let node_a = &mut a[conn.a];
        let node_b = &mut b[0];

        let distance = node_a.pos.distance_to(&node_b.pos);
        let extension = distance - rest_length;
        let spring_force = stiffness * extension;
        let mut force_v = Vector2::new(node_a.pos.x, node_a.pos.y);

        force_v
            .sub(&node_b.pos)
            .normalize()
            .multiply_scalar(spring_force);

        node_a.force.sub(&force_v);
        node_b.force.add(&force_v);
    }

    for node in nodes {
        node.pos.add(&node.force);
        node.force.set(0.0, 0.0);
    }
}

fn verify(cuts: &[Connection], nodes: &mut [Node], conns: &mut [Connection]) -> bool {
    let mut nodes_of_interest: Vec<usize> = vec![];

    for conn in cuts {
        if let Some(conn_mut) = conns.iter_mut().find(|c| c.key == conn.key) {
            conn_mut.cut = true;
            nodes_of_interest.push(conn.a);
            nodes_of_interest.push(conn.b);
        }
    }

    let mut updates = Vec::new();

    for &node_id in &nodes_of_interest {
        walk(node_id, nodes, conns, |n| {
            updates.push((n, node_id.to_string()));
            true
        });
    }

    for (node_idx, network) in updates {
        nodes[node_idx].network = network;
    }

    let mut network_sizes: HashMap<String, usize> = HashMap::new();
    for node in nodes.iter() {
        *network_sizes.entry(node.network.clone()).or_insert(0) += 1;
    }

    for conn in cuts {
        if let Some(conn_mut) = conns.iter_mut().find(|c| c.key == conn.key) {
            conn_mut.cut = false;
        }
    }

    let sizes: Vec<usize> = network_sizes.values().cloned().collect();
    sizes.len() == 2 && sizes.iter().product::<usize>() > 0
}

fn walk<F>(start: usize, nodes: &[Node], conns: &[Connection], mut cb: F)
where
    F: FnMut(usize) -> bool,
{
    let mut visited = HashSet::new();
    let mut stack = vec![start];

    while let Some(node_id) = stack.pop() {
        if visited.contains(&node_id) {
            continue;
        }

        visited.insert(node_id);

        if !cb(node_id) {
            break;
        }

        if let Some(node) = nodes.get(node_id) {
            for conn_key in &node.conns {
                if let Some(conn) = conns.iter().find(|c| c.key == *conn_key) {
                    if !conn.cut {
                        stack.push(if conn.a == node_id { conn.b } else { conn.a });
                    }
                }
            }
        }
    }
}

fn find_solution(
    mut nodes: Vec<Node>,
    mut conns: Vec<Connection>,
    config: Config,
    max_iter: usize,
) {
    for i in 0..max_iter {
        step(&mut nodes, &mut conns, &config);

        let result = conns.iter().take(3).cloned().collect::<Vec<_>>();

        if verify(&result, &mut nodes, &mut conns) {
            println!("Solution found at iteration {}", i);
            break;
        }
    }
}
fn parse_input(input: &str) -> (Vec<Node>, Vec<Connection>) {
    let mut nodes_map = HashMap::new();
    let mut conns_map = HashMap::new();

    input
        .lines()
        .filter(|line| !line.trim().is_empty())
        .for_each(|line| {
            let parts: Vec<&str> = line.split(": ").collect();
            let id = parts[0].trim();
            let neighbors = parts[1].split_whitespace().collect::<Vec<&str>>();

            let node_id = *nodes_map.entry(id.to_string()).or_insert_with(|| {
                let new_id = nodes_map.len();
                new_id
            });

            neighbors.iter().for_each(|&neighbor| {
                let neighbor_id = *nodes_map.entry(neighbor.to_string()).or_insert_with(|| {
                    let new_id = nodes_map.len();
                    new_id
                });

                let key = Connection::create(node_id, neighbor_id);
                if !conns_map.contains_key(&key) {
                    conns_map.insert(
                        key.clone(),
                        Connection {
                            a: node_id,
                            b: neighbor_id,
                            cut: false,
                            key,
                        },
                    );
                }
            });
        });

    let nodes = nodes_map
        .into_iter()
        .map(|(id, idx)| Node {
            id: idx,
            pos: Vector2::new(0.0, 0.0),
            force: Vector2::new(0.0, 0.0),
            conns: HashSet::new(),
            network: String::new(),
        })
        .collect::<Vec<_>>();

    let conns = conns_map.into_values().collect::<Vec<_>>();

    (nodes, conns)
}

fn main() {
    let input = "b1: a1 a2 a3 c1\nb2: a4 a5 a6 c2\nb3: a7 a8 a9 c3\nc1: d1 d2 d3\nc2: d4 d5 d6\nc3: d7 d8 d9\n";
    let (nodes, conns) = parse_input(input);

    let config = Config {
        force: 10.0,
        stiffness: 0.1,
        rest_length: 10.0,
    };

    find_solution(nodes, conns, config, 1000);
}
