import networkx as nx
from itertools import combinations
from tqdm import tqdm
from math import comb
from concurrent.futures import ProcessPoolExecutor, as_completed
from multiprocessing import Manager

# Load the wiring diagram and build the graph
def build_graph(file_path):
    graph = nx.Graph()
    with open(file_path, 'r') as f:
        for line in f:
            component, neighbors = line.split(":")
            for neighbor in neighbors.split():
                graph.add_edge(component.strip(), neighbor.strip())
    print("File loaded and graph constructed successfully!")
    return graph

# Calculate product of sizes of two largest connected components
def calculate_group_product(graph, edges_to_remove):
    graph_copy = graph.copy()
    graph_copy.remove_edges_from(edges_to_remove)
    component_sizes = sorted([len(c) for c in nx.connected_components(graph_copy)], reverse=True)
    if len(component_sizes) >= 2:  # Ensure at least two components
        return component_sizes[0] * component_sizes[1]
    return 0

# Function to process a chunk of combinations
def process_chunk(graph_edges, edge_combinations, progress_queue):
    graph = nx.Graph()
    graph.add_edges_from(graph_edges)  # Rebuild graph from edges
    max_product = 0
    best_combination = None
    for edge_combination in edge_combinations:
        product = calculate_group_product(graph, edge_combination)
        if product > max_product:
            max_product = product
            best_combination = edge_combination
        progress_queue.put(1)  # Increment progress
    return best_combination, max_product

# Heuristic: Select top edges by centrality and evaluate with multi-processing
def heuristic_find_best_edges(graph, max_candidates=1000, num_processes=4):
    centrality = nx.edge_betweenness_centrality(graph)
    sorted_edges = sorted(centrality, key=centrality.get, reverse=True)
    candidate_edges = sorted_edges[:max_candidates]
    
    print(f"Testing {len(candidate_edges)} edges using heuristic...")
    total_combinations = comb(len(candidate_edges), 3)
    print(f"Total combinations to evaluate: {total_combinations}")

    # Split combinations into chunks
    edge_combinations = list(combinations(candidate_edges, 3))
    chunk_size = len(edge_combinations) // num_processes
    chunks = [edge_combinations[i:i + chunk_size] for i in range(0, len(edge_combinations), chunk_size)]

    max_product = 0
    best_combination = None

    # Extract edges from the graph for serialization
    graph_edges = list(graph.edges)

    # Progress tracking using a multiprocessing queue
    manager = Manager()
    progress_queue = manager.Queue()

    with tqdm(total=total_combinations, desc="Evaluating combinations") as pbar:
        with ProcessPoolExecutor(max_workers=num_processes) as executor:
            futures = [executor.submit(process_chunk, graph_edges, chunk, progress_queue) for chunk in chunks]
            
            # Monitor progress
            completed = 0
            while completed < total_combinations:
                pbar.update(progress_queue.get())
                completed += 1
            
            for future in as_completed(futures):
                result_combination, result_product = future.result()
                if result_product > max_product:
                    max_product = result_product
                    best_combination = result_combination
    
    return best_combination, max_product

if __name__ == "__main__":
    # Replace with your file path
    file_path = "25-input.txt"
    graph = build_graph(file_path)
    
    # Use heuristic method with multi-processing
    best_edges, max_product = heuristic_find_best_edges(graph, max_candidates=100, num_processes=12)
    
    print("Best edges to remove (heuristic, multi-core):", best_edges)
    print("Maximum product of group sizes (heuristic, multi-core):", max_product)
