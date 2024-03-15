const editMode = {
    Connect: Symbol("Connect"),
    Move: Symbol("Move"),
    Cursor: Symbol("Cursor")
}

/* <svg canvas>
 *  <g graph>
 *      <g chip>...</g>
 *  </g>
 * </svg>
 */

var currentMode = editMode.Move
var selectedChip, offset, transform;
var svg = null

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

function translateOffset() {
    
}

function dragStart(evt) {
    console.log("Drag started.")
    switch (currentMode) {
        case editMode.Connect:
            break;
        case editMode.Move:
            if (evt.target.parentElement.classList.contains("draggable")) {
                console.log("Drag start success.")
                selectedChip = evt.target.parentElement
                
                offset = getMousePosition(evt);
                
                var transforms = selectedChip.transform.baseVal;
                // Ensure the first transform is a translate transform
                if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
                    // Create an transform that translates by (0, 0)
                    var translate = svg.createSVGTransform();
                    translate.setTranslate(0, 0);
                    // Add the translation to the front of the transforms list
                    selectedChip.transform.baseVal.insertItemBefore(translate, 0);
                }
                // Get initial translation amount
                transform = transforms.getItem(0);
                offset.x -= transform.matrix.e;
                offset.y -= transform.matrix.f;
            }
            break;
        case editMode.Cursor:
            break;
    }
}

function dragMove(evt) {
    evt.preventDefault()
    var mouse = getMousePosition(evt)
    switch (currentMode) {
        case editMode.Connect:
            break;
        case editMode.Move:
            if (selectedChip) {
                console.log("A")
                transform.setTranslate(mouse.x - offset.x, mouse.y - offset.y)
            }
            break;
        case editMode.Cursor:
            break;
    }
}

function dragEnd(evt) {
    switch (currentMode) {
        case editMode.Connect:
            break;
        case editMode.Move:
            selectedChip = null
            break;
        case editMode.Cursor:
            break;
    }
}

function makeDraggable(evt) {
    svg = evt.target
    svg.addEventListener("mousedown", dragStart)
    svg.addEventListener("mousemove", dragMove)
    svg.addEventListener("mouseup", dragEnd)
    svg.addEventListener("mouseleave", dragEnd)
}