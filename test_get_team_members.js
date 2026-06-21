const fetch = require('node-fetch');

async function test() {
  const tRes = await fetch(`http://localhost:8000/api/v1/teams/97715a89-695a-4d69-b674-2963d55f5dc2`);
  const tData = await tRes.json();
  console.log("tData:", tData);
  
  for (const mid of tData.member_ids || []) {
    const mRes = await fetch(`http://localhost:8000/api/v1/participants/${mid}`);
    console.log("fetch mid:", mid, "status:", mRes.status);
    if (mRes.ok) {
        const m = await mRes.json();
        console.log("m:", m);
    }
  }
}

test();
