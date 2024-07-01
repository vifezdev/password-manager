document.addEventListener('DOMContentLoaded', function () {
    const passwordLengthInput = document.getElementById('password-length');
    const generatePasswordButton = document.getElementById('generate-password');
    const generatedPasswordInput = document.getElementById('generated-password');
    const savePasswordButton = document.getElementById('save-password');
    const savedPasswordsList = document.getElementById('saved-passwords');
    const clearPasswordsButton = document.getElementById('clear-passwords-button');
    const downloadPasswordsButton = document.getElementById('download-passwords-button');
    const noteInput = document.getElementById('note');

    function loadPasswordsFromStorage() {
        let passwords = JSON.parse(localStorage.getItem('savedPasswords')) || [];
        passwords.forEach(function (entry) {
            addPasswordToDOM(entry.password, entry.note);
        });
    }

    loadPasswordsFromStorage();

    generatePasswordButton.addEventListener('click', function () {
        const passwordLength = parseInt(passwordLengthInput.value);
        const generatedPassword = generatePassword(passwordLength);
        generatedPasswordInput.value = generatedPassword;
    });

    savePasswordButton.addEventListener('click', function () {
        const password = generatedPasswordInput.value.trim();
        const note = noteInput.value.trim();
        if (password !== '') {
            savePassword(password, note);
            generatedPasswordInput.value = '';
            noteInput.value = '';
        }
    });

    clearPasswordsButton.addEventListener('click', function () {
        clearPasswords();
    });

    downloadPasswordsButton.addEventListener('click', function () {
        downloadPasswords();
    });

    savedPasswordsList.addEventListener('click', function (event) {
        if (event.target.classList.contains('copy-button')) {
            const passwordToCopy = event.target.parentNode.querySelector('.password-item').textContent;
            copyPasswordToClipboard(passwordToCopy);
        } else if (event.target.classList.contains('delete-button')) {
            const passwordToDelete = event.target.parentNode.querySelector('.password-item').textContent;
            deletePassword(passwordToDelete);
        }
    });

    function generatePassword(length) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    }

    function savePassword(password, note) {
        let passwords = JSON.parse(localStorage.getItem('savedPasswords')) || [];
        passwords.push({ password, note });
        localStorage.setItem('savedPasswords', JSON.stringify(passwords));
        addPasswordToDOM(password, note);
    }

    function addPasswordToDOM(password, note) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="password-item">${password}</span>
            <span class="note-item">Note: ${note}</span>
            <button class="copy-button">Copy</button>
            <button class="delete-button">Delete</button>
        `;
        savedPasswordsList.appendChild(li);
    }

    function clearPasswords() {
        localStorage.removeItem('savedPasswords');
        savedPasswordsList.innerHTML = '';
    }

    function downloadPasswords() {
        let passwords = JSON.parse(localStorage.getItem('savedPasswords')) || [];
        const blob = new Blob([passwords.map(entry => `Note: ${entry.note}\nPassword: ${entry.password}`).join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'passwords.txt';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }

    function copyPasswordToClipboard(password) {
        navigator.clipboard.writeText(password).then(function () {
            console.log('Password copied to clipboard');
        }).catch(function (err) {
            console.error('Failed to copy password: ', err);
        });
    }

    function deletePassword(passwordToDelete) {
        let passwords = JSON.parse(localStorage.getItem('savedPasswords')) || [];
        passwords = passwords.filter(function (entry) {
            return entry.password !== passwordToDelete;
        });
        localStorage.setItem('savedPasswords', JSON.stringify(passwords));
        displaySavedPasswords();
    }

    function displaySavedPasswords() {
        savedPasswordsList.innerHTML = '';
        let passwords = JSON.parse(localStorage.getItem('savedPasswords')) || [];
        passwords.forEach(function (entry) {
            addPasswordToDOM(entry.password, entry.note);
        });
    }

    window.addEventListener('beforeunload', function () {
        let passwords = Array.from(savedPasswordsList.children).map(function (li) {
            const password = li.querySelector('.password-item').textContent;
            const note = li.querySelector('.note-item').textContent.replace('Note: ', '');
            return { password, note };
        });
        localStorage.setItem('savedPasswords', JSON.stringify(passwords));
    });

    function showApp() {
        const preloader = document.getElementById('preloader');
        const app = document.getElementById('app');
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                app.style.display = 'block';
                app.style.opacity = '1';
            }, 500);
        }, 500);
    }

    showApp();
});

function toggleOptions() {
    const optionsPopup = document.getElementById('optionsPopup');
    optionsPopup.classList.toggle('show');
}

function changeGradient(direction, color1, color2) {
    const body = document.body;
    body.style.background = `linear-gradient(${direction}, ${color1}, ${color2})`;
}

function resetColors() {
    const body = document.body;
    body.style.background = '#2f3337';
}

let offsetX = 0;
let offsetY = 0;
let dragging = false;

function startDragging(event) {
    dragging = true;
    offsetX = event.clientX;
    offsetY = event.clientY;
    document.addEventListener('mousemove', dragOptionsPopup);
    document.addEventListener('mouseup', stopDragging);
}

function dragOptionsPopup(event) {
    if (dragging) {
        const optionsPopup = document.getElementById('optionsPopup');
        const newX = optionsPopup.offsetLeft - (offsetX - event.clientX);
        const newY = optionsPopup.offsetTop - (offsetY - event.clientY);
        optionsPopup.style.left = newX + 'px';
        optionsPopup.style.top = newY + 'px';
        offsetX = event.clientX;
        offsetY = event.clientY;
    }
}

function stopDragging() {
    dragging = false;
    document.removeEventListener('mousemove', dragOptionsPopup);

    displaySavedPasswords();
}