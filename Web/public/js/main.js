import {Graph, Node, Connector, Vector2} from "./graph_class.js"

var headGraph = new Graph()
var selectedChip, offset, transform, SVGGroup;
var bgDragActive = false
var svg = null
var pt = null

var bgOldMousePos = new Vector2(0, 0)

var oldGraphPos = new Vector2(0, 0)

var bgOffset = new Vector2(0, 0)
var selectedOffset = new Vector2(0, 0)

//Enums
const MouseButtons = {
    Primary: 0,
    Middle: 1,
    Secondary: 2
}
//

var mainGTransform = {
    scale: new Vector2(1, 1),
    translate: new Vector2(0, 0)
}

var selectedTransform = {
    scale: new Vector2(1, 1),
    translate: new Vector2(0, 0)
}

// Get point in global SVG space
function swreenMousePosition(evt){
  pt.x = evt.clientX; pt.y = evt.clientY;

  let mtrx = pt.matrixTransform(svg.getScreenCTM().inverse())
  return new Vector2(mtrx.x, mtrx.y);
}

function screenMousePosition(evt) {
    var CTM = svg.getScreenCTM();
    return new Vector2((evt.clientX - CTM.e) / CTM.a, (evt.clientY - CTM.f) / CTM.d)
}

function applyTransform(target, isBG) {
    // if the tagrget is the background, use that variable
    let targetTransform = isBG ? mainGTransform : selectedTransform
    target.setAttribute("transform", `translate(${targetTransform.translate.x}, ${targetTransform.translate.y}) scale(${targetTransform.scale.x}, ${targetTransform.scale.y})`)
}

const maxZoom = 3
const minZoom = 0.25

var zoomAmount = 1

var posFromCenter = new Vector2(0, 0)

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
const r = document.querySelector(":root")


const ControlMode = {
    Default: Symbol("default"),
    Mobile: Symbol("mobile")
}

function updateSize() {
    var translate = svg.createSVGTransform();
        translate.setScale(0, 0);
        // Add the translation to the front of the transforms list
        SVGGroup.transform.baseVal.insertItemBefore(translate, 0);
    gTransform = SVGGroup.transform.baseVal.getItem(0)
    gTransform.setScale(zoomAmount, zoomAmount)
    changeBG()
}

var currentControlMode = ControlMode.Default

function changeBG(bgPos) {
    let r = document.querySelector(":root")

    r.style.setProperty("--bg-x", bgPos.x + "px")
    r.style.setProperty("--bg-y", bgPos.y + "px")

    r.style.setProperty("--bg-spacing", 20 * zoomAmount + "px")
    r.style.setProperty("--bg-dotsize", zoomAmount + "px")
}

function dragStart(evt) {
    if (currentControlMode == ControlMode.Mobile) return;
    evt.preventDefault()
    let mouse = bgOldMousePos = screenMousePosition(evt)
    
    switch (evt.button) {
        case MouseButtons.Primary:
            let ChipEl = evt.target.parentElement
            if (ChipEl.classList.contains("chip")) {
                selectedChip = headGraph.Nodes[ChipEl.id]
                
                let ChipPos = selectedChip.Position
                selectedOffset = mouse.Subtract(ChipPos)
            }
            break;
        case MouseButtons.Middle:
            bgDragActive = true
            oldGraphPos = headGraph.Position
            bgOffset = mouse.Subtract(headGraph.Position)
            //console.log(`Background Offset: ${bgOffset}`)
            break;
    }
}

function scrolling(evt) {
    if (currentControlMode != ControlMode.Default) return;
    evt.preventDefault()

}

// dragging functions

function dragBackground(evt) {
    let newMousePos = screenMousePosition(evt)
    headGraph.Position = newMousePos.Subtract(bgOffset)

    SVGGroup.setAttribute("transform", `translate(${headGraph.Position.x}, ${headGraph.Position.y}) scale(${headGraph.Size.x}, ${headGraph.Size.y})`)
}

function dragChip(evt) {
    if (!selectedChip) return;
    let chipElem = document.getElementById(selectedChip.id)
    SVGGroup.appendChild(chipElem)

    //calculations
    let newMousePos = screenMousePosition(evt)
    selectedChip.Position = newMousePos.Subtract(selectedOffset.Subtract(bgDragActive ? oldGraphPos.Subtract(headGraph.Position) : new Vector2(0, 0)))

    //transformation
    chipElem.setAttribute("transform", `translate(${selectedChip.Position.x}, ${selectedChip.Position.y}) scale(${headGraph.Size.x}, ${headGraph.Size.y})`)
}
//

function dragMove(evt) {
    evt.preventDefault()
    if (evt.buttons == 1 || evt.buttons == 5) { // primary pressed
        dragChip(evt)
    }
    if (evt.buttons == 4 || evt.buttons == 5) { // middle pressed
        dragBackground(evt)
    }

    changeBG(headGraph.Position)
}

function dragEnd(evt) {
    if (evt.buttons == 1 || evt.buttons == 0) {
        bgDragActive = false
        bgOffset = new Vector2(0, 0)
        oldGraphPos = headGraph.Position

        if (selectedChip) {
            selectedOffset = screenMousePosition(evt).Subtract(selectedChip.Position)
        }
    }
    if (evt.buttons == 4 || evt.buttons == 0) {
        selectedChip = null
    }
}

function makeDraggable() {
    SVGGroup = document.getElementById("graphGroup")

    //temp
    let testNode1 = new Node(new Vector2(0, 0), "bad6a57b-2af8-4526-8caa-e07476da4a5b", [[
        //Inputs here
        new Connector("exec", false, false),
        new Connector("player", false, false),
        new Connector("room_destination", false, false)
    ], [
        //Outputs here
        new Connector("exec", false, false)
    ]])
    
    let testNode2 = new Node(new Vector2(0, 0), "bad6a57b-2af8-4526-8caa-e07476da4a5b", [[
        //Inputs here
        new Connector("exec", false, false),
        new Connector("player", false, false),
        new Connector("room_destination", false, false)
    ], [
        //Outputs here
        new Connector("exec", false, false)
    ]])

    testNode1.id = "chip_1"
    testNode2.id = "chip_2"

    headGraph.AddNode(testNode1)
    headGraph.AddNode(testNode2)
    //

    svg.addEventListener("mousedown", dragStart)
    svg.addEventListener("mousemove", dragMove)
    svg.addEventListener("mouseup", dragEnd)
    svg.addEventListener("mouseleave", dragEnd)
    svg.addEventListener("wheel", scrolling)
}

svg = document.getElementById("graph")
pt = svg.createSVGPoint();
makeDraggable()