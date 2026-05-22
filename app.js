const STORAGE_USERS = 'oneTestUsers';
const STORAGE_CURRENT_USER = 'oneTestCurrentUser';
const STORAGE_COMMENTS = 'oneTestComments';

function loadJson(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        return [];
    }
}

function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_CURRENT_USER));
}

function setCurrentUser(user) {
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem(STORAGE_CURRENT_USER);
}

function getUsers() {
    return loadJson(STORAGE_USERS);
}

function saveUsers(users) {
    saveJson(STORAGE_USERS, users);
}

function getComments() {
    return loadJson(STORAGE_COMMENTS);
}

function saveComments(comments) {
    saveJson(STORAGE_COMMENTS, comments);
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function showMessage(elementId, message, isError = true) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? '#d9534f' : '#2a7d2a';
    if (message) {
        setTimeout(() => {
            element.textContent = '';
        }, 4000);
    }
}

function redirectToComments() {
    window.location.href = 'comment.html';
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function initRegistration() {
    const form = document.getElementById('registrationForm');
    if (!form) return;

    const currentUser = getCurrentUser();
    if (currentUser) {
        redirectToComments();
        return;
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const username = document.getElementById('username').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            showMessage('commentMessage', 'Passwords do not match.');
            return;
        }

        const users = getUsers();
        if (users.find(user => user.email === email)) {
            showMessage('commentMessage', 'Email already in use.');
            return;
        }
        if (users.find(user => user.username === username)) {
            showMessage('commentMessage', 'Username already taken.');
            return;
        }

        const user = { fullname, email, username, password, createdAt: Date.now() };
        users.push(user);
        saveUsers(users);
        setCurrentUser({ fullname, email, username });
        redirectToComments();
    });
}

function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const currentUser = getCurrentUser();
    if (currentUser) {
        redirectToComments();
        return;
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        const identifier = document.getElementById('login-identifier').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        const users = getUsers();
        const user = users.find(u => u.email === identifier || u.username === identifier);
        if (!user) {
            showMessage('commentMessage', 'No account found with that email or username.');
            return;
        }
        if (user.password !== password) {
            showMessage('commentMessage', 'Password is incorrect.');
            return;
        }

        setCurrentUser({ fullname: user.fullname, email: user.email, username: user.username });
        redirectToComments();
    });
}

function initCommentPage() {
    const page = document.getElementById('commentForm');
    if (!page) return;

    const user = getCurrentUser();
    if (!user) {
        redirectToLogin();
        return;
    }

    document.getElementById('commentMetadata').textContent = `Logged in as ${user.fullname} (${user.username})`;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearCurrentUser();
        redirectToLogin();
    });

    const commentForm = document.getElementById('commentForm');
    commentForm.addEventListener('submit', event => {
        event.preventDefault();
        const text = document.getElementById('commentText').value.trim();
        if (!text) {
            showMessage('commentMessage', 'Please type a comment before posting.');
            return;
        }

        const comments = getComments();
        comments.unshift({
            author: user.fullname,
            username: user.username,
            text,
            createdAt: Date.now()
        });
        saveComments(comments);
        document.getElementById('commentText').value = '';
        renderComments();
        showMessage('commentMessage', 'Comment posted successfully!', false);
    });

    renderComments();
}

function renderComments() {
    const commentList = document.getElementById('commentList');
    if (!commentList) return;

    const comments = getComments();
    commentList.innerHTML = comments.map(comment => `
        <li class="comment-item">
            <div class="comment-author">
                <span>${comment.author} (@${comment.username})</span>
                <span class="comment-date">${formatDate(comment.createdAt)}</span>
            </div>
            <p class="comment-text">${escapeHtml(comment.text)}</p>
        </li>
    `).join('');

    if (comments.length === 0) {
        commentList.innerHTML = '<li class="comment-item"><p class="comment-text">No comments yet. Be the first to post!</p></li>';
    }
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[tag]));
}

function initPage() {
    initRegistration();
    initLogin();
    initCommentPage();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
