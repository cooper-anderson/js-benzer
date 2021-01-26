import AdjacencyList, {Node, Clique} from "./adjacencyList";
const Graph = AdjacencyList

function printMatrix(g: AdjacencyList, message: string) {
	console.log(message);
	console.log(Graph.getMatrix(g).join('\n'));
	console.log('-'.repeat(32));
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const matrix = Graph.fromMatrix(
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

const cliques = matrix.getCliques();
const cliqueNames: Map<Node, Clique> = new Map();
cliques.forEach((clique, index) => cliqueNames.set(ALPHABET[index], clique));

const compliment = matrix.getComplement();
const oriented = Graph.transitivelyOrient(compliment);

const orientedCliques = Graph.getCliqueAdjList(matrix, oriented, cliques);
const order = orientedCliques.topologicalSort();

const readData = Graph.getReadStartStop(cliqueNames, order);
const genome = Graph.getGenomeLabel(readData);

printMatrix(matrix, "initial matrix");
printMatrix(compliment, "the compliment");
printMatrix(oriented, "transitively orienting");
console.log(genome);

