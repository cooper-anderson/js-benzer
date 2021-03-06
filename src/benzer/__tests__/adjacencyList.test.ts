import AdjacencyList, {Clique, TransOrientError} from "../adjacencyList";

describe("AdjacencyList", () => {
	let al: AdjacencyList;

	it("gets created successfully", () => {
		al = new AdjacencyList();
	});

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

	it("can generate complement graph", () => {
		const comp = AdjacencyList.getComplement(al);
		expect(comp.edgeCount).toBe(2);
		expect(comp.hasEdge('b', 'd')).toBe(true);
		expect(comp.hasEdge('d', 'b')).toBe(true);
		expect(comp.hasEdge('c', 'd')).toBe(true);
		expect(comp.hasEdge('d', 'c')).toBe(true);
	});
});

describe("Bron-Kerbosch Algorithm", () => {
	const al = AdjacencyList.fromMatrix(['α', 'β', 'γ', 'δ', 'ε', 'θ'], [
		[0, 0, 1, 1, 1, 1],
		[0, 0, 1, 0, 1, 0],
		[1, 1, 0, 1, 1, 1],
		[1, 0, 1, 0, 0, 1],
		[1, 1, 1, 0, 0, 0],
		[1, 0, 1, 1, 0, 0]
	]);

	let cliques: Clique[];
	const expected: Clique[] = [
		new Set(['α', 'γ', 'δ', 'θ']),
		new Set(['α', 'γ', 'ε']),
		new Set(['β', 'γ', 'ε'])
	];

	it("has the correct number of cliques", () => {
		cliques = al.bronKerbosch();
		expect(cliques.length).toBe(3);
	});

	it("has the correct sizes of cliques", () => {
		for (let i = 0; i < expected.length; i++) {
			expect(cliques[i].size).toBe(expected[i].size);
		}
	});

	it("has the cliques in sorted order", () => {
		for (let c = 0; c < cliques.length - 1; c++) {
			expect(cliques[c].size).toBeGreaterThanOrEqual(cliques[c+1].size);
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

describe("Transitive Orientation", () => {
	it("transitively orients graph", () => {
		const al = AdjacencyList.fromMatrix(
			['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ'], [
				[1, 1, 0, 1, 0, 1, 0],
				[1, 1, 1, 1, 0, 1, 0],
				[0, 1, 1, 0, 0, 1, 0],
				[1, 1, 0, 1, 1, 0, 0],
				[0, 0, 0, 1, 1, 0, 0],
				[1, 1, 1, 0, 0, 1, 1],
				[0, 0, 0, 0, 0, 1, 1],
			]
		).getComplement();
		const desired = AdjacencyList.fromMatrix(
			['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ'], [
				[0, 0, 1, 0, 0, 0, 1],
				[0, 0, 0, 0, 0, 0, 1],
				[0, 0, 0, 0, 0, 0, 1],
				[0, 0, 1, 0, 0, 1, 1],
				[1, 1, 1, 0, 0, 1, 1],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
			]
		);

		const dag = AdjacencyList.transitivelyOrient(al);
		expectAdjListMatches(dag, desired);
	});

	it("throws error on impossible state", () => {
		const al = AdjacencyList.fromMatrix(
			['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ'], [
				[1, 1, 0, 0, 0, 1, 0],
				[1, 1, 1, 1, 0, 0, 0],
				[0, 1, 1, 1, 0, 0, 0],
				[0, 1, 1, 1, 1, 1, 1],
				[0, 0, 0, 1, 1, 0, 0],
				[1, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
			]
		).getComplement();

		const func = AdjacencyList.transitivelyOrient.bind(this, al);
		expect(func).toThrow(TransOrientError);
	});
});

describe("Clique Ordering", () => {
	it("creates the ordered clique matrix", () => {
		const al = AdjacencyList.fromMatrix(
			['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ'], [
				[1, 1, 0, 1, 0, 1, 0],
				[1, 1, 1, 1, 0, 1, 0],
				[0, 1, 1, 0, 0, 1, 0],
				[1, 1, 0, 1, 1, 0, 0],
				[0, 0, 0, 1, 1, 0, 0],
				[1, 1, 1, 0, 0, 1, 1],
				[0, 0, 0, 0, 0, 1, 1],
			]
		);
		const dag = AdjacencyList.transitivelyOrient(al.getComplement());
		const desired = AdjacencyList.fromMatrix(
			['A', 'B', 'C', 'D', 'E'], [
				[0, 1, 1, 0, 1],
				[0, 0, 1, 0, 1],
				[0, 0, 0, 0, 1],
				[1, 1, 1, 0, 1],
				[0, 0, 0, 0, 0],
			]
		);

		expectAdjListMatches(
			AdjacencyList.getCliqueAdjList(al, dag, al.getCliques()),
			desired
		);
	});

	const order = ['E', 'C', 'B', 'A', 'D'];
	const cliques: Map<string, Set<string>> = new Map();
	cliques.set('A', new Set(['α', 'β', 'δ']));
	cliques.set('B', new Set(['α', 'β', 'θ']));
	cliques.set('C', new Set(['β', 'γ', 'θ']));
	cliques.set('D', new Set(['δ', 'ε']));
	cliques.set('E', new Set(['θ', 'λ']));
	const data = AdjacencyList.getReadStartStop(cliques, order);

	it("determines read starts and stops", () => {
		expect(data.starts[0]).toMatchObject(new Set(['θ', 'λ']));
		expect(data.starts[1]).toMatchObject(new Set(['β', 'γ']));
		expect(data.starts[2]).toMatchObject(new Set(['α']));
		expect(data.starts[3]).toMatchObject(new Set(['δ']));
		expect(data.starts[4]).toMatchObject(new Set(['ε']));

		expect(data.ends[0]).toMatchObject(new Set(['λ']));
		expect(data.ends[1]).toMatchObject(new Set(['γ']));
		expect(data.ends[2]).toMatchObject(new Set(['θ']));
		expect(data.ends[3]).toMatchObject(new Set(['β', 'α']));
		expect(data.ends[4]).toMatchObject(new Set(['δ', 'ε']));
	});

	it("determines the optimal path", () => {
		expect(AdjacencyList.getGenomeLabel(data)).toBe("θδ");
	});
});

describe("Topological Sort", () => {
	it("puts the nodes in order", () => {
		const al = AdjacencyList.fromMatrix(
			['A', 'B', 'C', 'D', 'E'], [
				[0, 1, 1, 0, 1],
				[0, 0, 1, 0, 1],
				[0, 0, 0, 0, 1],
				[1, 1, 1, 0, 1],
				[0, 0, 0, 0, 0],
			]
		);

		expect(al.topologicalSort()).toMatchObject(['E', 'C', 'B', 'A', 'D']);
	});
});

function expectAdjListMatches(
	received: AdjacencyList, expected: AdjacencyList
): void {
	const nodesR = received.getNodes();
	const nodesE = expected.getNodes();
	expect(nodesR).toMatchObject(nodesE);

	for (const node of nodesE) {
		const outR = received.getEdgesOut(node);
		const outE = expected.getEdgesOut(node);
		expect(outR).toMatchObject(outE)
	}
}

