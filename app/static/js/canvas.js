// Gets the data of the seat available and seats occupied for show
schema = getJSON("seats-available")
seats_occ = getJSON("seats-occupied")["seats"]

let canvas = document.querySelector("canvas")
let ctx = canvas.getContext("2d")

AVAILABLE_SEAT_COLOR = "#d0c8ea"
OCCUPIED_SEAT_COLOR = "#8f7ece"
SELECTED_SEAT_COLOR = "#553fa6"

// class to represent seat in canvas
class Seat {
    constructor(x, y, width, height, label) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
        this.reserved = false;
        this.selected = false;
    }
    draw(context) {
        if (this.selected && !this.reserved) {
            context.fillStyle = SELECTED_SEAT_COLOR;
        } else {
            context.fillStyle = AVAILABLE_SEAT_COLOR;
        }
        // check if already reserved
        if (seats_occ.find((i) => i == this.label)) {
            context.fillStyle = OCCUPIED_SEAT_COLOR;
            this.reserved = true;
        }
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    isClicked(xmouse, ymouse) {
        if ((this.x < xmouse && xmouse < (this.x + this.width)) && (this.y < ymouse && ymouse < (this.y + this.height))) {
            return this.label;
        } else {
            return null;
        }
    };
}

// General method to get data from Document
function getJSON(elid) {
    let i = document.getElementById(elid).innerText
    return JSON.parse(i.replaceAll("'", '"'));
}


let SIZE = canvas.parentElement.clientWidth;
canvas.width = 0.75 * SIZE;
canvas.height = 0.43 * SIZE;

let ROW_NAME = "";
let PREP_SEATS_LAYOUT = {}
// creates the object to represent data friendlier format to render
for (let i = 0; i < schema["seats"].length; i++) {
    if (!Object.hasOwn(PREP_SEATS_LAYOUT, schema["seats"][i][0])) {
        ROW_NAME = schema["seats"][i][0];
        PREP_SEATS_LAYOUT[ROW_NAME] = [];
        PREP_SEATS_LAYOUT[ROW_NAME].push(schema["seats"][i]);
    } else {
        PREP_SEATS_LAYOUT[schema["seats"][i][0]].push(schema["seats"][i]);
    }
}


// get no of rows and cols to nicely  prepare layout
let MAX_ROW = Object.keys(PREP_SEATS_LAYOUT).length
let MAX_COL = 0;
for (const [k, v] of Object.entries(PREP_SEATS_LAYOUT)) {
    if (v.length > MAX_COL) {
        MAX_COL = v.length;
    }
}

let TWIDTH = canvas.width;
let THEIGHT = canvas.height;


let HEIGHT = THEIGHT * (0.7 / MAX_ROW);
let WIDTH = TWIDTH * (0.8 / (MAX_COL - 1));
let FACTOR = 0.9;

let THEATER_COLOR = "#8f7ece";

// draws the theater
// c.strokRect(0,0,100,100)
ctx.fillStyle = THEATER_COLOR;
ctx.fillRect(0.1 * TWIDTH, 0.01 * THEIGHT, 0.8 * TWIDTH, 0.1 * THEIGHT)

let j = 0;
let SEATS = []
for (const [k, v] of Object.entries(PREP_SEATS_LAYOUT)) {
    for (let i = 0; i < v.length; i++) {
        let a = new Seat(
            (0.1 * TWIDTH - (WIDTH / 2)) + i * WIDTH,
            0.30 * THEIGHT + j * HEIGHT,
            WIDTH * 0.9,
            HEIGHT * 0.9,
            v[i]
        )
        a.draw(ctx)
        SEATS.push(a);
    }
    j++;
}

let SELECTED_SEAT = []
let it = document.getElementById("id_seat")
canvas.addEventListener("click", function (event) {
    // Check if the seat was clicked
    let seat = SEATS.filter((s) => {
        if (s && s.isClicked(event.offsetX, event.offsetY) && !s.reserved) {
            return s;
        } else {
            return null
        }
    })
    if (Boolean(seat[0])) {
        if (SELECTED_SEAT.find((s) => s == seat[0])) {
            SELECTED_SEAT.splice(SELECTED_SEAT.findIndex((i) => i == seat[0]), 1);
            seat[0].selected = false;
            seat[0].draw(ctx)
        } else {
            SELECTED_SEAT.push(seat[0]);
            seat[0].selected = true;
            seat[0].draw(ctx)
        }
        it.value = ""
        console.log("selected seat", SELECTED_SEAT);
        SELECTED_SEAT.forEach((i) => {
            it.value += i.label + " ";
        });
    }
})

let general = document.getElementById("id_general");
let senior = document.getElementById("id_senior");
let children = document.getElementById("id_children");

const form = document.querySelector('form');
form.addEventListener('submit', function (event) {
    gen = parseInt(general.value);
    sen = parseInt(senior.value);
    cld = parseInt(children.value);
    if ((gen + sen + cld) != SELECTED_SEAT.length) {
        alert("Please make sure that seats selected and number of guests are same.")
        event.preventDefault();
    }
    if (SELECTED_SEAT.length == 0) {
        alert("Atleast one ticket has to be selected.")
        event.preventDefault();
    }
})
let grate = document.getElementById("rate_general");
let srate = document.getElementById("rate_senior");
let crate = document.getElementById("rate_children");
let gbill = document.getElementById("ticket_general");
let sbill = document.getElementById("ticket_senior");
let cbill = document.getElementById("ticket_children");
let totalbill = document.getElementById("total_b4_tax");
let taxbill = document.getElementById("total_tax");
let netbill = document.getElementById("net_total");

function updateField(item, val) {
    let v = parseFloat(val).toFixed(2);
    item.innerText = v;
    return v;
}

function updateBill(event) {
    if (event.target.id == "id_general") {
        gbill.innerText = event.target.valueAsNumber;
    } else if (event.target.id == "id_senior") {
        sbill.innerText = event.target.valueAsNumber;
    } else {
        cbill.innerText = event.target.valueAsNumber;
    }
    let total_b4_tax = (parseFloat(grate.innerText) * parseFloat(general.value) +
        parseFloat(srate.innerText) * parseFloat(senior.value) +
        parseFloat(crate.innerText) * parseFloat(children.value)).toFixed(2);
    let tb = updateField(totalbill, total_b4_tax);
    let tt = updateField(taxbill, (0.135 * tb));
    updateField(netbill, (parseFloat(tb) + parseFloat(tt)));

}

general.addEventListener("change", updateBill);
senior.addEventListener("change", updateBill);
children.addEventListener("change", updateBill);
