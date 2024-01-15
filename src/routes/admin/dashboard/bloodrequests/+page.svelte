<!-- Blood requests lands here. -->

<script>
  import { onMount } from "svelte";
  import supabase from "/src/lib/supabaseClient.js";
  import moment from "moment";
  import { createEventDispatcher } from "svelte";

  let data = [];

  //Fetch Blood Requests Data
  onMount(async () => {
    const { data: records, error } = await supabase
      .from("blood_requests")
      .select("*")
      .order("request_date", { ascending: false });

    if (error) {
      console.error("Error fetching data from Supabase:", error);
    } else {
      data = records;
    }
  });

  //Modal Functions
  let requestDetails;
  let remarks='';
  let isOpen = false;

  let rowStatus = new Map();
  const rowStatusUpdate= new Map(rowStatus);

  const dispatch = createEventDispatcher();

  const openModal = (item) => {
    requestDetails = item;
    isOpen = true;
  };

  const closeModal = () => {
    isOpen = false;
    dispatch("modalClosed");
  };

  const handleCheckButtonClick = async () => {
    // Transfer data to another table
    const { id } = requestDetails;
    const { data, error } = await supabase
    .from("blood_requests_releasing")
    .upsert([
      {
        id: id,
        patient_name: requestDetails.patient_name,
        patient_diagnosis: requestDetails.patient_diagnosis,
        patient_bloodtype: requestDetails.patient_bloodtype,
        request_purpose: requestDetails.request_purpose,
        request_bloodpack: requestDetails.request_bloodpack,
        request_urgency: requestDetails.request_urgency,
        request_quantity: requestDetails.request_quantity,
        request_date: requestDetails.request_date,
        request_remarks: remarks,
      },
    ]);

    if (error) {
      console.error("Error transferring data:", error);
      return;
    }
    console.log("Accepted!");
    rowStatusUpdate.set(requestDetails.id, {action: "accept"});
    rowStatus = rowStatusUpdate;
  };

  const handleXMarkButtonClick = async () => {
    // Additional logic for x-mark button if needed
    const { id } = requestDetails;
    console.log("Denied!");
    rowStatusUpdate.set(requestDetails.id, {action: "reject"});
    rowStatus = rowStatusUpdate;
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
  <script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
  ></script>

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
    <!--Main Content-->
    <div class="content-wrapper" style="margin-top: 5rem;">
      <!-- Transaction Section-->
      <div>
        <!--Blood Inventory-->
        <div class="card mb-3 mx-1" id="blood-inventory">
          <div class="card-header text-danger">
            <i class="fa fa-droplet" /> Blood Request
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
                    <th>Patient Blood Type</th>
                    <th>Urgency</th>
                    <th>Requested Quantity</th>
                    <th>Date Requested</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tfoot>
                  <tr>
                    <th>Serial ID</th>
                    <th>Patient Blood Type</th>
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
                      <td>{item.patient_bloodtype}</td>
                      <td>{item.request_urgency}</td>
                      <td>{item.request_quantity}</td>
                      <td>{moment(item.request_date).format("L • hh:mma")}</td>
                      <td>
                        <button
                          class="btn btn-danger rounded"
                          on:click={() => openModal(item)}
                          >Review Request</button
                        >
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
          <!--Modal-->
          {#if isOpen}
            <div class="modal open">
              <div class="modal-content">
                <div class="modal-header">
                  <span
                    style="margin-left: 10px; color: white; font-weight: bold;"
                    >Request Details</span
                  >
                  <button class="close" on:click={closeModal}>&times;</button>
                </div>
                <div class="modal-body">
                  {#if requestDetails}
                    <div>
                      <table class="table table-borderless">
                        <tbody>
                          <!--Patient Details-->
                          <tr>
                            <td class="col">
                              <div class="d-flex flex-column">
                                <span class="heading d-block fw-bold"
                                  >Serial ID:</span
                                >
                                <span class="subheadings"
                                  >{requestDetails.id}</span
                                >
                              </div>
                            </td>
                            <td class="col">
                              <div class="d-flex flex-column">
                                <span class="heading d-block fw-bold"
                                  >Patient Name:</span
                                >
                                <span class="subheadings"
                                  >{requestDetails.patient_name}</span
                                >
                              </div>
                            </td>
                            <td class="col">
                              <div
                                class="d-flex flex-column justify-content-center"
                              >
                                <span class="heading d-block fw-bold"
                                  >Diagnosis:</span
                                >
                                <span class="subheadings"
                                  >{requestDetails.patient_diagnosis}</span
                                >
                              </div>
                            </td>
                            <td class="col">
                              <div class="d-flex flex-column">
                                <span class="heading d-block fw-bold"
                                  >Blood Type:</span
                                >
                                <span class="subheadings"
                                  >{requestDetails.patient_bloodtype}</span
                                >
                              </div>
                            </td>
                          </tr>
                          <!-- Existing code for displaying details -->
                          <!--Request Details-->
                          <tr>
                            <td class="col">
                              <div class="d-flex flex-column">
                                <span class="heading d-block fw-bold"
                                  >Request Purpose:</span
                                >
                                <span class="subheadings"
                                  >{requestDetails.request_purpose}</span
                                >
                              </div>
                            </td>
                            <td class="col">
                              <div class="d-flex flex-column">
                                <span class="heading d-block fw-bold"
                                  >Requested Bloodpack:</span
                                >
                                <span class="subheadings"
                                  >{requestDetails.request_bloodpack}</span
                                >
                              </div>
                            </td>
                            <td class="col">
                              <div
                                class="d-flex flex-column justify-content-center"
                              >
                                <span class="heading d-block fw-bold"
                                  >Urgency:</span
                                >
                                <span class="subheadings"
                                  >{requestDetails.request_urgency}</span
                                >
                              </div>
                            </td>
                            <td class="col">
                              <div class="d-flex flex-column">
                                <span class="heading d-block fw-bold"
                                  >Date Requested:</span
                                >
                                <span class="subheadings"
                                  >{moment(requestDetails.request_date).format(
                                    "L • hh:mma"
                                  )}</span
                                >
                              </div>
                            </td>
                          </tr>
                          <!-- Request Action -->
                          <tr>
                            <td class="col">
                              <div class="d-flex flex-column">
                                <span class="heading d-block fw-bold"
                                  >Action:</span
                                >
                                <span class="subheadings">
                                  {#if !rowStatus.get(requestDetails.id)}
                                    <button
                                      class="btn"
                                      on:click={handleCheckButtonClick}
                                      ><i
                                        class="fa-solid fa-square-check fs-3 text-success"
                                      /></button
                                    >
                                    <button
                                      class="btn"
                                      on:click={handleXMarkButtonClick}
                                      ><i
                                        class="fa-solid fa-square-xmark fs-3 text-danger"
                                      /></button
                                    >
                                  {:else if rowStatus.get(requestDetails.id).action === "accept"}
                                    <p>Accepted</p>
                                  {:else if rowStatus.get(requestDetails.id).action === "reject"}
                                    <p>Denied!</p>
                                  {/if}
                                </span>
                              </div>
                            </td>
                            <td class="col">
                              <div class="d-flex flex-column">
                                <span class="heading d-block fw-bold"
                                  >Remarks:</span
                                >
                                {#if !rowStatus.get(requestDetails.id)}
                                  <span class="subheadings">
                                    <form action="">
                                      <textarea
                                        bind:value={remarks}
                                        class="form-control"
                                        style="min-width: 100%; resize:none"
                                        placeholder="Additional remarks"
                                      />
                                    </form>
                                  </span>
                                {:else}
                                  <span class="subheadings">
                                    <form action="">
                                      <textarea
                                        bind:value={remarks}
                                        class="form-control"
                                        style="min-width: 100%; resize:none"
                                        disabled
                                        readonly
                                      />
                                    </form>
                                  </span>
                                {/if}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        </div>
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
