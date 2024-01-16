<!-- Inventory Database display here. Include CRUD commands. -->

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

    const searchTermLower = searchTerm.toLocaleLowerCase();

    const filteredData = originalData.filter((item) => 
      Object.values(item).some((value) => {
        if(typeof value === "string") {
          return value.toLocaleLowerCase().includes(searchTermLower);
        } else if (value instanceof Date) {
          const formattedData = moment(value).format("L • hh:mma");
          return formattedData.toLocaleLowerCase().includes(searchTermLower);
        }
        return false;
      })
    );
      
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
            <i class="fa fa-droplet" /> Donation History
          </div>
          <div class="card-body">
            <div>
              <input type="text" bind:value={searchTerm} on:input={search} placeholder="Search..." />
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table
                  class="table table-bordered rounded"
                  id="dataTable"
                  width="100%"
                  cellspacing="0"
                >
                  <thead>
                    <tr class="clearfix">
                      <th on:click={() => sortByColumn('id')} class="sortButton">Serial ID</th>
                      <th on:click={() => sortByColumn('blood type')} class="sortButton">Blood Type</th>
                      <th on:click={() => sortByColumn('amount')} class="sortButton">Amount</th>
                      <th on:click={() => sortByColumn('expiry')} class="sortButton">Expiration</th>
                      <th on:click={() => sortByColumn('entry_date')} class="sortButton">Date Entry</th>
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
                        <td>{item.amount} • {item.amount * 450} CC</td>
                        <td>{moment(item.expiry).format("L • hh:mma")}</td>
                        <td>{moment(item.entry_date).format("L • hh:mma")}</td>
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
  