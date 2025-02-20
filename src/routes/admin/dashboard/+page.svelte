<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { supabase } from "/src/lib/supabaseClient.js";
  import moment from "moment";
  import { browser } from '$app/environment';
  import Chart from "chart.js/auto";

  const authLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
    } else {
      console.log("Logged out");
      goto("/");
      alert("You have been logged out.");
      // Redirect or perform other actions after successful logout
    }
  };

  let data = [];
  let totalSum = [];
  let bloodTypeArray = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  let donors = [];
  let bloodInventoryData = [];
  let bloodStockData = [];
  let myChart;
  let isLoading = true;
  let searchCategory = 'text';

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

  // Update the bar chart dynamically
  function updateBarChart(bloodTypeCounts) {
    if (!myChart) {
      console.error("Chart not initialized.");
      return;
    }

    // Update the chart data
    myChart.data.datasets[0].data = [
      bloodTypeCounts.A_POS,
      bloodTypeCounts.A_NEG,
      bloodTypeCounts.B_POS,
      bloodTypeCounts.B_NEG,
      bloodTypeCounts.AB_POS,
      bloodTypeCounts.AB_NEG,
      bloodTypeCounts.O_POS,
      bloodTypeCounts.O_NEG
    ];

    // Re-render the chart
    console.log('Updating Bar Chart with Counts:', bloodTypeCounts);
    myChart.update();
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

        // Initialize the chart
        initializeBarChart(bloodTypeCounts);
        console.log('Calculated Blood Type Counts:', bloodTypeCounts);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred while loading donor data.');
    }
  });

  //Sorting
  let sortField = null; // Tracks the current field being sorted
  let sortOrder = 'asc'; // Tracks the current sort order ('asc' or 'desc')
  let filteredDonors = donors; // Holds the filtered list of donors
  let searchQuery = ''; // Holds the search input value

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

    // Sort the donors array
    donors = [...donors].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle date fields
      if (['birthdate', 'donationDate', 'expirationDate'].includes(sortField)) {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      // Case-insensitive sorting for text fields
      if (['firstName', 'lastName', 'bloodType', 'status'].includes(sortField)) {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      // Compare values
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  //Search Function
  function handleSearch() {
    console.log('Search query:', searchQuery); // Debugging log

    const isValidDate = (dateString) => {
      if (!dateString || typeof dateString !== 'string') return false;
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    };

    filteredDonors = donors.filter(donor => {
      const matchesText =
        donor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.status.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate =
        isValidDate(searchQuery) &&
        (
          new Date(donor.birthdate).toDateString() === new Date(searchQuery).toDateString() ||
          new Date(donor.donationDate).toDateString() === new Date(searchQuery).toDateString() ||
          new Date(donor.expirationDate).toDateString() === new Date(searchQuery).toDateString()
        );

      console.log('Matches for donor:', donor.id, matchesText || matchesDate); // Debugging log
      return matchesText || matchesDate;
    });

    console.log('Filtered donors:', filteredDonors); // Debugging log
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
      filteredDonors = donors; // Show all donors if search query is empty
    } else {
      filteredDonors = donors.filter(donor => {
        if (searchCategory === 'text') {
          // Text-based matching
          return (
            donor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            donor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else if (['birthdate', 'donationDate', 'expirationDate'].includes(searchCategory)) {
          // Date-based matching
          const donorDate = new Date(donor[searchCategory]);

          if (isValidDate(searchQuery)) {
            const normalizedQuery = normalizeDate(searchQuery); // Normalize the query
            const parts = normalizedQuery.split('/');
            if (parts.length === 2) {
              // Partial date match (e.g., "01/05")
              const [month, day] = parts.map(Number);
              const queryDate = new Date(2000, month - 1, day); // Use a dummy year
              return matchesPartialDate(donorDate, queryDate);
            } else {
              // Full date match (e.g., "01/05/1999")
              const queryDate = new Date(normalizedQuery);
              return donorDate.toDateString() === queryDate.toDateString();
            }
          }
        }
        return false;
      });
    }

    console.log('Search Query:', searchQuery);
    console.log('Search Category:', searchCategory);
    console.log('Filtered Donors:', filteredDonors);
  }


  console.log(totalSum);

  //Donation List
  let selectedDonor = null;  // <-- Initialize as null
  let selectedPhase = "";
  let phaseModalOpen = false;
  let showModal = false;
  let selectedDonorId = null; // Track by ID instead of object
  let modalNode;

  onMount(() => {
    if (browser) {
      // Add event listeners for navigation links
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
          console.log('Navigation link clicked:', event.target.href);
        });
      });

      // Initialize handleClickOutside
      const closeModal = () => {
        console.log('Closing modal...');
        phaseModalOpen = false; // Close the modal
      };

      // Exclude navigation links from handleClickOutside
      const navLinks = document.querySelectorAll('.nav-link');
      const exclusions = Array.from(navLinks);

      // Ensure modalNode is defined before initializing handleClickOutside
      if (modalNode) {
        const destroyHandleClickOutside = handleClickOutside(modalNode, closeModal, exclusions);

        return () => {
          if (destroyHandleClickOutside && typeof destroyHandleClickOutside.destroy === 'function') {
            destroyHandleClickOutside.destroy();
          }
        };
      }

      // Handle window unload event
      window.addEventListener('beforeunload', () => {
        phaseModalOpen = false; // Reset modal state
      });
    }
  });

  // Handle clicks outside the modal
  function handleClickOutside(node, callback, exclusions = []) {
    if (!browser) return; // Ensure this runs only on the client side

    const handleClick = (event) => {
      if (
        node &&
        !node.contains(event.target) && // Click is outside the dropdown
        !exclusions.some(exclusion => exclusion.contains(event.target)) && // Click is not in excluded elements
        !event.defaultPrevented
      ) {
        callback();
      }
    };

    document.addEventListener('click', handleClick, true);
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  // Initialize new donor object
  let newDonor = {
    firstName: '',
    lastName: '',
    bloodType: '',
    birthdate: '',
    image: '',
    phases: {
      history: { status: 'pending', responses: {} },
      laboratory: { status: 'pending', responses: {} },
      processing: { status: 'pending', responses: {} },
      screening: { status: 'pending', responses: {} }
    }
  };

  // Define questions for each phase
  const questionnaire = {
    history: [
      { type: 'text', label: 'Have you ever been diagnosed with a blood disorder?', name: 'blood_disorder' },
      {
        type: 'checkbox',
        label: 'Do you have any allergies?',
        name: 'allergies',
        followUp: {
          type: 'text',
          label: 'If yes, please specify:',
          name: 'allergy_details'
        }
      }
    ],
    laboratory: [
      { type: 'text', label: 'Hemoglobin Count:', name: 'lab_hemoglobin' },
      { type: 'text', label: 'Platelet Count:', name: 'lab_platelet' }
    ],
    processing: [
      { type: 'radio', label: 'HIV-1:', name: 'hiv1', options: ['Positive', 'Negative'] },
      { type: 'radio', label: 'HIV-2:', name: 'hiv2', options: ['Positive', 'Negative'] },
      { type: 'radio', label: 'Hepatitis B:', name: 'hepatitis_b', options: ['Positive', 'Negative'] },
      { type: 'radio', label: 'Hepatitis C:', name: 'hepatitis_c', options: ['Positive', 'Negative'] },
      { type: 'radio', label: 'Syphilis:', name: 'syphilis', options: ['Positive', 'Negative'] }
    ],
    screening: [
      {
        type: 'checkbox',
        label: 'I confirm that all sensitive information has been reviewed and approved.',
        name: 'medical_clearance'
      },
      {
        type: 'text',
        label: 'Any additional notes or remarks:',
        name: 'notes'
      }
    ]
  };

  // Reactive state for user responses
  let responses = {};
  // Make selectedDonor reactive
  $: selectedDonor = donors.find(donor => donor.id === selectedDonorId);
  console.log('Reactive Selected Donor:', selectedDonor); // Debugging

  // Handle input changes
  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;

    if (type === 'checkbox') {
      responses[name] = checked; // Save checkbox state
    } else if (!isNaN(value) && value.trim() !== '') {
      responses[name] = parseFloat(value); // Parse numeric inputs
    } else {
      responses[name] = value; // Save text inputs as-is
    }

    console.log('Updated Responses:', responses); // Debugging
  }

  // Open questionnaire modal and pre-fill responses
  function openQuestionnaire(phaseName) {
    selectedPhase = phaseName;
    responses = { ...selectedDonor.phases[selectedPhase].responses }; // Pre-fill responses
    phaseModalOpen = true;
  }

  // Update phase status and save responses
  function updatePhaseStatus(status, donorId) {
    console.log('Updating Phase Status - Donor ID:', donorId);

    if (!donorId) {
      console.error('Error: Donor ID is undefined in updatePhaseStatus.');
      alert('Failed to update phase status. Please select a donor.');
      return;
    }

    const donor = donors.find(d => d.id === donorId);
    if (!donor || !selectedPhase) {
      console.error('Error: Selected donor or phase is undefined.');
      alert('Failed to update phase status. Please select a donor and phase.');
      return;
    }

    // Ensure Screening phase cannot be completed unless prior phases are completed
    if (selectedPhase === 'screening') {
      const priorPhasesCompleted = ['history', 'laboratory', 'processing'].every(
        phase => donor.phases[phase].status === 'completed'
      );
      if (!priorPhasesCompleted && status === 'completed') {
        alert('Cannot complete Screening phase until all prior phases are completed.');
        return;
      }
    }

    // Synchronize responses with the donor's phase data
    donor.phases[selectedPhase].responses = { ...responses };
    donor.phases[selectedPhase].status = status;

    // Trigger reactivity by reassigning the `donors` array
    donors = donors.map(d =>
      d.id === donorId ? { ...d, phases: { ...d.phases } } : d
    );

    // Save all phases to the database
    saveToDatabase(donorId, donor.phases[selectedPhase].responses);

    // Reset responses only if the phase is denied
    if (status === 'denied') {
      responses = {}; // Clear responses for a fresh start
    }

    phaseModalOpen = false; // Close the modal
  }

  // Validate phase responses
  function validatePhase(phaseName, donor) {
    const phaseData = donor.phases[phaseName];

    // Check if all prior phases are completed
    const phaseOrder = ['history', 'laboratory', 'processing', 'screening'];
    const currentIndex = phaseOrder.indexOf(phaseName);

    // Ensure all prior phases are completed
    for (let i = 0; i < currentIndex; i++) {
      const priorPhase = phaseOrder[i];
      if (donor.phases[priorPhase].status !== 'completed') {
        return {
          valid: false,
          message: `Cannot complete ${phaseName} because ${priorPhase} is not completed.`
        };
      }
    }

    // Validate the current phase
    switch (phaseName) {
      case 'history':
        const historyResponses = phaseData.responses;

        // Ensure all required questions are answered
        const missingQuestions = questionnaire.history.filter(question => {
          const response = historyResponses[question.name];
          if (question.type === 'checkbox') {
            return response === undefined;
          }
          return response === undefined || response === '';
        });

        if (missingQuestions.length > 0) {
          return {
            valid: false,
            message: `Cannot complete History phase. All questions must be filled.`
          };
        }
        return { valid: true };

      case 'laboratory':
        // Ensure hemoglobin and platelet counts are within acceptable ranges
        const hemoglobin = parseFloat(phaseData.responses.lab_hemoglobin || '');
        const platelet = parseFloat(phaseData.responses.lab_platelet || '');

        if (isNaN(hemoglobin) || hemoglobin < 12.5) {
          return {
            valid: false,
            message: 'Cannot complete Laboratory phase. Hemoglobin level criteria not met.'
          };
        }
        if (isNaN(platelet) || platelet <= 0) {
          return {
            valid: false,
            message: 'Cannot complete Laboratory phase. Platelet count criteria not met.'
          };
        }
        return { valid: true };

      case 'processing':
        // Ensure all TTIs are negative
        const processingResponses = phaseData.responses;

        if (
          processingResponses.hiv1 !== 'Negative' ||
          processingResponses.hiv2 !== 'Negative' ||
          processingResponses.hepatitis_b !== 'Negative' ||
          processingResponses.hepatitis_c !== 'Negative' ||
          processingResponses.syphilis !== 'Negative'
        ) {
          return {
            valid: false,
            message: 'Cannot complete Processing phase. All TTIs must be Negative.'
          };
        }
        return { valid: true };

      case 'screening':
        // Ensure donor consent and medical clearance are confirmed
        if (phaseData.responses.medical_clearance !== true) {
          return {
            valid: false,
            message: 'Cannot complete Screening phase. Medical clearance must be confirmed.'
          };
        }
        return { valid: true };

      default:
        return { valid: false, message: 'Unknown phase.' };
    }
  }

  // Check if all phases are completed
  function areAllPhasesCompleted(donor) {
    return Object.values(donor.phases).every(phase => phase.status === 'completed');
  }

  //toggle dropdown
  function toggleDropdown(donorId) {
    if (selectedDonorId === donorId) {
      selectedDonorId = null; // Close the dropdown if already open
    } else {
      selectedDonorId = donorId; // Open the dropdown for the selected donor
    }
    console.log('Toggled Dropdown - Selected Donor ID:', selectedDonorId); // Debugging
  }

  // Handle image upload
  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newDonor.imagePreview = e.target.result;
        newDonor.image = e.target.result; // Store as base64 for demo
      };
      reader.readAsDataURL(file);
    }
  }

  async function addDonor() {
    // Validate blood type
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodTypes.includes(newDonor.bloodType)) {
      alert('Invalid blood type. Please select a valid blood type.');
      return;
    }

    try {
      // Prepare Donor Data
      const donationDate = new Date().toISOString(); // Current timestamp
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 42); // Add 42 days

      const donorData = {
        id: crypto.randomUUID(),
        dp_donor_id: crypto.randomUUID(), // Generate a unique ID
        dp_first_name: newDonor.firstName,
        dp_last_name: newDonor.lastName,
        dp_blood_type: newDonor.bloodType,
        dp_birthdate: newDonor.birthdate,
        dp_profile_image: newDonor.image || null,
        dp_history_responses: {},
        dp_laboratory_responses: {},
        dp_processing_responses: {},
        dp_screening_responses: {},
        dp_status: 'pending',
        dp_donation_date: donationDate, // Set donation date
        dp_expiration_date: expirationDate.toISOString() // Calculate expiration date
      };

      console.log('Saving donor data:', donorData); // Debugging
      

      // Insert donor data into the `donations_processing` table
      const { error } = await supabase
        .from('donations_processing')
        .insert([donorData]);

      if (error) {
        console.error('Error adding donor:', error);
        alert('Failed to add donor.');
        return;
      }

      console.log('Donor added successfully.');

      // Map the new donor data to the local structure
      const mappedDonor = mapDonorData(donorData);

      // Append the new donor to the `donors` array
      donors = [...donors, mappedDonor]; // Use spread operator to append
      console.log('Updated Donors Array:', donors);

      // Select the newly added donor
      selectDonor(mappedDonor.id);

      // Recalculate blood type counts and update the chart
      const bloodTypeCounts = calculateBloodTypeCounts(donors);
      console.log('Calculated Blood Type Counts:', bloodTypeCounts);
      updateBarChart(bloodTypeCounts);

      // Reset form
      newDonor = {
        firstName: '',
        lastName: '',
        bloodType: '',
        birthdate: '',
        image: '',
        phases: {
          history: { status: 'pending', responses: {} },
          laboratory: { status: 'pending', responses: {} },
          processing: { status: 'pending', responses: {} },
          screening: { status: 'pending', responses: {} }
        }
      };

      selectedDonorId = null; // Close the dropdown
      showModal = false; // Close the modal
      alert('Donor added successfully!');
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  }
  $: console.log('Donors Array Updated:', donors);


