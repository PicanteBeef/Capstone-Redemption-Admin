<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import supabase from "/src/lib/supabaseClient.js";
  import moment from "moment";
  import Chart from "chart.js/auto";

  const authLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
    } else {
      console.log("Logged out");
      goto("/");
      alert("You have been logged out.");
      // Redirect or perform other actions after successful logout
    }
  };

  let formData = {
    bloodType: "",
    amount: 0,
  };

  let data = [];
  let data2 = [];
  let data3 = [];
  let totalSum = [];
  let bloodTypeArray = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Insert Entry to Blood Inventory
  async function handleSubmit(event) {
    console.log(formData);
    event.preventDefault();
    // Calculate the expiry date by adding 42 days to the current date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 42);

    const { data: record, error } = await supabase
      .from("blood_inventory")
      .insert({
        blood_type: formData.bloodType,
        amount: formData.amount,
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
  }

  //Fetch Blood Inventory Data
  onMount(async () => {
    const { data: records, error } = await supabase
      .from("blood_inventory")
      .select("*")
      .order("entry_date", { ascending: false })
      .limit(10);

    // Fetch Blood Transactions Data
    const { data: records2, error2 } = await supabase
      .from("blood_transactions")
      .select("*")
      .order("id", { ascending: false })
      .limit(5);

    // Fetch Blood Requests Data
    const { data: records3, error3 } = await supabase
      .from("blood_requests")
      .select("*")
      .order("id", { ascending: false })
      .limit(5);

    // Catch Errors
    if (error) {
      console.error("Error fetching data", error);
    } else {
      data = records;
    }

    if (error2) {
      console.error("Error fetching data", error2);
    } else {
      data2 = records2;
    }

    if (error3) {
      console.error("Error fetching data", error3);
    } else {
      data3 = records3;
    }

    //Donut Chart Data Visualization
    const { data: donutRecords, donutError } = await supabase
      .from("blood_inventory")
      .select("*")
      .order("entry_date", { ascending: false });

    if (error) {
      console.error("Error fetching data", donutError);
    } else {
      data = donutRecords;

      await Promise.all(
        bloodTypeArray.map(async (bloodType) => {
          const { data: amountData, error: amountError } = await supabase
            .from("blood_inventory")
            .select("amount")
            .filter("blood_type", "eq", bloodType);

          if (amountError) {
            console.error(`Error fetching data for ${bloodType}`, amountError);
          } else {
            totalSum[bloodType] = amountData.reduce(
              (total, item) => total + (item.amount || 0),
              0
            );
          }
        }));
        doughnutChart();
    }
  });
  console.log(totalSum);

  function doughnutChart() {
    const ctx = document.getElementById("myDoughnutChart").getContext("2d");

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: bloodTypeArray,
        datasets: [
          {
            data: bloodTypeArray.map((bloodType) => totalSum[bloodType]),
            backgroundColor: [
              "#cbd6e4",
              "#bfcbdb",
              "#b3bfd1",
              "#a4a2a8",
              "#df8879",
              "#c86558",
              "#b04238",
              "#991f17",
            ],
            borderWidth: 1,
          }],
      },
      options: {
        maintainAspectRatio: false, // Set to false to allow manual control of the aspect ratio
        responsive: true,
        cutout: '50%',
      },
    });
  }
</script>

