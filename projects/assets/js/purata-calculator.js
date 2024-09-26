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

function sanitizeAndStringify(obj) {
    const sanitizedObj = {};
    
    // Loop over the object keys
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const validKey = String(key); // Ensure the key is a string
            sanitizedObj[validKey] = obj[key]; // Copy the value to the sanitized object
        }
    }
    
    // Now stringify the sanitized object
    return JSON.stringify(sanitizedObj);
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);  // Trim leading spaces
        
        if (c.indexOf(nameEQ) === 0) {
            const cookieValue = decodeURIComponent(c.substring(nameEQ.length, c.length));
            try {
                return JSON.parse(cookieValue);
            } catch (e) {
                return cookieValue;
            }
        }
    }
    return null;
}


function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    const val = typeof value === 'object' ? sanitizeAndStringify(value) : value;
    document.cookie = name + "=" + encodeURIComponent(val) + ";" + expires + ";path=/";
}

function renderTable() {
    let tbody = document.getElementById('tbody');
    tbody.innerHTML = '';

    for (const [subject, value] of Object.entries(tableData)) {
        let marks = value['marks'] === -1 ? '' : `value="${value['marks']}"`;
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
        tableData[subject] = { weightage: weightage, marks: -1 };
        renderTable();
    }
}

function updateStream(streamSelect, providedStream=false, provided="") {
    let selectedStream = providedStream ? provided : streamSelect.value;
    setCookie('stream', selectedStream, 365*5);
    
    let seen = [];
    console.log(tableData);
    
    // Create a table for user to input the marks and inject into the #tbody
    for (const [subject, weightage] of Object.entries(result[selectedStream])) {
        if (tableData[subject] != undefined) {
            seen.push(subject);
        } else {
            tableData[subject] = { weightage: weightage, marks: -1 };
            seen.push(subject);
        }
    }

    for (const subject of Object.keys(tableData)) {
        if (!seen.includes(subject)) {
            delete tableData[subject];
        }
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
        let marks = row.getElementsByTagName('input')[0].value || -1;  
        let subject = row.getElementsByTagName('td')[0].textContent || "";      

        if (tableData[subject] !== undefined) {
            tableData[subject]['marks'] = marks;
        }

        let weightage = parseInt(row.getElementsByClassName('weightage')[0].textContent);
        if (marks !== -1 && marks !== null) {
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
    setCookie('tableData', tableData, 10);

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

        tableData = getCookie('tableData') || {};
        let stream = getCookie('stream') || null; 

        if (stream) {
            streamSelect.value = stream;
            updateStream(streamSelect, true, stream);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        // alert("Error occured, contact admin");
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