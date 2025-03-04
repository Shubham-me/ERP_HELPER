chrome.action.onClicked.addListener((tab) => {
    if (tab.url == 'https://erp.iith.ac.in/Default/Pages/Portal/PortalInfrastructure.html') {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: run,
            args: []
        }, () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openNewTab") {
        const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(message.data);
        chrome.tabs.create({ url: dataUrl });
    }
});

var run = () => {
    let table = document.getElementById('ifmPortalInfrastturcture').contentDocument.getElementById("grd_68E1EA0F-E456-4FF4-8DAF-ECC2D61B997F").cloneNode(true);
    table.id = 'academic-history-table';

    let choiceCol = document.createElement('th');
    choiceCol.className = "sorting";
    choiceCol.tabIndex = 0;
    choiceCol.setAttribute('aria-controls', 'grd_68E1EA0F-E456-4FF4-8DAF-ECC2D61B997F');
    choiceCol.rowSpan = 1;
    choiceCol.colSpan = 1;
    choiceCol.setAttribute('aria-label', 'Registration Type: activate to sort column ascending');
    choiceCol.textContent = "Choice";
    table.querySelector('thead').querySelector('tr').appendChild(choiceCol);

    table.querySelector('tbody').querySelectorAll('tr').forEach(tr => {
        tr.querySelectorAll('td').forEach((td, index) => {
            td.querySelector('div').querySelector('span').remove(); // redundant element
            if (index == 4) {
                let grade = td.querySelector('div').querySelector('span').cloneNode(true).textContent;
                td.querySelector('div').remove();
                let button = document.createElement('button');
                button.textContent = grade;
                button.setAttribute('onclick', `((button) => {let newgrade = prompt('Edit: ',button.textContent);if(newgrade) button.textContent = newgrade;})(this)
                `);
                td.appendChild(button);
            }
        });
        let td = document.createElement('td');
        td.innerHTML = `
        <button 
            onclick="toggleCourse(this)" 
            class="toggleButton"
            style="
                background-color: green;
                border: none;
                color: white;
                padding: 10px 20px;
                font-size: 16px;
                border-radius: 4px;
                cursor: pointer;
            "
        </button>
        `;
        tr.appendChild(td);
    });

    var createSemesterGradeTable = (grades) => {
        const table = document.createElement('table');
        table.classList.add('semester-grade-table');

        const headerRow = table.insertRow();
        headerRow.insertCell().textContent = 'Semester';
        for (let i = 1; i <= 8; i++) {
            headerRow.insertCell().textContent = i;
        }

        const maxGrades = Math.max(...Object.values(grades).map(arr => arr.length));

        for (let i = 0; i < maxGrades; i++) {
            const row = table.insertRow();
            row.insertCell().textContent = `${i + 1}`;

            for (let j = 1; j <= 8; j++) {
                const cell = row.insertCell();
                if (grades[j] && grades[j][i] !== undefined) {
                    cell.textContent = grades[j][i].point;
                    cell.classList.add('grade-cell');
                    let hoverBox = document.createElement('div');
                    hoverBox.classList.add('hover-box');
                    hoverBox.textContent = grades[j][i].course;
                    cell.appendChild(hoverBox);
                    cell.dataset.grade = grades[j][i].point;
                }
            }
        }

        return table;
    };

    var createWebBody = (table) => {
        table.border = '1';
        let body = document.createElement('body');
        body.appendChild(table);
        let tbody = table.querySelector('tbody');
        let totalCredits = 0;
        let totalGradePoints = 0;
        let gradeToNum = {
            'A+': 10,
            'A': 10,
            'A-': 9,
            'B': 8,
            'B-': 7,
            'C': 6,
            'C-': 5,
            'D': 4,
            'S': 0,
            'F': 0
        }
        let typeCredits = {};
        let typeGradePoints = {};
        let typeGPA = {};
        let deptGPA = {};
        let deptCredits = {};
        let deptGradePoints = {};
        let semGrades = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };


        let sgpa = Array(9);
        for (let i = 1; i <= 8; i++) {
            sgpa[i] = 0;
        }
        let semCredits = Array(9);
        for (let i = 1; i <= 8; i++) {
            semCredits[i] = 0;
        }

        let semGradePoints = Array(9);
        for (let i = 1; i <= 8; i++) {
            semGradePoints[i] = 0;
        }

        tbody.querySelectorAll('tr').forEach(tr => {
            let credits = 0;
            let gradePoint = 0;
            let currSem = 0;
            let type = '';
            let consider = true;
            let dept = '';
            let courseName = '';
            tr.querySelectorAll('td').forEach((block, index) => {
                if (index == 0) {
                    currSem = parseInt(block.querySelector('div').querySelector('span').textContent, 10);
                }
                else if (index == 1) {
                    dept = block.querySelector('div').querySelector('span').textContent;
                    dept = dept.trim();
                    dept = dept.substring(0, 2);
                }
                else if(index == 2){
                    courseName = block.querySelector('div').querySelector('span').textContent;
                    courseName = courseName.trim();
                }
                else if (index == 3) {
                    credits = parseInt(block.querySelector('div').querySelector('span').textContent, 10);
                }
                else if (index == 4) {
                    gradePoint = block.querySelector('button').textContent;
                    gradePoint = gradePoint.trim();
                }
                else if (index == 5) {
                    type = block.querySelector('div').querySelector('span').textContent;
                    type = type.trim();
                }
                else if (index == 7) {
                    if (!(gradePoint in gradeToNum)) {
                        consider = false;
                        block.querySelector('button').style.backgroundColor = 'red';
                        gradePoint = 0;
                        credits = 0;
                    }
                    else {
                        consider = block.querySelector('button').style.backgroundColor == 'green';
                        gradePoint = gradeToNum[gradePoint];
                    }
                }
            });

            if (consider) {
                semGrades[currSem].push({
                    'point' : gradePoint,
                    'course' : courseName
                });
                if (type != 'Additional') {
                    totalCredits += credits;
                    totalGradePoints += credits * gradePoint;
                    semCredits[currSem] += credits;
                    semGradePoints[currSem] += credits * gradePoint;
                }

                if (type in typeCredits) {
                    typeCredits[type] += credits;
                    typeGradePoints[type] += credits * gradePoint;
                }
                else {
                    typeCredits[type] = credits;
                    typeGradePoints[type] = credits * gradePoint;
                }

                if (dept in deptCredits) {
                    deptCredits[dept] += credits;
                    deptGradePoints[dept] += credits * gradePoint;
                }
                else {
                    deptCredits[dept] = credits;
                    deptGradePoints[dept] = credits * gradePoint;
                }
            }

        });

        let cgpa = totalGradePoints / totalCredits;
        let infoTable = document.createElement('table');
        infoTable.border = '1';
        infoTable.style.margin = '20px auto';
        infoTable.style.borderCollapse = 'collapse';
        infoTable.style.width = '50%';

        let infoTableBody = document.createElement('tbody');
        infoTableBody.innerHTML = `
        <tr>
            <th>Metric</th>
            <th>Value</th>
        </tr>
        <tr>
            <td>CGPA</td>
            <td style="color: green; font-weight: bold;">${cgpa.toFixed(2)}</td>
        </tr>
        <tr>
            <td>Total Credits</td>
            <td style="color: red; font-weight: bold;">${totalCredits}</td>
        </tr>
        `;
        infoTable.appendChild(infoTableBody);
        table.insertAdjacentElement('beforebegin', infoTable);

        for (let i = 1; i <= 8; i++) {
            sgpa[i] = semGradePoints[i] / semCredits[i];
        }
        let semTable = document.createElement('table');
        semTable.border = '1';
        let semTableBody = document.createElement('tbody');
        semTableBody.innerHTML = `<tr>
        <th>
        <b>Semester</b>
        </th>
        <th>
        <b>Credits</b>
        </th>
        <th>
        <b>SGPA</b>
        </th>
        </tr>`;
        for (let i = 1; i <= 8; i++) {
            let row = document.createElement('tr');
            let cell1 = document.createElement('td');
            cell1.textContent = i
            let cell2 = document.createElement('td');
            cell2.textContent = semCredits[i];
            let cell3 = document.createElement('td');
            cell3.textContent = sgpa[i].toFixed(2);
            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);
            semTableBody.appendChild(row);
        }
        semTable.appendChild(semTableBody);
        body.appendChild(semTable);


        for (let type in typeCredits) {
            typeGPA[type] = typeGradePoints[type] / typeCredits[type];
        }
        let typeTable = document.createElement('table');
        typeTable.border = '1';
        let typeTableBody = document.createElement('tbody');
        typeTableBody.innerHTML = `<tr>
        <th>
        <b>Course Type</b>
        </th>
        <th>
        <b>Credits</b>
        </th>
        <th>
        <b>GPA</b>
        </th>
        </tr>`;
        for (let type in typeCredits) {
            let row = document.createElement('tr');
            let cell1 = document.createElement('td');
            cell1.textContent = type;
            let cell2 = document.createElement('td');
            cell2.textContent = typeCredits[type];
            let cell3 = document.createElement('td');
            cell3.textContent = typeGPA[type].toFixed(2);
            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);
            typeTableBody.appendChild(row);
        }
        typeTable.appendChild(typeTableBody);
        body.appendChild(typeTable);


        for (let dept in deptCredits) {
            deptGPA[dept] = deptGradePoints[dept] / deptCredits[dept];
        }
        let deptTable = document.createElement('table');
        deptTable.border = '1';
        let deptTableBody = document.createElement('tbody');
        deptTableBody.innerHTML = `<tr>
        <th>
        <b>Department</b>
        </th>
        <th>
        <b>Credits</b>
        </th>
        <th>
        <b>GPA</b>
        </th>
        </tr>`;
        for (let dept in deptCredits) {
            let row = document.createElement('tr');
            let cell1 = document.createElement('td');
            cell1.textContent = dept;
            let cell2 = document.createElement('td');
            cell2.textContent = deptCredits[dept];
            let cell3 = document.createElement('td');
            cell3.textContent = deptGPA[dept].toFixed(2);
            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);
            deptTableBody.appendChild(row);
        }
        deptTable.appendChild(deptTableBody);
        body.appendChild(deptTable);

        let semesterGradeTable = createSemesterGradeTable(semGrades);
        body.appendChild(semesterGradeTable);

        return `
        <footer>
        <p id="website-name">ERP HELPER</p>
        </footer>
        <button onClick = "refresh()" class = "generateButton"> Generate </button>
        ${body.innerHTML}
        <button onClick = "refresh()" class = "generateButton"> Generate </button>
        `
    }

    var refresh = () => {
        let table = document.getElementById('academic-history-table').cloneNode(true);
        document.body.innerHTML = createWebBody(table);
    }

    var toggleCourse = (button) => {
        if (button.style.backgroundColor == 'green') {
            button.style.backgroundColor = 'red';
        }
        else {
            button.style.backgroundColor = 'green';
        }
    }

    let newWebPage = `
    <html>
    <head>
        <script>
            var createWebBody = ${createWebBody.toString()};
            var toggleCourse = ${toggleCourse.toString()};
            var refresh = ${refresh.toString()};
            var createSemesterGradeTable = ${createSemesterGradeTable.toString()};
            document.addEventListener('click',(event) => {
                let target = event.target.closest('span');
                if(!target) return;
                let newText = prompt("Edit: ",target.textContent);
                if(newText) target.textContent = newText;    
            });
        </script>

        <style>
            body {
                font-family: sans-serif;
                margin: 0;
                padding: 0;
                background-color:rgba(244, 244, 244, 0.67); /* Light background for the body */
                color: #333; /* Darker text for readability */
            }

            footer {
                background-color: #333; 
                text-align: left;
                color: white;
                font-size: 16px;
                position: relative; 
                left: 0;
                bottom: 0;
                width: 100%;
                padding: 20px;
            }

            #website-name {
                text-align: left;
                font-size: 32px;
                font-weight: bold;
                color: #4CAF50; 
                font-family: 'Arial', sans-serif;
                margin: 10px 0;
                padding: 5px;
                letter-spacing: 1px;
            }

            .generateButton, .toggleButton {
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            .generateButton:hover, .toggleButton:hover {
                background-color: #3e8e41; 
            }

            button:active {
                transform: scale(0.95);
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
            }

            table {
                width: 90%;
                margin: 20px auto;
                border-collapse: collapse;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
                background-color: white;
                padding-bottom: 20px;
            }

            td, th {
                padding: 12px 15px; 
                text-align: left;
            }

            th {
                background-color: #4CAF50; 
                color: white;
                font-weight: bold;
            }

            .semester-grade-table {
                border-collapse: collapse;
                width: 80%;
                max-width: 800px;
                height: 1000px;
                font-family: sans-serif;
                background-color: #222; 
                color: #eee;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }

            .semester-grade-table th,
            .semester-grade-table td {
                text-align: center;
            }

            .semester-grade-table th {
                background-color: #333;
                font-weight: bold;
            }

            .hover-box {
                position: relative;
                display: none;
                color: white;
                border: 1px solid black;
            }

            .grade-cell:hover .hover-box {
                display: block;
            }
                
            .grade-cell {
                position: relative;
                border: 1px solid black;
            }
            .grade-cell[data-grade="10"] {
                background-color: rgb(0, 90, 0);
                color: #fff;
            }

            .grade-cell[data-grade="9"] {
                background-color: #008000;
                color: #fff;
            }

            .grade-cell[data-grade="8"]{
                background-color:rgb(255, 196, 0);
            }

            .grade-cell[data-grade="7"] {
                background-color: #ffa500;
            }

            .grade-cell[data-grade="6"],
            .grade-cell[data-grade="5"] {
                background-color: #b30000;
                color: #fff;
            }

            .grade-cell[data-grade="4"] {
                background-color: #ff0000;
                color: #fff;
            }
        </style>
    </head>
    <body>
    ${createWebBody(table)}
    </body>
    </html>
    `

    chrome.runtime.sendMessage({
        action: "openNewTab",
        data: newWebPage
    });
};
