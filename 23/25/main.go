package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"sync/atomic"
)

// Graph represents an undirected graph
type Graph struct {
	Edges map[string]map[string]bool
}

// NewGraph initializes a new graph
func NewGraph() *Graph {
	return &Graph{Edges: make(map[string]map[string]bool)}
}

// AddEdge adds an edge to the graph
func (g *Graph) AddEdge(node1, node2 string) {
	if g.Edges[node1] == nil {
		g.Edges[node1] = make(map[string]bool)
	}
	if g.Edges[node2] == nil {
		g.Edges[node2] = make(map[string]bool)
	}
	g.Edges[node1][node2] = true
	g.Edges[node2][node1] = true
}

// RemoveEdge removes an edge from the graph
func (g *Graph) RemoveEdge(node1, node2 string) {
	delete(g.Edges[node1], node2)
	delete(g.Edges[node2], node1)
}

// Copy creates a deep copy of the graph
func (g *Graph) Copy() *Graph {
	copy := NewGraph()
	for node, neighbors := range g.Edges {
		for neighbor := range neighbors {
			copy.AddEdge(node, neighbor)
		}
	}
	return copy
}

// GetConnectedComponents returns the sizes of connected components
func (g *Graph) GetConnectedComponents() []int {
	visited := make(map[string]bool)
	var componentSizes []int

	var dfs func(string) int
	dfs = func(node string) int {
		stack := []string{node}
		size := 0
		for len(stack) > 0 {
			curr := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			if visited[curr] {
				continue
			}
			visited[curr] = true
			size++
			for neighbor := range g.Edges[curr] {
				if !visited[neighbor] {
					stack = append(stack, neighbor)
				}
			}
		}
		return size
	}

	for node := range g.Edges {
		if !visited[node] {
			componentSizes = append(componentSizes, dfs(node))
		}
	}
	return componentSizes
}

// CalculateGroupProduct calculates the product of the sizes of two largest components
func (g *Graph) CalculateGroupProduct(edgesToRemove [][2]string) int {
	copy := g.Copy()
	for _, edge := range edgesToRemove {
		copy.RemoveEdge(edge[0], edge[1])
	}
	componentSizes := copy.GetConnectedComponents()
	if len(componentSizes) < 2 {
		return 0
	}
	return componentSizes[0] * componentSizes[1]
}

// ReadGraphFromFile loads a graph from a file
func ReadGraphFromFile(filePath string) *Graph {
	graph := NewGraph()
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatalf("Error opening file: %v", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		parts := strings.Split(line, ":")
		node := strings.TrimSpace(parts[0])
		neighbors := strings.Fields(parts[1])
		for _, neighbor := range neighbors {
			graph.AddEdge(node, neighbor)
		}
	}
	return graph
}

// GenerateEdgeCombinations generates all 3-edge combinations
func GenerateEdgeCombinations(edges [][2]string) [][3][2]string {
	var combinations [][3][2]string
	n := len(edges)
	for i := 0; i < n-2; i++ {
		for j := i + 1; j < n-1; j++ {
			for k := j + 1; k < n; k++ {
				combinations = append(combinations, [3][2]string{edges[i], edges[j], edges[k]})
			}
		}
	}
	return combinations
}

func worker(graph *Graph, tasks <-chan [3][2]string, results chan<- [2]interface{}, progress *int32) {
	for combination := range tasks {
		product := graph.CalculateGroupProduct(combination[:])
		results <- [2]interface{}{combination, product}
		atomic.AddInt32(progress, 1) // Update progress counter
	}
}

func main() {
	// Load graph from file
	filePath := "25-input.txt"
	graph := ReadGraphFromFile(filePath)
	fmt.Println("File loaded and graph constructed successfully!")

	// Get all edges
	var edges [][2]string
	for node, neighbors := range graph.Edges {
		for neighbor := range neighbors {
			if node < neighbor {
				edges = append(edges, [2]string{node, neighbor})
			}
		}
	}

	// Generate combinations
	combinations := GenerateEdgeCombinations(edges)
	totalCombinations := len(combinations)
	fmt.Printf("Total combinations to evaluate: %d\n", totalCombinations)

	// Setup worker pool
	numWorkers := 12 // Set for a 12-core CPU
	tasks := make(chan [3][2]string, totalCombinations)
	results := make(chan [2]interface{}, totalCombinations)

	var wg sync.WaitGroup
	var progress int32

	// Start workers
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			worker(graph, tasks, results, &progress)
		}()
	}

	// Send tasks
	go func() {
		for _, combination := range combinations {
			tasks <- combination
		}
		close(tasks)
	}()

	// Monitor progress
	go func() {
		for {
			processed := atomic.LoadInt32(&progress)
			fmt.Printf("\rProgress: %d/%d combinations processed", processed, totalCombinations)
			if int(processed) >= totalCombinations {
				break
			}
		}
	}()

	// Wait for workers to complete
	go func() {
		wg.Wait()
		close(results)
	}()

	// Find the best result
	maxProduct := 0
	var bestCombination [3][2]string
	for result := range results {
		combination := result[0].([3][2]string)
		product := result[1].(int)
		if product > maxProduct {
			maxProduct = product
			bestCombination = combination
		}
	}

	fmt.Printf("\nBest edges to remove: %v\n", bestCombination)
	fmt.Printf("Maximum product of group sizes: %d\n", maxProduct)
}
