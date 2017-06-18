// Start: constant variables
let DEBUG = true
    // End: constant variables 

let A = new Variable('A', ['a', '-a'])
let B = new Variable('B', ['b', '-b'])
let C = new Variable('C', ['c', '-c'])
let D = new Variable('D', ['d', '-d'])
let E = new Variable('E', ['e', '-e'])
let F = new Variable('F', ['f', '-f'])

let map = {}
map[['e', 'c']] = 0.5
map[['e', '-c']] = 0.4
map[['-e', 'c']] = 0.5
map[['-e', '-c']] = 0.6
let EC = new Distribution(map, E, C)
EC.name = 'P(E|C)'

map = {}
map[['b', 'd']] = 0.4
map[['b', '-d']] = 0.6
map[['-b', 'd']] = 0.7
map[['-b', '-d']] = 0.3
let BD = new Distribution(map, B, D)
BD.name = 'P(D|B)'

map = {}
map[['a', 'b', 'c']] = 0.007
map[['a', 'b', '-c']] = 0.003
map[['a', '-b', 'c']] = 0.063
map[['a', '-b', '-c']] = 0.027
map[['-a', 'b', 'c']] = 0.162
map[['-a', 'b', '-c']] = 0.648
map[['-a', '-b', 'c']] = 0.018
map[['-a', '-b', '-c']] = 0.072
let ABC = new Distribution(map, A, B, C)
ABC.name = 'P(A,B,C)'

map = {}
map[['d', 'e', 'f']] = 0.1
map[['d', 'e', '-f']] = 0.9
map[['d', '-e', 'f']] = 0.5
map[['d', '-e', '-f']] = 0.5
map[['-d', 'e', 'f']] = 0.4
map[['-d', 'e', '-f']] = 0.6
map[['-d', '-e', 'f']] = 0.8
map[['-d', '-e', '-f']] = 0.2
let DEF = new Distribution(map, D, E, F)
DEF.name = 'P(F|D,E)'

let tree = new JoinTree()
tree.addNode(EC, [C, D, E])
tree.addNode(BD, [B, C, D])
tree.addNode(ABC, [A, B, C])
tree.addNode(DEF, [D, E, F])

tree.addEdge(EC, BD)
tree.addEdge(BD, ABC)
tree.addEdge(EC, DEF)

tree.printTree()
tree.runHugin()
tree.printNodes()

tree = new JoinTree()
tree.addNode(EC, [C, D, E])
tree.addNode(BD, [B, C, D])
tree.addNode(ABC, [A, B, C])
tree.addNode(DEF, [D, E, F])

tree.addEdge(EC, BD)
tree.addEdge(BD, ABC)
tree.addEdge(EC, DEF)
tree.runShaferShenoy()
tree.printNodes()
