<script>
  import { onMount } from 'svelte';
  import supabase from '/src/lib/supabaseClient.js';

  let data = [];

  onMount(async () => {
      const { data: records, error } = await supabase
      .from('blood_inventory')
      .select('*')
      .order('entry_date', {ascending: false})
      .limit(10);
      
      if (error) {
          console.error('Error fetching data from Supabase:', error);
      } else {
          data = records;
      }
  });
</script>

<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">
  <title>B.D.M.S | Admin</title>

  <!-- Latest compiled and minified CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js"
  integrity="sha384-oesi62hOLfzrys4LxRF63OJCXdXDipiYWBnvTl9Y9/TRlw5xlKIEHpNyvvDShgf/"
  crossorigin="anonymous"></script>
  <link rel="stylesheet" href="transitions.css">

  <!-- Latest compiled JavaScript -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!--Latest complied Popperjs-->
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>

  <!--FontAwesome-->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <style>
    html{
      scroll-behavior: smooth;
    }

    main{
    animation: fadeIn 0.5s;
    }

  @keyframes fadeIn{
      from{
          opacity: 0;
          filter: blur(5px);
          transform: translateX(-5px);
        }
      to{
          opacity: 1;
          filter: blur(0);
          transform: translateX(0);
        }
    }


    .bd-placeholder-img {
      font-size: 1.125rem;
      text-anchor: middle;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .nav-hover {
      display: inline-block;
      padding-bottom:2px;
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
        <a class="navbar-brand" href="#home" style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;font-weight: bold;">B.D.M.S <i class="fa-solid fa-droplet"></i></a>
        
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse"
          aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarCollapse">
          <ul style="width: 100%;" class="navbar-nav mr-auto mb-2 mb-md-0 ">
            <li class="nav-item">
              <a class="nav-link nav-hover text-light" href="/admin/dashboard/newscontrol">News Control</a>
            </li>
            <li class="nav-item">
              <a class="nav-link nav-hover text-light" href="/admin/dashboard/inventory">Inventory</a>
            </li>
            <li class="nav-item">
              <a class="nav-link nav-hover text-light" href="/admin/dashboard/bloodrequests">Blood Requests</a>
            </li>
          </ul>
          <a href="/" style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;font-weight: bold;" class="btn btn-danger">Logout</a> 
        </div>         
      </div>

    </nav>
  </header>
  <main>
  <!--Main Content-->
  <div class="content-wrapper" style="margin-top: 5rem;">

    <!--Dashboard-->
    <div class="container text-center">
      <div class="row">

    <!--Bloodtype A Summary Card-->
        <div class="col-xl-3 col-sm-6 mb-3">
          <div class="card text-danger bg-light o-hidden">
            <button type="button" class="btn btn-sm m-1 text-danger bg-light" id="dropdown-a" data-bs-toggle="collapse" data-bs-target="#collapse-a" aria-expanded="false" aria-controls="collapse-a">
              <i class="fa fa-droplet"></i> <span class="fw-bold fs-6">Bloodtype: A</span>
              <div class="clearfix card-footer bg-light w-100">
                <span class="float-start fw-bold">View Summary</span>
                <span class="float-end fw-bold"><i class="fa fa-angle-right"></i></span>
              </div>
            </button>
      
            <div class="collapse row" id="collapse-a">
              <div class="card col text-danger bg-light o-hidden h-100">
                <div class="card-body">
                  <div class="card-body-icon">
                    <i class="fa fa-droplet"> A+</i>
                  </div>
                  <div class="mr-5">11 Packs</div>
                </div>
              </div>
      
              <div class="card col text-danger bg-light o-hidden h-100">
                <div class="card-body">
                  <div class="card-body-icon">
                    <i class="fa fa-droplet"> A-</i>
                  </div>
                  <div class="mr-5">
                    11 Packs  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <!--Bloodtype B Summary Card-->
          <div class="col-xl-3 col-sm-6 mb-3">
            <div class="card text-danger bg-light o-hidden">
              <button type="button" class="btn btn-sm m-1 text-danger bg-light" id="dropdown-b" data-bs-toggle="collapse" data-bs-target="#collapse-b" aria-expanded="false" aria-controls="collapse-b">
                <i class="fa fa-droplet"></i> <span class="fw-bold fs-6">Bloodtype: B</span>
                <div class="clearfix card-footer bg-light w-100">
                  <span class="float-start fw-bold">View Summary</span>
                  <span class="float-end fw-bold"><i class="fa fa-angle-right"></i></span>
                </div>
            </button>
    
            <div class="collapse row" id="collapse-b">
              <div class="card col text-danger bg-light o-hidden h-100">
                <div class="card-body">
                  <div class="card-body-icon">
                    <i class="fa fa-droplet"> B+</i>
                  </div>
                  <div class="mr-5">11 Packs</div>
                </div>
              </div>
    
              <div class="card col text-danger bg-light o-hidden h-100">
                <div class="card-body">
                  <div class="card-body-icon">
                    <i class="fa fa-droplet"> B-</i>
                  </div>
                  <div class="mr-5">
                    11 Packs  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>        

      <!--Bloodtype AB Summary Card-->
      <div class="col-xl-3 col-sm-6 mb-3">
        <div class="card text-white bg-light o-hidden">
          <button type="button" class="btn btn-sm m-1 text-danger bg-light" id="dropdown-ab" data-bs-toggle="collapse" data-bs-target="#collapse-ab" aria-expanded="false" aria-controls="collapse-ab">
            <i class="fa fa-droplet"></i> <span class="fw-bold fs-6">Bloodtype: AB</span>
            <div class="clearfix card-footer bg-light w-100">
              <span class="float-start fw-bold">View Summary</span>
              <span class="float-end fw-bold"><i class="fa fa-angle-right"></i></span>
            </div>
          </button>
    
          <div class="collapse row" id="collapse-ab">
            <div class="card col text-danger bg-light o-hidden h-100">
              <div class="card-body">
                <div class="card-body-icon">
                  <i class="fa fa-droplet"> AB+</i>
                </div>
                <div class="mr-5">11 Packs</div>
              </div>
            </div>
    
            <div class="card col text-danger bg-light o-hidden h-100">
              <div class="card-body">
                <div class="card-body-icon">
                  <i class="fa fa-droplet"> AB-</i>
                </div>
                <div class="mr-5">
                  11 Packs  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--Bloodtype O Summary Card-->
      <div class="col-xl-3 col-sm-6 mb-3">
        <div class="card text-white bg-light o-hidden">
          <button type="button" class="btn btn-sm m-1 bg-light text-danger" id="dropdown-o" data-bs-toggle="collapse" data-bs-target="#collapse-o" aria-expanded="false" aria-controls="collapse-o">
            <i class="fa fa-droplet"></i> <span class="fw-bold fs-6">Bloodtype: O</span>
            <div class="clearfix card-footer bg-light w-100">
              <span class="float-start fw-bold">View Summary</span>
              <span class="float-end fw-bold"><i class="fa fa-angle-right"></i></span>
            </div>
          </button>
    
          <div class="collapse row" id="collapse-o">
            <div class="card col text-danger bg-light o-hidden h-100">
              <div class="card-body">
                <div class="card-body-icon">
                  <i class="fa fa-droplet"> O+</i>
                </div>
                <div class="mr-5">11 Packs</div>
              </div>
            </div>
    
            <div class="card col text-danger bg-light o-hidden h-100">
              <div class="card-body">
                <div class="card-body-icon">
                  <i class="fa fa-droplet"> O-</i>
                </div>
                <div class="mr-5">
                  11 Packs  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        
      </div>
    </div>
    <div>



      </div>
          <!-- Transaction Section-->
          <div>
            <div class="row mx-1">
                <div class="card mb-3 col mx-1">
                  <div class="card-header text-danger">
                    <i class="fa fa-bar-chart"></i> Recent Transactions</div>
                  <div class="card-body">
                    <div class="row">
                        <div class="table-responsive col my-auto">
                          <table class="table table-bordered" width="100%" cellspacing="0">
                            <thead>
                              <tr class="clearfix">
                                <th>Entry Type</th>
                                <th>Blood Type</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Amount</th>
                              </tr>
                            </thead>
                            <tfoot>
                              <tr>
                                <th>Entry Type</th>
                                <th>Blood Type</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Amount</th>
                              </tr>
                            </tfoot>
                            <tbody>
                              <tr>
                                <td>Blood In</td>
                                <td>B+</td>
                                <td>07/12/2023</td>
                                <td>09:34</td>
                                <td>5 packs | 1500cc</td>
                              </tr>
                              <tr>
                                <td>Blood In</td>
                                <td>AB+</td>
                                <td>07/01/2023</td>
                                <td>12:30</td>
                                <td>3 packs | 900cc</td>
                              </tr>
                              <tr>
                                <td>Blood Out</td>
                                <td>O-</td>
                                <td>06/24/2023</td>
                                <td>16:25</td>
                                <td>7 packs | 2100cc</td>
                              </tr>
                            </tbody>
                          </table>
                          <a class="btn btn-danger" href="#home">View More <i class="fa fa-angle-right"></i></a>
                        </div>
                    </div>
                  </div>
                  <div class="card-footer small text-danger">Last update: mm/dd/yyyy hh:mm</div>
                </div>

                <div class="card mb-3 col mx-1">
                  <div class="card-header text-danger">
                    <i class="fa fa-bar-chart"></i> Blood Requests</div>
                  <div class="card-body">
                    <div class="row">
                        <div class="table-responsive col my-auto">
                          <table class="table table-bordered" width="100%" cellspacing="0">
                            <thead>
                              <tr class="clearfix">
                                <th>Request</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tfoot>
                              <tr>
                                <th>Request</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                              </tr>
                            </tfoot>
                            <tbody>
                              <tr>
                                <td>Blood In</td>
                                <td>B+</td>
                                <td>07/12/2023</td>
                                <td>09:34</td>
                              </tr>
                              <tr>
                                <td>Blood In</td>
                                <td>AB+</td>
                                <td>07/01/2023</td>
                                <td>12:30</td>
                              </tr>
                              <tr>
                                <td>Blood Out</td>
                                <td>O-</td>
                                <td>06/24/2023</td>
                                <td>16:25</td>
                              </tr>
                            </tbody>
                          </table>
                          <a class="btn btn-danger" href="#home">View More <i class="fa fa-angle-right"></i></a>
                        </div>
                    </div>
                  </div>
                  <div class="card-footer small text-danger">Last update: mm/dd/yyyy hh:mm</div>
                </div>

               
            
          </div>
          
      <!--Blood Inventory-->
      <div class="card mb-3 mx-1" id="blood-inventory">
        <div class="card-header text-danger">
          <i class="fa fa-droplet"></i> Blood Inventory
          <button class="btn btn-danger float-end">New Entry</button>

        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
              <thead>
                <tr class="clearfix">
                  <th>Serial ID<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Blood Type<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Amount<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Expiration<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Date Entry<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Action</th>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th>Serial ID</th>
                  <th>Blood Type</th>
                  <th>Amount</th>
                  <th>Expiration</th>
                  <th>Date Entry</th>
                  <th>Action</th>
                </tr>
              </tfoot>
              <tbody>
                {#each data as item (item.id)}
                <tr>
                    <td>{item.id}</td>
                    <td>{item.blood_type}</td>
                    <td>{item.int}</td>
                    <td>{item.expiry}</td>
                    <td>{item.entry_date}</td>
                    <td>
                      <a href="#home"><i class="fa-solid fa-trash fs-5 text-danger"></i></a> 
                      <a href="#home"><i class="fa-solid fa-pen-to-square fs-5 text-danger"></i></a>
                    </td>
                </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer small text-danger">Last update: mm/dd/yyyy hh:mm</div>
      </div>

      <!--Donor Table-->
      <div class="card mb-3 mx-1">
        <div class="card-header text-danger">
          <i class="fa fa-table"></i> Donor Info</div>
        <div class="card-body">
          <div class="mb-2 w-100">
            <span><i class="fa-solid fa-magnifying-glass"></i></span>
            <input type="text" id="myInput" onkeyup="searchDonor()" placeholder="Search Donors">
          </div>
          <div class="table-responsive">
            <table class="table table-bordered" id="donorTable" width="100%" cellspacing="0">
              <thead>
                <tr class="clearfix">
                  <th>Name<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Blood Type<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Birthdate<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Gender<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>Weight<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                  <th>BP<a href="#home"><i class="fa-solid fa-sort float-end text-dark"></i></a></th>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th>Name</th>
                  <th>Blood Type</th>
                  <th>Birthdate</th>
                  <th>Gender</th>
                  <th>Weight</th>
                  <th>BP</th>
                </tr>
              </tfoot>
              <tbody>
                <tr>
                  <td>Liemel Lacanilao</td>
                  <td>B+</td>
                  <td>01/01/1999</td>
                  <td>Male</td>
                  <td>55kg</td>
                  <td>110/75mmHg</td>
                </tr>
                <tr>
                  <td>Lance del Mundo</td>
                  <td>B+</td>
                  <td>01/01/1999</td>
                  <td>Male</td>
                  <td>55kg</td>
                  <td>110/75mmHg</td>
                </tr>
                <tr>
                  <td>Kim Querobines</td>
                  <td>B+</td>
                  <td>01/01/1999</td>
                  <td>Male</td>
                  <td>55kg</td>
                  <td>110/75mmHg</td>
                </tr>
                <tr>
                  <td>Marc Justyn Villanueva</td>
                  <td>B+</td>
                  <td>01/01/1999</td>
                  <td>Male</td>
                  <td>55kg</td>
                  <td>110/75mmHg</td>
                </tr>
                <tr>
                  <td>Mark Daniel de Veyra</td>
                  <td>B+</td>
                  <td>01/01/1999</td>
                  <td>Male</td>
                  <td>55kg</td>
                  <td>110/75mmHg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer small text-danger">Last update: mm/dd/yyyy hh:mm</div>
      </div>

      
    </div>
    <!-- /.container-fluid-->
    <!-- /.content-wrapper-->
    <footer class="sticky-footer">
      <div class="container">
        <div class="text-center text-danger">
          <small>For Capstone use only. Not official website.</small>
        </div>
      </div>
    </footer>
    <!-- Scroll to Top Button-->
    <a class="scroll-to-top rounded" href="#page-top">
      <i class="fa fa-angle-up"></i>
    </a>
    <!-- Logout Modal-->
    <!-- <div class="modal fade" id="logout-modal" tabindex="-1" role="dialog" aria-labelledby="logout-modal-Label" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header bg-danger">
            <p class="modal-title fs-4 fw-bold text-light" id="logout-modal-Label">Ready to Leave?</p>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">Select "Logout" below to sign out of the system and end the session.</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Close</button>
            <a class="btn btn-danger" href="Home.html">Logout</a>
          </div>
        </div>
      </div>
    </div> -->
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

//   //Database Sync
//   async function getBloodInventory() {
//     const data = await fetch("https://encouraging-erin-crayfish.cyclic.app/api/blood-inventory");
//     const results = await data.json();

//     return results;
//   }

//   const head = `<table class="table">
//   <thead>
//     <tr>
//       <th scope="col">ID</th>
//       <th scope="col">Blood Type</th>
//       <th scope="col">Amount</th>
//       <th scope="col">Expiry</th>
//       <th scope="col">Entry Date</th>
//       <th scope="col">Action</th>
//     </tr>
//   </thead>
//   <tbody>
//   `

//   const footer = `
// </tbody>
// </table>
//   `


//   document.addEventListener('DOMContentLoaded', async ()=>{
//     const items = await getBloodInventory();

//     const myContainer = document.getElementById('items-container')

//     myContainer.innerHTML = `
//       ${head}
//       ${items.map(item => (`
//     <tr>
//       <th scope="row">${item.id}</th>
//       <td>${item.bloodType}</td>
//       <td>${item.amount}</td>
//       <td>${item.expiry}</td>
//       <td>${item.entryDate}</td>
//       <td><button class="border border-0 bg-transparent"><a href=""><i class="fa-solid fa-trash fs-5 text-danger"></i></a></button></td>
//     </tr>
//     `
//     ))
//   })}
//   ${footer}
//     `
//    })


  </script>
</html>
