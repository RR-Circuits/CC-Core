import {Graph, Node, Connector, Vector2} from "./graph_class.js"

var headGraph = new Graph()
var selectedChip, offset, transform, SVGGroup;
var bgDragActive = false
var svg = null
var pt = null

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
function screenMousePosition(evt){
  pt.x = evt.clientX; pt.y = evt.clientY;

  let mtrx = pt.matrixTransform(svg.getScreenCTM().inverse())
  return new Vector2(mtrx.x, mtrx.y);
}

function setTransform(isBG, [scaleX, scaleY], [translateX, translateY]) {
    let targetTransform = isBG ? mainGTransform : selectedTransform
    let scl = targetTransform.scale
    let trn = targetTransform.translate

    scl.x = scaleX ? scaleX : scl.x
    scl.y = scaleY ? scaleY : scl.y

    trn.x = translateX ? translateX : trn.x
    trn.y = translateY ? translateY : trn.y
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

function swreenMousePosition(evt) {
    return new Vector2(evt.clientX, evt.clientY)
}

function changeBG(deltaX, deltaY) {
    let r = document.querySelector(":root")

    r.style.setProperty("--bg-x", deltaX + "px")
    r.style.setProperty("--bg-y", deltaY + "px")

    r.style.setProperty("--bg-spacing", 20 * zoomAmount + "px")
    r.style.setProperty("--bg-dotsize", zoomAmount + "px")
}

function dragStart(evt) {
    if (currentControlMode == ControlMode.Mobile) return;
    evt.preventDefault()
    let mouse = screenMousePosition(evt)
    
    switch (evt.button) {
        case MouseButtons.Primary:
            let ChipEl = evt.target.parentElement
            if (ChipEl.classList.contains("chip")) {
                selectedChip = headGraph.Nodes[ChipEl.id]
                
                let ChipPos = selectedChip.Position
                selectedOffset = ChipPos.Subtract(mouse)
            }
            break;
        case MouseButtons.Middle:
            bgDragActive = true
            bgOffset = headGraph.Position.Subtract(mouse)
            break;
    }
}

function scrolling(evt) {
    if (currentControlMode != ControlMode.Default) return;
    evt.preventDefault()

}

// dragging functions

function dragBackground(evt) {
    console.log(headGraph.Position)
    headGraph.Position = bgOffset.Add(screenMousePosition(evt))

    SVGGroup.setAttribute("transform", `translate(${headGraph.Position.x / 1000}, ${headGraph.Position.y / 1000}) scale(${headGraph.Size.x}, ${headGraph.Size.y})`)
}

function dragChip(evt) {
    
}
//

function dragMove(evt) {
    evt.preventDefault()
    if (evt.buttons == 1) { // primary pressed
        dragChip(evt)
    } else if (evt.buttons == 4) { // middle pressed
        dragBackground(evt)
    } else if (evt.buttons == 5) { // both pressed
        dragChip(evt)
        dragBackground(evt)
    }
}

function dragEnd(evt) {
    if (evt.buttons == 0) { // no buttons pressed
        bgDragActive = false
        selectedChip = null
    } else if (evt.buttons == 1) { // only primary pressed
        bgDragActive = false
    } else if (evt.buttons == 4) { // only middle pressed
        selectedChip = null
    }
}

function makeDraggable() {
    SVGGroup = document.getElementById("graphGroup")

    //temp
    let testNode1 = new Node([0, 0], "bad6a57b-2af8-4526-8caa-e07476da4a5b", [[
        //Inputs here
        new Connector("exec", false, false),
        new Connector("player", false, false),
        new Connector("room_destination", false, false)
    ], [
        //Outputs here
        new Connector("exec", false, false)
    ]])
    
    let testNode2 = new Node([0, 0], "bad6a57b-2af8-4526-8caa-e07476da4a5b", [[
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