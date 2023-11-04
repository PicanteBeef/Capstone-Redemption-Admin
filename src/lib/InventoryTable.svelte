<script>
    import { onMount } from 'svelte';
  
    let inventoryData = [];
  
    onMount(async () => {
      const { data, error } = await supabase
        .from('table1')
        .select('*');
      if (data) {
        table1Data = data;
      }
    });
  </script>
  


  {#each inventoryData as item (item.id)}
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
