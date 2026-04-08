// State
let isEditing = false;
let currentSearch = '';

// DOM Elements
const form = document.getElementById('studentForm');
const tableBody = document.getElementById('tableBody');
const loadingState = document.getElementById('tableLoading');
const emptyState = document.getElementById('tableEmpty');
const searchInput = document.getElementById('searchInput');
const toastContainer = document.getElementById('toastContainer');
const btnSubmit = document.getElementById('btnSubmit');
const formTitle = document.getElementById('formTitle');
const btnCancelEdit = document.getElementById('btnCancelEdit');

// Image Preview Logic
const imageInput = document.getElementById('image');
const dropZone = document.getElementById('dropZone');
const imagePreview = document.getElementById('imagePreview');

function attachFileEvents() {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            imageInput.files = e.dataTransfer.files;
            handleImagePreview();
        }
    });

    imageInput.addEventListener('change', handleImagePreview);
}

function handleImagePreview() {
    const file = imageInput.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Fetch Students
async function fetchStudents() {
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    tableBody.innerHTML = '';
    
    try {
        const res = await fetch(`fetch.php?search=${encodeURIComponent(currentSearch)}`);
        let result;
        try {
            result = await res.json();
        } catch (e) {
            throw new Error("Server error. Are you running via XAMPP (localhost)? Do not double-click the HTML file directly!");
        }
        
        if (result.error) throw new Error(result.message);
        
        document.getElementById('totalStudents').textContent = result.data.length;
        
        if (result.data.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            renderTable(result.data);
        }
    } catch (err) {
        showToast('error', err.message || 'Failed to fetch data');
    } finally {
        loadingState.classList.add('hidden');
    }
}

function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function renderTable(data) {
    data.forEach(student => {
        const tr = document.createElement('tr');
        
        const fullName = escapeHTML(student.full_name) || 'N/A';
        const profileImage = student.profile_image ? escapeHTML(student.profile_image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name || 'U')}&background=random`;
        const usn = escapeHTML(student.usn) || 'N/A';
        const email = escapeHTML(student.email) || 'N/A';
        const phone = escapeHTML(student.phone) || 'N/A';
        const address = student.address ? escapeHTML(student.address.substring(0,25)) + '...' : 'N/A';
        const course = escapeHTML(student.course) || 'N/A';
        const gender = escapeHTML(student.gender) || 'N/A';
        
        tr.innerHTML = `
            <td>
                <img src="${profileImage}" class="user-img" alt="Profile" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name || 'U')}'">
            </td>
            <td>
                <div class="user-details">
                    <h4>${fullName}</h4>
                    <span><strong>${usn}</strong> &bull; ${email}</span>
                </div>
            </td>
            <td>
                <div class="user-details">
                    <h4>${phone}</h4>
                    <span>${address}</span>
                </div>
            </td>
            <td><span class="badge">${course}</span><br><small style="color:var(--text-sec); margin-top:4px; display:block">${gender}</small></td>
            <td>
                <div class="action-cell">
                    <button class="btn-icon edit" onclick='editStudent(${JSON.stringify(student).replace(/'/g, "&#39;")})' title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteStudent(${student.id})" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Submit Form
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const url = isEditing ? 'update.php' : 'insert.php';
    
    if (isEditing) {
        formData.append('currentUser', form.getAttribute('data-current-user') || '');
    }
    
    // UI Loading state
    btnSubmit.disabled = true;
    btnSubmit.querySelector('.spinner').classList.remove('hidden');
    btnSubmit.querySelector('.btn-text-content').style.opacity = '0';
    
    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        let result;
        try {
            result = await res.json();
        } catch (e) {
            throw new Error("Failed to parse response. Ensure your Apache & MySQL servers are running.");
        }
        
        if (result.error) {
            showToast('error', result.message);
        } else {
            showToast('success', result.message);
            resetForm();
            fetchStudents();
        }
    } catch (err) {
        showToast('error', 'Network error occurred. Make sure PHP server is running.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.querySelector('.spinner').classList.add('hidden');
        btnSubmit.querySelector('.btn-text-content').style.opacity = '1';
    }
});

