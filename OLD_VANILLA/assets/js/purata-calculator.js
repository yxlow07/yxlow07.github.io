const apiKey = 'AIzaSyCrICNWoviyvvrZllYP-UPNwPviCH3K4XE';
const spreadsheetId = '1qc1R9nMFnwVtIm1pFsdEh_sYPu5hCCogmbzzdlhLw8A';
const range = 'Sheet1!B2:D52'; // Specify the range of data
const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

let result = {};
let currentStream = null;

function addRow() {
    let subject = prompt('Enter subject name:');
    let weightage = prompt('Enter weightage:');
    let input = `<input type="number" id="${subject}" min="1" max="100">`;
    let row = `<tr><td>${subject}</td><td>${weightage}</td><td>${input}</td></tr>`;
    if (subject && weightage) {
        document.getElementById('tbody').innerHTML += row;
    }
}

function updateTable(streamSelect) {
    let selectedStream = streamSelect.value;
    document.getElementById('tbody').innerHTML = '';

    // Create a table for user to input the marks and inject into the #tbody
    for (const [subject, weightage] of Object.entries(result[selectedStream])) {
        let input = `<input type="number" id="${subject}" min="1" max="100" class="marks form-control">`;
        let row = `<tr><td>${subject}</td><td class="weightage">${weightage}</td><td>${input}</td></tr>`;

        document.getElementById('tbody').innerHTML += row;
    }
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

    document.getElementById('targetpurata').innerHTML = targetPurata.toFixed(2);
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
            updateTable(streamSelect);
            let elements = document.getElementsByClassName('marks');
            for (let i = 0; i < elements.length; i++) {
                elements[i].addEventListener('keyup', () => {
                    getAllTableDataAndCalculate();
                });
            }
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        alert("Error occured, contact admin");
    });

document.getElementById('addRow').addEventListener('click', () => {
    addRow();
});
document.getElementById('target').addEventListener('keyup', () => {
    let data = getAllTableDataAndCalculate();
    let target = document.getElementById('target').value;
    calculateTarget(data["purata"] || 0, target, data["totalPemberat"], data["ignoredPemberat"]);
});
