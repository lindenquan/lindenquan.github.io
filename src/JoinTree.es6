class Seperator {
    constructor(node1, node2) {
        this.between = []
        this.between.push(node1)
        this.between.push(node2)
        this.distr = Distribution.UNIT
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
        let dist = this.distr.sumOnto(commonVarNames)
        seperator.distr = dist.divide(seperator.distr)
        node.distr = node.distr.multiply(seperator.distr)
    }
}

class JoinTree {
    constructor() {
        this.nodes = []
        this.seperators = new Set()
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

    runHugin() {
        let root = this.nodes[0]
        let leaves = this.buildHierarchyReturnLeaves(root)

        while (leaves.size != 0) {
            let newLeaves = new Set()
            leaves.forEach(leaf => {
                let father = leaf.father
                leaf.sendMessage(father, this.findSeperator(leaf, father))
                if (father != root) {
                    newLeaves.add(father)
                }
            })
            leaves = newLeaves
        }

        let children = root.children
        while (children.size != 0) {
            let newChildren = new Set()
            children.forEach(child => {
                child.father.sendMessage(child, this.findSeperator(child.father, child))
                child.children.forEach(child => {
                    newChildren.add(child)
                })
            })
            children = newChildren
        }
    }

    runShaferShenoy() {

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
