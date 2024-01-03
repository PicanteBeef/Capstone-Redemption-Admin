<script>
  import supabase from "/src/lib/supabaseClient.js";
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let errorMessage = "";

  const login = async () => {
    // try {
    // const { data: createData, error: createError } = await supabase.auth.signUp({
    //   email: email,
    //   password: password
    // })

    // if (createError) {
    //   console.log(createError)
    // }

    //   const { user, error } = await supabase.auth.signInWithPassword({
    //     email: email,
    //     password: password,
    //   });

    //   if (error) {
    //     errorMessage = 'Invalid credentials. Please try again.';
    //     return;
    //   }

    //   console.log('Logged in:', user);
    

    try {
      const { data: users, error } = await supabase
      .from("users")
      .select("*")

      // const usersSupabase = await supabase("users");

      function signIn(email, password) {
        const user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          console.log("Sign in successful!");
          goto("/admin/dashboard");
          // Additional logic for a successful sign-in
        } else {
          errorMessage = 'Invalid credentials. Please try again.';
          console.log("Invalid username or password.");
          // Additional logic for unsuccessful sign-in
        }
      }

      signIn(email, password)
    } catch (error) {
      console.error("Login error:", error.message);
      errorMessage = "An error occurred. Please try again.";
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
        margin: 0px;
      }
    </style>
  </head>

  <body>
    <main style="height: 100%;">
      <!-- Login -->
      <section class="vw-100 vh-100 bg-danger">
        <div class="container py-5 h-100">
          <div
            class="row d-flex justify-content-center align-items-center h-100"
          >
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
                        <span class="h2 fw-bold mb-0"
                          >Blood Bank Management System</span
                        >
                      </div>
                      <h5
                        class="fw-normal mb-3 pb-3"
                        style="letter-spacing: 1px;"
                      >
                        Please enter your login credentials
                      </h5>
                      {#if errorMessage}
                        <p class="text-danger">{errorMessage}</p>
                      {/if}
                      <!--Login Form-->
                      <form on:submit|preventDefault={login}>
                        <div class="form-outline mb-4">
                          <input
                            type="email"
                            class="form-control form-control-lg"
                            bind:value={email}
                            required
                          />
                          <label class="form-label" for="email"
                            >Email address</label
                          >
                        </div>

                        <div class="form-outline mb-4">
                          <input
                            type="password"
                            class="form-control form-control-lg"
                            bind:value={password}
                            required
                          />
                          <label class="form-label" for="password"
                            >Password</label
                          >
                        </div>

                        <div class="pt-1 mb-4">
                          <button
                            type="submit"
                            class="btn btn-danger rounded-pill btn-lg btn-block"
                            on:click={login}>Login</button
                          >
                        </div>

                        <a class="small text-muted" href="#!"
                          >Forgot password?</a
                        >
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
    </main>
  </body>
</html>
