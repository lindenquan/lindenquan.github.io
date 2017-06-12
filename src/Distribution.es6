class Distribution {
    constructor(map, ...vars) {
        // an array of Variable objects
        this.vars = vars
            // key is string, value is probability
            // key consists of domain values seperated with comma ','
        this.map = map
        this.varNames = []
        this.name = 'unknown'
        vars.forEach((v) => this.varNames.push(v.name))
    }

    static calculate(dis1, dis2, operator) {
        let commonVarNames = Tool.arrayIntersect(dis1.varNames, dis2.varNames)
        let commonVarIndices = dis1.getIndices(commonVarNames)
        let vars = Tool.varUnion(dis1.vars, dis2.vars)
        let map = {}
        for (let key in dis1.map) {
            let commonValues = dis1.getValues(commonVarIndices, key)
            let matchingMap = dis2.subMap(commonVarNames, commonValues)
            for (let subKey in matchingMap) {
                map[Tool.stringUnion(key, subKey)] = operator(dis1.map[key], matchingMap[subKey])

            }
        }
        let product = new Distribution(map, ...vars)
        return product

    }

    indicesOn(vars) {
        let indices = []
        let l = this.varNames.length
        let l1 = vars.length
        for (let i = 0; i < l1; i++) {
            for (let index = 0; index < l; index++) {
                if (vars[i].name === this.varNames[index]) {
                    indices.push(index)
                    break
                }
            }
        }
        return indices
    }

    valuesOn(key, indices) {
        let l = indices.length
        let values = key.split(',')
        let results = []
        for (let i = 0; i < l; i++) {
            results.push(values[indices[i]])
        }

        return results
    }

    marginalOnto(vars) {
        let map = {}
        let set = new Set()
        let indices = this.indicesOn(vars)
        for (let key in this.map) {
            let values = this.valuesOn(key, indices)
            let strV = values.toString()

            if (set.has(strV)) {
                continue
            } else {
                set.add(strV)

                let sum = 0
                for (let key in this.map) {
                    if (strV === this.valuesOn(key, indices).toString()) {
                        sum = Tool.addDecimal(sum, this.map[key])
                    }
                }
                map[strV] = sum
            }
        }
        let dis = new Distribution(map, ...vars)
        dis.name = `ϕ(${vars.map((v)=>v.name)})`
        return dis
    }

    divide(dis) {
        let result = Distribution.calculate(this, dis, Tool.divisionDecimals)
        result.name = `${this.name}/${dis.name}`
        return result
    }

    multiply(dis) {
        let result = Distribution.calculate(this, dis, Tool.productDecimals)
        result.name = `${this.name}*${dis.name}`
        return result
    }

    // varNames is an array containing variable indices
    // values is an array containing values corresponding $varNames
    // return a map whose key is a string, value is the value of probability
    // the key of the returned map contains variable names that are not $varNames
    // For example: varNames=[c,b] values=[0,1], this.varNames = [a,b,c], this.map={'0,1,0':0.2,'0,0,0':0.5}
    // then the returned map is {'0':0.2}
    subMap(varNames, values) {
        let map = {}
        mainLoop: for (let key in this.map) {
            let allValues = key.split(',')
            let l = allValues.length
            for (let i = 0; i < l; i++) {
                let v = allValues[i]
                let index = varNames.indexOf(this.varNames[i])
                if (index > -1) {

                    if (values[index] === v) {

                        continue
                    } else {
                        continue mainLoop
                    }
                }
            }
            map[key] = this.map[key]
        }
        return map
    }


    // indices is an array containing value of indices
    // row is a sting containing values separated with a comma ','
    // return an array that contains value from row according to indices.
    // for example: indicies:[1,4] row='a,b,c,d,e' then return ['b','e']
    getValues(indices, row) {
        let subValues = []
        let values = row.split(',')

        for (let index in indices) {
            subValues.push(values[indices[index]])
        }
        return subValues
    }

    getIndices(varNames) {
        let index = []
        let l = this.varNames.length
        for (let i = 0; i < l; i++) {
            if (varNames.indexOf(this.varNames[i]) > -1) {
                index.push(i)

            }
        }
        return index
    }

    print() {
        console.log('****************************')
        console.log(this.name)
        let tab = '\t\t';
        let vNames = ''
        this.vars.forEach((v) => vNames += `${v.name}${tab}`)
        console.log(vNames)

        for (let key in this.map) {
            console.log(key.replace(/,/g, tab) + `${tab}${this.map[key]}`)
        }
        console.log('****************************')
    }

    printDomain(index) {
        let variable = this.vars[index]
        console.log(`${variable.name}:${variable.domain}`)
    }
}
