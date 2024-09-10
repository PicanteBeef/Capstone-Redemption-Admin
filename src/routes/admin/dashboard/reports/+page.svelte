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

let bloodTransactionsData = [];
let selectedLocationForBlood = 'All';
let locationsForBlood = [];
let bloodChart = null;

async function fetchBloodTransactionsData() {
  try {
    const { data, error } = await supabase
      .from('blood_transactions')
      .select('amount, transaction_type, transaction_date, entry_location');
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching blood transactions data:', error);
    return [];
  }
}

function updateBloodChart() {
  const ctx = document.getElementById('bloodChartCanvas').getContext('2d');

  const filteredBloodData = selectedLocationForBlood === 'All'
    ? bloodTransactionsData
    : bloodTransactionsData.filter(item => item.entry_location === selectedLocationForBlood);

 // Format and sort dates
 const dateSet = [...new Set(filteredBloodData.map(item => moment(item.transaction_date).format('YYYY-MM-DD')))];
  const sortedDates = dateSet.sort((a, b) => moment(a).isAfter(moment(b)) ? 1 : -1);

  const bloodInData = [];
  const bloodOutData = [];

  sortedDates.forEach(date => {
    const transactions = filteredBloodData.filter(item => moment(item.transaction_date).format('YYYY-MM-DD') === date);
    
    bloodInData.push({
      x: date,
      y: transactions.filter(item => item.transaction_type.toLowerCase() === 'blood in').reduce((sum, item) => sum + item.amount, 0),
    });

    bloodOutData.push({
      x: date,
      y: transactions.filter(item => item.transaction_type.toLowerCase() === 'blood out').reduce((sum, item) => sum + item.amount, 0),
    });
  });

  if (bloodChart) {
    bloodChart.destroy(); // Destroy existing chart to prevent overlap
  }

  bloodChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedDates,
      datasets: [
        {
          label: 'Blood In',
          data: bloodInData,
          backgroundColor: "#7cb342",
          borderWidth: 0
        },
        {
          label: 'Blood Out',
          data: bloodOutData,
          backgroundColor: "#e53935",
          borderWidth: 0
        }
      ]
    },
    options: {
      scales: {
        x: {
          stacked: true,
          barThickness: 20,
        },
        y: {
          beginAtZero: true,
          stacked: true
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              const amount = context.raw.y;
              return `${label}: ${amount}`;
            }
          }
        }
      }
    }
  });
}

onMount(async () => {
  bloodTransactionsData = await fetchBloodTransactionsData();
  locationsForBlood = [...new Set(bloodTransactionsData.map(item => item.entry_location)), 'All'];
  updateBloodChart();
});

