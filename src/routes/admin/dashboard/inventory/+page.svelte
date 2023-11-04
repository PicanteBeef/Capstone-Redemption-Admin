<!-- Inventory Database display here. Include CRUD commands. -->

<script>
    import { onMount } from 'svelte';
    import supabase from '/src/lib/supabaseClient.js';

    let data = [];

    onMount(async () => {
        const { data: records, error } = await supabase
        .from('blood_inventory')
        .select('*')
        .order('entry_date', {ascending: false})
        // .limit(1);
        
        if (error) {
            console.error('Error fetching data from Supabase:', error);
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
                </tr>
              </thead>
              <tfoot>
                <tr>
                    <th>ID</th>
                    <th>Blood Type</th>
                    <th>Amount</th>
                    <th>Expiry</th>
                    <th>Entry Date</th>
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
                </tr>
                {/each}
        </table>
      </div>

  </section>