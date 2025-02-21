<script>
  // Import Svelte and other libraries
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { supabase } from "/src/lib/supabaseClient.js";
  import moment from "moment";
  import Chart from "chart.js/auto";

  let donors = [];
  let filteredDonors = [];
  let isLoading = true;
  let myChart;
  let urgencyData = {};
  let transactionData = {};

  // Chart configurations
  const bloodTypeConfig = {
    labels: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    colors: ['#cbd6e4', '#bfcbdb', '#b3bfd1', '#a4a2a8', '#df8879', '#c86558', '#b04238', '#991f17']
  };

  const urgencyConfig = {
    labels: [], // Will be populated dynamically based on fetched data
    colors: ['#a4a2a8', '#df8879', '#c86558'], // Colors for Low, Medium, High
    datasets: [
      {
        label: 'Low',
        data: [],
        backgroundColor: '#a4a2a8'
      },
      {
        label: 'Medium',
        data: [],
        backgroundColor: '#df8879'
      },
      {
        label: 'High',
        data: [],
        backgroundColor: '#c86558'
      }
    ]
  };

  const transactionConfig = {
    labels: [], // Dates will be populated dynamically
    colors: ['#8bc34a', '#f44336'], // Green for Blood In, Red for Blood Out
    datasets: [
      {
        label: 'Blood In',
        data: [],
        backgroundColor: '#8bc34a'
      },
      {
        label: 'Blood Out',
        data: [],
        backgroundColor: '#f44336'
      }
    ]
  };

  function mapDonorData(donor) {
    console.log('Raw Donor Data from Supabase:', donor); // Log raw data for debugging

    const mappedDonor = {
      id: donor.id || 'unknown',
      firstName: donor.dp_first_name || 'Unknown',
      lastName: donor.dp_last_name || 'Unknown',
      bloodType: donor.dp_blood_type || 'Unknown',
      birthdate: donor.dp_birthdate || null,
      image: donor.dp_profile_image || null,
      dp_donor_id: donor.dp_donor_id || donor.id,
      donationDate: donor.dp_donation_date || null,
      expirationDate: donor.dp_expiration_date || null,
      status: donor.dp_status || 'pending', // Default to 'pending' if status is missing
      phases: {
        history: {
          status: getStatus(donor.dp_history_responses) || 'pending',
          responses: donor.dp_history_responses || {}
        },
        laboratory: {
          status: getStatus(donor.dp_laboratory_responses) || 'pending',
          responses: donor.dp_laboratory_responses || {}
        },
        processing: {
          status: getStatus(donor.dp_processing_responses) || 'pending',
          responses: donor.dp_processing_responses || {}
        },
        screening: {
          status: getStatus(donor.dp_screening_responses) || 'pending',
          responses: donor.dp_screening_responses || {}
        }
      }
    };

    console.log('Mapped Donor Data:', mappedDonor); // Log mapped data for debugging
    return mappedDonor;
  }

  function getStatus(responses) {
    if (!responses) return 'pending';
    if (responses.status === 'completed') return 'completed';
    if (responses.status === 'denied') return 'denied';
    return 'pending';
  }
  
  // Helper function to calculate blood type counts
  function calculateBloodTypeCounts(data) {
    const counts = {
      A_POS: 0,
      A_NEG: 0,
      B_POS: 0,
      B_NEG: 0,
      AB_POS: 0,
      AB_NEG: 0,
      O_POS: 0,
      O_NEG: 0
    };

    data.forEach(entry => {
      console.log(`Processing donor: ${entry.firstName} ${entry.lastName}, Status: ${entry.status}, Expiration Date: ${entry.expirationDate}`);
      if (
        entry.status === 'available' &&
        entry.expirationDate &&
        new Date(entry.expirationDate) > new Date()
      ) {
        let bloodTypeKey = entry.bloodType
          .replace('-', '_NEG')
          .replace('+', '_POS')
          .toUpperCase();

        if (counts[bloodTypeKey] !== undefined) {
          counts[bloodTypeKey] += 1;
        } else {
          console.warn(`Unknown blood type: ${entry.bloodType}`);
        }
      }
    });

    console.log('Calculated Blood Type Counts:', counts);
    return counts;
  }

  // Initialize the bar chart
  function initializeBarChart(bloodTypeCounts) {
    const ctx = document.getElementById("myChart").getContext("2d");

    const bloodTypeColors = [
      "#cbd6e4", // A+
      "#bfcbdb", // A-
      "#b3bfd1", // B+
      "#a4a2a8", // B-
      "#df8879", // AB+
      "#c86558", // AB-
      "#b04238", // O+
      "#991f17"  // O-
    ];

    const bloodTypeLabels = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: bloodTypeLabels,
        datasets: [
          {
            data: [
              bloodTypeCounts.A_POS,
              bloodTypeCounts.A_NEG,
              bloodTypeCounts.B_POS,
              bloodTypeCounts.B_NEG,
              bloodTypeCounts.AB_POS,
              bloodTypeCounts.AB_NEG,
              bloodTypeCounts.O_POS,
              bloodTypeCounts.O_NEG
            ],
            backgroundColor: bloodTypeColors,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.label;
                const value = tooltipItem.raw;
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: "black",
              font: {
                size: 14
              }
            },
            grid: {
              display: false // Optional: Hide grid lines for a cleaner look
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "white", // Y-axis tick color
              font: {
                size: 12 // Adjust font size if needed
              }
            },
            grid: {
              display: false // Optional: Hide grid lines for a cleaner look
            }
          }
        },
        animation: {
          duration: 750, // Animation duration in milliseconds
          easing: "easeOutBounce" // Spring-like bounce effect
        },
        layout: {
          padding: {
            left: 20, // Add padding to prevent labels from being cut off
            right: 20
          }
        }
      }
    });
    createCustomLegend(bloodTypeCounts);
  }

  // Initialize the bar chart for urgency count
  function initializeUrgencyChart(config) {
    const ctx = document.getElementById('urgencyChart').getContext('2d');
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: config.labels,
        datasets: config.datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.dataset.label;
                const value = tooltipItem.raw;
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: false, // Allow multiple bars per date
            ticks: { color: 'black', font: { size: 14 } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: 'black', // Ensure y-axis labels are visible
              font: { size: 12 },
              stepSize: 1 // Adjust step size for better readability
            },
            grid: { display: true, color: '#ccc' } // Optional: Add grid lines for clarity
          }
        },
        animation: {
          duration: 750,
          easing: 'easeOutBounce'
        },
        layout: {
          padding: { left: 20, right: 20 }
        }
      }
    });
  }

  // Initialize the bar chart for blood in/out transactions
  function initializeTransactionChart(config) {
    const ctx = document.getElementById('transactionChart').getContext('2d');
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: config.labels,
        datasets: config.datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.dataset.label;
                const value = tooltipItem.raw;
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: false, // Allow multiple bars per date
            ticks: { color: 'black', font: { size: 14 } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: 'black', // Ensure y-axis labels are visible
              font: { size: 12 },
              stepSize: 1 // Adjust step size for better readability
            },
            grid: { display: true, color: '#ccc' } // Optional: Add grid lines for clarity
          }
        },
        animation: {
          duration: 750,
          easing: 'easeOutBounce'
        },
        layout: {
          padding: { left: 20, right: 20 }
        }
      }
    });
  }

  function createCustomLegend(bloodTypeCounts) {
    const legendContainer = document.getElementById("chart-legend");
    legendContainer.innerHTML = ""; // Clear previous content

    const bloodTypeLabels = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const bloodTypeColors = [
      "#cbd6e4", "#bfcbdb", "#b3bfd1", "#a4a2a8",
      "#df8879", "#c86558", "#b04238", "#991f17"
    ];

    bloodTypeLabels.forEach((label, index) => {
      const count = bloodTypeCounts[label.replace('+', '_POS').replace('-', '_NEG')];
      const color = bloodTypeColors[index];

      // Create a legend item
      const legendItem = document.createElement("div");
      legendItem.style.display = "flex";
      legendItem.style.alignItems = "center";

      // Color square
      const colorBox = document.createElement("span");
      colorBox.style.width = "35px";
      colorBox.style.height = "15px";
      colorBox.style.backgroundColor = color;
      colorBox.style.marginRight = "8px";

      // Label and count
      const text = document.createElement("span");
      text.textContent = `${label} (${count})`;
      text.style.color = "black"; // Change to "white" if your background is dark
      text.style.fontSize = "14px";

      // Append to legend item
      legendItem.appendChild(colorBox);
      legendItem.appendChild(text);

      // Append to legend container
      legendContainer.appendChild(legendItem);
    });
  }

  // Fetch Blood Inventory Data
  onMount(async () => {
    try {
      // Fetch Donor Data
      const { data, error } = await supabase
        .from('donations_processing')
        .select('*');

      if (error) {
        console.error('Error fetching donor data:', error);
        alert('Failed to load donor data.');
      } else {
        // Map all donors to the local structure
        donors = data.map(mapDonorData);
        filteredDonors = donors; // Initialize filteredDonors with all donors

        isLoading = false;
        // Recalculate status for each donor
        donors = donors.map(donor => {
          const allPhasesCompleted = Object.values(donor.phases).every(
            phase => phase.status === 'completed'
          );
          return {
            ...donor,
            status: allPhasesCompleted ? 'available' : donor.status
          };
        });

        console.log('Donors loaded successfully:', donors);

        // Calculate blood type counts for the chart
        const bloodTypeCounts = calculateBloodTypeCounts(donors);

        // Initialize the inventory chart
        initializeBarChart(bloodTypeCounts);
        console.log('Calculated Blood Type Counts:', bloodTypeCounts);
      }

      // Fetch Urgency Data for Transactions
      const { data: transactionsData, error: transactionsError } = await supabase
          .from('requests_processing')
          .select('created_at, urgency')
          .order('created_at');

        if (transactionsError) {
          console.error('Error fetching transactions data:', transactionsError);
          alert('Failed to load transactions data.');
        } else {
          // Process data into urgencyData object
          const processedData = {};
          transactionsData.forEach((item) => {
            const date = new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric'
            });

            if (!processedData[date]) {
              processedData[date] = { Low: 0, Medium: 0, High: 0 };
            }

            if (['Low', 'Medium', 'High'].includes(item.urgency)) {
              processedData[date][item.urgency]++;
            }
          });

          // Populate urgencyData and config
          urgencyData = processedData;
          urgencyConfig.labels = Object.keys(urgencyData);
          urgencyConfig.datasets[0].data = urgencyConfig.labels.map(
            (date) => urgencyData[date].Low
          );
          urgencyConfig.datasets[1].data = urgencyConfig.labels.map(
            (date) => urgencyData[date].Medium
          );
          urgencyConfig.datasets[2].data = urgencyConfig.labels.map(
            (date) => urgencyData[date].High
          );

          // Initialize the urgency count chart
          initializeUrgencyChart(urgencyConfig);
          console.log('Urgency Data:', urgencyData);
        }
      // Fetch Blood In/Out Data for Transactions
      const { data: transactionDataResponse, error: transactionError } = await supabase
        .from('transactions_processing')
        .select('transaction_date, transaction_type')
        .order('transaction_date');

      if (transactionError) {
        console.error('Error fetching transaction data:', transactionError);
        alert('Failed to load transaction data.');
      } else {
        // Process data into transactionData object
        const processedData = {};
        transactionDataResponse.forEach((item) => {
          const date = new Date(item.transaction_date).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
          });

          if (!processedData[date]) {
            processedData[date] = { 'Blood In': 0, 'Blood Out': 0 };
          }

          if (['Blood In', 'Blood Out'].includes(item.transaction_type)) {
            processedData[date][item.transaction_type]++;
          }
        });

        // Populate transactionData and config
        transactionData = processedData;
        transactionConfig.labels = Object.keys(transactionData);
        transactionConfig.datasets[0].data = transactionConfig.labels.map(
          (date) => transactionData[date]['Blood In']
        );
        transactionConfig.datasets[1].data = transactionConfig.labels.map(
          (date) => transactionData[date]['Blood Out']
        );

        // Initialize the blood in/out chart
        initializeTransactionChart(transactionConfig);
        console.log('Transaction Data:', transactionData);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred while loading data.');
    }
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
    #chart-legend {
        min-width: 120px; /* Fixed width for the legend */
      }

      /* Style the legend items */
      #chart-legend div {
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
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

  .reports {
    margin: 20px;
  }

  .chart-container {
    margin-bottom: 40px;
  }

  .legend-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
  }
  </style>  

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
                  href="/admin/dashboard/reports">Reports</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link nav-hover text-light"
                  href="/admin/dashboard/newsletter">Newsletter</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link nav-hover text-light"
                  href="/admin/dashboard/appointments">Appointments</a
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
              <div class="col-lg-10 col-md-12 mb-3">
                <div class="card shadow-sm">
                  <div class="card-header bg-danger text-white text-center" style="border-radius: 10px 10px 0 0;">
                    <i class="fa fa-droplet me-2"></i> Blood Inventory
                  </div>
                  <div class="card-body p-4 d-flex">
                    <!-- Vertical Legend -->
                    <div id="chart-legend" class="d-flex flex-column gap-2 me-4" style="min-width: 120px;"></div>
          
                    <!-- Chart -->
                    <div class="flex-grow-1">
                      <canvas id="myChart" style="width: 100%; height: 300px;"></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Blood Request Card -->
              <div class="col-lg-10 col-md-12 mb-3">
                <div class="card shadow-sm">
                  <div class="card-header bg-danger text-white text-center" style="border-radius: 10px 10px 0 0;">
                    <i class="fa fa-droplet me-2"></i> Request Urgency Report
                  </div>
                  <div class="card-body p-4 d-flex">
                    <!-- Chart -->
                    <div class="flex-grow-1">
                      <canvas id="urgencyChart" style="width: 100%; height: 300px;"></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Blood Request Card -->
              <div class="col-lg-10 col-md-12 mb-3">
                <div class="card shadow-sm">
                  <div class="card-header bg-danger text-white text-center" style="border-radius: 10px 10px 0 0;">
                    <i class="fa fa-droplet me-2"></i> Transactions Summary
                  </div>
                  <div class="card-body p-4 d-flex">

                    <!-- Chart -->
                    <div class="flex-grow-1">
                      <canvas id="transactionChart" style="width: 100%; height: 300px;"></canvas>
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
  </body>
</html>

