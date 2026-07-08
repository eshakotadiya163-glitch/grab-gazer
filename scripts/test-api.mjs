const ref = 'bgsgkmzwenjbgtexinfp';
const token = process.env.SUPABASE_ACCESS_TOKEN;
const query = "SELECT 1;";

fetch('https://api.supabase.com/v1/projects/' + ref + '/query', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
}).then(res => res.json()).then(console.log).catch(console.error);
