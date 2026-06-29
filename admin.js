const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbyeWpTv0Zw0F3TcffNKHF6i3lcIITrgKoTXzCdAzqb1n3d7qeHFtbtNwIKseFiFFAdh/exec";

let responses = [];
let filteredResponses = [];
let chart = null;

const tbody = document.querySelector("#guestTable tbody");

const totalResponses = document.getElementById("totalResponses");
const accepted = document.getElementById("accepted");
const declined = document.getElementById("declined");
const guestCount = document.getElementById("guestCount");

const searchBox = document.getElementById("searchBox");
const refreshBtn = document.getElementById("refreshBtn");
const downloadBtn = document.getElementById("downloadBtn");

const chartCanvas = document.getElementById("rsvpChart");

async function loadData() {

    showLoader();

    try {

        const response = await fetch(SCRIPT_URL);

        responses = await response.json();

        if (!Array.isArray(responses)) {

            responses = [];

        }

        filteredResponses = [...responses];

        updateCards();

        renderTable(filteredResponses);

        drawChart();

        updateTime();

    } catch (err) {

        console.error(err);

        toast("Unable to load dashboard", "#dc2626");

    }

    hideLoader();

}

function renderTable(data) {

    tbody.innerHTML = "";

    if (data.length === 0) {

        tbody.innerHTML =

            `<tr>

                <td colspan="6">

                    No RSVP Found

                </td>

            </tr>`;

        return;

    }

    data.forEach(item => {

        let badge = "";

        if (item.attendance === "Yes") {

            badge =

                `<span class="yes">

                    Accepted

                </span>`;

        }

        else if (item.attendance === "No") {

            badge =

                `<span class="no">

                    Declined

                </span>`;

        }

        else {

            badge =

                `<span class="maybe">

                    Maybe

                </span>`;

        }

        tbody.innerHTML +=

            `<tr>

                <td>${item.name}</td>

                <td>${badge}</td>

                <td>${item.guests}</td>

                <td>${item.message}</td>

                <td>${formatDate(item.timestamp)}</td>

                <td>

                    <button

                        class="edit"

                        data-row="${item.row}"

                    >

                        Edit

                    </button>

                    <button

                        class="delete"

                        data-row="${item.row}"

                    >

                        Delete

                    </button>

                </td>

            </tr>`;

    });

}

function updateCards() {

    totalResponses.innerHTML =

        responses.length;

    accepted.innerHTML =

        responses.filter(

            x => x.attendance === "Yes"

        ).length;

    declined.innerHTML =

        responses.filter(

            x => x.attendance === "No"

        ).length;

    let total = 0;

    responses.forEach(x => {

        total += Number(x.guests) || 0;

    });

    guestCount.innerHTML = total;

}

