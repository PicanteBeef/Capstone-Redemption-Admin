<script>
  import { onMount } from 'svelte';
  import { supabasePublic } from '$lib/supabaseClient';

  

  let pendingAppointments = [];
  let completedAppointments = [];

  // Function to fetch appointments
  async function fetchAppointments() {
    // Fetch pending appointments
    const { data: pending, error: pendingError } = await supabasePublic
      .from('user_appointments')
      .select('id, display_name, date, location, time_slot, status') // Directly fetch the display_name
      .eq('status', 'pending')
      .order('date', { ascending: true });

    if (pendingError) {
      console.error("Error fetching pending appointments:", pendingError);
    } else {
      pendingAppointments = pending; // Assign fetched data to the pending array
    }

    // Fetch completed appointments
    const { data: completed, error: completedError } = await supabasePublic
      .from('user_appointments')
      .select('id, display_name, date, location, time_slot, status') // Fetch the display_name
      .eq('status', 'completed')
      .order('date', { ascending: true });

    if (completedError) {
      console.error("Error fetching completed appointments:", completedError);
    } else {
      completedAppointments = completed; // Assign fetched data to the completed array
    }
  }

  // Update status to 'completed'
  const markAsCompleted = async (id) => {
    try {
      const { error } = await supabasePublic
        .from('user_appointments')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) {
        console.error("Error marking appointment as completed:", error.message);
        return;
      }

      // Refresh data after status update
      await fetchAppointments();
    } catch (err) {
      console.error("Error updating appointment status:", err.message);
    }
  };

  // Delete completed appointment
  const deleteAppointment = async (id) => {
    try {
      const { error } = await supabasePublic
        .from('user_appointments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting appointment:", error.message);
        return;
      }

      // Refresh data after deletion
      await fetchAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err.message);
    }
  };

  // Fetch appointments when the component mounts
  onMount(() => {
    fetchAppointments();
  });


  //Sort and Search
  // State for Pending Appointments
let pendingSortColumn = ""; // No column sorted initially
let pendingSortDirection = 1; // Default to ascending
let pendingSearchTerm = "";
let filteredPendingAppointments = [];

// State for Completed Appointments
let completedSortColumn = "";
let completedSortDirection = 1;
let completedSearchTerm = "";
let filteredCompletedAppointments = [];

// Maintain original data
$: originalPendingData = pendingAppointments;
$: originalCompletedData = completedAppointments;

// Apply search and sort
$: pendingData = filteredPendingAppointments.length ? filteredPendingAppointments : pendingAppointments;
$: completedData = filteredCompletedAppointments.length ? filteredCompletedAppointments : completedAppointments;

  // Sort function for Pending Appointments
const sortPendingTable = (column) => {
  if (column === pendingSortColumn) {
    pendingSortDirection = -pendingSortDirection;
  } else {
    pendingSortColumn = column;
    pendingSortDirection = 1;
  }

  pendingData = pendingData.slice().sort((a, b) => {
    const valueA = a[column];
    const valueB = b[column];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return pendingSortDirection * valueA.localeCompare(valueB);
    } else {
      return pendingSortDirection * (valueA - valueB);
    }
  });
};

// Sort function for Completed Appointments
const sortCompletedTable = (column) => {
  if (column === completedSortColumn) {
    completedSortDirection = -completedSortDirection;
  } else {
    completedSortColumn = column;
    completedSortDirection = 1;
  }

  completedData = completedData.slice().sort((a, b) => {
    const valueA = a[column];
    const valueB = b[column];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return completedSortDirection * valueA.localeCompare(valueB);
    } else {
      return completedSortDirection * (valueA - valueB);
    }
  });
};

// Search function for pending appointments
const searchPending = () => {
  const searchTermLower = pendingSearchTerm.toLowerCase();

  // Filter the data based on the search term
  filteredPendingAppointments = pendingAppointments.filter((appointment) => {
    // Search across multiple fields: display_name, date, location, time_slot
    const nameMatch = appointment.display_name?.toLowerCase().includes(searchTermLower) ?? false;
    const dateMatch = appointment.date?.toLowerCase().includes(searchTermLower) ?? false;
    const locationMatch = appointment.location?.toLowerCase().includes(searchTermLower) ?? false;
    const timeSlotMatch = appointment.time_slot?.toLowerCase().includes(searchTermLower) ?? false;

    // Return true if any of the fields match
    return nameMatch || dateMatch || locationMatch || timeSlotMatch;
  });
};

