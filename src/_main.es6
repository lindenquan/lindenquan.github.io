// Start: constant variables
let DEBUG = false
    // End: constant variables 

let G = new Variable('G', ['g', '-g'])
let B = new Variable('B', ['b', '-b'])
let I = new Variable('I', ['i', '-i'])
let K = new Variable('K', ['k', '-k'])
let H = new Variable('H', ['h', '-h'])
let Z = new Variable('Z', ['z', '-z'])
let D = new Variable('D', ['d', '-d'])
let A = new Variable('A', ['a', '-a'])
let E = new Variable('E', ['e', '-e'])

let map = {}
map[['g']] = 0.496
map[['-g']] = 0.504
let p1 = new Distribution(map, G)

map = {}
map[['b']] = 0.423
map[['-b']] = 0.577
let p2 = new Distribution(map, B)

map = {}
map[['g', 'b', 'i']] = 0.408
map[['g', 'b', '-i']] = 0.592
map[['g', '-b', 'i']] = 0.101
map[['g', '-b', '-i']] = 0.899
map[['-g', 'b', 'i']] = 0.123
map[['-g', 'b', '-i']] = 0.877
map[['-g', '-b', 'i']] = 0.027
map[['-g', '-b', '-i']] = 0.973
let p3 = new Distribution(map, G, B, I)

map = {}
map[['k', 'i', 'h']] = 1
map[['k', 'i', '-h']] = 0
map[['k', '-i', 'h']] = 1
map[['k', '-i', '-h']] = 0
map[['-k', 'i', 'h']] = 1
map[['-k', 'i', '-h']] = 0
map[['-k', '-i', 'h']] = 0
map[['-k', '-i', '-h']] = 1
let p4 = new Distribution(map, K, I, H)

map = {}
map[['g', 'k']] = 0.123
map[['g', '-k']] = 0.877
map[['-g', 'k']] = 0.057
map[['-g', '-k']] = 0.943
let p5 = new Distribution(map, G, K)

map = {}
map[['h', 'z']] = 0.739
map[['h', '-z']] = 0.261
map[['-h', 'z']] = 0.498
map[['-h', '-z']] = 0.502
let p6 = new Distribution(map, H, Z)

map = {}
map[['h', 'd', 'a']] = 0.739
map[['h', 'd', '-a']] = 0.261
map[['h', '-d', 'a']] = 0.567
map[['h', '-d', '-a']] = 0.433
map[['-h', 'd', 'a']] = 0.278
map[['-h', 'd', '-a']] = 0.722
map[['-h', '-d', 'a']] = 0.303
map[['-h', '-d', '-a']] = 0.697
let p7 = new Distribution(map, H, D, A)

map = {}
map[['a', 'd', 'e']] = 0.562
map[['a', 'd', '-e']] = 0.438
map[['a', '-d', 'e']] = 0.421
map[['a', '-d', '-e']] = 0.579
map[['-a', 'd', 'e']] = 0.406
map[['-a', 'd', '-e']] = 0.594
map[['-a', '-d', 'e']] = 0.353
map[['-a', '-d', '-e']] = 0.647
let p8 = new Distribution(map, A, D, E)

map = {}
map[['b', 'd']] = 0.437
map[['b', '-d']] = 0.563
map[['-b', 'd']] = 0.421
map[['-b', '-d']] = 0.579
let p9 = new Distribution(map, B, D)

let tree = new JoinTree()
let node1 = p6
let node2 = p4.multiply(p5).multiply(p1)
let node3 = p3.multiply(p2)
let node4 = p9
let node5 = p7
let node6 = p8
tree.addNode(node1, [H, Z])
tree.addNode(node2, [H, K, I, G])
tree.addNode(node3, [H, I, G, B])
tree.addNode(node4, [H, B, D])
tree.addNode(node5, [H, D, A])
tree.addNode(node6, [E, A, D])


tree.addEdge(node1, node2)
tree.addEdge(node2, node3)
tree.addEdge(node3, node4)
tree.addEdge(node4, node5)
tree.addEdge(node5, node6)

tree.printTree()
tree.runHugin()
tree.printNodes()

console.log("Shafer Shenoy:")
tree = new JoinTree()
tree.addNode(node1, [H, Z])
tree.addNode(node2, [H, K, I, G])
tree.addNode(node3, [H, I, G, B])
tree.addNode(node4, [H, B, D])
tree.addNode(node5, [H, D, A])
tree.addNode(node6, [E, A, D])


tree.addEdge(node1, node2)
tree.addEdge(node2, node3)
tree.addEdge(node3, node4)
tree.addEdge(node4, node5)
tree.addEdge(node5, node6)
tree.runShaferShenoy()
tree.printNodes()
