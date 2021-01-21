import AdjacencyList, {Clique} from "../adjacencyList";

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

describe("Bron-Kerbosch Algorithm", () => {
	const al = AdjacencyList.fromMatrix(['a', 'b', 'c', 'd'], [
		[1, 1, 1, 1],
		[1, 1, 1, 0],
		[1, 1, 1, 0],
		[1, 0, 0, 1]
	]);

	let cliques: Clique[];
	const expected: Clique[] = [
		new Set(['a', 'b', 'c']),
		new Set(['a', 'd'])
	];

	it("has the correct number of cliques", () => {
		cliques = al.bronKerbosch();
		expect(cliques.length).toBe(2);
	});

	it("has the correct sizes of cliques", () => {
		for (let i = 0; i < expected.length; i++) {
			expect(cliques[i].size).toBe(expected[i].size);
		}
	});

	it("has the correct cliques", () => {
		for (let i = 0; i < expected.length; i++) {
			const clique = cliques[i];
			for (const node of expected[i]) {
				expect(clique).toContain(node);
			}
		}
	});
});

