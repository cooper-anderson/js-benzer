export type Node = string;
export type Clique = Set<Node>;
export type Direction = -1 | 0 | 1 | undefined;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default class AdjacencyList {
	private nodes: Set<string>;
	private edgesIn: Map<string, Set<Node>>;
	private edgesOut: Map<string, Set<Node>>;
	private counts: {nodes: number, edges: number}

	constructor(nodes?: Set<Node>) {
		this.nodes = new Set();
		this.edgesIn = new Map();
		this.edgesOut = new Map();
		this.counts = {nodes: 0, edges: 0};
		if (nodes) nodes.forEach(this.addNode.bind(this));
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
		if (headOut.has(tail)) return false;
		headOut.add(tail);
		this.edgesIn.get(tail)!.add(head);

		if (!this.edgesOut.get(tail)!.has(head)) this.counts.edges++;
		return true;
	}

	addEdgeUndirected(a: string, b: string): boolean {
		this.addEdge(a, b);
		this.addEdge(b, a);
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

	getComplement(): AdjacencyList {
		return AdjacencyList.getComplement(this);
	}

	getNodes(): Set<Node> {
		return new Set(this.nodes);
	}

	getEdgesOut(node: Node): Set<Node> {
		return new Set(this.edgesOut.get(node));
	}

	getEdgesIn(node: Node): Set<Node> {
		return new Set(this.edgesIn.get(node));
	}

	topologicalSort(): Node[] { // USING A SHORTCUT
		// const order: Node[] = [];
		const degrees: {node: Node, degree: number}[] = [];

		this.edgesOut.forEach((edges, node) => degrees.push({
			node: node,
			degree: edges.size
		}));

		const sorted = degrees.sort((a, b) => a.degree - b.degree);
		return sorted.map(item => item.node);
	}

	static sortCliques(cliques: Clique[]): Clique[] {
		return cliques.sort((a, b) => b.size - a.size);
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

	static getComplement(al: AdjacencyList): AdjacencyList {
		const comp = new AdjacencyList(al.nodes);

		for (const head of comp.nodes) {
			const tails = al.edgesOut.get(head)!;
			for (const tail of comp.nodes) {
				if (head === tail || tails.has(tail)) continue;
				comp.addEdge(head, tail);
			}
		}

		return comp;
	}

	static transitivelyOrient(al: AdjacencyList): AdjacencyList {
		const dag = new AdjacencyList(al.nodes);
		const nodes = new Set(al.nodes);
		const edges: Map<Node, Set<Node>> = new Map();

		let first: Node = "";
		let max = -1;
		for (const node of al.nodes) {
			edges.set(node, new Set());
			const size = al.edgesOut.get(node)!.size;
			if (size > max) {
				max = size;
				first = node;
			}
		}

		nodes.delete(first);
		for (const tail of al.edgesOut.get(first)!) dag.addEdge(first, tail);

		while (dag.counts.edges < al.counts.edges) {
			for (const a of al.nodes) {
				const outA = al.edgesOut.get(a)!;
				for (const b of outA) {
					if (b === first) continue;
					const ab = AdjacencyList.getDirection(al, dag, a, b);
					if (!ab) continue;
					const outB = al.edgesOut.get(b)!;
					for (const c of outB) {
						if (a === c) continue;
						if (edges.get(b)!.has(c)) continue;
						const bc = AdjacencyList.getDirection(al, dag, b, c);
						const ac = AdjacencyList.getDirection(al, dag, a, c);

						if (ab && bc && ac && Math.sign(ab + bc - ac) === 3) {
							throw new TransOrientError(a, b, c);
						}

						if (bc === 0) {
							if (ac === 0) continue; // No information
							else if (ac === undefined) { // c->b := a->b
								if (ab === 1) dag.addEdge(c, b);
								else dag.addEdge(b, c);
							} else {
								if (ab === ac) continue; // No information
								if (ab === 1) dag.addEdge(c, b);
								else dag.addEdge(b, c);
							}
						} else {
							if (ac === undefined) {
								if (ab !== bc) continue; // Nothing to change
								throw new TransOrientError(a, b, c);
							} else if (ab === ac) {
								if (ab === 1) dag.addEdge(a, c);
								else dag.addEdge(c, a);
							} else {
								continue; // No information
							}
						}
					}
				}
			}
		}

		return dag;
	}

	static getDirection(
		al: AdjacencyList, dag: AdjacencyList,
		a: Node, b: Node
	): Direction {
		if (dag.hasEdge(a, b)) return 1;
		else if (dag.hasEdge(b, a)) return -1;
		else if (al.hasEdge(a, b)) return 0;
		return undefined;
	}

	static getMatrix(al: AdjacencyList): string[] {
		const data: string[][] = [];

		for (const a of al.nodes) {
			const line: string[] = [a, ' '];
			for (const b of al.nodes) {
				if (a === b) line.push('*');
				else line.push(al.hasEdge(a, b) ? '1' : '0');
			}
			data.push(line);
		}

		let header = "    ";
		for (const n of al.nodes) header += n + ' ';
		let output = data.map(line => line.join(' '));
		output.unshift("");
		output.unshift(header.trimEnd());
		return output;
	}

	static getCliqueAdjList(al: AdjacencyList): AdjacencyList {
		const dag = AdjacencyList.transitivelyOrient(al.getComplement());
		const cliques = al.getCliques();
		const names = ALPHABET.slice(0, cliques.length).split("");
		const out = new AdjacencyList(new Set(names));

		for (let i = 0; i < cliques.length; i++) {
			const start = cliques[i];
			for (let j = i + 1; j < cliques.length; j++) {
				const end = cliques[j];
				let direction = 0;
				for (const a of start) {
					for (const b of end) {
						if (a === b) continue;

						const dir = AdjacencyList.getDirection(al, dag, a, b)!
						if (dir === 0) continue;

						if (direction === 0) direction = dir;
						else if (dir !== direction) {
							throw new CliqueOrientError(
								cliques[i], cliques[j]
							);
						}
					}
				}

				if (direction === 1) out.addEdge(names[i], names[j]);
				else out.addEdge(names[j], names[i]);
			}
		}

		return out;
	}
}

export class TransOrientError extends Error {
	a: Node;
	b: Node;
	c: Node;

	constructor(a: Node, b: Node, c: Node) {
		super(`Check edges ${a}--${b} and ${b}--${c}`);
		this.a = a;
		this.b = b;
		this.c = c;
	}
}

export class CliqueOrientError extends Error {
	a: Clique;
	b: Clique;

	constructor(a: Clique, b: Clique) {
		const c = Array.from(a).join(' ');
		const d = Array.from(b).join(' ');
		super(`Check cliques {${c}} and {${d}}`);
		this.a = a;
		this.b = b;
	}
}

