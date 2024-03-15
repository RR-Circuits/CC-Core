var selectedChip, offset, transform;
var svg = null

var currentSize = 1

function zoomIn(evt) {
    if (!currentSize > 2) {
        currentSize += 0.25
        updateSize()
    }
}

function zoomOut(evt) {
    if (!currentSize < 0.50) {
        currentSize -= 0.25
        updateSize()
    }
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

function dragMove(evt) {
    evt.preventDefault()
    var mouse = getMousePosition(evt)
    if (selectedChip) {
        transform.setTranslate(mouse.x - offset.x, mouse.y - offset.y)
    }
}

function dragEnd(evt) {
    selectedChip = null
}

function makeDraggable(evt) {
    svg = evt.target
    svg.addEventListener("mousedown", dragStart)
    svg.addEventListener("mousemove", dragMove)
    svg.addEventListener("mouseup", dragEnd)
    svg.addEventListener("mouseleave", dragEnd)
}