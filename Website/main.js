var selectedChip, offset, transform, SVGGroup;
var svg = null
var currentSize = 1
var posFromCenter = {
    x: 0,
    y: 0
}

const r = document.querySelector(":root")

const ControlMode = {
    Default: Symbol("default"),
    Touchpad: Symbol("touchpad"),
    Mobile: Symbol("mobile")
}

var currentControlMode = ControlMode.Default

function changeTouchpad() {
    currentControlMode = ControlMode.Touchpad
    console.log(currentControlMode)
}

function changeMouse() {
    currentControlMode = ControlMode.Default
    console.log(currentControlMode)
}

function DetectDevice() {
    let isMobile = window.matchMedia || window.msMatchMedia;
    if (isMobile) {
      let match_mobile = isMobile("(pointer:coarse)");
      return match_mobile.matches;
    }
    return false;
}

if (DetectDevice()) {
    currentControlMode = ControlMode.Mobile
}

function updateSize() {
    
}

function getMousePosition(evt) {
    var CTM = svg.getScreenCTM();
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

function changeMode(newMode) {
    if (newMode in editMode && newMode != currentMode) {
        selectedChip = null
        currentMode = newMode
    }
}

function changeBG(deltaX, deltaY) {
    /*let offX, offY

    let oldX = Number(rs.getPropertyValue("--bg-x").replace(/^\D+/g, ''))
    let oldY = Number(rs.getPropertyValue("--bg-y").replace(/^\D+/g, ''))

    console.log("x" + oldX + "y" + oldY)

    oldX = Math.abs(oldX)
    oldY = Math.abs(oldY)

    offX = deltaX
    offY = deltaY

    if (deltaX == null || deltaY == null) {
        offX = offset.x
        offY = offset.y
    }

    r.style.setProperty("--bg-x", oldX + offX + "px")
    r.style.setProperty("--bg-y", oldY + offY + "px")*/

    let r = document.querySelector(":root")
    let rs = getComputedStyle(r)

    r.style.setProperty("--bg-x", deltaX + "px")
    r.style.setProperty("--bg-y", deltaY + "px")
}

function translateOffset(el) {
    var transforms = el.transform.baseVal;
    // Ensure the first transform is a translate transform
    if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
    // Create an transform that translates by (0, 0)
    var translate = svg.createSVGTransform();
        translate.setTranslate(0, 0);
        // Add the translation to the front of the transforms list
        el.transform.baseVal.insertItemBefore(translate, 0);
    }
    return transforms
}

function dragStart(evt) {
    //console.log(evt.target)
    if (currentControlMode == ControlMode.Mobile) return;
    evt.preventDefault()
    switch (evt.button) {
        case 0:
            if (evt.target.classList.contains("grabBase")) {
                selectedChip = evt.target.parentElement;
    
                offset = getMousePosition(evt);
    
                transform = translateOffset(selectedChip).getItem(0);
                offset.x -= transform.matrix.e;
                offset.y -= transform.matrix.f;
            }
            else {
            }
            break;
        case 1:
            selectedChip = document.getElementById("graphGroup");
    
            offset = getMousePosition(evt);
    
            transform = translateOffset(selectedChip).getItem(0);
            offset.x -= transform.matrix.e;
            offset.y -= transform.matrix.f;
            break;
    }
}

function scrolling(evt) {
    if (currentControlMode != ControlMode.Touchpad) return;
    evt.preventDefault()

    transform = translateOffset(SVGGroup).getItem(0);

    transform.setTranslate(transform.matrix.e - evt.deltaX, transform.matrix.f - evt.deltaY)
    posFromCenter.x -= evt.deltaX
    posFromCenter.y -= evt.deltaY

    changeBG(posFromCenter.x, posFromCenter.y)
}

function dragMove(evt) {
    evt.preventDefault()
    var mouse = getMousePosition(evt)
    if (selectedChip) {
        SVGGroup.append(selectedChip)
        transform.setTranslate(mouse.x - offset.x, mouse.y - offset.y)
        
        if (selectedChip != document.getElementById("graphGroup")) {
            posFromCenter.x -= (mouse.x - offset.x)
            posFromCenter.y -= (mouse.y - offset.y)
            changeBG(posFromCenter.x, posFromCenter.y)
        }
    }
}

function dragEnd(evt) {
    selectedChip = null
}

function makeDraggable(evt) {
    svg = evt.target
    SVGGroup = document.getElementById("graphGroup")

    svg.addEventListener("mousedown", dragStart)
    svg.addEventListener("mousemove", dragMove)
    svg.addEventListener("mouseup", dragEnd)
    svg.addEventListener("mouseleave", dragEnd)
    svg.addEventListener("wheel", scrolling)
}