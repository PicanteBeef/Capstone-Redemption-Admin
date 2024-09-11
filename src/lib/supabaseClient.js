import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbvtotutjqxbbrzbewxs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidnRvdHV0anF4YmJyemJld3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5Mzc0MjkzNywiZXhwIjoyMDA5MzE4OTM3fQ.AAO9LOlhDHRO_OBIH-VakORFKt7gRQS8FrV7X81yb0I';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;