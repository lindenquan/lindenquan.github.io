class Distribution {
    constructor(map, ...vars) {
        // an array of Variable objects
        this.vars = vars
            // key is string, value is probability
            // key consists of domain values seperated with comma ','
        this.map = map
        this.varNames = []
        this.name = ''
        vars.forEach((v) => this.varNames.push(v.name))
    }

    multiply(dis) {
        let commonVarNames = Tool.arrayIntersect(this.varNames, dis.varNames)
        let commonVarIndices = this.getIndices(commonVarNames)
        let vars = Tool.varUnion(this.vars, dis.vars)
        let map = {}
        for (let key in this.map) {
            let commonValues = this.getValues(commonVarIndices, key)
            let matchingMap = dis.subMap(commonVarNames, commonValues)
            for (let subKey in matchingMap) {
                map[Tool.stringUnion(key, subKey)] = Tool.productDecimals(this.map[key], matchingMap[subKey])

            }
        }
        let product = new Distribution(map, ...vars)
        product.print()
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
