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


let map = {}
map[['sunny', 'Regina', 'Yes']] = 0.4
map[['sunny', 'Toronto', 'No']] = 0.5
map[['sunny', 'Toronto', 'Yes']] = 0.1
map[['sunny', 'Regina', 'No']] = 0

let dis = new Distribution(map, weather, city, party)
dis.name = 'P(w,c,p)'

dis.print()

map = {}
map[['Yes', 'winndy']] = 0.7
map[['No', 'sunny']] = 0.3
map[['Yes', 'sunny']] = 0.2

let dis2 = new Distribution(map, party, weather)

dis2.name = 'P(p,w)'
dis2.print()
dis.multiply(dis2).print()
dis.divide(dis2).print()
dis.marginalOnto([party, weather]).print()