function transactionLocationChange(event) {
  selectedLocationForBlood = event.target.value;
  updateBloodChart();
}

  onMount(async () => {
    const { data: bloodRequestsData, error } = await supabase
      .from("blood_requests")
      .select("request_urgency", "request_date");

    if (error) {
      console.error("Error fetching data from Supabase:", error.message);
      return;
    }
    const urgencyLabels = ["Low", "Medium", "High"];
    const urgencyData = [0, 0, 0];

    bloodRequestsData.forEach((record) => {
      if (record.request_urgency === "low") urgencyData[0]++;
      else if (record.request_urgency === "medium") urgencyData[1]++;
      else if (record.request_urgency === "high") urgencyData[2]++;
    });

    const ctx = document.getElementById("urgencyChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: urgencyLabels,
        datasets: [
          {
            label: "Blood Request Urgency",
            data: urgencyData,
            backgroundColor: [
              "rgba(90, 255, 50, 0.5)",
              "rgba(255, 205, 86, 0.5)",
              "rgba(255, 99, 132, 0.5)",
            ],
            borderColor: [
              "rgba(50, 255, 20, 1)",
              "rgba(255, 205, 86, 1)",
              "rgba(75, 192, 192, 1)",
            ],
            borderWidth: 1,
          },
        ],
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

  let summaryData = [];
  let selectedLocation = 'All';
  let locations = [];
  let chart = null;

  // Fetch summary data
  async function fetchSummaryData() {
    try {
      const { data, error } = await supabase
        .from('donors_table')
        .select('blood_type, sex, donation_volume, donation_event');
      
      if (error) {
        throw error;
      }
      
      return data.sort((a, b) => a.blood_type.localeCompare(b.blood_type));
    } catch (error) {
      console.error('Error fetching summary data:', error);
      return [];
    }
  }

  // Create or update chart
  function updateChart() {
  const ctx = document.getElementById('summaryChart').getContext('2d');

  const filteredData = selectedLocation === 'All' 
    ? summaryData 
    : summaryData.filter(item => item.donation_event === selectedLocation);

  const bloodTypes = [...new Set(filteredData.map(item => item.blood_type))];
  const sexTypes = ['Male', 'Female'];

  // Prepare dataset for chart
  const datasets = sexTypes.map(sex => ({
    label: sex,  // Ensure labels are properly set for each dataset
    data: bloodTypes.map(bloodType => {
      return filteredData
        .filter(item => item.blood_type === bloodType && item.sex === sex)
        .reduce((sum, item) => sum + item.donation_volume, 0);
    }),
    backgroundColor: sex === 'Male' ? '#d32f2f' : '#b0bec5', // Male and Female colors
    borderColor: '#000',
  }));

  if (chart) {
    chart.destroy(); // Destroy the existing chart instance to prevent overlapping
  }

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bloodTypes,  // Ensure labels are set correctly for the x-axis
      datasets: datasets
    },
    options: {
      responsive: true,
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Blood Type'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Donation Volume'
          }
        }
      },
      plugins: {
        legend: {
          display: true,  // Ensure the legend is enabled
          position: 'top', // Position the legend at the top
          labels: {
            color: '#000',  // Set legend label color
            font: {
              size: 12 // Adjust font size if needed
            }
          }
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const item = tooltipItems[0];
              const bloodType = item.label;
              const gender = item.dataset.label;
              return `${bloodType} (${gender})`;
            },
            label: function(tooltipItem) {
              return `Volume: ${tooltipItem.raw}`;
            }
          }
        }
      }
    }
  });
}

  onMount(async () => {
    summaryData = await fetchSummaryData();
    locations = [...new Set(summaryData.map(item => item.donation_event)), 'All'];
    updateChart();
  });

  // Handle location change
  function handleLocationChange(event) {
    selectedLocation = event.target.value;
    updateChart();
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
    <!-- Latest compiled JavaScript -->
    <!-- Latest compiled JavaScript -->
    <!-- Latest compiled JavaScript -->
    <!-- Latest compiled JavaScript -->
    <!-- Latest compiled JavaScript -->
    <!-- Latest compiled JavaScript -->
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
    ></script>

    <!--Latest complied Popperjs-->
    <!--Latest complied Popperjs-->
    <!--Latest complied Popperjs-->
    <!--Latest complied Popperjs-->
    <!--Latest complied Popperjs-->
    <!--Latest complied Popperjs-->
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
    <!--Charts.js Library-->
    <!--Charts.js Library-->
    <!--Charts.js Library-->
    <!--Charts.js Library-->
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
              <li class="nav-item">
                <a
                  class="nav-link nav-hover text-light"
                  href="/admin/dashboard/newsletter">Newsletter</a
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

    <!-- Main Content -->
    <main>
      <div class="content-wrapper" style="margin-top: 5rem;">
        <!-- Dashboard -->
        <div class="container text-center">
          <div class="row">
            <!-- First Row -->
            <div class="row justify-content-center mt-4 mb-4">
              <!-- Blood Inventory Card -->
              <div class="card mb-3 col mx-1" style="height: 500px;">
                <div class="card-header text-danger">
                  <i class="fa fa-bar-chart" /> Blood Inventory
                </div>
                <!-- Bar chart for blood stock -->
                <div
                  class="card-header text-white bg-white"
                  style="background-color: white; padding: 20px; border-radius: 10px; height: 400px;"
                >
                  <canvas id="myChart" style="width:100%; height:100%;"
                  ></canvas>
                </div>
              </div>
            </div>

            <div class="row justify-content-center mt-4 mb-4">
              <!-- Donation Appointments Card -->
              <div class="card mb-3 col mx-1" style="height: 500px;">
                <div class="card-header text-danger">
                  <i class="fa fa-bar-chart" /> Donation Appointments
                </div>
                <!-- Bar chart for blood stock -->
                <div class="card-body" style="height: 400px;">
                  <!-- Embed Google Sheets -->
                  <iframe
                    title="Appointments"
                    height="100%"
                    width="100%"
                    src="https://docs.google.com/spreadsheets/d/1cJrLiHqe5YurQatqDq1_XZILkBxwoKB9tHc4Y8O1_v8/gviz/tq?tqx=out:html&tgid=433245028"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </div>

            <div class="row justify-content-center mt-4 mb-4">
              <!-- Recent Transactions Card -->
              <div class="card mb-3 col mx-1" style="width: 500px; height: 500px;">
                <div class="card-header text-danger">
                  <i class="fa fa-bar-chart" /> Recent Blood Transactions
                </div>
                <select on:change={transactionLocationChange}>
                  {#each locationsForBlood as location}
                    <option value={location}>{location}</option>
                  {/each}
                </select>
                <div class="card-body" style="height: 400px;">
                  <div class="row">
                    <div class="chart-transactions" style="height: 350px;">
                      <canvas id="bloodChartCanvas"></canvas>
                      <a class="btn btn-danger" href="/admin/dashboard/bloodtransac">View More <i class="fa fa-angle-right" /></a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Blood Requests Card -->
              <div
                class="card mb-3 col mx-1"
                style="width: 500px; height: 500px;"
              >
                <div class="card-header text-danger">
                  <i class="fa fa-bar-chart" /> Blood Requests
                </div>
                <div class="card-body" style="height: 400px;">
                  <div class="row justify-content-center">
                    <div class="blood-requests" style="height: 100%;">
                      <!-- Grouped bar chart for blood requests -->
                      <canvas id="urgencyChart"></canvas>
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

            <div class="row justify-content-center mt-4 mb-4">
              <!-- Donation Summary Card -->
              <div
                class="card mb-3 col mx-1"
                style="width: 500px; height: 500px;"
              >
                <div class="card-header text-danger">
                  <i class="fa fa-bar-chart" /> Donation Summary
                </div>
                <select on:change={handleLocationChange}>
                  {#each locations as location}
                    <option value={location}>{location}</option>
                  {/each}
                </select>
                <div class="card-body" style="height: 400px;">
                  <div class="row">
                    <div class="chart-transactions" style="height: 350px;">
                      <!-- Donut chart for blood transactions -->
                      <canvas
                        id="summaryChart"
                      ></canvas>
                      <a
                        class="btn btn-danger"
                        href="/admin/dashboard/donations"
                        >View More <i class="fa fa-angle-right" /></a
                      >
                    </div>
                  </div>
                </div>
              </div>

      
            </div>
          </div>
        </div>

        <!-- Scroll to Top Button -->
        <a class="scroll-to-top rounded" href="#page-top">
          <i class="fa fa-angle-up"></i>
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

  .chart-transactions {
    height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .card-body,
  .card-body iframe {
    border-radius: 10px;
  }
</style>
