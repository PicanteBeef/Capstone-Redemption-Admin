<!-- Blood requests lands here. -->
<!-- Blood requests lands here. -->

<script>
  import { onMount } from "svelte";
  import supabase from "/src/lib/supabaseClient.js";
  import moment from "moment";
  import { createEventDispatcher } from "svelte";

  let data = [];
  let notification = null;
  let originalData = [];
  let searchTerm = '';

  onMount(async () => {
    const { data: records, error } = await supabase
      .from("donors_table")
      .select("*")

    if (error) {
      console.error("Error fetching data from Supabase:", error);
    } else {
      data = records;
      originalData = records;
    }
  });

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

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection * valueA.localeCompare(valueB);
      } else {
        return sortDirection * (valueA - valueB);
      }
    });
  };

  // Search Visible Table
  const search = () => {
    if (searchTerm.trim() === '') {
      data = originalData;
      return;
    }

    const filteredData = originalData.filter(item => {
      return (
        item.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.last_name.toLowerCase().includes(searchTerm.toLowerCase())
        // Add more fields as needed for your search
      );
    });

    data = filteredData;
  };

  $: search();

  let firstName = "", lastName = "", donorBirth = "", donorSex = "", donorBlood = "", donorStatus = "", donorEmail = "", donorType = "", donorVolume = "", donorNum = "", donorPulse = "", donorBP = "", donationEvent = "";

  const handleSubmit = async () => {
  // Validate the form data (replace this with your validation logic)
  if (!firstName || !lastName || !donorBirth || !donorSex || !donorBlood || !donorStatus || !donorEmail || !donorType || !donorVolume || !donorNum || !donorPulse || !donorBP) {
    setNotification({ type: "error", message: "Please fill in all fields." });
    return;
  }

  const formattedContactNum = `+63${donorNum}`;

  try {
    // Submit the form data to Supabase
    const { data, error } = await supabase.from("donors_table").upsert([
      {
        first_name: firstName,
        last_name: lastName,
        birthdate: donorBirth,
        sex: donorSex,
        blood_type: donorBlood,
        civil_status: donorStatus,
        contact_num: formattedContactNum,
        blood_pressure: donorBP,
        email:donorEmail,
        donation_type: donorType,
        donation_volume: donorVolume,
        donor_pulse: donorPulse,
        donation_event: donationEvent,
        donation_date: new Date(),
      },
    ]);
    console.log("info:", firstName, lastName, donorBP, donorBirth, donorBlood, donorEmail, donorNum, donorPulse, donorSex, donorStatus, donorType, donorVolume);

    if (error) {
      console.error("Error submitting data:", error);
      setNotification({ type: "error", message: "Error submitting data." });
    } else {
      console.log("Data submitted successfully:", data);
      setNotification({ type: "success", message: "Entry submitted successfully." });

      // Optionally, you can reload the page or fetch updated data here
      setTimeout(() => {
        location.reload();
      }, 2000);
    }
  } catch (error) {
    console.error("Error submitting data:", error);
    setNotification({ type: "error", message: "Error submitting data." });
  }
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

    .reqActions:hover {
      background-color: #e3e3e8;
    }

    .modal {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }

    .modal.open {
      display: block;
      opacity: 1;
    }

    .modal-content {
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      width: 60vw;
      max-width: 50%;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      left: 25%;
      top: 25%;
      opacity: 0;
      animation: modalFadeIn 0.3s ease-in-out forwards;
    }

    .modal-header {
      background-color: #df3545;
      padding: 10px;
      display: flex;
      justify-content: space-between;
    }

    .close {
      font-size: 20px;
      cursor: pointer;
      border: none;
      border-radius: 0.375rem;
      background-color: #df3545;
      color: white;
      margin-left: 10px;
    }

    .modal-body {
      padding: 20px;
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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

      <!-- Entries Form -->
      <div class="card mb-3 mx-1" id="blood-request-form">
        <div class="card-header text-danger">
          <i class="fa fa-droplet" /> New Donation Form
        </div>
        <div class="card-body">
          <form on:submit={handleSubmit}>
            <div class="row">
              <!-- Column 1 -->
              <div class="col-md-6">
                
                <div class="mb-3">
                  <label for="donorName" class="form-label">Donor Name<span class="text-danger">*</span></label>
                  <div class="row">
                    <div class="col-md-6">
                        <input type="text" class="form-control" id="firstName" placeholder="First Name" bind:value={firstName} required />
                    </div>
                    <div class="col-md-6">
                        <input type="text" class="form-control" id="lastName" placeholder="Last Name" bind:value={lastName} required />
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="row">
                    <div class="col-md-6">
                        <label for="donorBirth" class="form-label">Birthdate<span class="text-danger">*</span></label>
                        <input type="date" class="form-control" id="donorBirth" bind:value={donorBirth} required />
                    </div>
                    <div class="col-md-6">
                        <label for="donorSex" class="form-label">Gender<span class="text-danger">*</span></label>
                        <select class="form-control" id="donorSex" bind:value={donorSex} required>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Others">Others</option>
                        </select>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="row">
                    <div class="col-md-6">
                      <label for="donorBlood" class="form-label">Blood Type<span class="text-danger">*</span></label>
                        <select class="form-control" id="donorBlood" bind:value={donorBlood} required>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>F
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                      <label for="donorStatus" class="form-label">Civil Status<span class="text-danger">*</span></label>
                      <select class="form-control" id="donorStatus" bind:value={donorStatus} required>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Annulled">Annulled</option>
                        <option value="Separated">Separated</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                  </div>
                  </div>
                  
                </div>

                <div class="mb-3">
                  <div class="row">
                    <div class="col-md-6">
                      <label for="donorNum" class="form-label">Contact Number<span class="text-danger">*</span></label>
                      <div class="input-group">
                        <button class="btn btn-outline-secondary" type="button" id="button-addon1" disabled>+63</button>
                        <input type="text" class="form-control" id="donorNum" placeholder="Contact Number" bind:value={donorNum} required />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label for="donorEmail" class="form-label">Email<span class="text-danger">*</span></label>
                      <input type="email" class="form-control" id="donorEmail" placeholder="user@email.com" bind:value={donorEmail} required />
                    </div>
                </div>
                
                </div>

              </div>
              <!-- Column 2 -->
              <div class="col-md-6">
                <div class="mb-3">
                  <div class="row">
                    <div class="col-md-6">
                      <label for="donorType" class="form-label">Type of Donation<span class="text-danger">*</span></label>
                      <select class="form-control" id="donorType" bind:value={donorType} required>
                        <option value="Whole">Whole</option>
                        <option value="Packed Red Cell">Packed Red Cell</option>
                        <option value="Washed Red Cell">Washed Red Cell</option>
                        <option value="Platelet Concentrate">Platelet Concentrate</option>
                        <option value="Fresh Frozen Plasma">Fresh Frozen Plasma</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label for="donorVolume" class="form-label">Volume of Donated Blood<span class="text-danger">*</span></label>
                      <div class="input-group">
                        <input type="text" inputmode="numeric" class="form-control" id="donorVolume" placeholder="Volume" bind:value={donorVolume}  required />
                        <button class="btn btn-outline-secondary" type="button" id="button-addon1" disabled>ml</button>
                      </div>
                    </div>
                  </div>
                  
                </div>
                <div class="mb-3">
                  <div class="row">
                    <div class="col-md-6">
                      <label for="donorPulse" class="form-label">Pulse<span class="text-danger">*</span></label>
                      <input type="text" inputmode="numeric" class="form-control" id="donorPulse" placeholder="Pulse" bind:value={donorPulse} required />
                    </div>
                    <div class="col-md-6">
                      <label for="donorBP" class="form-label">Blood Pressure<span class="text-danger">*</span></label>
                      <input type="text" inputmode="numeric" class="form-control" id="donorBP" placeholder="Blood Pressure" bind:value={donorBP} required />
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="donationEvent" class="form-label">Event or Location of Donation<span class="text-danger">*</span></label>
                  <div class="row">
                    <div class="col">
                        <input type="text" class="form-control" id="donationEvent" placeholder="Location or Event" bind:value={donationEvent} required />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-danger">Confirm Donation</button>
          </form>
        </div>
      </div>
      <!--End of entries form-->
      <!-- Transaction Section-->
      <div>
        <!--Blood Inventory-->
        <div class="card mb-3 mx-1" id="blood-inventory">
          <div class="card-header text-danger">
            <i class="fa fa-droplet" /> Donation History
          </div>
          <div class="card-body">
            <div>
              <input type="text" bind:value={searchTerm} on:input={search} placeholder="Search..." />
            </div>
            <br>
            <div class="table-responsive">
              <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                <thead>
                  <tr class="clearfix">
                    <th on:click={() => sortTable('last_name')}>
                      Donor Name
                      {sortColumn === 'last_name' ? (sortDirection === 1 ? ' ▲' : ' ▼') : ''}
                    </th>
                    <th on:click={() => sortTable('birthdate')}>
                      Birthdate
                      {sortColumn === 'birthdate' ? (sortDirection === 1 ? ' ▲' : ' ▼') : ''}
                    </th>
                    <th on:click={() => sortTable('sex')}>
                      Gender
                      {sortColumn === 'sex' ? (sortDirection === 1 ? ' ▲' : ' ▼') : ''}
                    </th>
                    <th on:click={() => sortTable('blood_type')}>
                      Blood Type
                      {sortColumn === 'blood_type' ? (sortDirection === 1 ? ' ▲' : ' ▼') : ''}
                    </th>
                    <th on:click={() => sortTable('civil_status')}>
                      Civil Status
                      {sortColumn === 'civil_status' ? (sortDirection === 1 ? ' ▲' : ' ▼') : ''}
                    </th>
                    <th>
                      Contact Number
                    </th>
                    <th on:click={() => sortTable('email')}>
                      Email
                      {sortColumn === 'email' ? (sortDirection === 1 ? ' ▲' : ' ▼') : ''}
                    </th>
                    <th on:click={() => sortTable('donation_date')}>
                      Donation Date
                      {sortColumn === 'donation_date' ? (sortDirection === 1 ? ' ▲' : ' ▼') : ''}
                    </th>
                    <th on:click={() => sortTable('donation_event')}>
                      Location
                      {sortColumn === 'donation_event' ? (sortDirection === 1 ? ' ▲' : ' ▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {#each data as item (item.id)}
                  <tr>
                    <td>{item.first_name} {item.last_name}</td>
                    <td>{item.birthdate}</td>
                    <td>{item.sex}</td>
                    <td>{item.blood_type}</td>
                    <td>{item.civil_status}</td>
                    <td>{item.contact_num}</td>
                    <td>{item.email}</td>
                    <td>{moment(item.donation_date).format("L")}</td>
                    <td>{item.donation_event}</td>
                  </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Notification Section -->
        {#if notification}
          <div class={`alert alert-${notification.type}`} role="alert">
            {notification.message}
          </div>
        {/if}
        <!-- end of notifications-->

        <!--footer-->
        <footer class="sticky-footer">
          <div class="container">
            <div class="text-center text-danger">
              <small>For Capstone use only.</small>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </main>
</body>