<html lang="en">
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

    <!--Charts.js Library-->
    <!--Charts.js Library-->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

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
      <nav
        class="navbar navbar-expand-md navbar-dark fixed-top bg-danger w-100"
      >
        <div class="container-fluid">
          <a
            class="navbar-brand"
            href="#home"
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
              <li class="nav-item">
                <a
                  class="nav-link nav-hover text-light"
                  href="/admin/dashboard/bloodreqforms">Request Forms</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link nav-hover text-light"
                  href="/admin/dashboard/donations">Donations</a
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
        <!--Dashboard-->
        <div class="container text-center">
          <div class="row">
            <div class="row justify-content-center mt-4 mb-4">
              <div class="col-12 col-md-8 text-center">
                <canvas id="myDoughnutChart" style="width:300px; height:300px;max-width:100%;"></canvas>
              </div>
            </div>
        </div>
      </div>
        <!-- Transaction Section-->
        <div>
          <div class="row mx-1">
            <div class="card mb-3 col mx-1">
              <div class="card-header text-danger">
                <i class="fa fa-bar-chart" /> Recent Transactions
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="table-responsive col my-auto">
                    <table
                      class="table table-bordered"
                      width="100%"
                      cellspacing="0"
                    >
                      <thead>
                        <tr class="clearfix">
                          <th>ID</th>
                          <th>Entry Type</th>
                          <th>Blood Type</th>
                          <th>Date</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tfoot>
                        <tr>
                          <th>ID</th>
                          <th>Entry Type</th>
                          <th>Blood Type</th>
                          <th>Date</th>
                          <th>Amount</th>
                        </tr>
                      </tfoot>
                      <tbody>
                        {#each data2 as item (item.id)}
                          <tr>
                            <td>{item.id}</td>
                            <td>{item.transaction_type}</td>
                            <td>{item.blood_type}</td>
                            <td
                              >{moment(item.transaction_date).format(
                                "L • hh:mma"
                              )}</td
                            >
                            <td>{item.amount} • {item.amount * 450} CC</td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                    <a
                      class="btn btn-danger"
                      href="/admin/dashboard/bloodtransac"
                      >View More <i class="fa fa-angle-right" /></a
                    >
                  </div>
                </div>
              </div>
            </div>

            <!--Requests Section-->
            <div class="card mb-3 col mx-1">
              <div class="card-header text-danger">
                <i class="fa fa-bar-chart" /> Blood Requests
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="table-responsive col my-auto">
                    <table
                      class="table table-bordered"
                      width="100%"
                      cellspacing="0"
                    >
                      <thead>
                        <tr class="clearfix">
                          <th>ID</th>
                          <th>Request Blood Type</th>
                          <th>Request Urgency</th>
                          <th>Date Requested</th>
                          <th>Request Quantity</th>
                        </tr>
                      </thead>
                      <tfoot>
                        <tr>
                          <th>ID</th>
                          <th>Request Blood Type</th>
                          <th>Request Urgency</th>
                          <th>Date Requested</th>
                          <th>Request Quantity</th>
                        </tr>
                      </tfoot>
                      <tbody>
                        {#each data3 as item (item.id)}
                          <tr>
                            <td>{item.id}</td>
                            <td>{item.patient_bloodtype}</td>
                            <td>{item.request_urgency}</td>
                            <td
                              >{moment(item.request_date).format(
                                "L • hh:mma"
                              )}</td
                            >
                            <td>{item.request_quantity}</td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                    <a
                      class="btn btn-danger"
                      href="/admin/dashboard/bloodrequests"
                      >View More <i class="fa fa-angle-right" /></a
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!--Blood Inventory-->
          <div class="card mb-3 mx-1" id="blood-inventory">
            <div class="card-header text-danger">
              <i class="fa fa-droplet" /> Blood Inventory
              <a
                href="/admin/dashboard/inventory"
                class="btn btn-danger float-end">More Details</a
              >
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
                      <th
                        >Serial ID<a href="#home"
                          ><i class="fa-solid fa-sort float-end text-dark" /></a
                        ></th
                      >
                      <th
                        >Blood Type<a href="#home"
                          ><i class="fa-solid fa-sort float-end text-dark" /></a
                        ></th
                      >
                      <th
                        >Amount<a href="#home"
                          ><i class="fa-solid fa-sort float-end text-dark" /></a
                        ></th
                      >
                      <th
                        >Expiration<a href="#home"
                          ><i class="fa-solid fa-sort float-end text-dark" /></a
                        ></th
                      >
                      <th
                        >Date Entry<a href="#home"
                          ><i class="fa-solid fa-sort float-end text-dark" /></a
                        ></th
                      >
                    </tr>
                  </thead>
                  <tfoot>
                    <tr>
                      <th>Serial ID</th>
                      <th>Blood Type</th>
                      <th>Amount</th>
                      <th>Expiration</th>
                      <th>Date Entry</th>
                    </tr>
                  </tfoot>
                  <tbody>
                    {#each data as item (item.id)}
                      <tr>
                        <td>{item.id}</td>
                        <td>{item.blood_type}</td>
                        <td>{item.amount}</td>
                        <td>{moment(item.expiry).format("L • hh:mma")}</td>
                        <td>{moment(item.entry_date).format("L • hh:mma")}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Donor Table
      <div class="card mb-3 mx-1">
        <div class="card-header text-danger">
          <i class="fa fa-table"></i> Donor Info</div>
        <div class="card-body">
          <div class="mb-2 w-100">
            <span><i class="fa-solid fa-magnifying-glass"></i></span>
            <input type="text" id="myInput" onkeyup="searchDonor()" placeholder="Search Donors">
          </div>
          <div class="table-responsive">
            <table class="table table-bordered" id="donorTable" width="100%" cellspacing="0">
              <thead>
                <tr class="clearfix">
                  <th>Name<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Blood Type<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Birthdate<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Gender<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Weight<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>BP<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th>Name</th>
                  <th>Blood Type</th>
                  <th>Birthdate</th>
                  <th>Gender</th>
                  <th>Weight</th>
                  <th>BP</th>
                </tr>
              </tfoot>
              <tbody>
                <tr>
                  <td>Liemel Lacanilao</td>
                  <td>B+</td>
                  <td>01/01/1999</td>
                  <td>Male</td>
                  <td>55kg</td>
                  <td>110/75mmHg</td>
                </tr>
                <tr>
                  <td>Lance del Mundo</td>
                  <td>B+</td>
                  <td>01/01/1999</td>
                  <td>Male</td>
                  <td>55kg</td>
                  <td>110/75mmHg</td>
                </tr>
                <tr>
                  <td>Kim Querobines</td>
                  <td>B+</td>
                  <td>01/01/1999</td>
                  <td>Male</td>
                  <td>55kg</td>
                  <td>110/75mmHg</td>
                </tr>
                <tr>
                  <td>Marc Justyn Villanueva</td>
                  <td>B+</td>
                  <td>01/01/1999</td>
                  <td>Male</td>
                  <td>55kg</td>
                  <td>110/75mmHg</td>
                </tr>
                <tr>
                  <td>Mark Daniel de Veyra</td>
                  <td>B+</td>
                  <td>01/01/1999</td>
                  <td>Male</td>
                  <td>55kg</td>
                  <td>110/75mmHg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer small text-danger">Last update: mm/dd/yyyy hh:mm</div>
      </div> -->
        </div>
        <!-- /.container-fluid-->
        <!-- /.content-wrapper-->
        <footer class="sticky-footer">
          <div class="container">
            <div class="text-center text-danger">
              <small>For Capstone use only.</small>
            </div>
          </div>
        </footer>
        <!-- Scroll to Top Button-->
        <a class="scroll-to-top rounded" href="#page-top">
          <i class="fa fa-angle-up" />
        </a>
        <!-- Logout Modal-->
        <!-- <div class="modal fade" id="logout-modal" tabindex="-1" role="dialog" aria-labelledby="logout-modal-Label" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header bg-danger">
            <p class="modal-title fs-4 fw-bold text-light" id="logout-modal-Label">Ready to Leave?</p>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">Select "Logout" below to sign out of the system and end the session.</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Close</button>
            <a class="btn btn-danger" href="Home.html">Logout</a>
          </div>
        </div>
      </div>
    </div> -->
      </div>
    </main>
  </body>

  <script>
    //Donor Search onkeyup
    function searchDonor() {
      // Declare variables
      var input, filter, table, tr, td, i, txtValue;
      input = document.getElementById("myInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("donorTable");
      tr = table.getElementsByTagName("tr");

      // Loop through all table rows, and hide those who don't match the search query
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
          txtValue = td.textContent || td.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      }
    }

    //   //Database Sync
    //   async function getBloodInventory() {
    //     const data = await fetch("https://encouraging-erin-crayfish.cyclic.app/api/blood-inventory");
    //     const results = await data.json();

    //     return results;
    //   }

    //   const head = `<table class="table">
    //   <thead>
    //     <tr>
    //       <th scope="col">ID</th>
    //       <th scope="col">Blood Type</th>
    //       <th scope="col">Amount</th>
    //       <th scope="col">Expiry</th>
    //       <th scope="col">Entry Date</th>
    //       <th scope="col">Action</th>
    //     </tr>
    //   </thead>
    //   <tbody>
    //   `

    //   const footer = `
    // </tbody>
    // </table>
    //   `

    //   document.addEventListener('DOMContentLoaded', async ()=>{
    //     const items = await getBloodInventory();

    //     const myContainer = document.getElementById('items-container')

    //     myContainer.innerHTML = `
    //       ${head}
    //       ${items.map(item => (`
    //     <tr>
    //       <th scope="row">${item.id}</th>
    //       <td>${item.bloodType}</td>
    //       <td>${item.amount}</td>
    //       <td>${item.expiry}</td>
    //       <td>${item.entryDate}</td>
    //       <td><button class="border border-0 bg-transparent"><a href=""><i class="fa-solid fa-trash fs-5 text-danger"></i></a></button></td>
    //     </tr>
    //     `
    //     ))
    //   })}
    //   ${footer}
    //     `
    //    })
  </script>
</html>
