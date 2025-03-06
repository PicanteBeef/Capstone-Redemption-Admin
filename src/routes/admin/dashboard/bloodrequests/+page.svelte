<!-- Blood requests lands here. -->

<script>
  import { onMount } from 'svelte';
  import { supabase } from '/src/lib/supabaseClient.js'; // Adjust the path as needed

  let showModal = false; // Controls the visibility of the modal
  let searchQuery = ''; // Tracks the search input value
  let requests = [];
  let filteredRequests = [];
  let isLoading = true;
  let reviewModal = false;
  let acceptModal = false;
  let denyModal = false;
  let selectedRequest = null;
  let selectedDonationId = '';
  let denialReason = '';
  let otherReason = '';
  let availableDonations = [];
  let isAcceptExpanded = false; // Controls the "Accept" section
  let isDenyExpanded = false; // Controls the "Deny" section

  // State for the new request form
  let newRequest = {
    requester_first_name: '',
    requester_last_name: '',
    birthdate: '',
    blood_type: 'A+',
    image: null,
    purpose: '',
    urgency: 'Low',
    amount: 1,
  };

  // Fetch blood requests from the database
  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('requests_processing')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        alert('Failed to load requests.');
      } else {
        requests = data;
        filteredRequests = data; // Initialize filtered requests
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred while loading requests.');
    } finally {
      isLoading = false;
    }
  }

  // Reactive filtering logic
  $: {
    const normalizedQuery = searchQuery.trim().toLowerCase(); // Normalize the query
    if (!normalizedQuery) {
      filteredRequests = requests; // Show all requests if search query is empty
    } else {
      filteredRequests = requests.filter(request => {
        // Text-based matching
        return (
          request.requester_first_name.toLowerCase().includes(normalizedQuery) ||
          request.requester_last_name.toLowerCase().includes(normalizedQuery) ||
          request.blood_type.toLowerCase().includes(normalizedQuery) ||
          request.status.toLowerCase().includes(normalizedQuery) ||
          request.urgency.toLowerCase().includes(normalizedQuery) ||
          String(request.amount).includes(normalizedQuery) // Convert amount to string for matching
        );
      });
    }

    // Debugging logs
    console.log('Search Query:', normalizedQuery);
    console.log('Filtered Requests:', filteredRequests);
  }

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newRequest.image = e.target.result; // Store the Base64 string
      };
      reader.readAsDataURL(file); // Convert the file to a Base64 string
    }
  }

  // Submit the blood request
  async function handleSubmit() {
    try {
      await supabase.from('requests_processing').insert({
        requester_first_name: newRequest.requester_first_name,
        requester_last_name: newRequest.requester_last_name,
        birthdate: newRequest.birthdate,
        blood_type: newRequest.blood_type,
        image: newRequest.image, // Base64 string
        purpose: newRequest.purpose,
        urgency: newRequest.urgency,
        amount: newRequest.amount,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      alert('Request submitted successfully.');
      newRequest = {
        requester_first_name: '',
        requester_last_name: '',
        birthdate: '',
        blood_type: 'A+',
        image: null,
        purpose: '',
        urgency: 'Low',
        amount: 1,
      }; // Reset form
      fetchRequests(); // Refresh the table
      showModal = false; // Close the modal
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('An unexpected error occurred while submitting the request.');
    }
  }

  // Lifecycle hook to fetch requests on page load
  onMount(() => {
    fetchRequests();
  });

  // Open Review Modal
  function openReviewModal(request) {
    console.log('Opening review modal for request:', request);
    if (!request) {
      console.error('Error: Request object is undefined.');
      alert('Failed to open the modal. Please try again.');
      return;
    }

    // Set the selected request and open the modal
    selectedRequest = request;
    reviewModal = true; // Ensure this is set to true
    console.log('Review modal state:', reviewModal);

    // Reset expanded states
    isAcceptExpanded = false;
    isDenyExpanded = false;

    // Fetch available donations for the requested blood type (if needed)
    fetchAvailableDonations(request.blood_type);
  }

  // Close Review Modal
  function closeReviewModal() {
    selectedRequest = null;
    isAcceptExpanded = false;
    isDenyExpanded = false;
    reviewModal = false;
  }

  function openAcceptSection() {
    isAcceptExpanded = true;
    isDenyExpanded = false; // Collapse the Deny section
  }

  function openDenySection() {
    isDenyExpanded = true;
    isAcceptExpanded = false; // Collapse the Accept section
  }

  // Fetch Available Donations
  async function fetchAvailableDonations(bloodType) {
    try {
      const { data, error } = await supabase
        .from('donations_processing')
        .select('*')
        .eq('dp_blood_type', bloodType)
        .eq('dp_status', 'available')
        .order('dp_donation_date', { ascending: true });

      if (error) throw error;

      availableDonations = data;
    } catch (err) {
      console.error('Error fetching available donations:', err);
      alert('Failed to fetch available donations.');
    }
  }

  // Function to toggle donation selection
  function toggleDonationSelection(donationId) {
    if (selectedDonationId.includes(donationId)) {
      // Remove donation if already selected
      selectedDonationId = selectedDonationId.filter(id => id !== donationId);
    } else {
      // Add donation if not exceeding the requested amount
      if (selectedDonationId.length < selectedRequest.amount) {
        selectedDonationId = [...selectedDonationId, donationId];
      } else {
        alert(`You can only select up to ${selectedRequest.amount} donations.`);
      }
    }
  }

  // Handle Accept Request
  async function handleAcceptRequest(request, selectedDonations) {
    if (selectedDonations.length !== request.amount) {
      alert(`Please select exactly ${request.amount} donations.`);
      return;
    }

    if (request.status !== 'pending') {
      alert('This request has already been processed and cannot be accepted.');
      return;
    }

    try {
      // Validate the request object
      console.log('Request Object:', request);
      if (!request || !request.id) {
        console.error('Request object or request ID is missing.');
        alert('Failed to process the request: Request ID is missing.');
        return;
      }

      // Prepare an array of promises for batch operations
      const updatePromises = [];
      const transactionPromises = [];

      for (const donationId of selectedDonations) {
        console.log(`Processing donation ID: ${donationId}`);

        // Fetch the details of the selected donation
        console.log(`Fetching donation record for ID: ${donationId}`);
        const { data: donationRecord, error: donationError } = await supabase
          .from('donations_processing')
          .select('id, dp_donor_id, dp_donation_date, dp_expiration_date') // Select only necessary fields
          .eq('id', donationId)
          .single();

        if (donationError) {
          console.error(`Error fetching donation details for ID ${donationId}:`, donationError.message || donationError);
          throw new Error(`Failed to fetch donation details for ID ${donationId}: ${donationError.message || donationError}`);
        }

        if (!donationRecord) {
          console.error(`Donation record not found for ID: ${donationId}`);
          throw new Error(`The referenced donation does not exist for ID: ${donationId}`);
        }

        console.log(`Fetched donation record:`, donationRecord);

        // Extract the donor ID (dp_donor_id) from the donation record
        const donorId = donationRecord.dp_donor_id;

        // Check if the donation already has a "Blood Out" transaction
        console.log(`Checking for existing "Blood Out" transaction for donation ID: ${donationId}`);
        const { data: existingTransactions, error: checkError } = await supabase
          .from('transactions_processing')
          .select('*')
          .eq('reference_id', donorId) // Use donorId (dp_donor_id) instead of donationId
          .eq('transaction_type', 'Blood Out');

        if (checkError) {
          console.error(`Error checking for existing transaction for donation ID ${donationId}:`, checkError.message || checkError);
          throw new Error(`Failed to check for existing transaction for donation ID ${donationId}: ${checkError.message || checkError}`);
        }

        if (existingTransactions && existingTransactions.length > 0) {
          console.error(`Transaction already exists for this donation ID: ${donationId}`, existingTransactions);
          throw new Error(`A "Blood Out" transaction already exists for this donation ID: ${donationId}`);
        }

        console.log(`No existing "Blood Out" transaction found for donation ID: ${donationId}`);

        // Mark the donation as "released"
        console.log(`Marking donation as "released" for ID: ${donationId}`);
        updatePromises.push(
          supabase
            .from('donations_processing')
            .update({ dp_status: 'released' })
            .eq('id', donationId)
        );

        // Log the transaction as "Blood Out"
        console.log(`Inserting "Blood Out" transaction for donation ID: ${donationId}`);
        const insertData = {
          reference_id: donorId, // Use the donor ID (dp_donor_id) as the reference_id
          requestor_id: request.id, // Add the requestor_id (ID of the request in requests_processing)
          blood_type: request.blood_type,
          transaction_date: new Date().toISOString(),
          donation_date: donationRecord.dp_donation_date,
          expiration_date: donationRecord.dp_expiration_date,
          transaction_type: 'Blood Out',
        };

        console.log('Inserting data into transactions_processing:', insertData);

        // Validate that all required fields are present
        if (!insertData.requestor_id) {
          console.error('Requestor ID is missing in the insertData object.');
          alert('Failed to log the transaction: Requestor ID is missing.');
          return;
        }

        // Insert the transaction into the database
        transactionPromises.push(
          supabase.from('transactions_processing').insert(insertData).then(({ data, error }) => {
            if (error) {
              console.error('Error inserting transaction:', error.message || error);
              throw new Error(`Failed to log the transaction: ${error.message || error}`);
            }
            console.log('Transaction logged successfully:', data);
          })
        );
      }

      // Execute all updates and inserts in parallel
      console.log('Executing all update and insert promises...');
      await Promise.all([...updatePromises, ...transactionPromises]);

      // Update the request status to "accepted"
      console.log(`Updating request status to "accepted" for request ID: ${request.id}`);
      const { data: requestData, error: requestError } = await supabase
        .from('requests_processing')
        .update({ status: 'accepted' })
        .eq('id', request.id);

      if (requestError) {
        console.error(`Error updating request status for request ID ${request.id}:`, requestError.message || requestError);
        throw new Error(`Failed to update request status for request ID ${request.id}: ${requestError.message || requestError}`);
      }

      console.log(`Request accepted successfully for request ID: ${request.id}`);
      alert('Request accepted successfully.');
      closeReviewModal();
      fetchRequests(); // Refresh the table
    } catch (err) {
      console.error('Error accepting request:', err.message || err);
      alert(`An unexpected error occurred: ${err.message || err}`);
    }
  }

  // Handle Deny Request
  async function handleDenyRequest(request, reason) {
    // Validate that a reason is provided
    if (!reason) {
      alert('Please provide a reason for denial.');
      return;
    }

    if (request.status !== 'pending') {
      alert('This request has already been processed and cannot be denied.');
      return;
    }

    // Additional validation for "Other" reason
    if (reason === 'Other' && !otherReason) {
      alert('Please specify the reason for denial.');
      return;
    }

    try {
      // Combine the reason and otherReason if "Other" is selected
      const rejectionReason = reason === 'Other' ? otherReason : reason;

      // Update the request status and reason in the database
      const { error } = await supabase
        .from('requests_processing')
        .update({ status: 'rejected', rejection_reason: rejectionReason })
        .eq('id', request.id);

      if (error) {
        console.error('Error denying request:', error);
        alert('An unexpected error occurred while denying the request.');
        return;
      }

      alert('Request denied successfully.');
      closeReviewModal();
      fetchRequests(); // Refresh the table
    } catch (err) {
      console.error('Error denying request:', err);
      alert('An unexpected error occurred while denying the request.');
    }
  }
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

    .donation-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    background-color: #f9f9f9;
  }

  .donation-card {
    padding: 10px;
    margin-bottom: 5px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .donation-card:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .donation-card.selected {
    border: 2px solid #28a745; /* Green border for selected card */
    background-color: #e6f7ee; /* Light green background */
  }

  .donation-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .donation-card p {
    margin: 0;
    font-size: 14px;
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

  <main>
    <!-- Main Content -->
    <div class="content-wrapper" style="margin-top: 5rem;">
      <!-- Blood Requests Card -->
      <div class="card mb-3 mx-1">
        <div class="card-header text-danger">
          <i class="fa fa-tasks" /> Blood Requests
        </div>
        <div class="card-body">
          <!-- Search Bar -->
          <div class="mb-3 d-flex justify-content-between align-items-center">
            <div class="search-bar">
              <input
                type="text"
                placeholder="Search..."
                bind:value={searchQuery}
                class="form-control"
              />
            </div>
            <!-- Add Request Button -->
            <button class="btn btn-danger" on:click={() => (showModal = true)}>
              Request for Blood
            </button>
          </div>
  
          <!-- Table -->
          <div class="table-responsive">
            {#if isLoading}
              <p>Loading...</p>
            {:else}
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Patient Name</th>
                    <th>Blood Type</th>
                    <th>Urgency</th>
                    <th>Units</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each filteredRequests as request (request.id)}
                    <tr>
                      <td>{request.requester_first_name} {request.requester_last_name}</td>
                      <td>{request.blood_type}</td>
                      <td>{request.urgency}</td>
                      <td>{request.amount}</td>
                      <td>{request.status}</td>
                      <td>
                        <button
                          class="btn btn-sm btn-danger"
                          on:click={() => openReviewModal(request)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
              {#if filteredRequests.length === 0}
                <p class="text-center text-muted">No requests found.</p>
              {/if}
            {/if}
          </div>
        </div>
      </div>

      {#if reviewModal && selectedRequest}
        <div class="modal show d-block" tabindex="-1" role="dialog">
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Review Request</h5>
                <button
                  type="button"
                  class="btn-close"
                  aria-label="Close"
                  on:click={() => (reviewModal = false)}
                ></button>
              </div>
              <div class="modal-body">
                <!-- Requester Details -->
                <h6>Patient Details</h6>
                {#if selectedRequest.image}
                  <img src={selectedRequest.image} alt="Requester Image" class="img-fluid" style="max-width: 100px;" />
                {:else}
                  <p>No Image Available</p>
                {/if}
                <p><strong>Name:</strong> {selectedRequest.requester_first_name} {selectedRequest.requester_last_name}</p>
                <p><strong>Blood Type:</strong> {selectedRequest.blood_type}</p>
                <p><strong>Urgency:</strong> {selectedRequest.urgency}</p>
                <p><strong>Purpose:</strong> {selectedRequest.purpose}</p>
                <p><strong>Units:</strong> {selectedRequest.amount} bags</p>
                <hr />
                <!-- Display Rejection Reason if Denied -->
                {#if selectedRequest.status === 'rejected'}
                  <p><strong>Rejection Reason:</strong> {selectedRequest.rejection_reason}</p>
                {/if}
                <!-- Action Buttons -->
                {#if selectedRequest.status === 'pending'}
                  <div class="d-flex justify-content-between mt-3">
                    <button
                      class="btn btn-success"
                      on:click={openAcceptSection}
                    >
                      Accept
                    </button>
                    <button
                      class="btn btn-danger"
                      on:click={openDenySection}
                    >
                      Deny
                    </button>
                  </div>
                {:else}
                  <p>This request has already been processed and cannot be modified.</p>
                {/if}

                <!-- Extended Section for Accept -->
                {#if isAcceptExpanded}
                  <div class="mt-3">
                    <h6>Select Donations ({selectedDonationId.length}/{selectedRequest.amount})</h6>
                    {#if availableDonations.length > 0}
                      <div class="donation-list">
                        {#each availableDonations as donation (donation.id)}
                          <div
                            class="donation-card {selectedDonationId.includes(donation.id) ? 'selected' : ''}"
                            on:click={() => toggleDonationSelection(donation.id)}
                          >
                            <p><strong>Donor ID:</strong> {donation.dp_donor_id}</p>
                            <p><strong>Blood Type:</strong> {donation.dp_blood_type}</p>
                            <p><strong>Donation Date:</strong> {new Date(donation.dp_donation_date).toLocaleDateString()}</p>
                            <p><strong>Expiration Date:</strong> {new Date(donation.dp_expiration_date).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {donation.dp_status}</p>
                          </div>
                        {/each}
                      </div>
                    {:else}
                      <p>No available donations for this blood type.</p>
                    {/if}
                    <div class="d-flex justify-content-end mt-3">
                      <button
                        class="btn btn-success"
                        on:click={() => handleAcceptRequest(selectedRequest, selectedDonationId)}
                        disabled={selectedDonationId.length !== selectedRequest.amount}
                      >
                        Confirm
                      </button>
                      <button
                        class="btn btn-secondary ms-2"
                        on:click={() => (isAcceptExpanded = false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                {/if}

                <!-- Extended Section for Deny -->
                {#if isDenyExpanded}
                  <div class="mt-3">
                    <h6>Reason for Denial</h6>
                    <select bind:value={denialReason} class="form-select">
                      <option value="">-- Select Reason --</option>
                      <option value="No Blood Stock">No Blood Stock</option>
                      <option value="Health Reasons">Health Reasons</option>
                      <option value="Other">Other</option>
                    </select>
                    {#if denialReason === 'Other'}
                      <div class="mt-3">
                        <label class="form-label">Please Specify</label>
                        <input
                          type="text"
                          bind:value={otherReason}
                          class="form-control"
                        />
                      </div>
                    {/if}
                    <div class="d-flex justify-content-end mt-3">
                      <button
                        class="btn btn-danger"
                        on:click={() => {
                          if (denialReason === 'Other' && !otherReason) {
                            alert('Please specify the reason for denial.');
                            return;
                          }
                          handleDenyRequest(selectedRequest, denialReason === 'Other' ? otherReason : denialReason);
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        class="btn btn-secondary ms-2"
                        on:click={() => (isDenyExpanded = false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                {/if}
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  on:click={() => (reviewModal = false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Modal Backdrop -->
      {#if reviewModal}
        <div class="modal-backdrop show"></div>
      {/if}
  
      <!-- Blood Request Modal -->
      {#if showModal}
        <div class="modal show d-block" tabindex="-1" role="dialog">
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Request for Blood</h5>
                <button
                  type="button"
                  class="btn-close"
                  aria-label="Close"
                  on:click={() => (showModal = false)}
                ></button>
              </div>
              <div class="modal-body">
                <form on:submit|preventDefault={handleSubmit}>
                  <div class="mb-3">
                    <label class="form-label">First Name</label>
                    <input
                      type="text"
                      bind:value={newRequest.requester_first_name}
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Last Name</label>
                    <input
                      type="text"
                      bind:value={newRequest.requester_last_name}
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Birthdate</label>
                    <input
                      type="date"
                      bind:value={newRequest.birthdate}
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Blood Type</label>
                    <select bind:value={newRequest.blood_type} class="form-select" required>
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
                    <label class="form-label">Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      on:change={handleImageUpload}
                      class="form-control"
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Purpose of Request</label>
                    <textarea
                      bind:value={newRequest.purpose}
                      class="form-control"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Urgency Level</label>
                    <select bind:value={newRequest.urgency} class="form-select" required>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Units (per bag)</label>
                    <input
                      type="number"
                      bind:value={newRequest.amount}
                      class="form-control"
                      min="1"
                      required
                    />
                  </div>
                  <button type="submit" class="btn btn-danger">Submit Request</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop show"></div>
      {/if}
    </div>
  </main>
</body>
