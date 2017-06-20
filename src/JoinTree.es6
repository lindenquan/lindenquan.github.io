class Seperator {
    constructor(node1, node2) {
        this.between = []
        this.between.push(node1)
        this.between.push(node2)
        this.distr = Distribution.UNIT
    }
}

class ShaferSeperator {
    constructor(node1, node2) {
        this.from = node1
        this.to = node2
        this.distr = null
    }
}

class Node {
    constructor(distr, vars) {
        this.varNames = []
        vars.forEach(v => this.varNames.push(v.name))

        this.distr = distr
            //edges contains all neighbour nodes
        this.edges = new Set()
            // father is another Node
        this.father = null
            // childern is a set object containing children nodes
        this.children = new Set()
    }

    sendMessage(node, seperator) {
        let commonVarNames = Tool.arrayIntersect(this.varNames, node.varNames)
        let distr = this.distr.sumOnto(commonVarNames)
        seperator.distr = distr.divide(seperator.distr)
        node.distr = node.distr.multiply(seperator.distr)
    }

    setShaferMessage(node, seperator, seps) {
        let commonVarNames = Tool.arrayIntersect(this.varNames, node.varNames)
        let distr = Distribution.UNIT
        for (let sep of seps) {
            if (sep.from != node) {
                distr = distr.multiply(sep.distr)
            }
        }
        distr = distr.multiply(this.distr)
        seperator.distr = distr.sumOnto(commonVarNames)
    }
}

class JoinTree {
    constructor() {
        this.nodes = []
        this.seperators = new Set()
        this.shaferSeperators = new Set()
        this.root = null
    }

    addNode(distr, vars) {
        this.nodes.push(new Node(distr, vars))
    }

    addEdge(dis1, dis2) {
        let node1 = this.findNode(dis1)
        let node2 = this.findNode(dis2)

        node1.edges.add(node2)
        node2.edges.add(node1)

        this.seperators.add(new Seperator(node1, node2))
        this.shaferSeperators.add(new ShaferSeperator(node1, node2))
        this.shaferSeperators.add(new ShaferSeperator(node2, node1))

    }

    findNode(distr) {
        let node = this.nodes.filter(node => node.distr === distr)
        if (node.length != 1) {
            console.log("cannot find the node")
        } else {
            return node[0]
        }
    }

    // return Set object which contains leaf nodes
    buildHierarchyReturnLeaves(root) {
        let fatherPool = new Set()
        let newFatherPool = new Set()
        let childPool = new Set()
        fatherPool.add(root)
        this.nodes.forEach(node => {
            if (node != root) {
                childPool.add(node)
            }
        })
        let leaves = new Set()
        while (childPool.size != 0) {
            for (let father of fatherPool) {
                for (let neighbour of father.edges) {
                    if (childPool.has(neighbour)) {
                        father.children.add(neighbour)
                        neighbour.father = father
                        childPool.delete(neighbour)
                        if (neighbour.edges.size == 1) {
                            leaves.add(neighbour)
                        } else {
                            newFatherPool.add(neighbour)
                        }
                    }
                }
            }
            fatherPool = newFatherPool
        }
        return leaves

    }

    findSeperator(node1, node2) {
        for (let sep of this.seperators) {
            let between = sep.between
            if (between[0] === node1 && between[1] === node2) {
                return sep
            }
            if (between[1] === node1 && between[0] === node2) {
                return sep
            }
        }
    }

    findShaferSeperator(from, to) {
        for (let sep of this.shaferSeperators) {
            if (sep.from === from && sep.to === to) {
                return sep
            }
        }
    }

    runHugin() {
        this.root = this.nodes[0]
        this.buildHierarchy()
        this.sort()

        // set sperators from leaves to root
        this.nodes.forEach(node => {
            let father = node.father
            if (father != null) {
                node.sendMessage(father, this.findSeperator(node, father))
            }
        })

        // set sperators from root to leaves
        this.nodes.reverse().forEach(node => {
            let children = node.children
            children.forEach(child => {
                let father = node
                father.sendMessage(child, this.findSeperator(father, child))
            })
        })
    }

