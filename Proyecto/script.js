document.addEventListener('DOMContentLoaded', function () {
    // Redirigir al menú correspondiente si el usuario ya está autenticado
    if (window.location.pathname.includes('Login.html') && sessionStorage.getItem('loggedIn')) {
        const role = sessionStorage.getItem('role');
        if (role === 'admin') {
            window.location.href = 'menuAdmin/menuCliente.html';
        } else if (role === 'colocadora') {
            window.location.href = 'menuColocadora/menuInventario.html';
        } else if (role === 'cliente') {
            window.location.href = 'menuCliente/menuReporteInv.html';
        }
    }

    // Manejar el inicio de sesión
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const username = document.getElementById('usernameInput').value;
            const password = document.getElementById('passwordInput').value;

            // Validación de roles y redirección
            if (username === 'admin' && password === '1234') {
                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('role', 'admin');
                window.location.href = 'menuAdmin/menuCliente.html';
            } else if (username === 'colocadora' && password === '5678') {
                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('role', 'colocadora');
                window.location.href = 'menuColocadora/menuInventario.html';
            } else if (username === 'cliente' && password === 'abcd') {
                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('role', 'cliente');
                window.location.href = 'menuCliente/menuReporteInv.html';
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        });
    }

    // Manejar el botón de Logout en todas las páginas
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function (event) {
            event.preventDefault(); // Evita el comportamiento predeterminado del enlace
            sessionStorage.removeItem('loggedIn'); // Elimina el estado de inicio de sesión
            sessionStorage.removeItem('role'); // Elimina el rol del usuario
            window.location.href = '../Login.html'; // Redirige al inicio de sesión
        });
    }

    // Verificar si el usuario ha iniciado sesión en las páginas protegidas
    if (window.location.pathname.includes('menuAdmin/menuCliente.html') || 
        window.location.pathname.includes('menuColocadora/menuInventario.html') || 
        window.location.pathname.includes('menuCliente/menuReporteInv.html') || 
        window.location.pathname.includes('menuProducto.html')) {
        if (!sessionStorage.getItem('loggedIn')) {
            window.location.href = '../Login.html'; // Redirige al inicio de sesión si no está autenticado
        }

        // Mostrar el usuario conectado
        const role = sessionStorage.getItem('role');
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');

        if (userNameElement && userRoleElement) {
            userNameElement.textContent = role === 'admin' ? 'Administrador' : role.charAt(0).toUpperCase() + role.slice(1);
            userRoleElement.textContent = role.charAt(0).toUpperCase() + role.slice(1);
        }
    }

    // Navegación en el menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function () {
            const page = item.getAttribute('data-page');
            window.location.href = page;
        });
    });
    
});



//Este es el script del menu lateral y el modo oscuro

const body = document.querySelector("body"),
      modeToggle = body.querySelector(".logout-mode");
      sidebar = body.querySelector("nav");
      sidebarToggle = body.querySelector(".sidebar-toggle");
let getMode = localStorage.getItem("mode");
if(getMode && getMode ==="dark"){
    body.classList.toggle("dark");
}
let getStatus = localStorage.getItem("status");
if(getStatus && getStatus ==="close"){
    sidebar.classList.toggle("close");
}
modeToggle.addEventListener("click", () =>{
    body.classList.toggle("dark12");
    if(body.classList.contains("darko")){
        localStorage.setItem("mode", "dark2");
    }else{
        localStorage.setItem("mode", "light1");
    }
});
sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    if(sidebar.classList.contains("close")){
        localStorage.setItem("status", "close");
    }else{
        localStorage.setItem("status", "open");
    }
})