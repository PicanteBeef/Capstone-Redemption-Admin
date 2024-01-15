<!-- Inventory Database display here. Include CRUD commands. -->

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
  let originalData = [];
  let searchTerm = "";

  let sortBy = "";
  let sortOrder = 1;

  async function sortByColumn(column) {
    if (sortBy === column) {
      sortOrder *= -1; // Reverse the sorting order if the same column is clicked
    } else {
      sortBy = column;
      sortOrder = 1;
    }

    // Perform the sorting
    data = data.sort((a, b) => (a[column] - b[column]) * sortOrder);
  }

  async function handleSubmit(event) {
    console.log(formData);
    event.preventDefault();

    const bloodType = formData.bloodType;
    const amount = parseInt(formData.amount, 10);
    const entry_date = new Date(formData.entryDate);
    const entryExpiry = new Date(entry_date);
    entryExpiry.setDate(entryExpiry.getDate() + 42);

    const { data, error } = await supabase
      .from("blood_stock")
      .select(bloodType.toLowerCase());

    if (error) {
      console.error("Error fetching data from Supabase:", error.message);
      return;
    }

    const currentCount = data[0]?.[bloodType.toLowerCase()] || 0;
    const newTotal = currentCount + amount;
    console.log("dataZ", data);

    console.log("Blood Type:", bloodType);
    console.log("Current Count:", currentCount);
    console.log("New Total:", newTotal);

    const { updateError } = await supabase
      .from("blood_stock")
      .update({ [bloodType.toLowerCase()]: newTotal })
      .eq("id", 1);

    if (updateError) {
      console.error("Error updating data in Supabase:", updateError.message);
      console.log(
        "tite ni liemel joshua dumangon lacanilao ng san jose del monte bulacan"
      );
      return;
    }
    console.log("Blood Stock Updated Successfully.");

    const bloodValuePair = {
      a_pos: "A+",
      a_neg: "A-",
      b_pos: "B+",
      b_neg: "B-",
      ab_pos: "AB+",
      ab_neg: "AB-",
      o_pos: "O+",
      o_neg: "O-",
    };
    console.log("Blood Type:", bloodValuePair[bloodType]);
    console.log("Amount:", amount);
    console.log("Date:", entry_date);
    console.log("Expiry:", entryExpiry);

    const { insertErrorInventory } = await supabase
      .from("blood_transactions")
      .insert([
        {
          entry_bloodtype: bloodValuePair[bloodType],
          amount: amount,
          transaction_date: entry_date,
          blood_expiry: entryExpiry,
          transaction_type: "Blood In",
        },
      ]);

    if (insertErrorInventory) {
      console.error(
        'Error inserting data into "blood_inventory":',
        insertErrorInventory.message
      );
      console.log("tite");
      return;
    }

    console.log("tangina");
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

  //Fetch Blood Inventory Data
  onMount(async () => {
    const { data: records, error } = await supabase
      .from("blood_transactions")
      .select("*")
      .neq("transaction_type", "Blood Out");

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

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection * valueA.localeCompare(valueB);
      } else {
        return sortDirection * (valueA - valueB);
      }
    });
  };

  const search = () => {
    if (searchTerm.trim() === "") {
      data = originalData;
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();

    const filteredData = originalData.filter((item) =>
      Object.values(item).some((value) => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTermLower);
        } else if (value instanceof Date) {
          // Format the date to match the search term format
          const formattedDate = moment(value).format("L • hh:mma");
          return formattedDate.toLowerCase().includes(searchTermLower);
        }
        return false;
      })
    );

    data = filteredData;
  };
  $: search();
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
  <script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
  ></script>

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
        <!--Add Entry-->
        <div class="card mb-3 mx-1 bg-danger w-50" id="addTo-inventory">
          <div class="card-header text-light bg-danger">
            <i class="fa fa-droplet" /> Blood Inventory
          </div>
          <div class="card-body bg-light rounded">
            <div class="d-flex justify-content-center rounded">
              <form clas on:submit={handleSubmit}>
                <div class="row">
                  <div class="col">
                    <label for="bloodType" class="form-label">Blood Type:</label
                    >
                    <select
                      class="form-control"
                      id="bloodType"
                      bind:value={formData.bloodType}
                      required
                    >
                      <option value="a_pos">A+</option>
                      <option value="a_neg">A-</option>
                      <option value="b_pos">B+</option>
                      <option value="b_neg">B-</option>
                      <option value="ab_pos">AB+</option>
                      <option value="ab_neg">AB-</option>
                      <option value="o_pos">O+</option>
                      <option value="o_neg">O-</option>
                    </select>
                  </div>

                  <div class="col">
                    <label for="bloodAmount" class="form-label">Amount:</label>
                    <input
                      type="text"
                      class="form-control"
                      id="bloodAmount"
                      pattern="[0-9]*"
                      min="1"
                      bind:value={formData.amount}
                      required
                    />
                  </div>

                  <div class="col">
                    <label for="entryDate" class="form-label">Entry Date:</label
                    >
                    <input
                      type="datetime-local"
                      class="form-control"
                      id="entryDate"
                      bind:value={formData.entryDate}
                      required
                    />
                  </div>

                  <div class="mt-2">
                    <button class="btn btn-danger" type="submit">Submit</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!--Blood Inventory-->
        <div class="card mb-3 mx-1" id="blood-inventory">
          <div class="card-header text-danger">
            <i class="fa fa-droplet" /> Blood Inventory
          </div>
          <div class="card-body">
            <div>
              <input
                type="text"
                bind:value={searchTerm}
                on:input={search}
                placeholder="Search..."
              />
            </div>
            <div class="table-responsive">
              <table
                class="table table-bordered rounded"
                id="dataTable"
                width="100%"
                cellspacing="0"
              >
                <thead>
                  <tr class="clearfix">
                    <th on:click={() => sortTable("id")}
                      >Serial ID{sortColumn === "id"
                        ? sortDirection === 1
                          ? " ▲"
                          : " ▼"
                        : ""}</th
                    >
                    <th on:click={() => sortTable("entry_bloodtype")}
                      >Blood Type{sortColumn === "entry_bloodtype"
                        ? sortDirection === 1
                          ? " ▲"
                          : " ▼"
                        : ""}</th
                    >
                    <th on:click={() => sortTable("amount")}
                      >Amount{sortColumn === "amount"
                        ? sortDirection === 1
                          ? " ▲"
                          : " ▼"
                        : ""}</th
                    >
                    <th on:click={() => sortTable("blood_expiry")}
                      >Expiration{sortColumn === "blood_expiry"
                        ? sortDirection === 1
                          ? " ▲"
                          : " ▼"
                        : ""}</th
                    >
                    <th on:click={() => sortTable("transaction_date")}
                      >Date Entry{sortColumn === "transaction_date"
                        ? sortDirection === 1
                          ? " ▲"
                          : " ▼"
                        : ""}</th
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
                      <td>{item.entry_bloodtype}</td>
                      <td>{item.amount} • {item.amount * 450} CC</td>
                      <td>{moment(item.blood_expiry).format("L • hh:mma")}</td>
                      <td
                        >{moment(item.transaction_date)
                          .utc()
                          .format("L • hh:mma")}</td
                      >
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
