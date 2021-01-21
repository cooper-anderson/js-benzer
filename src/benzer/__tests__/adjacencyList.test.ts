import AdjacencyList from "../adjacencyList";

describe("AdjacencyList", () => {
	const al = new AdjacencyList()

	it("allows adding nodes", () => {
		al.addNode('a');
		al.addNode('b');
		al.addNode('c');
		al.addNode('d');

		expect(al.nodeCount).toBe(4);
	});

	it("allows adding edges", () => {
		al.addEdgeUndirected('a', 'b');
		al.addEdgeUndirected('a', 'c');
		al.addEdgeUndirected('b', 'c');
		al.addEdgeUndirected('a', 'd');

		expect(al.edgeCount).toBe(4);
	});

});

