class StudentManager {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
        this.initElements();
        this.bindEvents();
        this.renderTable();
        this.initTheme();
    }

    initElements() {
        this.form = document.getElementById('studentForm');
        this.tbody = document.getElementById('tableBody');
        this.search = document.getElementById('search');
        this.sortSelect = document.getElementById('sortData');
        this.totalEl = document.getElementById('totalStudents');
        this.submitBtn = document.getElementById('submitBtn');
        this.themeBtn = document.getElementById('themeToggle');
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('resetBtn').addEventListener('click', () => this.resetForm());
        this.search.addEventListener('input', () => this.renderTable());
        this.sortSelect.addEventListener('change', () => this.renderTable());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyData());
        document.getElementById('csvBtn').addEventListener('click', () => this.downloadCSV());
        this.themeBtn.addEventListener('click', () => this.toggleTheme());

        // Event delegation for edit/delete
        this.tbody.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (!row) return;
            const usn = row.dataset.usn;
            if (e.target.closest('.edit-btn')) this.editStudent(usn);
            if (e.target.closest('.del-btn')) this.deleteStudent(usn);
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const editId = document.getElementById('editId').value;

        const data = {
            name: document.getElementById('name').value.trim(),
            usn: document.getElementById('usn').value.trim().toUpperCase(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            course: document.getElementById('course').value
        };

        if (this.students.some(s => s.usn === data.usn && s.usn !== editId)) {
            this.showToast('USN already exists!', 'error');
            return;
        }

        if (editId) {
            const idx = this.students.findIndex(s => s.usn === editId);
            this.students[idx] = data;
            this.showToast('Student updated successfully', 'success');
        } else {
            this.students.push(data);
            this.showToast('Student added successfully', 'success');
        }

        this.saveData();
        this.resetForm();
        this.renderTable();
    }

    deleteStudent(usn) {
        if (confirm('Are you sure you want to delete this student?')) {
            this.students = this.students.filter(s => s.usn !== usn);
            this.saveData();
            this.renderTable();
            this.showToast('Student deleted', 'info');
        }
    }

    editStudent(usn) {
        const student = this.students.find(s => s.usn === usn);
        if (!student) return;

        document.getElementById('editId').value = student.usn;
        document.getElementById('name').value = student.name;
        document.getElementById('usn').value = student.usn;
        document.getElementById('email').value = student.email;
        document.getElementById('phone').value = student.phone || '';
        document.getElementById('address').value = student.address || '';
        document.getElementById('course').value = student.course;

        this.submitBtn.textContent = 'Update Student';
    }

    resetForm() {
        this.form.reset();
        document.getElementById('editId').value = '';
        this.submitBtn.textContent = 'Add Student';
    }

    clearAll() {
        if (this.students.length > 0 && confirm('Are you sure you want to delete ALL data?')) {
            this.students = [];
            this.saveData();
            this.renderTable();
            this.showToast('All data cleared', 'info');
        }
    }

    saveData() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }

    renderTable() {
        const searchTerm = this.search.value.toLowerCase();
        let displayData = this.students.filter(s =>
            s.name.toLowerCase().includes(searchTerm) ||
            s.usn.toLowerCase().includes(searchTerm) ||
            s.course.toLowerCase().includes(searchTerm)
        );

        const sortMethod = this.sortSelect.value;
        if (sortMethod === 'name_asc') displayData.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortMethod === 'name_desc') displayData.sort((a, b) => b.name.localeCompare(a.name));
        else if (sortMethod === 'usn_asc') displayData.sort((a, b) => a.usn.localeCompare(b.usn));

        this.tbody.innerHTML = '';
        this.totalEl.textContent = displayData.length;

        displayData.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.dataset.usn = s.usn;
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${s.name}</td>
                <td>${s.usn}</td>
                <td>${s.email}</td>
                <td>${s.phone || '-'}</td>
                <td>${s.address || '-'}</td>
                <td><span style="background: var(--primary); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.85rem;">${s.course}</span></td>
                <td class="action-btns">
                    <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="del-btn" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            `;
            this.tbody.appendChild(tr);
        });
    }

    copyData() {
        if (this.students.length === 0) return this.showToast('No data to copy', 'error');
        const headers = "Name\tUSN\tEmail\tPhone\tAddress\tCourse\n";
        const rows = this.students.map(s => `${s.name}\t${s.usn}\t${s.email}\t${s.phone}\t${s.address}\t${s.course}`).join('\n');
        navigator.clipboard.writeText(headers + rows).then(() => this.showToast('Copied to clipboard', 'success'));
    }

    downloadCSV() {
        if (this.students.length === 0) return this.showToast('No data to download', 'error');
        let csv = 'Name,USN,Email,Phone,Address,Course\n';
        this.students.forEach(s => {
            csv += `"${s.name}","${s.usn}","${s.email}","${s.phone}","${s.address}","${s.course}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showToast('CSV Downloaded', 'success');
    }

    showToast(msg, type) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    initTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.dataset.theme = theme;
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const current = document.documentElement.dataset.theme;
        const target = current === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = target;
        localStorage.setItem('theme', target);
        this.updateThemeIcon(target);
    }

    updateThemeIcon(theme) {
        const icon = this.themeBtn.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => new StudentManager());
