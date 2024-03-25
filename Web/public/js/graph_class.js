const FormatVersion = 1

class Vector2 {
    constructor(x, y) {
        this.x = x ?? 0
        this.y = y ?? 0
    }

    toString() {
        return `(${this.x}, ${this.y})`
    }

    Add(b) {
        return new Vector2(this.x + b.x, this.y + b.y)
    }

    Subtract(b) {
        return new Vector2(this.x - b.x, this.y - b.y)
    }

    rAdd(b) {
        this.x += b.x
        this.y += b.y
    }

    rSubtract(b) {
        this.x -= b.x
        this.y -= b.y
    }

    Equals(b) {
        return (this.x == b.x && this.y == b.y)
    }
}

class Connector{
    constructor(DataType, IsList, IsUnion) {
        this.Parent = null
        this.IsInput = true

        this.IsList = IsList ?? false
        this.IsUnion = IsUnion ?? false
        this.DataType = DataType ?? "exec"
        this.Connections = []
    }
}

class Node {
    constructor(StartingVector, ChipUUID, [InputConnectors, OutputConnectors]) {
        this.id = crypto.randomUUID()
        this.ChipUUID = ChipUUID

        this.Position = StartingVector // should be vector2
        this.Inputs = InputConnectors
        this.Outputs = OutputConnectors
        
        this.Inputs.forEach(conn => {
            conn.Parent = this
        });
        
        this.Outputs.forEach(conn => {
            conn.Parent = this
            conn.IsInput = false
        });

    }
}

class Graph {
    constructor() {
        this.Position = new Vector2()
        this.Size = new Vector2(1, 1)
        this.Nodes = {}
    }

    AddNode(node) {
        this.Nodes[node.id] = node
    }
    RemoveNode(nodeOrId) {
        if (typeof(nodeOrId) == "string") {
            delete this.Nodes[nodeOrId]
        } else {
            delete this.Nodes[nodeOrId.id]
        }
    }

    GenerateGraph(GraphSource, ChipSource) {
        this.Nodes = {}
        let GraphSettings = GraphSource.GraphSettings

        if (GraphSettings) {
            this.Position = new Vector2(GraphSettings.Position[0], GraphSettings.Position[1])
            this.Size = new Vector2(GraphSettings.Zoom, GraphSettings.Zoom)
        }

        let GraphNodes = GraphSource.Nodes
        for (const [chipID, ChipContents] of Object.entries(GraphNodes)) {
            this.Nodes[chipID] = new Node()
        }
    }

    GenerateFile() {
        
        return {
            Format: FormatVersion,
            Nodes: {}
        }
    }
}

export {
    Graph, Node, Connector, Vector2
}