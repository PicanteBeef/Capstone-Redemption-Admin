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
    }
  });
</script>

<head>
  <!-- Bootstrap styles and other dependencies -->
  <!-- ... (unchanged) ... -->
  <style>
      body {
          background-color: #f8f9fa;
      }

      main {
          padding: 20px;
      }

      #blood-inventory {
          background-color: #fff;
          border: 2px solid #dc3545;
          border-radius: 10px;
      }

      .card-header {
          background-color: #dc3545;
          color: #fff;
      }

      .btn-primary {
          background-color: #dc3545;
          border-color: #dc3545;
      }

      .btn-primary:hover {
          background-color: #c82333;
          border-color: #bd2130;
      }

      table {
          margin-top: 20px;
      }

      th,
      td {
          background-color: #f8f9fa;
      }

      tfoot {
          background-color: #dc3545;
          color: #fff;
      }

      button.btn-danger {
          background-color: #dc3545;
          border-color: #dc3545;
      }

      button.btn-danger:hover {
          background-color: #c82333;
          border-color: #bd2130;
      }

      /* Form styles */
      form {
          margin-top: 20px;
          background-color: #fff;
          padding: 20px;
          border: 2px solid #dc3545;
          border-radius: 10px;
      }

      form label {
          color: #dc3545;
          font-weight: bold;
      }

      form .form-control {
          border-color: #dc3545;
      }

      form .form-control:focus {
          border-color: #bd2130;
      }

      form .btn-primary {
          background-color: #dc3545;
          border-color: #dc3545;
      }

      form .btn-primary:hover {
          background-color: #c82333;
          border-color: #bd2130;
      }
  </style>
</head>

<body class="fixed-nav bg-dark sticky-footer" id="page-top">
  <!-- Navigation -->
  <!-- ... (unchanged) ... -->

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

            <button type="submit" class="btn btn-primary">Submit</button>
          </form>
          <!-- End Form Section -->

          <!-- Table Section -->
          <div class="table-responsive">
            <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
              <thead>
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
    </div>
  </main>
</body>
