<!-- Blood transactions lands here. -->

<script>
    import { onMount } from "svelte";
    import { supabase } from "/src/lib/supabaseClient.js";
    import moment from "moment";

    let transactions = [];
    let filteredTransactions = [];
    let selectedTransaction = null;
    let isLoading = true;
    let showModal = false; // Controls the visibility of the modal
    let selectedDonor = null; // Stores the selected donor's data for the modal
    let searchQuery = ''; // Tracks the search input value
    let sortField = null; // Tracks the current field being sorted
    let sortOrder = 'asc'; // Tracks the current sort order ('asc' or 'desc')
    let searchCategory = 'text'; // Tracks the selected search category (default: text)

    // Fetch transactions from the database
    async function fetchTransactions() {
      try {
        const { data, error } = await supabase
          .from('transactions_processing')
          .select('*');

        if (error) {
          console.error('Error fetching transactions:', error);
          alert('Failed to load transactions.');
        } else {
          transactions = data;
          filteredTransactions = data; // Initialize filtered transactions
          console.log('Transactions loaded successfully:', transactions);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('An unexpected error occurred while loading transactions.');
      } finally {
        isLoading = false;
      }
    }

    // Sorting functionality
    function sortTable(field) {
      if (sortField === field) {
        // Toggle sort order if the same field is clicked again
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // Set new sort field and reset sort order to 'asc'
        sortField = field;
        sortOrder = 'asc';
      }

      // Sort the transactions array
      filteredTransactions = [...filteredTransactions].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Handle date fields
        if (['donation_date', 'transaction_date', 'expiration_date'].includes(sortField)) {
          valA = new Date(valA);
          valB = new Date(valB);
        }

        // Case-insensitive sorting for text fields
        if (['blood_type', 'transaction_type'].includes(sortField)) {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        // Compare values
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Helper function to normalize date format (e.g., "1/5" -> "01/05")
    const normalizeDate = (dateString) => {
      if (!dateString || typeof dateString !== 'string') return '';
      const parts = dateString.split('/');
      if (parts.length === 2) {
        const [month, day] = parts.map(part => part.padStart(2, '0')); // Pad single-digit numbers
        return `${month}/${day}`;
      }
      return dateString;
    };

    // Helper function to validate date strings
    const isValidDate = (dateString) => {
      if (!dateString || typeof dateString !== 'string') return false;
      // Normalize the date string for consistent parsing
      const normalizedDate = normalizeDate(dateString);
      // Try parsing as a full date
      const fullDate = new Date(normalizedDate);
      if (!isNaN(fullDate.getTime())) return true;
      // Try parsing as a partial date (e.g., "01/05")
      const parts = normalizedDate.split('/');
      if (parts.length === 2) {
        const [month, day] = parts.map(Number);
        return month >= 1 && month <= 12 && day >= 1 && day <= 31;
      }
      return false;
    };

    // Helper function to compare month and day
    const matchesPartialDate = (donorDate, queryDate) => {
      return (
        donorDate.getMonth() + 1 === queryDate.getMonth() + 1 && // Match month
        donorDate.getDate() === queryDate.getDate() // Match day
      );
    };

    // Reactive filtering logic
    $: {
      if (!searchQuery) {
        filteredTransactions = transactions; // Show all transactions if search query is empty
      } else {
        filteredTransactions = transactions.filter(transaction => {
          if (searchCategory === 'text') {
            // Text-based matching
            return (
              transaction.blood_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
              transaction.transaction_type.toLowerCase().includes(searchQuery.toLowerCase())
            );
          } else if (['donation_date', 'transaction_date', 'expiration_date'].includes(searchCategory)) {
            // Date-based matching
            const transactionDate = new Date(transaction[searchCategory]);
            if (isValidDate(searchQuery)) {
              const normalizedQuery = normalizeDate(searchQuery); // Normalize the query
              const parts = normalizedQuery.split('/');
              if (parts.length === 2) {
                // Partial date match (e.g., "01/05")
                const [month, day] = parts.map(Number);
                const queryDate = new Date(2000, month - 1, day); // Use a dummy year
                return matchesPartialDate(transactionDate, queryDate);
              } else {
                // Full date match (e.g., "01/05/1999")
                const queryDate = new Date(normalizedQuery);
                return transactionDate.toDateString() === queryDate.toDateString();
              }
            }
          }
          return false;
        });
      }
    }

    // Lifecycle hook to fetch transactions on page load
    onMount(() => {
      fetchTransactions();
    });

    async function openTransactionDetails(transaction) {
      try {
        // Fetch donor details
        const donor = await fetchDonorDetails(transaction.reference_id);
        if (!donor) {
          alert('Failed to load donor details.');
          return;
        }

        // Initialize requestor as null
        let requestor = null;

        // Fetch requestor details if transaction type is 'Blood Out'
        if (transaction.transaction_type === 'Blood Out') {
          requestor = await fetchRequestorDetails(transaction.requestor_id); // Fetch requestor details
          if (!requestor) {
            alert('Failed to load requestor details.');
            return;
          }
        }

        // Set the selected transaction with donor and requestor details
        selectedTransaction = {
          transactionType: transaction.transaction_type,
          donor: mapDonorData(donor), // Map donor data
          requestor: requestor ? mapRequestorData(requestor) : null, // Map requestor data
          requestedDate: transaction.transaction_date, // Date of the transaction
          reasonOfRequest: transaction.reason_of_request || 'Not specified', // Reason for the request
          status: transaction.status || 'pending', // Status of the transaction
        };

        // Show the modal
        showModal = true;
      } catch (err) {
        console.error('Error opening transaction details:', err.message || err);
        alert('An unexpected error occurred.');
      }
    }

    // Calculate age from birthdate
    function calculateAge(birthdate) {
      const today = new Date();
      const birth = new Date(birthdate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDifference = today.getMonth() - birth.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    }

    // Fetch donor details from the donations_processing table using reference_id
    async function fetchDonorDetails(referenceId) {
      try {
        const { data, error } = await supabase
          .from('donations_processing')
          .select('*')
          .eq('dp_donor_id', referenceId)
          .single(); // Use .single() since dp_donor_id is unique

        if (error) {
          console.error('Error fetching donor details:', error);
          alert('Failed to load donor details.');
          return null;
        }

        return data;
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('An unexpected error occurred while loading donor details.');
        return null;
      }
    }

    // Fetch requestor details from the requests_processing table
    async function fetchRequestorDetails(requestId) {
      try {
        // Validate that requestId is provided
        if (!requestId) {
          console.error('Request ID is missing or undefined.');
          alert('Failed to load requestor details: Request ID is missing.');
          return null;
        }

        console.log('Fetching requestor details for ID:', requestId);

        // Query the requests_processing table using Supabase
        const { data, error } = await supabase
          .from('requests_processing') // Table name
          .select('*') // Select all columns (you can specify only needed fields for optimization)
          .eq('id', requestId) // Match the request ID
          .single(); // Expect a single record

        // Handle errors
        if (error) {
          console.error('Error fetching requestor details:', error.message || error);
          alert('Failed to load requestor details.');
          return null;
        }

        // Return the fetched data
        console.log('Fetched requestor details:', data);
        return data;
      } catch (err) {
        console.error('Unexpected error:', err.message || err);
        alert('An unexpected error occurred while loading requestor details.');
        return null;
      }
    }

    // Map raw donor data to the local structure
    function mapDonorData(donor) {
      return {
        id: donor.id || 'unknown',
        firstName: donor.dp_first_name || 'Unknown',
        lastName: donor.dp_last_name || 'Unknown',
        bloodType: donor.dp_blood_type || 'Unknown',
        birthdate: donor.dp_birthdate || null,
        image: donor.dp_profile_image || null,
        donationDate: donor.dp_donation_date || null,
        expirationDate: donor.dp_expiration_date || null,
        status: donor.dp_status || 'pending',
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
    }

    // Helper function to map raw requestor data to the local structure
    function mapRequestorData(requestor) {
      return {
        id: requestor.id || 'unknown', // Unique identifier
        firstName: requestor.requester_first_name || 'Unknown', // First name
        lastName: requestor.requester_last_name || 'Unknown', // Last name
        bloodType: requestor.blood_type || 'Unknown', // Blood type
        birthdate: requestor.birthdate || null, // Birthdate
        age: requestor.birthdate ? calculateAge(requestor.birthdate) : null, // Calculate age
        image: requestor.image || null, // Profile image URL
        purpose: requestor.purpose || 'Not specified', // Purpose of the request
        urgency: requestor.urgency || 'Low', // Urgency level
        amount: requestor.amount || 0, // Number of blood bags requested
        status: requestor.status || 'pending', // Status of the request
        createdAt: requestor.created_at || null, // Timestamp of when the request was created
      };
    }

    // Helper function to determine phase status
    function getStatus(responses) {
      return Object.values(responses).every(value => value !== undefined && value !== null)
        ? 'completed'
        : 'pending';
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

      th:hover {
        background-color: #fcd1c7;
        cursor: pointer;
      }

      th.selected {
        background-color: #fab9aa;
        font-weight: bold;
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
        <!-- Transaction Section -->
        <div>
          <!-- Blood Transactions Card -->
          <div class="card mb-3 mx-1" id="blood-transactions">
            <div class="card-header text-danger">
              <i class="fa fa-droplet" /> Blood Transactions
            </div>
            <div class="card-body">
              <!-- Search Bar and Dropdown -->
              <div class="mb-3 d-flex justify-content-between align-items-center">
                <div class="search-bar d-flex gap-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    bind:value={searchQuery}
                    class="form-control"
                    style="max-width: 300px;"
                  />
                  <select bind:value={searchCategory} class="form-select" style="width: 200px;">
                    <option value="text">Text</option>
                    <option value="donation_date">Donation Date</option>
                    <option value="transaction_date">Transaction Date</option>
                    <option value="expiration_date">Expiration Date</option>
                  </select>
                </div>
              </div>
    
              <!-- Table -->
              <div class="table-responsive">
                {#if isLoading}
                  <p>Loading...</p>
                {:else}
                  <table class="table table-bordered table-hover">
                    <thead class="table-light">
                      <tr>
                        <th
                          on:click={() => sortTable('reference_id')}
                          class:selected={sortField === 'reference_id'}
                        >
                          Reference ID
                          {#if sortField === 'reference_id'}
                            {sortOrder === 'asc' ? '▲' : '▼'}
                          {/if}
                        </th>
                        <th
                          on:click={() => sortTable('blood_type')}
                          class:selected={sortField === 'blood_type'}
                        >
                          Blood Type
                          {#if sortField === 'blood_type'}
                            {sortOrder === 'asc' ? '▲' : '▼'}
                          {/if}
                        </th>
                        <th
                          on:click={() => sortTable('donation_date')}
                          class:selected={sortField === 'donation_date'}
                        >
                          Donation Date
                          {#if sortField === 'donation_date'}
                            {sortOrder === 'asc' ? '▲' : '▼'}
                          {/if}
                        </th>
                        <th
                          on:click={() => sortTable('transaction_date')}
                          class:selected={sortField === 'transaction_date'}
                        >
                          Transaction Date
                          {#if sortField === 'transaction_date'}
                            {sortOrder === 'asc' ? '▲' : '▼'}
                          {/if}
                        </th>
                        <th
                          on:click={() => sortTable('expiration_date')}
                          class:selected={sortField === 'expiration_date'}
                        >
                          Expiration Date
                          {#if sortField === 'expiration_date'}
                            {sortOrder === 'asc' ? '▲' : '▼'}
                          {/if}
                        </th>
                        <th
                          on:click={() => sortTable('transaction_type')}
                          class:selected={sortField === 'transaction_type'}
                        >
                          Transaction Type
                          {#if sortField === 'transaction_type'}
                            {sortOrder === 'asc' ? '▲' : '▼'}
                          {/if}
                        </th>
                        <th>Action</th> <!-- New Action Column -->
                      </tr>
                    </thead>
                    <tbody>
                      {#each filteredTransactions as transaction (transaction.id)}
                        <tr>
                          <td>{transaction.reference_id}</td>
                          <td>{transaction.blood_type}</td>
                          <td>{new Date(transaction.donation_date).toLocaleDateString()}</td>
                          <td>{new Date(transaction.transaction_date).toLocaleString()}</td>
                          <td>{new Date(transaction.expiration_date).toLocaleDateString()}</td>
                          <td>{transaction.transaction_type}</td>
                          <td>
                            <!-- Action Button -->
                            <button
                              class="btn btn-sm btn-danger"
                              on:click={() => openTransactionDetails(transaction)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                  <!-- No Transactions Message -->
                  {#if filteredTransactions.length === 0}
                    <p class="text-center text-muted">No transactions found.</p>
                  {/if}
                {/if}
              </div>
            </div>
          </div>
    
          <!-- Modal for Donor Details -->
          {#if showModal && selectedTransaction}
            <div class="modal show d-block" tabindex="-1" role="dialog">
              <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Transaction Details</h5>
                    <button
                      type="button"
                      class="btn-close"
                      aria-label="Close"
                      on:click={() => (showModal = false)}
                    ></button>
                  </div>
                  <div class="modal-body">
                    <!-- Donor Details -->
                    <h6>Donor Details</h6>
                    <div class="row">
                      <div class="col-md-4 text-center">
                        <!-- Donor Image -->
                        {#if selectedTransaction.donor.image}
                          <img
                            src={selectedTransaction.donor.image}
                            alt="Donor Image"
                            class="img-fluid rounded-circle"
                          />
                        {:else}
                          <p>No Image Available</p>
                        {/if}
                      </div>
                      <div class="col-md-8">
                        <!-- Donor Information -->
                        <p><strong>Name:</strong> {selectedTransaction.donor.firstName} {selectedTransaction.donor.lastName}</p>
                        <p><strong>Blood Type:</strong> {selectedTransaction.donor.bloodType}</p>
                        <p><strong>Birthdate:</strong> {new Date(selectedTransaction.donor.birthdate).toLocaleDateString()}</p>
                        <p><strong>Age:</strong> {calculateAge(selectedTransaction.donor.birthdate)}</p>
                        <p><strong>Donation Date:</strong> {new Date(selectedTransaction.donor.donationDate).toLocaleDateString()}</p>
                        <p><strong>Expiration Date:</strong> {new Date(selectedTransaction.donor.expirationDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {selectedTransaction.donor.status}</p>
                      </div>
                    </div>

                    <!-- Requestor Details (Only for Blood Out) -->
                    {#if selectedTransaction.transactionType === 'Blood Out'}
                      <hr />
                      <h6>Requestor Details</h6>
                      <div class="row">
                        <div class="col-md-4 text-center">
                          <!-- Requestor Image -->
                          {#if selectedTransaction.requestor.image}
                            <img
                              src={selectedTransaction.requestor.image}
                              alt="Requestor Image"
                              class="img-fluid rounded-circle"
                            />
                          {:else}
                            <p>No Image Available</p>
                          {/if}
                        </div>
                        <div class="col-md-8">
                          <!-- Requestor Information -->
                          <p><strong>Name:</strong> {selectedTransaction.requestor.firstName} {selectedTransaction.requestor.lastName}</p>
                          <p><strong>Blood Type:</strong> {selectedTransaction.requestor.bloodType}</p>
                          <p><strong>Birthdate:</strong> {new Date(selectedTransaction.requestor.birthdate).toLocaleDateString()}</p>
                          <p><strong>Age:</strong> {calculateAge(selectedTransaction.requestor.birthdate)}</p>
                          <p><strong>Requested Date:</strong> {new Date(selectedTransaction.requestedDate).toLocaleDateString()}</p>
                          <p><strong>Reason of Request:</strong> {selectedTransaction.reasonOfRequest || 'Not specified'}</p>
                          <p><strong>Status:</strong> {selectedTransaction.status}</p>
                        </div>
                      </div>
                    {/if}
                  </div>
                  <div class="modal-footer">
                    <button
                      type="button"
                      class="btn btn-danger"
                      on:click={() => (showModal = false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-backdrop show"></div>
          {/if}
        </div>
      </div>
    </main>
  </body>
  