    /** ${from} a Node object denoting start node
     *  ${to} a Node object denoting end node. If ${to} is null, it means ${to} is the farest node from ${from} 
     *  return an array contains path nodes from $ { from } to $ { to }
     */
    getPath(from, to) {
        if (from === to) {
            return [from]
        }
        let s = []
        let q = []
        s.push(from)
        q.push(from)
        from.path = [from]
        let lastPath = null

        while (q.length != 0) {
            let c = q.shift()
            let path = c.path

            for (let neighbour of c.edges) {
                if (s.indexOf(neighbour) == -1) {
                    if (to === neighbour) {
                        path.push(neighbour)
                        return path
                    }
                    s.push(neighbour)
                    q.push(neighbour)
                    neighbour.path = []
                    let np = neighbour.path
                    path.forEach(p => np.push(p))
                    np.push(neighbour)
                    lastPath = np
                }
            }
        }

        return lastPath
    }

    findCenterNode() {
        let node1 = this.nodes[0]
        let path1 = this.getPath(node1, null)
        let path2 = this.getPath(path1[path1.length - 1], null)
        return path2[((path2.length - 1) / 2) | 0]
    }

    // returen a Set ojbect containing all sperators to ${node}
    findAllShaferSeperators(node) {
        let result = new Set()
        for (let sep of this.shaferSeperators) {
            if (sep.to === node) {
                result.add(sep)
            }
        }
        return result
    }

    length(from, to) {
        if (from === to) {
            return 0
        }
        return this.getPath(from, to).length
    }

    // sort ${nodes} by the descending distance to ${root}. 
    // after this function the nodes in ${node} will be sorted
    // ${nodes} is a Set object or an Array object containing Node objects
    sortNodes(nodes, root) {
        let array = null
        let notArray = !Array.isArray(nodes)

        if (notArray) {
            array = Array.from(nodes)
        } else {
            array = nodes
        }

        if (DEBUG) {
            console.log("before sort:")
            array.forEach(n => console.log(n.varNames))
        }

        array.sort((a, b) => {
            a = this.length(a, root)
            b = this.length(b, root)
            return b - a
        })

        if (DEBUG) {
            console.log("after sort:")
            array.forEach(n => console.log(n.varNames))
        }

        if (notArray) {
            nodes.clear()
            array.forEach(v => nodes.add(v))
        }

    }

    sort() {
        this.sortNodes(this.nodes, this.root)
    }

    buildHierarchy() {
        this.buildHierarchyReturnLeaves(this.root)
    }

    runShaferShenoy() {
        this.root = this.nodes[0]
        this.buildHierarchy()
        this.sort()

        // set sperators from leaves to root
        this.nodes.forEach(node => {
            let father = node.father
            if (father != null) {
                node.setShaferMessage(father, this.findShaferSeperator(node, father), this.findAllShaferSeperators(node))
            }
        })

        // set sperators from root to leaves
        this.nodes.reverse().forEach(node => {
            let children = node.children
            children.forEach(child => {
                let father = node
                father.setShaferMessage(child, this.findShaferSeperator(father, child), this.findAllShaferSeperators(father))
            })
        })

        // update each node's distribution
        this.nodes.forEach(node => {
            let seps = this.findAllShaferSeperators(node)
            seps.forEach(sep => {
                node.distr = node.distr.multiply(sep.distr)
            })
            node.distr.normalize()
        })
    }

    printTree() {
        console.log("Join Tree:")
        this.nodes.forEach(node => {
            node.edges.forEach(neig => {
                console.log(`${node.distr.name} -- ${neig.distr.name}`)
            })
        })
    }

    printNodes() {
        console.log("Join Tree Nodes:")
        this.nodes.forEach(node => {
            node.distr.print()
        })
    }
}
