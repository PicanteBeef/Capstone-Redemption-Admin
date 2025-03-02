<script>
  import { supabase } from "/src/lib/supabaseClient.js";
  import { goto } from "$app/navigation";
  import { authStore } from "/src/lib/authStore.js";

  // State variables
  let email = "";
  let password = "";
  let errorMessage = "";

  // Modal states
  let showSignUpModal = false;
  let showForgotPasswordModal = false;

  // Sign Up variables
  let signUpEmail = "";
  let signUpPassword = "";
  let signUpSuccessMessage = "";
  let signUpErrorMessage = "";

  // Forgot Password variables
  let forgotPasswordEmail = "";
  let forgotPasswordSuccessMessage = "";
  let forgotPasswordErrorMessage = "";

  // Function to log modal states
  function logModalStates() {
    console.log("Modal States:");
    console.log("- Show Sign Up Modal:", showSignUpModal);
    console.log("- Show Forgot Password Modal:", showForgotPasswordModal);
    console.log("Active Modal:", showSignUpModal ? "Sign Up" : showForgotPasswordModal ? "Forgot Password" : "None");
  }

  // Login function
  const login = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    console.log('Login response:', { data, error });

    if (error) {
      errorMessage = "Invalid credentials. Please try again.";
      console.error("Login error:", error.message);
      return;
    }

    if (data.user) {
      console.log('User logged in successfully:', data.user);
      authStore.update((state) => ({
        ...state,
        user: data.user,
        isAuthenticated: true,
      }));
      goto("/admin/dashboard");
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
    errorMessage = "An error occurred. Please try again.";
  }
};

  // Sign Up function
  const signUp = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
      });

      if (error) {
        signUpErrorMessage = "Registration failed. Please try again.";
        console.error("Sign-up error:", error.message);
        return;
      }

      signUpSuccessMessage = "Registration successful! Please check your email for verification.";
      signUpEmail = "";
      signUpPassword = "";
    } catch (error) {
      console.error("Unexpected error:", error.message);
      signUpErrorMessage = "An error occurred. Please try again.";
    }
  };

  // Forgot Password function
  const forgotPassword = async () => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail);

      if (error) {
        forgotPasswordErrorMessage = "Failed to send password reset email. Please try again.";
        console.error("Password reset error:", error.message);
        return;
      }

      forgotPasswordSuccessMessage = "Password reset email sent successfully!";
      forgotPasswordEmail = "";
    } catch (error) {
      console.error("Unexpected error:", error.message);
      forgotPasswordErrorMessage = "An error occurred. Please try again.";
    }
  };
