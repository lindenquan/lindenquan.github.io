let DEBUG = false

let A = new Variable('A', ['a', '-a'])
let B = new Variable('B', ['b', '-b'])
let C = new Variable('C', ['c', '-c'])
let D = new Variable('D', ['d', '-d'])

let map = {}
map[['a']] = 0.8
map[['-a']] = 0.2
let pa = new Distribution(map, [A])

map = {}
map[['a', 'b']] = 0.2
map[['a', '-b']] = 0.8
map[['-a', 'b']] = 0.1
map[['-a', '-b']] = 0.9
let pb = new Distribution(map, [A, B])

map = {}
map[['b', 'c']] = 0.7
map[['b', '-c']] = 0.3
map[['-b', 'c']] = 0.5
map[['-b', '-c']] = 0.5
let pc = new Distribution(map, [B, C])

map = {}
map[['c', 'd']] = 0.1
map[['c', '-d']] = 0.9
map[['-c', 'd']] = 0.7
map[['-c', '-d']] = 0.3
let pd = new Distribution(map, [C, D])