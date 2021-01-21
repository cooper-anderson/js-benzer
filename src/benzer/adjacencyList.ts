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

	bronKerbosch(): Clique[] {
		const cliques: Clique[] = [];
		const R: Set<Node> = new Set();
		const X: Set<Node> = new Set();
		const P: Set<Node> = new Set(this.nodes);

		const bkHelper = (r: Set<Node>, p: Set<Node>, x: Set<Node>) => {
			if (p.size === 0 && x.size === 0) cliques.push(r);

			for (const v of p) {
				const nv = this.edgesOut.get(v);
				if (nv === undefined) throw new Error("error");
				const a: Set<Node> = new Set(r);
				const b: Set<Node> = new Set(nv);
				const c: Set<Node> = new Set(nv);
				a.add(v);

				for (const neighbor of nv) {
					if (!p.has(neighbor)) b.delete(neighbor);
					if (!x.has(neighbor)) c.delete(neighbor);
				}

				bkHelper(a, b, c);
				p.delete(v);
				x.add(v);
			}
		}

		bkHelper(R, P, X);

		return cliques;
	}

	getCliques(): Clique[] {
		return AdjacencyList.sortCliques(this.bronKerbosch());
	}

	static sortCliques(cliques: Clique[]): Clique[] {
		return cliques.sort((a, b) => a.size - b.size);
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