function drawChart() {

    const yes =

        responses.filter(

            x => x.attendance === "Yes"

        ).length;

    const no =

        responses.filter(

            x => x.attendance === "No"

        ).length;

    const maybe =

        responses.filter(

            x => x.attendance === "Maybe"

        ).length;

    if (chart) {

        chart.destroy();

    }

    chart = new Chart(chartCanvas, {

        type: "doughnut",

        data: {

            labels: [

                "Accepted",

                "Declined",

                "Maybe"

            ],

            datasets: [{

                data: [

                    yes,

                    no,

                    maybe

                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

function formatDate(date) {

    return new Date(date)

        .toLocaleString();

}

function updateTime() {

    const t =

        document.getElementById(

            "lastUpdated"

        );

    if (t) {

        t.innerHTML =

            "Last Updated : " +

            new Date()

            .toLocaleString();

    }

}

function showLoader() {

    const loader =

        document.getElementById(

            "loadingOverlay"

        );

    if (loader)

        loader.style.display = "flex";

}

function hideLoader() {

    const loader =

        document.getElementById(

            "loadingOverlay"

        );

    if (loader)

        loader.style.display = "none";

}

function toast(

    message,

    color = "#16a34a"

) {

    const div =

        document.createElement(

            "div"

        );

    div.className =

        "toast";

    div.style.background = color;

    div.innerHTML = message;

    document.body.appendChild(div);

    setTimeout(() => {

        div.remove();

    }, 3000);

}

searchBox.addEventListener("keyup", () => {

    const value = searchBox.value
        .trim()
        .toLowerCase();

    filteredResponses = responses.filter(item => {

        return (

            item.name
                .toLowerCase()
                .includes(value)

            ||

            item.attendance
                .toLowerCase()
                .includes(value)

            ||

            item.message
                .toLowerCase()
                .includes(value)

        );

    });

    renderTable(filteredResponses);

});

refreshBtn.addEventListener("click", () => {

    loadData();

});

downloadBtn.addEventListener("click", exportCSV);

function exportCSV() {

    let csv =
        "\uFEFFTimestamp,Name,Attendance,Guests,Message\n";

    responses.forEach(item => {

        csv +=

        `"${formatDate(item.timestamp)}",`

        + `"${escapeCSV(item.name)}",`

        + `"${escapeCSV(item.attendance)}",`

        + `"${item.guests}",`

        + `"${escapeCSV(item.message)}"\n`;

    });

    const blob =

        new Blob(

            [csv],

            {

                type:

                "text/csv;charset=utf-8"

            }

        );

    const link =

        document.createElement("a");

    link.href =

        URL.createObjectURL(blob);

    link.download =

        "Wedding_RSVP.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

}

function escapeCSV(text) {

    if (text == null)

        return "";

    return String(text)

        .replace(/"/g, '""');

}

document.addEventListener(

    "click",

    async function (e) {

        if (

            e.target.classList.contains(

                "delete"

            )

        ) {

            if (

                !confirm(

                    "Delete this RSVP?"

                )

            )

                return;

            const row =

                e.target.dataset.row;

            showLoader();

            const fd =

                new FormData();

            fd.append(

                "action",

                "delete"

            );

            fd.append(

                "row",

                row

            );

            fd.append(

                "token",

                "naveepandee2026"

            );

            try {

                await fetch(

                    SCRIPT_URL,

                    {

                        method: "POST",

                        body: fd

                    }

                );

                toast(

                    "Deleted"

                );

                loadData();

            }

            catch (err) {

                console.error(

                    err

                );

                toast(

                    "Delete Failed",

                    "#dc2626"

                );

            }

            hideLoader();

        }

    }

);

document.addEventListener(

    "click",

    function (e) {

        if (

            !e.target.classList.contains(

                "edit"

            )

        )

            return;

        const tr =

            e.target.closest(

                "tr"

            );

        const td =

            tr.querySelectorAll(

                "td"

            );

        td[0].innerHTML =

            `<input class="editName" value="${td[0].innerText}">`;

        td[1].innerHTML =

            `<select class="editAttendance">

<option>Yes</option>

<option>No</option>

<option>Maybe</option>

</select>`;

        td[2].innerHTML =

            `<input class="editGuests"

type="number"

value="${td[2].innerText}">`;

        td[3].innerHTML =

            `<input class="editMessage"

value="${td[3].innerText}">`;

        tr.querySelector(

            ".editAttendance"

        ).value =

            responses.find(

                x =>

                x.row ==

                e.target.dataset.row

            ).attendance;

        e.target.innerHTML =

            "Save";

        e.target.classList.remove(

            "edit"

        );

        e.target.classList.add(

            "save"

        );

    }

);

document.addEventListener(

    "click",

    async function (e) {

        if (

            !e.target.classList.contains(

                "save"

            )

        )

            return;

        const tr =

            e.target.closest(

                "tr"

            );

        const fd =

            new FormData();

        fd.append(

            "action",

            "update"

        );

        fd.append(

            "token",

            "naveepandee2026"

        );

        fd.append(

            "row",

            e.target.dataset.row

        );

        fd.append(

            "name",

            tr.querySelector(

                ".editName"

            ).value

        );

        fd.append(

            "attendance",

            tr.querySelector(

                ".editAttendance"

            ).value

        );

        fd.append(

            "guests",

            tr.querySelector(

                ".editGuests"

            ).value

        );

        fd.append(

            "message",

            tr.querySelector(

                ".editMessage"

            ).value

        );

        showLoader();

        try {

            await fetch(

                SCRIPT_URL,

                {

                    method: "POST",

                    body: fd

                }

            );

            toast(

                "Updated"

            );

            loadData();

        }

        catch (err) {

            console.error(

                err

            );

            toast(

                "Update Failed",

                "#dc2626"

            );

        }

        hideLoader();

    }

);

setInterval(() => {

    loadData();

}, 30000);

window.addEventListener("focus", () => {

    loadData();

});

window.addEventListener("online", () => {

    toast("Connection Restored");

    loadData();

});

window.addEventListener("offline", () => {

    toast(

        "Internet Disconnected",

        "#dc2626"

    );

});

function sortByName() {

    filteredResponses.sort((a, b) =>

        a.name.localeCompare(b.name)

    );

    renderTable(filteredResponses);

}

function sortByAttendance() {

    filteredResponses.sort((a, b) =>

        a.attendance.localeCompare(

            b.attendance

        )

    );

    renderTable(filteredResponses);

}

function sortByGuests() {

    filteredResponses.sort((a, b) =>

        Number(b.guests) -

        Number(a.guests)

    );

    renderTable(filteredResponses);

}

function filterAccepted() {

    filteredResponses = responses.filter(

        x => x.attendance === "Yes"

    );

    renderTable(filteredResponses);

}

function filterDeclined() {

    filteredResponses = responses.filter(

        x => x.attendance === "No"

    );

    renderTable(filteredResponses);

}

function filterMaybe() {

    filteredResponses = responses.filter(

        x => x.attendance === "Maybe"

    );

    renderTable(filteredResponses);

}

function resetFilter() {

    filteredResponses = [...responses];

    searchBox.value = "";

    renderTable(filteredResponses);

}

window.sortByName = sortByName;

window.sortByAttendance = sortByAttendance;

window.sortByGuests = sortByGuests;

window.filterAccepted = filterAccepted;

window.filterDeclined = filterDeclined;

window.filterMaybe = filterMaybe;

window.resetFilter = resetFilter;

function printDashboard() {

    window.print();

}

window.printDashboard = printDashboard;

function exportJSON() {

    const blob = new Blob(

        [

            JSON.stringify(

                responses,

                null,

                2

            )

        ],

        {

            type:

            "application/json"

        }

    );

    const a =

        document.createElement("a");

    a.href =

        URL.createObjectURL(blob);

    a.download =

        "Wedding_RSVP.json";

    a.click();

}

window.exportJSON = exportJSON;

function toggleDarkMode() {

    document.body.classList.toggle(

        "dark"

    );

    localStorage.setItem(

        "dashboard-dark",

        document.body.classList.contains(

            "dark"

        )

    );

}

if (

    localStorage.getItem(

        "dashboard-dark"

    ) === "true"

) {

    document.body.classList.add(

        "dark"

    );

}

window.toggleDarkMode = toggleDarkMode;

function fullscreen() {

    if (

        document.documentElement

        .requestFullscreen

    ) {

        document.documentElement

        .requestFullscreen();

    }

}

window.fullscreen = fullscreen;

function copyGuestList() {

    let text = "";

    responses.forEach(r => {

        text +=

            `${r.name} | ${r.attendance} | ${r.guests}\n`;

    });

    navigator.clipboard

        .writeText(text);

    toast("Guest List Copied");

}

window.copyGuestList = copyGuestList;

document.addEventListener(

    "keydown",

    e => {

        if (

            e.ctrlKey &&

            e.key.toLowerCase() === "r"

        ) {

            e.preventDefault();

            loadData();

        }

    }

);

document.addEventListener(

    "keydown",

    e => {

        if (

            e.key === "Escape"

        ) {

            resetFilter();

        }

    }

);

loadData();

console.log(

    "Wedding RSVP Dashboard Loaded"

);

