const firebaseAuth = window.EcoFirebaseAuth;

const currentPage = window.location.pathname
    .split(/[\\/]/)
    .filter(Boolean)
    .pop()
    ?.toLowerCase() || "index.html";

const requiresAuth = document.body.dataset.requiresAuth === "true";

const navList = document.querySelector(".nav-menu ul");
const loginLink = navList?.querySelector('a[href="login.html"]');
const signupLink = navList?.querySelector('a[href="signup.html"]');
const loginItem = loginLink?.closest("li");
const signupItem = signupLink?.closest("li");

const authUserItem = document.createElement("li");
authUserItem.className = "nav-auth-user";
authUserItem.hidden = true;

const authUserLabel = document.createElement("span");
authUserLabel.className = "nav-auth-label";
authUserItem.appendChild(authUserLabel);

const logoutItem = document.createElement("li");
logoutItem.className = "nav-auth-logout";
logoutItem.hidden = true;

const logoutButton = document.createElement("button");
logoutButton.type = "button";
logoutButton.className = "nav-logout-btn";
logoutButton.textContent = "Logout";
logoutItem.appendChild(logoutButton);

if (navList) {
    navList.append(authUserItem, logoutItem);
}

const applyAuthState = (user) => {
    const isLoggedIn = Boolean(user);
    const label = user?.displayName || user?.email || "Account";

    if (loginItem) {
        loginItem.hidden = isLoggedIn;
    }

    if (signupItem) {
        signupItem.hidden = isLoggedIn;
    }

    authUserItem.hidden = !isLoggedIn;
    logoutItem.hidden = !isLoggedIn;
    authUserLabel.textContent = label;

    if (requiresAuth && !isLoggedIn) {
        const nextPath = `${currentPage}${window.location.search}${window.location.hash}`;
        const destination = `login.html?next=${encodeURIComponent(nextPath)}`;
        window.location.replace(destination);
    }
};

logoutButton.addEventListener("click", async () => {
    if (!firebaseAuth) {
        return;
    }

    logoutButton.disabled = true;

    try {
        await firebaseAuth.signOut();
        window.location.href = "login.html?logout=success";
    } catch (error) {
        logoutButton.disabled = false;
    }
});

if (firebaseAuth) {
    firebaseAuth.onAuthStateChanged(applyAuthState);
} else {
    applyAuthState(null);
}
