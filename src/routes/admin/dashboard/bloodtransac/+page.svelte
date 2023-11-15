<!-- Blood transactions lands here. -->

<script>
    import { onMount } from "svelte";
    import supabase from "/src/lib/supabaseClient.js";
    import moment from "moment";
  
    let formData = {
      bloodType: "",
      amount: 0,
      entryDate: "",
    };
  
    let data = [];
    let data1 = [];
  
    // Insert Entry to Blood Inventory
    async function handleSubmit(event) {
      console.log(formData);
      event.preventDefault();
      // Calculate the expiry date by adding 42 days to the current date
      const entryDate = new Date(formData.entryDate);
      const expiryDate = new Date(formData.entryDate);
      expiryDate.setDate(expiryDate.getDate() + 42);
  
      const { data: record, error } = await supabase
        .from("blood_inventory")
        .insert({
          blood_type: formData.bloodType,
          amount: formData.amount,
          entry_date: entryDate,
          expiry: expiryDate,
        })
        .select();
  
      if (error) {
        console.error("Error inserting data:", error);
        return;
      }
  
      formData = {
        bloodType: "",
        amount: 0,
        entryDate: "",
      };
  
      data = [record[0], ...data];
    }
  
    // Delete Entry From Blood Inventory
    async function deleteOne(itemToDelete) {
      console.log(itemToDelete);
  
      const { error } = await supabase
        .from("blood_inventory")
        .delete()
        .eq("id", itemToDelete);
  
      if (error) {
        console.error("Error", error);
      } else {
        data = data.filter((item) => item.id !== itemToDelete);
      }
  
      data = [record[0], ...data];
    }
  
      //Fetch Blood Transaction Data
    onMount(async () => {
      const { data: records, error } = await supabase
        .from("blood_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
  
      if (error) {
        console.error("Error fetching data from Supabase:", error);
      } else {
        data = records;
      }
    });
  </script>
  
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta name="description" content="" />
    <meta name="author" content="" />
    <title>B.D.M.S | Admin</title>
  
    <!-- Latest compiled and minified CSS -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <script
      src="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js"
      integrity="sha384-oesi62hOLfzrys4LxRF63OJCXdXDipiYWBnvTl9Y9/TRlw5xlKIEHpNyvvDShgf/"
      crossorigin="anonymous"
    ></script>
  
    <!-- Latest compiled JavaScript -->
    <!-- Latest compiled JavaScript -->
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
    ></script>
  
    <!--Latest complied Popperjs-->
    <!--Latest complied Popperjs-->
    <script
      src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
      integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
      crossorigin="anonymous"
    ></script>
  
    <!--FontAwesome-->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
  
    <style>
      html {
        scroll-behavior: smooth;
      }
  
      main {
        animation: fadeIn 0.5s;
      }
  
      @keyframes fadeIn {
        from {
          opacity: 0;
          filter: blur(5px);
          transform: translateX(-5px);
        }
        to {
          opacity: 1;
          filter: blur(0);
          transform: translateX(0);
        }
      }
  
      .nav-hover {
        display: inline-block;
        padding-bottom: 2px;
        background-image: linear-gradient(#ffffff 0 0);
        background-position: 0 100%; /*OR bottom left*/
        background-size: 0% 2px;
        background-repeat: no-repeat;
        transition: background-size 0.3s, background-position 0s 0.3s; /*change after the size immediately*/
      }
  
      .nav-hover:hover {
        background-position: 100% 100%; /*OR bottom right*/
        background-size: 100% 2px;
      }
  
      ::-webkit-scrollbar {
        width: 9px;
        background: transparent;
      }
  
      ::-webkit-scrollbar-track {
        background-color: #a11f1f55;
      }
  
      ::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background: #9a1818;
      }
  
      ::-webkit-scrollbar-thumb:hover {
        border-radius: 3px;
        background: #741212;
      }
  
      .login-btn {
        margin-left: auto;
      }
      @media screen and (max-width: 768px) {
        .login-btn {
          margin-left: 0;
        }
      }
    </style>
  </head>
  
  <body class="fixed-nav bg-dark sticky-footer" id="page-top">
    <!-- Navigation-->
    <header class="vw-100">
      <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-danger w-100">
        <div class="container-fluid">
          <a
            class="navbar-brand"
            href="/admin/dashboard/"
            style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;font-weight: bold;"
            >B.D.M.S <i class="fa-solid fa-droplet" /></a
          >
  
          <button
            class="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon" />
          </button>
          <div class="collapse navbar-collapse" id="navbarCollapse">
            <ul style="width: 100%;" class="navbar-nav mr-auto mb-2 mb-md-0">
              <li class="nav-item">
                <a
                  class="nav-link nav-hover text-light"
                  href="/admin/dashboard/inventory">Inventory</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link nav-hover text-light"
                  href="/admin/dashboard/bloodrequests">Blood Requests</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link nav-hover text-light"
                  href="/admin/dashboard/bloodtransac">Blood Transactions</a
                >
              </li>
            </ul>
            <a
              href="/"
              style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;font-weight: bold;"
              class="btn btn-danger">Logout</a
            >
          </div>
        </div>
      </nav>
    </header>
  
    <main>
      <!--Main Content-->
      <div class="content-wrapper" style="margin-top: 5rem;">
        <!-- Transaction Section-->
        <div>
  
          <!--Blood Inventory-->
          <div class="card mb-3 mx-1" id="blood-inventory">
            <div class="card-header text-danger">
              <i class="fa fa-droplet" /> Blood Transactions
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table
                  class="table table-bordered"
                  id="dataTable"
                  width="100%"
                  cellspacing="0"
                >
                  <thead>
                    <tr class="clearfix">
                        <th>Serial ID</th>
                        <th>Blood Type</th>
                        <th>Amount</th>
                        <th>Transaction Date</th>
                        <th>Transaction Type</th>
                    </tr>
                  </thead>
                  <tfoot>
                    <tr>
                        <th>Serial ID</th>
                        <th>Blood Type</th>
                        <th>Amount</th>
                        <th>Transaction Date</th>
                        <th>Transaction Type</th>
                    </tr>
                  </tfoot>
                  <tbody>
                    {#each data as item (item.id)}
                      <tr>
                        <td>{item.id}</td>
                        <td>{item.blood_type}</td>
                        <td>{item.amount}</td>
                        <td>{moment(item.transaction_date).format("L • hh:mma")}</td>
                        <td>{item.transaction_type}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <footer class="sticky-footer">
          <div class="container">
            <div class="text-center text-danger">
              <small>For Capstone use only.</small>
            </div>
          </div>
        </footer>
      </div>
    </main>
  </body>
  