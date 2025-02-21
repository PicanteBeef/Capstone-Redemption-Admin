<script>
    import { createClient } from 'contentful-management';
    
    // Initialize Contentful Client
    const contentfulClient = createClient({
      accessToken: import.meta.env.VITE_CONTENTFUL_MANAGEMENT_TOKEN, // Replace with your Content Management API Token
    });
    
    // Form data state
    let formData = {
      title: '',
      dialogue: '',
      imageID: '', // Change to store asset ID
      link: '',
      postDate: ''
    };
    
// Handle image upload from device
async function handleImageUpload(event) {
    const file = event.target.files[0];

    // Ensure a file is selected
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    try {
        console.log('Selected file:', file); // Debug: Log the file to check its details

        const space = await contentfulClient.getSpace(import.meta.env.VITE_CONTENTFUL_SPACE_ID); // Replace with your Contentful Space ID
        const environment = await space.getEnvironment('master');

        // 1. Upload the image to Contentful
        const upload = await environment.createUpload({
            file: file,
        });

        const uploadId = upload.sys.id;
        console.log('Upload ID:', uploadId); // Debug: Log the upload ID

        // 2. Create the Asset using the Upload ID
        const asset = await environment.createAsset({
            fields: {
                title: { 'en-US': file.name },
                file: {
                    'en-US': {
                        contentType: file.type,
                        fileName: file.name,
                        uploadFrom: {
                            sys: { type: 'Link', linkType: 'Upload', id: uploadId },
                        },
                    }
                }
            }
        });

        // 3. Process the asset for all locales
        await asset.processForAllLocales();

        // 4. Refetch the asset to get the updated version
        const updatedAsset = await environment.getAsset(asset.sys.id);

        // 5. Publish the updated asset
        const publishedAsset = await updatedAsset.publish();

        // Use the asset ID
        formData.imageID = publishedAsset.sys.id; // Store ID here
        console.log('Uploaded image asset ID:', formData.imageID); // Debug: Log the asset ID

        alert('Image uploaded and published successfully!');
    } catch (error) {
        console.error('Error uploading image:', error); // More descriptive error logging
        alert('There was an error uploading the image. See console for details.');
    }
}

    // Handle form submission
    async function handleSubmit(event) {
        event.preventDefault();

        try {
            // Access the space
            const space = await contentfulClient.getSpace('g4027mkrwnn3');

            // Access the environment (default)
            const environment = await space.getEnvironment('master');

            // 4. Create a new entry in Contentful using the published asset ID
            const entry = await environment.createEntry('testing', {
                fields: {
                    text: {
                        'en-US': formData.title,
                    },
                    dialogue: {
                        'en-US': formData.dialogue,
                    },
                    photo: {
                        'en-US': {
                            sys: {
                                id: formData.imageID,
                                linkType: 'Asset',
                                type: 'Link'
                            }
                        }
                    },
                    link: {
                        'en-US': formData.link,
                    },
                    postDate: {
                        'en-US': new Date().toISOString()
                    }
                },
            });

            // Publish the entry
            await entry.publish();

            alert('Newsletter submitted and published successfully!');

            // Reset form data after submission
            formData = {
                title: '',
                dialogue: '',
                imageID: '',
                link: '',
                postDate: ''
            };

        } catch (error) {
            console.error('Error submitting to Contentful:', error);
            alert('There was an error submitting the form. Please try again.');
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
        <div class="content-wrapper d-flex justify-content-center" style="margin-top: 5rem;">
          <!-- Contentful Submission Card -->
          <div class="card" style="max-width: 600px; width: 100%;">
            <div class="card-header text-danger">
              <i class="fa fa-newspaper" /> Newsletter Submission
            </div>
      
            <div class="card-body">
              <!-- Form Section -->
              <form on:submit={handleSubmit} class="row g-3">
                <div class="mb-3">
                  <label for="title" class="form-label">Title</label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    bind:value={formData.title}
                    required
                  />
                </div>
      
                <div class="mb-3">
                  <label for="dialogue" class="form-label">Dialogue</label>
                  <textarea
                    class="form-control"
                    id="dialogue"
                    bind:value={formData.dialogue}
                    rows="4"
                    required
                  ></textarea>
                </div>
      
                <div class="mb-3">
                  <label for="imageUpload" class="form-label">Upload Image</label>
                  <input
                    type="file"
                    class="form-control"
                    id="imageUpload"
                    accept="image/*"
                    on:change={handleImageUpload}
                  />
                </div>
      
                <div class="mb-3">
                  <label for="link" class="form-label">Link</label>
                  <input
                    type="url"
                    class="form-control"
                    id="link"
                    bind:value={formData.link}
                  />
                </div>
      
                <!-- Submit Button -->
                <div class="d-grid">
                  <button type="submit" class="btn btn-danger">Submit</button>
                </div>
              </form>
              <!-- End Form Section -->
            </div>
          </div>
        </div>
      </main>
      
  </body>
  