// Edit & Delete
window.editStudent = (student) => {
    const currentUser = prompt("Security Check: Enter your Full Name to proceed with editing:");
    if (!currentUser) return;
    
    if (currentUser.toLowerCase().trim() !== (student.full_name || '').toLowerCase().trim()) {
        showToast('error', 'Unauthorized: You can only edit your own data.');
        return;
    }
    
    isEditing = true;
    form.setAttribute('data-current-user', currentUser);
    formTitle.textContent = 'Edit Student';
    btnSubmit.querySelector('.btn-text-content').innerHTML = '<i class="fas fa-save"></i> Update Record';
    btnCancelEdit.classList.remove('hidden');
    
    // Populate
    document.getElementById('studentId').value = student.id || '';
    document.getElementById('usn').value = student.usn || '';
    document.getElementById('name').value = student.full_name || '';
    document.getElementById('email').value = student.email || '';
    document.getElementById('phone').value = student.phone || '';
    document.getElementById('course').value = student.course || '';
    document.getElementById('dob').value = student.dob || '';
    document.getElementById('address').value = student.address || '';
    document.getElementById('existingImage').value = student.profile_image || '';
    
    // Gender Radio
    const radios = document.getElementsByName('gender');
    for(let r of radios) { if(r.value === student.gender) r.checked = true; }
    
    // Preview
    if (student.profile_image) {
        imagePreview.src = student.profile_image;
        imagePreview.classList.remove('hidden');
    } else {
        imagePreview.classList.add('hidden');
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteStudent = async (id) => {
    const currentUser = prompt("Security Check: Enter your Full Name to proceed with deletion:");
    if (!currentUser) return;
    
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
        const res = await fetch('delete.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id, currentUser })
        });
        
        let result;
        try {
            result = await res.json();
        } catch (e) {
            throw new Error("Server failed to respond properly. Check XAMPP.");
        }
        
        if (result.error) showToast('error', result.message);
        else {
            showToast('success', result.message);
            if(isEditing && document.getElementById('studentId').value == id) resetForm();
            fetchStudents();
        }
    } catch(err) {
        showToast('error', 'Failed to delete record.');
    }
};

// Reset Form
function resetForm() {
    form.reset();
    isEditing = false;
    formTitle.textContent = 'Register Student';
    btnSubmit.querySelector('.btn-text-content').innerHTML = '<i class="fas fa-save"></i> Save Student';
    btnCancelEdit.classList.add('hidden');
    
    document.getElementById('studentId').value = '';
    document.getElementById('usn').value = '';
    document.getElementById('existingImage').value = '';
    imageInput.value = '';
    imagePreview.classList.add('hidden');
    imagePreview.src = '';
}

btnCancelEdit.addEventListener('click', resetForm);
document.getElementById('btnReset').addEventListener('click', resetForm);

// Search
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    currentSearch = e.target.value;
    searchTimeout = setTimeout(fetchStudents, 300); // Debounce
});

// Toast Notifications
function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Theme Toggle
function initTheme() {
    const savedTheme = localStorage.getItem('saas_theme') || 'light';
    document.documentElement.dataset.theme = savedTheme;
    updateThemeIcon(savedTheme);
    
    document.getElementById('themeToggle').addEventListener('click', () => {
        const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('saas_theme', theme);
        updateThemeIcon(theme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeToggle').querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// CSV Export
document.getElementById('btnExport').addEventListener('click', () => {
    // // Extra feature, could be implemented in backend: window.location.href = 'fetch.php?export=csv'; 
    // Since we don't have CSV logic in fetch.php natively yet, let's just do frontend CSV generation:
    exportTableToCSV('students.csv');
});

function exportTableToCSV(filename) {
    const csv = [];
    const rows = document.querySelectorAll("table tr");
    
    for (let i = 0; i < rows.length; i++) {
        const row = [], cols = rows[i].querySelectorAll("td, th");
        // Skip last column (Actions)
        for (let j = 0; j < cols.length - 1; j++) {
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, ' ').trim();
            data = data.replace(/"/g, '""');
            row.push('"' + data + '"');
        }
        if(row.length > 0) csv.push(row.join(","));
    }

    const csvFile = new Blob([csv.join("\n")], {type: "text/csv"});
    const downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast('success', 'CSV Exported successfully!');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    attachFileEvents();
    initTheme();
    fetchStudents();
});
