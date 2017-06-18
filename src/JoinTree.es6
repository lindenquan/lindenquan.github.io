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
            this.sortLeaves(leaves, root)
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

    /** ${from} a Node object denoting start node
     *  ${to} a Node object denoting end node. If ${to} is null, it means ${to} is the farest node from ${from} 
     *  return an array contains path nodes from $ { from } to $ { to }
     */
    getPath(from, to) {
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
        return this.getPath(from, to).length
    }

    sortLeaves(leaves, root) {
        let array = Array.from(leaves)
        if (DEBUG) {
            console.log("before sort:")
            array.forEach(v => console.log(v.distr.name))
        }
        array.sort((a, b) => {
            a = this.length(a, root)
            b = this.length(b, root)
            return b - a
        })
        if (DEBUG) {
            console.log("after sort:")
            array.forEach(v => console.log(v.distr.name))
        }
        leaves.clear()
        array.forEach(v => leaves.add(v))
    }

    runShaferShenoy() {
        let root = this.nodes[0]
        let leaves = this.buildHierarchyReturnLeaves(root)

        // set sperators from leaves to root
        while (leaves.size != 0) {
            let newLeaves = new Set()
            leaves.forEach(leaf => {
                let father = leaf.father
                leaf.setShaferMessage(father, this.findShaferSeperator(leaf, father), this.findAllShaferSeperators(leaf))
                if (father != root) {
                    newLeaves.add(father)
                }
            })
            leaves = newLeaves
            this.sortLeaves(leaves, root)
        }

        // set sperators from root to leaves
        let children = root.children
        while (children.size != 0) {
            let newChildren = new Set()
            children.forEach(child => {
                let father = child.father
                father.setShaferMessage(child, this.findShaferSeperator(father, child), this.findAllShaferSeperators(father))
                child.children.forEach(child => {
                    newChildren.add(child)
                })
            })
            children = newChildren
        }

        // update each node's distribution
        this.nodes.forEach(node => {
            let seps = this.findAllShaferSeperators(node)
            seps.forEach(sep => {
                node.distr = node.distr.multiply(sep.distr)
            })
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
