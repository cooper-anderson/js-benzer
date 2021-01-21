export type Node = string;
export type Clique = Set<Node>;

export default class AdjacencyList {
	private nodes: Set<string>;
	private edgesIn: Map<string, Set<Node>>;
	private edgesOut: Map<string, Set<Node>>;
	private counts: {nodes: number, edges: number}

	constructor() {
		this.nodes = new Set();
		this.edgesIn = new Map();
		this.edgesOut = new Map();
		this.counts = {nodes: 0, edges: 0};
	}

	get nodeCount(): number {
		return this.counts.nodes;
	}

	get edgeCount(): number {
		return this.counts.edges;
	}

	addNode(name: string): boolean {
		if (this.nodes.has(name)) return false;

		this.nodes.add(name);
		this.edgesIn.set(name, new Set());
		this.edgesOut.set(name, new Set());

		this.counts.nodes++;
		return true;
	}

	addEdge(head: string, tail: string): boolean {
		if (!this.nodes.has(head)) return false;
		if (!this.nodes.has(tail)) return false;

		const headOut = this.edgesOut.get(head)!;
		if (headOut!.has(tail)) return false;
		headOut.add(tail);
		this.edgesIn.get(tail)!.add(head);

		this.counts.edges++;
		return true;
	}

	addEdgeUndirected(a: string, b: string): boolean {
		this.addEdge(a, b);
		this.addEdge(b, a);
		this.counts.edges--;
		return true;
	}

	hasEdge(head: string, tail: string): boolean {
		if (!this.nodes.has(head)) return false;
		if (!this.nodes.has(tail)) return false;

		return this.edgesOut.get(head)!.has(tail);
	}

	removeEdge(head: string, tail: string): boolean {
		if (!this.nodes.has(head)) return false;
		if (!this.nodes.has(tail)) return false;

		this.edgesOut.get(head)!.delete(tail);
		return this.edgesIn.get(tail)!.delete(tail)
	}

	static fromMatrix(labels: string[], matrix: number[][]): AdjacencyList {
		const al = new AdjacencyList();
		const size = labels.length;

		for (const label of labels) al.addNode(label);
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				if (y === x || matrix[y][x] === 0) continue;
				al.addEdge(labels[y], labels[x]);
			}
		}

		return al;
	}
}

