
document.addEventListener("DOMContentLoaded", () => {
    console.log("AccessPoint script loaded");
    // Footer year
    const year = document.getElementById("currentYear");
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // Demo accounts stored in this browser
    const STORAGE_KEY = "accessPointDemoAccounts";

    function getAccounts() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    }

    // Display feedback
    function showMessage(element, message, type = "error") {
        if (!element) return;
        element.textContent = message;
        element.className = `form-message ${type}`;
    }

    function clearMessage(element) {
        if (!element) return;
        element.textContent = "";
        element.className = "form-message";
    }

    // Validate email format
  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
    function markInvalid(input, invalid) {
        if (input) {
            input.classList.toggle("is-invalid", invalid);
        }
    }

    // Show/hide password
    document.querySelectorAll("[data-toggle-password]").forEach(button => {
        button.addEventListener("click", () => {
            const input = document.getElementById(
                button.dataset.togglePassword
            );

            if (!input) return;

            const show = input.type === "password";
            input.type = show ? "text" : "password";
            button.textContent = show ? "🙈" : "👁";

            button.setAttribute(
                "aria-label",
                show ? "Hide password" : "Show password"
            );

            button.setAttribute(
                "title",
                show ? "Hide password" : "Show password"
            );
        });
    });

    // REGISTRATION
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        const nameInput = document.getElementById("fullName");
        const emailInput = document.getElementById("registerEmail");
        const passwordInput = document.getElementById("registerPassword");
        const confirmInput = document.getElementById("confirmPassword");
        const termsInput = document.getElementById("termsCheck");
        const termsFeedback = document.getElementById("termsFeedback");
        const feedback = document.getElementById("registerFeedback");

        // PHP/AJAX email format check
        if (emailInput) {
            emailInput.addEventListener("blur", async () => {
                const email = emailInput.value.trim();

                if (!email) return;

                if (!validEmail(email)) {
                    return;
                }

                try {
                    const response = await fetch(
                        `check-email.php?email=${encodeURIComponent(email)}`
                    );

                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }

                    const result = await response.json();

                    if (!result.success) {
                        showMessage(feedback, result.message);
                        markInvalid(emailInput, true);
                    } else {
                        console.log("PHP email check:", result.message);
                    }
                } catch (error) {
                    console.error("PHP email check failed:", error);
                    showMessage(
                        feedback,
                        "Could not check the email with PHP. Please try again."
                    );
                }
            });
        }

        registerForm.addEventListener("submit", event => {
            event.preventDefault();
            clearMessage(feedback);

            const name = nameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            const confirmPassword = confirmInput.value;

            const nameOK = name.length >= 2;
            const emailOK = validEmail(email);
            const passwordOK = password.length >= 8;
            const confirmOK =
                confirmPassword.length > 0 &&
                password === confirmPassword;
            const termsOK = termsInput.checked;

            markInvalid(nameInput, !nameOK);
            markInvalid(emailInput, !emailOK);
            markInvalid(passwordInput, !passwordOK);
            markInvalid(confirmInput, !confirmOK);

            if (termsFeedback) {
                termsFeedback.textContent = termsOK
                    ? ""
                    : "Please accept the terms and conditions.";
            }

            if (
                !nameOK ||
                !emailOK ||
                !passwordOK ||
                !confirmOK ||
                !termsOK
            ) {
                const allFieldsEmpty =
                    !name &&
                    !email &&
                    !password &&
                    !confirmPassword;

                if (allFieldsEmpty) {
                    showMessage(
                        feedback,
                        "Please fill in all required fields."
                    );
                } else if (!nameOK) {
                    showMessage(feedback, "Please enter a valid name.");
                } else if (!emailOK) {
                    showMessage(
                        feedback,
                        "Please enter a valid email address."
                    );
                } else if (!passwordOK) {
                    showMessage(
                        feedback,
                        "Password must be at least 8 characters long."
                    );
                } else if (!confirmOK) {
                    showMessage(feedback, "Passwords do not match.");
                } else {
                    showMessage(
                        feedback,
                        "Please accept the terms and conditions."
                    );
                }

                return;
            }

            const accounts = getAccounts();

            const alreadyRegistered = accounts.some(
                account => account.email === email
            );

            if (alreadyRegistered) {
                markInvalid(emailInput, true);
                showMessage(
                    feedback,
                    "This email is already registered. Please sign in instead."
                );
                return;
            }

            // Demo only: this is not secure authentication.
            accounts.push({
                name: name,
                email: email,
                password: password
            });

            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(accounts)
                );
            } catch {
                showMessage(
                    feedback,
                    "The browser could not save this account. Check browser storage."
                );
                return;
            }

            showMessage(
                feedback,
                "Your account was created successfully. You can now sign in.",
                "success"
            );

            registerForm.reset();

            [
                nameInput,
                emailInput,
                passwordInput,
                confirmInput
            ].forEach(input => markInvalid(input, false));

            if (termsFeedback) {
                termsFeedback.textContent = "";
            }
        });

        [
            nameInput,
            emailInput,
            passwordInput,
            confirmInput
        ].forEach(input => {
            if (!input) return;

            input.addEventListener("input", () => {
                markInvalid(input, false);
                clearMessage(feedback);
            });
        });

        if (termsInput) {
            termsInput.addEventListener("change", () => {
                if (termsFeedback) {
                    termsFeedback.textContent = "";
                }
                clearMessage(feedback);
            });
        }
    }

    // LOGIN
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        const emailInput = document.getElementById("loginEmail");
        const passwordInput = document.getElementById("loginPassword");
        const feedback = document.getElementById("loginFeedback");

        loginForm.addEventListener("submit", event => {
            event.preventDefault();
            clearMessage(feedback);

            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            const emailOK = validEmail(email);

            markInvalid(emailInput, !emailOK);

            if (!emailOK) {
                showMessage(
                    feedback,
                    "Please enter a valid email address."
                );
                return;
            }

            if (!password) {
                markInvalid(passwordInput, true);
                showMessage(feedback, "Please enter your password.");
                return;
            }

            markInvalid(passwordInput, false);

            const accounts = getAccounts();
            const account = accounts.find(
                item => item.email === email
            );

            if (!account) {
                markInvalid(emailInput, true);
                showMessage(
                    feedback,
                    "No account was found for this email. Please create an account first."
                );
                return;
            }

            if (account.password !== password) {
                markInvalid(passwordInput, true);
                showMessage(
                    feedback,
                    "Incorrect password. Please try again."
                );
                return;
            }

            showMessage(
                feedback,
                `Sign-in successful. Welcome, ${account.name}!`,
                "success"
            );
        });

        [emailInput, passwordInput].forEach(input => {
            if (!input) return;

            input.addEventListener("input", () => {
                markInvalid(input, false);
                clearMessage(feedback);
            });
        });
    }

    // Optional email availability form
    const availabilityForm = document.getElementById("emailCheckForm");

    if (availabilityForm) {
        const emailInput = document.getElementById("checkEmail");
        const feedback = document.getElementById("emailCheckFeedback");

        if (emailInput) {
            availabilityForm.addEventListener("submit", event => {
                event.preventDefault();

                const email = emailInput.value.trim().toLowerCase();

                if (!validEmail(email)) {
                    showMessage(feedback, "Enter a valid email address.");
                    return;
                }

                const exists = getAccounts().some(
                    account => account.email === email
                );

                if (exists) {
                    showMessage(
                        feedback,
                        "This email is already registered. Please sign in.",
                        "error"
                    );
                } else {
                    showMessage(
                        feedback,
                        "This email is not registered in this browser. You can create an account.",
                        "success"
                    );
                }
            });
        }
    }

    // Password reset notice
    const forgotLink = document.getElementById("forgotPasswordLink");

    if (forgotLink) {
        forgotLink.addEventListener("click", event => {
            event.preventDefault();

            showMessage(
                document.getElementById("loginFeedback"),
                "Password reset is not available."
            );
        });
    }
});
