<!-- Blood requests lands here. -->

<script>
  import { onMount } from "svelte";
  import supabase from "/src/lib/supabaseClient.js";
  import moment from "moment";

  let formData = {
    patientName: "",
    diagnosis: "",
    bloodType: "",
    purpose: "routine",
    bloodPackType: "whole",
    urgency: "low",
    bagQuantity: 1,
  };

  let data = [];
  let originalData = [];
  let searchTerm = '';

  // Insert Entry to Blood Inventory
  async function handleSubmit(event) {
    event.preventDefault();

    // Add your submission logic here
    const { data: record, error } = await supabase
      .from("blood_requests")
      .insert({
        patient_name: formData.patientName,
        patient_diagnosis: formData.diagnosis,
        patient_bloodtype: formData.bloodType,
        request_purpose: formData.purpose,
        request_bloodpack: formData.bloodPackType,
        request_urgency: formData.urgency,
        request_quantity: formData.bagQuantity,
        request_date: new Date(),
      })
      .select();

    if (error) {
      console.error("Error inserting data:", error);
      return;
    }

    // Reset form data
    formData = {
      patientName: "",
      diagnosis: "",
      bloodType: "",
      purpose: "routine",
      bloodPackType: "whole",
      urgency: "low",
      bagQuantity: 1,
    };

    // Update data with the newly added record
    data = [record[0], ...data];
  }

  // Delete Entry From Blood Inventory
  async function deleteOne(itemToDelete) {
    // Add your delete logic here
    const { error } = await supabase
      .from("blood_requests")
      .delete()
      .eq("id", itemToDelete);

    if (error) {
      console.error("Error", error);
    } else {
      // Update data after successful deletion
      data = data.filter((item) => item.id !== itemToDelete);
    }
  }

  // Fetch Blood Inventory Data
  onMount(async () => {
    const { data: records, error } = await supabase
      .from("blood_requests")
      .select("*")
      .order("request_date", { ascending: false });

    if (error) {
      console.error("Error fetching data from Supabase:", error);
    } else {
      data = records;
      originalData = records;
    }
  });

  const search = () => {
    if (searchTerm.trim() === '') {
      data = originalData;
      return;
    }

    const filteredData = originalData.filter(item => {
      return (
        item.patient_name.toLowerCase().includes(searchTerm.toLowerCase()),
        item.patient_diagnosis.toLowerCase().includes(searchTerm.toLowerCase()),
        item.patient_bloodtype.toLowerCase().includes(searchTerm.toLowerCase()),
        item.request_urgency.toLowerCase().includes(searchTerm.toLowerCase())
        // Add more fields as needed for your search
      );
    });

    data = filteredData;
  };
  $: search(); 
  

  let sortColumn = "";
  let sortDirection = 1; // 1 for ascending, -1 for descending

  const sortTable = (column) => {
    if (column === sortColumn) {
      // Reverse the sort direction if the same column is clicked
      sortDirection = -sortDirection;
    } else {
      // Set the new sort column and reset the direction
      sortColumn = column;
      sortDirection = 1;
    }

    data = data.slice().sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection * valueA.localeCompare(valueB);
      } else {
        return sortDirection * (valueA - valueB);
      }
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
              <a class="nav-link nav-hover text-light" href="/admin/dashboard/bloodreqforms">Request Forms</a>
            </li>
            <li class="nav-item">
              <a class="nav-link nav-hover text-light" href="/admin/dashboard/donations">Donations</a>
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
    <!-- Main Content -->
    <div class="content-wrapper" style="margin-top: 5rem;">
      <!-- Transaction Section -->
      <!-- Blood Inventory -->
      <div class="card mb-3 mx-1" id="blood-inventory">
        <div class="card-header text-danger">
          <i class="fa fa-droplet" /> Blood Request
        </div>
        <div class="card-body">
          <!-- Form Section -->
          <form on:submit={handleSubmit}>
            <div class="mb-3">
              <label for="patientName" class="form-label">Patient Name</label>
              <input type="text" class="form-control" id="patientName" bind:value={formData.patientName} required />
            </div>

            <div class="mb-3">
              <label for="diagnosis" class="form-label">Diagnosis</label>
              <input type="text" class="form-control" id="diagnosis" bind:value={formData.diagnosis} />
            </div>

            <div class="mb-3">
              <label for="bloodType" class="form-label">Blood Type</label>
              <select class="form-select" id="bloodType" bind:value={formData.bloodType}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="purpose" class="form-label">Purpose</label>
              <select class="form-select" id="purpose" bind:value={formData.purpose}>
                <option value="routine">Routine</option>
                <option value="emergency">Emergency</option>
                <option value="surgery">Surgery</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="bloodPackType" class="form-label">Blood Pack Type</label>
              <select class="form-select" id="bloodPackType" bind:value={formData.bloodPackType}>
                <option value="whole">Whole</option>
                <option value="packed">Packed Red Cell</option>
                <option value="washed">Washed Red Cell</option>
                <option value="platelet">Platelet Concentrate</option>
                <option value="plasma">Fresh Frozen Plasma</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="urgency" class="form-label">Urgency</label>
              <select class="form-select" id="urgency" bind:value={formData.urgency}>
                <option value="low">Low (1000m)</option>
                <option value="medium">Medium (300-600m)</option>
                <option value="high">High (60-180m)</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="bagQuantity" class="form-label">Bag Quantity</label>
              <input type="number" class="form-control" id="bagQuantity" bind:value={formData.bagQuantity} />
            </div>

            <button type="submit" class="btn btn-danger">Submit</button>
          </form>
          <!-- End Form Section -->

          <!-- Table Section -->
          <div>
            <input type="text" bind:value={searchTerm} on:input={search} placeholder="Search..." />
          </div>
          <div class="table-responsive">
            <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
              <thead>
                <tr>
                  <th on:click={() => sortTable("id")}>Serial ID{sortColumn === "id"? sortDirection === 1? " ▲": " ▼": ""}</th>
                  <th on:click={() => sortTable("patient_name")}>Patient Name{sortColumn === "patient_name"? sortDirection === 1? " ▲": " ▼": ""}</th>
                  <th on:click={() => sortTable("patient_diagnosis")}>Patient Diagnosis{sortColumn === "patient_diagnosis"? sortDirection === 1? " ▲": " ▼": ""}</th>
                  <th on:click={() => sortTable("patient_bloodtype")}>Patient Blood Type{sortColumn === "patient_bloodtype"? sortDirection === 1? " ▲": " ▼": ""}</th>
                  <th on:click={() => sortTable("request_purpose")}>Request Purpose{sortColumn === "request_purpose"? sortDirection === 1? " ▲": " ▼": ""}</th>
                  <th on:click={() => sortTable("request_bloodpack")}>Blood Pack Type{sortColumn === "request_bloodpack"? sortDirection === 1? " ▲": " ▼": ""}</th>
                  <th on:click={() => sortTable("request_urgency")}>Urgency{sortColumn === "request_urgency"? sortDirection === 1? " ▲": " ▼": ""}</th>
                  <th on:click={() => sortTable("request_quantity")}>Requested Quantity{sortColumn === "request_quantity"? sortDirection === 1? " ▲": " ▼": ""}</th>
                  <th on:click={() => sortTable("request_date")}>Date Requested{sortColumn === "request_date"? sortDirection === 1? " ▲": " ▼": ""}</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th>Serial ID</th>
                  <th>Patient Name</th>
                  <th>Patient Diagnosis</th>
                  <th>Patient Blood Type</th>
                  <th>Request Purpose</th>
                  <th>Blood Pack Type</th>
                  <th>Urgency</th>
                  <th>Requested Quantity</th>
                  <th>Date Requested</th>
                  <th>Action</th>
                </tr>
              </tfoot>
              <tbody>
                {#each data as item (item.id)}
                  <tr>
                    <td>{item.id}</td>
                    <td>{item.patient_name}</td>
                    <td>{item.patient_diagnosis}</td>
                    <td>{item.patient_bloodtype}</td>
                    <td>{item.request_purpose}</td>
                    <td>{item.request_bloodpack}</td>
                    <td>{item.request_urgency}</td>
                    <td>{item.request_quantity}</td>
                    <td>{moment(item.request_date).format("L • hh:mma")}</td>
                    <td>
                      <button on:click={() => deleteOne(item.id)} class="btn btn-danger btn-sm">Delete</button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
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
