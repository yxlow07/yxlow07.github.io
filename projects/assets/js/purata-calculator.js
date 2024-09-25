const apiKey = 'AIzaSyCrICNWoviyvvrZllYP-UPNwPviCH3K4XE';
const spreadsheetId = '1qc1R9nMFnwVtIm1pFsdEh_sYPu5hCCogmbzzdlhLw8A';
const range = 'Sheet1!B2:D52'; // Specify the range of data
const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

// Bootstrap 5 new requirement to init tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

let tableData = {};

let result = {};
let currentStream = null;

function renderTable() {
    let tbody = document.getElementById('tbody');
    tbody.innerHTML = '';

    for (const [subject, value] of Object.entries(tableData)) {
        let marks = value['marks'] === null ? '' : `value="${value['marks']}"`;
        let input = `<input type="number" class="marks form-control" id="${subject}" ${marks} min="1" max="100">`;
        let rowData = `<tr><td>${subject}</td><td class="weightage">${value['weightage']}</td><td>${input}</td></tr>`;
        tbody.innerHTML += rowData;
    }

    updateMarksEventListener();
}

function addRow() {
    let subject = prompt('Enter subject name:');
    let weightage = prompt('Enter weightage:');
    if (subject && weightage) {
        tableData[subject] = { weightage: weightage, marks: null };
        renderTable();
    }
}

function updateStream(streamSelect) {
    let selectedStream = streamSelect.value;
    tableData = [];
    // Create a table for user to input the marks and inject into the #tbody
    for (const [subject, weightage] of Object.entries(result[selectedStream])) {
        tableData[subject] = { weightage: weightage, marks: null };
    }
    renderTable();
}

function getAllTableDataAndCalculate() {
    let totalMarksWithPemberat = 0;
    let totalPemberat = 0;
    let ignoredPemberat = 0;

    // Loop through all data in the table
    let table = document.getElementById('tbody');
    let rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let marks = row.getElementsByTagName('input')[0].value || null;  
        let subject = row.getElementsByTagName('td')[0].textContent || "";      

        if (tableData[subject] !== undefined) {
            tableData[subject]['marks'] = marks;
        }

        let weightage = parseInt(row.getElementsByClassName('weightage')[0].textContent);
        if (marks !== null) {
            totalMarksWithPemberat += marks * weightage;
            totalPemberat += weightage;
        } else {
            ignoredPemberat += weightage;
        }
    }

    let purata;
    if (totalPemberat != 0) {
        purata = totalMarksWithPemberat / totalPemberat;
    } else {
        purata = 0.00;
    }
    document.getElementById('purata').innerHTML = purata.toFixed(2);

    return { totalPemberat: totalPemberat, ignoredPemberat: ignoredPemberat, purata: purata };
}

function calculateTarget(purata, target, totalPemberat, ignoredPemberat) {
    let total = totalPemberat + ignoredPemberat;
    let targetSum = total * target;
    let targetPurata = (targetSum - purata * totalPemberat) / ignoredPemberat;
    let displayBadge = document.getElementById('target-badge');
    displayBadge.classList.remove('btn-success');
    displayBadge.classList.remove('btn-danger');
    displayBadge.classList.remove('btn-warning');

    // Changing colors based on target
    if (targetPurata > 100) {
        displayBadge.classList.add('btn-danger');
    } else if (targetPurata > 90) {
        displayBadge.classList.add('btn-warning');
    } else {
        displayBadge.classList.add('btn-success');
    }

    document.getElementById('targetpurata').innerHTML = Math.max(0,targetPurata.toFixed(2));
}

fetch(url)
    .then(response => response.json())
    .then(data => {

        let sheetData = data["values"];

        sheetData.forEach(row => {
            if (row.length === 1 && row[0]) {
                currentStream = row[0];
                result[currentStream] = {};
            } else if (row.length === 3 && currentStream && !isNaN(row[0])) {
                let subject = row[1];
                let weightage = row[2];
                result[currentStream][subject] = parseInt(weightage, 10);
            }
        });

        let streamSelect = document.getElementById('stream');

        Object.keys(result).forEach(stream => {
            let option = document.createElement('option');
            option.value = stream;
            option.textContent = stream;
            streamSelect.appendChild(option);
        });

        streamSelect.addEventListener('change', () => {
            updateStream(streamSelect);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        alert("Error occured, contact admin");
    });

document.getElementById('addRow').addEventListener('click', (e) => {
    e.preventDefault();
    addRow();
});

function calcTargetEvent() {
    let data = getAllTableDataAndCalculate();
    let target = document.getElementById('target').value;
    calculateTarget(data["purata"] || 0, target, data["totalPemberat"], data["ignoredPemberat"]);
}

// Combine both event listeners into one
document.getElementById('target').addEventListener('keyup', calcTargetEvent);
document.getElementById('calculate').addEventListener('click', calcTargetEvent);


function updateMarksEventListener() {
    let elements = document.getElementsByClassName('marks');
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('keyup', calcTargetEvent);
    }
}