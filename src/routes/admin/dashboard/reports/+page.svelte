<script>
  // Import Svelte and other libraries
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import supabase from "/src/lib/supabaseClient.js";
  import moment from "moment";
  import Chart from "chart.js/auto";

  // Function to handle user logout
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

  // Form data for blood inventory entry
  let formData = {
    bloodType: "",
    amount: 0,
  };

  // Arrays to store data
  let data = [];
  let data2 = [];
  let data3 = [];
  let totalSum = [];
  let bloodTypeArray = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Function to handle blood inventory entry submission
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

  // Variable to store the blood in and out chart canvas reference
  let bloodInAndOutChartCanvas;

  // Fetch data on component mount
  onMount(async () => {
    // Fetch Blood Inventory Data
    const { data: records, error } = await supabase
      .from("blood_inventory")
      .select("*")
      .order("entry_date", { ascending: false });

    // Fetch Blood Transactions Data
    const { data: records2, error2 } = await supabase
      .from("blood_transactions")
      .select("*")
      .order("id", { ascending: false });

    // Fetch Blood Requests Data
    const { data: records3, error3 } = await supabase
      .from("blood_requests")
      .select("*")
      .order("id", { ascending: false });

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

    // Bar Chart Data Visualization
    const { data: donutRecords, donutError } = await supabase
      .from("blood_stock")
      .select("*");

    console.log(donutRecords);

    if (error) {
      console.error("Error fetching data", donutError);
    } else {
      data = donutRecords;

      // Once all data is fetched successfully, create the charts
      barChart();
      bloodInAndOutChart();
      // groupedBarChart();
    }
  });

  // Function to create a bar chart
  function barChart() {
    // Calculate totalSum here or get it from the appropriate source
    console.log("Total Sum:", totalSum);

    const ctx = document.getElementById("myChart").getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: bloodTypeArray,
        datasets: [
          {
            data: [
              data[0].a_pos,
              data[0].a_neg,
              data[0].b_pos,
              data[0].b_neg,
              data[0].ab_pos,
              data[0].ab_neg,
              data[0].o_pos,
              data[0].o_neg,
            ],
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
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "left",
            labels: {
              color: "white",
              generateLabels: function (chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map(function (label, i) {
                    const meta = chart.getDatasetMeta(0);
                    const ds = data.datasets[0];
                    const arc = meta.data[i];
                    const value = ds.data[i];

                    return {
                      text: `${label} (${value})`,
                      fillStyle: ds.backgroundColor[i],
                      strokeStyle: "white",
                      lineWidth: 2,
                      hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                      index: i,
                    };
                  });
                }
                return [];
              },
            },
          },
        },
        maintainAspectRatio: false, // Set to false to allow manual control of the aspect ratio
        responsive: true,
        cutout: "50%",
        layout: {
          padding: {
            left: 50, // Adjust the left padding to accommodate the vertical legend
          },
        },
        scales: {
          y: {
            display: false,
          },
        },
        elements: {
          arc: {
            borderWidth: 0,
          },
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              const label = data.labels[tooltipItem.index];
              const value =
                data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
              return `${label}: ${value}`;
            },
          },
          bodyColor: "white", // Set the text color of the tooltips to white
        },
      },
    });
  }

  // Function to create a blood in and out chart
  function bloodInAndOutChart() {
    // Fetch "Blood In" and "Blood Out" counts directly from data2 array
    const bloodInCount = data2.filter(
      (transaction) => transaction.transaction_type.toLowerCase() === "blood in"
    ).length;
    const bloodOutCount = data2.filter(
      (transaction) =>
        transaction.transaction_type.toLowerCase() === "blood out"
    ).length;

    // Create the donut chart using the canvas reference
    const ctx = bloodInAndOutChartCanvas.getContext("2d");

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Blood In", "Blood Out"],
        datasets: [
          {
            data: [bloodInCount, bloodOutCount],
            backgroundColor: ["#7cb342", "#e53935"], // You can change colors as needed
            borderWidth: 1,
          },
        ],
      },
      options: {
        // Your options for this specific chart
      },
    });
  }

  // // Variable to store the blood requests chart canvas reference
  // let bloodRequestsChartCanvas;

  // // Function to create a grouped bar chart
  // function groupedBarChart() {
  //   const ctx = bloodRequestsChartCanvas.getContext("2d");

  //   // Extract data for the chart (adjust this based on your data structure)
  //   const labels = data3.map((record) => record.request_urgency); // Use appropriate field for x-axis labels

  //   // Separate data into different arrays based on urgency level
  //   const lowData = data3.map((record) =>
  //     record.request_urgency === "low" ? record.amount : 0
  //   );
  //   const midData = data3.map((record) =>
  //     record.request_urgency === "mid" ? record.amount : 0
  //   );
  //   const highData = data3.map((record) =>
  //     record.request_urgency === "high" ? record.amount : 0
  //   );
  //   console.log("Low Data:", lowData);
  //   console.log("Mid Data:", midData);
  //   console.log("High Data:", highData);

  //   const datasets = [
  //     {
  //       label: "Low Urgency",
  //       data: lowData,
  //       backgroundColor: "#4CAF50", // Green color for low urgency
  //       borderColor: "#4CAF50",
  //       borderWidth: 1,
  //     },
  //     {
  //       label: "Mid Urgency",
  //       data: midData,
  //       backgroundColor: "#FFC107", // Yellow color for mid urgency
  //       borderColor: "#FFC107",
  //       borderWidth: 1,
  //     },
  //     {
  //       label: "High Urgency",
  //       data: highData,
  //       backgroundColor: "#FF5722", // Red color for high urgency
  //       borderColor: "#FF5722",
  //       borderWidth: 1,
  //     },
  //   ];

  //   new Chart(ctx, {
  //     type: "bar",
  //     data: {
  //       labels,
  //       datasets,
  //     },
  //     options: {
  //       // Customize options as needed
  //     },
  //   });
  // }
  onMount(async () => {
    const { data: bloodRequestsData, error } = await supabase
      .from('blood_requests')
      .select('request_urgency', 'request_date');

    if (error) {
      console.error('Error fetching data from Supabase:', error.message);
      return;
    }
    const urgencyLabels = ['Low', 'Medium', 'High'];
    const urgencyData = [0, 0, 0];

    bloodRequestsData.forEach(record => {
      if (record.request_urgency === 'low') urgencyData[0]++;
      else if (record.request_urgency === 'medium') urgencyData[1]++;
      else if (record.request_urgency === 'high') urgencyData[2]++;
    });

    const ctx = document.getElementById('urgencyChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: urgencyLabels,
        datasets: [{
          label: 'Blood Request Urgency',
          data: urgencyData,
          backgroundColor: [
            'rgba(90, 255, 50, 0.5)',
            'rgba(255, 205, 86, 0.5)',
            'rgba(255, 99, 132, 0.5)',
          ],
          borderColor: [
            'rgba(50, 255, 20, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  });
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
              <li class="nav-item">
                <a
                  class="nav-link nav-hover text-light"
                  href="/admin/dashboard/reports">Reports</a
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
              <div
                class="card-header text-white bg-danger"
                style="background-color: white; border-radius: 10px;"
              >
                <i class="fa fa-droplet" /> Blood Inventory
              </div>
              <!-- bar chart for blood stock-->
              <div
                class="card-header text-white bg-white"
                style="background-color: white; padding: 20px; border-radius: 10px;"
              >
                <canvas id="myChart" style="width:100%; height:300px;"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div>
        

          <div class="row mx-1">
            <!-- Transaction Section-->
            <div class="card mb-3 col mx-1">
              <div class="card-header text-danger">
                <i class="fa fa-bar-chart" /> Recent Transactions
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="chart-transactions" style="height:300px;">
                    <!-- donut chart for blood transactions -->
                    <canvas
                      bind:this={bloodInAndOutChartCanvas}
                      id="myBloodInAndOutChart"
                    ></canvas>

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
                <div class="row" justify-content-center>
                  <div class="blood-requests">
                    <!-- Grouped bar chart for blood requests -->
                    <canvas
                      id="urgencyChart"
                    ></canvas>

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
        </div>

        <!-- Scroll to Top Button-->
        <a class="scroll-to-top rounded" href="#page-top">
          <i class="fa fa-angle-up" />
        </a>
      </div>
    </main>

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
    </script>
  </body>

  <!-- /.container-fluid-->
  <!-- /.content-wrapper-->
  <footer class="sticky-footer">
    <div class="container">
      <div class="text-center text-danger">
        <small>For Capstone use only.</small>
      </div>
    </div>
  </footer>
</html>

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
    transition:
      background-size 0.3s,
      background-position 0s 0.3s; /*change after the size immediately*/
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

</style>