// Search function for completed appointments
const searchCompleted = () => {
  const searchTermLower = completedSearchTerm.toLowerCase();

  // Filter the data based on the search term
  filteredCompletedAppointments = completedAppointments.filter((appointment) => {
    // Search across multiple fields: display_name, date, location, time_slot
    const nameMatch = appointment.display_name?.toLowerCase().includes(searchTermLower) ?? false;
    const dateMatch = appointment.date?.toLowerCase().includes(searchTermLower) ?? false;
    const locationMatch = appointment.location?.toLowerCase().includes(searchTermLower) ?? false;
    const timeSlotMatch = appointment.time_slot?.toLowerCase().includes(searchTermLower) ?? false;

    // Return true if any of the fields match
    return nameMatch || dateMatch || locationMatch || timeSlotMatch;
  });
};
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
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
    ></script>
  
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
  
      .login-btn {
        margin-left: auto;
      }
      @media screen and (max-width: 768px) {
        .login-btn {
          margin-left: 0;
        }
      }
  
      .sortButton:hover {
        cursor: pointer;
        background-color: #d9534f;
        color: #f7f7f7;
      }
    </style>
  </head>
  
  <body class="fixed-nav bg-dark sticky-footer" id="page-top">
    <!-- Navigation -->
    <!-- ... (unchanged) ... -->
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
  
    <main>
      <!-- Pending Appointments Table -->
      <div class="container my-5">
        <div class="card shadow-lg border-danger">
          <div class="card-header d-flex justify-content-between bg-danger align-items-center">
            <h2 class="text-center text-light">Pending Appointments</h2>
            <input type="text" bind:value={pendingSearchTerm} on:input={searchPending} class="form-control w-25" placeholder="Search pending appointments..." />
          </div>
          <div class="card-body">
            <table class="table table-hover table-striped table-bordered">
              <thead class="bg-light">
                <tr>
                  <th on:click={() => sortPendingTable("id")}>ID{pendingSortColumn === "id" ? (pendingSortDirection === 1 ? " ▲" : " ▼") : ""}</th>
                  <th on:click={() => sortPendingTable("display_name")}>Full Name{pendingSortColumn === "display_name" ? (pendingSortDirection === 1 ? " ▲" : " ▼") : ""}</th>
                  <th on:click={() => sortPendingTable("date")}>Date{pendingSortColumn === "date" ? (pendingSortDirection === 1 ? " ▲" : " ▼") : ""}</th>
                  <th on:click={() => sortPendingTable("location")}>Location{pendingSortColumn === "location" ? (pendingSortDirection === 1 ? " ▲" : " ▼") : ""}</th>
                  <th on:click={() => sortPendingTable("time_slot")}>Time Slot{pendingSortColumn === "time_slot" ? (pendingSortDirection === 1 ? " ▲" : " ▼") : ""}</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {#each pendingData as appointment}
                  <tr>
                    <td>{appointment.id}</td>
                    <td>{appointment.display_name}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.location}</td>
                    <td>{appointment.time_slot}</td>
                    <td>
                      <button class="btn btn-success btn-sm" on:click={() => markAsCompleted(appointment.id)}>Mark as Completed</button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
      <!-- Completed Appointments Table -->
      <div class="container my-5">
        <div class="card shadow-lg border-dark">
          <div class="card-header d-flex justify-content-between bg-danger align-items-center">
            <h2 class="text-center text-light">Completed Appointments</h2>
            <input type="text" bind:value={completedSearchTerm} on:input={searchCompleted} class="form-control w-25" placeholder="Search completed appointments..." />
          </div>
          <div class="card-body">
            <table class="table table-hover table-striped table-bordered">
              <thead class="bg-light">
                <tr>
                  <th on:click={() => sortCompletedTable("id")}>ID{completedSortColumn === "id" ? (completedSortDirection === 1 ? " ▲" : " ▼") : ""}</th>
                  <th on:click={() => sortCompletedTable("display_name")}>Full Name{completedSortColumn === "display_name" ? (completedSortDirection === 1 ? " ▲" : " ▼") : ""}</th>
                  <th on:click={() => sortCompletedTable("date")}>Date{completedSortColumn === "date" ? (completedSortDirection === 1 ? " ▲" : " ▼") : ""}</th>
                  <th on:click={() => sortCompletedTable("location")}>Location{completedSortColumn === "location" ? (completedSortDirection === 1 ? " ▲" : " ▼") : ""}</th>
                  <th on:click={() => sortCompletedTable("time_slot")}>Time Slot{completedSortColumn === "time_slot" ? (completedSortDirection === 1 ? " ▲" : " ▼") : ""}</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {#each completedData as appointment}
                  <tr>
                    <td>{appointment.id}</td>
                    <td>{appointment.display_name}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.location}</td>
                    <td>{appointment.time_slot}</td>
                    <td>
                      <button class="btn btn-danger btn-sm" on:click={() => deleteAppointment(appointment.id)}>Delete</button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </body>
  <style>
    main {
      padding-top: 80px; /* Adjusting for sticky header */
    }
    .card-header h2 {
      margin: 0;
    }
    .table th, .table td {
      text-align: center;
    }
  </style>
  