</script>

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="" />
    <meta
      name="author"
      content="Mark Otto, Jacob Thornton, and Bootstrap contributors"
    />
    <meta name="generator" content="Hugo 0.72.0" />
    <title>B.D.M.S</title>

    <link
      rel="canonical"
      href="https://v5.getbootstrap.com/docs/5.0/examples/carousel/"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />

    <!-- Bootstrap core CSS -->
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css"
      integrity="sha384-r4NyP46KrjDleawBgD5tp8Y7UzmLA05oM1iAEQ17CSuDqnUK2+k9luXQOfXJCJ4I"
      crossorigin="anonymous"
    />

    <script
      src="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js"
      integrity="sha384-oesi62hOLfzrys4LxRF63OJCXdXDipiYWBnvTl9Y9/TRlw5xlKIEHpNyvvDShgf/"
      crossorigin="anonymous"
    ></script>

    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
    ></script>

    <script
      src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
      integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo"
      crossorigin="anonymous"
    ></script>

    <style>
      body {
        width: 100%;
        height: 100vh;
        margin: 0;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal {
        position: relative;
        background: white;
        padding: 20px;
        border-radius: 8px;
        width: 400px;
        height: 650px;
        max-width: 90%;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1001; /* Ensure modal appears above overlay */
        display: flex; /* This makes the modal itself flex */
        flex-direction: column; /* Aligns form content vertically */
        justify-content: center; /* Centers vertically */
        align-items: center; /* Centers horizontally */
      }

      .modal h2 {
        margin-bottom: 1rem;
      }

      .modal button {
        margin-right: 0.5rem;
      }

      .scale-in-center {
        -webkit-animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
      }

      @-webkit-keyframes scale-in-center {
        0% {
          -webkit-transform: scale(0);
                  transform: scale(0);
          opacity: 1;
        }
        100% {
          -webkit-transform: scale(1);
                  transform: scale(1);
          opacity: 1;
        }
      }
      @keyframes scale-in-center {
        0% {
          -webkit-transform: scale(0);
                  transform: scale(0);
          opacity: 1;
        }
        100% {
          -webkit-transform: scale(1);
                  transform: scale(1);
          opacity: 1;
        }
      }
    </style>
  </head>

  <body>
    <main>
      <!-- Login -->
      <section class="vw-100 vh-100 bg-danger">
        <div class="container py-5 h-100">
          <div class="row d-flex justify-content-center align-items-center h-100">
            <div class="col col-xl-10">
              <div class="card" style="border-radius: 1rem;">
                <div class="row g-0">
                  <div class="col-md-6 col-lg-5 d-none d-md-block">
                    <img
                      src="https://as2.ftcdn.net/v2/jpg/04/71/23/25/1000_F_471232514_ApbVcgtXxHWdBwVfWntXlMFpYgphFKCZ.jpg"
                      alt="login form"
                      class="img-fluid"
                      style="border-radius: 1rem 0 0 1rem;"
                    />
                  </div>
                  <div class="col-md-6 col-lg-7 d-flex align-items-center">
                    <div class="card-body p-4 p-lg-5 text-black">
                      <div class="d-flex align-items-center mb-3 pb-1">
                        <i class="fas fa-droplet fa-2x me-3 text-danger"></i>
                        <span class="h2 fw-bold mb-0">Blood Bank Management System</span>
                      </div>
                      <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">
                        Please enter your login credentials
                      </h5>
                      {#if errorMessage}
                        <p class="text-danger">{errorMessage}</p>
                      {/if}
                      <!-- Login Form -->
                      <form on:submit|preventDefault={login}>
                        <div class="form-outline mb-4">
                          <input
                            type="email"
                            class="form-control form-control-lg"
                            bind:value={email}
                            required
                          />
                          <label class="form-label" for="email">Email address</label>
                        </div>
    
                        <div class="form-outline mb-4">
                          <input
                            type="password"
                            class="form-control form-control-lg"
                            bind:value={password}
                            required
                          />
                          <label class="form-label" for="password">Password</label>
                        </div>
    
                        <div class="pt-1 mb-4">
                          <button
                            type="submit"
                            class="btn btn-danger rounded-pill btn-lg btn-block"
                          >
                            Login
                          </button>
                        </div>
    
                        <a
                          href="#!"
                          on:click|preventDefault={() => {
                            showForgotPasswordModal = true;
                            logModalStates(); // Log modal states when opening Forgot Password modal
                          }}
                          class="text-primary"
                        >
                          Reset Password
                        </a>
                        <p class="mb-5 pb-lg-2">
                          <a
                            href="#!"
                            on:click|preventDefault={() => {
                              showSignUpModal = true;
                              logModalStates(); // Log modal states when opening Sign Up modal
                            }}
                            style="color: #dc3545;"
                          >
                            Create Account
                          </a>
                        </p>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- End Login -->
    
      <!-- Sign Up Modal -->
      {#if showSignUpModal}
        <div class="modal-overlay">
          <div class="modal animated-modal">
            <h2 class="text-danger">Admin Registration</h2>
            <p class="text-muted text-center">
              Register a new administrator account for the Blood Bank Management System.
            </p>

            <div class="text-center mb-3">
              <i class="fas fa-user-shield fa-3x text-danger"></i>
            </div>

            <form on:submit|preventDefault={signUp}>
              <div class="form-outline mb-4">
                <label class="form-label" for="signUpEmail">Admin Email</label>
                <input
                  type="email"
                  class="form-control form-control-lg"
                  bind:value={signUpEmail}
                  required
                />
              </div>

              <div class="form-outline mb-4">
                <label class="form-label" for="signUpPassword">Password</label>
                <input
                  type="password"
                  class="form-control form-control-lg"
                  bind:value={signUpPassword}
                  required
                />
              </div>

              {#if signUpSuccessMessage}
                <div class="text-success mb-3">{signUpSuccessMessage}</div>
              {/if}

              {#if signUpErrorMessage}
                <div class="text-danger mb-3">{signUpErrorMessage}</div>
              {/if}

              <button type="submit" class="btn btn-danger btn-block">Create Account</button>

              <button
                class="btn btn-secondary mt-2"
                on:click={() => {
                  showSignUpModal = false;
                  logModalStates();
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      {/if}

      <!-- Forgot Password Modal -->
      {#if showForgotPasswordModal}
        <div class="modal-overlay">
          <div class="modal animated-modal">
            <h2 class="text-danger">Reset Your Password</h2>
            <p class="text-muted text-center">
              Enter your registered admin email. We'll send a secure link to reset your password.
            </p>

            <div class="text-center mb-3">
              <i class="fas fa-lock fa-3x text-danger"></i>
            </div>

            <form on:submit|preventDefault={forgotPassword}>
              <div class="form-outline mb-4">
                <label class="form-label" for="forgotPasswordEmail">Admin Email</label>
                <input
                  type="email"
                  class="form-control form-control-lg"
                  bind:value={forgotPasswordEmail}
                  required
                />
              </div>

              {#if forgotPasswordSuccessMessage}
                <div class="text-success mb-3">{forgotPasswordSuccessMessage}</div>
              {/if}

              {#if forgotPasswordErrorMessage}
                <div class="text-danger mb-3">{forgotPasswordErrorMessage}</div>
              {/if}

              <button type="submit" class="btn btn-danger btn-block">
                Send Reset Link
              </button>

              <button
                class="btn btn-secondary mt-2"
                on:click={() => {
                  showForgotPasswordModal = false;
                  logModalStates();
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
{/if}
    </main>
  </body>
</html>
