let allData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 50;

document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            allData = data;
            filteredData = data;
            renderTable();
            setupSearch();
            setupPagination();
        })
        .catch(err => console.error("Error loading JSON:", err));

    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('detailModal').addEventListener('click', (e) => {
        if (e.target.id === 'detailModal') closeModal();
    });
});

function renderTable() {
    const tbody = document.getElementById('rankingTableBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    document.getElementById('totalStats').innerText = `মোট শিক্ষার্থী: ${filteredData.length.toLocaleString()}`;

    pageData.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 border-b";

        tr.innerHTML = `
            <td class="py-3 px-4 font-bold text-gray-700">${item.r}</td>
            <td class="py-3 px-4">${item.roll}</td>
            <td class="py-3 px-4 font-medium">
                <span class="clickable-name" onclick="openModal(${item.roll})">${item.name}</span>
            </td>
            <td class="py-3 px-4 text-gray-600">${item.inst}</td>
            <td class="py-3 px-4 text-center font-bold ${item.gpa === '5.0' ? 'text-green-600' : 'text-blue-600'}">${item.gpa}</td>
            <td class="py-3 px-4 text-center font-bold text-purple-700">${item.tm}</td>
        `;
        tbody.appendChild(tr);
    });

    updatePaginationControls();
}

function openModal(roll) {
    const student = allData.find(s => s.roll === roll);
    if (!student) return;

    document.getElementById('modalName').innerText = student.name;
    document.getElementById('modalRank').innerText = `#${student.r}`;
    document.getElementById('modalRoll').innerText = student.roll;
    document.getElementById('modalFather').innerText = student.fn;
    document.getElementById('modalMother').innerText = student.mn;
    document.getElementById('modalReg').innerText = student.reg;
    document.getElementById('modalSession').innerText = student.ses;
    document.getElementById('modalBoard').innerText = student.bd;
    document.getElementById('modalGroup').innerText = student.grp;
    document.getElementById('modalType').innerText = student.typ;
    document.getElementById('modalDOB').innerText = student.dob;
    document.getElementById('modalInst').innerText = student.inst;
    document.getElementById('modalGPA').innerText = student.gpa;
    document.getElementById('modalMarks').innerText = student.tm;

    const subsContainer = document.getElementById('modalSubjects');
    subsContainer.innerHTML = '';

    for (const [subName, mark] of Object.entries(student.subs)) {
        const div = document.createElement('div');
        div.className = "flex justify-between border-b pb-1 text-gray-700";
        div.innerHTML = `<span class="font-medium">${subName}:</span> <span class="font-bold ${mark === 'N/A' ? 'text-red-500' : 'text-gray-900'}">${mark}</span>`;
        subsContainer.appendChild(div);
    }

    document.getElementById('detailModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().strip();
        filteredData = allData.filter(item => 
            item.name.toLowerCase().includes(query) ||
            item.roll.toString().includes(query) ||
            item.inst.toLowerCase().includes(query)
        );
        currentPage = 1;
        renderTable();
    });
}

function setupPagination() {
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentPage * rowsPerPage < filteredData.length) {
            currentPage++;
            renderTable();
        }
    });
}

function updatePaginationControls() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}
