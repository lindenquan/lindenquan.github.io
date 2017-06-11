let variable = ''
let domains = []

variable = 'weather'

let weather = new Variable(variable, ['sunny', 'winndy'])

variable = 'city'
domains = []
domains.push('Regina')
domains.push('Toronto')
domains.push('Warterloo')


let city = new Variable(variable, domains)


let party = new Variable('party', ['Yes', 'No'])


let a = new Variable('a', ['a', 'A'])




let map = {}
map[['a', 'sunny', 'Regina', 'Yes']] = 0.4
map[['A', 'sunny', 'Toronto', 'No']] = 0.5

let dis = new Distribution(map, a, weather, city, party)

dis.print()

map = {}
map[['Yes', 'winndy', 'b']] = 0.7
map[['No', 'sunny', 'B']] = 0.3
map[['Yes', 'sunny', 'b']] = 0.2

let b = new Variable('b', ['b', 'B'])

let dis2 = new Distribution(map, party, weather, b)
dis2.print()
dis.multiply(dis2)
