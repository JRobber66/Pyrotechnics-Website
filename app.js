const API_URL = 'https://backend-test-je8a.onrender.com';

function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days*864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '');
}

function requireAuth() {
  if (!getCookie('authToken')) window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();
  if (page === 'dashboard.html') requireAuth();

  if (page === 'login.html') {
    document.getElementById('loginForm').addEventListener('submit', async e => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setCookie('authToken', data.token);
        window.location.href = 'dashboard.html';
      } else {
        document.getElementById('error').textContent = data.message;
      }
    });
  }

  if (page === 'register.html') {
    document.getElementById('registerForm').addEventListener('submit', async e => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registration successful');
        window.location.href = 'login.html';
      } else {
        document.getElementById('error').textContent = data.message;
      }
    });
  }

  if (page === 'dashboard.html') {
    document.getElementById('logoutBtn').addEventListener('click', () => {
      setCookie('authToken', '', -1);
      window.location.href = 'login.html';
    });
    document.getElementById('uploadForm').addEventListener('submit', async e => {
      e.preventDefault();
      const fileInput = document.getElementById('fileInput');
      const recipient = document.getElementById('recipient').value;
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('recipient', recipient);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + getCookie('authToken') },
        body: formData
      });
      const data = await res.json();
      if (res.ok) loadFiles();
      else document.getElementById('error').textContent = data.message;
    });
    async function loadFiles() {
      const res = await fetch(`${API_URL}/api/files`, {
        headers: { 'Authorization': 'Bearer ' + getCookie('authToken') }
      });
      const files = await res.json();
      const list = document.getElementById('fileList');
      list.innerHTML = '';
      files.forEach(f => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `${API_URL}/api/download/${f.id}`;
        a.textContent = f.filename + (f.sender === f.recipient ? ' (Mine)' : ' ('+f.sender+')');
        a.target = '_blank';
        li.appendChild(a);
        list.appendChild(li);
      });
    }
    loadFiles();
  }
});