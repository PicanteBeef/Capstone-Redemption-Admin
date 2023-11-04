<!-- Inventory Database display here. Include CRUD commands. -->

<script>
  import { onMount } from "svelte";
  import supabase from "/src/lib/supabaseClient.js";

  let formData = {
    bloodType: "",
    amount: 0,
  };

  let deletedId = 24;

  let data = [];
  let data2 = [];

  async function handleSubmit(event) {
    console.log(formData);
    event.preventDefault();
    // Calculate the expiry date by adding 42 days to the current date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 42);

    const { data: record, error } = await supabase
      .from("blood_inventory")
      .insert({
        blood_type: formData.bloodType,
        amount: formData.amount,
        expiry: expiryDate,
      }).select();

    if (error) {
      console.error("Error inserting data:", error);
      return;
    }

    formData = {
      bloodType: "",
      amount: 0,
    }

    data = [record[0], ...data]
  }

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
  }

  //Fetch data from database
  onMount(async () => {
    const { data: records, error } = await supabase
      .from("blood_inventory")
      .select("*")
      .order("entry_date", { ascending: false });
    // .limit(1);

    // Blood Request table here
    const { data: records2, error2 } = await supabase
      .from("donors")
      .select("*")
      .order("id", { ascending: false });
    // .limit(1);

    if (error2) {
      console.error("Error fetching data", error2);
    } else {
      data2 = records2;
    }

    if (error) {
      console.error("Error fetching data from Supabase:", error);
    } else {
      data = records;
    }
  });
</script>

<section>
  <div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Blood Type</th>
          <th>Amount</th>
          <th>Expiry</th>
          <th>Entry Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th>ID</th>
          <th>Blood Type</th>
          <th>Amount</th>
          <th>Expiry</th>
          <th>Entry Date</th>
          <th>Action</th>
        </tr>
      </tfoot>
      <tbody>
        {#each data as item (item.id)}
          <tr>
            <td>{item.id}</td>
            <td>{item.blood_type}</td>
            <td>{item.amount}</td>
            <td>{item.expiry}</td>
            <td>{item.entry_date}</td>
            <button on:click={() => deleteOne(item.id)}>Delete me UwU 🥺
          </button>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Blood Type</th>
          <th>Amount</th>
          <th>Expiry</th>
          <th>Entry Date</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th>ID</th>
          <th>Last name</th>
          <th>First name</th>
          <th>Blood type</th>
          <th>Birthdate</th>
          <th>Sex</th>
          <th>Blood pressure</th>
        </tr>
      </tfoot>
      <tbody>
        {#each data2 as item2 (item2.id)}
          <tr>
            <td>{item2.id}</td>
            <td>{item2.last_name}</td>
            <td>{item2.first_name}</td>
            <td>{item2.blood_type}</td>
            <td>{item2.birthdate}</td>
            <td>{item2.sex}</td>
            <td>{item2.blood_pressure}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <form on:submit={handleSubmit}>
    <label for="firstName">Blood Type: </label>
    <input type="text" id="firstName" bind:value={formData.bloodType} />

    <label for="lastName">Amount: </label>
    <input type="text" id="lastName" bind:value={formData.amount} />

    <!-- <label for="email">Email:</label>
    <input type="email" id="email" bind:value={formData.email} /> -->

    <button type="submit">Submit</button>
  </form>
</section>