// Helper function to select a donor
function selectDonor(donorId) {
    selectedDonorId = donorId;
    console.log('Selected Donor:', selectedDonorId); // Debugging
  }

  // Check if all TTIs are negative
  function areAllTTIsNegative(donor) {
    const processingResponses = donor.phases.processing.responses;
    console.log('Processing Responses:', processingResponses); // Debugging
    return (
      processingResponses.hiv1 === 'Negative' &&
      processingResponses.hiv2 === 'Negative' &&
      processingResponses.hepatitis_b === 'Negative' &&
      processingResponses.hepatitis_c === 'Negative' &&
      processingResponses.syphilis === 'Negative'
    );
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

  async function saveToDatabase(donorId, screeningResponses) {
    try {
      const donor = donors.find(d => d.id === donorId);
      if (!donor) {
        console.error('Error: Donor not found in saveToDatabase.');
        alert('Failed to save donor data. Please select a valid donor.');
        return;
      }

      // Check if all phases are completed
      const allPhasesCompleted = Object.values(donor.phases).every(
        phase => phase.status === 'completed'
      );

      // Prepare the data to save
      const updatedData = {
        dp_history_responses: donor.phases.history.responses,
        dp_laboratory_responses: donor.phases.laboratory.responses,
        dp_processing_responses: donor.phases.processing.responses,
        dp_screening_responses: screeningResponses,
        dp_status: allPhasesCompleted ? 'available' : 'pending'// Update status only if all phases are completed
      };

      console.log('Saving to Database - Updated Data:', updatedData);

      // Update the donor record in Supabase
      const { error } = await supabase
        .from('donations_processing')
        .update(updatedData)
        .eq('id', donorId);

      if (error) {
        console.error('Error saving to database:', error);
        alert('Failed to save donor data to the database. Please check the donor ID and try again.');
      } else {
        console.log('Donor data saved successfully to the database.');

        console.log('Before updating donors array:', donors);
        // Update the local `donors` array reactively
        donors = donors.map(d =>
          d.id === donorId ? { ...d, ...updatedData, status: updatedData.dp_status } : d
        );
        console.log('After updating donors array:', donors);

        // Recalculate blood type counts and update the chart ONLY if status is 'available'
        if (allPhasesCompleted) {
          const bloodTypeCounts = calculateBloodTypeCounts(donors);
          console.log('Calculated Blood Type Counts:', bloodTypeCounts);
          updateBarChart(bloodTypeCounts);
        }

        console.log('Donor Data:', donor);
        if (!donor.dp_donor_id) {
          console.error('Error: dp_donor_id is missing for donor:', donor);
          alert('Failed to log transaction. Missing donor reference ID.');
          return;
        }

        // Log the transaction if the donor's status is now "available"
        if (allPhasesCompleted) {
          const transactionData = {
            reference_id: donor.dp_donor_id, // Reference to the donor
            blood_type: donor.bloodType || donor.dp_blood_type, // Blood type of the donation
            donation_date: donor.donationDate, // Initial donation date
            transaction_date: new Date().toISOString(), // Current timestamp (when blood enters inventory)
            expiration_date: donor.expirationDate, // Expiration date of the blood unit
            transaction_type: 'Blood In' // Default transaction type
          };

          console.log('Attempting to log transaction for donor:', donor);
          console.log('Donor Blood Type:', donor.bloodType || donor.dp_blood_type);
          // Insert the transaction into the `transactions_processing` table
          const { error: transactionError } = await supabase
            .from('transactions_processing')
            .insert([transactionData]);

          if (transactionError) {
            console.error('Error logging transaction:', transactionError);
            alert('Failed to log the transaction. Please try again.');
          } else {
            console.log('Transaction logged successfully:', transactionData);
          }
        }

        // Update the selected donor reactively
        selectedDonor = { ...donors.find(d => d.id === donorId) };
        console.log('Updated Selected Donor:', selectedDonor);

        alert('Donor data saved successfully!');
      }
    } catch (error) {
      console.error('Error in saveToDatabase:', error);
      alert('An unexpected error occurred while saving donor data.');
    }
  }

  $: {
    console.log('Reactively updating donors array:', donors);``
  }

  $: {
    if (selectedDonor) {
      console.log('Reactively updating selectedDonor:', selectedDonor);
    }
  }

  $: {
    const bloodTypeCounts = calculateBloodTypeCounts(donors);
    console.log('Updating chart with counts:', bloodTypeCounts);
    updateBarChart(bloodTypeCounts);
  }
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


    <!--Charts.js Library-->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
      html {
        scroll-behavior: smooth;
      }

      main {
        animation: fadeIn 0.5s;
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

      /* Ensure the card body doesn't overflow */
      .card-body {
        overflow: hidden;
      }

      .donor-image {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
      }

      .donor-image:hover {
        cursor: pointer;
      }

      .no-image {
        width: 50px;
        height: 50px;
        background: #ddd;
        border-radius: 50%;
        text-align: center;
        line-height: 50px;
      }

      .modal {
        background: rgba(0,0,0,0.5);
      }

      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .phase-modal-container {
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow: auto;
      }

      .phase-modal-content {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }

      .phase-button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .phase-button.pending {
        background-color: yellow;
        color: black;
      }

      .phase-button.completed {
        background-color: green;
        color: white;
      }

      .phase-button.denied {
        background-color: red;
        color: white;
      }

      tr:hover {
        background-color: #f5f5f5;
        cursor: pointer;
      }

      th:hover {
        background-color: #fcd1c7;
        cursor: pointer;
      }

      th.selected {
        background-color: #fab9aa;
        font-weight: bold;
      }

      button.btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
      }

      .dropdown-row {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-in-out;
      }

      .dropdown-row.open {
        max-height: 500px;
      }

      .clickable {
        cursor: pointer;
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
      <nav
        class="navbar navbar-expand-md navbar-dark fixed-top bg-danger w-100"
      >
        <div class="container-fluid">
          <a
            class="navbar-brand"
            href="/admin/dashboard"
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
      <!--Main Content-->
      <div class="content-wrapper" style="margin-top: 5rem;">
        <!--Dashboard-->
        <div class="container mt-5">
          <div class="row justify-content-center">
            <!-- Blood Inventory Card -->
            <div class="col-lg-10 col-md-12">
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
          </div>
        </div>
        <!-- Donations Processing -->
        <div>
          <!-- Modal -->
          {#if showModal}
          <div class="modal fade show d-block" tabindex="-1">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Add New Donor</h5>
                  <button type="button" class="btn-close" on:click={() => showModal = false}></button>
                </div>
                <div class="modal-body">
                  <form on:submit|preventDefault={addDonor}>
                    <div class="mb-3">
                      <label class="form-label">First Name</label>
                      <input type="text" class="form-control" bind:value={newDonor.firstName} required>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Last Name</label>
                      <input type="text" class="form-control" bind:value={newDonor.lastName} required>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Blood Type</label>
                      <select class="form-select" bind:value={newDonor.bloodType}>
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
                      <label class="form-label">Birthdate</label>
                      <input type="date" class="form-control" bind:value={newDonor.birthdate} required>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Upload Image</label>
                      <input type="file" class="form-control" accept="image/*" on:change={handleImageUpload}>
                      {#if newDonor.imagePreview}
                        <img src={newDonor.imagePreview} class="img-thumbnail mt-2" width="100">
                      {/if}
                    </div>
                    <button type="submit" class="btn btn-primary">Save Donor</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/if}

          <div class="row m-3">
            <div class="card mb-3 col mx-1">
              <div class="card-header text-danger">
                <i class="fa fa-bar-chart" /> Donor Dashboard
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="table-responsive col my-auto">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <!-- Add Donor Button -->
                      <div>
                        <button class="btn btn-danger" on:click={() => showModal = true}>
                          <i class="fa fa-plus" /> Add Donor
                        </button>
                      </div>

                      <!-- Search Bar and Dropdown -->
                      <div class="search-bar d-flex gap-2">
                        <input
                          type="text"
                          placeholder="Search..."
                          bind:value={searchQuery}
                          on:input={handleSearch}
                          class="form-control"
                        />

                        <select bind:value={searchCategory} class="form-select">
                          <option value="text">Text</option>
                          <option value="birthdate">Birthdate</option>
                          <option value="donationDate">Donation Date</option>
                          <option value="expirationDate">Expiration Date</option>
                        </select>
                      </div>
                    </div>
                    <table class="table table-bordered" width="100%" cellspacing="0">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th on:click={() => sortTable('firstName')} class:selected={sortField === 'firstName'}>
                            First Name
                            {#if sortField === 'firstName'}
                              {sortOrder === 'asc' ? '▲' : '▼'}
                            {/if}
                          </th>
                          <th on:click={() => sortTable('lastName')} class:selected={sortField === 'lastName'}>
                            Last Name
                            {#if sortField === 'lastName'}
                              {sortOrder === 'asc' ? '▲' : '▼'}
                            {/if}
                          </th>
                          <th on:click={() => sortTable('bloodType')} class:selected={sortField === 'bloodType'}>
                            Blood Type
                            {#if sortField === 'bloodType'}
                              {sortOrder === 'asc' ? '▲' : '▼'}
                            {/if}
                          </th>
                          <th on:click={() => sortTable('birthdate')} class:selected={sortField === 'birthdate'}>
                            Birthdate
                            {#if sortField === 'birthdate'}
                              {sortOrder === 'asc' ? '▲' : '▼'}
                            {/if}
                          </th>
                          <th on:click={() => sortTable('donationDate')} class:selected={sortField === 'donationDate'}>
                            Donation Date
                            {#if sortField === 'donationDate'}
                              {sortOrder === 'asc' ? '▲' : '▼'}
                            {/if}
                          </th>
                          <th on:click={() => sortTable('expirationDate')} class:selected={sortField === 'expirationDate'}>
                            Expiration Date
                            {#if sortField === 'expirationDate'}
                              {sortOrder === 'asc' ? '▲' : '▼'}
                            {/if}
                          </th>
                          <th on:click={() => sortTable('status')} class:selected={sortField === 'status'}>
                            Status
                            {#if sortField === 'status'}
                              {sortOrder === 'asc' ? '▲' : '▼'}
                            {/if}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {#if filteredDonors.length === 0}
                          <tr>
                            <td colspan="8">No donors found.</td>
                          </tr>
                        {:else}
                          {#each filteredDonors as donor (donor.id)}
                            <!-- Main Donor Row -->
                            <tr>
                              <td>
                                <div class="position-relative">
                                  {#if donor.image}
                                    <img 
                                      src={donor.image} 
                                      class="donor-image clickable" 
                                      alt="Donor"
                                      on:click={() => toggleDropdown(donor.id)}
                                    >
                                  {:else}
                                    <div 
                                      class="no-image clickable" 
                                      on:click={() => toggleDropdown(donor.id)}
                                    >
                                      No Image
                                    </div>
                                  {/if}
                                </div>
                              </td>
                              <td>{donor.firstName}</td>
                              <td>{donor.lastName}</td>
                              <td>{donor.bloodType}</td>
                              <td>{new Date(donor.birthdate).toLocaleDateString()}</td>
                              <td>{new Date(donor.donationDate).toLocaleDateString()}</td>
                              <td>{new Date(donor.expirationDate).toLocaleDateString()}</td>
                              <td>
                                {#if donor.status === 'pending'}
                                  <span style="color: yellow;">Pending</span>
                                {:else if donor.status === 'available'}
                                  <span style="color: green;">Available</span>
                                {/if}
                              </td>
                            </tr>
                      
                            <!-- Dropdown Row -->
                            {#if selectedDonorId === donor.id && selectedDonor}
                              <tr class="dropdown-row">
                                <td colspan="8">
                                  <div class="phase-dropdown">
                                    <table class="table table-bordered phase-table">
                                      <thead>
                                        <tr>
                                          <th colspan="4">Donation Phases</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td colspan="8">
                                            <div class="phase-dropdown d-flex justify-content-between gap-2 flex-wrap">
                                              {#each Object.entries(selectedDonor.phases) as [phaseName, phaseData]}
                                                <button
                                                  class={`btn ${
                                                    selectedDonor.status === 'available' ? 'btn-success' : 
                                                    phaseData.status === 'completed' ? 'btn-success' : 
                                                    phaseData.status === 'pending' ? 'btn-warning' : 
                                                    'btn-danger'
                                                  }`}
                                                  on:click={() => openQuestionnaire(phaseName)}
                                                >
                                                  {phaseName.toUpperCase()}
                                                </button>
                                              {/each}
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            {:else if selectedDonorId === donor.id && !selectedDonor}
                              <tr>
                                <td colspan="5">
                                  <p>No donor found with the selected ID.</p>
                                </td>
                              </tr>
                            {/if}
                          {/each}
                        {/if}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Questionnaire Modal -->
          {#if phaseModalOpen && selectedDonor && selectedPhase}
            <div bind:this={modalNode} class="modal fade show d-block" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">{selectedPhase.toUpperCase()} Questionnaire</h5>
                    <button type="button" class="btn-close" on:click={() => phaseModalOpen = false}></button>
                  </div>
                  <div class="modal-body">
                    <form>
                      {#if selectedPhase === 'screening'}
                        <!-- Donor Summarry -->
                        <div class="mb-4">
                          <h5>Donor Summary</h5>
                          <p><strong>Name:</strong> {selectedDonor.firstName} {selectedDonor.lastName}</p>
                          <p><strong>Blood Type:</strong> {selectedDonor.bloodType}</p>
                          <p><strong>Age:</strong> {calculateAge(selectedDonor.birthdate)} years</p>
                          <p><strong>Hemoglobin Level:</strong>
                            {#if selectedDonor.phases.laboratory.responses.lab_hemoglobin !== undefined}
                              {selectedDonor.phases.laboratory.responses.lab_hemoglobin}
                            {:else}
                              <span class="text-warning">Pending results.</span>
                            {/if}
                          </p>
                          <p><strong>TTI Results:</strong>
                            {#if areAllTTIsNegative(selectedDonor)}
                              <span class="text-success">All tests passed.</span>
                            {:else if Object.values(selectedDonor.phases.processing.responses).some(value => value === undefined)}
                              <span class="text-warning">Pending results.</span>
                            {:else}
                              <span class="text-danger">One or more tests failed.</span>
                            {/if}
                          </p>
                        </div>

                        <!-- Verification Checklist -->
                        <div class="mb-4">
                          <h5>Verification Checklist</h5>
                          <ul>
                            <li>Status of History: {selectedDonor.phases.history.status}</li>
                            <li>Status of Laboratory: {selectedDonor.phases.laboratory.status}</li>
                            <li>Status of Processing: {selectedDonor.phases.processing.status}</li>
                          </ul>
                        </div>

                        <!-- Sensitive Information (Abstracted) -->
                        <div class="mb-4">
                          <h5>Sensitive Information</h5>
                          <p>This section contains confidential medical data reviewed by authorized personnel.</p>
                          <div class="form-check">
                            <input
                              type="checkbox"
                              class="form-check-input"
                              name="medical_clearance"
                              checked={responses.medical_clearance || false}
                              on:change={(event) => handleInputChange(event)}
                            />
                            <label class="form-check-label">
                              I confirm that all sensitive information has been reviewed and approved.
                            </label>
                          </div>
                        </div>

                        <!-- Administrative Review -->
                        <div class="mb-4">
                          <h5>Administrative Review</h5>
                          <textarea
                            class="form-control"
                            placeholder="Additional Notes (if any)"
                            name="notes"
                            value={responses.notes || ''}
                            on:input={(event) => handleInputChange(event)}
                          ></textarea>
                        </div>
                      {:else}
                        {#each questionnaire[selectedPhase] as question}
                          <div class="mb-3">
                            <label class="form-label">{question.label}</label>
                            {#if question.type === 'text'}
                              <input
                                type="text"
                                class="form-control"
                                name={question.name}
                                value={responses[question.name] || ''}
                                on:input={handleInputChange}
                              />
                            {:else if question.type === 'checkbox'}
                              <input
                                type="checkbox"
                                name={question.name}
                                checked={responses[question.name] || false}
                                on:change={(event) => {
                                  handleInputChange(event);
                                  responses[question.name] = event.target.checked;
                                }}
                              />
                              <!-- Follow-up field -->
                              {#if responses[question.name] && question.followUp}
                                <div class="mt-2">
                                  <label class="form-label">{question.followUp.label}</label>
                                  {#if question.followUp.type === 'text'}
                                    <input
                                      type="text"
                                      class="form-control"
                                      name={question.followUp.name}
                                      value={responses[question.followUp.name] || ''}
                                      on:input={handleInputChange}
                                    />
                                  {/if}
                                </div>
                              {/if}
                            {:else if question.type === 'radio'}
                              {#each question.options as option}
                                <div class="form-check">
                                  <input
                                    type="radio"
                                    class="form-check-input"
                                    name={question.name}
                                    value={option}
                                    checked={responses[question.name] === option}
                                    on:change={handleInputChange}
                                  />
                                  <label class="form-check-label">{option}</label>
                                </div>
                              {/each}
                            {:else if question.type === 'select'}
                              <select class="form-select" name={question.name} on:change={handleInputChange}>
                                {#each question.options as option}
                                  <option value={option} selected={responses[question.name] === option}>{option}</option>
                                {/each}
                              </select>
                            {/if}
                          </div>
                        {/each}
                      {/if}
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button class="btn btn-danger" on:click={() => updatePhaseStatus('denied', selectedDonorId)}>Deny</button>
                    <button class="btn btn-success" on:click={() => updatePhaseStatus('completed', selectedDonorId)}>Proceed</button>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
        <!-- Scroll to Top Button-->
        <a class="scroll-to-top rounded" href="#page-top">
          <i class="fa fa-angle-up" />
        </a>
      </div>
    </main>
  </body>

  <script>
    //Donor Search onkeyup
    function searchDonor() {
      // Declare variables
      var input, filter, table, tr, td, i, txtValue;
      input = document.getElementById("myInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("donorTable");
      tr = table.getElementsByTagName("tr");

      // Loop through all table rows, and hide those who don't match the search query
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
          txtValue = td.textContent || td.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      }
    }
  </script>
</html>
